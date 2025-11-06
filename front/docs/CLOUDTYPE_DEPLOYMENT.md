# Cloudtype 배포 가이드

## 🚀 배포 방법

### 1. Cloudtype 웹사이트 접속
- https://cloudtype.io/
- GitHub 계정으로 로그인

### 2. 새 프로젝트 생성
1. "새 프로젝트" 버튼 클릭
2. GitHub 저장소 선택: `Same-Ta/conpanion`
3. 브랜치 선택: `master`
4. 프로젝트 이름: `step-up-frontend` 또는 원하는 이름

### 3. 빌드 설정

**자동 감지 (권장)**
- Cloudtype이 Next.js를 자동으로 감지
- 별도 설정 없이 배포 버튼 클릭

**수동 설정 (필요시)**
```yaml
Build Command: npm run build
Start Command: npm start
Port: 3000
Node Version: 20.x
```

### 4. 환경 변수 설정 (선택사항)

프로덕션 환경에서 필요한 환경 변수 추가:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### 5. 배포 실행
- "배포" 버튼 클릭
- 빌드 로그 확인
- 배포 완료 후 제공되는 URL로 접속

## 🔄 자동 배포 설정

### GitHub Actions 연동
master 브랜치에 푸시할 때마다 자동 배포:

1. Cloudtype 대시보드 > 설정 > 배포 트리거
2. "GitHub 푸시 시 자동 배포" 활성화
3. 브랜치: `master` 선택

이제 `git push origin master` 할 때마다 자동 배포됩니다!

## 📊 배포 후 확인사항

### ✅ 체크리스트
- [ ] 홈페이지 정상 로딩
- [ ] 로그인/회원가입 기능 동작
- [ ] 대시보드 데이터 표시
- [ ] 로드맵 캘린더 기능
- [ ] 주간 루틴 시스템
- [ ] 경험 아카이브 페이지

### 🐛 문제 해결

**빌드 실패 시:**
1. Cloudtype 대시보드 > 배포 로그 확인
2. package.json의 dependencies 버전 확인
3. Node.js 버전 호환성 확인 (권장: 20.x)

**실행 오류 시:**
1. 환경 변수 설정 확인
2. API URL 설정 확인
3. 런타임 로그 확인

**성능 최적화:**
1. 이미지 최적화 (Next.js Image 컴포넌트 사용)
2. 코드 스플리팅 (dynamic import)
3. 캐싱 전략 적용

## 🌐 커스텀 도메인 연결 (선택사항)

1. Cloudtype 대시보드 > 도메인 설정
2. 커스텀 도메인 추가
3. DNS 설정 (CNAME 레코드)
4. SSL 인증서 자동 발급

## 📈 모니터링

Cloudtype 대시보드에서 확인 가능:
- CPU/메모리 사용량
- 트래픽 통계
- 에러 로그
- 응답 시간

## 💰 비용

- **무료 플랜**: 
  - 1개 프로젝트
  - 기본 리소스
  - 충분한 트래픽
  
- **유료 플랜**: 
  - 더 많은 프로젝트
  - 고성능 리소스
  - 커스텀 도메인

## 🔗 유용한 링크

- [Cloudtype 공식 문서](https://docs.cloudtype.io/)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [GitHub Repository](https://github.com/Same-Ta/conpanion)

---

## 🎯 빠른 배포 (요약)

```bash
# 1. 코드 푸시 (이미 완료)
git push origin master

# 2. Cloudtype 웹사이트 접속
# https://cloudtype.io/

# 3. 새 프로젝트 생성
# - 저장소: Same-Ta/conpanion
# - 브랜치: master

# 4. 배포 버튼 클릭!
# 끝! 🎉
```

배포 URL 예시: `https://step-up-frontend-xxxxx.cloudtype.app`

---

**작성일:** 2025-01-15  
**프로젝트:** 스펙체크 (Step-Up)
