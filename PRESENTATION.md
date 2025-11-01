# 🎯 Conpanion - 취업 준비 로드맵 관리 시스템

## 📌 프로젝트 개요

**Conpanion**은 취업 준비생을 위한 **목표 기반 로드맵 자동 생성 시스템**입니다.
실제 채용 공고 데이터를 기반으로 개인화된 학습 계획을 제공합니다.

---

## 🏗️ 기술 스택

### Backend
- **Framework**: FastAPI 0.109.0
- **Database**: Supabase PostgreSQL
- **Server**: Uvicorn (ASGI)
- **Authentication**: JWT Bearer Token
- **CORS**: 전체 Origin 허용

### Tools & Libraries
- **Python**: 3.x
- **MCP (Model Context Protocol)**: Supabase 연동
- **Requests**: 외부 API 호출

---

## 📊 데이터베이스 설계

### 핵심 테이블 구조

```sql
-- 사용자 테이블
users (user_id PK, password, name, email, phone, github_url)

-- 목표 테이블 (UNIQUE 제약조건 제거 → 다중 목표 가능)
goals (id PK, user_id FK, job_title, company_name, 
       requirements JSONB, preferred JSONB, is_active)

-- 태스크 테이블
tasks (id PK, user_id FK, goal_id FK, title, description,
       due_date, priority, is_completed, order_index)

-- 채용공고 테이블
job_postings (id PK, company, title, description,
              requirements JSONB, preferred JSONB, 
              location, experience_level)
```

---

## 🎯 핵심 기능

### 1️⃣ 채용 공고 기반 목표 자동 생성
```
채용 공고 선택 → 목표 자동 생성 → 로드맵 자동 생성
```
- **52개의 실제 채용 공고** 데이터 (토스, 쿠팡, 카카오 등)
- 공고의 필수/우대 요건을 자동으로 파싱하여 목표 생성

### 2️⃣ 자동 로드맵 생성
- 요구사항을 분석하여 **우선순위 기반 태스크** 자동 생성
- 2주 간격으로 **due_date** 자동 배정
- 필수 요건: `high` priority / 우대 요건: `medium` priority

### 3️⃣ 진행 상황 추적
- 완료율 계산 (completed_tasks / total_tasks)
- 목표까지 남은 일수 자동 계산
- 오늘의 할 일 필터링

---

## 🔧 주요 API 엔드포인트

### 인증 (Auth)
```
POST /auth/register  - 회원가입
POST /auth/login     - 로그인 (JWT 발급)
```

### 목표 관리 (Goals)
```
GET  /goals/list                        - 전체 목표 목록
GET  /goals/{goal_id}                   - 특정 목표 조회
GET  /goals                             - 현재 활성 목표
POST /goals                             - 목표 생성
POST /goals/from-job-posting/{id}       - 공고로부터 목표 생성 ⭐
PUT  /goals                             - 목표 수정
DELETE /goals/{goal_id}                 - 목표 삭제
POST /goals/{goal_id}/delete            - 목표 삭제 (POST)
```

### 태스크 관리 (Tasks)
```
GET    /tasks                           - 태스크 목록 (필터링 가능)
GET    /tasks/today                     - 오늘의 할 일
POST   /tasks                           - 태스크 생성
POST   /tasks/auto-generate             - 자동 태스크 생성 ⭐
PUT    /tasks/{id}                      - 태스크 수정
DELETE /tasks/{id}                      - 태스크 삭제
POST   /tasks/{id}/delete               - 태스크 삭제 (POST)
PATCH  /tasks/{id}/complete             - 완료 처리
PATCH  /tasks/batch-update              - 일괄 수정
PATCH  /tasks/batch-complete            - 일괄 완료
```

### 채용 공고 (Job Postings)
```
GET /job-postings                       - 공고 목록
  ?keyword=검색어                        - 키워드 검색
  ?experience_level=신입                - 경력 필터
  ?is_active=true                       - 활성 공고만
```

