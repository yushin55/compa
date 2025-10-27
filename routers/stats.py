from fastapi import APIRouter, Header, HTTPException, status
from typing import Dict, List
from datetime import datetime, date, timedelta
from config.database import supabase
from utils.helpers import parse_json_field

router = APIRouter(prefix="/stats", tags=["통계"])


@router.get("/dashboard")
async def get_dashboard_stats(x_user_id: str = Header(...)):
    """대시보드용 전체 통계"""
    try:
        # 목표 통계
        all_goals = supabase.table("goals").select("*").eq("user_id", x_user_id).execute()
        goals = all_goals.data or []
        active_goal = next((g for g in goals if g.get("is_active")), None)
        
        # 태스크 통계
        all_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).execute()
        tasks = all_tasks.data or []
        
        # 완료된 태스크 통계
        completed_tasks = [t for t in tasks if t.get("is_completed")]
        pending_tasks = [t for t in tasks if not t.get("is_completed")]
        
        # 우선순위별 통계
        high_priority_tasks = [t for t in pending_tasks if t.get("priority") == "high"]
        medium_priority_tasks = [t for t in pending_tasks if t.get("priority") == "medium"]
        low_priority_tasks = [t for t in pending_tasks if t.get("priority") == "low"]
        
        # 오늘 할 일
        today = str(date.today())
        today_tasks = [t for t in pending_tasks if t.get("due_date") == today]
        
        # 이번 주 할 일
        week_end = date.today() + timedelta(days=7)
        this_week_tasks = [
            t for t in pending_tasks 
            if t.get("due_date") and date.fromisoformat(t["due_date"]) <= week_end
        ]
        
        # 지연된 태스크
        overdue_tasks = [
            t for t in pending_tasks 
            if t.get("due_date") and date.fromisoformat(t["due_date"]) < date.today()
        ]
        
        # 완료율
        completion_rate = (len(completed_tasks) / len(tasks) * 100) if tasks else 0
        
        # 최근 7일간 활동
        recent_activities = []
        for i in range(7):
            day = date.today() - timedelta(days=i)
            day_completed = len([
                t for t in completed_tasks 
                if t.get("completed_at") and t["completed_at"].startswith(str(day))
            ])
            recent_activities.append({
                "date": str(day),
                "completed_tasks": day_completed
            })
        
        return {
            "user_id": x_user_id,
            "summary": {
                "total_goals": len(goals),
                "active_goal": active_goal,
                "total_tasks": len(tasks),
                "completed_tasks": len(completed_tasks),
                "pending_tasks": len(pending_tasks),
                "completion_rate": round(completion_rate, 2)
            },
            "tasks_by_priority": {
                "high": len(high_priority_tasks),
                "medium": len(medium_priority_tasks),
                "low": len(low_priority_tasks)
            },
            "upcoming": {
                "today": len(today_tasks),
                "this_week": len(this_week_tasks),
                "overdue": len(overdue_tasks)
            },
            "recent_activity": recent_activities
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/weekly")
async def get_weekly_stats(x_user_id: str = Header(...)):
    """주간 통계"""
    try:
        # 이번 주의 시작과 끝
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        
        # 이번 주의 태스크
        all_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).execute()
        tasks = all_tasks.data or []
        
        week_tasks = [
            t for t in tasks
            if t.get("due_date") and 
            week_start <= date.fromisoformat(t["due_date"]) <= week_end
        ]
        
        # 요일별 통계
        daily_stats = []
        for i in range(7):
            day = week_start + timedelta(days=i)
            day_str = str(day)
            
            day_tasks = [t for t in week_tasks if t.get("due_date") == day_str]
            completed = [t for t in day_tasks if t.get("is_completed")]
            
            daily_stats.append({
                "date": day_str,
                "day_of_week": ["월", "화", "수", "목", "금", "토", "일"][i],
                "total_tasks": len(day_tasks),
                "completed_tasks": len(completed),
                "completion_rate": (len(completed) / len(day_tasks) * 100) if day_tasks else 0
            })
        
        # 이번 주 전체 완료율
        week_completed = [t for t in week_tasks if t.get("is_completed")]
        week_completion_rate = (len(week_completed) / len(week_tasks) * 100) if week_tasks else 0
        
        return {
            "week_start": str(week_start),
            "week_end": str(week_end),
            "summary": {
                "total_tasks": len(week_tasks),
                "completed_tasks": len(week_completed),
                "completion_rate": round(week_completion_rate, 2)
            },
            "daily_breakdown": daily_stats
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/monthly")
async def get_monthly_stats(x_user_id: str = Header(...)):
    """월간 통계"""
    try:
        # 이번 달의 시작과 끝
        today = date.today()
        month_start = today.replace(day=1)
        
        # 다음 달의 첫날 - 1일 = 이번 달 마지막 날
        if today.month == 12:
            month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
        
        # 이번 달의 태스크
        all_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).execute()
        tasks = all_tasks.data or []
        
        month_tasks = [
            t for t in tasks
            if t.get("due_date") and 
            month_start <= date.fromisoformat(t["due_date"]) <= month_end
        ]
        
        # 주별 통계
        weekly_stats = []
        current_week_start = month_start
        week_number = 1
        
        while current_week_start <= month_end:
            week_end_date = min(current_week_start + timedelta(days=6), month_end)
            
            week_tasks = [
                t for t in month_tasks
                if t.get("due_date") and
                current_week_start <= date.fromisoformat(t["due_date"]) <= week_end_date
            ]
            
            completed = [t for t in week_tasks if t.get("is_completed")]
            
            weekly_stats.append({
                "week": week_number,
                "start_date": str(current_week_start),
                "end_date": str(week_end_date),
                "total_tasks": len(week_tasks),
                "completed_tasks": len(completed),
                "completion_rate": (len(completed) / len(week_tasks) * 100) if week_tasks else 0
            })
            
            current_week_start += timedelta(days=7)
            week_number += 1
        
        # 이번 달 전체 완료율
        month_completed = [t for t in month_tasks if t.get("is_completed")]
        month_completion_rate = (len(month_completed) / len(month_tasks) * 100) if month_tasks else 0
        
        return {
            "month": f"{today.year}-{today.month:02d}",
            "month_start": str(month_start),
            "month_end": str(month_end),
            "summary": {
                "total_tasks": len(month_tasks),
                "completed_tasks": len(month_completed),
                "completion_rate": round(month_completion_rate, 2)
            },
            "weekly_breakdown": weekly_stats
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/goal/{goal_id}")
async def get_goal_stats(goal_id: int, x_user_id: str = Header(...)):
    """특정 목표의 상세 통계"""
    try:
        # 목표 정보
        goal_result = supabase.table("goals").select("*").eq("id", goal_id).eq("user_id", x_user_id).execute()
        
        if not goal_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "목표를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        goal = goal_result.data[0]
        goal["requirements"] = parse_json_field(goal.get("requirements"))
        goal["preferred"] = parse_json_field(goal.get("preferred"))
        
        # 목표에 연결된 태스크
        tasks_result = supabase.table("tasks").select("*").eq("goal_id", goal_id).execute()
        tasks = tasks_result.data or []
        
        # 태스크 통계
        total_tasks = len(tasks)
        completed_tasks = [t for t in tasks if t.get("is_completed")]
        pending_tasks = [t for t in tasks if not t.get("is_completed")]
        
        # 우선순위별
        high_priority = [t for t in tasks if t.get("priority") == "high"]
        medium_priority = [t for t in tasks if t.get("priority") == "medium"]
        low_priority = [t for t in tasks if t.get("priority") == "low"]
        
        # 완료율
        completion_rate = (len(completed_tasks) / total_tasks * 100) if total_tasks else 0
        
        # 남은 기간 계산
        days_remaining = None
        if goal.get("deadline"):
            deadline_date = date.fromisoformat(goal["deadline"])
            days_remaining = (deadline_date - date.today()).days
        
        return {
            "goal": goal,
            "statistics": {
                "total_tasks": total_tasks,
                "completed_tasks": len(completed_tasks),
                "pending_tasks": len(pending_tasks),
                "completion_rate": round(completion_rate, 2),
                "days_remaining": days_remaining
            },
            "tasks_by_priority": {
                "high": {
                    "total": len(high_priority),
                    "completed": len([t for t in high_priority if t.get("is_completed")])
                },
                "medium": {
                    "total": len(medium_priority),
                    "completed": len([t for t in medium_priority if t.get("is_completed")])
                },
                "low": {
                    "total": len(low_priority),
                    "completed": len([t for t in low_priority if t.get("is_completed")])
                }
            },
            "requirements_progress": {
                "total_requirements": len(goal.get("requirements", [])),
                "total_preferred": len(goal.get("preferred", []))
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
