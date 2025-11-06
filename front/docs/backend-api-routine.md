# 주간 루틴 시스템 백엔드 API 요구사항

## 📋 개요

이 문서는 **드래그 앤 드롭 기반 주간 루틴 시스템**의 백엔드 구현 요구사항을 정리한 것입니다.

### 기능 요약
- 사용자는 루틴(주N회 목표)을 생성하고, 태스크 목록에서 원하는 날짜로 드래그해서 배치
- 드래그로 배치 시 자동으로 완료 처리됨
- 주간 목표 달성 여부 자동 계산 (예: 주3회 설정 → 3회 이상 완료 시 성공)

---

## 🗄️ 데이터베이스 스키마

### 새로운 테이블: `weekly_routines`

```sql
CREATE TABLE weekly_routines (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100),
  frequency INTEGER NOT NULL CHECK (frequency >= 1 AND frequency <= 7), -- 주 몇 회 (1-7)
  color VARCHAR(7) DEFAULT '#3B82F6', -- HEX 색상 코드
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 추가
CREATE INDEX idx_weekly_routines_user_id ON weekly_routines(user_id);
```

### 새로운 테이블: `routine_completions`

```sql
CREATE TABLE routine_completions (
  id SERIAL PRIMARY KEY,
  routine_id INTEGER REFERENCES weekly_routines(id) ON DELETE CASCADE,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  completion_date DATE NOT NULL, -- 완료한 날짜
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- 중복 방지: 같은 루틴을 같은 날짜에 여러 번 완료할 수 없음
  UNIQUE(routine_id, completion_date)
);

-- 인덱스 추가
CREATE INDEX idx_routine_completions_routine_id ON routine_completions(routine_id);
CREATE INDEX idx_routine_completions_user_id ON routine_completions(user_id);
CREATE INDEX idx_routine_completions_date ON routine_completions(completion_date);
```

---

## 📡 API 엔드포인트

### 1️⃣ 루틴 생성

```
POST /routines
Headers: x-user-id: {user_id}
```

**Request Body:**
```json
{
  "title": "운동하기",
  "category": "건강",
  "frequency": 3,
  "color": "#10B981"
}
```

**Response (201 Created):**
```json
{
  "message": "루틴이 생성되었습니다",
  "data": {
    "id": 1,
    "user_id": "kim_frontend",
    "title": "운동하기",
    "category": "건강",
    "frequency": 3,
    "color": "#10B981",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z"
  }
}
```

**구현 로직:**
1. x-user-id 헤더에서 사용자 ID 추출
2. weekly_routines 테이블에 INSERT
3. 생성된 루틴 정보 반환

**유효성 검사:**
- title: 필수, 1-200자
- frequency: 필수, 1-7 사이의 정수
- color: 선택, 기본값 '#3B82F6'

---

### 2️⃣ 루틴 목록 조회

```
GET /routines
Headers: x-user-id: {user_id}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": "kim_frontend",
    "title": "운동하기",
    "category": "건강",
    "frequency": 3,
    "color": "#10B981",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "completions": [
      {
        "id": 1,
        "routine_id": 1,
        "completion_date": "2025-01-13"
      },
      {
        "id": 2,
        "routine_id": 1,
        "completion_date": "2025-01-15"
      }
    ]
  },
  {
    "id": 2,
    "user_id": "kim_frontend",
    "title": "코딩 공부",
    "category": "학습",
    "frequency": 5,
    "color": "#3B82F6",
    "created_at": "2025-01-15T11:00:00Z",
    "updated_at": "2025-01-15T11:00:00Z",
    "completions": []
  }
]
```

**구현 로직:**
1. weekly_routines 테이블에서 user_id로 조회
2. 각 루틴에 대해 routine_completions 조인
3. 완료 기록 포함하여 반환

**SQL 예시:**
```sql
SELECT 
  wr.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', rc.id,
        'routine_id', rc.routine_id,
        'completion_date', rc.completion_date
      )
    ) FILTER (WHERE rc.id IS NOT NULL),
    '[]'
  ) as completions
FROM weekly_routines wr
LEFT JOIN routine_completions rc ON wr.id = rc.routine_id
WHERE wr.user_id = $1
GROUP BY wr.id
ORDER BY wr.created_at DESC;
```

---

### 3️⃣ 루틴 완료 처리 (드래그 앤 드롭 시 호출)

