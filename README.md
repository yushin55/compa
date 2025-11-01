# 스텝업 (Step-Up) - 맞춤형 취업 로드맵 설계 서비스

당신의 스펙, 목표를 향한 가장 스마트한 발걸음

## 프로젝트 개요

스텝업은 사용자의 현재 스펙을 객관적으로 분석하고, 실제 기업의 채용 공고를 기반으로 한 맞춤형 목표를 설정하여, 달성을 위한 구체적인 로드맵을 제공하는 취업 준비 관리 웹 서비스입니다.

## 기술 스택

### 프론트엔드
- **Next.js 15** (App Router) - 파일 기반 라우팅 및 SSR/CSR 관리
- **React 19** - 컴포넌트 기반 UI 구현
- **TypeScript** - 정적 타입 안정성 확보
- **Tailwind CSS** - 빠르고 일관된 UI 스타일링

### API 연동
- **Fetch API** - 브라우저 내장 HTTP 클라이언트
- **x-user-id 헤더** - 간단한 사용자 식별
- **localStorage** - 로그인 후 사용자 ID 저장

### 백엔드 (이미 구축됨)
- API 서버: `http://localhost:8000`
- OpenAPI 스펙: `docs/openapi.yaml` 참조

## 프로젝트 구조

```
front/
├── docs/                          # 📚 문서 (자세한 내용은 docs/README.md 참조)
│   ├── README.md                  # 문서 인덱스
│   ├── backend-api-base.md        # 기본 백엔드 API 요구사항
│   ├── backend-api-step-up.md     # Step-Up 기능 API 요구사항
│   ├── FRONTEND_API_GUIDE.md      # 프론트엔드 API 연동 가이드
│   ├── frontend.techstack.md      # 기술 스택 명세
│   ├── openapi.yaml               # OpenAPI 3.0 스펙
│   ├── prd.md                     # 프로젝트 요구사항
│   ├── ui.spec.md                 # UI/UX 설계 명세
│   └── ui/                        # HTML/CSS 프로토타입
├── src/
│   ├── app/                       # Next.js 페이지
│   │   ├── page.tsx               # 랜딩 페이지 (/)
│   │   ├── login/                 # 로그인 (/login)
│   │   ├── register/              # 회원가입 (/register)
│   │   ├── onboarding/            # 온보딩 (/onboarding)
│   │   ├── dashboard/             # 스펙 분석 (/dashboard)
│   │   ├── goal-setting/          # 목표 설정 (/goal-setting)
│   │   ├── roadmap/               # 로드맵 관리 (/roadmap)
│   │   ├── experience/            # ⭐ 경험 아카이브 (/experience)
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   └── globals.css            # 전역 스타일
│   ├── components/                # 공통 컴포넌트
│   │   └── Navbar.tsx             # 네비게이션 바
│   ├── lib/                       # 유틸리티
│   │   ├── api.ts                 # API 클라이언트
│   │   └── utils.ts               # 유틸리티 함수 (날짜, localStorage 등)
│   └── types/                     # TypeScript 타입 정의
│       └── api.ts                 # API 타입 (OpenAPI 기반)
├── .env.local                     # 환경변수
├── next.config.js                 # Next.js 설정 (CORS 프록시)
├── tailwind.config.ts             # Tailwind CSS 설정
├── tsconfig.json                  # TypeScript 설정
└── package.json                   # 의존성 관리
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일이 자동으로 생성되어 있습니다:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. 백엔드 API 서버 실행

백엔드 서버가 `http://localhost:8000`에서 실행 중이어야 합니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어주세요.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## 주요 기능

### 1. 회원가입 및 로그인
- 아이디, 비밀번호, 이메일을 이용한 간단한 회원가입
- localStorage 기반 로그인 상태 관리

### 2. 온보딩 (스펙 입력)
4단계로 구성된 온보딩 프로세스:
- **Step 1**: 기본 정보 (이메일, 희망 직무)
- **Step 2**: 학력 및 어학 (학교, 전공, 학점, 어학 성적, 자격증)
- **Step 3**: 경험 및 활동 (프로젝트, 대외활동, 자기소개)
- **Step 4**: 완료 + 직무별 로드맵 템플릿 선택

