-- 템플릿 테이블 생성
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    description TEXT,
    tasks JSONB DEFAULT '[]'::jsonb,  -- 태스크 템플릿 배열
    routines JSONB DEFAULT '[]'::jsonb,  -- 루틴 템플릿 배열
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 템플릿 검색을 위한 인덱스
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_difficulty ON templates(difficulty);

-- 템플릿 updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_templates_updated_at();

-- 샘플 템플릿 데이터 삽입
INSERT INTO templates (title, category, duration, difficulty, description, tasks, routines) VALUES
(
    '백엔드 개발자 로드맵',
    'backend',
    '6개월',
    'intermediate',
    'Node.js, Express, MongoDB를 활용한 백엔드 개발 학습 로드맵',
    '[
        {"title": "Node.js 기초 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 1},
        {"title": "Express 프레임워크 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 2},
        {"title": "MongoDB 데이터베이스 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 3},
        {"title": "RESTful API 프로젝트", "category": "프로젝트", "duration": "4주", "priority": "required", "order": 4},
        {"title": "인증/권한 시스템 구현", "category": "프로젝트", "duration": "3주", "priority": "required", "order": 5}
    ]'::jsonb,
    '[
        {"title": "알고리즘 문제 풀이", "category": "학습", "frequency": 5, "color": "#3B82F6", "order": 1},
        {"title": "기술 블로그 작성", "category": "학습", "frequency": 1, "color": "#10B981", "order": 2}
    ]'::jsonb
),
(
    '프론트엔드 개발자 로드맵',
    'frontend',
    '6개월',
    'intermediate',
    'React, TypeScript를 활용한 프론트엔드 개발 학습 로드맵',
    '[
        {"title": "JavaScript ES6+ 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 1},
        {"title": "React 기초 학습", "category": "학습", "duration": "3주", "priority": "required", "order": 2},
        {"title": "TypeScript 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 3},
        {"title": "React 프로젝트", "category": "프로젝트", "duration": "4주", "priority": "required", "order": 4},
        {"title": "상태 관리 학습 (Redux)", "category": "학습", "duration": "2주", "priority": "preferred", "order": 5}
    ]'::jsonb,
    '[
        {"title": "코딩 연습", "category": "학습", "frequency": 5, "color": "#EF4444", "order": 1},
        {"title": "UI/UX 트렌드 조사", "category": "학습", "frequency": 2, "color": "#8B5CF6", "order": 2}
    ]'::jsonb
),
(
    '데이터 분석가 로드맵',
    'data',
    '4개월',
    'beginner',
    'Python, SQL, 데이터 시각화를 활용한 데이터 분석 학습 로드맵',
    '[
        {"title": "Python 기초 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 1},
        {"title": "SQL 기초 학습", "category": "학습", "duration": "2주", "priority": "required", "order": 2},
        {"title": "Pandas 데이터 분석", "category": "학습", "duration": "3주", "priority": "required", "order": 3},
        {"title": "데이터 시각화 (Matplotlib, Seaborn)", "category": "학습", "duration": "2주", "priority": "required", "order": 4},
        {"title": "실전 데이터 분석 프로젝트", "category": "프로젝트", "duration": "3주", "priority": "required", "order": 5}
    ]'::jsonb,
    '[
        {"title": "SQL 쿼리 연습", "category": "학습", "frequency": 4, "color": "#F59E0B", "order": 1},
        {"title": "데이터 분석 케이스 스터디", "category": "학습", "frequency": 2, "color": "#06B6D4", "order": 2}
    ]'::jsonb
);

COMMENT ON TABLE templates IS '로드맵 템플릿 - 재사용 가능한 학습 경로 템플릿';
COMMENT ON COLUMN templates.tasks IS '태스크 템플릿 (JSON 배열)';
COMMENT ON COLUMN templates.routines IS '루틴 템플릿 (JSON 배열)';