```
POST /routines/{routine_id}/complete
Headers: x-user-id: {user_id}
```

**Request Body:**
```json
{
  "completion_date": "2025-01-15"
}
```

**Response (201 Created):**
```json
{
  "message": "루틴이 완료 처리되었습니다",
  "data": {
    "id": 3,
    "routine_id": 1,
    "user_id": "kim_frontend",
    "completion_date": "2025-01-15",
    "created_at": "2025-01-15T14:30:00Z"
  },
  "weekly_status": {
    "routine_id": 1,
    "week_start": "2025-01-13",
    "week_end": "2025-01-19",
    "target_count": 3,
    "completed_count": 2,
    "is_success": false,
    "progress": 66.67
  }
}
```

**구현 로직:**
1. routine_id와 user_id로 루틴 존재 확인
2. routine_completions 테이블에 INSERT
3. 중복 체크 (같은 날짜에 이미 완료했는지)
4. 이번 주 달성 상태 계산하여 반환

**이번 주 달성 상태 계산:**
```sql
-- 이번 주 완료 횟수 조회
SELECT COUNT(*) as completed_count
FROM routine_completions
WHERE routine_id = $1
  AND completion_date >= $2  -- 주 시작일 (일요일)
  AND completion_date <= $3; -- 주 종료일 (토요일)

-- 목표 횟수는 weekly_routines.frequency
```

**에러 처리:**
- 404: 루틴을 찾을 수 없음
- 409: 이미 해당 날짜에 완료됨 (UNIQUE 제약 위반)

---

### 4️⃣ 루틴 완료 취소

```
DELETE /routines/{routine_id}/complete
Headers: x-user-id: {user_id}
```

**Query Parameters:**
- `date`: YYYY-MM-DD 형식 (필수)

**Example:**
```
DELETE /routines/1/complete?date=2025-01-15
```

**Response (200 OK):**
```json
{
  "message": "루틴 완료가 취소되었습니다",
  "weekly_status": {
    "routine_id": 1,
    "week_start": "2025-01-13",
    "week_end": "2025-01-19",
    "target_count": 3,
    "completed_count": 1,
    "is_success": false,
    "progress": 33.33
  }
}
```

**구현 로직:**
1. routine_completions에서 삭제
2. routine_id, user_id, completion_date 모두 일치하는 레코드만 삭제
3. 이번 주 달성 상태 재계산

---

### 5️⃣ 루틴 수정

```
PUT /routines/{routine_id}
Headers: x-user-id: {user_id}
```

**Request Body:**
```json
{
  "title": "운동하기 (수정됨)",
  "category": "건강",
  "frequency": 4,
  "color": "#EF4444"
}
```

**Response (200 OK):**
```json
{
  "message": "루틴이 수정되었습니다",
  "data": {
    "id": 1,
    "user_id": "kim_frontend",
    "title": "운동하기 (수정됨)",
    "category": "건강",
    "frequency": 4,
    "color": "#EF4444",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T16:00:00Z"
  }
}
```

**구현 로직:**
1. routine_id와 user_id로 루틴 조회
2. UPDATE 실행
3. updated_at 자동 갱신

---

### 6️⃣ 루틴 삭제

```
DELETE /routines/{routine_id}
Headers: x-user-id: {user_id}
```

**Response (200 OK):**
```json
{
  "message": "루틴이 삭제되었습니다"
}
```

**구현 로직:**
1. routine_id와 user_id로 루틴 조회
2. DELETE 실행
3. CASCADE로 routine_completions도 자동 삭제됨

---

### 7️⃣ 주간 통계 조회

```
GET /routines/weekly-stats
Headers: x-user-id: {user_id}
```

**Query Parameters:**
- `week_start`: YYYY-MM-DD (선택, 기본값: 이번 주 일요일)

**Response (200 OK):**
```json
{
  "week_start": "2025-01-13",
  "week_end": "2025-01-19",
  "routines": [
    {
      "routine_id": 1,
      "title": "운동하기",
      "frequency": 3,
      "color": "#10B981",
      "completed_count": 2,
      "is_success": false,
      "progress": 66.67,
      "completions": [
        {
          "date": "2025-01-13",
          "day_of_week": 1
        },
        {
          "date": "2025-01-15",
          "day_of_week": 3
        }
      ]
    },
    {
      "routine_id": 2,
      "title": "코딩 공부",
      "frequency": 5,
      "color": "#3B82F6",
      "completed_count": 4,
      "is_success": false,
      "progress": 80.0,
      "completions": [
        {
          "date": "2025-01-13",
          "day_of_week": 1
        },
        {
          "date": "2025-01-14",
          "day_of_week": 2
        },
        {
          "date": "2025-01-15",
          "day_of_week": 3
        },
        {
          "date": "2025-01-16",
          "day_of_week": 4
        }
      ]
    }
  ],
  "summary": {
    "total_routines": 2,
    "success_count": 0,
    "in_progress_count": 2,
    "total_completions": 6
  }
}
```

