from fastapi import APIRouter, Header, HTTPException, status
from models.schemas import User
from config.database import supabase

router = APIRouter(prefix="/users", tags=["사용자"])


@router.get("/me", response_model=User)
async def get_current_user(x_user_id: str = Header(...)):
    """내 정보 조회"""
    try:
        user = supabase.table("users").select("*").eq("user_id", x_user_id).execute()
        
        if not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "사용자를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        return user.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(x_user_id: str = Header(...)):
    """회원 탈퇴 (사용자 삭제)"""
    try:
        # 사용자 존재 여부 확인
        user = supabase.table("users").select("user_id").eq("user_id", x_user_id).execute()
        
        if not user.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "사용자를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        # 관련 데이터 삭제는 데이터베이스의 CASCADE 설정에 의해 자동 처리됨
        # 또는 명시적으로 삭제할 수도 있음:
        # supabase.table("tasks").delete().eq("user_id", x_user_id).execute()
        # supabase.table("goals").delete().eq("user_id", x_user_id).execute()
        # supabase.table("user_specs").delete().eq("user_id", x_user_id).execute()
        # ... (기타 관련 테이블)
        
        # 사용자 삭제
        supabase.table("users").delete().eq("user_id", x_user_id).execute()
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
