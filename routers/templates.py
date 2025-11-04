from fastapi import APIRouter, Header, HTTPException
from config.database import supabase
from models.schemas import Template, TemplateListItem, TemplateCreate, RoadmapFromTemplateRequest
from typing import List
from datetime import datetime, date, timedelta

router = APIRouter(
    prefix="/templates",
    tags=["templates"]
)


@router.get("", response_model=List[TemplateListItem])
async def get_templates(x_user_id: str = Header(...)):
    """템플릿 목록 조회"""
    try:
        response = supabase.table("templates").select("id, title, category, duration, difficulty, description, created_at").execute()
        
        return [
            TemplateListItem(
                id=template["id"],
                title=template["title"],
                category=template["category"],
                duration=template["duration"],
                difficulty=template["difficulty"],
                description=template["description"],
                created_at=datetime.fromisoformat(template["created_at"].replace('Z', '+00:00'))
            )
            for template in response.data
        ]
    except Exception as e:
        print(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail=f"템플릿 목록 조회 실패: {str(e)}")


@router.get("/{template_id}", response_model=Template)
async def get_template(template_id: int, x_user_id: str = Header(...)):
    """템플릿 상세 조회"""
    try:
        response = supabase.table("templates").select("*").eq("id", template_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
        
        template_data = response.data[0]
        
        return Template(
            id=template_data["id"],
            title=template_data["title"],
            category=template_data["category"],
            duration=template_data["duration"],
            difficulty=template_data["difficulty"],
            description=template_data["description"],
            tasks=template_data.get("tasks", []),
            routines=template_data.get("routines", []),
            created_at=datetime.fromisoformat(template_data["created_at"].replace('Z', '+00:00'))
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching template: {e}")
        raise HTTPException(status_code=500, detail=f"템플릿 조회 실패: {str(e)}")


@router.post("", response_model=dict)
async def create_template(template: TemplateCreate, x_user_id: str = Header(...)):
    """템플릿 생성 (관리자용)"""
    try:
        template_data = {
            "title": template.title,
            "category": template.category,
            "duration": template.duration,
            "difficulty": template.difficulty,
            "description": template.description,
            "tasks": [task.dict() for task in template.tasks],
            "routines": [routine.dict() for routine in template.routines],
            "created_at": datetime.now().isoformat()
        }
        
        response = supabase.table("templates").insert(template_data).execute()
        
        return {
            "success": True,
            "template_id": response.data[0]["id"],
            "message": "템플릿이 생성되었습니다"
        }
    except Exception as e:
        print(f"Error creating template: {e}")
        raise HTTPException(status_code=500, detail=f"템플릿 생성 실패: {str(e)}")


@router.post("/from-template", response_model=dict)
async def create_roadmap_from_template(request: RoadmapFromTemplateRequest, x_user_id: str = Header(...)):
    """템플릿 기반 로드맵 생성"""
    try:
        # 1. 템플릿 조회
        template_response = supabase.table("templates").select("*").eq("id", request.template_id).execute()
        
        if not template_response.data:
            raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
        
        template = template_response.data[0]
        
        # 2. 태스크 생성
        start_date = request.start_date
        current_date = start_date
        
        tasks_to_create = []
        for task_template in template.get("tasks", []):
            # 제외할 작업 확인
            if request.customizations and request.customizations.get("excludeTasks"):
                if task_template["title"] in request.customizations["excludeTasks"]:
                    continue
            
            task_data = {
                "user_id": x_user_id,
                "title": task_template["title"],
                "category": task_template["category"],
                "date": str(current_date),
                "priority": task_template["priority"],
                "completed": False,
                "created_at": datetime.now().isoformat()
            }
            tasks_to_create.append(task_data)
            
            # 다음 작업은 1주일 뒤
            current_date = current_date + timedelta(days=7)
        
        # 추가 작업
        if request.customizations and request.customizations.get("additionalTasks"):
            for add_task in request.customizations["additionalTasks"]:
                task_data = {
                    "user_id": x_user_id,
                    "title": add_task["title"],
                    "category": add_task["category"],
                    "date": add_task.get("date", str(current_date)),
                    "priority": add_task.get("priority", "preferred"),
                    "completed": False,
                    "created_at": datetime.now().isoformat()
                }
                tasks_to_create.append(task_data)
        
        if tasks_to_create:
            supabase.table("tasks").insert(tasks_to_create).execute()
        
        # 3. 루틴 생성
        routines_to_create = []
        for routine_template in template.get("routines", []):
            routine_data = {
                "user_id": x_user_id,
                "title": routine_template["title"],
                "category": routine_template["category"],
                "frequency": routine_template["frequency"],
                "color": routine_template["color"],
                "created_at": datetime.now().isoformat()
            }
            routines_to_create.append(routine_data)
        
        if routines_to_create:
            supabase.table("weekly_routines").insert(routines_to_create).execute()
        
        return {
            "success": True,
            "roadmap_id": f"roadmap_{datetime.now().timestamp()}",
            "message": "로드맵이 생성되었습니다",
            "tasks_created": len(tasks_to_create),
            "routines_created": len(routines_to_create)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating roadmap from template: {e}")
        raise HTTPException(status_code=500, detail=f"로드맵 생성 실패: {str(e)}")


@router.delete("/{template_id}", response_model=dict)
async def delete_template(template_id: int, x_user_id: str = Header(...)):
    """템플릿 삭제 (관리자용)"""
    try:
        response = supabase.table("templates").delete().eq("id", template_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="템플릿을 찾을 수 없습니다")
        
        return {
            "success": True,
            "message": "템플릿이 삭제되었습니다"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting template: {e}")
        raise HTTPException(status_code=500, detail=f"템플릿 삭제 실패: {str(e)}")
