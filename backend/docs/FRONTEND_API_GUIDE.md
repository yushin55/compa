# 프론트엔드 API 연동 가이드

## 📋 목차
1. [서버 정보](#서버-정보)
2. [인증 방식](#인증-방식)
3. [주요 API 엔드포인트](#주요-api-엔드포인트)
4. [데이터 모델](#데이터-모델)
5. [사용 예제](#사용-예제)
6. [에러 처리](#에러-처리)
7. [신규 추가 기능](#신규-추가-기능)

---

## 서버 정보

### 개발 서버
- **Base URL**: `http://127.0.0.1:8000`
- **API 문서**: `http://127.0.0.1:8000/docs` (Swagger UI)
- **대체 API 문서**: `http://127.0.0.1:8000/redoc` (ReDoc)

### CORS 설정
- 모든 오리진(`*`)에서 접근 가능
- 모든 HTTP 메서드 허용
- 모든 헤더 허용

---

## 인증 방식

### 사용자 인증
대부분의 API는 **헤더에 `x-user-id`를 포함**해야 합니다.

```javascript
headers: {
  'x-user-id': 'user123',
  'Content-Type': 'application/json'
}
```

### 로그인/회원가입
- `POST /auth/register` - 회원가입 (인증 불필요)
- `POST /auth/login` - 로그인 (인증 불필요)

---

## 주요 API 엔드포인트

### 1️⃣ 인증 (Authentication)

#### 회원가입
```http
POST /auth/register
Content-Type: application/json

{
  "user_id": "test_user",
  "password": "password123",
  "email": "user@example.com"  // 선택사항
}
```

**응답 (201 Created)**
```json
{
  "user_id": "test_user",
  "created_at": "2025-10-28T12:00:00"
}
```

#### 로그인
```http
POST /auth/login
Content-Type: application/json

{
  "user_id": "test_user",
  "password": "password123"
}
```

**응답 (200 OK)**
```json
{
  "user_id": "test_user",
  "created_at": "2025-10-28T12:00:00"
}
```

---

### 2️⃣ 채용 공고 (Job Postings) ⭐ 신규 추가

#### 채용 공고 목록 조회
```http
GET /job-postings?is_active=true&company=토스&keyword=React&experience_level=경력%202년%20이상
```

**쿼리 파라미터**
- `is_active` (boolean, 선택): 활성 공고만 조회
- `company` (string, 선택): 회사명으로 필터링
- `keyword` (string, 선택): 제목, 설명, 요구사항에서 키워드 검색 ⭐ 신규
- `experience_level` (string, 선택): 경력 수준으로 필터링 ⭐ 신규

**응답 (200 OK)**
```json
[
  {
    "id": 1,
    "company": "토스",
    "title": "프론트엔드 개발자",
    "description": "토스 프론트엔드 팀에서 함께할 개발자를 찾습니다.",
    "url": "https://toss.im/career/jobs",
    "requirements": [
      "React 또는 Vue.js 경험 2년 이상",
      "TypeScript 능숙자",
      "웹 표준 및 접근성 이해"
    ],
    "preferred": [
      "Next.js 또는 Nuxt.js 사용 경험",
      "반응형 웹 개발 경험"
    ],
    "location": "서울 강남구",
    "experience_level": "경력 2년 이상",
    "is_active": true,
    "created_at": "2025-10-28T12:00:00",
    "updated_at": "2025-10-28T12:00:00"
  }
]
```

#### 채용 공고 상세 조회
```http
GET /job-postings/{id}
```

**응답**: 단일 채용 공고 객체 (위와 동일한 구조)

---

### 3️⃣ 목표 (Goals)

#### 목표 생성
```http
POST /goals
x-user-id: user123
Content-Type: application/json

{
  "job_title": "프론트엔드 개발자",
  "company_name": "토스",
  "target_date": "2026-12-31",
  "requirements": ["React", "TypeScript"],
  "preferred": ["Next.js"]
}
```

**응답 (201 Created)**
```json
{
  "id": 1,
  "user_id": "user123",
  "job_title": "프론트엔드 개발자",
  "company_name": "토스",
  "target_date": "2026-12-31",
  "requirements": ["React", "TypeScript"],
  "preferred": ["Next.js"],
  "created_at": "2025-10-28T12:00:00",
  "updated_at": "2025-10-28T12:00:00"
}
```

#### 채용 공고에서 목표 자동 생성 ⭐ 신규 추가
```http
POST /goals/from-job-posting/{job_posting_id}
x-user-id: user123
Content-Type: application/json

{
  "target_date": "2026-12-31"  // 선택사항
}
```

**기능**
- 채용 공고의 requirements와 preferred를 자동으로 목표에 설정
- 목표 생성과 동시에 **학습 태스크를 자동 생성**
- 각 요구사항마다 2주 간격으로 태스크 생성
- 필수 요구사항은 high priority, 우대사항은 medium priority

**응답 (201 Created)**
```json
{
  "id": 12,
  "user_id": "user123",
  "job_title": "프론트엔드 개발자",
  "company_name": "토스",
  "target_date": "2026-12-31",
  "requirements": [
    "React 또는 Vue.js 경험 2년 이상",
    "TypeScript 능숙자",
    "웹 표준 및 접근성 이해"
  ],
  "preferred": [
    "Next.js 또는 Nuxt.js 사용 경험",
    "반응형 웹 개발 경험"
  ],
  "created_at": "2025-10-28T12:00:00",
  "updated_at": "2025-10-28T12:00:00"
}
```

#### 목표 목록 조회
```http
GET /goals/list
x-user-id: user123
```

**응답 (200 OK)**: 사용자의 모든 목표 배열 반환 ⭐ 신규

#### 목표 상세 조회 ⭐ 신규
```http
GET /goals/{goal_id}
x-user-id: user123
```

**응답 (200 OK)**: 특정 목표의 상세 정보 반환

#### 현재 활성 목표 조회
```http
GET /goals
x-user-id: user123
```

**응답 (200 OK)**: 현재 활성화된 목표 반환

#### 목표 수정
```http
PUT /goals/{id}
x-user-id: user123
Content-Type: application/json

{
  "job_title": "시니어 프론트엔드 개발자",
  "target_date": "2027-01-01"
}
```

#### 목표 삭제
```http
DELETE /goals/{id}
x-user-id: user123
```

---

### 4️⃣ 태스크 (Tasks)

#### 태스크 목록 조회
```http
GET /tasks?goal_id=1&status=in_progress
x-user-id: user123
```

**쿼리 파라미터**
- `goal_id` (integer, 선택): 특정 목표의 태스크만 조회
- `status` (string, 선택): `pending`, `in_progress`, `completed`

**응답 (200 OK)**
```json
[
  {
    "id": 1,
    "goal_id": 1,
    "title": "React 학습 및 프로젝트 개발",
    "description": null,
    "status": "in_progress",
    "priority": "high",
    "due_date": "2025-11-11",
    "created_at": "2025-10-28T12:00:00",
    "updated_at": "2025-10-28T12:00:00"
  }
]
```

#### 태스크 생성
```http
POST /tasks
x-user-id: user123
Content-Type: application/json

{
  "goal_id": 1,
  "title": "TypeScript 강의 수강",
  "description": "Udemy TypeScript 완강하기",
  "status": "pending",
  "priority": "high",
  "due_date": "2025-11-30"
}
```

#### 태스크 자동 생성 ⭐ 신규 추가
```http
POST /tasks/auto-generate
x-user-id: user123
Content-Type: application/json

{
  "goal_id": 1,
  "requirements": [
    "React 경험",
    "TypeScript 능숙",
    "웹 표준 이해"
  ]
}
```

**기능**
- 요구사항 목록을 기반으로 학습 태스크 자동 생성
- 2주 간격으로 태스크 일정 설정
- 우선순위 자동 설정 (high)

#### 태스크 수정
```http
PUT /tasks/{id}
x-user-id: user123
Content-Type: application/json

{
  "status": "completed",
  "title": "TypeScript 강의 완료"
}
```

#### 태스크 삭제
```http
DELETE /tasks/{id}
x-user-id: user123
```

#### 태스크 일괄 업데이트 ⭐ 신규
```http
PATCH /tasks/batch-update
x-user-id: user123
Content-Type: application/json

{
  "task_ids": [1, 2, 3],
  "update_data": {
    "status": "in_progress",
    "priority": "high"
  }
}
```

**기능**: 여러 태스크를 한번에 업데이트
**응답**: 업데이트된 태스크 개수 및 목록

#### 태스크 일괄 완료 ⭐ 신규
```http
PATCH /tasks/batch-complete
x-user-id: user123
Content-Type: application/json

{
  "task_ids": [1, 2, 3]
}
```

**기능**: 여러 태스크를 한번에 완료 처리
**응답**: 완료된 태스크 개수 및 목록

---

### 7️⃣ 통계 (Statistics) ⭐ 신규 추가

#### 대시보드 통계
```http
GET /stats/dashboard
x-user-id: user123
```

**응답 (200 OK)**
```json
{
  "user_id": "user123",
  "summary": {
    "total_goals": 3,
    "active_goal": {...},
    "total_tasks": 25,
    "completed_tasks": 10,
    "pending_tasks": 15,
    "completion_rate": 40.0
  },
  "tasks_by_priority": {
    "high": 8,
    "medium": 5,
    "low": 2
  },
  "upcoming": {
    "today": 2,
    "this_week": 5,
    "overdue": 1
  },
  "recent_activity": [
    {
      "date": "2025-10-28",
      "completed_tasks": 3
    }
  ]
}
```

#### 주간 통계
```http
GET /stats/weekly
x-user-id: user123
```

**응답**: 이번 주의 요일별 태스크 통계

#### 월간 통계
```http
GET /stats/monthly
x-user-id: user123
```

**응답**: 이번 달의 주별 태스크 통계

#### 목표별 상세 통계
```http
GET /stats/goal/{goal_id}
x-user-id: user123
```

**응답**: 특정 목표에 대한 상세 통계 및 진행상황

---

### 5️⃣ 진행률 (Progress)

#### 사용자 진행률 조회
```http
GET /progress
x-user-id: user123
```

**응답 (200 OK)**
```json
{
  "user_id": "user123",
  "total_goals": 3,
  "active_goals": 2,
  "completed_goals": 1,
  "total_tasks": 15,
  "pending_tasks": 5,
  "in_progress_tasks": 7,
  "completed_tasks": 3,
  "overall_completion_rate": 20.0,
  "goals_summary": [
    {
      "goal_id": 1,
      "job_title": "프론트엔드 개발자",
      "company_name": "토스",
      "total_tasks": 5,
      "completed_tasks": 2,
      "completion_rate": 40.0
    }
  ]
}
```

---

### 6️⃣ 사용자 스펙 (User Specs)

#### 내 정보 조회
```http
GET /users/me
x-user-id: user123
```

#### 회원 탈퇴 ⭐ 신규
```http
DELETE /users/me
x-user-id: user123
```

**응답 (204 No Content)**
- 사용자 및 모든 관련 데이터 삭제
- 복구 불가능하므로 주의 필요

#### 온보딩 정보 조회
```http
GET /specs/onboarding
x-user-id: user123
```

#### 온보딩 정보 업데이트
```http
PUT /specs/onboarding
x-user-id: user123
Content-Type: application/json

{
  "job_field": "프론트엔드 개발",
  "introduction": "웹 개발에 관심이 많습니다.",
  "onboarding_completed": true
}
```

#### 학력 정보 업데이트
```http
PUT /specs/education
x-user-id: user123
Content-Type: application/json

{
  "school": "서울대학교",
  "major": "컴퓨터공학",
  "gpa": "3.8/4.5",
  "graduation_status": "졸업"
}
```

#### 경력 정보 업데이트
```http
PUT /specs/experience
x-user-id: user123
Content-Type: application/json

{
  "company": "네이버",
  "position": "주니어 개발자",
  "years": "2년"
}
```

---

## 데이터 모델

### JobPosting (채용 공고)
```typescript
interface JobPosting {
  id: number;
  company: string;
  title: string;
  description?: string;
  url?: string;
  requirements: string[];  // 필수 요구사항 배열
  preferred: string[];     // 우대 사항 배열
  location?: string;
  experience_level?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### Goal (목표)
```typescript
interface Goal {
  id: number;
  user_id: string;
  job_title: string;
  company_name?: string;
  target_date?: string;
  requirements?: string[];
  preferred?: string[];
  created_at: string;
  updated_at: string;
}
```

### Task (태스크)
```typescript
interface Task {
  id: number;
  goal_id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
}
```

### Progress (진행률)
```typescript
interface Progress {
  user_id: string;
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  overall_completion_rate: number;
  goals_summary: GoalSummary[];
}

interface GoalSummary {
  goal_id: number;
  job_title: string;
  company_name?: string;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}
```

---

## 사용 예제

### React/TypeScript 예제

#### 1. 채용 공고 목록 조회
```typescript
const fetchJobPostings = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/job-postings?is_active=true');
    const jobs: JobPosting[] = await response.json();
    console.log(`총 ${jobs.length}개의 채용 공고`);
    return jobs;
  } catch (error) {
    console.error('채용 공고 조회 실패:', error);
  }
};
```

#### 2. 채용 공고에서 목표 생성 (핵심 기능!)
```typescript
const createGoalFromJobPosting = async (jobPostingId: number, userId: string) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/goals/from-job-posting/${jobPostingId}`,
      {
        method: 'POST',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_date: '2026-12-31'
        })
      }
    );
    
    const goal = await response.json();
    console.log('목표 생성 완료:', goal);
    
    // 자동 생성된 태스크 확인
    const tasksResponse = await fetch(
      `http://127.0.0.1:8000/tasks?goal_id=${goal.id}`,
      {
        headers: { 'x-user-id': userId }
      }
    );
    const tasks = await tasksResponse.json();
    console.log(`${tasks.length}개의 태스크가 자동 생성되었습니다.`);
    
    return { goal, tasks };
  } catch (error) {
    console.error('목표 생성 실패:', error);
  }
};
```

#### 3. 진행률 조회
```typescript
const fetchProgress = async (userId: string) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/progress', {
      headers: { 'x-user-id': userId }
    });
    const progress: Progress = await response.json();
    console.log(`전체 완료율: ${progress.overall_completion_rate}%`);
    return progress;
  } catch (error) {
    console.error('진행률 조회 실패:', error);
  }
};
```

#### 4. 태스크 상태 업데이트
```typescript
const updateTaskStatus = async (taskId: number, userId: string, status: string) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    const updatedTask = await response.json();
    console.log('태스크 업데이트 완료:', updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('태스크 업데이트 실패:', error);
  }
};
```

### Vue.js 예제

```vue
<template>
  <div>
    <h2>채용 공고 목록</h2>
    <div v-for="job in jobPostings" :key="job.id">
      <h3>{{ job.company }} - {{ job.title }}</h3>
      <button @click="createGoal(job.id)">
        목표 설정하기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      jobPostings: [],
      userId: 'current_user'
    };
  },
  async mounted() {
    await this.fetchJobPostings();
  },
  methods: {
    async fetchJobPostings() {
      const response = await fetch('http://127.0.0.1:8000/job-postings?is_active=true');
      this.jobPostings = await response.json();
    },
    async createGoal(jobPostingId) {
      const response = await fetch(
        `http://127.0.0.1:8000/goals/from-job-posting/${jobPostingId}`,
        {
          method: 'POST',
          headers: {
            'x-user-id': this.userId,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target_date: '2026-12-31'
          })
        }
      );
      
      const goal = await response.json();
      alert('목표가 생성되었습니다! 자동으로 학습 계획도 만들어졌어요.');
      this.$router.push(`/roadmap/${goal.id}`);
    }
  }
};
</script>
```

---

## 에러 처리

### 에러 응답 형식
```json
{
  "detail": {
    "error": "에러 메시지",
    "code": "ERROR_CODE"
  }
}
```

### 주요 에러 코드

| HTTP 상태 | 에러 코드 | 설명 |
|---------|---------|-----|
| 400 | INVALID_REQUEST | 잘못된 요청 데이터 |
| 401 | UNAUTHORIZED | 인증 실패 (x-user-id 누락) |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | ALREADY_EXISTS | 이미 존재하는 리소스 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |

### 에러 처리 예제
```typescript
const handleApiCall = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.error || '알 수 없는 오류');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API 호출 실패:', error);
    // 사용자에게 에러 메시지 표시
    alert(error.message);
    throw error;
  }
};
```

---

## 주요 변경사항 요약

### ✨ 새로 추가된 기능

1. **채용 공고 API** (`/job-postings`)
   - 52개의 실제 채용 공고 데이터 제공
   - 회사, 직무, 요구사항, 우대사항 등 상세 정보 포함

2. **채용 공고에서 목표 자동 생성** (`POST /goals/from-job-posting/{id}`)
   - 공고의 요구사항을 자동으로 목표에 설정
   - 학습 태스크 자동 생성 (2주 간격, 우선순위 자동 설정)
   - 프론트엔드에서 "목표 설정" 버튼 클릭 시 사용

3. **태스크 자동 생성 API** (`POST /tasks/auto-generate`)
   - 요구사항 목록 기반 태스크 자동 생성
   - 학습 계획 수립 자동화

4. **진행률 조회 API** (`GET /progress`)
   - 사용자의 전체 학습 진행률 확인
   - 목표별 완료율 제공
   - 대시보드 구현에 활용

### 🔧 수정된 부분

- **JobPosting 스키마**: `requirements`와 `preferred`가 문자열 배열로 변경
- **데이터 파싱**: JSON 문자열과 배열 형식 모두 지원
- **CORS 설정**: 모든 오리진에서 접근 가능

---

## 추천 UI 플로우

### 1. 채용 공고 → 목표 설정 플로우
```
1. 채용 공고 목록 페이지 (/job-postings)
   ↓
