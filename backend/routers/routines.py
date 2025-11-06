from fastapi import APIRouter, Header, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date, timedelta
from models.schemas import (
    WeeklyRoutine, WeeklyRoutineCreate, WeeklyRoutineUpdate,
    RoutineCompleteRequest, WeeklyStatus, WeeklyStatsResponse,
    RoutineStats, WeeklyStatsSummary, CompletionWithDay, RoutineCompletion
)
from config.database import supabase

router = APIRouter(prefix="/routines", tags=["주간 루틴"])


def get_week_start(target_date: date = None) -> date:
    """일요일을 주 시작일로 계산"""
    if target_date is None:
        target_date = date.today()
    # 0=월요일, 6=일요일 (Python weekday)
    # 일요일을 0으로 만들기 위해 조정
    days_since_sunday = (target_date.weekday() + 1) % 7
    week_start = target_date - timedelta(days=days_since_sunday)
    return week_start


def get_week_end(week_start: date) -> date:
    """주 종료일 계산 (토요일)"""
    return week_start + timedelta(days=6)


def calculate_weekly_status(routine_id: int, frequency: int, completions: List[dict], week_start: date) -> WeeklyStatus:
    """주간 달성 상태 계산"""
    week_end = get_week_end(week_start)
    
    # 이번 주 완료 횟수
    completed_count = sum(
        1 for c in completions
        if week_start <= datetime.fromisoformat(str(c["completion_date"])).date() <= week_end
    )
    
    is_success = completed_count >= frequency
    progress = min(100.0, (completed_count / frequency) * 100) if frequency > 0 else 0.0
    
    return WeeklyStatus(
        routine_id=routine_id,
        week_start=week_start.isoformat(),
        week_end=week_end.isoformat(),
        target_count=frequency,
        completed_count=completed_count,
        is_success=is_success,
        progress=round(progress, 2)
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_routine(routine_data: WeeklyRoutineCreate, x_user_id: str = Header(...)):
    """루틴 생성"""
    try:
        data = routine_data.dict()
        data["user_id"] = x_user_id
        
        result = supabase.table("weekly_routines").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "루틴 생성에 실패했습니다", "code": "INTERNAL_SERVER_ERROR"}
            )
        
        return {
            "message": "루틴이 생성되었습니다",
            "data": result.data[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.get("", response_model=List[WeeklyRoutine])
async def get_routines(x_user_id: str = Header(...)):
    """루틴 목록 조회 (완료 기록 포함)"""
    try:
        # 루틴 조회
        routines_result = supabase.table("weekly_routines").select("*").eq("user_id", x_user_id).order("created_at", desc=True).execute()
        
        routines = []
        for routine in routines_result.data or []:
            # 각 루틴의 완료 기록 조회
            completions_result = supabase.table("routine_completions").select("id, routine_id, completion_date").eq("routine_id", routine["id"]).order("completion_date", desc=True).execute()
            
            routine["completions"] = [
                {
                    "id": c["id"],
                    "routine_id": c["routine_id"],
                    "completion_date": c["completion_date"]
                }
                for c in (completions_result.data or [])
            ]
            
            routines.append(routine)
        
        return routines
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/{routine_id}")
async def get_routine(routine_id: int, x_user_id: str = Header(...)):
    """특정 루틴 상세 조회"""
    try:
        result = supabase.table("weekly_routines").select("*").eq("id", routine_id).eq("user_id", x_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "루틴을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        routine = result.data[0]
        
        # 완료 기록 조회
        completions_result = supabase.table("routine_completions").select("id, routine_id, completion_date").eq("routine_id", routine_id).execute()
        
        routine["completions"] = completions_result.data or []
        
        return routine
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.put("/{routine_id}")
async def update_routine(routine_id: int, routine_data: WeeklyRoutineUpdate, x_user_id: str = Header(...)):
    """루틴 수정"""
    try:
        # 루틴 존재 여부 및 소유자 확인
        existing = supabase.table("weekly_routines").select("id").eq("id", routine_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "루틴을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        # 업데이트 데이터 준비
        update_data = {k: v for k, v in routine_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        result = supabase.table("weekly_routines").update(update_data).eq("id", routine_id).execute()
        
        return {
            "message": "루틴이 수정되었습니다",
            "data": result.data[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/{routine_id}")
async def delete_routine(routine_id: int, x_user_id: str = Header(...)):
    """루틴 삭제 (완료 기록도 자동 삭제)"""
    try:
        # 루틴 존재 여부 및 소유자 확인
        existing = supabase.table("weekly_routines").select("id").eq("id", routine_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "루틴을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("weekly_routines").delete().eq("id", routine_id).execute()
        
        return {"message": "루틴이 삭제되었습니다"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.post("/{routine_id}/complete", status_code=status.HTTP_201_CREATED)
async def complete_routine(
    routine_id: int,
    complete_data: Optional[RoutineCompleteRequest] = None,
    completion_date: Optional[str] = Query(None, description="완료 날짜 (YYYY-MM-DD)"),
    x_user_id: str = Header(...)
):
    """루틴 완료 처리 (드래그 앤 드롭 시 호출)"""
    try:
        # 루틴 존재 여부 및 소유자 확인
        routine_result = supabase.table("weekly_routines").select("*").eq("id", routine_id).eq("user_id", x_user_id).execute()
        
        if not routine_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "루틴을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        routine = routine_result.data[0]
        
        # 완료 날짜 결정 (우선순위: query param > body > 오늘)
        target_date = None
        if completion_date:  # Query 파라미터
            target_date = datetime.strptime(completion_date, "%Y-%m-%d").date()
        elif complete_data and complete_data.completion_date:  # Body
            target_date = complete_data.completion_date
        else:  # 기본값: 오늘
            target_date = date.today()
        
        # 완료 기록 추가
        completion_data_dict = {
            "routine_id": routine_id,
            "user_id": x_user_id,
            "completion_date": target_date.isoformat() if isinstance(target_date, date) else target_date
        }
        
        try:
            completion_result = supabase.table("routine_completions").insert(completion_data_dict).execute()
        except Exception as e:
            # 중복 완료 체크 (UNIQUE 제약 위반)
            if "duplicate" in str(e).lower() or "unique" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={"error": "이미 해당 날짜에 완료 처리되었습니다", "code": "DUPLICATE_COMPLETION"}
                )
            raise
        
        # 이번 주 완료 기록 조회
        week_start = get_week_start(target_date)
        week_end = get_week_end(week_start)
        
        completions_result = supabase.table("routine_completions").select("*").eq("routine_id", routine_id).gte("completion_date", week_start.isoformat()).lte("completion_date", week_end.isoformat()).execute()
        
        # 주간 달성 상태 계산
        weekly_status = calculate_weekly_status(
            routine_id=routine_id,
            frequency=routine["frequency"],
            completions=completions_result.data or [],
            week_start=week_start
        )
        
        return {
            "message": "루틴이 완료 처리되었습니다",
            "data": completion_result.data[0] if completion_result.data else None,
            "weekly_status": weekly_status.dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/{routine_id}/complete")
async def uncomplete_routine(
    routine_id: int,
    date: Optional[date] = Query(None, description="완료 취소할 날짜 (YYYY-MM-DD)"),
    completion_date: Optional[str] = Query(None, description="완료 취소할 날짜 (대체)"),
    x_user_id: str = Header(...)
):
    """루틴 완료 취소 - Query 파라미터로 날짜 전달"""
    try:
        # 날짜 결정 (date 또는 completion_date 파라미터 사용)
        target_date = None
        if date:
            target_date = date
        elif completion_date:
            target_date = datetime.strptime(completion_date, "%Y-%m-%d").date()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "날짜를 지정해야 합니다 (date 또는 completion_date)", "code": "DATE_REQUIRED"}
            )
        
        # 루틴 존재 여부 확인
        routine_result = supabase.table("weekly_routines").select("*").eq("id", routine_id).eq("user_id", x_user_id).execute()
        
        if not routine_result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "루틴을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        routine = routine_result.data[0]
        
        # 완료 기록 조회
        existing_completion = supabase.table("routine_completions").select("*").eq("routine_id", routine_id).eq("user_id", x_user_id).eq("completion_date", target_date.isoformat()).execute()
        
        if not existing_completion.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "해당 날짜의 완료 기록을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        # ID로 직접 삭제 (더 확실한 방법)
        completion_id = existing_completion.data[0]["id"]
        delete_result = supabase.table("routine_completions").delete().eq("id", completion_id).execute()
        
        if not delete_result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "삭제에 실패했습니다", "code": "DELETE_FAILED"}
            )
        
        # 이번 주 완료 기록 재조회
        week_start = get_week_start(target_date)
        week_end = get_week_end(week_start)
        
        completions_result = supabase.table("routine_completions").select("*").eq("routine_id", routine_id).gte("completion_date", week_start.isoformat()).lte("completion_date", week_end.isoformat()).execute()
        
        # 주간 달성 상태 재계산
        weekly_status = calculate_weekly_status(
            routine_id=routine_id,
            frequency=routine["frequency"],
            completions=completions_result.data or [],
            week_start=week_start
        )
        
        return {
            "message": "루틴 완료가 취소되었습니다",
            "deleted_completion_id": completion_id,
            "completion_date": target_date.isoformat(),
            "weekly_status": weekly_status.dict()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/weekly-stats", response_model=WeeklyStatsResponse)
async def get_weekly_stats(
    x_user_id: str = Header(...),
    week_start: Optional[date] = Query(None, description="주 시작일 (YYYY-MM-DD)")
):
    """주간 통계 조회"""
    try:
        # 주 시작일 계산
        if week_start is None:
            week_start = get_week_start()
        
        week_end = get_week_end(week_start)
        
        # 사용자의 모든 루틴 조회
        routines_result = supabase.table("weekly_routines").select("*").eq("user_id", x_user_id).execute()
        
        routines_stats = []
        total_completions = 0
        success_count = 0
        in_progress_count = 0
        
        for routine in routines_result.data or []:
            # 이번 주 완료 기록 조회
            completions_result = supabase.table("routine_completions").select("*").eq("routine_id", routine["id"]).gte("completion_date", week_start.isoformat()).lte("completion_date", week_end.isoformat()).order("completion_date").execute()
            
            completions = completions_result.data or []
            completed_count = len(completions)
            total_completions += completed_count
            
            is_success = completed_count >= routine["frequency"]
            progress = min(100.0, (completed_count / routine["frequency"]) * 100) if routine["frequency"] > 0 else 0.0
            
            if is_success:
                success_count += 1
            else:
                in_progress_count += 1
            
            # 완료 기록을 날짜와 요일로 변환
            completion_list = [
                CompletionWithDay(
                    date=c["completion_date"],
                    day_of_week=(datetime.fromisoformat(c["completion_date"]).weekday() + 1) % 7  # 일요일=0
                )
                for c in completions
            ]
            
            routines_stats.append(
                RoutineStats(
                    routine_id=routine["id"],
                    title=routine["title"],
                    frequency=routine["frequency"],
                    color=routine["color"],
                    completed_count=completed_count,
                    is_success=is_success,
                    progress=round(progress, 2),
                    completions=completion_list
                )
            )
        
        return WeeklyStatsResponse(
            week_start=week_start.isoformat(),
            week_end=week_end.isoformat(),
            routines=routines_stats,
            summary=WeeklyStatsSummary(
                total_routines=len(routines_result.data or []),
                success_count=success_count,
                in_progress_count=in_progress_count,
                total_completions=total_completions
            )
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
