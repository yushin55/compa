from fastapi import APIRouter, Header, HTTPException, status
from passlib.hash import bcrypt
from models.schemas import UserRegister, UserLogin
from config.database import supabase

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """회원가입"""
    try:
        existing_user = supabase.table("users").select("*").eq("user_id", user_data.user_id).execute()
        if existing_user.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "이미 존재하는 아이디입니다", "code": "DUPLICATE_USER_ID"}
            )
        
        # email 중복 체크 제거 (email 컬럼이 없음)
        
        hashed_password = bcrypt.hash(user_data.password)
        
        new_user = supabase.table("users").insert({
            "user_id": user_data.user_id,
            "password": hashed_password
        }).execute()
        
        supabase.table("user_specs").insert({
            "user_id": user_data.user_id,
            "onboarding_completed": False
        }).execute()
        
        return {
            "message": "회원가입이 완료되었습니다",
            "user_id": user_data.user_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.post("/login")
async def login(credentials: UserLogin):
    """로그인"""
    try:
        user = supabase.table("users").select("*").eq("user_id", credentials.user_id).execute()
        
        if not user.data or not bcrypt.verify(credentials.password, user.data[0]["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": "아이디 또는 비밀번호가 올바르지 않습니다", "code": "UNAUTHORIZED"}
            )
        
        user_spec = supabase.table("user_specs").select("onboarding_completed").eq("user_id", credentials.user_id).execute()
        onboarding_completed = user_spec.data[0]["onboarding_completed"] if user_spec.data else False
        
        return {
            "message": "로그인 성공",
            "user_id": credentials.user_id,
            "onboarding_completed": onboarding_completed
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )
