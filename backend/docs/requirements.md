# Backend Requirements - Step-Up 기능 구현

## 개요
프론트엔드에 구현된 경험 아카이빙 시스템(Step-Up)을 백엔드에 통합하기 위한 API 요구사항 문서입니다.

---

## 1. 경험(Experience) 관리 API

### 1.1 경험 데이터 모델

```typescript
interface Experience {
  id: string;                    // UUID
  userId: string;                // 사용자 ID
  taskId: string;                // 연관된 태스크 ID
  title: string;                 // 태스크 제목
  category: string;              // 카테고리 (예: 백엔드, 프론트엔드, AI)
  completedDate: string;         // 완료 날짜 (ISO 8601 형식)
  reflection: {
    learned: string;             // 배운 점 (필수)
    challenges: string;          // 어려웠던 점 (선택)
    solutions: string;           // 해결 과정 (선택)
    improvements: string;        // 개선점 및 다음 목표 (선택)
  };
  tags: string[];                // 기술 스택 태그 배열
  relatedResources: string[];    // 관련 자료 URL 배열
  createdAt: string;             // 생성 시간
  updatedAt: string;             // 수정 시간
}
```

### 1.2 API 엔드포인트

#### POST `/api/experiences`
**설명**: 새로운 경험(회고) 생성

**Request Body**:
```json
{
  "taskId": "string",
  "title": "string",
  "category": "string",
  "completedDate": "2024-01-15T09:00:00Z",
  "reflection": {
    "learned": "string (required)",
    "challenges": "string (optional)",
    "solutions": "string (optional)",
    "improvements": "string (optional)"
  },
  "tags": ["React", "TypeScript", "API"],
  "relatedResources": ["https://example.com/resource1"]
}
```