2. 공고 상세 보기 (공고 선택)
   ↓
3. "이 공고로 목표 설정하기" 버튼 클릭
   ↓
4. POST /goals/from-job-posting/{id} 호출
   ↓
5. 목표 + 태스크 자동 생성 완료
   ↓
6. 로드맵 페이지로 이동 (/roadmap/{goal_id})
```

### 2. 대시보드 구성 요소
```typescript
// 진행률 데이터 활용
const DashboardComponent = () => {
  const [progress, setProgress] = useState<Progress | null>(null);
  
  useEffect(() => {
    fetchProgress(userId).then(setProgress);
  }, [userId]);
  
  return (
    <div>
      <h2>전체 진행률: {progress?.overall_completion_rate}%</h2>
      <p>활성 목표: {progress?.active_goals}개</p>
      <p>완료된 태스크: {progress?.completed_tasks}/{progress?.total_tasks}</p>
      
      {progress?.goals_summary.map(goal => (
        <div key={goal.goal_id}>
          <h3>{goal.company_name} {goal.job_title}</h3>
          <ProgressBar value={goal.completion_rate} />
        </div>
      ))}
    </div>
  );
};
```

---

## 테스트 데이터

### 사용 가능한 채용 공고 (일부)

| ID | 회사 | 직무 | 경력 |
|---|------|------|------|
| 3 | 토스 | 프론트엔드 개발자 | 경력 2년 이상 |
| 48 | 쿠팡 | 백엔드 개발자 | 경력 3년 이상 |
| 45 | 배달의민족 | 풀스택 개발자 | 경력 무관 |
| 46 | 라인 | 데이터 엔지니어 | 경력 2년 이상 |
| 47 | 당근마켓 | iOS 개발자 | 신입 가능 |

### 테스트 시나리오

1. **회원가입 → 온보딩 → 채용 공고 선택 → 목표 설정**
2. **진행률 확인 → 태스크 완료 → 진행률 업데이트**
3. **여러 목표 생성 → 대시보드에서 전체 진행상황 확인**

---

## 문의사항

백엔드 API 관련 문의사항이 있으시면:
- GitHub Issues: `Same-Ta/conpanion` 레포지토리
- 브랜치: `back`
- API 문서: http://127.0.0.1:8000/docs

---

**마지막 업데이트**: 2025년 10월 28일  
**API 버전**: 1.0.0  
**총 엔드포인트 수**: 34개

---

## 신규 추가 기능

### 🆕 이번 업데이트에서 새로 추가된 API

#### 1. 목표 관리 강화
- `GET /goals/list` - 모든 목표 목록 조회
- `GET /goals/{goal_id}` - 특정 목표 상세 조회

#### 2. 채용 공고 검색
- `GET /job-postings?keyword={keyword}` - 키워드로 공고 검색
- `GET /job-postings?experience_level={level}` - 경력 수준 필터링

#### 3. 태스크 일괄 처리
- `PATCH /tasks/batch-update` - 여러 태스크 한번에 업데이트
- `PATCH /tasks/batch-complete` - 여러 태스크 한번에 완료 처리

#### 4. 통계 API (완전 신규)
- `GET /stats/dashboard` - 대시보드용 종합 통계
- `GET /stats/weekly` - 주간 통계 및 요일별 분석
- `GET /stats/monthly` - 월간 통계 및 주별 분석
- `GET /stats/goal/{goal_id}` - 목표별 상세 통계

#### 5. 사용자 관리
- `DELETE /users/me` - 회원 탈퇴 기능

---

## 활용 시나리오

### 시나리오 1: 채용 공고 검색 및 목표 설정
```typescript
// 1. "React" 키워드로 공고 검색
const jobs = await fetch(
  'http://127.0.0.1:8000/job-postings?keyword=React&is_active=true'
).then(res => res.json());

