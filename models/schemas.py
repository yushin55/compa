from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class Error(BaseModel):
    error: str
    code: str


class UserRegister(BaseModel):
    user_id: str
    password: str
    email: Optional[str] = None  # email은 선택사항으로 변경


class UserLogin(BaseModel):
    user_id: str
    password: str


class User(BaseModel):
    user_id: str
    created_at: datetime


class UserSpec(BaseModel):
    id: int
    user_id: str
    job_field: Optional[str] = None
    introduction: Optional[str] = None
    onboarding_completed: bool
    created_at: datetime
    updated_at: datetime


class UserSpecUpdate(BaseModel):
    job_field: Optional[str] = None
    introduction: Optional[str] = None
    onboarding_completed: Optional[bool] = None


class Education(BaseModel):
    id: int
    user_id: str
    school: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[str] = None
    graduation_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class EducationUpdate(BaseModel):
    school: Optional[str] = None
    major: Optional[str] = None
    gpa: Optional[str] = None
    graduation_status: Optional[str] = None


class Language(BaseModel):
    id: int
    user_id: str
    language_type: str
    score: str
    acquisition_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime


class LanguageCreate(BaseModel):
    language_type: str
    score: str
    acquisition_date: Optional[date] = None


class Certificate(BaseModel):
    id: int
    user_id: str
    certificate_name: str
    acquisition_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime


class CertificateCreate(BaseModel):
    certificate_name: str
    acquisition_date: Optional[date] = None


class Project(BaseModel):
    id: int
    user_id: str
    project_name: str
    role: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ProjectCreate(BaseModel):
    project_name: str
    role: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    role: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None


class Activity(BaseModel):
    id: int
    user_id: str
    activity_name: str
    activity_type: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ActivityCreate(BaseModel):
    activity_name: str
    activity_type: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None


class ActivityUpdate(BaseModel):
    activity_name: Optional[str] = None
    activity_type: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None


class Goal(BaseModel):
    id: int
    user_id: str
    job_title: str
    company_name: str
    location: Optional[str] = None
    deadline: Optional[date] = None
    experience_level: Optional[str] = None
    requirements: List[str] = []
    preferred: List[str] = []
    is_active: bool
    created_at: datetime
    updated_at: datetime


class GoalCreate(BaseModel):
    job_title: str
    company_name: str
    location: Optional[str] = None
    deadline: Optional[date] = None
    experience_level: Optional[str] = None
    requirements: List[str] = []
    preferred: List[str] = []


class GoalUpdate(BaseModel):
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    deadline: Optional[date] = None
    experience_level: Optional[str] = None
    requirements: Optional[List[str]] = None
    preferred: Optional[List[str]] = None


class Task(BaseModel):
    id: int
    user_id: str
    goal_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    is_completed: bool
    completed_at: Optional[datetime] = None
    priority: Optional[str] = None
    order_index: int
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    goal_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    order_index: int = 0


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    priority: Optional[str] = None
    order_index: Optional[int] = None


class DashboardData(BaseModel):
    user_spec: Optional[UserSpec] = None
    education: Optional[Education] = None
    languages: List[Language] = []
    certificates: List[Certificate] = []
    projects: List[Project] = []
    activities: List[Activity] = []
    stats: dict
    radar_scores: dict


class JobPosting(BaseModel):
    id: int
    company: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    requirements: Optional[List[str]] = []
    preferred: Optional[List[str]] = []
    location: Optional[str] = None
    experience_level: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class TaskAutoGenerate(BaseModel):
    goal_id: Optional[int] = None
    requirements: List[str] = []
