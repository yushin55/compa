# 스텝업(Step-Up) UI 설계 명세서

> 맞춤형 취업 로드맵 설계 서비스 '스텝업(Step-Up)'의 UI/UX 설계 상세 명세서

## 목차
1. [디자인 시스템](#1-디자인-시스템)
2. [공통 컴포넌트](#2-공통-컴포넌트)
3. [화면별 상세 설계](#3-화면별-상세-설계)
4. [인터랙션 및 애니메이션](#4-인터랙션-및-애니메이션)
5. [데이터 관리](#5-데이터-관리)
6. [반응형 디자인](#6-반응형-디자인)

---

## 1. 디자인 시스템

### 1.1 컬러 팔레트
```css
--primary-color: #4A90E2      /* 메인 파란색 - CTA, 링크, 강조 */
--secondary-color: #50C878    /* 서브 녹색 - 완료, 성공 상태 */
--danger-color: #E74C3C       /* 위험/오류 - 빨간색 */
--warning-color: #F39C12      /* 경고 - 주황색 */
--text-dark: #2C3E50          /* 주요 텍스트 */
--text-light: #7F8C8D         /* 보조 텍스트, 힌트 */
--bg-light: #F8F9FA           /* 밝은 배경 */
--border-color: #E0E0E0       /* 테두리 */
```

### 1.2 타이포그래피
- **폰트 패밀리**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **라인 높이**: 1.6
- **크기 체계**:
  - 제목(H1): 2.5rem (40px)
  - 제목(H2): 1.75rem (28px)
  - 제목(H3): 1.5rem (24px)
  - 카드 제목: 1.25rem (20px)
  - 본문: 1rem (16px)
  - 작은 텍스트: 0.85rem ~ 0.9rem (13.6px ~ 14.4px)

### 1.3 간격 체계
- 기본 단위: 1rem (16px)
- 작은 간격: 0.5rem (8px)
- 중간 간격: 1rem (16px)
- 큰 간격: 1.5rem (24px)
- 섹션 간격: 2rem ~ 3rem (32px ~ 48px)

### 1.4 그림자 효과
```css
--shadow: 0 2px 8px rgba(0, 0, 0, 0.1)           /* 기본 그림자 */
--shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.15)   /* 호버 시 그림자 */
```

### 1.5 모서리 둥글기
- 버튼: 8px
- 카드: 12px
- 입력 필드: 8px
- 배지: 20px (원형)
- 큰 카드: 16px

---

## 2. 공통 컴포넌트

### 2.1 네비게이션 바 (navbar)
**위치**: 상단 고정 (sticky)
**구성 요소**:
- 로고 (🎯 스텝업)
  - 크기: 1.5rem
  - 색상: primary-color
  - 클릭 시: roadmap.html로 이동
- 네비게이션 링크
  - 로드맵
  - 내 스펙
  - 목표 설정
  - 로그아웃
- 스타일:
  - 배경: 흰색
  - 그림자: var(--shadow)
  - 패딩: 1rem 0
  - z-index: 100

**인터랙션**:
- 링크 호버 시 색상 변경 (primary-color)
- 현재 페이지 활성화 표시 (진한 폰트, primary-color)

### 2.2 버튼 컴포넌트 (.btn)
**기본 스타일**:
- 패딩: 0.75rem 1.5rem
- 모서리: 8px 둥글게
- 폰트 크기: 1rem
- 폰트 굵기: 600
- 전환 효과: 0.3s

**버튼 유형**:

#### 2.2.1 Primary 버튼 (.btn-primary)
- 배경: #4A90E2
- 텍스트: 흰색
- 호버: 배경 #3A7BC8, shadow-hover

#### 2.2.2 Secondary 버튼 (.btn-secondary)
- 배경: #50C878
- 텍스트: 흰색
- 호버: 배경 #40B868

#### 2.2.3 Outline 버튼 (.btn-outline)
- 배경: 투명
- 테두리: 2px solid primary-color
- 텍스트: primary-color
- 호버: 배경 primary-color, 텍스트 흰색

#### 2.2.4 Danger 버튼 (.btn-danger)
- 배경: #E74C3C
- 텍스트: 흰색

### 2.3 카드 컴포넌트 (.card)
**기본 스타일**:
- 배경: 흰색
- 모서리: 12px 둥글게
- 패딩: 2rem
- 그림자: var(--shadow)
- 전환: transform 0.3s, box-shadow 0.3s

**호버 효과**:
- transform: translateY(-4px)
- box-shadow: var(--shadow-hover)

**카드 제목** (.card-title):
- 크기: 1.25rem
- 굵기: 600
- 하단 마진: 1rem

### 2.4 폼 요소

#### 2.4.1 폼 그룹 (.form-group)
- 하단 마진: 1.5rem
- 레이블:
  - display: block
  - 하단 마진: 0.5rem
  - 굵기: 500

#### 2.4.2 입력 필드 (.form-control)
- 너비: 100%
- 패딩: 0.75rem
- 테두리: 1px solid border-color
- 모서리: 8px
- 포커스 시: 테두리 primary-color

#### 2.4.3 텍스트 영역 (textarea)
- 최소 높이: 100px
- 수직 크기 조절 가능

#### 2.4.4 선택 박스 (select)
- cursor: pointer

#### 2.4.5 체크박스/라디오 (.checkbox-group, .radio-group)
- display: flex
- gap: 0.5rem
- 하단 마진: 0.75rem

### 2.5 배지 컴포넌트 (.badge)
**기본 스타일**:
- display: inline-block
- 패딩: 0.25rem 0.75rem
- 모서리: 20px (완전 둥글게)
- 크기: 0.85rem
- 굵기: 600

**배지 유형**:
- **Success** (.badge-success): 배경 #D4EDDA, 텍스트 #155724
- **Warning** (.badge-warning): 배경 #FFF3CD, 텍스트 #856404
- **Danger** (.badge-danger): 배경 #F8D7DA, 텍스트 #721C24
- **Info** (.badge-info): 배경 #D1ECF1, 텍스트 #0C5460

### 2.6 알림 컴포넌트 (.alert)
**기본 스타일**:
- 패딩: 1rem 1.5rem
- 모서리: 8px
- 하단 마진: 1.5rem
- 좌측 테두리: 4px solid

**알림 유형**:
- **Success**: 배경 #D4EDDA, 테두리 #28A745
- **Info**: 배경 #D1ECF1, 테두리 #17A2B8
- **Warning**: 배경 #FFF3CD, 테두리 #FFC107

### 2.7 그리드 시스템
**기본 그리드** (.grid):
- display: grid
- gap: 1.5rem

**그리드 변형**:
- **.grid-2**: 2열 그리드
- **.grid-3**: 3열 그리드
- **.grid-4**: 4열 그리드

### 2.8 진행도 바 (.progress-bar)
**구조**:
- 컨테이너:
  - 너비: 100%
  - 높이: 10px
  - 배경: bg-light
  - 모서리: 10px
- 진행 표시 (.progress-fill):
  - 높이: 100%
  - 배경: linear-gradient(90deg, primary-color, secondary-color)
  - 전환: width 0.3s

### 2.9 페이지 헤더 (.page-header)
**스타일**:
- 패딩: 3rem 0
- 배경: linear-gradient(135deg, primary-color, #357ABD)
- 텍스트: 흰색
- 정렬: 중앙

**구성**:
- H1: 2.5rem, 하단 마진 0.5rem
- P: 1.1rem, 투명도 0.9

---

## 3. 화면별 상세 설계

### 3.1 랜딩 페이지 (index.html)

#### 레이아웃
- **전체 컨테이너** (.landing-container):
  - 최소 높이: 100vh
  - 배경: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  - 중앙 정렬

#### UI 요소

##### 3.1.1 헤더 영역
- **로고** (.landing-logo): 
  - 이모지: 🎯
  - 크기: 5rem
  - 하단 마진: 1rem

- **타이틀** (.landing-title):
  - 텍스트: "스텝업"
  - 크기: 3.5rem
  - 굵기: bold
  - 색상: 흰색

- **슬로건** (.landing-slogan):
  - 텍스트: "당신의 스펙, 목표를 향한 가장 스마트한 발걸음"
  - 크기: 1.5rem
  - 투명도: 0.95

##### 3.1.2 기능 소개 (.landing-features)
- **레이아웃**: 3열 그리드
- **간격**: 2rem
- **상하 마진**: 3rem

**기능 카드** (.feature-card):
1. **스펙 분석**
   - 아이콘: 📊
   - 제목: "스펙 분석"
   - 설명: "현재 역량을 객관적으로 분석하고 시각화하여 강점과 약점을 파악"

2. **목표 설정**
   - 아이콘: 🎯
   - 제목: "목표 설정"
   - 설명: "실제 채용 공고 기반으로 명확한 목표를 설정하고 격차 분석"

3. **로드맵 관리**
   - 아이콘: 📅
   - 제목: "로드맵 관리"
   - 설명: "체계적인 일정 관리와 진행도 추적으로 목표 달성 지원"

**카드 스타일**:
- 배경: rgba(255, 255, 255, 0.1)
- backdrop-filter: blur(10px)
- 패딩: 2rem
- 모서리: 12px
- 호버: translateY(-8px), 배경 rgba(255, 255, 255, 0.15)

##### 3.1.3 CTA 버튼 (.landing-cta)
- **레이아웃**: Flex, 중앙 정렬
- **간격**: 1.5rem
- **버튼**:
  1. 로그인 (흰색 배경, primary-color 텍스트)
  2. 회원가입 (반투명 배경, 흰색 테두리)

##### 3.1.4 데모 가이드 (.demo-note)
- **배경**: rgba(255, 255, 255, 0.1)
- **패딩**: 1.5rem
- **모서리**: 12px
- **리스트 항목**:
  - 회원가입/로그인 후 온보딩 프로세스를 통해 스펙을 입력하세요
  - 대시보드에서 현재 스펙을 시각적으로 확인할 수 있습니다
  - 목표 설정 페이지에서 샘플 채용 공고를 선택하여 로드맵을 생성하세요
  - 메인 로드맵 페이지에서 진행 상황을 관리하고 업무를 체크하세요
  - 모든 데이터는 브라우저 로컬 스토리지에 저장됩니다

---

### 3.2 로그인 페이지 (login.html)

#### 레이아웃
- **전체 컨테이너** (.login-container):
  - 최소 높이: 100vh
  - 배경: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
  - 중앙 정렬

#### UI 요소

##### 3.2.1 로그인 박스 (.login-box)
- 배경: 흰색
- 모서리: 16px
- 패딩: 3rem
- 그림자: 0 10px 40px rgba(0, 0, 0, 0.2)
- 최대 너비: 400px

##### 3.2.2 헤더 (.login-header)
- 정렬: 중앙
- **제목**: 
  - 텍스트: "🎯 스텝업"
  - 크기: 2rem
  - 색상: primary-color
- **부제목**: 
  - 텍스트: "당신의 스펙, 목표를 향한 가장 스마트한 발걸음"
  - 크기: 0.95rem
  - 색상: text-light

##### 3.2.3 로그인 폼 (.login-form)
**입력 필드**:
1. **아이디**
   - ID: username
   - Type: text
   - Placeholder: "아이디를 입력하세요"
   - Required: true

2. **비밀번호**
   - ID: password
   - Type: password
   - Placeholder: "비밀번호를 입력하세요"
   - Required: true

**링크 영역** (.login-links):
- 레이아웃: space-between
- 아이디/비밀번호 찾기 링크

**제출 버튼**:
- 텍스트: "로그인"
- 스타일: btn-primary
- 너비: 100%

**회원가입 링크** (.register-link):
- 텍스트: "아직 회원이 아니신가요? 회원가입"
- 정렬: 중앙
- 상단 마진: 1.5rem

#### 기능
- 로그인 처리 함수: `handleLogin(event)`
- localStorage에 로그인 상태 저장
- 온보딩 완료 여부에 따라 리다이렉트
  - 완료: roadmap.html
  - 미완료: onboarding.html

---

### 3.3 회원가입 페이지 (register.html)

#### 레이아웃
- **전체 컨테이너** (.register-container): login-container와 동일
- **회원가입 박스** (.register-box): 최대 너비 500px

#### UI 요소

##### 3.3.1 헤더 (.register-header)
- 제목: "🎯 스텝업 회원가입"
- 부제목: "목표를 향한 첫 걸음을 시작하세요"

##### 3.3.2 회원가입 폼 (.register-form)
**입력 필드**:
1. **아이디** (필수)
   - Placeholder: "아이디를 입력하세요"

2. **이메일** (필수)
   - Type: email
   - Placeholder: "example@email.com"

3. **비밀번호** (필수)
   - Type: password
   - 힌트: "영문, 숫자, 특수문자 포함 8자 이상"

4. **비밀번호 확인** (필수)
   - Type: password
   - Placeholder: "비밀번호를 다시 입력하세요"

##### 3.3.3 약관 동의 (.terms-group)
- 배경: bg-light
- 패딩: 1rem
- 모서리: 8px

**체크박스 목록**:
1. 전체 약관 동의 (토글 기능)
2. 이용약관 동의 (필수)
3. 개인정보 처리방침 동의 (필수)
4. 마케팅 정보 수신 동의 (선택)

##### 3.3.4 제출 버튼
- 텍스트: "회원가입"
- 스타일: btn-primary
- 너비: 100%

##### 3.3.5 로그인 링크
- 텍스트: "이미 계정이 있으신가요? 로그인"

#### 기능
- 전체 약관 동의 토글: `toggleAllTerms(checkbox)`
- 회원가입 처리: `handleRegister(event)`
- 비밀번호 일치 검증
- 필수 약관 동의 검증
- 완료 시 login.html로 리다이렉트

---

### 3.4 온보딩 페이지 (onboarding.html)

#### 레이아웃
- **전체 컨테이너** (.onboarding-container):
  - 배경: bg-light
  - 최소 높이: 100vh

#### UI 요소

##### 3.4.1 진행도 섹션 (.progress-section)
- **위치**: 상단 고정 (sticky)
- **배경**: 흰색
- **그림자**: var(--shadow)
- **z-index**: 50

**단계 표시기** (.step-indicator):
- 레이아웃: 4개 단계를 가로로 배치
- 최대 너비: 800px

**단계 구성**:
1. **기본정보**
   - 원형 번호: 1
   - 레이블: "기본정보"

2. **학력/어학**
   - 원형 번호: 2
   - 레이블: "학력/어학"

3. **경험/활동**
   - 원형 번호: 3
   - 레이블: "경험/활동"

4. **완료**
   - 원형 번호: 4
   - 레이블: "완료"

**단계 원** (.step-circle):
- 크기: 30px × 30px
- 기본: border-color 배경
- 활성: primary-color 배경
- 완료: secondary-color 배경

**연결선**:
- 너비: 100%
- 높이: 2px
- 색상: border-color

##### 3.4.2 폼 섹션 (.form-section)
- 최대 너비: 800px
- 중앙 정렬
- 상단 마진: 3rem

##### 3.4.3 Step 1: 기본 정보
**섹션 카드** (.section-card):

**입력 필드**:
1. **이메일 주소**
   - 자동 입력 (읽기 전용)
   - 값: user@example.com

2. **희망 직무 분야** (필수)
   - Type: select
   - 옵션:
     - 프론트엔드 개발
     - 백엔드 개발
     - 풀스택 개발
     - 데이터 분석
     - AI/ML 엔지니어
     - 마케팅
     - 기획
     - 디자인

**액션 버튼**:
- "다음 단계" 버튼 (btn-primary)

##### 3.4.4 Step 2: 학력 및 어학
**학력 정보 카드**:

**입력 필드** (2열 그리드):
1. **학교명** (필수)
   - Placeholder: "예: 서울대학교"

2. **전공** (필수)
   - Placeholder: "예: 컴퓨터공학"

3. **학점** (필수)
   - Placeholder: "예: 4.0 / 4.5"

4. **졸업 여부** (필수)
   - Type: select
   - 옵션: 졸업, 졸업 예정, 재학 중

**어학 능력 카드**:
- 동적 리스트 (.item-list)
- 추가 버튼 (.add-more-btn):
  - 텍스트: "+ 어학 성적 추가"
  - 스타일: 점선 테두리, bg-light 배경

**어학 항목** (.item-card):
- 구조:
  - 어학 종류 + 점수 (굵은 텍스트)
  - 취득일 (작은 텍스트)
  - 삭제 버튼 (빨간색)

**자격증 카드**:
- 어학 능력과 동일한 구조
- 추가 버튼: "+ 자격증 추가"

**액션 버튼**:
- "이전" (btn-outline)
- "다음 단계" (btn-primary)

##### 3.4.5 Step 3: 경험 및 활동
**프로젝트 경험 카드**:
- 동적 리스트
- 추가 버튼: "+ 프로젝트 추가"
- 항목 구조:
  - 프로젝트명
  - 역할 | 기간

**대외활동 카드**:
- 동적 리스트
- 추가 버튼: "+ 활동 추가"
- 항목 구조:
  - 활동명
  - 유형 | 기간

**자기소개 카드**:
- **입력 필드**:
  - Type: textarea
  - Rows: 6
  - Placeholder: "자신을 어필할 수 있는 핵심 역량 및 경험을 간략히 기술해주세요."

**액션 버튼**:
- "이전" (btn-outline)
- "완료" (btn-secondary)

##### 3.4.6 Step 4: 완료
**완료 화면**:
- 이모지: 🎉 (크기: 3rem)
- 제목: "스펙 등록 완료!"
- 설명: "입력하신 스펙을 바탕으로 맞춤형 분석을 제공합니다."
- 버튼: "내 스펙 분석 보기" (dashboard.html로 이동)

#### 기능
- 단계 이동: `goToStep(step)`
- 어학 추가: `addLanguage()`
- 자격증 추가: `addCertificate()`
- 프로젝트 추가: `addProject()`
- 활동 추가: `addActivity()`
- 온보딩 완료: `completeOnboarding()`
- 데이터 저장: StorageManager.saveSpec()

---

### 3.5 스펙 분석 대시보드 (dashboard.html)

#### 레이아웃
- **네비게이션 바**: 포함
- **페이지 헤더**:
  - 제목: "내 스펙 분석"
  - 부제목: "현재 나의 역량을 한눈에 확인하세요"

#### UI 요소

##### 3.5.1 통계 카드 그리드 (.stats-grid)
- **레이아웃**: 자동 맞춤 4열 (최소 250px)
- **간격**: 1.5rem

**통계 카드** (.stat-card):
1. **어학 성적**
   - 값: 등록된 어학 성적 개수
   - 단위: "개"

2. **자격증**
   - 값: 등록된 자격증 개수
   - 단위: "개"

3. **프로젝트**
   - 값: 등록된 프로젝트 개수
   - 단위: "개"

4. **대외활동**
   - 값: 등록된 활동 개수
   - 단위: "개"

**카드 스타일**:
- 배경: 흰색
- 정렬: 중앙
- 값 크기: 2rem, primary-color
- 레이블 크기: 0.9rem, text-light

##### 3.5.2 종합 스펙 분석 차트 (.chart-section)
**차트 컨테이너** (.chart-container):
- 최소 높이: 400px
- 중앙 정렬

**레이더 차트** (Canvas):
- 크기: 400×400px
- 카테고리:
  1. 학력
  2. 어학
  3. 자격증
  4. 프로젝트
  5. 대외활동

**차트 스타일**:
- 배경 그리드: 5단계, #E0E0E0
- 축: #CCCCCC
- 데이터 영역: rgba(74, 144, 226, 0.3)
- 테두리: #4A90E2, 2px
- 데이터 포인트: #4A90E2, 4px 원

##### 3.5.3 상세 스펙 리스트 (.spec-list-section)
**섹션 구성**:

1. **학력 정보** (📚)
   - 카테고리 헤더
   - 스펙 항목:
     - 학교명 - 전공
     - 학점 | 졸업 여부

2. **어학 능력** (🌐)
   - 스펙 항목:
     - 어학 종류 + 점수
     - 취득일
     - 배지: "보유" (badge-success)

3. **자격증** (🏆)
   - 스펙 항목:
     - 자격증명
     - 취득일
     - 배지: "보유" (badge-success)

4. **프로젝트 경험** (💼)
   - 스펙 항목:
     - 프로젝트명
     - 역할 | 기간
     - 배지: "완료" (badge-info)

5. **대외활동** (🎯)
   - 스펙 항목:
     - 활동명
     - 유형 | 기간
     - 배지: "완료" (badge-info)

**스펙 항목 스타일** (.spec-item):
- 배경: bg-light
- 패딩: 1rem
- 모서리: 8px
- 레이아웃: space-between

**빈 상태** (.empty-state):
- 텍스트: "등록된 [항목]이 없습니다"
- 정렬: 중앙
- 색상: text-light

##### 3.5.4 CTA 섹션 (.cta-section)
- 배경: linear-gradient(135deg, primary-color, #357ABD)
- 텍스트: 흰색
- 모서리: 12px
- 패딩: 2rem

**내용**:
- 제목: "이제 목표를 설정해보세요!"
- 설명: "실제 채용 공고를 기반으로 당신만의 로드맵을 만들어보세요"
- 버튼: "목표 설정하기" (btn-secondary)

#### 기능
- 데이터 로드: StorageManager.getSpec()
- 통계 계산 및 표시
- 레이더 차트 렌더링: drawRadarChart()
- 점수 계산: calculateScore()

---

### 3.6 목표 설정 페이지 (goal-setting.html)

#### 레이아웃
- **네비게이션 바**: 포함
- **페이지 헤더**:
  - 제목: "목표 설정"
  - 부제목: "원하는 채용 공고를 선택하고 맞춤형 로드맵을 만드세요"

#### UI 요소

##### 3.6.1 채용 공고 검색 섹션 (.search-section)
**검색 박스** (.search-box):
- 레이아웃: Flex
- 간격: 1rem

**입력 필드**:
- Placeholder: "회사명 또는 직무를 입력하세요 (예: 네이버, 프론트엔드)"
- Flex: 1

**검색 버튼**:
- 텍스트: "검색"
- 스타일: btn-primary

##### 3.6.2 채용 공고 리스트 (.job-list)
**공고 카드** (.job-card):

**구조**:
1. **헤더** (.job-header)
   - 회사명 (.company-name): primary-color
   - 직무명 (.job-title): 1.25rem, 굵게
   - 경력 배지 (badge-info)

2. **메타 정보** (.job-meta)
   - 위치: 📍 지역명
   - 마감일: 📅 날짜

3. **자격요건** (.job-requirements)
   - 제목: "자격요건"
   - 리스트: 최대 3개 항목
   - 스타일: 불릿 포인트(•)

**카드 스타일**:
- 배경: bg-light
- 패딩: 1.5rem
- 테두리: 2px solid transparent
- 호버: primary-color 테두리, translateY(-2px)
- 선택됨: primary-color 테두리, 반투명 파란 배경

**샘플 공고**:
1. **네이버 - 신입 프론트엔드 개발자**
   - 위치: 경기 성남시
   - 마감: 2025-11-30
   - 자격요건: HTML/CSS/JS, React/Vue.js, 웹 접근성, Git

2. **카카오 - 주니어 마케터**
   - 위치: 제주도
   - 마감: 2025-12-15
   - 자격요건: 디지털 마케팅, SNS 운영, 데이터 분석, 자격증

3. **쿠팡 - 신입 백엔드 개발자**
   - 위치: 서울 송파구
   - 마감: 2025-11-20
   - 자격요건: Java/Python, RESTful API, DB, 정보처리기사

##### 3.6.3 스펙 비교 분석 섹션 (.analysis-section)
**표시 조건**: 공고 선택 시에만 표시

**비교 그리드** (.comparison-grid):
- 레이아웃: 2열
- 간격: 2rem

**좌측 열: 필요한 스펙**
- 제목: "📋 필요한 스펙"
- 항목 (.comparison-item):
  - 충족: 녹색 배경, ✅ 아이콘
  - 부분 충족: 노란 배경, ⚠️ 아이콘
  - 미충족: 빨간 배경, ❌ 아이콘

**우측 열: 내 현재 스펙**
- 제목: "✅ 내 현재 스펙"
- 항목:
  - 학력 정보
  - 어학 성적
  - 자격증
  - 프로젝트
- 모두 녹색 배경, ✅ 아이콘

##### 3.6.4 추천 업무 섹션 (.task-section)
**업무 카드** (.task-card):

**구조**:
- 좌측: 업무 정보
  - 제목 (굵게)
  - 설명 (작은 텍스트)
- 우측: 우선순위 배지

**우선순위 스타일**:
- **높음** (.priority-high): 빨간 배경
- **보통** (.priority-medium): 노란 배경
- **낮음** (.priority-low): 파란 배경

**샘플 업무**:
1. 이력서 및 포트폴리오 업데이트 (높음)
2. 기술 역량 강화 (높음)
3. 자격증 취득 (보통)
4. 프로젝트 경험 쌓기 (보통)
5. 어학 점수 향상 (낮음)

**CTA 버튼**:
- 텍스트: "이 목표로 시작하기"
- 스타일: btn-secondary
- 정렬: 중앙

#### 기능
- 샘플 공고 데이터 표시: displayJobs()
- 공고 검색: searchJobs()
- 공고 선택: selectJob(jobId)
- 스펙 분석: analyzeSpecs(job)
- 요구사항 확인: checkRequirement(requirement)
- 업무 생성: generateTasks(job)
- 목표 확정: confirmGoal()

---

### 3.7 로드맵 관리 페이지 (roadmap.html)

#### 레이아웃
- **네비게이션 바**: 포함
- **메인 컨텐츠**: bg-light 배경

#### UI 요소

##### 3.7.1 목표 개요 (.goal-overview)
**스타일**:
- 배경: linear-gradient(135deg, primary-color, #357ABD)
- 텍스트: 흰색
- 패딩: 2rem
- 모서리: 12px

**헤더** (.goal-header):
- 레이아웃: space-between

**좌측: 목표 정보**
- 제목: 직무명 (1.75rem)
- 부제목: 회사명 · 지역 (1.1rem, 투명도 0.9)

**우측: D-Day 배지** (.dday-badge):
- 배경: 흰색
- 텍스트: danger-color
- 패딩: 0.75rem 1.5rem
- 크기: 1.5rem
- 굵기: bold

**진행도 개요** (.progress-overview):
- 레이아웃: 2열 (250px + 1fr)
- 간격: 2rem

**좌측: 원형 진행도 차트**
- Canvas: 250×250px
- 배경 원: #E0E0E0, 15px
- 진행도 원: 그라데이션 (primary → secondary), 15px
- 중앙 텍스트: 퍼센트 (32px, bold)

**우측: 진행도 통계** (.progress-stats):
- 레이아웃: 3열 그리드
- 간격: 1rem

**통계 항목** (.stat-item):
1. **전체 업무**: 총 업무 개수
2. **완료**: 완료된 업무 개수
3. **남은 업무**: 미완료 업무 개수

**스타일**:
- 배경: rgba(255, 255, 255, 0.2)
- 패딩: 1rem
- 모서리: 8px
- 값 크기: 2rem

##### 3.7.2 컨텐츠 그리드 (.content-grid)
- 레이아웃: 2fr 1fr (메인 + 사이드바)
- 간격: 2rem

##### 3.7.3 메인 섹션
**오늘의 할 일 카드**:
- 헤더:
  - 제목: "📝 오늘의 할 일"
  - 배지: 오늘 할 일 개수

**업무 항목** (.task-item):
- 레이아웃: Flex
- 배경: bg-light
- 패딩: 1rem
- 모서리: 8px
- 호버: translateX(4px), 파란 배경

**구조**:
- 체크박스 (24×24px)
- 업무 내용:
  - 업무명 (굵게)
  - 마감일 (작은 텍스트)

**완료 상태** (.completed):
- 투명도: 0.6
- 텍스트 장식: line-through

**전체 업무 타임라인 카드**:

**타임라인** (.timeline):
- 좌측 패딩: 2rem
- 세로선: 2px, border-color

**타임라인 항목** (.timeline-item):
- 포인트: 12px 원, primary-color
- 완료: secondary-color
- 좌측 패딩: 1.5rem
- 하단 마진: 2rem

**구조**:
- 날짜 (작은 텍스트)
- 내용 (.timeline-content):
  - 배경: bg-light
  - 패딩: 1rem
  - 모서리: 8px
  - 제목 (굵게)
  - 상태 (작은 텍스트)

##### 3.7.4 사이드바 섹션
**캘린더 카드**:
- 제목: "📆 캘린더"

**캘린더 뷰** (.calendar-view):
- 레이아웃: 7열 그리드
- 간격: 0.5rem

**요일 헤더** (.calendar-header):
- 텍스트: 일~토
- 정렬: 중앙
- 굵기: 600

**날짜 셀** (.calendar-day):
- 종횡비: 1:1
- 배경: bg-light
- 모서리: 8px
- 정렬: 중앙
- 크기: 0.85rem

**날짜 상태**:
- 오늘 (.today): primary-color 테두리 2px
- 업무 있음 (.has-task): primary-color 배경, 흰색 텍스트
- 호버: 파란 배경

**빠른 실행 카드**:
- 제목: "⚡ 빠른 실행"

**액션 버튼** (.action-btn):
- 레이아웃: Flex, 좌측 정렬
- 간격: 0.75rem
- 배경: bg-light
- 패딩: 1rem
- 모서리: 8px
- 호버: translateX(4px), 파란 배경

**버튼 목록**:
1. 🎯 목표 변경하기
2. 📊 내 스펙 보기
3. ➕ 새 업무 추가
4. 📥 진행상황 내보내기

#### 기능
- 목표 데이터 표시: displayGoal()
- 업무 표시: displayTasks()
- 업무 토글: toggleTask(taskId)
- 진행도 업데이트: updateProgress()
- 캘린더 렌더링: renderCalendar()
- 업무 추가: addNewTask()
- 진행상황 내보내기: exportProgress()

---

## 4. 인터랙션 및 애니메이션

### 4.1 전환 효과
**전역 전환**:
- 버튼: all 0.3s
- 카드: transform 0.3s, box-shadow 0.3s
- 입력 필드: border-color 0.3s
- 진행도 바: width 0.3s

### 4.2 호버 효과
**버튼**:
- 배경색 변경
- 그림자 증가 (shadow-hover)

**카드**:
- transform: translateY(-4px)
- 그림자 증가

**링크**:
- 색상 변경 (primary-color)

**업무 항목**:
- transform: translateX(4px)
- 배경색 변경

### 4.3 클릭 효과
**체크박스**:
- 업무 완료 시:
  - 투명도 0.6
  - 취소선 추가

**공고 카드**:
- 선택 시:
  - 테두리 primary-color
  - 배경 반투명 파란색

### 4.4 페이지 전환
**온보딩 단계**:
- 이전 단계 숨기기: .hidden 클래스
- 새 단계 표시: .hidden 제거
- 스크롤 최상단으로 이동

### 4.5 차트 애니메이션
**레이더 차트**:
- Canvas API로 그리기
- 데이터 포인트 순차 연결

**원형 진행도**:
- 배경 원 그리기
- 진행도 원 그리기 (애니메이션)
- 중앙 텍스트 표시

---

## 5. 데이터 관리

### 5.1 로컬 스토리지 구조
**StorageManager 객체**:

```javascript
{
  saveSpec(specData)    // 스펙 데이터 저장
  getSpec()            // 스펙 데이터 조회
  saveGoal(goalData)   // 목표 데이터 저장
  getGoal()            // 목표 데이터 조회
  saveTasks(tasks)     // 업무 목록 저장
  getTasks()           // 업무 목록 조회
  clear()              // 전체 데이터 삭제
}
```

### 5.2 데이터 스키마

#### 사용자 스펙 (userSpec)
```javascript
{
  jobField: string,           // 희망 직무
  education: {
    school: string,
    major: string,
    gpa: string,
    graduation: string
  },
  languages: [                // 어학 능력
    { type, score, date }
  ],
  certificates: [             // 자격증
    { name, date }
  ],
  projects: [                 // 프로젝트
    { name, role, period }
  ],
  activities: [               // 대외활동
    { name, type, period }
  ],
  introduction: string        // 자기소개
}
```

#### 목표 데이터 (userGoal)
```javascript
{
  job: {                      // 선택한 채용 공고
    id, title, company, location,
    deadline, experience,
    requirements, preferred
  },
  setDate: string,            // 설정 날짜
  tasks: [                    // 생성된 업무
    { id, title, completed, dueDate }
  ]
}
```

#### 업무 목록 (userTasks)
```javascript
[
  {
    id: number,
    title: string,
    completed: boolean,
    dueDate: string           // YYYY-MM-DD
  }
]
```

### 5.3 유틸리티 함수

#### 날짜 관련
```javascript
formatDate(date)              // YYYY.MM.DD 형식
calculateDday(targetDate)     // D-Day 계산
```

#### 차트 그리기
```javascript
drawRadarChart(canvasId, data)           // 레이더 차트
drawCircularProgress(canvasId, percentage) // 원형 진행도
```

#### 폼 검증
```javascript
validateForm(formId)          // 필수 필드 검증
```

---

## 6. 반응형 디자인

### 6.1 브레이크포인트
- **데스크톱**: 1024px 이상
- **태블릿**: 768px ~ 1023px
- **모바일**: 767px 이하

### 6.2 모바일 최적화 (768px 이하)

#### 그리드 변경
- grid-2, grid-3, grid-4 → 1열

#### 네비게이션
- 세로 방향으로 변경
- 간격 조정

#### 랜딩 페이지
- 타이틀 크기: 2.5rem
- 슬로건 크기: 1.2rem
- 기능 카드: 1열
- CTA 버튼: 세로 배치

#### 로드맵 페이지
- 컨텐츠 그리드: 1열
- 진행도 개요: 1열

### 6.3 터치 최적화
- 버튼 최소 크기: 44px × 44px
- 터치 영역 확보
- 스크롤 최적화

---

## 7. 접근성 (Accessibility)

### 7.1 시맨틱 HTML
- 적절한 heading 계층 구조
- form, label 요소 활용
- button vs. a 태그 구분

### 7.2 키보드 접근성
- 모든 인터랙티브 요소 포커스 가능
- Tab 순서 논리적 구성
- Enter/Space 키로 활성화

### 7.3 색상 대비
- WCAG AA 기준 준수
- 텍스트와 배경 대비비 4.5:1 이상

### 7.4 폼 접근성
- label과 input 연결
- placeholder는 보조 정보로만 사용
- required 속성 활용
- 에러 메시지 명확히 표시

---

## 8. 브라우저 호환성

### 8.1 지원 브라우저
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 8.2 사용 기술
- CSS Variables
- CSS Grid
- Flexbox
- Canvas API
- LocalStorage API
- ES6+ JavaScript

### 8.3 폴백
- CSS Grid 미지원 시: Flexbox
- LocalStorage 미지원 시: 알림 표시

---

## 9. 성능 최적화

### 9.1 리소스 최적화
- CSS 파일 1개 (styles.css)
- JS 파일 1개 (app.js)
- 외부 라이브러리 미사용

### 9.2 렌더링 최적화
- CSS 전환 사용 (transform, opacity)
- 레이아웃 변경 최소화
- 차트는 필요 시에만 렌더링

### 9.3 데이터 최적화
- LocalStorage 사용으로 네트워크 요청 최소화
- JSON.stringify/parse로 직렬화

---

## 10. 개선 사항 및 확장성

### 10.1 단기 개선
- 드래그 앤 드롭으로 업무 순서 변경
- 업무별 상세 메모 기능
- 진행도 알림 기능
- 다크 모드 지원

### 10.2 중기 개선
- 백엔드 API 연동
- 실시간 채용 공고 크롤링
- 소셜 로그인 (Google, Kakao)
- 이메일 알림

### 10.3 장기 개선
- AI 기반 스펙 분석 및 추천
- 커뮤니티 기능
- 멘토링 매칭
- 모바일 앱 개발

---

## 부록

### A. 파일 구조
```
ui/
├── index.html          # 랜딩 페이지
├── login.html          # 로그인
├── register.html       # 회원가입
├── onboarding.html     # 온보딩 (스펙 입력)
├── dashboard.html      # 스펙 분석 대시보드
├── goal-setting.html   # 목표 설정
├── roadmap.html        # 로드맵 관리
├── styles.css          # 공통 스타일
└── app.js             # 공통 JavaScript
```

### B. 주요 클래스 목록
- 레이아웃: .container, .grid, .grid-2/3/4
- 네비게이션: .navbar, .nav-links, .logo
- 버튼: .btn, .btn-primary, .btn-secondary, .btn-outline, .btn-danger
- 카드: .card, .card-title
- 폼: .form-group, .form-control
- 배지: .badge, .badge-success/warning/danger/info
- 알림: .alert, .alert-success/info/warning
- 유틸리티: .text-center, .mt-1/2, .mb-1/2, .hidden

### C. 주요 함수 목록
- StorageManager: saveSpec, getSpec, saveGoal, getGoal, saveTasks, getTasks, clear
- 차트: drawRadarChart, drawCircularProgress
- 유틸: formatDate, calculateDday, validateForm
- 인증: handleLogin, handleRegister, logout
- 온보딩: goToStep, completeOnboarding, addLanguage, addCertificate, addProject, addActivity
- 대시보드: displaySpec, calculateScore
- 목표 설정: searchJobs, selectJob, analyzeSpecs, confirmGoal
- 로드맵: displayGoal, displayTasks, toggleTask, updateProgress, renderCalendar

---

**문서 버전**: 1.0
**작성일**: 2025년 10월 25일
**작성자**: Step-Up 개발팀
