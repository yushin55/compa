"""
Supabase 데이터베이스 스키마 확인
"""
from config.database import supabase

def check_schema():
    """현재 데이터베이스 스키마 확인"""
    
    print("\n" + "="*60)
    print("Supabase 데이터베이스 스키마 확인")
    print("="*60 + "\n")
    
    # users 테이블 확인
    try:
        result = supabase.table('users').select("*").limit(1).execute()
        print("✓ users 테이블 존재")
        
        if result.data:
            print(f"  컬럼: {list(result.data[0].keys())}")
        else:
            # 빈 테이블이므로 삽입을 시도하여 컬럼 확인
            print("  테이블이 비어있습니다.")
            print("  회원가입을 통해 컬럼을 확인할 수 있습니다.")
            
    except Exception as e:
        print(f"✗ users 테이블 오류: {str(e)}")
    
    # 다른 테이블들도 확인
    tables = ['user_specs', 'educations', 'languages', 'certificates', 
              'projects', 'activities', 'goals', 'tasks']
    
    for table in tables:
        try:
            result = supabase.table(table).select("*").limit(1).execute()
            print(f"✓ {table} 테이블 존재")
            if result.data:
                print(f"  컬럼: {list(result.data[0].keys())}")
        except Exception as e:
            error_msg = str(e)
            if "does not exist" in error_msg:
                print(f"✗ {table} 테이블 없음")
            else:
                print(f"✗ {table} 오류: {error_msg}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    check_schema()