**구현 로직:**
1. 주 시작일 계산 (일요일 기준)
2. 사용자의 모든 루틴 조회
3. 각 루틴의 이번 주 완료 기록 조회
4. 달성 여부 계산 (completed_count >= frequency)

---

## 🔧 추가 구현 사항

### 1. 주 시작일 계산 (일요일 기준)

**JavaScript/TypeScript:**
```typescript
function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (일요일) ~ 6 (토요일)
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
```

**Python:**
```python
from datetime import datetime, timedelta

def get_week_start(date=None):
    if date is None:
        date = datetime.now()
    day_of_week = date.weekday()  # 0 (월요일) ~ 6 (일요일)
    # 일요일을 0으로 맞추기 위해 조정
    days_since_sunday = (day_of_week + 1) % 7
    week_start = date - timedelta(days=days_since_sunday)
    return week_start.date()
```

**SQL (PostgreSQL):**
```sql
-- 주 시작일 (일요일) 계산
SELECT DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '1 day' AS week_start;

-- 주 종료일 (토요일) 계산
SELECT DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '5 days' AS week_end;
```

### 2. 달성률 계산 로직

```typescript
interface WeeklyStatus {
  completed_count: number;
  target_count: number;
  is_success: boolean;
  progress: number;
}

function calculateWeeklyStatus(
  completedCount: number,
  targetFrequency: number
): WeeklyStatus {
  return {
    completed_count: completedCount,
    target_count: targetFrequency,
    is_success: completedCount >= targetFrequency,
    progress: Math.min(100, (completedCount / targetFrequency) * 100)
  };
}
```

### 3. 중복 완료 방지

**SQL 제약 조건:**
```sql
UNIQUE(routine_id, completion_date)
```

**백엔드 에러 처리:**
```typescript
try {
  await db.insert('routine_completions', {
    routine_id,
    user_id,
    completion_date
  });
} catch (error) {
  if (error.code === '23505') { // PostgreSQL UNIQUE 위반
    return res.status(409).json({
      error: '이미 해당 날짜에 완료 처리되었습니다'
    });
  }
  throw error;
}
```

---

## 📊 프론트엔드 ↔ 백엔드 데이터 흐름

### 1. 루틴 생성 플로우

```
[사용자] 루틴 추가 버튼 클릭
    ↓
[프론트] 루틴 추가 모달 표시
    ↓
[사용자] 제목, 카테고리, 주N회 입력
    ↓
[프론트] POST /routines 호출
    ↓
[백엔드] weekly_routines 테이블에 INSERT
    ↓
[백엔드] 생성된 루틴 정보 반환
    ↓
[프론트] 
  1. weeklyRoutines 상태 업데이트
  2. dailyTasks에 추가 (드래그 가능하도록)
  3. localStorage 저장
```

### 2. 루틴 완료 플로우

```
[사용자] 태스크 목록에서 루틴을 캘린더로 드래그
    ↓
[프론트] onDrop 이벤트 처리
    ↓
[프론트] 
  1. 루틴인지 확인 (priority === 'routine')
  2. POST /routines/{routine_id}/complete 호출
    ↓
[백엔드] 
  1. routine_completions 테이블에 INSERT
  2. 이번 주 달성 상태 계산
  3. 완료 정보 + 주간 통계 반환
    ↓
[프론트]
  1. weeklyRoutines 상태 업데이트 (completions)
  2. calendarTasks에 추가 (시각적 표시)
  3. localStorage 저장
  4. 성공 알림 표시
```

### 3. 주간 통계 표시 플로우

```
[사용자] 로드맵 페이지 접속
    ↓
[프론트] GET /routines 호출
    ↓
[백엔드] 
  1. 사용자의 모든 루틴 조회
  2. 각 루틴의 완료 기록 포함하여 반환
    ↓
[프론트]
  1. weeklyRoutines 상태 설정
  2. 이번 주 달성률 계산 (getRoutineWeeklyStatus)
  3. 루틴 관리 섹션 렌더링
     - 진행 바 표시
     - 성공/진행 중 상태 표시
```

