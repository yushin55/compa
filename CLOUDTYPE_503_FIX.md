# 🚨 Cloudtype 배포 503 오류 해결 가이드

## ❌ 문제 상황
Cloudtype에 배포했는데 **503 Service Unavailable** 오류 발생

## ✅ 해결 완료!

### 적용된 수정사항

#### 1. `.cloudtype.yaml` 헬스체크 추가
```yaml
options:
  ports: 8000
  start: uvicorn main:app --host 0.0.0.0 --port $PORT
  health: /health  # ✅ 추가됨
```

#### 2. `requirements.txt` 버전 업데이트
```txt
supabase==2.23.2      # 2.10.0 → 2.23.2
pydantic==2.12.3      # 2.5.3 → 2.12.3
httpx==0.28.1         # 0.27.0 → 0.28.1
websockets>=14.0      # ✅ 추가
uvicorn[standard]     # ✅ [standard] 추가
```

#### 3. `/health` 엔드포인트 확인
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```
✅ 이미 `main.py`에 존재

---

## 🔧 Cloudtype 설정 (대시보드)

### 빌드 타입
- **Python** (Dockerfile 없음 ✅)
- **Python 버전**: 3.11

### 설정 값

| 항목 | 값 | 설명 |
|------|-----|------|
| **Port** | `8000` | FastAPI 기본 포트 |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` | ✅ `$PORT` 사용 |
| **Health Check** | `/health` | ✅ 필수! |
| **Install** | `pip install -r requirements.txt` | 자동 감지 |

### 환경 변수 (Environment Variables)

```
SUPABASE_URL=https://xyrbiuogwtmcjwqkojrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cmJpdW9nd3RtY2p3cWtvanJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxOTA5NDUsImV4cCI6MjA3NDc2Njk0NX0.AFau_18T-iVIc9gIGoTbvOhq42H8VDfpJ0rKvmHfAHA
CORS_ORIGINS=*
```

---

## 🚨 주의사항

### ❌ 하지 말아야 할 것

1. **Dockerfile 모드 사용 금지** (없으면 OK ✅)
   - Dockerfile이 있으면 콘솔 설정이 무시됨
   - `$PORT` 환경 변수가 치환 안 됨

2. **JSON 형식 CMD 사용 금지**
   ```dockerfile
   # ❌ 작동 안 함
   CMD ["uvicorn", "main:app", "--port", "$PORT"]
   
   # ✅ 이렇게 써야 함 (Dockerfile 사용 시)
   CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
   ```

3. **Health Check 누락 금지**
   - `/health` 엔드포인트 필수
   - Cloudtype이 서버 상태를 확인

### ✅ 해야 할 것

1. **Health Check 엔드포인트 구현**
   ```python
   @app.get("/health")
   def health():
       return {"ok": True}
   ```

2. **환경 변수 설정**
   - Cloudtype 대시보드에서 직접 설정
   - `.env` 파일은 Git에 올리지 않음

3. **requirements.txt 최신화**
   - 로컬에서 작동하는 버전으로 고정

---

## 🔍 런타임 로그로 문제 진단

Cloudtype > Logs > **Runtime** 탭에서 에러 확인:

### 1. 엔트리 경로 오류
```
Error loading ASGI app: ... 'main'
```
**해결**: `main:app` ↔ `app.main:app` 확인

### 2. 패키지 누락
```
ModuleNotFoundError: No module named 'fastapi'
```
**해결**: `requirements.txt`에 추가 후 재배포

### 3. 환경 변수 누락
```
KeyError: "SUPABASE_URL"
```
**해결**: Cloudtype 대시보드 > Environment Variables 추가

### 4. Supabase URL 오류
```
ValueError: Not a valid URL
```
**해결**: `https://` 포함 여부 확인, 키 값 재확인

### 5. 포트 충돌
```
address already in use
```
**해결**: Start Command에서 `$PORT` 사용 (하드코딩 금지)

---

## 📋 배포 체크리스트

### 코드 준비
- [x] `/health` 엔드포인트 구현 ✅
- [x] `requirements.txt` 최신화 ✅
- [x] `.cloudtype.yaml` 헬스체크 추가 ✅
- [x] Dockerfile 없음 확인 ✅
- [x] `main.py`에 `main:app` 진입점 ✅

### Cloudtype 설정
- [ ] Build Type: **Python** 선택
- [ ] Port: `8000`
- [ ] Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Health Check: `/health`
- [ ] 환경 변수 3개 추가 (SUPABASE_URL, SUPABASE_KEY, CORS_ORIGINS)

### 배포 후 확인
- [ ] Runtime 로그에 에러 없음
- [ ] `https://your-app.cloudtype.app/health` 접속 시 `{"status":"healthy"}`
- [ ] `https://your-app.cloudtype.app/docs` 접속 시 Swagger UI 표시

---

## 🎯 빠른 해결 방법 요약

### 방법 1: Dockerfile 없음 (현재 상태 ✅)
1. `.cloudtype.yaml`에 `health: /health` 추가 ✅
2. `requirements.txt` 버전 업데이트 ✅
3. Cloudtype 대시보드에서 환경 변수 설정
4. 재배포

### 방법 2: Dockerfile 있을 때
1. `Dockerfile`을 `Dockerfile.off`로 이름 변경
2. Cloudtype에서 Build Type을 **Python**으로 변경
3. 위 방법 1 진행

---

## 🚀 배포 후 테스트

### 1. 헬스 체크
```bash
curl https://your-app.cloudtype.app/health
# 응답: {"status":"healthy"}
```

### 2. API 문서
브라우저에서:
```
https://your-app.cloudtype.app/docs
```

### 3. 기본 엔드포인트
```bash
curl https://your-app.cloudtype.app/
# 응답: {"message":"스텝업(Step-Up) API 서버",...}
```

---

## 💡 핵심 요약

1. **Dockerfile 없이 Python 모드 사용** ✅
2. **Health Check `/health` 필수** ✅
3. **Start Command에 `$PORT` 사용** ✅
4. **환경 변수 Cloudtype 대시보드에서 설정** ⏳
5. **requirements.txt 최신 버전** ✅

**현재 설정이 모두 올바릅니다! 이제 Cloudtype 대시보드에서 환경 변수만 설정하고 재배포하면 작동합니다!** 🎉