// 2. 마음에 드는 공고로 목표 설정
const goal = await fetch(
  `http://127.0.0.1:8000/goals/from-job-posting/${jobs[0].id}`,
  {
    method: 'POST',
    headers: {
      'x-user-id': userId,
      'Content-Type': 'application/json'
    }
  }
).then(res => res.json());

// 3. 자동 생성된 로드맵 확인
const tasks = await fetch(
  `http://127.0.0.1:8000/tasks?goal_id=${goal.id}`,
  { headers: { 'x-user-id': userId } }
).then(res => res.json());
```

### 시나리오 2: 대시보드 구현
```typescript
// 통계 데이터 가져오기
const dashboardData = await fetch(
  'http://127.0.0.1:8000/stats/dashboard',
  { headers: { 'x-user-id': userId } }
).then(res => res.json());

// 대시보드 렌더링
<Dashboard>
  <CompletionRate value={dashboardData.summary.completion_rate} />
  <TodayTasks count={dashboardData.upcoming.today} />
  <PriorityChart data={dashboardData.tasks_by_priority} />
  <ActivityChart data={dashboardData.recent_activity} />
</Dashboard>
```

### 시나리오 3: 일괄 태스크 처리
```typescript
// 오늘의 모든 태스크를 완료 처리
const todayTasks = await fetch(
  'http://127.0.0.1:8000/tasks/today',
  { headers: { 'x-user-id': userId } }
).then(res => res.json());

