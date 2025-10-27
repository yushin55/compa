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
