from fastapi import APIRouter, Header, HTTPException, status
from models.schemas import Goal, GoalCreate, GoalUpdate
from config.database import supabase
from utils.helpers import parse_json_field, serialize_json_field

from typing import List

router = APIRouter(prefix="/goals", tags=["목표"])


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


@router.get("/list", response_model=List[Goal])
async def get_all_goals(x_user_id: str = Header(...)):
    """사용자의 모든 목표 목록 조회"""
    try:
        result = supabase.table("goals").select("*").eq("user_id", x_user_id).order("created_at", desc=True).execute()
        
        goals = []
        for goal in (result.data or []):
            goal['requirements'] = parse_json_field(goal.get('requirements'))
            goal['preferred'] = parse_json_field(goal.get('preferred'))
            goals.append(goal)
        
        return goals
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/{goal_id}", response_model=Goal)
async def get_goal(goal_id: int, x_user_id: str = Header(...)):
    """특정 목표 상세 조회"""
    try:
        result = supabase.table("goals").select("*").eq("id", goal_id).eq("user_id", x_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        goal = result.data[0]
        goal['requirements'] = parse_json_field(goal.get('requirements'))
        goal['preferred'] = parse_json_field(goal.get('preferred'))
        
        return goal
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("", response_model=Goal)
async def get_current_goal(x_user_id: str = Header(...)):
    """현재 활성 목표 조회"""
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


@router.post("/from-job-posting/{job_posting_id}", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_goal_from_job_posting(job_posting_id: int, x_user_id: str = Header(...)):
    """채용 공고에서 목표 생성 (로드맵 자동 생성 포함)"""
    try:
        # 1. 채용 공고 조회
        job_posting = supabase.table("job_postings").select("*").eq("id", job_posting_id).execute()
        
        if not job_posting.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "채용 공고를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        job = job_posting.data[0]
        
        # 2. 기존 활성 목표 비활성화
        supabase.table("goals").update({"is_active": False}).eq("user_id", x_user_id).execute()
        
        # 3. requirements와 preferred를 문자열 배열로 변환
        requirements_list = []
        preferred_list = []
        
        if isinstance(job.get("requirements"), list):
            requirements_list = [req.get("description", "") for req in job["requirements"]]
        elif isinstance(job.get("requirements"), str):
            requirements_list = parse_json_field(job["requirements"])
            if isinstance(requirements_list, list) and len(requirements_list) > 0 and isinstance(requirements_list[0], dict):
                requirements_list = [req.get("description", "") for req in requirements_list]
        
        if isinstance(job.get("preferred"), list):
            preferred_list = [pref.get("description", "") for pref in job["preferred"]]
        elif isinstance(job.get("preferred"), str):
            preferred_list = parse_json_field(job["preferred"])
            if isinstance(preferred_list, list) and len(preferred_list) > 0 and isinstance(preferred_list[0], dict):
                preferred_list = [pref.get("description", "") for pref in preferred_list]
        
        # 4. 새 목표 생성
        goal_data = {
            "user_id": x_user_id,
            "job_title": job["title"],
            "company_name": job["company"],
            "location": job.get("location"),
            "experience_level": job.get("experience_level"),
            "requirements": serialize_json_field(requirements_list),
            "preferred": serialize_json_field(preferred_list),
            "is_active": True
        }
        
        result = supabase.table("goals").insert(goal_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "목표 생성에 실패했습니다", "code": "INTERNAL_SERVER_ERROR"}
            )
        
        goal_id = result.data[0]["id"]
        
        # 5. 자동으로 태스크(로드맵) 생성
        from datetime import date, timedelta
        
        # 기존 태스크의 최대 order_index 가져오기
        existing_tasks = supabase.table("tasks").select("order_index").eq("user_id", x_user_id).order("order_index", desc=True).limit(1).execute()
        max_order = existing_tasks.data[0]["order_index"] if existing_tasks.data else -1
        
        today = date.today()
        all_requirements = requirements_list + preferred_list
        
        for idx, requirement in enumerate(all_requirements):
            priority = "high" if idx < len(requirements_list) else "medium"
            due_date = today + timedelta(weeks=2 * (idx + 1))
            
            # 요구사항에 따라 태스크 제목 및 설명 생성
            task_title = f"{requirement} 준비"
            task_description = f"{requirement}를 달성하기 위한 학습 및 실습"
            
            # 키워드 기반 구체화
            if "React" in requirement or "Vue" in requirement:
                task_title = f"{requirement.split()[0]} 학습 및 프로젝트 개발"
                task_description = f"{requirement}를 충족하기 위한 실무 프로젝트 진행"
            elif "Java" in requirement or "Spring" in requirement:
                task_title = f"{requirement.split()[0]} 프레임워크 학습"
                task_description = f"{requirement} 기반 백엔드 애플리케이션 개발"
            elif "TypeScript" in requirement:
                task_title = "TypeScript 강의 수강 및 실습"
                task_description = "TypeScript 기초부터 고급 기능까지 학습"
            elif "Kotlin" in requirement or "Swift" in requirement:
                task_title = f"{requirement.split()[0]} 모바일 앱 개발"
                task_description = f"{requirement}를 활용한 개인 프로젝트 개발"
            elif "프로젝트" in requirement:
                task_title = "포트폴리오 프로젝트 개발"
                task_description = "실무 수준의 프로젝트를 기획하고 개발"
            
            task_data = {
                "user_id": x_user_id,
                "goal_id": goal_id,
                "title": task_title,
                "description": task_description,
                "due_date": str(due_date),
                "is_completed": False,
                "priority": priority,
                "order_index": max_order + idx + 1
            }
            
            supabase.table("tasks").insert(task_data).execute()
        
        # 6. 생성된 목표 반환
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


@router.post("", response_model=Goal, status_code=status.HTTP_201_CREATED)
async def create_goal(goal_data: GoalCreate, x_user_id: str = Header(...)):
    """목표 설정"""
    try:
        # 기존 활성 목표 비활성화
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
    """목표 삭제 (활성 목표)"""
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


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal_by_id(goal_id: int, x_user_id: str = Header(...)):
    """특정 목표 삭제"""
    try:
        existing = supabase.table("goals").select("id").eq("id", goal_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("goals").delete().eq("id", goal_id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/{goal_id}/delete", status_code=status.HTTP_204_NO_CONTENT)
async def delete_goal_by_id_post(goal_id: int, x_user_id: str = Header(...)):
    """특정 목표 삭제 (POST 방식 - 프론트엔드 호환)"""
    try:
        existing = supabase.table("goals").select("id").eq("id", goal_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("goals").delete().eq("id", goal_id).execute()
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
