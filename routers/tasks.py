from fastapi import APIRouter, Header, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
from models.schemas import Task, TaskCreate, TaskUpdate, TaskAutoGenerate
from config.database import supabase
from utils.helpers import days_until

router = APIRouter(tags=["로드맵"])


@router.get("/tasks/today", response_model=List[Task])
async def get_today_tasks(x_user_id: str = Header(...)):
    """오늘의 할 일 조회"""
    try:
        from datetime import date
        today = date.today()
        tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).eq("due_date", str(today)).eq("is_completed", False).execute()
        return tasks.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/tasks", response_model=List[Task])
async def get_tasks(
    x_user_id: str = Header(...),
    is_completed: Optional[bool] = Query(None),
    due_date: Optional[date] = Query(None),
    priority: Optional[str] = Query(None)
):
    """업무 목록 조회"""
    try:
        query = supabase.table("tasks").select("*").eq("user_id", x_user_id)
        
        if is_completed is not None:
            query = query.eq("is_completed", is_completed)
        
        if due_date is not None:
            query = query.eq("due_date", str(due_date))
        
        if priority is not None:
            query = query.eq("priority", priority)
        
        result = query.order("order_index").execute()
        return result.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/tasks", response_model=Task, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, x_user_id: str = Header(...)):
    """업무 추가"""
    try:
        data = task_data.dict()
        data["user_id"] = x_user_id
        data["is_completed"] = False
        
        if data.get("due_date"):
            data["due_date"] = str(data["due_date"])
        
        result = supabase.table("tasks").insert(data).execute()
        return result.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.get("/tasks/{id}", response_model=Task)
async def get_task(id: int, x_user_id: str = Header(...)):
    """업무 상세 조회"""
    try:
        task = supabase.table("tasks").select("*").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not task.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "업무를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        return task.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.put("/tasks/{id}", response_model=Task)
