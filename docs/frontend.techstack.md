# 🧩 MiniTODO — 최소 프론트엔드 Tech Stack

> 백엔드(API 서버)는 이미 구축되어 있으며, 인증 없이 `x-user-id` 헤더로 사용자 식별을 수행합니다.  
> 프론트엔드는 Next.js 기반의 **가장 단순한 구조**로 구성됩니다.
> 간결함을 위해서 **테스트 관련 내용은 모두 생략**합니다.

## Framework

- **Next.js 15 (App Router)** — 파일 기반 라우팅 및 SSR/CSR 관리
- **TypeScript** — 정적 타입 안정성 확보
- **React 19** — 컴포넌트 기반 UI 구현
- **Tailwind CSS** — 빠르고 일관된 UI 스타일링

## API 연동

- **Fetch API** — 브라우저 내장 HTTP 클라이언트, `x-user-id` 헤더 포함
- **환경변수 관리** — `.env.local` 파일에 `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`
- **데이터 타입 정의** — TypeScript 인터페이스로 OpenAPI 스키마 기반 정의

## 상태 관리

- **React Hooks (`useState`, `useEffect`)** — 간단한 로컬 상태 관리
- **localStorage** — 로그인 후 `x-user-id` 저장 및 불러오기
- **전역 상태관리 라이브러리 미사용** — Redux, Zustand 등 제거하여 단순화

## CORS 우회 설정

- 현재 개발용 설정이다.
- 그래서 api 서버는 localhost:8000 이고 frontend 는 localhost:3000 이다.
- 따라서 CORS 에러가 나오지 않게 설정 파일에 개발용에 한해서 우회 하도록 설정을 추가해줘야 함.
