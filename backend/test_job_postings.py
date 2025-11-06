import requests
import json

# 채용 공고 목록 조회
print("=== 채용 공고 목록 조회 ===")
response = requests.get("http://127.0.0.1:8000/job-postings?is_active=true")
print(f"상태 코드: {response.status_code}")

if response.status_code == 200:
    jobs = response.json()
    print(f"\n총 {len(jobs)}개의 채용 공고가 저장되어 있습니다.\n")
    
    # 처음 5개만 출력
    for i, job in enumerate(jobs[:5], 1):
        print(f"{i}. {job['company']} - {job['title']}")
        print(f"   경력: {job.get('experience_level', 'N/A')}")
        print(f"   위치: {job.get('location', 'N/A')}")
        print(f"   필수 요구사항: {len(job.get('requirements', []))}개")
        print(f"   우대 사항: {len(job.get('preferred', []))}개")
        print()
else:
    print(f"오류: {response.text}")
