"""
Supabase 데이터베이스 초기화 스크립트
테이블이 없으면 자동으로 생성합니다.
"""
from config.database import supabase

def check_and_create_tables():
    """데이터베이스 테이블 확인 및 생성"""
    
    print("데이터베이스 테이블 확인 중...")
    
    # SQL 쿼리 실행을 통한 테이블 생성
    sql_commands = [
        # users 테이블
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id VARCHAR(50) PRIMARY KEY,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        """,
        
        # user_specs 테이블
        """
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
        """,
        
        # educations 테이블
        """
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
        """,
        
        # languages 테이블
        """
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
        """,
        
        # certificates 테이블
        """
        CREATE TABLE IF NOT EXISTS certificates (
            id BIGSERIAL PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            certificate_name VARCHAR(200) NOT NULL,
            acquisition_date DATE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );
        """,
        
        # projects 테이블
        """
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
        """,
        
        # activities 테이블
        """
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
        """,
        
        # goals 테이블
        """
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
        """,
        
        # tasks 테이블
        """
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
        """
    ]
    
    for i, sql in enumerate(sql_commands, 1):
        try:
            result = supabase.rpc('exec_sql', {'query': sql}).execute()
            print(f"✓ SQL 명령 {i} 실행 성공")
        except Exception as e:
            print(f"✗ SQL 명령 {i} 실행 실패: {str(e)}")
            print(f"  참고: Supabase 대시보드에서 수동으로 migration.sql을 실행하세요.")
            return False
    
    print("\n✓ 모든 테이블이 준비되었습니다!")
    return True


if __name__ == "__main__":
    check_and_create_tables()
