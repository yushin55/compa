from fastapi import APIRouter, Header, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from models.schemas import (
    Experience, ExperienceCreate, ExperienceUpdate,
    ExperienceStats, TagsResponse, TagInfo,
    CalendarResponse, CalendarActivity
)
from config.database import supabase

router = APIRouter(prefix="/experiences", tags=["경험 아카이빙"])


@router.post("", response_model=Experience, status_code=status.HTTP_201_CREATED)
async def create_experience(experience_data: ExperienceCreate, x_user_id: str = Header(...)):
    """경험(회고) 생성"""
    try:
        # 태스크 존재 여부 확인
        task = supabase.table("tasks").select("id, title, user_id").eq("id", experience_data.task_id).execute()
        
        if not task.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "태스크를 찾을 수 없습니다", "code": "TASK_NOT_FOUND"}
            )
        
        # 태스크 소유자 확인
        if task.data[0]["user_id"] != x_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "다른 사용자의 태스크입니다", "code": "FORBIDDEN"}
            )
        
        # 중복 경험 확인
        existing = supabase.table("experiences").select("id").eq("user_id", x_user_id).eq("task_id", experience_data.task_id).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"error": "해당 태스크에 대한 경험이 이미 존재합니다", "code": "EXPERIENCE_ALREADY_EXISTS"}
            )
        
        # URL 형식 검증
        for url in experience_data.related_resources:
            if not url.startswith(("http://", "https://")):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={"error": f"잘못된 URL 형식: {url}", "code": "INVALID_URL"}
                )
        
        # 경험 데이터 생성
        data = {
            "user_id": x_user_id,
            "task_id": experience_data.task_id,
            "title": experience_data.title,
            "category": experience_data.category,
            "completed_date": experience_data.completed_date.isoformat(),
            "learned": experience_data.reflection.learned,
            "challenges": experience_data.reflection.challenges,
            "solutions": experience_data.reflection.solutions,
            "improvements": experience_data.reflection.improvements,
            "tags": experience_data.tags,
            "related_resources": experience_data.related_resources
        }
        
        result = supabase.table("experiences").insert(data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={"error": "경험 생성에 실패했습니다", "code": "INTERNAL_SERVER_ERROR"}
            )
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.get("", response_model=dict)
async def get_experiences(
    x_user_id: str = Header(...),
    search: Optional[str] = Query(None, description="제목, 내용, 태그 검색"),
    tags: Optional[str] = Query(None, description="태그 필터 (쉼표로 구분)"),
    period: Optional[str] = Query(None, description="기간 필터 (all/week/month/quarter)"),
    start_date: Optional[datetime] = Query(None, description="시작 날짜"),
    end_date: Optional[datetime] = Query(None, description="종료 날짜"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """경험 목록 조회 (필터링 및 검색 지원)"""
    try:
        # 기본 쿼리
        query = supabase.table("experiences").select("*", count="exact").eq("user_id", x_user_id)
        
        # 기간 필터
        if period:
            now = datetime.utcnow()
            if period == "week":
                start_date = now - timedelta(weeks=1)
            elif period == "month":
                start_date = now - timedelta(days=30)
            elif period == "quarter":
                start_date = now - timedelta(days=90)
        
        if start_date:
            query = query.gte("completed_date", start_date.isoformat())
        
        if end_date:
            query = query.lte("completed_date", end_date.isoformat())
        
        # 태그 필터
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            query = query.contains("tags", tag_list)
        
        # 검색 (클라이언트 사이드 필터링)
        result = query.order("completed_date", desc=True).execute()
        
        experiences = result.data or []
        
        # 검색어 필터링
        if search:
            search_lower = search.lower()
            experiences = [
                exp for exp in experiences
                if search_lower in exp.get("title", "").lower()
                or search_lower in exp.get("learned", "").lower()
                or any(search_lower in tag.lower() for tag in exp.get("tags", []))
            ]
        
        # 페이지네이션
        total = len(experiences)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_data = experiences[start_idx:end_idx]
        
        return {
            "data": paginated_data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/{experience_id}", response_model=Experience)
async def get_experience(experience_id: str, x_user_id: str = Header(...)):
    """특정 경험 상세 조회"""
    try:
        result = supabase.table("experiences").select("*").eq("id", experience_id).eq("user_id", x_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "경험을 찾을 수 없습니다", "code": "EXPERIENCE_NOT_FOUND"}
            )
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.put("/{experience_id}", response_model=Experience)
async def update_experience(
    experience_id: str,
    experience_data: ExperienceUpdate,
    x_user_id: str = Header(...)
):
    """경험 수정"""
    try:
        # 경험 존재 여부 및 소유자 확인
        existing = supabase.table("experiences").select("id").eq("id", experience_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "경험을 찾을 수 없습니다", "code": "EXPERIENCE_NOT_FOUND"}
            )
        
        # 업데이트 데이터 준비
        update_data = {}
        
        if experience_data.reflection:
            update_data["learned"] = experience_data.reflection.learned
            update_data["challenges"] = experience_data.reflection.challenges
            update_data["solutions"] = experience_data.reflection.solutions
            update_data["improvements"] = experience_data.reflection.improvements
        
        if experience_data.tags is not None:
            update_data["tags"] = experience_data.tags
        
        if experience_data.related_resources is not None:
            # URL 형식 검증
            for url in experience_data.related_resources:
                if not url.startswith(("http://", "https://")):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail={"error": f"잘못된 URL 형식: {url}", "code": "INVALID_URL"}
                    )
            update_data["related_resources"] = experience_data.related_resources
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        result = supabase.table("experiences").update(update_data).eq("id", experience_id).execute()
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_experience(experience_id: str, x_user_id: str = Header(...)):
    """경험 삭제"""
    try:
        # 경험 존재 여부 및 소유자 확인
        existing = supabase.table("experiences").select("id").eq("id", experience_id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "경험을 찾을 수 없습니다", "code": "EXPERIENCE_NOT_FOUND"}
            )
        
        supabase.table("experiences").delete().eq("id", experience_id).execute()
        
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/stats/overview", response_model=ExperienceStats)
async def get_experience_stats(x_user_id: str = Header(...)):
    """경험 통계 조회"""
    try:
        # 모든 경험 조회
        result = supabase.table("experiences").select("*").eq("user_id", x_user_id).execute()
        experiences = result.data or []
        
        total_experiences = len(experiences)
        
        # 태그 통계
        all_tags = []
        for exp in experiences:
            all_tags.extend(exp.get("tags", []))
        
        total_tags = len(set(all_tags))
        
        # 이번 달 경험 수
        now = datetime.utcnow()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_count = sum(
            1 for exp in experiences
            if datetime.fromisoformat(exp["completed_date"].replace("Z", "+00:00")) >= month_start
        )
        
        # 평균 태그 수
        average_tags_per_experience = len(all_tags) / total_experiences if total_experiences > 0 else 0
        
        # 카테고리별 분포
        category_breakdown = {}
        for exp in experiences:
            category = exp.get("category", "기타")
            category_breakdown[category] = category_breakdown.get(category, 0) + 1
        
        # 최근 동향
        week_ago = now - timedelta(weeks=1)
        quarter_ago = now - timedelta(days=90)
        
        recent_trends = {
            "lastWeek": sum(
                1 for exp in experiences
                if datetime.fromisoformat(exp["completed_date"].replace("Z", "+00:00")) >= week_ago
            ),
            "lastMonth": monthly_count,
            "lastQuarter": sum(
                1 for exp in experiences
                if datetime.fromisoformat(exp["completed_date"].replace("Z", "+00:00")) >= quarter_ago
            )
        }
        
        return {
            "total_experiences": total_experiences,
            "total_tags": total_tags,
            "monthly_count": monthly_count,
            "average_tags_per_experience": round(average_tags_per_experience, 2),
            "category_breakdown": category_breakdown,
            "recent_trends": recent_trends
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/tags/list", response_model=TagsResponse)
async def get_tags(x_user_id: str = Header(...)):
    """태그 목록 및 빈도수 조회"""
    try:
        result = supabase.table("experiences").select("tags, completed_date").eq("user_id", x_user_id).execute()
        experiences = result.data or []
        
        # 태그별 통계
        tag_stats = {}
        for exp in experiences:
            completed_date = datetime.fromisoformat(exp["completed_date"].replace("Z", "+00:00"))
            for tag in exp.get("tags", []):
                if tag not in tag_stats:
                    tag_stats[tag] = {"count": 0, "last_used": completed_date}
                else:
                    tag_stats[tag]["count"] += 1
                    if completed_date > tag_stats[tag]["last_used"]:
                        tag_stats[tag]["last_used"] = completed_date
        
        # 정렬 (빈도순)
        tags = [
            {
                "name": tag,
                "count": stats["count"],
                "last_used": stats["last_used"]
            }
            for tag, stats in sorted(tag_stats.items(), key=lambda x: x[1]["count"], reverse=True)
        ]
        
        return {
            "tags": tags,
            "total_unique_tags": len(tags)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/calendar/activity", response_model=CalendarResponse)
async def get_calendar_activity(
    x_user_id: str = Header(...),
    weeks: int = Query(12, ge=1, le=52, description="조회할 주 수")
):
    """활동 캘린더 데이터 (GitHub 잔디 스타일)"""
    try:
        # 날짜 범위 계산
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(weeks=weeks)
        
        # 경험 조회
        result = supabase.table("experiences").select("id, title, completed_date").eq("user_id", x_user_id).gte("completed_date", start_date.isoformat()).execute()
        experiences = result.data or []
        
        # 날짜별 그룹화
        date_map = {}
        for exp in experiences:
            exp_date = datetime.fromisoformat(exp["completed_date"].replace("Z", "+00:00")).date().isoformat()
            if exp_date not in date_map:
                date_map[exp_date] = []
            date_map[exp_date].append({
                "id": exp["id"],
                "title": exp["title"]
            })
        
        # 활동 데이터 생성
        activities = [
            {
                "date": date,
                "count": len(exps),
                "experiences": exps
            }
            for date, exps in sorted(date_map.items())
        ]
        
        # 통계
        total_days_active = len(date_map)
        max_count_per_day = max((len(exps) for exps in date_map.values()), default=0)
        
        return {
            "activities": activities,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "total_days_active": total_days_active,
            "max_count_per_day": max_count_per_day
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
