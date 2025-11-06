# 백엔드 API 구현 요구사항

## 프로젝트 개요
**서비스명**: 스텝업(Step-Up) - 맞춤형 취업 로드맵 설계 서비스  
**데이터베이스**: Supabase (PostgreSQL)  
**프레임워크**: FastAPI (Python) 또는 Express (Node.js) 권장  
**인증 방식**: `x-user-id` 헤더 기반 (간단한 구현)

---

## 🗄️ 데이터베이스 스키마

### 1. users (사용자)
```sql
CREATE TABLE users (
  user_id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. user_specs (사용자 스펙)
```sql
CREATE TABLE user_specs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  job_field VARCHAR(100),
  introduction TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. education (학력)
```sql
CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  school VARCHAR(200),
  major VARCHAR(100),
  gpa VARCHAR(20),
  graduation_status VARCHAR(20) CHECK (graduation_status IN ('graduated', 'expected', 'enrolled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. languages (어학)
```sql
CREATE TABLE languages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  language_type VARCHAR(50) NOT NULL,
  score VARCHAR(50) NOT NULL,
  acquisition_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. certificates (자격증)
```sql
CREATE TABLE certificates (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  certificate_name VARCHAR(200) NOT NULL,
  acquisition_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. projects (프로젝트)
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  project_name VARCHAR(200) NOT NULL,
  role VARCHAR(100),
  period VARCHAR(100),
  description TEXT,
  tech_stack TEXT,
  github_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. activities (활동)
```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  activity_name VARCHAR(200) NOT NULL,
  activity_type VARCHAR(100),
  period VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. goals (목표)
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  job_title VARCHAR(200) NOT NULL,
  company_name VARCHAR(200) NOT NULL,
  location VARCHAR(100),
  deadline DATE,
  experience_level VARCHAR(50),
  requirements TEXT[], -- PostgreSQL 배열
  preferred TEXT[], -- PostgreSQL 배열
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 9. job_postings (채용 공고)
```sql
CREATE TABLE job_postings (
  id SERIAL PRIMARY KEY,
  company VARCHAR(200) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  url VARCHAR(500),
  requirements JSONB, -- JSON 배열로 저장
  preferred JSONB, -- JSON 배열로 저장
  location VARCHAR(100),
  experience_level VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. tasks (할 일)
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
  goal_id INTEGER REFERENCES goals(id) ON DELETE SET NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📡 API 엔드포인트 구현 명세

### ✅ 필수 구현 API (총 24개)

---

## 1️⃣ 인증 API (2개)

### 1.1 회원가입
```
POST /auth/register
```

**Request Body:**
```json
{
  "user_id": "kim_frontend",
  "password": "Password123!",
  "email": "kim@example.com"
}
```

**Response (201 Created):**
```json
{
  "message": "회원가입이 완료되었습니다",
  "user_id": "kim_frontend"
}
```

**구현 로직:**
1. user_id, email 중복 체크
2. 비밀번호 해시 (bcrypt 사용)
3. users 테이블에 INSERT
4. user_specs 테이블에 기본 레코드 생성 (onboarding_completed: false)

**에러 응답:**
- 409: 이미 존재하는 user_id 또는 email
- 400: 비밀번호 형식 오류

---

### 1.2 로그인
```
POST /auth/login
```

**Request Body:**
```json
{
  "user_id": "kim_frontend",
  "password": "Password123!"
}
```

**Response (200 OK):**
```json
{
  "message": "로그인 성공",
  "user_id": "kim_frontend",
  "onboarding_completed": true
}
```

**구현 로직:**
1. user_id로 users 조회
2. 비밀번호 해시 비교
3. user_specs에서 onboarding_completed 조회
4. user_id 반환

**에러 응답:**
- 401: 잘못된 아이디 또는 비밀번호

---

## 2️⃣ 스펙 관리 API (10개)

### 2.1 사용자 스펙 조회
```
GET /specs
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": "kim_frontend",
  "job_field": "프론트엔드 개발자",
  "introduction": "안녕하세요...",
  "onboarding_completed": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**구현 로직:**
1. x-user-id 헤더에서 user_id 추출
2. user_specs 테이블에서 해당 user_id 조회
3. 없으면 빈 레코드 생성 후 반환

---

### 2.2 사용자 스펙 수정
```
PUT /specs
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "job_field": "프론트엔드 개발자",
  "introduction": "3년차 프론트엔드 개발자입니다",
  "onboarding_completed": true
}
```

**Response (200 OK):**
```json
{
  "message": "사용자 스펙이 업데이트되었습니다",
  "data": { /* 업데이트된 스펙 */ }
}
```

**구현 로직:**
1. user_specs에서 user_id로 조회
2. UPDATE 또는 INSERT (UPSERT)
3. updated_at 갱신

---

### 2.3 학력 정보 수정
```
PUT /specs/education
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "school": "서울대학교",
  "major": "컴퓨터공학",
  "gpa": "4.0/4.5",
  "graduation_status": "graduated"
}
```

**Response (200 OK):**
```json
{
  "message": "학력 정보가 업데이트되었습니다",
  "data": { /* 업데이트된 학력 */ }
}
```

**구현 로직:**
1. education 테이블에서 user_id로 조회
2. 있으면 UPDATE, 없으면 INSERT

---

### 2.4 어학 정보 추가
```
POST /specs/languages
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "language_type": "TOEIC",
  "score": "900",
  "acquisition_date": "2024-12-01"
}
```

**Response (201 Created):**
```json
{
  "message": "어학 정보가 추가되었습니다",
  "data": {
    "id": 1,
    "user_id": "kim_frontend",
    "language_type": "TOEIC",
    "score": "900",
    "acquisition_date": "2024-12-01",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

### 2.5 어학 정보 삭제
```
DELETE /specs/languages/{language_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "어학 정보가 삭제되었습니다"
}
```

**구현 로직:**
1. language_id와 user_id가 일치하는지 확인
2. DELETE 실행

---

### 2.6 자격증 정보 추가
```
POST /specs/certificates
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "certificate_name": "정보처리기사",
  "acquisition_date": "2024-06-15"
}
```

**Response (201 Created):**
```json
{
  "message": "자격증 정보가 추가되었습니다",
  "data": { /* 생성된 자격증 */ }
}
```

---

### 2.7 자격증 정보 삭제
```
DELETE /specs/certificates/{certificate_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "자격증 정보가 삭제되었습니다"
}
```

---

### 2.8 프로젝트 추가
```
POST /specs/projects
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "project_name": "쇼핑몰 웹사이트",
  "role": "프론트엔드 개발",
  "period": "2024-01 ~ 2024-06",
  "description": "React 기반 쇼핑몰...",
  "tech_stack": "React, TypeScript, Redux",
  "github_url": "https://github.com/user/project",
  "portfolio_url": "https://portfolio.com"
}
```

**Response (201 Created):**
```json
{
  "message": "프로젝트가 추가되었습니다",
  "data": { /* 생성된 프로젝트 */ }
}
```

---

### 2.9 활동 추가
```
POST /specs/activities
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "activity_name": "SW마에스트로 13기",
  "activity_type": "정부지원사업",
  "period": "2024-01 ~ 2024-12",
  "description": "팀 프로젝트 개발..."
}
```

**Response (201 Created):**
```json
{
  "message": "활동이 추가되었습니다",
  "data": { /* 생성된 활동 */ }
}
```

---

### 2.10 대시보드 데이터 조회
```
GET /specs/dashboard
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "user_spec": {
    "job_field": "프론트엔드 개발자",
    "introduction": "...",
    "onboarding_completed": true
  },
  "education": {
    "school": "서울대학교",
    "major": "컴퓨터공학",
    "gpa": "4.0/4.5"
  },
  "languages": [
    {
      "id": 1,
      "language_type": "TOEIC",
      "score": "900"
    }
  ],
  "certificates": [
    {
      "id": 1,
      "certificate_name": "정보처리기사"
    }
  ],
  "projects": [
    {
      "id": 1,
      "project_name": "쇼핑몰 웹사이트"
    }
  ],
  "activities": [
    {
      "id": 1,
      "activity_name": "SW마에스트로"
    }
  ],
  "stats": {
    "language_count": 2,
    "certificate_count": 3,
    "project_count": 5,
    "activity_count": 4
  }
}
```

**구현 로직:**
1. user_specs, education, languages, certificates, projects, activities 모두 조회
2. 통계 계산 (COUNT)
3. JSON으로 병합하여 반환

---

## 3️⃣ 목표 관리 API (4개)

### 3.1 목표 목록 조회
```
GET /goals
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": "kim_frontend",
    "job_title": "프론트엔드 개발자",
    "company_name": "카카오",
    "location": "판교",
    "deadline": "2025-12-31",
    "experience_level": "3년차",
    "requirements": [
      "React 2년 이상 경험",
      "TypeScript 능숙"
    ],
    "preferred": [
      "Next.js 사용 경험",
      "웹 성능 최적화 경험"
    ],
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

