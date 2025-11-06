# 프로젝트 문서 인덱스

## 📚 문서 목록

### 프로젝트 정의
- **[prd.md](./prd.md)** - 제품 요구사항 정의서 (Product Requirements Document)
  - 프로젝트 개요, 목표, 주요 기능 정의

### 백엔드 API 요구사항
- **[backend-api-base.md](./backend-api-base.md)** - 기본 백엔드 API 요구사항
  - 사용자 인증, 목표 관리, 태스크 관리, 대시보드 API
  - 데이터베이스 스키마 및 엔드포인트 명세
  
- **[backend-api-step-up.md](./backend-api-step-up.md)** - Step-Up 기능 추가 API 요구사항
  - 경험 아카이빙 시스템 API
  - 회고 작성, 태그 관리, 통계, 활동 캘린더
  - 경험 내보내기 기능

- **[FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md)** - 프론트엔드 API 연동 가이드
  - API 호출 방법 및 예제 코드

### 프론트엔드
- **[frontend.techstack.md](./frontend.techstack.md)** - 프론트엔드 기술 스택
  - Next.js, React, TypeScript, Tailwind CSS
  
- **[ui.spec.md](./ui.spec.md)** - UI 명세서
  - 페이지별 UI 구성 요소 및 디자인 가이드
  
- **[ui/](./ui/)** - UI 프로토타입 파일
  - HTML/CSS/JS 정적 프로토타입

### API 스펙
- **[openapi.yaml](./openapi.yaml)** - OpenAPI 3.0 스펙
  - REST API 엔드포인트 상세 스펙

---

## 🚀 빠른 시작

### 백엔드 개발자
1. [backend-api-base.md](./backend-api-base.md) - 기본 API 구현
2. [backend-api-step-up.md](./backend-api-step-up.md) - Step-Up 기능 구현
3. [openapi.yaml](./openapi.yaml) - API 스펙 참조

### 프론트엔드 개발자
1. [frontend.techstack.md](./frontend.techstack.md) - 기술 스택 확인
2. [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - API 연동 방법
3. [ui.spec.md](./ui.spec.md) - UI 가이드

### 기획자/PM
1. [prd.md](./prd.md) - 제품 요구사항
2. [ui.spec.md](./ui.spec.md) - UI/UX 명세

---

## 📋 구현 현황

### ✅ 완료된 프론트엔드 기능
- [x] 랜딩 페이지
- [x] 회원가입/로그인
- [x] 온보딩 (직무 선택 및 로드맵 템플릿)
- [x] 목표 설정 (Goal Setting)
- [x] 로드맵 관리 (Task 관리, 캘린더, 채용 공고)
- [x] 대시보드 (스펙 분석)
- [x] **경험 아카이빙 시스템 (Step-Up)**
  - 회고 작성 모달
  - 경험 아카이브 페이지
  - 태그 클라우드
  - 활동 캘린더 (잔디)
  - Markdown 내보내기

### ⏳ 구현 대기 중 (백엔드)
- [ ] 경험 관리 API
- [ ] 회고 데이터 CRUD
- [ ] 태그 통계 API
- [ ] 활동 캘린더 API
- [ ] 경험 내보내기 API (PDF)

---

## 🔄 최근 업데이트

### 2024-01-15
- Step-Up 기능 프론트엔드 구현 완료
- 백엔드 API 요구사항 문서 작성
- 디자인 통일 작업 완료 (모던, 전문적 스타일)
- localStorage 유틸리티 함수 추가
- 불필요한 컴포넌트 제거 (Button, Card, PageHeader)

---

## 📞 문의

- 프론트엔드: [프론트엔드 팀]
- 백엔드: [백엔드 팀]
- 기획: [기획 팀]