### 통계 (Statistics)
```
GET /stats/dashboard                    - 대시보드 통계
GET /stats/weekly                       - 주간 통계
GET /stats/monthly                      - 월간 통계
GET /stats/goal/{goal_id}               - 목표별 통계
```

### 진행 상황 (Progress)
```
GET /progress                           - 전체 진행 상황
GET /roadmap/progress                   - 로드맵 진행도
```

---

## 💡 핵심 로직: 자동 로드맵 생성

### 처리 흐름
```python
1. 채용 공고 조회 (job_postings 테이블)
2. requirements/preferred 파싱
   - JSONB → 문자열 배열로 변환
   - [{"description": "React 경험"}, ...] → ["React 경험", ...]
3. 목표(Goal) 생성
   - 기존 활성 목표 비활성화
   - 새 목표를 is_active=True로 생성
4. 태스크(Task) 자동 생성
   - 각 요구사항 → 1개의 태스크
   - 필수 요건: priority="high"
   - 우대 요건: priority="medium"
   - due_date: 2주 간격 자동 배정
   - 키워드 기반 태스크 제목/설명 구체화
```

### 예시 코드
```python
# requirements를 순회하며 태스크 생성
for idx, requirement in enumerate(requirements_list):
    priority = "high"  # 필수 요건
    due_date = today + timedelta(weeks=2 * (idx + 1))
    
    # 키워드 기반 구체화
    if "React" in requirement:
        title = "React 학습 및 프로젝트 개발"
        description = "React 공식 문서 학습 및 실무 프로젝트"
    
    task = {
        "user_id": user_id,
        "goal_id": goal_id,
        "title": title,
        "description": description,
        "due_date": str(due_date),
        "priority": priority,
        "order_index": max_order + idx + 1
    }
    
    supabase.table("tasks").insert(task).execute()
```

---

## 🔥 주요 개선 사항

### 1. 데이터베이스 제약조건 최적화
**문제**: `goals` 테이블의 `user_id` UNIQUE 제약조건
- 한 유저가 하나의 목표만 생성 가능 ❌

**해결**: MCP를 통한 마이그레이션
```sql
ALTER TABLE goals DROP CONSTRAINT goals_user_id_key;
CREATE INDEX idx_goals_user_id ON goals(user_id);
```
- 한 유저가 여러 목표 생성 가능 ✅

### 2. 프론트엔드 호환성 개선
**문제**: 프론트엔드가 `POST /tasks/{id}/delete` 사용
- 백엔드는 `DELETE /tasks/{id}` 만 제공 ❌

**해결**: POST 방식 엔드포인트 추가
```python
@router.post("/tasks/{id}/delete")  # 프론트 호환
@router.delete("/tasks/{id}")       # RESTful 표준
```

### 3. FastAPI 라우트 순서 최적화
**문제**: `@router.get("")`가 먼저 매칭되어 `/gap-analysis` 접근 불가

**해결**: 구체적 경로를 상위에 배치
```python
@router.get("/gap-analysis")     # 먼저
@router.get("/list")
@router.get("/{goal_id}")
@router.get("")                  # 마지막
```

---

## 📈 데이터 통계

- **총 API 엔드포인트**: 40+개
- **채용 공고 데이터**: 52개 (실제 기업)
- **지원 우선순위**: high, medium, low
- **자동 생성 로직**: 키워드 기반 스마트 태스크 생성

---

## 🛠️ 개발 환경 설정

### 1. 가상환경 활성화
```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. 서버 실행
```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

### 3. API 문서 확인
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

---

## 🎨 프론트엔드 연동

### 헤더 설정
```typescript
headers: {
  'Content-Type': 'application/json',
  'x-user-id': userId,           // 사용자 인증
  'Authorization': `Bearer ${token}` // JWT (선택)
}
```