---

## 🔐 보안 고려사항

### 1. 인증 확인
- 모든 API에서 x-user-id 헤더 검증
- 루틴의 user_id와 헤더의 user_id 일치 확인

### 2. 권한 확인
```sql
-- 루틴 수정/삭제 시 권한 확인
SELECT id FROM weekly_routines 
WHERE id = $1 AND user_id = $2;

-- 레코드가 없으면 403 Forbidden 반환
```

### 3. 입력 검증
- title: XSS 방지를 위한 HTML 이스케이프
- frequency: 1-7 범위 검증
- color: HEX 코드 형식 검증 (#RRGGBB)
- completion_date: 날짜 형식 검증 (YYYY-MM-DD)

---

## 🧪 테스트 시나리오

### 시나리오 1: 루틴 생성 및 완료
```bash
# 1. 루틴 생성 (주 3회 목표)
curl -X POST http://localhost:8000/routines \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{
    "title": "운동하기",
    "category": "건강",
    "frequency": 3,
    "color": "#10B981"
  }'

# 2. 월요일에 완료
curl -X POST http://localhost:8000/routines/1/complete \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{"completion_date": "2025-01-13"}'

# 3. 수요일에 완료
curl -X POST http://localhost:8000/routines/1/complete \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{"completion_date": "2025-01-15"}'

# 4. 금요일에 완료 (목표 달성!)
curl -X POST http://localhost:8000/routines/1/complete \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{"completion_date": "2025-01-17"}'

# 5. 주간 통계 조회
curl http://localhost:8000/routines/weekly-stats \
  -H "x-user-id: test_user"
```

### 시나리오 2: 중복 완료 방지
```bash
# 같은 날짜에 두 번 완료 시도 → 409 에러 발생
curl -X POST http://localhost:8000/routines/1/complete \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{"completion_date": "2025-01-13"}'
```

### 시나리오 3: 루틴 삭제 및 완료 기록 자동 삭제
```bash
# 루틴 삭제 → routine_completions도 CASCADE 삭제
curl -X DELETE http://localhost:8000/routines/1 \
  -H "x-user-id: test_user"
```

---

## 📈 성능 최적화

### 1. 인덱스 활용
```sql
-- 사용자별 루틴 조회 최적화
CREATE INDEX idx_weekly_routines_user_id ON weekly_routines(user_id);

-- 완료 기록 조회 최적화
CREATE INDEX idx_routine_completions_routine_id ON routine_completions(routine_id);
CREATE INDEX idx_routine_completions_date ON routine_completions(completion_date);
```

### 2. 쿼리 최적화
```sql
-- N+1 문제 방지: 루틴과 완료 기록을 한 번에 조회
SELECT 
  wr.*,
  json_agg(
    json_build_object(
      'id', rc.id,
      'completion_date', rc.completion_date
    )
  ) FILTER (WHERE rc.id IS NOT NULL) as completions
FROM weekly_routines wr
LEFT JOIN routine_completions rc 
  ON wr.id = rc.routine_id 
  AND rc.completion_date >= $2  -- 이번 주만
  AND rc.completion_date <= $3
WHERE wr.user_id = $1
GROUP BY wr.id;
```

### 3. 캐싱 전략
- 주간 통계는 Redis에 캐싱 (TTL: 1시간)
- 캐시 키: `weekly_stats:{user_id}:{week_start}`
- 루틴 완료 시 캐시 무효화

---

## 🚀 배포 체크리스트

- [ ] weekly_routines 테이블 생성
- [ ] routine_completions 테이블 생성
- [ ] 인덱스 생성
- [ ] API 엔드포인트 7개 구현
- [ ] 인증 미들웨어 적용
- [ ] 입력 검증 로직 추가
- [ ] 에러 처리 구현
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] API 문서화 (Swagger/OpenAPI)

---

## 📝 추가 개선 아이디어

### 1. 알림 기능
- 주말에 루틴 달성 실패 시 알림
- 목표 달성 시 축하 알림

### 2. 통계 기능
- 월간 루틴 달성률
- 가장 잘 지킨 루틴 분석
- 루틴별 연속 달성 일수 (streak)

