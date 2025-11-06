from fastapi import APIRouter, HTTPException, status, Query
from typing import List, Optional
from models.schemas import JobPosting
from config.database import supabase
import json

router = APIRouter(prefix="/job-postings", tags=["채용공고"])


def parse_job_requirements(data):
    """채용 공고 요구사항을 문자열 배열로 변환"""
    if isinstance(data, str):
        # JSON 문자열인 경우 파싱
        try:
            parsed = json.loads(data)
            if isinstance(parsed, list):
                return [
                    item['description'] if isinstance(item, dict) and 'description' in item else str(item)
                    for item in parsed
                ]
        except json.JSONDecodeError:
            return [data]
    elif isinstance(data, list):
        # 이미 배열인 경우
        return [
            item['description'] if isinstance(item, dict) and 'description' in item else str(item)
            for item in data
        ]
    return []


@router.get("", response_model=List[JobPosting])
async def get_job_postings(
    is_active: Optional[bool] = Query(None),
    company: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None)
):
    """채용 공고 목록 조회 (검색 기능 포함)"""
    try:
        query = supabase.table("job_postings").select("*")
        
        if is_active is not None:
            query = query.eq("is_active", is_active)
        
        if company is not None:
            query = query.eq("company", company)
        
        if experience_level is not None:
            query = query.eq("experience_level", experience_level)
        
        result = query.order("created_at", desc=True).execute()
        
        # 데이터 변환
        jobs = []
        for job in (result.data or []):
            job['requirements'] = parse_job_requirements(job.get('requirements'))
            job['preferred'] = parse_job_requirements(job.get('preferred'))
            
            # 키워드 필터링 (제목, 설명, 회사명에서 검색)
            if keyword:
                keyword_lower = keyword.lower()
                if not (
                    keyword_lower in job.get('title', '').lower() or
                    keyword_lower in job.get('description', '').lower() or
                    keyword_lower in job.get('company', '').lower() or
                    any(keyword_lower in req.lower() for req in job['requirements']) or
                    any(keyword_lower in pref.lower() for pref in job['preferred'])
                ):
                    continue
            
            jobs.append(job)
        
        return jobs
    
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
        
        job = result.data[0]
        job['requirements'] = parse_job_requirements(job.get('requirements'))
        job['preferred'] = parse_job_requirements(job.get('preferred'))
        
        return job
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": str(e), "code": "INTERNAL_SERVER_ERROR"}
        )
