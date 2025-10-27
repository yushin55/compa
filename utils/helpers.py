import json
from datetime import datetime, date


def parse_json_field(value):
    """JSON 필드를 파싱하는 헬퍼 함수"""
    if value is None:
        return []
    if isinstance(value, str):
        try:
            return json.loads(value)
        except:
            return []
    if isinstance(value, list):
        return value
    return []


def serialize_json_field(value):
    """JSON 필드를 직렬화하는 헬퍼 함수"""
    if value is None:
        return json.dumps([])
    if isinstance(value, list):
        return json.dumps(value)
    return value


def calculate_radar_scores(education, languages, certificates, projects, activities):
    """레이더 차트용 점수 계산 (0-10)"""
    scores = {
        "education": 0,
        "language": 0,
        "certificate": 0,
        "project": 0,
        "activity": 0
    }
    
    if education and education.get('school'):
        scores["education"] = 8
    
    lang_count = len(languages)
    if lang_count > 0:
        scores["language"] = min(10, 5 + lang_count * 2)
    
    cert_count = len(certificates)
    if cert_count > 0:
        scores["certificate"] = min(10, 5 + cert_count * 2)
    
    proj_count = len(projects)
    if proj_count > 0:
        scores["project"] = min(10, 5 + proj_count * 2)
    
    act_count = len(activities)
    if act_count > 0:
        scores["activity"] = min(10, 5 + act_count * 2)
    
    return scores


def days_until(target_date):
    """목표일까지 남은 일수 계산"""
    if not target_date:
        return None
    
    if isinstance(target_date, str):
        target_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    
    today = date.today()
    delta = target_date - today
    return delta.days