**Response** (201 Created):
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "taskId": "task-uuid",
  "title": "REST API 구현",
  "category": "백엔드",
  "completedDate": "2024-01-15T09:00:00Z",
  "reflection": { ... },
  "tags": ["React", "TypeScript"],
  "relatedResources": ["https://..."],
  "createdAt": "2024-01-15T09:30:00Z",
  "updatedAt": "2024-01-15T09:30:00Z"
}
```

**Validation**:
- `reflection.learned`: 필수, 최소 10자 이상
- `tags`: 최대 10개
- `relatedResources`: URL 형식 검증

---

#### GET `/api/experiences`
**설명**: 사용자의 모든 경험 조회 (필터링 및 검색 지원)

**Query Parameters**:
- `search`: 제목, 내용, 태그 검색 (선택)
- `tags`: 태그 필터 (쉼표로 구분, 선택)
- `period`: 기간 필터 (`all`, `week`, `month`, `quarter`, 선택)
- `startDate`: 시작 날짜 (ISO 8601, 선택)
- `endDate`: 종료 날짜 (ISO 8601, 선택)
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 20, 최대: 100)

**Example Request**:
```
GET /api/experiences?search=React&tags=TypeScript,API&period=month&page=1&limit=20
```

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "title": "REST API 구현",
      "category": "백엔드",
      "completedDate": "2024-01-15T09:00:00Z",
      "reflection": { ... },
      "tags": ["React", "TypeScript"],
      "relatedResources": ["https://..."],
      "createdAt": "2024-01-15T09:30:00Z",
      "updatedAt": "2024-01-15T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### GET `/api/experiences/:id`
**설명**: 특정 경험 상세 조회

**Response** (200 OK):
```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "taskId": "task-uuid",
  "title": "REST API 구현",
  "category": "백엔드",
  "completedDate": "2024-01-15T09:00:00Z",
  "reflection": {
    "learned": "RESTful API 설계 원칙을 이해했습니다.",
    "challenges": "인증 미들웨어 구현이 어려웠습니다.",
    "solutions": "JWT 토큰 기반 인증을 적용했습니다.",
    "improvements": "다음에는 OAuth 2.0도 적용해보겠습니다."
  },
  "tags": ["Node.js", "Express", "JWT"],
  "relatedResources": ["https://expressjs.com/"],
  "createdAt": "2024-01-15T09:30:00Z",
  "updatedAt": "2024-01-15T09:30:00Z"
}
```

---

#### PUT `/api/experiences/:id`
**설명**: 경험 수정

**Request Body**:
```json
{
  "reflection": {
    "learned": "string",
    "challenges": "string",
    "solutions": "string",
    "improvements": "string"
  },
  "tags": ["React", "TypeScript"],
  "relatedResources": ["https://example.com"]
}
```

**Response** (200 OK): 수정된 경험 객체

---

#### DELETE `/api/experiences/:id`
**설명**: 경험 삭제

**Response** (204 No Content)

---

## 2. 경험 통계 API

### GET `/api/experiences/stats`
**설명**: 사용자의 경험 관련 통계 조회

**Response** (200 OK):
```json
{
  "totalExperiences": 45,
  "totalTags": 28,
  "monthlyCount": 12,
  "averageTagsPerExperience": 3.2,
  "categoryBreakdown": {
    "백엔드": 20,
    "프론트엔드": 15,
    "AI": 10
  },
  "recentTrends": {
    "lastWeek": 3,
    "lastMonth": 12,
    "lastQuarter": 32
  }
}
```

---

## 3. 태그 관리 API

### GET `/api/experiences/tags`
**설명**: 사용자의 모든 태그 및 빈도수 조회

**Response** (200 OK):
```json
{
  "tags": [
    {
      "name": "React",
      "count": 15,
      "lastUsed": "2024-01-15T09:30:00Z"
    },
    {
      "name": "TypeScript",
      "count": 12,
      "lastUsed": "2024-01-14T08:20:00Z"
    },
    {
      "name": "Node.js",
      "count": 10,
      "lastUsed": "2024-01-13T14:10:00Z"
    }
  ],
  "totalUniqueTags": 28
}
```

---

## 4. 활동 캘린더 API

### GET `/api/experiences/calendar`
**설명**: 경험 작성 활동 캘린더 데이터 (GitHub 잔디 스타일)

**Query Parameters**:
- `weeks`: 조회할 주 수 (기본값: 12, 최대: 52)

**Response** (200 OK):
```json
{
  "activities": [
    {
      "date": "2024-01-15",
      "count": 2,
      "experiences": [
        {
          "id": "uuid",
          "title": "REST API 구현"
        },
        {
          "id": "uuid",
          "title": "React 컴포넌트 리팩토링"
        }
      ]
    },
    {
      "date": "2024-01-16",
      "count": 1,
      "experiences": [
        {
          "id": "uuid",
          "title": "데이터베이스 최적화"
        }
      ]
    }
  ],
  "startDate": "2023-10-16",
  "endDate": "2024-01-15",
  "totalDaysActive": 45,
  "maxCountPerDay": 3
}
```

---

## 5. 경험 내보내기 API

### POST `/api/experiences/export`
**설명**: 선택한 경험들을 Markdown 또는 PDF로 내보내기

**Request Body**:
```json
{
  "experienceIds": ["uuid1", "uuid2", "uuid3"],
  "format": "markdown" // or "pdf"
}
```

**Response** (200 OK):
```json
{
  "downloadUrl": "https://cdn.example.com/exports/user-experiences-2024-01-15.md",
  "expiresAt": "2024-01-16T09:30:00Z"
}
```

**Markdown 형식 예시**:
```markdown
# 나의 경험 아카이브

작성일: 2024년 1월 15일

총 3개의 경험

---

## 1. REST API 구현

- **카테고리**: 백엔드
- **완료일**: 2024-01-15
- **태그**: Node.js, Express, JWT

### 배운 점
RESTful API 설계 원칙을 이해했습니다.

### 어려웠던 점
인증 미들웨어 구현이 어려웠습니다.

