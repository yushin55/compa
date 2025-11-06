"""
서버 시작 전 환경 체크 스크립트
"""
import os
import sys

def check_environment():
    """환경 설정 확인"""
    print("\n" + "="*60)
    print("스텝업(Step-Up) 환경 체크")
    print("="*60 + "\n")
    
    all_ok = True
    
    # 1. .env 파일 확인
    if os.path.exists('.env'):
        print("✓ .env 파일 존재")
        
        # 환경변수 확인
        from dotenv import load_dotenv
        load_dotenv()
        
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_KEY')
        
        if supabase_url and supabase_key:
            print(f"✓ SUPABASE_URL 설정됨: {supabase_url[:30]}...")
            print(f"✓ SUPABASE_KEY 설정됨: {supabase_key[:30]}...")
        else:
            print("✗ 환경변수가 제대로 설정되지 않았습니다.")
            all_ok = False
    else:
        print("✗ .env 파일이 없습니다.")
        all_ok = False
    
    # 2. requirements.txt 확인
    if os.path.exists('requirements.txt'):
        print("✓ requirements.txt 존재")
    else:
        print("✗ requirements.txt 파일이 없습니다.")
        all_ok = False
    
    # 3. 필수 패키지 확인
    required_packages = ['fastapi', 'uvicorn', 'supabase', 'pydantic']
    print("\n패키지 설치 확인:")
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} - 설치 필요")
            all_ok = False
    
    # 4. Supabase 연결 테스트
    print("\nSupabase 연결 테스트:")
    try:
        from config.database import supabase
        
        # 간단한 쿼리로 연결 테스트
        result = supabase.table('users').select("user_id").limit(1).execute()
        print("  ✓ Supabase 연결 성공")
        print("  ✓ users 테이블 존재")
        
    except Exception as e:
        error_msg = str(e)
        if "does not exist" in error_msg or "42P01" in error_msg:
            print("  ✗ 데이터베이스 테이블이 없습니다.")
            print("\n" + "="*60)
            print("❌ 데이터베이스 초기화 필요!")
            print("="*60)
            print("\n다음 단계를 따라주세요:")
            print("\n1. Supabase 대시보드 접속")
            print("   https://app.supabase.com")
            print("\n2. SQL Editor → New Query")
            print("\n3. migration.sql 파일 내용을 복사하여 붙여넣기")
            print("\n4. Run 버튼 클릭")
            print("\n자세한 내용은 SETUP.md 파일을 참조하세요.")
            print("="*60 + "\n")
            all_ok = False
        else:
            print(f"  ✗ Supabase 연결 실패: {error_msg}")
            all_ok = False
    
    print("\n" + "="*60)
    if all_ok:
        print("✓ 모든 환경 설정이 완료되었습니다!")
        print("  서버를 시작할 수 있습니다:")
        print("  uvicorn main:app --reload --port 8000")
    else:
        print("✗ 환경 설정에 문제가 있습니다.")
        print("  위의 오류를 해결한 후 다시 시도하세요.")
    print("="*60 + "\n")
    
    return all_ok

if __name__ == "__main__":
    check_environment()
