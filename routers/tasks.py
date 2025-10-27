from fastapi import APIRouter, Header, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from models.schemas import Task, TaskCreate, TaskUpdate
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
