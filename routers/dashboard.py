from fastapi import APIRouter, Header, HTTPException
from config.database import supabase
from models.schemas import DashboardStats, RecentActivity, UpcomingDeadline, WeeklyProgress
from datetime import datetime, date, timedelta
from typing import List

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(x_user_id: str = Header(...)):
    """
    대시보드 통계 조회
    - 총 경험 수
    - 완료된 작업 수
    - 활성 로드맵 수 (현재는 템플릿 기반 구현 예정)
    - 총 태그 수
    - 최근 활동
    - 다가오는 마감일
    - 주간 루틴 진행률
    """
    
    try:
        # 1. 총 경험 수
        experiences_response = supabase.table("experiences").select("id", count="exact").eq("user_id", x_user_id).execute()
        total_experiences = experiences_response.count or 0
        
        # 2. 완료된 작업 수
        tasks_response = supabase.table("tasks").select("id", count="exact").eq("user_id", x_user_id).eq("completed", True).execute()
        completed_tasks = tasks_response.count or 0
        
        # 3. 활성 로드맵 수 (임시로 0)
        active_roadmaps = 0
        
        # 4. 총 태그 수 (경험에서 추출)
        experiences_with_tags = supabase.table("experiences").select("tags").eq("user_id", x_user_id).execute()
        all_tags = set()
        for exp in experiences_with_tags.data:
            if exp.get("tags"):
                all_tags.update(exp["tags"])
        total_tags = len(all_tags)
        
        # 5. 최근 활동 (작업 완료 + 경험 추가)
        recent_activities: List[RecentActivity] = []
        
        # 최근 완료된 작업
        recent_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).eq("completed", True).order("completed_at", desc=True).limit(5).execute()
        for task in recent_tasks.data:
            if task.get("completed_at"):
                recent_activities.append(RecentActivity(
                    id=f"task_{task['id']}",
                    type="task_completed",
                    title=task["title"],
                    date=datetime.fromisoformat(task["completed_at"].replace('Z', '+00:00'))
                ))
        
        # 최근 추가된 경험
        recent_exp = supabase.table("experiences").select("*").eq("user_id", x_user_id).order("created_at", desc=True).limit(5).execute()
        for exp in recent_exp.data:
            recent_activities.append(RecentActivity(
                id=f"exp_{exp['id']}",
                type="reflection_added",
                title=exp["title"],
                date=datetime.fromisoformat(exp["created_at"].replace('Z', '+00:00'))
            ))
        
        # 날짜순 정렬 및 최대 10개
        recent_activities.sort(key=lambda x: x.date, reverse=True)
        recent_activities = recent_activities[:10]
        
        # 6. 다가오는 마감일
        today = date.today()
        upcoming_tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).eq("completed", False).gte("date", str(today)).order("date").limit(5).execute()
        
        upcoming_deadlines: List[UpcomingDeadline] = []
        for task in upcoming_tasks.data:
            task_date = date.fromisoformat(task["date"])
            days_left = (task_date - today).days
            upcoming_deadlines.append(UpcomingDeadline(
                task_id=task["id"],
                title=task["title"],
                due_date=task_date,
                days_left=days_left
            ))
        
        # 7. 주간 루틴 진행률
        # 이번 주 일요일 찾기
        today_weekday = today.weekday()
        days_since_sunday = (today_weekday + 1) % 7
        week_start = today - timedelta(days=days_since_sunday)
        
        routines_response = supabase.table("weekly_routines").select("*").eq("user_id", x_user_id).execute()
        
        routines_total = len(routines_response.data)
        routines_completed = 0
        
        for routine in routines_response.data:
            # 이번 주 완료 기록 확인
            completions = supabase.table("routine_completions").select("*").eq("routine_id", routine["id"]).gte("completion_date", str(week_start)).execute()
            
            completed_count = len(completions.data)
            if completed_count >= routine["frequency"]:
                routines_completed += 1
        
        completion_rate = routines_completed / routines_total if routines_total > 0 else 0
        
        weekly_progress = WeeklyProgress(
            routines_completed=routines_completed,
            routines_total=routines_total,
            completion_rate=round(completion_rate, 2)
        )
        
        return DashboardStats(
            total_experiences=total_experiences,
            completed_tasks=completed_tasks,
            active_roadmaps=active_roadmaps,
            total_tags=total_tags,
            recent_activities=recent_activities,
            upcoming_deadlines=upcoming_deadlines,
            weekly_progress=weekly_progress
        )
        
    except Exception as e:
        print(f"Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail=f"대시보드 통계 조회 실패: {str(e)}")