**구현 로직:**
1. goals 테이블에서 user_id로 조회
2. is_active = true인 것만 반환 (또는 전체)
3. created_at 내림차순 정렬

---

### 3.2 목표 생성
```
POST /goals
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "job_posting_id": 1,
  "job_title": "프론트엔드 개발자",
  "company_name": "카카오",
  "requirements": ["React 2년 이상", "TypeScript"],
  "preferred": ["Next.js", "성능 최적화"],
  "deadline": "2025-12-31",
  "is_active": true
}
```

**Response (201 Created):**
```json
{
  "message": "목표가 생성되었습니다",
  "data": {
    "id": 1,
    "user_id": "kim_frontend",
    "job_title": "프론트엔드 개발자",
    "company_name": "카카오",
    "requirements": ["React 2년 이상", "TypeScript"],
    "preferred": ["Next.js", "성능 최적화"],
    "deadline": "2025-12-31",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**구현 로직:**
1. goals 테이블에 INSERT
2. requirements, preferred는 PostgreSQL 배열로 저장
3. 생성된 레코드 반환

---

### 3.3 채용 공고 목록 조회
```
GET /job-postings
```

**Query Parameters:**
- `is_active`: boolean (선택)
- `company`: string (선택)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "company": "카카오",
    "title": "프론트엔드 개발자",
    "description": "카카오의 다양한 서비스...",
    "url": "https://careers.kakao.com/jobs",
    "requirements": [
      {
        "description": "React 2년 이상",
        "category": "필수",
        "priority": "required"
      },
      {
        "description": "TypeScript 능숙",
        "category": "필수",
        "priority": "required"
      }
    ],
    "preferred": [
      {
        "description": "Next.js 경험",
        "category": "우대",
        "priority": "preferred"
      }
    ],
    "location": "판교",
    "experience_level": "2년 이상",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**구현 로직:**
1. job_postings 테이블 조회
2. 쿼리 파라미터로 필터링
3. requirements, preferred는 JSONB로 저장되어 있음

---

### 3.4 사용자 진행 상황 조회
```
GET /progress
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "user_spec": { /* user_specs */ },
  "education": { /* education */ },
  "languages": [ /* languages */ ],
  "certificates": [ /* certificates */ ],
  "projects": [ /* projects */ ],
  "activities": [ /* activities */ ],
  "gap_analysis": [
    {
      "job_posting_id": 1,
      "requirements": [
        {
          "description": "React 2년 이상",
          "is_met": true,
          "gap_detail": "프로젝트 경험 3년"
        },
        {
          "description": "TypeScript 능숙",
          "is_met": false,
          "gap_detail": "실무 경험 부족"
        }
      ]
    }
  ]
}
```

**구현 로직:**
1. 사용자의 모든 스펙 데이터 조회
2. 활성 목표(goals)와 비교하여 갭 분석
3. 키워드 매칭 또는 간단한 규칙 기반 분석

---

## 4️⃣ 로드맵/태스크 관리 API (4개)

### 4.1 태스크 목록 조회
```
GET /tasks
Headers: x-user-id: kim_frontend
```

**Query Parameters:**
- `goal_id`: integer (선택)
- `is_completed`: boolean (선택)
- `due_date`: date (선택)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": "kim_frontend",
    "goal_id": 1,
    "title": "React 공식 문서 학습",
    "description": "React 공식 문서 전체 읽기",
    "due_date": "2025-02-01",
    "is_completed": false,
    "completed_at": null,
    "priority": "high",
    "order_index": 0,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

**구현 로직:**
1. tasks 테이블에서 user_id로 조회
2. 쿼리 파라미터로 필터링
3. order_index, created_at 순 정렬

---

### 4.2 태스크 생성
```
POST /tasks
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "title": "TypeScript 강의 수강",
  "description": "인프런 TypeScript 강의 완강",
  "due_date": "2025-03-01",
  "priority": "high",
  "goal_id": 1
}
```

**Response (201 Created):**
```json
{
  "message": "태스크가 생성되었습니다",
  "data": {
    "id": 2,
    "user_id": "kim_frontend",
    "goal_id": 1,
    "title": "TypeScript 강의 수강",
    "description": "인프런 TypeScript 강의 완강",
    "due_date": "2025-03-01",
    "is_completed": false,
    "priority": "high",
    "order_index": 1,
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**구현 로직:**
1. tasks 테이블에 INSERT
2. order_index는 현재 최대값 + 1
3. 생성된 레코드 반환

---

### 4.3 태스크 수정 (완료 포함)
```
PUT /tasks/{task_id}
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "title": "TypeScript 강의 수강 (수정)",
  "is_completed": true,
  "priority": "medium"
}
```

**Response (200 OK):**
```json
{
  "message": "태스크가 업데이트되었습니다",
  "data": {
    "id": 2,
    "is_completed": true,
    "completed_at": "2025-01-15T10:30:00Z",
    /* 기타 필드 */
  }
}
```

**구현 로직:**
1. task_id와 user_id 일치 확인
2. is_completed가 true로 변경되면 completed_at 자동 설정
3. updated_at 갱신

---

### 4.4 태스크 자동 생성 (AI 기반)
```
POST /tasks/auto-generate
Headers: x-user-id: kim_frontend
```

**Request Body:**
```json
{
  "goal_id": 1,
  "requirements": [
    "React 2년 이상",
    "TypeScript 능숙"
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "5개의 태스크가 자동 생성되었습니다",
  "tasks": [
    {
      "id": 10,
      "title": "React 공식 문서 학습",
      "due_date": "2025-02-01",
      "priority": "high"
    },
    {
      "id": 11,
      "title": "TypeScript 강의 수강",
      "due_date": "2025-02-15",
      "priority": "high"
    }
  ]
}
```

**구현 로직:**
1. requirements 배열을 분석
2. 각 요구사항에 대한 학습 태스크 생성
3. 우선순위 자동 할당 (필수 → high, 우대 → medium)
4. due_date는 오늘부터 2주 간격으로 자동 설정
5. 생성된 태스크들 반환

---

## 5️⃣ 기타 필요한 API (4개)

### 5.1 프로젝트 삭제
```
DELETE /specs/projects/{project_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "프로젝트가 삭제되었습니다"
}
```

---

### 5.2 활동 삭제
```
DELETE /specs/activities/{activity_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "활동이 삭제되었습니다"
}
```

---

### 5.3 목표 삭제
```
DELETE /goals/{goal_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "목표가 삭제되었습니다"
}
```

**구현 로직:**
1. goal_id와 user_id 일치 확인
2. is_active를 false로 변경 (소프트 삭제) 또는 DELETE

---

### 5.4 태스크 삭제
```
DELETE /tasks/{task_id}
Headers: x-user-id: kim_frontend
```

**Response (200 OK):**
```json
{
  "message": "태스크가 삭제되었습니다"
}
```

---

## 🔒 인증 미들웨어 구현

모든 API 요청(로그인, 회원가입 제외)에서 `x-user-id` 헤더를 검증해야 합니다.

### Python (FastAPI) 예시:
```python
from fastapi import Header, HTTPException

async def verify_user(x_user_id: str = Header(...)):
    # users 테이블에서 user_id 존재 확인
    user = await db.fetch_one("SELECT user_id FROM users WHERE user_id = $1", x_user_id)
    if not user:
        raise HTTPException(status_code=401, detail="유효하지 않은 사용자입니다")
    return x_user_id
```

### Node.js (Express) 예시:
```javascript
const authMiddleware = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: '인증 헤더가 없습니다' });
  }
  
  const user = await db.query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
  if (user.rows.length === 0) {
    return res.status(401).json({ error: '유효하지 않은 사용자입니다' });
  }
  
  req.userId = userId;
  next();
};
```

---

## 📊 초기 데이터 (Seed Data)

### 채용 공고 샘플 데이터
```sql
INSERT INTO job_postings (company, title, description, url, requirements, preferred, is_active) VALUES
(
  '카카오',
  '프론트엔드 개발자',
  '카카오의 다양한 서비스를 함께 만들어갈 프론트엔드 개발자를 모집합니다.',
  'https://careers.kakao.com/jobs',
  '[
    {"description": "React, Vue.js 등 프론트엔드 프레임워크 경험 2년 이상", "category": "필수", "priority": "required"},
    {"description": "JavaScript/TypeScript 능숙", "category": "필수", "priority": "required"},
    {"description": "RESTful API 연동 경험", "category": "필수", "priority": "required"}
  ]'::jsonb,
  '[
    {"description": "웹 성능 최적화 경험", "category": "우대", "priority": "preferred"},
    {"description": "Next.js 사용 경험", "category": "우대", "priority": "preferred"}
  ]'::jsonb,
  true
),
(
  '네이버',
  '백엔드 개발자',
  '네이버 서비스의 안정적인 운영과 새로운 기능 개발을 담당할 백엔드 개발자를 찾습니다.',
  'https://recruit.navercorp.com',
  '[
    {"description": "Java, Spring Framework 경험 3년 이상", "category": "필수", "priority": "required"},
    {"description": "RDBMS, NoSQL 활용 경험", "category": "필수", "priority": "required"}
  ]'::jsonb,
  '[
    {"description": "대용량 트래픽 처리 경험", "category": "우대", "priority": "preferred"},
    {"description": "MSA 아키텍처 이해", "category": "우대", "priority": "preferred"}
  ]'::jsonb,
  true
);
```

---

## ⚙️ 환경 설정

### 환경 변수 (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/stepup_db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Server
PORT=8000
API_BASE_URL=http://localhost:8000

# Security
BCRYPT_ROUNDS=10
```

---

## 🧪 테스트 시나리오

### 1. 회원가입 → 로그인 → 온보딩
```bash
# 1. 회원가입
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "password": "Test123!", "email": "test@example.com"}'

# 2. 로그인
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "password": "Test123!"}'

# 3. 스펙 업데이트
curl -X PUT http://localhost:8000/specs \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{"job_field": "프론트엔드", "onboarding_completed": true}'
```

### 2. 목표 설정 → 태스크 생성
```bash
# 1. 채용 공고 조회
curl http://localhost:8000/job-postings

# 2. 목표 생성
curl -X POST http://localhost:8000/goals \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{
    "job_title": "프론트엔드 개발자",
    "company_name": "카카오",
    "requirements": ["React 2년", "TypeScript"],
    "preferred": ["Next.js"],
    "deadline": "2025-12-31"
  }'

# 3. 태스크 자동 생성
curl -X POST http://localhost:8000/tasks/auto-generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: test_user" \
  -d '{
    "goal_id": 1,
    "requirements": ["React 2년", "TypeScript"]
  }'
```

---

## 🚀 배포 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] 모든 테이블 스키마 생성
- [ ] 초기 채용 공고 데이터 삽입
- [ ] 환경 변수 설정
- [ ] CORS 설정 (프론트엔드 URL 허용)
- [ ] API 서버 실행 확인
- [ ] 각 엔드포인트 테스트
- [ ] 에러 핸들링 확인
- [ ] 로그 설정

---

## 📝 추가 구현 권장 사항

### 선택적 기능
1. **페이지네이션**: GET /job-postings, GET /tasks 등에 limit, offset 파라미터 추가
2. **검색 기능**: GET /job-postings?search=프론트엔드
3. **정렬 기능**: GET /tasks?sort_by=due_date&order=asc
4. **로깅**: 모든 API 요청/응답 로그 기록
5. **Rate Limiting**: IP 기반 요청 제한
6. **캐싱**: Redis를 사용한 자주 조회되는 데이터 캐싱

### 성능 최적화
1. 데이터베이스 인덱스 생성
```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

2. N+1 쿼리 방지 (JOIN 사용)
3. 커넥션 풀 설정

---

## 🐛 에러 응답 형식 통일

모든 에러는 다음 형식으로 반환:
```json
{
  "error": "에러 메시지",
  "code": "ERROR_CODE",
  "details": { /* 추가 정보 (선택) */ }
}
```

**HTTP 상태 코드:**
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스 없음
- 409: 중복
- 500: 서버 오류

---

## 📞 문의사항

구현 중 문제가 발생하면 프론트엔드 팀에 문의하세요.

**필수 확인 사항:**
✅ PostgreSQL 배열 타입 (requirements, preferred)  
✅ JSONB 타입 (job_postings.requirements)  
✅ CORS 설정 (http://localhost:3000, http://localhost:3003)  
✅ 타임스탬프는 모두 UTC 기준  
✅ 날짜 형식: YYYY-MM-DD  

---

**총 구현 API 수: 24개**
**예상 구현 시간: 2-3일**
