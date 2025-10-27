# 스텝업(Step-Up) Backend API

맞춤형 취업 로드맵 설계 서비스 Backend API

## 기술 스택

- **Framework**: FastAPI
- **Database**: Supabase (PostgreSQL)
- **Python**: 3.9+

## 설치 및 실행

1. 가상환경 생성 및 활성화
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
```

2. 패키지 설치
```bash
pip install -r requirements.txt
```

3. 환경변수 설정
`.env` 파일에 Supabase 정보 설정 (이미 설정되어 있음)

4. 데이터베이스 초기화
**중요**: Supabase 대시보드에서 SQL Editor를 열고 `migration.sql` 파일의 내용을 복사하여 실행하세요.
- Supabase Dashboard → SQL Editor → New Query
- `migration.sql` 내용 붙여넣기 → Run

5. 서버 실행
```bash
# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 서버 실행
uvicorn main:app --reload --port 8000
```

## API 문서

서버 실행 후 다음 URL에서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 프로젝트 구조

```
back/
├── main.py                 # FastAPI 애플리케이션 진입점
├── config/
│   └── database.py        # Supabase 연결 설정
├── models/
│   └── schemas.py         # Pydantic 모델 (Request/Response)
├── routers/
│   ├── auth.py           # 인증 관련 API
│   ├── users.py          # 사용자 API
│   ├── specs.py          # 스펙 관련 API
│   ├── goals.py          # 목표 관련 API
│   └── tasks.py          # 로드맵/업무 API
└── utils/
    └── helpers.py         # 유틸리티 함수
```