### 주요 사용 시나리오

#### 1. 채용 공고로 목표 생성
```javascript
// 1단계: 공고 선택
GET /job-postings?keyword=React

// 2단계: 목표 자동 생성
POST /goals/from-job-posting/51
→ goal_id: 43, 자동 태스크 5개 생성

// 3단계: 생성된 태스크 확인
GET /tasks?goal_id=43
```

#### 2. 진행 상황 대시보드
```javascript
// 대시보드 통계
GET /stats/dashboard
→ { total_goals, active_goals, completion_rate, 
    today_tasks, week_progress }

// 로드맵 진행도
GET /roadmap/progress
→ { goal, total_tasks, completed_tasks, 
    progress_percentage, days_remaining }
```

---

## 🚀 향후 개선 방향

### 기술적 개선
- [ ] Redis 캐싱 (공고 데이터)
- [ ] Celery 비동기 태스크 처리
- [ ] WebSocket 실시간 업데이트

### 기능 개선
- [ ] AI 기반 학습 자료 추천
- [ ] 사용자 간 로드맵 공유
- [ ] 학습 진도 리마인더 (이메일/알림)
- [ ] GitHub 연동 (커밋 활동 추적)

### 데이터 확장
- [ ] 실시간 채용 공고 크롤링
- [ ] 직무별 스킬 트리 데이터
- [ ] 합격 후기 데이터 수집

---

## 📝 개발 문서

### 제공 문서
- `docs/FRONTEND_API_GUIDE.md` - 프론트엔드 API 가이드
- `docs/IMPLEMENTATION_SUMMARY.md` - 구현 내역
- `docs/prd.md` - 제품 요구사항
- `docs/db.spec.md` - 데이터베이스 스펙
- `docs/openapi.yaml` - OpenAPI 스펙

---

## 🎯 프로젝트 성과

### 자동화
✅ 채용 공고 → 목표 → 로드맵 **완전 자동 생성**
✅ 우선순위 기반 태스크 정렬
✅ 진행률 실시간 추적

### 확장성
✅ MCP를 통한 유연한 DB 마이그레이션
✅ RESTful + POST 병행 (프론트 호환성)
✅ JSONB 활용한 동적 데이터 구조

### 사용성
✅ 52개 실제 기업 공고 데이터
✅ 키워드 기반 스마트 검색
✅ 배치 작업 지원 (일괄 완료/수정/삭제)

---

## 💬 Q&A

**Q1. 왜 MCP를 사용했나요?**
> Supabase의 제약조건 수정, 마이그레이션을 코드로 관리하기 위해 MCP를 활용했습니다. GUI 없이도 스키마 변경을 추적하고 버전 관리할 수 있습니다.

**Q2. 프론트엔드 호환성을 왜 고려했나요?**
> 프론트엔드가 이미 `POST /tasks/{id}/delete` 방식으로 구현되어 있어, RESTful 표준(`DELETE`)과 병행 지원하여 호환성을 확보했습니다.

**Q3. 자동 로드맵 생성의 핵심은?**
> 채용 공고의 JSONB 요구사항을 파싱하여 각 요구사항을 태스크로 변환하고, 키워드 분석을 통해 구체적인 학습 계획을 자동 생성합니다.

---

## 🏆 마무리

**Conpanion**은 단순한 할 일 관리를 넘어,
**실제 채용 공고 기반 맞춤형 학습 로드맵**을 제공하는
**취업 준비생의 든든한 동반자**입니다.

### 핵심 가치
🎯 **자동화** - 공고 선택만으로 완성되는 로드맵
📊 **데이터 기반** - 52개 실제 기업 공고 분석
🚀 **확장 가능** - MCP, JSONB, FastAPI 기반 유연한 구조

---

**감사합니다! 🙏**

GitHub: [Same-Ta/conpanion](https://github.com/Same-Ta/conpanion)
Branch: `back`
