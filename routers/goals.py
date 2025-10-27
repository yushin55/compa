from fastapi import APIRouter, Header, HTTPException, status
from models.schemas import Goal, GoalCreate, GoalUpdate
from config.database import supabase
from utils.helpers import parse_json_field, serialize_json_field

router = APIRouter(prefix="/goals", tags=["목표"])


@router.get("", response_model=Goal)
async def get_current_goal(x_user_id: str = Header(...)):
    """현재 목표 조회"""
    try:
        goal = supabase.table("goals").select("*").eq("user_id", x_user_id).eq("is_active", True).execute()
        
        if not goal.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "설정된 목표가 없습니다", "code": "NOT_FOUND"}
            )
        
        goal_data = goal.data[0]
        goal_data["requirements"] = parse_json_field(goal_data.get("requirements"))
        goal_data["preferred"] = parse_json_field(goal_data.get("preferred"))
        
        return goal_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_goal(goal_data: GoalCreate, x_user_id: str = Header(...)):
    """목표 설정"""
    try:
        supabase.table("goals").update({"is_active": False}).eq("user_id", x_user_id).execute()
        
        data = goal_data.dict()
        data["user_id"] = x_user_id
        data["is_active"] = True
        
        if data.get("deadline"):
            data["deadline"] = str(data["deadline"])
        
        data["requirements"] = serialize_json_field(data.get("requirements", []))
        data["preferred"] = serialize_json_field(data.get("preferred", []))
        
        result = supabase.table("goals").insert(data).execute()
        
        result_data = result.data[0]
        result_data["requirements"] = parse_json_field(result_data.get("requirements"))
        result_data["preferred"] = parse_json_field(result_data.get("preferred"))
        
        return result_data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.put("", response_model=Goal)
async def update_goal(goal_data: GoalUpdate, x_user_id: str = Header(...)):
    """목표 수정"""
    try:
        update_data = {k: v for k, v in goal_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        if "deadline" in update_data and update_data["deadline"]:
            update_data["deadline"] = str(update_data["deadline"])
        
        if "requirements" in update_data:
            update_data["requirements"] = serialize_json_field(update_data["requirements"])
        
        if "preferred" in update_data:
            update_data["preferred"] = serialize_json_field(update_data["preferred"])
        
        result = supabase.table("goals").update(update_data).eq("user_id", x_user_id).eq("is_active", True).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "활성화된 목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result_data = result.data[0]
        result_data["requirements"] = parse_json_field(result_data.get("requirements"))
        result_data["preferred"] = parse_json_field(result_data.get("preferred"))
        
        return result_data
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal(x_user_id: str = Header(...)):
    """목표 삭제"""
    try:
        existing = supabase.table("goals").select("id").eq("user_id", x_user_id).eq("is_active", True).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "활성화된 목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("goals").delete().eq("user_id", x_user_id).eq("is_active", True).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/gap-analysis")
async def get_gap_analysis(x_user_id: str = Header(...)):
    """목표와 현재 스펙 격차 분석"""
    try:
        goal = supabase.table("goals").select("*").eq("user_id", x_user_id).eq("is_active", True).execute()
        
        if not goal.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "설정된 목표가 없습니다", "code": "NOT_FOUND"}
            )
        
        goal_data = goal.data[0]
        goal_data["requirements"] = parse_json_field(goal_data.get("requirements"))
        goal_data["preferred"] = parse_json_field(goal_data.get("preferred"))
        
        languages = supabase.table("languages").select("*").eq("user_id", x_user_id).execute()
        certificates = supabase.table("certificates").select("*").eq("user_id", x_user_id).execute()
        projects = supabase.table("projects").select("*").eq("user_id", x_user_id).execute()
        activities = supabase.table("activities").select("*").eq("user_id", x_user_id).execute()
        
        requirements_met = []
        requirements_gap = []
        preferred_met = []
        preferred_gap = []
        suggested_tasks = []
        
        for req in goal_data["requirements"]:
            if "프로젝트" in req:
                if projects.data:
                    requirements_met.append({
                        "requirement": req,
                        "status": "met",
                        "user_value": f"프로젝트 경험 {len(projects.data)}회"
                    })
                else:
                    requirements_gap.append({
                        "requirement": req,
                        "status": "not_met",
                        "user_value": None
                    })
                    suggested_tasks.append(f"{req} 준비하기")
            else:
                requirements_gap.append({
                    "requirement": req,
                    "status": "not_met",
                    "user_value": None
                })
                suggested_tasks.append(f"{req} 달성하기")
        
        for pref in goal_data["preferred"]:
            if "TOEIC" in pref or "토익" in pref:
                if languages.data:
                    preferred_met.append({
                        "requirement": pref,
                        "status": "met",
                        "user_value": f"{languages.data[0].get('language_type')} {languages.data[0].get('score')}점"
                    })
                else:
                    preferred_gap.append({
                        "requirement": pref,
                        "status": "not_met",
                        "user_value": None
                    })
                    suggested_tasks.append(f"{pref} 준비하기")
            elif "자격증" in pref:
                if certificates.data:
                    preferred_met.append({
                        "requirement": pref,
                        "status": "met",
                        "user_value": f"{certificates.data[0].get('certificate_name')} 보유"
                    })
                else:
                    preferred_gap.append({
                        "requirement": pref,
                        "status": "not_met",
                        "user_value": None
                    })
                    suggested_tasks.append(f"{pref} 취득하기")
            else:
                preferred_gap.append({
                    "requirement": pref,
                    "status": "not_met",
                    "user_value": None
                })
        
        return {
            "goal": goal_data,
            "analysis": {
                "requirements_met": requirements_met,
                "requirements_gap": requirements_gap,
                "preferred_met": preferred_met,
                "preferred_gap": preferred_gap,
                "suggested_tasks": suggested_tasks
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )
