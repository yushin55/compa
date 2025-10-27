# 스텝업(Step-Up) Backend 설정 가이드

## 1. Supabase 데이터베이스 설정 (필수)

### 방법 1: SQL Editor 사용 (권장)

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택: `xyrbiuogwtmcjwqkojrb`
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New Query** 버튼 클릭
5. `migration.sql` 파일의 전체 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭하여 실행

### 방법 2: Table Editor 사용

1. Supabase Dashboard → **Table Editor**
2. 각 테이블을 수동으로 생성 (권장하지 않음)

## 2. 환경 설정 확인

`.env` 파일에 다음 내용이 있는지 확인:
```
SUPABASE_URL=https://xyrbiuogwtmcjwqkojrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. 가상환경 설정 및 패키지 설치

```powershell
# 가상환경 생성
python -m venv venv

# 가상환경 활성화 (PowerShell)
.\venv\Scripts\Activate.ps1

# 패키지 설치
pip install -r requirements.txt
```

## 4. 서버 실행

```powershell
# 가상환경이 활성화된 상태에서
uvicorn main:app --reload --port 8000
```

서버가 시작되면: http://localhost:8000

## 5. API 문서 확인

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 6. API 테스트

```powershell
# Python 테스트 스크립트 실행
python test_api.py
```

## 트러블슈팅

### 문제: "column users.email does not exist" 오류

**원인**: Supabase 데이터베이스에 테이블이 없음

**해결**: 위의 "1. Supabase 데이터베이스 설정" 단계를 따라 `migration.sql`을 실행하세요.

### 문제: "error while attempting to bind on address" 오류

**원인**: 포트 8000이 이미 사용 중

**해결**:
```powershell
# 다른 포트 사용
uvicorn main:app --reload --port 8001
```

### 문제: 패키지 설치 오류

**해결**:
```powershell
# pip 업그레이드
python -m pip install --upgrade pip

# 다시 설치
pip install -r requirements.txt
```

## 데이터베이스 스키마

생성되는 테이블:
1. `users` - 사용자 계정
2. `user_specs` - 사용자 스펙 정보
3. `educations` - 학력 정보
4. `languages` - 어학 능력
5. `certificates` - 자격증
6. `projects` - 프로젝트 경험
7. `activities` - 대외활동
8. `goals` - 목표 (채용 공고)
9. `tasks` - 업무 목록

자세한 스키마는 `docs/db.spec.md` 참조
