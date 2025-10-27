from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from models.schemas import JobPosting
from config.database import supabase

router = APIRouter(prefix="/job-postings", tags=["채용공고"])


@router.get("", response_model=List[JobPosting])
async def get_job_postings(
    is_active: Optional[bool] = Query(None),
    company: Optional[str] = Query(None)
):
    """채용 공고 목록 조회"""
    try:
        query = supabase.table("job_postings").select("*")
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
        
        if company is not None:
            query = query.eq("company", company)
        
        result = query.order("created_at", desc=True).execute()
        return result.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )


@router.get("/{id}", response_model=JobPosting)
async def get_job_posting(id: int):
    """채용 공고 상세 조회"""
    try:
        result = supabase.table("job_postings").select("*").eq("id", id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "채용 공고를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
