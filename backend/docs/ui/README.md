# 스텝업 (Step-Up) UI 프로토타입

맞춤형 취업 로드맵 설계 서비스 '스텝업(Step-Up)'의 화면 설계 프로토타입입니다.

## 📁 파일 구조

```
ui/
├── index.html          # 랜딩 페이지
├── login.html          # 로그인 페이지
├── register.html       # 회원가입 페이지
├── onboarding.html     # 온보딩 (스펙 입력) 페이지
├── dashboard.html      # 스펙 분석 대시보드
├── goal-setting.html   # 목표 설정 (채용공고 선택) 페이지
├── roadmap.html        # 메인 로드맵 관리 페이지
├── styles.css          # 공통 스타일시트
└── app.js             # 공통 JavaScript 기능
```

## 🎨 주요 화면

### 1. 랜딩 페이지 (index.html)
- 서비스 소개 및 주요 기능 안내
- 로그인/회원가입 CTA

### 2. 회원가입/로그인 (register.html, login.html)
- 간단한 회원가입 폼
- 아이디/비밀번호 로그인

### 3. 온보딩 (onboarding.html)
- 4단계 스펙 입력 프로세스
- 기본정보, 학력/어학, 경험/활동 카테고리별 입력
- 진행도 표시 및 단계별 네비게이션

### 4. 스펙 분석 대시보드 (dashboard.html)
- 종합 스펙 통계 (어학, 자격증, 프로젝트, 활동)
- 레이더 차트를 통한 시각적 분석
- 카테고리별 상세 스펙 리스트

### 5. 목표 설정 (goal-setting.html)
- 샘플 채용 공고 검색 및 선택
- 필요 스펙과 현재 스펙 비교 분석
- 추천 업무(To-Do) 자동 생성

### 6. 로드맵 관리 (roadmap.html)
- 목표 개요 및 D-Day 표시
- 원형 진행도 차트
- 오늘의 할 일 체크리스트
- 전체 업무 타임라인
- 미니 캘린더
- 빠른 실행 메뉴

## 🚀 실행 방법

1. `index.html` 파일을 웹 브라우저로 열기
2. 또는 로컬 서버 실행:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # 브라우저에서 http://localhost:8000 접속
   ```

## 💡 사용 시나리오

1. **회원가입 및 로그인**
   - index.html → register.html → login.html

2. **스펙 입력 (최초 1회)**
   - login.html → onboarding.html (4단계 진행)

3. **스펙 확인**
   - onboarding.html → dashboard.html

4. **목표 설정**
   - dashboard.html → goal-setting.html
   - 채용 공고 선택 및 스펙 비교

5. **로드맵 관리**
   - goal-setting.html → roadmap.html
   - 일일 업무 체크 및 진행도 관리

## 🎯 주요 기능

### 데이터 관리
- 모든 데이터는 `localStorage`에 저장
- `StorageManager` 객체를 통한 데이터 관리
- 페이지 간 데이터 공유

### UI 컴포넌트
- 레이더 차트 (Canvas 기반)
- 원형 진행도 차트
- 반응형 디자인
- 애니메이션 효과

### 네비게이션
- 공통 네비게이션 바
- 페이지별 활성 상태 표시
- 로그아웃 기능

## 🎨 디자인 시스템

### 컬러 팔레트
- Primary: #4A90E2 (파란색)
- Secondary: #50C878 (녹색)
- Danger: #E74C3C (빨간색)
- Warning: #F39C12 (주황색)
- Text Dark: #2C3E50
- Text Light: #7F8C8D

### 타이포그래피
- Font Family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Heading: 1.5rem ~ 2.5rem
- Body: 1rem
- Small: 0.85rem ~ 0.9rem

## 📱 반응형 지원

- 데스크톱: 1200px 이상
- 태블릿: 768px ~ 1199px
- 모바일: 767px 이하

## 🔧 기술 스택

- HTML5
- CSS3 (CSS Variables, Flexbox, Grid)
- Vanilla JavaScript (ES6+)
- Canvas API (차트 그리기)

## 📝 주요 JavaScript 함수

### app.js
- `StorageManager`: 로컬 스토리지 관리
- `drawRadarChart()`: 레이더 차트 그리기
- `drawCircularProgress()`: 원형 진행도 차트
- `calculateDday()`: D-Day 계산
- `formatDate()`: 날짜 포맷팅

### 페이지별 함수
- onboarding.html: 스펙 입력 및 저장
- dashboard.html: 스펙 데이터 표시 및 차트 렌더링
- goal-setting.html: 공고 검색, 스펙 비교, 업무 생성
- roadmap.html: 업무 관리, 진행도 업데이트, 캘린더 렌더링

## ⚠️ 주의사항

- 이 프로토타입은 UI/UX 확인용 데모입니다
- 실제 백엔드 연동이 없어 모든 데이터는 브라우저에 저장됩니다
- 샘플 채용 공고 데이터가 하드코딩되어 있습니다
- 실제 서비스 구현 시 서버 API 연동이 필요합니다

## 🔜 향후 개선 사항

- 백엔드 API 연동
- 실제 채용 사이트 크롤링/API 연동
- 사용자 인증 및 세션 관리
- 데이터베이스 연동
- 이메일 알림 기능
- 소셜 로그인
- 모바일 앱 버전

## 📄 라이선스

이 프로젝트는 데모/학습 목적으로 제작되었습니다.