### 3. 소셜 기능
- 친구와 루틴 공유
- 루틴 챌린지 (함께 목표 달성)

---

## 🔗 관련 문서

- [메인 백엔드 API 문서](./backend-api-base.md)
- [프론트엔드 기술 스택](./frontend.techstack.md)
- [PRD 문서](./prd.md)

---

**문서 버전:** 1.0  
**작성일:** 2025-01-15  
**작성자:** GitHub Copilot  
**최종 수정일:** 2025-01-15
#   b a c k e n d - a p i - r o u t i n e   -   ? ���? ��Ͽ? ? B�� �[? ۊ�z�  ( 2 0 2 5 - 1 1 - 0 5 )  
  
 �Z����  ? ��_�:   7sf$��  rnլ��  ? /�ܮ? ? A P I ? ? B�� �[�ú����   ? �/�? �r�? ?   ? {1T�  ? � ? �ī�? ? ۊ? ? d$��? ? ��? U I   B�� �[? ? ��r����� �? ? �[�� ���� ,   �y��(`��%  ? /�Բ  �����) ? ? ? I�1�  7sf$��  ?a� ? ? ? ��/ ? � ? �ī�? ? ? լ޸  ? ? ? ���  �l��#�  ? KF�? ? ��x�,�? ���rn? ۊ����? H���.  
  
 - - -  
  
 # #   �l��#�  B�� �[? ��x�,�  ? KF� 
 -   ? � ? �ī�? ��?   �y��(`��%B�? 0 ~ 1 0   ? /�Բ\t? ? J��? �? �o?   7sf$��/ �N����  ? ��? /�L�  " ?a� ? ? �y��(`��%? ? ? /�Բ" \t? (`����? ��  ` G E T   / r o u t i n e s `   ? .���  ` G E T   / r o u t i n e s / w e e k l y - s t a t s `   ? ���? ? ? K?�? �Ď���? ? ���? ��ɿ? ? ? �@�  ? � ? �ī�? ? ? ������� �  ? JY����r�? ?  
     -   ? ?   ` c a t e g o r y _ s c o r e `   ? .���  ` r e l a t e d _ s c o r e s :   [ {   k e y :   ' f r o n t e n d ' ,   s c o r e :   7   } ] `  
 -   ? ��r����� �? ? ? �	�? �   ?  �*�? �5�? ��ɿ? ? ���%? �? �o?   ۊF�Ͽ? �ė�  ? �0�( ? ��? ? ?   ? ��Բ  ? .���  ? ��Բ) ��? ? �Ĭ�? �2  ? x$r�? ?  
 -   ? ���? ��Ͽ? ����  ? ���9m��;�? ��<"  ? ����  ���%  ? ���? ? ` P O S T   / r o u t i n e s / { i d } / c o m p l e t e ` ) ? ? 9m��? �o? ? ��? ? x$r�? ?   pu��? �o? ? � ? �ī�? ? ? |1���Z? ۊ�z�? ? ? ��P�  ۊ���? ���  ` w e e k l y _ s t a t u s ` ? ? ` a f f e c t e d _ c a t e g o r y _ k e y s `   �Z�?   ����? \t? ? K?�? �2  ?  �*�? �5�? x�?   ?  �!�  �y��(`��%  ? /�Բ? ? ? ��"�? ? �N����? ��?   ? ����  ? �ÿ�? H���.  
  
 - - -  
  
 # #   ? ���  ? I���  ? ��#�( �l��#�)  
 ` P O S T   / r o u t i n e s / { r o u t i n e _ i d } / c o m p l e t e `   ? ���? ? ` a f f e c t e d _ c a t e g o r y _ k e y s `   pu��?   ? ?  
  
 ` ` ` j s o n  
 {  
     " m e s s a g e " :   " 7sf$��? ? ? ����  ���%? ���? �r�? ? ,  
     " d a t a " :   {   / *   c o m p l e t i o n   r e c o r d   * /   } ,  
     " w e e k l y _ s t a t u s " :   {   / *   rn׬0  ? ��v�  * /   } ,  
     " a f f e c t e d _ c a t e g o r y _ k e y s " :   [ " h e a l t h " ,   " f r o n t e n d " ]  
 }  
 ` ` `  
  
 ? ? ? ? I0? �   ? ��n�  ? KF�?  �I,   rn׬0  A P I ? �   ? ����? x$r�? ?  
 