from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, specs, goals, tasks

app = FastAPI(
    title="스텝업(Step-Up) API",
    version="1.0.0",
    description="""
    맞춤형 취업 로드맵 설계 서비스 '스텝업(Step-Up)' REST API
    
    ## 개요
    사용자의 현재 스펙을 분석하고, 실제 채용 공고 기반의 맞춤형 목표를 설정하여,
    달성을 위한 구체적인 로드맵을 제공하는 취업 준비 관리 서비스입니다.
    
    ## 인증
    간단한 구현을 위해 JWT 토큰 대신 `x-user-id` 헤더를 사용합니다.
    모든 API 요청 시 `x-user-id` 헤더에 사용자 ID를 포함해야 합니다.
    """,
    contact={
        "name": "Step-Up API Support",
        "email": "support@stepup.com"
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(specs.router)
app.include_router(goals.router)
app.include_router(tasks.router)


@app.get("/")
async def root():
    return {
        "message": "스텝업(Step-Up) API 서버",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
