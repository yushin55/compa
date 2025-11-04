# Cloudtype 배포 가이드

## 📦 사전 준비

### 1. GitHub 저장소 준비
- 현재 프로젝트가 GitHub에 푸시되어 있어야 합니다 ✅ (이미 완료)
- Repository: `Same-Ta/conpanion`
- Branch: `back`

### 2. 필요한 파일들 (모두 생성 완료 ✅)
- `Procfile` - 실행 명령 정의
- `runtime.txt` - Python 버전 지정 (3.11)
- `.cloudtype.yaml` - Cloudtype 설정 파일
- `requirements.txt` - Python 패키지 목록

---

## 🚀 Cloudtype 배포 단계

### 1단계: Cloudtype 회원가입 및 로그인
1. [Cloudtype](https://cloudtype.io/) 접속
2. GitHub 계정으로 로그인 (권장)

### 2단계: 새 프로젝트 생성
1. 대시보드에서 **"새 프로젝트 만들기"** 클릭
2. **GitHub 연동** 선택
3. Repository 선택: `Same-Ta/conpanion`
4. Branch 선택: `back`
5. Root Directory: `.` (루트 그대로)

### 3단계: 배포 설정
Cloudtype이 자동으로 `.cloudtype.yaml`을 감지하지만, 수동 설정도 가능합니다:

#### 기본 설정
- **프로젝트 이름**: `stepup-api` (또는 원하는 이름)
- **빌드 타입**: Python
- **Python 버전**: 3.11 (runtime.txt에서 자동 감지)
- **실행 명령**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 포트 설정
- **포트**: `8000` (기본값, Cloudtype이 자동으로 $PORT 변수 주입)

### 4단계: 환경 변수 설정 ⚠️ **중요**
**Settings > 환경 변수** 탭에서 다음을 추가:

```
SUPABASE_URL=https://xyrbiuogwtmcjwqkojrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmJpdW9nd3RtY2p3cWtvanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTA5NDUsImV4cCI6MjA3NDc2Njk0NX0.AFau_18T-iVIc9gIGoTbvOhq42H8VDfpJ0rKvmHfAHA
```

**⚠️ 보안 주의사항:**
- `.env` 파일은 절대 GitHub에 푸시하지 마세요
- Cloudtype 대시보드에서만 환경 변수를 설정하세요
- 필요시 Supabase의 Service Role Key를 사용하세요 (현재는 anon key)

### 5단계: 배포 시작
1. **"배포하기"** 버튼 클릭
2. 빌드 로그 확인 (약 2-3분 소요)
3. 배포 완료 후 URL 확인

---

## 🔍 배포 확인

### 헬스 체크
배포된 URL에서 다음 엔드포인트 테스트:

```bash
# 기본 엔드포인트
curl https://your-app.cloudtype.app/

# 헬스 체크
curl https://your-app.cloudtype.app/health

# API 문서
https://your-app.cloudtype.app/docs
```

### 예상 응답
```json
{
  "message": "스텝업(Step-Up) API 서버",
  "version": "1.0.0",
  "docs": "/docs",
  "redoc": "/redoc"
}
```

---

## 📝 주요 설정 파일 설명

### `Procfile`
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```
- Cloudtype이 애플리케이션을 실행하는 명령
- `$PORT`는 Cloudtype이 자동으로 할당

### `runtime.txt`
```
python-3.11
```
- Python 버전 지정 (3.11 사용)

### `.cloudtype.yaml`
- Cloudtype 배포 설정 파일
- 빌드 타입, 실행 명령, 헬스체크, 리소스 설정 포함
- 환경 변수는 Cloudtype 대시보드에서 직접 설정 (보안)

---

## 🔧 트러블슈팅

### 1. 빌드 실패 시
**로그 확인**:
```
Building dependencies...
Installing requirements from requirements.txt...
```

**해결 방법**:
- `requirements.txt`가 올바른지 확인
- Python 버전 호환성 확인 (3.11)

### 2. 환경 변수 오류
**증상**: `SUPABASE_URL not found` 에러

**해결 방법**:
- Cloudtype 대시보드 > Settings > 환경 변수 탭
- 환경 변수 추가 후 **재배포** 필요

### 3. 포트 바인딩 오류
**증상**: `Address already in use`

**해결 방법**:
- `main.py`에서 포트를 하드코딩하지 말 것
- Cloudtype의 `$PORT` 환경 변수 사용
- 현재 설정은 올바름 ✅

### 4. CORS 오류
**증상**: 프론트엔드에서 API 호출 실패

**해결 방법**:
- `main.py`의 CORS 설정 확인 (현재는 `allow_origins=["*"]`로 모두 허용)
- 필요시 특정 도메인만 허용:
```python
allow_origins=[
    "https://your-frontend.cloudtype.app",
    "http://localhost:3000"
]
```

### 5. 데이터베이스 연결 실패
**증상**: Supabase 연결 오류

**해결 방법**:
- 환경 변수 확인 (SUPABASE_URL, SUPABASE_KEY)
- Supabase 프로젝트가 활성화되어 있는지 확인
- 네트워크 방화벽 설정 확인

---

## 🔄 자동 배포 설정

### GitHub Actions 연동 (선택사항)
Cloudtype은 GitHub Push 시 자동으로 재배포됩니다:

1. Cloudtype 대시보드 > Settings > GitHub 연동
2. **"Auto Deploy"** 활성화
3. `back` 브랜치에 푸시하면 자동 배포

### 배포 트리거
```bash
# 코드 수정 후
git add .
git commit -m "feat: 새 기능 추가"
git push origin back
# → Cloudtype이 자동으로 감지하고 재배포
```

---

## 📊 모니터링

### Cloudtype 대시보드
- **로그**: 실시간 애플리케이션 로그 확인
- **메트릭**: CPU, 메모리 사용량 모니터링
- **이벤트**: 배포 히스토리 확인

### 로그 확인
```bash
# Cloudtype 대시보드에서 확인 가능
[2025-01-04 12:00:00] INFO: Application startup complete.
[2025-01-04 12:00:01] INFO: Uvicorn running on http://0.0.0.0:8000
```

---

## 💰 요금 안내

### Cloudtype 무료 플랜
- CPU: 0.25 코어
- 메모리: 512MB
- 트래픽: 월 100GB
- 도메인: `.cloudtype.app` 서브도메인

### 유료 플랜 (필요시)
- 더 많은 리소스
- 커스텀 도메인
- 추가 트래픽

---

## 🎯 다음 단계

배포 완료 후:

1. ✅ API 엔드포인트 테스트
2. ✅ `/docs`에서 Swagger UI 확인
3. ✅ 프론트엔드와 연동 테스트
4. ✅ 커스텀 도메인 설정 (선택사항)
5. ✅ 모니터링 및 로그 확인

---

## 📞 도움말

- [Cloudtype 공식 문서](https://docs.cloudtype.io/)
- [Cloudtype Discord](https://discord.gg/cloudtype)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)

---

## ✨ 배포 완료 체크리스트

- [x] GitHub 저장소 준비
- [x] `Procfile` 생성
- [x] `runtime.txt` 생성
- [x] `.cloudtype.yaml` 생성
- [ ] Cloudtype 회원가입
- [ ] 프로젝트 생성 및 GitHub 연동
- [ ] 환경 변수 설정 (SUPABASE_URL, SUPABASE_KEY)
- [ ] 배포 시작
- [ ] 헬스체크 확인 (`/health`)
- [ ] API 문서 확인 (`/docs`)
- [ ] 프론트엔드 연동 테스트

**배포 준비 완료! 🚀**
