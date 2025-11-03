# API 테스트 스크립트
$baseUrl = "http://localhost:8000"
$testUserId = "test_user_$(Get-Date -Format 'yyyyMMddHHmmss')"
$testEmail = "$testUserId@test.com"
$testPassword = "Test123!@#"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "스텝업(Step-Up) API 테스트 시작" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Test-API {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "[$Method] $Endpoint - $Description" -ForegroundColor Yellow
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $Headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ 성공" -ForegroundColor Green
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "  ✗ 실패 (HTTP $statusCode)" -ForegroundColor Red
        } else {
            Write-Host "  ✗ 실패: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $null
    }
}

# 1. Health Check
Write-Host "`n[1] Health Check" -ForegroundColor Magenta
Test-API -Method "GET" -Endpoint "/" -Description "루트 엔드포인트"
Test-API -Method "GET" -Endpoint "/health" -Description "헬스 체크"

# 2. 회원가입
Write-Host "`n[2] 인증 API" -ForegroundColor Magenta
$registerBody = @{
    user_id = $testUserId
    password = $testPassword
    email = $testEmail
}
$registerResult = Test-API -Method "POST" -Endpoint "/auth/register" -Description "회원가입" -Body $registerBody

# 3. 로그인
$loginBody = @{
    user_id = $testUserId
    password = $testPassword
}
$loginResult = Test-API -Method "POST" -Endpoint "/auth/login" -Description "로그인" -Body $loginBody

# 헤더 설정
$headers = @{
    "x-user-id" = $testUserId
}

# 4. 사용자 API
Write-Host "`n[3] 사용자 API" -ForegroundColor Magenta
Test-API -Method "GET" -Endpoint "/users/me" -Description "내 정보 조회" -Headers $headers

# 5. 스펙 API
Write-Host "`n[4] 스펙 API" -ForegroundColor Magenta

# 5.1 사용자 스펙 조회
Test-API -Method "GET" -Endpoint "/specs" -Description "사용자 스펙 조회" -Headers $headers

# 5.2 사용자 스펙 수정
$specBody = @{
    job_field = "프론트엔드 개발"
    introduction = "웹 개발에 관심이 많은 개발자입니다."
    onboarding_completed = $true
}
Test-API -Method "PUT" -Endpoint "/specs" -Description "사용자 스펙 수정" -Body $specBody -Headers $headers

# 5.3 학력 정보 수정
$eduBody = @{
    school = "한국대학교"
    major = "컴퓨터공학과"
    gpa = "3.8/4.5"
    graduation_status = "enrolled"
}
Test-API -Method "PUT" -Endpoint "/specs/education" -Description "학력 정보 수정" -Body $eduBody -Headers $headers

# 5.4 학력 정보 조회
Test-API -Method "GET" -Endpoint "/specs/education" -Description "학력 정보 조회" -Headers $headers

# 5.5 어학 성적 추가
$langBody = @{
    language_type = "TOEIC"
    score = "850"
    acquisition_date = "2023-03-15"
}
$lang1 = Test-API -Method "POST" -Endpoint "/specs/languages" -Description "어학 성적 추가" -Body $langBody -Headers $headers

# 5.6 어학 성적 목록 조회
$languages = Test-API -Method "GET" -Endpoint "/specs/languages" -Description "어학 성적 목록 조회" -Headers $headers

# 5.7 자격증 추가
$certBody = @{
    certificate_name = "정보처리기사"
    acquisition_date = "2023-08-10"
}
$cert1 = Test-API -Method "POST" -Endpoint "/specs/certificates" -Description "자격증 추가" -Body $certBody -Headers $headers

# 5.8 자격증 목록 조회
Test-API -Method "GET" -Endpoint "/specs/certificates" -Description "자격증 목록 조회" -Headers $headers

# 5.9 프로젝트 추가
$projBody = @{
    project_name = "대학생 커뮤니티 플랫폼"
    role = "프론트엔드 개발"
    period = "2023.03 - 2023.08"
    description = "학생들을 위한 정보 공유 플랫폼"
    tech_stack = "React, TypeScript, Redux"
    github_url = "https://github.com/user/project"
}
$proj1 = Test-API -Method "POST" -Endpoint "/specs/projects" -Description "프로젝트 추가" -Body $projBody -Headers $headers

# 5.10 프로젝트 목록 조회
$projects = Test-API -Method "GET" -Endpoint "/specs/projects" -Description "프로젝트 목록 조회" -Headers $headers

# 5.11 프로젝트 수정
if ($proj1 -and $proj1.id) {
    $projUpdateBody = @{
        description = "학생들을 위한 정보 공유 및 소통 플랫폼"
    }
    Test-API -Method "PUT" -Endpoint "/specs/projects/$($proj1.id)" -Description "프로젝트 수정" -Body $projUpdateBody -Headers $headers
}

# 5.12 대외활동 추가
$actBody = @{
    activity_name = "Web Development Club DEVS"
    activity_type = "Club"
    period = "2022.03 - Present"
    description = "Web development study and projects"
}
$act1 = Test-API -Method "POST" -Endpoint "/specs/activities" -Description "대외활동 추가" -Body $actBody -Headers $headers

# 5.13 대외활동 목록 조회
Test-API -Method "GET" -Endpoint "/specs/activities" -Description "대외활동 목록 조회" -Headers $headers

# 5.14 대외활동 수정
if ($act1 -and $act1.id) {
    $actUpdateBody = @{
        description = "Web development study, projects and seminars"
    }
    Test-API -Method "PUT" -Endpoint "/specs/activities/$($act1.id)" -Description "대외활동 수정" -Body $actUpdateBody -Headers $headers
}

