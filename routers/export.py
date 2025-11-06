from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import JSONResponse
from config.database import supabase
from models.schemas import ExportRequest, ExportData
from datetime import datetime

router = APIRouter(
    prefix="/export",
    tags=["export"]
)


@router.get("/json", response_model=ExportData)
async def export_json(x_user_id: str = Header(...)):
    """전체 데이터 JSON 내보내기"""
    try:
        # 사용자 정보
        user_response = supabase.table("users").select("*").eq("user_id", x_user_id).execute()
        user_spec_response = supabase.table("user_specs").select("*").eq("user_id", x_user_id).execute()
        
        user_data = {}
        if user_response.data:
            user_data = user_response.data[0]
        if user_spec_response.data:
            user_data.update(user_spec_response.data[0])
        
        # 모든 데이터 수집
        tasks = supabase.table("tasks").select("*").eq("user_id", x_user_id).execute().data
        routines = supabase.table("weekly_routines").select("*").eq("user_id", x_user_id).execute().data
        experiences = supabase.table("experiences").select("*").eq("user_id", x_user_id).execute().data
        
        # 루틴 완료 기록도 포함
        routine_completions = []
        if routines:
            routine_ids = [r["id"] for r in routines]
            for rid in routine_ids:
                completions = supabase.table("routine_completions").select("*").eq("routine_id", rid).execute().data
                routine_completions.extend(completions)
        
        export_data = ExportData(
            exported_at=datetime.now(),
            user={
                "id": x_user_id,
                **user_data
            },
            data={
                "tasks": tasks,
                "routines": routines,
                "routine_completions": routine_completions,
                "experiences": experiences
            }
        )
        
        return export_data
        
    except Exception as e:
        print(f"Error exporting JSON: {e}")
        raise HTTPException(status_code=500, detail=f"JSON 내보내기 실패: {str(e)}")


@router.post("/pdf")
async def export_pdf(request: ExportRequest, x_user_id: str = Header(...)):
    """PDF 리포트 생성"""
    try:
        # PDF 생성은 복잡하므로 기본 구조만 구현
        # 실제로는 reportlab 또는 weasyprint 등을 사용해야 함
        
        return {
            "success": False,
            "message": "PDF 내보내기 기능은 아직 구현 중입니다",
            "note": "JSON 내보내기를 사용하거나, 프론트엔드에서 HTML to PDF 변환을 고려하세요"
        }
        
    except Exception as e:
        print(f"Error exporting PDF: {e}")
        raise HTTPException(status_code=500, detail=f"PDF 내보내기 실패: {str(e)}")
