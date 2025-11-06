from fastapi import APIRouter, Header, HTTPException, status
from config.database import supabase
from utils.helpers import parse_json_field

router = APIRouter(prefix="/progress", tags=["진행상황"])


@router.get("")
async def get_progress(x_user_id: str = Header(...)):
    """사용자 진행 상황 조회"""
    try:
        # 사용자 스펙 데이터 조회
        user_spec_res = supabase.table("user_specs").select("*").eq("user_id", x_user_id).execute()
        user_spec = user_spec_res.data[0] if user_spec_res.data else None
        
        education_res = supabase.table("educations").select("*").eq("user_id", x_user_id).execute()
        education = education_res.data[0] if education_res.data else None
        
        languages_res = supabase.table("languages").select("*").eq("user_id", x_user_id).execute()
        languages = languages_res.data or []
        
        certificates_res = supabase.table("certificates").select("*").eq("user_id", x_user_id).execute()
        certificates = certificates_res.data or []
        
        projects_res = supabase.table("projects").select("*").eq("user_id", x_user_id).execute()
        projects = projects_res.data or []
        
        activities_res = supabase.table("activities").select("*").eq("user_id", x_user_id).execute()
        activities = activities_res.data or []
        
        # 활성 목표 조회
        goal_res = supabase.table("goals").select("*").eq("user_id", x_user_id).eq("is_active", True).execute()
        goal = goal_res.data[0] if goal_res.data else None
        
        gap_analysis = []
        
        if goal:
            goal["requirements"] = parse_json_field(goal.get("requirements"))
            goal["preferred"] = parse_json_field(goal.get("preferred"))
            
            # 간단한 갭 분석
            requirements_analysis = []
            for req in goal["requirements"]:
                # 키워드 기반 매칭
                is_met = False
                gap_detail = "경험 부족"
                
                if "프로젝트" in req:
                    if len(projects) > 0:
                        is_met = True
                        gap_detail = f"프로젝트 경험 {len(projects)}개"
                elif "React" in req or "Vue" in req or "프론트엔드" in req:
                    if any(p.get("tech_stack") and ("React" in p.get("tech_stack") or "Vue" in p.get("tech_stack")) for p in projects):
                        is_met = True
                        gap_detail = "관련 프로젝트 경험 있음"
                elif "TypeScript" in req:
                    if any(p.get("tech_stack") and "TypeScript" in p.get("tech_stack") for p in projects):
                        is_met = True
                        gap_detail = "TypeScript 프로젝트 경험 있음"
                
                requirements_analysis.append({
                    "description": req,
                    "is_met": is_met,
                    "gap_detail": gap_detail
                })
            
            gap_analysis.append({
                "job_posting_id": goal.get("id"),
                "requirements": requirements_analysis
            })
        
        return {
            "user_spec": user_spec,
            "education": education,
            "languages": languages,
            "certificates": certificates,
            "projects": projects,
            "activities": activities,
            "gap_analysis": gap_analysis
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )
