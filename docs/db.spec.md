# 스텝업(Step-Up) 데이터베이스 스펙

> Supabase 기반 데이터베이스 모델 명세서

## 목차
1. [개요](#1-개요)
2. [테이블 구조](#2-테이블-구조)
3. [관계 다이어그램](#3-관계-다이어그램)

---

## 1. 개요

### 1.1 데이터베이스 정보
- **DBMS**: PostgreSQL (Supabase)
- **인증 방식**: 자체 인증 (user_id, password)
- **보안**: RLS 미적용 (간소화)

### 1.2 테이블 목록
1. `users` - 사용자 정보
2. `user_specs` - 사용자 스펙 정보
3. `educations` - 학력 정보
4. `languages` - 어학 능력
5. `certificates` - 자격증
6. `projects` - 프로젝트 경험
7. `activities` - 대외활동
8. `goals` - 목표 (채용 공고)
9. `tasks` - 업무 목록

---

## 2. 테이블 구조

### 2.1 users (사용자)
사용자 계정 정보를 저장하는 테이블

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| user_id | VARCHAR(50) | PRIMARY KEY | 사용자 아이디 |
| password | VARCHAR(255) | NOT NULL | 비밀번호 (해시 저장 권장) |
| email | VARCHAR(255) | NOT NULL, UNIQUE | 이메일 주소 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

---

### 2.2 user_specs (사용자 스펙)
사용자의 기본 스펙 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY, UNIQUE | 사용자 아이디 |
| job_field | VARCHAR(100) | NULL | 희망 직무 분야 |
| introduction | TEXT | NULL | 자기소개 |
| onboarding_completed | BOOLEAN | DEFAULT FALSE | 온보딩 완료 여부 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

### 2.3 educations (학력)
사용자의 학력 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY, UNIQUE | 사용자 아이디 (1:1) |
| school | VARCHAR(200) | NULL | 학교명 |
| major | VARCHAR(100) | NULL | 전공 |
| gpa | VARCHAR(20) | NULL | 학점 (예: 4.0/4.5) |
| graduation_status | VARCHAR(20) | NULL | 졸업 여부 (graduated, expected, enrolled) |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

### 2.4 languages (어학 능력)
사용자의 어학 성적 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY | 사용자 아이디 |
| language_type | VARCHAR(50) | NOT NULL | 어학 종류 (TOEIC, TOEFL, IELTS 등) |
| score | VARCHAR(20) | NOT NULL | 점수 |
| acquisition_date | DATE | NULL | 취득일 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

**인덱스**:
- `idx_languages_user_id` ON `user_id`

---

### 2.5 certificates (자격증)
사용자의 자격증 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY | 사용자 아이디 |
| certificate_name | VARCHAR(200) | NOT NULL | 자격증명 |
| acquisition_date | DATE | NULL | 취득일 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

**인덱스**:
- `idx_certificates_user_id` ON `user_id`

---

### 2.6 projects (프로젝트 경험)
사용자의 프로젝트 경험 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY | 사용자 아이디 |
| project_name | VARCHAR(200) | NOT NULL | 프로젝트명 |
| role | VARCHAR(100) | NULL | 역할 |
| period | VARCHAR(100) | NULL | 기간 (예: 2024.01 - 2024.06) |
| description | TEXT | NULL | 프로젝트 설명 |
| tech_stack | TEXT | NULL | 사용 기술/툴 |
| github_url | VARCHAR(500) | NULL | GitHub 링크 |
| portfolio_url | VARCHAR(500) | NULL | 포트폴리오 링크 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

**인덱스**:
- `idx_projects_user_id` ON `user_id`

---

### 2.7 activities (대외활동)
사용자의 대외활동 정보

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY | 사용자 아이디 |
| activity_name | VARCHAR(200) | NOT NULL | 활동명 |
| activity_type | VARCHAR(50) | NULL | 활동 유형 (인턴, 공모전, 봉사활동, 동아리 등) |
| period | VARCHAR(100) | NULL | 기간 |
| description | TEXT | NULL | 활동 내용 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

**인덱스**:
- `idx_activities_user_id` ON `user_id`

---

### 2.8 goals (목표)
사용자가 설정한 채용 공고 기반 목표

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY, UNIQUE | 사용자 아이디 (현재 목표 1개) |
| job_title | VARCHAR(200) | NOT NULL | 직무명 |
| company_name | VARCHAR(200) | NOT NULL | 회사명 |
| location | VARCHAR(100) | NULL | 근무지 |
| deadline | DATE | NULL | 마감일 |
| experience_level | VARCHAR(50) | NULL | 경력 (신입, 경력 등) |
| requirements | TEXT | NULL | 자격요건 (JSON 또는 구분자로 저장) |
| preferred | TEXT | NULL | 우대사항 (JSON 또는 구분자로 저장) |
| is_active | BOOLEAN | DEFAULT TRUE | 활성 상태 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE

---

### 2.9 tasks (업무)
사용자의 로드맵 업무 목록

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGSERIAL | PRIMARY KEY | 자동 증가 ID |
| user_id | VARCHAR(50) | FOREIGN KEY | 사용자 아이디 |
| goal_id | BIGINT | FOREIGN KEY, NULL | 목표 ID (선택적) |
| title | VARCHAR(200) | NOT NULL | 업무 제목 |
| description | TEXT | NULL | 업무 설명 |
| due_date | DATE | NULL | 마감일 |
| is_completed | BOOLEAN | DEFAULT FALSE | 완료 여부 |
| completed_at | TIMESTAMP | NULL | 완료 일시 |
| priority | VARCHAR(20) | NULL | 우선순위 (high, medium, low) |
| order_index | INTEGER | DEFAULT 0 | 정렬 순서 |
| created_at | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| updated_at | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**참조**:
- `user_id` → `users(user_id)` ON DELETE CASCADE
- `goal_id` → `goals(id)` ON DELETE SET NULL

**인덱스**:
- `idx_tasks_user_id` ON `user_id`
- `idx_tasks_goal_id` ON `goal_id`
- `idx_tasks_due_date` ON `due_date`

---

## 3. 관계 다이어그램

```
users (1)
  ├── (1:1) user_specs
  ├── (1:1) educations
  ├── (1:N) languages
  ├── (1:N) certificates
  ├── (1:N) projects
  ├── (1:N) activities
  ├── (1:1) goals (현재 활성 목표)
  └── (1:N) tasks

goals (1)
  └── (1:N) tasks (선택적 관계)
```

### 관계 설명

#### 1:1 관계
- `users` ↔ `user_specs`: 사용자당 1개의 스펙 정보
- `users` ↔ `educations`: 사용자당 1개의 학력 정보 (간소화)
- `users` ↔ `goals`: 사용자당 1개의 활성 목표

#### 1:N 관계
- `users` ↔ `languages`: 사용자는 여러 어학 성적 보유 가능
- `users` ↔ `certificates`: 사용자는 여러 자격증 보유 가능
- `users` ↔ `projects`: 사용자는 여러 프로젝트 경험 보유 가능
- `users` ↔ `activities`: 사용자는 여러 대외활동 보유 가능
- `users` ↔ `tasks`: 사용자는 여러 업무 보유 가능
- `goals` ↔ `tasks`: 목표는 여러 업무를 가질 수 있음 (선택적)

---

## 4. 주요 제약사항 및 규칙

### 4.1 CASCADE 정책
- 사용자 삭제 시 모든 관련 데이터 자동 삭제 (ON DELETE CASCADE)
- 목표 삭제 시 연관된 tasks의 goal_id는 NULL로 설정 (ON DELETE SET NULL)

### 4.2 UNIQUE 제약
- `users.email`: 이메일 중복 불가
- `user_specs.user_id`: 사용자당 1개의 스펙 정보
- `educations.user_id`: 사용자당 1개의 학력 정보
- `goals.user_id`: 사용자당 1개의 활성 목표 (is_active=TRUE)

### 4.3 DEFAULT 값
- 모든 테이블의 `created_at`, `updated_at`: 현재 시각
- `user_specs.onboarding_completed`: FALSE
- `goals.is_active`: TRUE
- `tasks.is_completed`: FALSE
- `tasks.order_index`: 0

### 4.4 데이터 타입 선택 이유
- **VARCHAR vs TEXT**: 
  - 제한된 길이의 데이터는 VARCHAR (검색 최적화)
  - 긴 설명이나 JSON 데이터는 TEXT
- **DATE vs TIMESTAMP**:
  - 날짜만 필요한 경우 DATE (마감일, 취득일)
  - 시간 정보 필요한 경우 TIMESTAMP (생성일시, 수정일시)
- **BOOLEAN**: 
  - 상태 플래그에 사용 (completed, active 등)

---

## 5. 인덱스 전략

### 5.1 적용된 인덱스
- `idx_languages_user_id`: 어학 성적 조회 최적화
- `idx_certificates_user_id`: 자격증 조회 최적화
- `idx_projects_user_id`: 프로젝트 조회 최적화
- `idx_activities_user_id`: 대외활동 조회 최적화
- `idx_tasks_user_id`: 업무 조회 최적화
- `idx_tasks_goal_id`: 목표별 업무 조회 최적화
- `idx_tasks_due_date`: 마감일 기준 업무 조회 최적화

### 5.2 인덱스 선택 기준
- 자주 조회되는 외래키 컬럼
- WHERE 절에 자주 사용되는 컬럼 (due_date)
- JOIN 연산에 사용되는 컬럼

---

## 6. 데이터 저장 방식

### 6.1 JSON vs 별도 필드
**JSON 형식으로 저장하는 경우**:
- `goals.requirements`: 자격요건 목록
- `goals.preferred`: 우대사항 목록

**예시**:
```json
{
  "requirements": [
    "HTML, CSS, JavaScript 기본 이해",
    "React 또는 Vue.js 프레임워크 경험"
  ],
  "preferred": [
    "TypeScript 사용 경험",
    "TOEIC 800점 이상"
  ]
}
```

**별도 필드로 저장하는 경우**:
- 각 스펙 정보 (languages, certificates 등)는 별도 테이블로 정규화
- 검색, 필터링, 집계 등이 용이

### 6.2 기간 표시
- `period` 필드: VARCHAR로 자유 형식 (예: "2024.01 - 2024.06", "6개월")
- 별도 시작/종료일 필드는 사용하지 않음 (간소화)

---

## 7. 주요 쿼리 패턴

### 7.1 사용자 스펙 전체 조회
```sql
-- 사용자의 모든 스펙 정보를 한 번에 조회
SELECT 
  u.*,
  us.*,
  e.*
FROM users u
LEFT JOIN user_specs us ON u.user_id = us.user_id
LEFT JOIN educations e ON u.user_id = e.user_id
WHERE u.user_id = 'user123';
```

### 7.2 사용자의 모든 어학/자격증/프로젝트 조회
```sql
-- 각 테이블을 개별적으로 조회
SELECT * FROM languages WHERE user_id = 'user123';
SELECT * FROM certificates WHERE user_id = 'user123';
SELECT * FROM projects WHERE user_id = 'user123';
SELECT * FROM activities WHERE user_id = 'user123';
```

### 7.3 사용자의 활성 목표 및 업무 조회
```sql
SELECT 
  g.*,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.is_completed THEN 1 END) as completed_tasks
FROM goals g
LEFT JOIN tasks t ON g.id = t.goal_id
WHERE g.user_id = 'user123' AND g.is_active = TRUE
GROUP BY g.id;
```

### 7.4 오늘의 할 일 조회
```sql
SELECT *
FROM tasks
WHERE user_id = 'user123'
  AND due_date = CURRENT_DATE
  AND is_completed = FALSE
ORDER BY priority DESC, order_index ASC;
```

---

## 8. 마이그레이션 고려사항

### 8.1 초기 데이터
- 사용자 회원가입 시 `user_specs` 레코드 자동 생성 (onboarding_completed=FALSE)
- 온보딩 완료 시 `onboarding_completed=TRUE`로 업데이트

### 8.2 데이터 무결성
- 외래키 제약조건으로 참조 무결성 보장
- 애플리케이션 레벨에서도 검증 로직 필요

### 8.3 확장 가능성
- 사용자당 여러 목표 지원 시: `goals` 테이블의 UNIQUE 제약 제거
- 학력 정보 복수 지원 시: `educations` 테이블의 UNIQUE 제약 제거
- 업무 카테고리 추가 시: `tasks` 테이블에 `category` 컬럼 추가

---

**문서 버전**: 1.0
**작성일**: 2025년 10월 25일
**DBMS**: PostgreSQL (Supabase)