### 3. 스펙 분석 대시보드
- 종합 통계: 어학 성적, 자격증, 프로젝트, 대외활동 개수
- **레이더 차트**: 5개 카테고리(학력, 어학, 자격증, 프로젝트, 대외활동) 시각화
- 상세 스펙 리스트: 모든 스펙 정보를 카테고리별로 표시
- **⭐ 경험 통계 섹션**: 완료한 경험 개수, 태그 클라우드, 활동 캘린더

### 4. 목표 설정
- **샘플 채용 공고**: 네이버, 카카오, 쿠팡 등 실제 기업 공고 예시
- **스펙 비교 분석**: 선택한 공고의 요구사항과 현재 스펙 비교
- **추천 업무 생성**: 격차를 메우기 위한 업무 자동 생성
  - 우선순위별 분류 (높음/보통/낮음)
- **추천 항목**: 공모전, 자격증, 어학 시험 추천

### 5. 로드맵 관리
- **목표 개요**: 선택한 공고 정보 및 D-Day 표시
- **원형 진행도 차트**: 전체 업무 진행률 시각화
- **오늘의 할 일**: 오늘 마감인 미완료 업무 표시
- **전체 업무 타임라인**: 모든 업무를 시간순으로 표시
- **업무 체크**: 클릭으로 완료/미완료 토글
- **캘린더**: 월별 업무 일정 표시
- **채용 공고 매칭**: 사용자 스펙과 매칭되는 공고 추천
- **⭐ 회고 작성**: 태스크 완료 시 회고 모달 표시
  - 배운 점, 어려웠던 점, 해결 과정, 개선점
  - 기술 스택 태그 추가
  - 관련 자료 URL 링크

### 6. ⭐ 경험 아카이브 (Step-Up)
- **경험 목록**: 완료한 태스크의 회고 모음
- **검색 및 필터링**: 제목, 태그, 기간별 검색
- **상세 보기**: 각 경험의 상세 회고 내용 표시
- **통계 대시보드**: 
  - 총 경험 개수
  - 등록된 기술 스택 개수
  - 월간 완료 개수
  - 평균 태그 수
- **태그 클라우드**: 빈도수 기반 태그 시각화
- **Markdown 내보내기**: 선택한 경험을 Markdown 파일로 다운로드

## API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

### 스펙 관리
- `GET /specs/dashboard` - 대시보드 데이터 조회
- `PUT /specs` - 스펙 정보 수정
- `PUT /specs/education` - 학력 정보 수정
- `GET/POST/DELETE /specs/languages` - 어학 성적 관리
- `GET/POST/DELETE /specs/certificates` - 자격증 관리
- `GET/POST/PUT/DELETE /specs/projects` - 프로젝트 관리
- `GET/POST/PUT/DELETE /specs/activities` - 대외활동 관리

### 목표 관리
- `GET/POST/PUT/DELETE /goals` - 목표 관리
- `GET /goals/gap-analysis` - 격차 분석

### 로드맵 관리
- `GET /roadmap/progress` - 진행도 조회
- `GET/POST/PUT/DELETE /tasks` - 업무 관리
- `PATCH /tasks/{id}/complete` - 업무 완료 처리
- `PATCH /tasks/{id}/incomplete` - 업무 미완료 처리
- `GET /tasks/today` - 오늘의 할 일 조회

## CORS 설정

개발 환경에서 `localhost:8000` (백엔드)와 `localhost:3000` (프론트엔드) 간의 CORS 이슈를 해결하기 위해 Next.js 프록시를 사용합니다.

`next.config.js`:
```javascript
async rewrites() {
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  }
  return [];
}
```

## 데이터 흐름

1. **사용자 등록/로그인**
   - 회원가입 → 로그인 → `user_id`를 localStorage에 저장
   
2. **온보딩**
   - 4단계 스펙 입력 → API로 저장 → `onboarding_completed = true`
   
3. **스펙 분석**
   - `/specs/dashboard` API 호출 → 레이더 차트 렌더링
   
4. **목표 설정**
   - 샘플 공고 선택 → 스펙 비교 → 목표 저장 → 업무 생성
   
5. **로드맵 관리**
   - `/roadmap/progress` 조회 → 업무 표시 → 체크 시 완료 처리

## 스타일링

### Tailwind CSS 커스텀 컬러
```javascript
colors: {
  primary: '#4A90E2',          // 메인 파란색
  'primary-dark': '#357ABD',   // 진한 파란색
  secondary: '#50C878',        // 녹색 (성공)
  danger: '#E74C3C',           // 빨간색 (위험)
  warning: '#F39C12',          // 주황색 (경고)
  'text-dark': '#2C3E50',      // 주요 텍스트
  'text-light': '#7F8C8D',     // 보조 텍스트
  'bg-light': '#F8F9FA',       // 밝은 배경
  'border-color': '#E0E0E0',   // 테두리
}
```

### 커스텀 클래스
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`
- `.card`
- `.form-group`, `.form-label`, `.form-control`
- `.badge`, `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`
- `.alert`, `.alert-success`, `.alert-info`, `.alert-warning`

## 차트 렌더링

### 레이더 차트 (대시보드)
Canvas API를 사용하여 5각형 레이더 차트 구현:
- 배경 그리드 (5단계)
- 축 그리기
- 데이터 영역 채우기 (반투명 파란색)
- 데이터 포인트 표시

### 원형 진행도 차트 (로드맵)
Canvas API를 사용하여 원형 진행도 차트 구현:
- 배경 원 (회색)
- 진행도 원 (그라데이션)
- 중앙 퍼센트 텍스트

## 주의사항

- **테스트 코드 없음**: 요구사항에 따라 테스트는 생략되었습니다.
- **인증 간소화**: JWT 대신 `x-user-id` 헤더 사용 (실제 프로덕션에서는 적절한 인증 시스템 필요)
- **샘플 데이터**: 채용 공고는 하드코딩된 샘플 데이터입니다.
- **백엔드 필수**: 프론트엔드만으로는 동작하지 않으며, 백엔드 API 서버가 필요합니다.

## 트러블슈팅

### 1. CORS 에러
- 백엔드 서버가 `localhost:8000`에서 실행 중인지 확인
- `next.config.js`의 프록시 설정 확인
- 개발 환경에서만 프록시가 작동함

### 2. API 에러
- 백엔드 서버 상태 확인
- 브라우저 개발자 도구 Network 탭에서 요청/응답 확인
- `x-user-id` 헤더가 올바르게 설정되었는지 확인

### 3. localStorage 에러
- 시크릿 모드에서는 localStorage 사용 제한
- 로그아웃 후 다시 로그인 시도

## 최근 업데이트 (2024-01-15)

### ✅ 완료된 기능
- [x] 경험 아카이빙 시스템 (Step-Up)
- [x] 회고 작성 모달
- [x] 태그 시스템 및 클라우드 시각화
- [x] GitHub 스타일 활동 캘린더 (잔디)
- [x] Markdown 내보내기
- [x] 디자인 통일 (모던, 전문적 스타일)
- [x] localStorage 유틸리티 함수
- [x] 직무별 로드맵 템플릿

### 🔧 코드 개선
- TypeScript 에러 수정 (타입 안정성 강화)
- 불필요한 컴포넌트 제거 (Button, Card, PageHeader)
- localStorage 사용 최적화 (storage 유틸리티)
- 문서 구조 정리 (docs/README.md 추가)

## 향후 개선 사항

### 백엔드 통합 (우선순위 높음)
- [ ] 경험 관리 API 연동
- [ ] 회고 데이터 영구 저장
- [ ] 태그 통계 API
- [ ] 활동 캘린더 API
- [ ] PDF 내보내기 API

### 기능 개선
- [ ] 칸반 보드 뷰 (To-do, In-Progress, Done)
- [ ] 실시간 채용 공고 크롤링
- [ ] AI 기반 스펙 분석 및 추천
- [ ] 드래그 앤 드롭으로 업무 순서 변경
- [ ] 업무별 상세 메모 기능
- [ ] 이메일 알림 기능

### UX/UI 개선
- [ ] 다크 모드 지원
- [ ] 반응형 모바일 최적화
- [ ] 접근성 향상 (ARIA 레이블)

### 확장 기능
- [ ] 소셜 로그인 (Google, Kakao)
- [ ] 커뮤니티 기능
- [ ] 경험 공유 기능

## 라이선스

이 프로젝트는 교육 목적으로 만들어졌습니다.

## 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
