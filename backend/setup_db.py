"""
Supabase 데이터베이스에 직접 SQL을 실행하여 테이블을 생성하는 스크립트
"""
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Supabase REST API를 통해 직접 SQL 실행
import requests

def execute_migration():
    """migration.sql 파일을 읽어서 Supabase에서 실행"""
    
    print("\n" + "="*60)
    print("Supabase 데이터베이스 마이그레이션")
    print("="*60 + "\n")
    
    # migration.sql 파일 읽기
    try:
        with open('migration.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except FileNotFoundError:
        print("❌ migration.sql 파일을 찾을 수 없습니다.")
        return False
    
    print("📋 migration.sql 파일을 읽었습니다.")
    print("\n⚠️  참고: Supabase Python 클라이언트는 직접 SQL 실행을 지원하지 않습니다.")
    print("         다음 방법 중 하나를 사용하세요:\n")
    
    print("방법 1: Supabase Dashboard 사용 (권장)")
    print("-" * 60)
    print("1. https://app.supabase.com 접속")
    print("2. 프로젝트 선택")
    print("3. SQL Editor → New Query")
    print("4. migration.sql 내용 복사 & 붙여넣기")
    print("5. Run 버튼 클릭\n")
    
    print("방법 2: psql 사용 (고급)")
    print("-" * 60)
    print("1. Supabase Dashboard → Settings → Database")
    print("2. Connection string 복사")
    print("3. psql을 사용하여 연결")
    print("4. \\i migration.sql 실행\n")
    
    print("방법 3: 수동 복사")
    print("-" * 60)
    print("migration.sql 파일의 내용:")
    print("=" * 60)
    print(sql_content)
    print("=" * 60)
    
    return True

if __name__ == "__main__":
    execute_migration()
