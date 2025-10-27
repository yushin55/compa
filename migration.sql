-- 스텝업(Step-Up) 데이터베이스 마이그레이션 SQL
-- Supabase PostgreSQL

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. user_specs 테이블
CREATE TABLE IF NOT EXISTS user_specs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    job_field VARCHAR(100),
    introduction TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. educations 테이블
CREATE TABLE IF NOT EXISTS educations (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    school VARCHAR(200),
    major VARCHAR(100),
    gpa VARCHAR(20),
    graduation_status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. languages 테이블
CREATE TABLE IF NOT EXISTS languages (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    language_type VARCHAR(50) NOT NULL,
    score VARCHAR(20) NOT NULL,
    acquisition_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_languages_user_id ON languages(user_id);

-- 5. certificates 테이블
CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    certificate_name VARCHAR(200) NOT NULL,
    acquisition_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

-- 6. projects 테이블
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    role VARCHAR(100),
    period VARCHAR(100),
    description TEXT,
    tech_stack TEXT,
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- 7. activities 테이블
CREATE TABLE IF NOT EXISTS activities (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    activity_name VARCHAR(200) NOT NULL,
    activity_type VARCHAR(50),
    period VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);

-- 8. goals 테이블
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    location VARCHAR(100),
    deadline DATE,
    experience_level VARCHAR(50),
    requirements TEXT,
    preferred TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. tasks 테이블
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    goal_id BIGINT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    priority VARCHAR(20),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_goal_id ON tasks(goal_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- 10. job_postings 테이블 (채용 공고)
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    company VARCHAR(200) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    url VARCHAR(500),
    requirements JSONB,
    preferred JSONB,
    location VARCHAR(100),
    experience_level VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_postings_is_active ON job_postings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_postings_company ON job_postings(company);

-- 초기 채용 공고 데이터
INSERT INTO job_postings (company, title, description, url, requirements, preferred, location, experience_level, is_active) VALUES
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
  '판교',
  '2년 이상',
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
  '성남시 분당구',
  '3년 이상',
  true
);