const taskIds = todayTasks.map(t => t.id);

await fetch('http://127.0.0.1:8000/tasks/batch-complete', {
  method: 'PATCH',
  headers: {
    'x-user-id': userId,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ task_ids: taskIds })
});
```

### 시나리오 4: 주간 리포트 생성
```typescript
// 주간 통계 가져오기
const weeklyStats = await fetch(
  'http://127.0.0.1:8000/stats/weekly',
  { headers: { 'x-user-id': userId } }
).then(res => res.json());

// 요일별 완료율 차트
<WeeklyChart>
  {weeklyStats.daily_breakdown.map(day => (
    <Bar
      key={day.date}
      label={day.day_of_week}
      value={day.completion_rate}
      completed={day.completed_tasks}
      total={day.total_tasks}
    />
  ))}
</WeeklyChart>
```

---

## 변경 이력

### v1.0.0 (2025-10-28)
- ✨ 채용 공고 API 추가 (52개 실제 데이터)
- ✨ 채용 공고에서 목표 자동 생성 기능
- ✨ 태스크 자동 생성 API
- ✨ 진행률 조회 API
- 🆕 목표 목록 및 상세 조회 API
- 🆕 채용 공고 검색 기능 (키워드, 경력 수준)
- 🆕 태스크 일괄 처리 API (업데이트, 완료)
- 🆕 통계 API 4종 (대시보드, 주간, 월간, 목표별)
- 🆕 회원 탈퇴 API
- 🔧 JobPosting 스키마 개선
- 🔧 CORS 설정 최적화