async def update_task(id: int, task_data: TaskUpdate, x_user_id: str = Header(...)):
    """업무 수정"""
    try:
        update_data = {k: v for k, v in task_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        if "due_date" in update_data and update_data["due_date"]:
            update_data["due_date"] = str(update_data["due_date"])
        
        existing = supabase.table("tasks").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "업무를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("tasks").update(update_data).eq("id", id).execute()
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(id: int, x_user_id: str = Header(...)):
    """업무 삭제"""
    try:
        existing = supabase.table("tasks").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "업무를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("tasks").delete().eq("id", id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.patch("/tasks/{id}/complete", response_model=Task)
async def complete_task(id: int, x_user_id: str = Header(...)):
    """업무 완료 처리"""
    try:
        existing = supabase.table("tasks").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "업무를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("tasks").update({
            "is_completed": True,
            "completed_at": datetime.utcnow().isoformat()
        }).eq("id", id).execute()
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.patch("/tasks/{id}/incomplete", response_model=Task)
async def incomplete_task(id: int, x_user_id: str = Header(...)):
    """업무 미완료 처리"""
    try:
        existing = supabase.table("tasks").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "업무를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("tasks").update({
            "is_completed": False,
            "completed_at": None
        }).eq("id", id).execute()
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/roadmap/progress")
async def get_roadmap_progress(x_user_id: str = Header(...)):
    """로드맵 진행도 조회"""
    try:
        goal = supabase.table("goals").select("*").eq("user_id", x_user_id).eq("is_active", True).execute()
        goal_data = goal.data[0] if goal.data else None
        
        if goal_data:
            from utils.helpers import parse_json_field
            goal_data["requirements"] = parse_json_field(goal_data.get("requirements"))
            goal_data["preferred"] = parse_json_field(goal_data.get("preferred"))
        
        all_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).execute()
        tasks = all_tasks.data or []
        
        total_tasks = len(tasks)
        completed_tasks = len([t for t in tasks if t.get("is_completed")])
        
        progress_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        days_remaining = None
        if goal_data and goal_data.get("deadline"):
            days_remaining = days_until(goal_data["deadline"])
        
        today = date.today()
        today_tasks = [t for t in tasks if t.get("due_date") == str(today) and not t.get("is_completed")]
        
        return {
            "goal": goal_data,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress_percentage": round(progress_percentage, 2),
            "days_remaining": days_remaining,
            "today_tasks": today_tasks
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/tasks/auto-generate", status_code=status.HTTP_201_CREATED)
async def auto_generate_tasks(data: TaskAutoGenerate, x_user_id: str = Header(...)):
    """태스크 자동 생성 (AI 기반)"""
    try:
        # 기존 태스크 order_index 최대값 확인
        existing_tasks = supabase.table("tasks").select("order_index").eq("user_id", x_user_id).order("order_index", desc=True).limit(1).execute()
        max_order = existing_tasks.data[0]["order_index"] if existing_tasks.data else -1
        
        generated_tasks = []
        today = date.today()
        
        # requirements 배열을 기반으로 태스크 생성
        for idx, requirement in enumerate(data.requirements):
            priority = "high"  # 기본적으로 필수 요구사항은 high
            
            # 2주 간격으로 due_date 설정
            due_date = today + timedelta(weeks=2 * (idx + 1))
            
            # 요구사항에 따라 태스크 제목 및 설명 생성
            task_title = f"{requirement} 준비"
            task_description = f"{requirement}를 달성하기 위한 학습 및 실습"
            
            # 특정 키워드에 따라 더 구체적인 태스크 생성
            if "React" in requirement:
                task_title = "React 공식 문서 학습 및 프로젝트 개발"
                task_description = "React 공식 문서를 학습하고 개인 프로젝트를 진행합니다"
            elif "TypeScript" in requirement:
                task_title = "TypeScript 강의 수강 및 실습"
                task_description = "TypeScript 기초부터 고급 기능까지 학습합니다"
            elif "프로젝트" in requirement:
                task_title = "포트폴리오 프로젝트 개발"
                task_description = "실무 수준의 프로젝트를 기획하고 개발합니다"
            elif "TOEIC" in requirement or "토익" in requirement:
                task_title = "TOEIC 목표 점수 달성"
                task_description = "TOEIC 학습 및 모의고사 준비"
                priority = "medium"
            
            task_data = {
                "user_id": x_user_id,
                "goal_id": data.goal_id,
                "title": task_title,
                "description": task_description,
                "due_date": str(due_date),
                "is_completed": False,
                "priority": priority,
                "order_index": max_order + idx + 1
            }
            
            result = supabase.table("tasks").insert(task_data).execute()
            if result.data:
                generated_tasks.append(result.data[0])
        
        return {
            "message": f"{len(generated_tasks)}개의 태스크가 자동 생성되었습니다",
            "tasks": generated_tasks
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.patch("/tasks/batch-update", status_code=status.HTTP_200_OK)
async def batch_update_tasks(
    task_ids: List[int],
    update_data: TaskUpdate,
    x_user_id: str = Header(...)
):
    """여러 태스크를 한번에 업데이트"""
    try:
        if not task_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "업데이트할 태스크 ID가 없습니다", "code": "BAD_REQUEST"}
            )
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "업데이트할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        if "due_date" in update_dict and update_dict["due_date"]:
            update_dict["due_date"] = str(update_dict["due_date"])
        
        # 각 태스크를 개별적으로 업데이트 (사용자 권한 확인)
        updated_tasks = []
        for task_id in task_ids:
            # 태스크 소유권 확인
            task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", x_user_id).execute()
            
            if not task.data:
                continue  # 권한 없는 태스크는 스킵
            
            result = supabase.table("tasks").update(update_dict).eq("id", task_id).execute()
            if result.data:
                updated_tasks.extend(result.data)
        
        return {
            "message": f"{len(updated_tasks)}개의 태스크가 업데이트되었습니다",
            "updated_count": len(updated_tasks),
            "tasks": updated_tasks
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.patch("/tasks/batch-complete", status_code=status.HTTP_200_OK)
async def batch_complete_tasks(
    task_ids: List[int],
    x_user_id: str = Header(...)
):
    """여러 태스크를 한번에 완료 처리"""
    try:
        if not task_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "완료 처리할 태스크 ID가 없습니다", "code": "BAD_REQUEST"}
            )
        
        completed_tasks = []
        for task_id in task_ids:
            # 태스크 소유권 확인
            task = supabase.table("tasks").select("id").eq("id", task_id).eq("user_id", x_user_id).execute()
            
            if not task.data:
                continue
            
            result = supabase.table("tasks").update({
                "is_completed": True,
                "completed_at": datetime.utcnow().isoformat()
            }).eq("id", task_id).execute()
            
            if result.data:
                completed_tasks.extend(result.data)
        
        return {
            "message": f"{len(completed_tasks)}개의 태스크가 완료되었습니다",
            "completed_count": len(completed_tasks),
            "tasks": completed_tasks
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )
