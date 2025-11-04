from fastapi import APIRouter, Header, HTTPException
from config.database import supabase
from models.schemas import TagWithCount, TagExperience
from typing import List
from collections import Counter

router = APIRouter(
    prefix="/tags",
    tags=["tags"]
)


@router.get("", response_model=List[TagWithCount])
async def get_all_tags(x_user_id: str = Header(...)):
    """모든 태그 조회 (사용 빈도 포함)"""
    try:
        # 사용자의 모든 경험 조회
        response = supabase.table("experiences").select("tags").eq("user_id", x_user_id).execute()
        
        # 태그 빈도 계산
        tag_counter = Counter()
        for exp in response.data:
            if exp.get("tags"):
                tag_counter.update(exp["tags"])
        
        # 빈도순 정렬
        tags = [
            TagWithCount(
                name=tag,
                count=count,
                category=None  # 카테고리는 선택적으로 추가 가능
            )
            for tag, count in tag_counter.most_common()
        ]
        
        return tags
        
    except Exception as e:
        print(f"Error fetching tags: {e}")
        raise HTTPException(status_code=500, detail=f"태그 조회 실패: {str(e)}")


@router.get("/{tag_name}/experiences", response_model=List[TagExperience])
async def get_experiences_by_tag(tag_name: str, x_user_id: str = Header(...)):
    """특정 태그가 포함된 경험 조회"""
    try:
        # PostgreSQL의 배열 검색 기능 사용
        response = supabase.table("experiences").select("id, title, date_range, category").eq("user_id", x_user_id).execute()
        
        # 태그 필터링 (Python에서 처리)
        filtered_experiences = [
            TagExperience(
                id=exp["id"],
                title=exp["title"],
                date_range=exp["date_range"],
                category=exp["category"]
            )
            for exp in response.data
            if exp.get("tags") and tag_name in exp["tags"]
        ]
        
        return filtered_experiences
        
    except Exception as e:
        print(f"Error fetching experiences by tag: {e}")
        raise HTTPException(status_code=500, detail=f"태그별 경험 조회 실패: {str(e)}")
