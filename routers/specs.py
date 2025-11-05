from fastapi import APIRouter, Header, HTTPException, status
from typing import List, Optional
from models.schemas import (
    UserSpec, UserSpecUpdate, Education, EducationUpdate,
    Language, LanguageCreate, LanguageUpdate, Certificate, CertificateCreate, CertificateUpdate,
    Project, ProjectCreate, ProjectUpdate,
    Activity, ActivityCreate, ActivityUpdate,
    DashboardData
)
from config.database import supabase
from utils.helpers import calculate_radar_scores

router = APIRouter(prefix="/specs", tags=["스펙"])


@router.get("", response_model=UserSpec)
async def get_user_spec(x_user_id: str = Header(...)):
    """사용자 스펙 정보 조회"""
    try:
        spec = supabase.table("user_specs").select("*").eq("user_id", x_user_id).execute()
        
        if not spec.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "스펙 정보를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        return spec.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.put("", response_model=UserSpec)
async def update_user_spec(spec_data: UserSpecUpdate, x_user_id: str = Header(...)):
    """사용자 스펙 정보 수정"""
    try:
        update_data = {k: v for k, v in spec_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        result = supabase.table("user_specs").update(update_data).eq("user_id", x_user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "스펙 정보를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        # 요구사항에 맞는 응답 형식
        return {
            "message": "사용자 스펙이 업데이트되었습니다",
            "data": result.data[0]
        } if False else result.data[0]  # 현재는 기존 형식 유지
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.get("/education", response_model=Education)
async def get_education(x_user_id: str = Header(...)):
    """학력 정보 조회"""
    try:
        education = supabase.table("educations").select("*").eq("user_id", x_user_id).execute()
        
        if not education.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "학력 정보를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        return education.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.put("/education", response_model=Education)
async def update_education(edu_data: EducationUpdate, x_user_id: str = Header(...)):
    """학력 정보 수정"""
    try:
        update_data = {k: v for k, v in edu_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        existing = supabase.table("educations").select("id").eq("user_id", x_user_id).execute()
        
        if existing.data:
            result = supabase.table("educations").update(update_data).eq("user_id", x_user_id).execute()
        else:
            update_data["user_id"] = x_user_id
            result = supabase.table("educations").insert(update_data).execute()
        
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.get("/languages", response_model=List[Language])
async def get_languages(x_user_id: str = Header(...)):
    """어학 성적 목록 조회"""
    try:
        languages = supabase.table("languages").select("*").eq("user_id", x_user_id).execute()
        return languages.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/languages", response_model=Language, status_code=status.HTTP_201_CREATED)
async def create_language(lang_data: LanguageCreate, x_user_id: str = Header(...)):
    """어학 성적 추가"""
    try:
        data = lang_data.dict()
        data["user_id"] = x_user_id
        
        if data.get("acquisition_date"):
            data["acquisition_date"] = str(data["acquisition_date"])
        
        result = supabase.table("languages").insert(data).execute()
        return result.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.put("/languages/{id}", response_model=Language)
async def update_language(id: int, lang_data: LanguageUpdate, x_user_id: str = Header(...)):
    """어학 성적 수정"""
    try:
        update_data = {k: v for k, v in lang_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        if "acquisition_date" in update_data and update_data["acquisition_date"]:
            update_data["acquisition_date"] = str(update_data["acquisition_date"])
        
        existing = supabase.table("languages").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "어학 성적을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("languages").update(update_data).eq("id", id).execute()
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/languages/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_language(id: int, x_user_id: str = Header(...)):
    """어학 성적 삭제"""
    try:
        existing = supabase.table("languages").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "어학 성적을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("languages").delete().eq("id", id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/certificates", response_model=List[Certificate])
async def get_certificates(x_user_id: str = Header(...)):
    """자격증 목록 조회"""
    try:
        certificates = supabase.table("certificates").select("*").eq("user_id", x_user_id).execute()
        return certificates.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/certificates", response_model=Certificate, status_code=status.HTTP_201_CREATED)
async def create_certificate(cert_data: CertificateCreate, x_user_id: str = Header(...)):
    """자격증 추가"""
    try:
        data = cert_data.dict()
        data["user_id"] = x_user_id
        
        if data.get("acquisition_date"):
            data["acquisition_date"] = str(data["acquisition_date"])
        
        result = supabase.table("certificates").insert(data).execute()
        return result.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.put("/certificates/{id}", response_model=Certificate)
async def update_certificate(id: int, cert_data: CertificateUpdate, x_user_id: str = Header(...)):
    """자격증 수정"""
    try:
        update_data = {k: v for k, v in cert_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        if "acquisition_date" in update_data and update_data["acquisition_date"]:
            update_data["acquisition_date"] = str(update_data["acquisition_date"])
        
        existing = supabase.table("certificates").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "자격증을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("certificates").update(update_data).eq("id", id).execute()
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/certificates/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(id: int, x_user_id: str = Header(...)):
    """자격증 삭제"""
    try:
        existing = supabase.table("certificates").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "자격증을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("certificates").delete().eq("id", id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/projects", response_model=List[Project])
async def get_projects(x_user_id: str = Header(...)):
    """프로젝트 목록 조회"""
    try:
        projects = supabase.table("projects").select("*").eq("user_id", x_user_id).execute()
        return projects.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/projects", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(proj_data: ProjectCreate, x_user_id: str = Header(...)):
    """프로젝트 추가"""
    try:
        data = proj_data.dict()
        data["user_id"] = x_user_id
        
        result = supabase.table("projects").insert(data).execute()
        return result.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.put("/projects/{id}", response_model=Project)
async def update_project(id: int, proj_data: ProjectUpdate, x_user_id: str = Header(...)):
    """프로젝트 수정"""
    try:
        update_data = {k: v for k, v in proj_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        existing = supabase.table("projects").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "프로젝트를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("projects").update(update_data).eq("id", id).execute()
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/projects/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(id: int, x_user_id: str = Header(...)):
    """프로젝트 삭제"""
    try:
        existing = supabase.table("projects").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "프로젝트를 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("projects").delete().eq("id", id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/activities", response_model=List[Activity])
async def get_activities(x_user_id: str = Header(...)):
    """대외활동 목록 조회"""
    try:
        activities = supabase.table("activities").select("*").eq("user_id", x_user_id).execute()
        return activities.data or []
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.post("/activities", response_model=Activity, status_code=status.HTTP_201_CREATED)
async def create_activity(act_data: ActivityCreate, x_user_id: str = Header(...)):
    """대외활동 추가"""
    try:
        data = act_data.dict()
        data["user_id"] = x_user_id
        
        result = supabase.table("activities").insert(data).execute()
        return result.data[0]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.put("/activities/{id}", response_model=Activity)
async def update_activity(id: int, act_data: ActivityUpdate, x_user_id: str = Header(...)):
    """대외활동 수정"""
    try:
        update_data = {k: v for k, v in act_data.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "수정할 데이터가 없습니다", "code": "BAD_REQUEST"}
            )
        
        existing = supabase.table("activities").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "대외활동을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        result = supabase.table("activities").update(update_data).eq("id", id).execute()
        return result.data[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": str(e), "code": "BAD_REQUEST"}
        )


@router.delete("/activities/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(id: int, x_user_id: str = Header(...)):
    """대외활동 삭제"""
    try:
        existing = supabase.table("activities").select("id").eq("id", id).eq("user_id", x_user_id).execute()
        
        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"error": "대외활동을 찾을 수 없습니다", "code": "NOT_FOUND"}
            )
        
        supabase.table("activities").delete().eq("id", id).execute()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )


@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard(x_user_id: str = Header(...)):
    """스펙 대시보드 데이터 조회"""
    try:
        user_spec_res = supabase.table("user_specs").select("*").eq("user_id", x_user_id).execute()
        user_spec = user_spec_res.data[0] if user_spec_res.data else None
        
        education_res = supabase.table("educations").select("*").eq("user_id", x_user_id).execute()
        education = education_res.data[0] if education_res.data else None
        
        languages_res = supabase.table("languages").select("*").eq("user_id", x_user_id).execute()
        languages = languages_res.data or []
        
        certificates_res = supabase.table("certificates").select("*").eq("user_id", x_user_id).execute()
        certificates = certificates_res.data or []
        
        projects_res = supabase.table("projects").select("*").eq("user_id", x_user_id).execute()
        projects = projects_res.data or []
        
        activities_res = supabase.table("activities").select("*").eq("user_id", x_user_id).execute()
        activities = activities_res.data or []
        
        stats = {
            "language_count": len(languages),
            "certificate_count": len(certificates),
            "project_count": len(projects),
            "activity_count": len(activities)
        }
        
        radar_scores = calculate_radar_scores(education, languages, certificates, projects, activities)
        
        return {
            "user_spec": user_spec,
            "education": education,
            "languages": languages,
            "certificates": certificates,
            "projects": projects,
            "activities": activities,
            "stats": stats,
            "radar_scores": radar_scores
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": str(e), "code": "UNAUTHORIZED"}
        )
