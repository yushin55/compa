# 🌐 CORS 설정 가이드

## 문제 상황
프론트엔드에서 백엔드 API를 호출할 때 브라우저가 차단하는 문제 발생:
```
Access to fetch at 'https://api.example.com/endpoint' from origin 'https://frontend.example.com' 
has been blocked by CORS policy
```

## ✅ 해결 방법

### 1. 로컬 개발 환경

**`.env` 파일:**
```properties
CORS_ORIGINS=*
```
- 모든 도메인 허용 (개발용)

### 2. Cloudtype 배포 환경

#### 2-1. Cloudtype 대시보드에서 환경 변수 설정

**Settings > 환경 변수**에서 추가:

```
이름: CORS_ORIGINS
값: https://your-frontend.cloudtype.app,http://localhost:3000
```

**중요:**
- 여러 도메인은 **쉼표로 구분** (공백 없이!)
- `http://` 또는 `https://` 포함
- 프론트엔드 배포 URL을 정확히 입력

#### 2-2. 프론트엔드 URL 예시

만약 프론트엔드가:
- Cloudtype: `https://port-0-conpanion-front-xxxxxx.cloudtype.app`
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`

에 배포되어 있다면:

```
CORS_ORIGINS=https://port-0-conpanion-front-xxxxxx.cloudtype.app,https://your-app.vercel.app,http://localhost:3000
```

### 3. 프론트엔드 URL 확인 방법

1. **Cloudtype에 프론트엔드 배포 시:**
   - Cloudtype 대시보드 > 프론트엔드 프로젝트
   - URL 복사 (예: `https://port-0-xxx-yyy.cloudtype.app`)

2. **로컬에서 HTML 파일 직접 열 때:**
   - `file://` 프로토콜 사용
   - CORS 문제 발생할 수 있음
   - **해결:** Live Server 사용 권장

3. **Live Server 사용 (VS Code):**
   - VS Code 확장: "Live Server" 설치
   - HTML 파일 우클릭 > "Open with Live Server"
   - `http://localhost:5500` 또는 `http://127.0.0.1:5500`

---

## 🔧 설정 확인

### 백엔드 로그 확인

서버 시작 시 다음 로그 확인:
```
🌐 CORS allowed origins: ['https://your-frontend.cloudtype.app', 'http://localhost:3000']
```

### 브라우저 개발자 도구

1. **F12** 키로 개발자 도구 열기
2. **Console** 탭 확인
3. CORS 에러가 있는지 확인:
   ```
   ❌ CORS policy: No 'Access-Control-Allow-Origin' header
   ✅ 에러 없음 → CORS 설정 성공!
   ```

---

## 📋 Cloudtype 환경 변수 설정 체크리스트

백엔드 배포 시 설정해야 할 환경 변수:

- [ ] `SUPABASE_URL` - Supabase 프로젝트 URL
- [ ] `SUPABASE_KEY` - Supabase anon/service key
- [ ] `CORS_ORIGINS` - 프론트엔드 도메인 (쉼표로 구분)

**예시:**
```
SUPABASE_URL=https://xyrbiuogwtmcjwqkojrb.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CORS_ORIGINS=https://your-frontend.cloudtype.app,http://localhost:3000
```

---

## 🚨 주의사항

### ❌ 잘못된 설정

```
CORS_ORIGINS=*
```
- 프로덕션에서 모든 도메인 허용은 **보안 위험**
- 개발 환경에서만 사용

```
CORS_ORIGINS=https://example.com, http://localhost:3000
```
- 쉼표 뒤에 **공백 있음** → 오류 발생!

```
CORS_ORIGINS=example.com
```
- `http://` 또는 `https://` **누락** → 작동 안 함!

### ✅ 올바른 설정

```
CORS_ORIGINS=https://example.com,http://localhost:3000
```
- 프로토콜 포함 (`https://`)
- 쉼표로 구분, **공백 없음**
- 포트 번호 포함 (필요 시)

---

## 🔄 재배포

환경 변수 변경 후 **반드시 재배포**:

1. Cloudtype 대시보드
2. **"재배포"** 버튼 클릭
3. 또는 Git push 시 자동 배포

---

## 🧪 테스트 방법

### 1. 헬스 체크 (브라우저)

```javascript
// 개발자 도구 Console에서 실행
fetch('https://your-backend.cloudtype.app/health')
  .then(res => res.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Error:', err));
```

### 2. CORS 테스트 (프론트엔드)

```javascript
// app.js의 API_CONFIG.BASE_URL을 배포 URL로 변경
API_CONFIG.BASE_URL = 'https://your-backend.cloudtype.app';

// API 호출 테스트
API_CONFIG.get('/health')
  .then(data => console.log('✅ CORS OK:', data))
  .catch(err => console.error('❌ CORS Error:', err));
```

---

## 📖 참고 자료

- [FastAPI CORS 문서](https://fastapi.tiangolo.com/tutorial/cors/)
- [MDN CORS 가이드](https://developer.mozilla.org/ko/docs/Web/HTTP/CORS)
- [Cloudtype 환경 변수 설정](https://docs.cloudtype.io/)

---

## ✨ 요약

1. **백엔드**: `main.py`에 CORS 미들웨어 설정 (완료 ✅)
2. **환경 변수**: Cloudtype에서 `CORS_ORIGINS` 추가
3. **프론트엔드**: `app.js`의 `API_CONFIG.BASE_URL` 업데이트
4. **재배포**: 환경 변수 변경 후 재배포 필수
5. **테스트**: 브라우저 개발자 도구에서 CORS 에러 확인

**프론트엔드 URL을 정확히 입력하고 재배포하면 작동합니다!** 🚀