### 해결 과정
JWT 토큰 기반 인증을 적용했습니다.

### 개선점
다음에는 OAuth 2.0도 적용해보겠습니다.

### 관련 자료
- https://expressjs.com/

---
```

---

## 6. 태스크 완료 시 회고 연동

### PUT `/api/tasks/:id/complete`
**설명**: 태스크 완료 처리 (기존 API 확장)

**Request Body**:
```json
{
  "completedDate": "2024-01-15T09:00:00Z",
  "skipReflection": false, // true면 회고 작성 건너뛰기
  "reflection": {          // skipReflection이 false일 때 필수
    "learned": "string",
    "challenges": "string",
    "solutions": "string",
    "improvements": "string"
  },
  "tags": ["React", "TypeScript"],
  "relatedResources": ["https://example.com"]
}
```

**Response** (200 OK):
```json
{
  "task": {
    "id": "uuid",
    "title": "REST API 구현",
    "status": "completed",
    "completedDate": "2024-01-15T09:00:00Z"
  },
  "experience": {
    "id": "experience-uuid",
    "taskId": "uuid",
    "reflection": { ... },
    "tags": ["React", "TypeScript"]
  }
}
```

**Notes**:
- `skipReflection: true`일 경우 태스크만 완료 처리하고 경험은 생성하지 않음
- 나중에 `POST /api/experiences`로 회고 추가 가능

---

## 7. 데이터베이스 스키마

### experiences 테이블

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  learned TEXT NOT NULL,
  challenges TEXT,
  solutions TEXT,
  improvements TEXT,
  tags TEXT[] DEFAULT '{}',
  related_resources TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 인덱스
  INDEX idx_experiences_user_id (user_id),
  INDEX idx_experiences_completed_date (completed_date),
  INDEX idx_experiences_tags USING GIN (tags),
  
  -- 제약조건
  CONSTRAINT chk_learned_length CHECK (LENGTH(learned) >= 10)
);

-- 전문 검색 인덱스 (PostgreSQL)
CREATE INDEX idx_experiences_search 
ON experiences 
USING gin(to_tsvector('korean', title || ' ' || learned || ' ' || array_to_string(tags, ' ')));
```

---

## 8. 보안 및 권한

### 인증
- 모든 API는 JWT 토큰 기반 인증 필요
- Authorization 헤더: `Bearer <token>`

### 권한
- 사용자는 자신의 경험만 CRUD 가능
- 다른 사용자의 경험 접근 시 403 Forbidden 반환

### Rate Limiting
- 경험 생성: 사용자당 분당 10개
- 경험 조회: 사용자당 분당 100개
- 내보내기: 사용자당 시간당 5개

---

## 9. 에러 코드

| 코드 | 메시지 | 설명 |
|------|--------|------|
| 400 | INVALID_REFLECTION | 회고 내용이 유효하지 않음 (learned 필드 누락 또는 너무 짧음) |
| 400 | INVALID_TAGS | 태그 형식이 잘못됨 또는 개수 초과 |
| 400 | INVALID_URL | 관련 자료 URL 형식이 잘못됨 |
| 404 | EXPERIENCE_NOT_FOUND | 경험을 찾을 수 없음 |
| 404 | TASK_NOT_FOUND | 연관된 태스크를 찾을 수 없음 |
| 403 | FORBIDDEN | 다른 사용자의 경험에 접근 시도 |
| 409 | EXPERIENCE_ALREADY_EXISTS | 해당 태스크에 대한 경험이 이미 존재함 |
| 429 | RATE_LIMIT_EXCEEDED | 요청 한도 초과 |

---

## 10. 구현 우선순위

### Phase 1 (필수)
1. ✅ 경험 CRUD API (`POST`, `GET`, `PUT`, `DELETE /api/experiences`)
2. ✅ 경험 조회 및 필터링 (`GET /api/experiences?search=...&tags=...&period=...`)
3. ✅ 태스크 완료 시 회고 연동 (`PUT /api/tasks/:id/complete`)

