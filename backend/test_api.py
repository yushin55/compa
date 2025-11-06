import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
test_user_id = f"test_user_{datetime.now().strftime('%Y%m%d%H%M%S')}"
test_email = f"{test_user_id}@test.com"
test_password = "Test123!@#"

print("\n" + "="*50)
print("스텝업(Step-Up) API 테스트 시작")
print("="*50 + "\n")

def test_api(method, endpoint, description, data=None, headers=None):
    url = f"{BASE_URL}{endpoint}"
    print(f"[{method}] {endpoint} - {description}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers)
        elif method == "PATCH":
            response = requests.patch(url, json=data, headers=headers)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        
        if response.status_code < 400:
            print(f"  ✓ 성공 (HTTP {response.status_code})")
            return response.json() if response.text else None
        else:
            print(f"  ✗ 실패 (HTTP {response.status_code})")
            print(f"    {response.text}")
            return None
    except Exception as e:
        print(f"  ✗ 오류: {str(e)}")
        return None

# 1. Health Check
print("\n[1] Health Check")
test_api("GET", "/", "Root endpoint")
test_api("GET", "/health", "Health check")

# 2. Authentication
print("\n[2] Authentication API")
register_result = test_api("POST", "/auth/register", "회원가입", {
    "user_id": test_user_id,
    "password": test_password,
    "email": test_email
})

login_result = test_api("POST", "/auth/login", "로그인", {
    "user_id": test_user_id,
    "password": test_password
})

headers = {"x-user-id": test_user_id}

# 3. User API
print("\n[3] User API")
test_api("GET", "/users/me", "내 정보 조회", headers=headers)

# 4. Specs API
print("\n[4] Specs API")
test_api("GET", "/specs", "사용자 스펙 조회", headers=headers)

test_api("PUT", "/specs", "사용자 스펙 수정", {
    "job_field": "Frontend Developer",
    "introduction": "Passionate about web development",
    "onboarding_completed": True
}, headers)

test_api("PUT", "/specs/education", "학력 정보 수정", {
    "school": "Korea University",
    "major": "Computer Science",
    "gpa": "3.8/4.5",
    "graduation_status": "enrolled"
}, headers)

test_api("GET", "/specs/education", "학력 정보 조회", headers=headers)

lang1 = test_api("POST", "/specs/languages", "어학 성적 추가", {
    "language_type": "TOEIC",
    "score": "850",
    "acquisition_date": "2023-03-15"
}, headers)

test_api("GET", "/specs/languages", "어학 성적 목록 조회", headers=headers)

cert1 = test_api("POST", "/specs/certificates", "자격증 추가", {
    "certificate_name": "Information Processing Engineer",
    "acquisition_date": "2023-08-10"
}, headers)

test_api("GET", "/specs/certificates", "자격증 목록 조회", headers=headers)

proj1 = test_api("POST", "/specs/projects", "프로젝트 추가", {
    "project_name": "University Community Platform",
    "role": "Frontend Developer",
    "period": "2023.03 - 2023.08",
    "description": "Information sharing platform for students",
    "tech_stack": "React, TypeScript, Redux",
    "github_url": "https://github.com/user/project"
}, headers)

test_api("GET", "/specs/projects", "프로젝트 목록 조회", headers=headers)

if proj1 and "id" in proj1:
    test_api("PUT", f"/specs/projects/{proj1['id']}", "프로젝트 수정", {
        "description": "Information sharing and communication platform for students"
    }, headers)

act1 = test_api("POST", "/specs/activities", "대외활동 추가", {
    "activity_name": "Web Development Club DEVS",
    "activity_type": "Club",
    "period": "2022.03 - Present",
    "description": "Web development study and projects"
}, headers)

test_api("GET", "/specs/activities", "대외활동 목록 조회", headers=headers)

if act1 and "id" in act1:
    test_api("PUT", f"/specs/activities/{act1['id']}", "대외활동 수정", {
        "description": "Web development study, projects and seminars"
    }, headers)

test_api("GET", "/specs/dashboard", "스펙 대시보드 조회", headers=headers)

# 5. Goals API
print("\n[5] Goals API")
goal = test_api("POST", "/goals", "목표 설정", {
    "job_title": "Frontend Developer",
    "company_name": "Naver",
    "location": "Seongnam-si, Gyeonggi-do",
    "deadline": "2025-12-31",
    "experience_level": "Entry Level",
    "requirements": [
        "Understanding of HTML, CSS, JavaScript",
        "Experience with React or Vue.js framework",
        "At least 1 project experience"
    ],
    "preferred": [
        "TypeScript experience",
        "TOEIC score above 800"
    ]
}, headers)

test_api("GET", "/goals", "현재 목표 조회", headers=headers)

test_api("PUT", "/goals", "목표 수정", {
    "deadline": "2025-11-30"
}, headers)

test_api("GET", "/goals/gap-analysis", "목표와 스펙 격차 분석", headers=headers)

# 6. Tasks API
print("\n[6] Tasks/Roadmap API")
task1 = test_api("POST", "/tasks", "업무 추가 1", {
    "goal_id": goal["id"] if goal and "id" in goal else None,
    "title": "Get Information Processing Engineer Certificate",
    "description": "Prepare for written and practical exams",
    "due_date": "2025-06-30",
    "priority": "high",
    "order_index": 0
}, headers)

task2 = test_api("POST", "/tasks", "업무 추가 2", {
    "title": "Complete React Project",
    "description": "React project for portfolio",
    "due_date": datetime.now().strftime("%Y-%m-%d"),
    "priority": "medium",
    "order_index": 1
}, headers)

test_api("GET", "/tasks", "업무 목록 조회", headers=headers)

if task1 and "id" in task1:
    test_api("GET", f"/tasks/{task1['id']}", "업무 상세 조회", headers=headers)
    test_api("PUT", f"/tasks/{task1['id']}", "업무 수정", {
        "description": "Written exam complete, preparing for practical exam"
    }, headers)

if task2 and "id" in task2:
    test_api("PATCH", f"/tasks/{task2['id']}/complete", "업무 완료 처리", headers=headers)
    test_api("PATCH", f"/tasks/{task2['id']}/incomplete", "업무 미완료 처리", headers=headers)

test_api("GET", "/tasks/today", "오늘의 할 일 조회", headers=headers)
test_api("GET", "/roadmap/progress", "로드맵 진행도 조회", headers=headers)
test_api("GET", "/tasks?is_completed=false", "미완료 업무 조회", headers=headers)
test_api("GET", "/tasks?priority=high", "우선순위 high 업무 조회", headers=headers)

# 7. Delete Tests
print("\n[7] Delete API Tests")
if task1 and "id" in task1:
    test_api("DELETE", f"/tasks/{task1['id']}", "업무 삭제", headers=headers)

if act1 and "id" in act1:
    test_api("DELETE", f"/specs/activities/{act1['id']}", "대외활동 삭제", headers=headers)

if proj1 and "id" in proj1:
    test_api("DELETE", f"/specs/projects/{proj1['id']}", "프로젝트 삭제", headers=headers)

if cert1 and "id" in cert1:
    test_api("DELETE", f"/specs/certificates/{cert1['id']}", "자격증 삭제", headers=headers)

if lang1 and "id" in lang1:
    test_api("DELETE", f"/specs/languages/{lang1['id']}", "어학 성적 삭제", headers=headers)

test_api("DELETE", "/goals", "목표 삭제", headers=headers)

print("\n" + "="*50)
print("API 테스트 완료!")
print("="*50)
print(f"테스트 사용자: {test_user_id}\n")