# 5.15 대시보드 조회
Test-API -Method "GET" -Endpoint "/specs/dashboard" -Description "스펙 대시보드 조회" -Headers $headers

# 6. 목표 API
Write-Host "`n[5] 목표 API" -ForegroundColor Magenta

# 6.1 목표 설정
$goalBody = @{
    job_title = "프론트엔드 개발자"
    company_name = "네이버"
    location = "경기 성남시 분당구"
    deadline = "2025-12-31"
    experience_level = "신입"
    requirements = @(
        "HTML, CSS, JavaScript 기본 이해",
        "React 또는 Vue.js 프레임워크 경험",
        "프로젝트 경험 1회 이상"
    )
    preferred = @(
        "TypeScript 사용 경험",
        "TOEIC 800점 이상"
    )
}
$goal = Test-API -Method "POST" -Endpoint "/goals" -Description "목표 설정" -Body $goalBody -Headers $headers

# 6.2 목표 조회
Test-API -Method "GET" -Endpoint "/goals" -Description "현재 목표 조회" -Headers $headers

# 6.3 목표 수정
$goalUpdateBody = @{
    deadline = "2025-11-30"
}
Test-API -Method "PUT" -Endpoint "/goals" -Description "목표 수정" -Body $goalUpdateBody -Headers $headers

# 6.4 격차 분석
Test-API -Method "GET" -Endpoint "/goals/gap-analysis" -Description "목표와 스펙 격차 분석" -Headers $headers

# 7. 로드맵/업무 API
Write-Host "`n[6] 로드맵 API" -ForegroundColor Magenta

# 7.1 업무 추가
$task1Body = @{
    goal_id = if ($goal) { $goal.id } else { $null }
    title = "Get Information Processing Engineer Certificate"
    description = "Prepare for written and practical exams"
    due_date = "2025-06-30"
    priority = "high"
    order_index = 0
}
$task1 = Test-API -Method "POST" -Endpoint "/tasks" -Description "업무 추가 1" -Body $task1Body -Headers $headers

$task2Body = @{
    title = "Complete React Project"
    description = "React project for portfolio"
    due_date = (Get-Date).ToString("yyyy-MM-dd")
    priority = "medium"
    order_index = 1
}
$task2 = Test-API -Method "POST" -Endpoint "/tasks" -Description "업무 추가 2" -Body $task2Body -Headers $headers

# 7.2 업무 목록 조회
Test-API -Method "GET" -Endpoint "/tasks" -Description "업무 목록 조회" -Headers $headers

# 7.3 업무 상세 조회
if ($task1 -and $task1.id) {
    Test-API -Method "GET" -Endpoint "/tasks/$($task1.id)" -Description "업무 상세 조회" -Headers $headers
}

# 7.4 업무 수정
if ($task1 -and $task1.id) {
    $taskUpdateBody = @{
        description = "Written exam complete, preparing for practical exam"
    }
    Test-API -Method "PUT" -Endpoint "/tasks/$($task1.id)" -Description "업무 수정" -Body $taskUpdateBody -Headers $headers
}

# 7.5 업무 완료 처리
if ($task2 -and $task2.id) {
    Test-API -Method "PATCH" -Endpoint "/tasks/$($task2.id)/complete" -Description "업무 완료 처리" -Headers $headers
}

# 7.6 업무 미완료 처리
if ($task2 -and $task2.id) {
    Test-API -Method "PATCH" -Endpoint "/tasks/$($task2.id)/incomplete" -Description "업무 미완료 처리" -Headers $headers
}

# 7.7 오늘의 할 일 조회
Test-API -Method "GET" -Endpoint "/tasks/today" -Description "오늘의 할 일 조회" -Headers $headers

# 7.8 로드맵 진행도 조회
Test-API -Method "GET" -Endpoint "/roadmap/progress" -Description "로드맵 진행도 조회" -Headers $headers

# 7.9 필터링된 업무 조회
Test-API -Method "GET" -Endpoint "/tasks?is_completed=false" -Description "미완료 업무 조회" -Headers $headers
Test-API -Method "GET" -Endpoint "/tasks?priority=high" -Description "우선순위 high 업무 조회" -Headers $headers

# 8. 삭제 테스트
Write-Host "`n[7] 삭제 API 테스트" -ForegroundColor Magenta

# 8.1 업무 삭제
if ($task1 -and $task1.id) {
    Test-API -Method "DELETE" -Endpoint "/tasks/$($task1.id)" -Description "업무 삭제" -Headers $headers
}

# 8.2 대외활동 삭제
if ($act1 -and $act1.id) {
    Test-API -Method "DELETE" -Endpoint "/specs/activities/$($act1.id)" -Description "대외활동 삭제" -Headers $headers
}

# 8.3 프로젝트 삭제
if ($proj1 -and $proj1.id) {
    Test-API -Method "DELETE" -Endpoint "/specs/projects/$($proj1.id)" -Description "프로젝트 삭제" -Headers $headers
}

# 8.4 자격증 삭제
if ($cert1 -and $cert1.id) {
    Test-API -Method "DELETE" -Endpoint "/specs/certificates/$($cert1.id)" -Description "자격증 삭제" -Headers $headers
}

# 8.5 어학 성적 삭제
if ($lang1 -and $lang1.id) {
    Test-API -Method "DELETE" -Endpoint "/specs/languages/$($lang1.id)" -Description "어학 성적 삭제" -Headers $headers
}

# 8.6 목표 삭제
Test-API -Method "DELETE" -Endpoint "/goals" -Description "목표 삭제" -Headers $headers

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "API 테스트 완료!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "테스트 사용자: $testUserId" -ForegroundColor Gray