### Phase 2 (중요)
4. ✅ 경험 통계 API (`GET /api/experiences/stats`)
5. ✅ 태그 관리 API (`GET /api/experiences/tags`)
6. ✅ 활동 캘린더 API (`GET /api/experiences/calendar`)

### Phase 3 (부가 기능)
7. ⏳ 경험 내보내기 API (`POST /api/experiences/export`)
8. ⏳ 전문 검색 최적화 (Elasticsearch 통합 검토)
9. ⏳ 경험 공유 기능 (선택적)

---

## 11. 성능 고려사항

### 캐싱
- 태그 목록: Redis 캐시 (TTL: 5분)
- 경험 통계: Redis 캐시 (TTL: 10분)
- 활동 캘린더: Redis 캐시 (TTL: 1시간)

### 페이지네이션
- 기본 페이지 크기: 20개
- 최대 페이지 크기: 100개
- Cursor-based pagination 검토 (대량 데이터 시)

### 쿼리 최적화
- N+1 문제 방지 (태스크 정보 eager loading)
- 태그 필터링 시 GIN 인덱스 활용
- 날짜 범위 검색 시 인덱스 활용

---

## 12. 테스트 케이스

### 단위 테스트
- [ ] 경험 생성 시 validation 테스트
- [ ] 회고 필수 필드 검증
- [ ] 태그 개수 제한 검증
- [ ] URL 형식 검증

### 통합 테스트
- [ ] 경험 CRUD 플로우 테스트
- [ ] 태스크 완료 → 경험 생성 플로우
- [ ] 검색 및 필터링 정확도 테스트
- [ ] 권한 검증 (다른 사용자 데이터 접근 차단)

### 성능 테스트
- [ ] 1000개 경험 조회 시 응답 시간 < 500ms
- [ ] 동시 10명 경험 생성 시 처리 성공률 > 99%
- [ ] 활동 캘린더 52주 조회 시 응답 시간 < 1s

---

## 13. 마이그레이션 가이드

### 기존 로컬 스토리지 데이터 마이그레이션

프론트엔드에서 사용 중인 localStorage 데이터를 백엔드로 마이그레이션하는 절차:

1. **마이그레이션 API 제공**
   ```
   POST /api/experiences/migrate
   ```
   
   **Request Body**:
   ```json
   {
     "experiences": [
       {
         "taskId": "local-task-1",
         "title": "REST API 구현",
         "category": "백엔드",
         "completedDate": "2024-01-15T09:00:00Z",
         "reflection": { ... },
         "tags": ["Node.js", "Express"],
         "relatedResources": ["https://..."]
       }
     ]
   }
   ```

2. **중복 방지**: `taskId` 기준으로 중복 체크

3. **배치 처리**: 한 번에 최대 50개까지 마이그레이션 지원

---

## 14. 모니터링 및 로깅

### 로깅 필요 이벤트
- 경험 생성/수정/삭제
- 경험 내보내기 요청
- 검색 쿼리 및 결과 수
- API 에러 발생 (4xx, 5xx)

### 메트릭
- 일별 경험 생성 수
- 평균 회고 작성 길이
- 인기 태그 Top 10
- API 응답 시간 (P50, P95, P99)

---

## 15. 문의 및 참고

### API 문서
- Swagger/OpenAPI 문서: `/api-docs`
- Postman Collection: 프로젝트 루트의 `postman-collection.json`

### 관련 문서
- `docs/prd.md`: 제품 요구사항 정의서
- `docs/frontend.techstack.md`: 프론트엔드 기술 스택
- `docs/ui.spec.md`: UI 명세서

### 개발자 연락처
- 프론트엔드: [프론트엔드 팀]
- 백엔드: [백엔드 팀]
- 프로젝트 관리: [PM]
