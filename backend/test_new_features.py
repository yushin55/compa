import requests
import json

BASE_URL = "http://127.0.0.1:8000"
USER_ID = "kim_frontend"

print("=" * 60)
print("🎯 추가 구현 API 테스트")
print("=" * 60)

# 1. 채용 공고 키워드 검색
print("\n1️⃣ 채용 공고 키워드 검색 (React)")
print("-" * 60)
response = requests.get(f"{BASE_URL}/job-postings?keyword=React&is_active=true")
if response.status_code == 200:
    jobs = response.json()
    print(f"✅ 검색 결과: {len(jobs)}개")
    for i, job in enumerate(jobs[:3], 1):
        print(f"   {i}. {job['company']} - {job['title']}")
else:
    print(f"❌ 오류: {response.status_code}")

# 2. 목표 목록 조회
print("\n2️⃣ 모든 목표 목록 조회")
print("-" * 60)
response = requests.get(
    f"{BASE_URL}/goals/list",
    headers={"x-user-id": USER_ID}
)
if response.status_code == 200:
    goals = response.json()
    print(f"✅ 총 {len(goals)}개의 목표")
    for goal in goals[:3]:
        print(f"   - {goal.get('company_name', 'N/A')} {goal.get('job_title', 'N/A')}")
else:
    print(f"❌ 오류: {response.status_code} - {response.text}")

# 3. 대시보드 통계
print("\n3️⃣ 대시보드 통계 조회")
print("-" * 60)
response = requests.get(
    f"{BASE_URL}/stats/dashboard",
    headers={"x-user-id": USER_ID}
)
if response.status_code == 200:
    stats = response.json()
    print(f"✅ 통계 조회 성공")
    print(f"   총 목표: {stats['summary']['total_goals']}개")
    print(f"   총 태스크: {stats['summary']['total_tasks']}개")
    print(f"   완료율: {stats['summary']['completion_rate']}%")
    print(f"   오늘 할 일: {stats['upcoming']['today']}개")
    print(f"   이번 주: {stats['upcoming']['this_week']}개")
    print(f"   지연된 태스크: {stats['upcoming']['overdue']}개")
    print(f"\n   우선순위별:")
    print(f"   - High: {stats['tasks_by_priority']['high']}개")
    print(f"   - Medium: {stats['tasks_by_priority']['medium']}개")
    print(f"   - Low: {stats['tasks_by_priority']['low']}개")
else:
    print(f"❌ 오류: {response.status_code} - {response.text}")

# 4. 주간 통계
print("\n4️⃣ 주간 통계 조회")
print("-" * 60)
response = requests.get(
    f"{BASE_URL}/stats/weekly",
    headers={"x-user-id": USER_ID}
)
if response.status_code == 200:
    weekly = response.json()
    print(f"✅ 주간 통계 ({weekly['week_start']} ~ {weekly['week_end']})")
    print(f"   전체 완료율: {weekly['summary']['completion_rate']}%")
    print(f"\n   요일별 현황:")
    for day in weekly['daily_breakdown']:
        status = "🟢" if day['completion_rate'] > 70 else "🟡" if day['completion_rate'] > 40 else "🔴"
        print(f"   {status} {day['day_of_week']}: {day['completed_tasks']}/{day['total_tasks']} ({day['completion_rate']:.1f}%)")
else:
    print(f"❌ 오류: {response.status_code} - {response.text}")

# 5. 경력 수준으로 채용 공고 필터링
print("\n5️⃣ 경력 수준으로 채용 공고 필터링 (신입)")
print("-" * 60)
response = requests.get(f"{BASE_URL}/job-postings?experience_level=신입&is_active=true")
if response.status_code == 200:
    jobs = response.json()
    print(f"✅ 신입 채용 공고: {len(jobs)}개")
    for i, job in enumerate(jobs[:3], 1):
        print(f"   {i}. {job['company']} - {job['title']}")
else:
    print(f"❌ 오류: {response.status_code}")

# 6. 특정 목표 상세 조회
print("\n6️⃣ 특정 목표 상세 조회")
print("-" * 60)
# 먼저 목표 ID를 가져옵니다
goals_response = requests.get(f"{BASE_URL}/goals/list", headers={"x-user-id": USER_ID})
if goals_response.status_code == 200 and goals_response.json():
    goal_id = goals_response.json()[0]['id']
    
    response = requests.get(
        f"{BASE_URL}/goals/{goal_id}",
        headers={"x-user-id": USER_ID}
    )
    if response.status_code == 200:
        goal = response.json()
        print(f"✅ 목표 ID {goal_id} 조회 성공")
        print(f"   직무: {goal.get('job_title', 'N/A')}")
        print(f"   회사: {goal.get('company_name', 'N/A')}")
        print(f"   필수 요구사항: {len(goal.get('requirements', []))}개")
        print(f"   우대 사항: {len(goal.get('preferred', []))}개")
    else:
        print(f"❌ 오류: {response.status_code}")
else:
    print("⚠️ 조회할 목표가 없습니다")

# 7. 목표별 상세 통계
print("\n7️⃣ 목표별 상세 통계")
print("-" * 60)
if goals_response.status_code == 200 and goals_response.json():
    goal_id = goals_response.json()[0]['id']
    
    response = requests.get(
        f"{BASE_URL}/stats/goal/{goal_id}",
        headers={"x-user-id": USER_ID}
    )
    if response.status_code == 200:
        goal_stats = response.json()
        print(f"✅ 목표 ID {goal_id} 통계")
        print(f"   총 태스크: {goal_stats['statistics']['total_tasks']}개")
        print(f"   완료: {goal_stats['statistics']['completed_tasks']}개")
        print(f"   진행 중: {goal_stats['statistics']['pending_tasks']}개")
        print(f"   완료율: {goal_stats['statistics']['completion_rate']}%")
        if goal_stats['statistics']['days_remaining']:
            print(f"   남은 기간: {goal_stats['statistics']['days_remaining']}일")
    else:
        print(f"❌ 오류: {response.status_code}")
else:
    print("⚠️ 조회할 목표가 없습니다")

print("\n" + "=" * 60)
print("✨ 모든 테스트 완료!")
print("=" * 60)
