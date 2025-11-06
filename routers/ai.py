from fastapi import APIRouter, Header, HTTPException
from config.database import supabase
from models.schemas import (
    ReflectionRequest, AIInsights, GrowthArea, Recommendation,
    ReflectionQuality, NextSteps,
    LearningPathRequest, LearningPath, PhaseItem, WeeklyRoutineItem, Milestone,
    ReflectionQuestions, AIQuestion
)
from datetime import datetime
from typing import Dict, Any

router = APIRouter(
    prefix="/ai",
    tags=["ai"]
)


@router.post("/analyze-reflection", response_model=Dict[str, Any])
async def analyze_reflection(request: ReflectionRequest, x_user_id: str = Header(...)):
    """
    회고 분석 및 인사이트 생성
    
    실제 구현 시에는 OpenAI GPT-4 API를 사용해야 합니다.
    현재는 기본 구조와 샘플 응답만 제공합니다.
    """
    try:
        reflection = request.reflection
        
        # TODO: OpenAI API 호출
        # import openai
        # response = openai.ChatCompletion.create(...)
        
        # 샘플 응답
        insights = {
            "success": True,
            "insights": {
                "summary": f"{reflection.get('learned', '')}를 통해 성장했습니다.",
                "growth_areas": [
                    {
                        "area": "기술적 역량",
                        "progress": reflection.get('learned', '새로운 기술 습득'),
                        "evidence": reflection.get('aiQuestion1', '')
                    }
                ],
                "patterns": [
                    "문제 해결 접근 방식이 체계적입니다",
                    "지속적인 학습 자세를 보입니다"
                ],
                "recommendations": [
                    {
                        "priority": "high",
                        "action": reflection.get('improvements', '더 나은 방향으로 개선'),
                        "reason": "경험을 통해 개선 방향을 명확히 인식함"
                    }
                ],
                "reflection_quality": {
                    "score": 85,
                    "strengths": [
                        "구체적인 문제와 해결책 제시",
                        "성장 순간을 명확히 인식"
                    ],
                    "improvements": [
                        "정량적 지표 추가 권장"
                    ]
                },
                "next_steps": {
                    "immediate": "배운 내용을 다른 프로젝트에 적용",
                    "short_term": "관련 기술 심화 학습",
                    "long_term": "전문성을 바탕으로 한 기여"
                },
                "generated_at": datetime.now().isoformat()
            }
        }
        
        # 경험이 지정된 경우 AI 인사이트를 경험에 저장
        if request.experience_id:
            try:
                supabase.table("experiences").update({
                    "ai_insights": insights["insights"]
                }).eq("id", request.experience_id).eq("user_id", x_user_id).execute()
            except Exception as e:
                print(f"Failed to save AI insights: {e}")
        
        return insights
        
    except Exception as e:
        print(f"Error analyzing reflection: {e}")
        raise HTTPException(status_code=500, detail=f"회고 분석 실패: {str(e)}")


@router.post("/recommend-path", response_model=Dict[str, Any])
async def recommend_learning_path(request: LearningPathRequest, x_user_id: str = Header(...)):
    """
    학습 경로 추천
    
    실제 구현 시에는 OpenAI GPT-4 API를 사용해야 합니다.
    """
    try:
        # TODO: OpenAI API 호출
        
        # 샘플 학습 경로
        learning_path = {
            "success": True,
            "learning_path": {
                "phases": [
                    {
                        "phase": 1,
                        "title": f"{request.target_role} 기초 다지기",
                        "duration": "2개월",
                        "topics": list(request.current_skills.keys())[:3],
                        "projects": ["기초 프로젝트 1", "기초 프로젝트 2"]
                    },
                    {
                        "phase": 2,
                        "title": "심화 학습",
                        "duration": "2개월",
                        "topics": request.focus_areas,
                        "projects": ["심화 프로젝트 1", "포트폴리오 프로젝트"]
                    }
                ],
                "weekly_routines": [
                    {
                        "activity": "알고리즘 문제 풀이",
                        "frequency": 3,
                        "reason": "문제 해결 능력 향상"
                    },
                    {
                        "activity": "기술 블로그 작성",
                        "frequency": 1,
                        "reason": "학습 내용 정리"
                    }
                ],
                "milestones": [
                    {
                        "month": 2,
                        "goal": "기초 프로젝트 완성",
                        "metrics": ["프로젝트 1개 완성", "블로그 포스트 4개"]
                    },
                    {
                        "month": 4,
                        "goal": "포트폴리오 완성",
                        "metrics": ["실전 프로젝트 완성", "GitHub 활동 증가"]
                    }
                ]
            },
            "generated_at": datetime.now().isoformat()
        }
        
        return learning_path
        
    except Exception as e:
        print(f"Error recommending learning path: {e}")
        raise HTTPException(status_code=500, detail=f"학습 경로 추천 실패: {str(e)}")


@router.post("/generate-reflection-questions", response_model=Dict[str, Any])
async def generate_reflection_questions(
    task_title: str = None,
    category: str = None,
    x_user_id: str = Header(...)
):
    """
    개인화된 회고 질문 생성
    
    실제 구현 시에는 사용자 히스토리를 분석하여 OpenAI로 질문 생성
    """
    try:
        # TODO: 사용자 히스토리 분석 + OpenAI API 호출
        
        # 샘플 질문
        questions = {
            "success": True,
            "questions": {
                "aiQuestion1": {
                    "question": f"{task_title or '이 경험'}을 통해 가장 큰 성장을 느낀 순간은 언제였나요?",
                    "purpose": "성장 순간 인식",
                    "tags": ["성장", "인사이트"]
                },
                "aiQuestion2": {
                    "question": "이 과정에서 예상과 달랐던 점은 무엇이고, 그것이 주는 교훈은 무엇인가요?",
                    "purpose": "가설-검증 사이클 인식",
                    "tags": ["학습", "검증"]
                },
                "aiQuestion3": {
                    "question": "6개월 후의 나에게 이 경험을 어떻게 설명하시겠습니까?",
                    "purpose": "장기적 관점 형성",
                    "tags": ["비전", "커리어"]
                }
            },
            "defaultQuestions": {
                "aiQuestion1": "이 경험을 통해 가장 큰 성장을 느낀 순간은 언제였나요?",
                "aiQuestion2": "이 과정에서 예상과 달랐던 점은 무엇이고, 그것이 주는 교훈은?",
                "aiQuestion3": "6개월 후의 나에게 이 경험을 어떻게 설명하시겠습니까?"
            },
            "generated_at": datetime.now().isoformat()
        }
        
        return questions
        
    except Exception as e:
        print(f"Error generating reflection questions: {e}")
        raise HTTPException(status_code=500, detail=f"회고 질문 생성 실패: {str(e)}")
