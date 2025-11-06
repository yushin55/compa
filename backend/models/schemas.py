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


class LanguageUpdate(BaseModel):
    language_type: Optional[str] = None
    score: Optional[str] = None
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


class CertificateUpdate(BaseModel):
    certificate_name: Optional[str] = None
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


# Step-Up 경험 아카이빙 시스템
class Reflection(BaseModel):
    learned: str = Field(..., min_length=10, description="배운 점 (필수, 최소 10자)")
    challenges: Optional[str] = Field(None, description="어려웠던 점")
    solutions: Optional[str] = Field(None, description="해결 과정")
    improvements: Optional[str] = Field(None, description="개선점 및 다음 목표")


class ExperienceCreate(BaseModel):
    task_id: int
    title: str
    category: str
    completed_date: datetime
    reflection: Reflection
    tags: List[str] = Field(default_factory=list, max_items=10)
    related_resources: List[str] = Field(default_factory=list)


class ExperienceUpdate(BaseModel):
    reflection: Optional[Reflection] = None
    tags: Optional[List[str]] = Field(None, max_items=10)
    related_resources: Optional[List[str]] = None


class Experience(BaseModel):
    id: str
    user_id: str
    task_id: int
    title: str
    category: str
    completed_date: datetime
    learned: str
    challenges: Optional[str] = None
    solutions: Optional[str] = None
    improvements: Optional[str] = None
    tags: List[str] = []
    related_resources: List[str] = []
    created_at: datetime
    updated_at: datetime


class ExperienceStats(BaseModel):
    total_experiences: int
    total_tags: int
    monthly_count: int
    average_tags_per_experience: float
    category_breakdown: dict
    recent_trends: dict


class TagInfo(BaseModel):
    name: str
    count: int
    last_used: datetime


class TagsResponse(BaseModel):
    tags: List[TagInfo]
    total_unique_tags: int


class CalendarActivity(BaseModel):
    date: str
    count: int
    experiences: List[dict]


class CalendarResponse(BaseModel):
    activities: List[CalendarActivity]
    start_date: str
    end_date: str
    total_days_active: int
    max_count_per_day: int


class TaskCompleteWithReflection(BaseModel):
    completed_date: Optional[datetime] = None
    skip_reflection: bool = False
    reflection: Optional[Reflection] = None
    tags: Optional[List[str]] = Field(None, max_items=10)
    related_resources: Optional[List[str]] = None


# 주간 루틴 시스템
class WeeklyRoutineCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    frequency: int = Field(..., ge=1, le=7, description="주 몇 회 (1-7)")
    color: str = Field("#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")


class WeeklyRoutineUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = Field(None, max_length=100)
    frequency: Optional[int] = Field(None, ge=1, le=7)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class RoutineCompletion(BaseModel):
    id: int
    routine_id: int
    completion_date: date


class WeeklyRoutine(BaseModel):
    id: int
    user_id: str
    title: str
    category: Optional[str] = None
    frequency: int
    color: str
    created_at: datetime
    updated_at: datetime
    completions: List[RoutineCompletion] = []


class RoutineCompleteRequest(BaseModel):
    completion_date: date


class WeeklyStatus(BaseModel):
    routine_id: int
    week_start: str
    week_end: str
    target_count: int
    completed_count: int
    is_success: bool
    progress: float


class CompletionWithDay(BaseModel):
    date: str
    day_of_week: int


class RoutineStats(BaseModel):
    routine_id: int
    title: str
    frequency: int
    color: str
    completed_count: int
    is_success: bool
    progress: float
    completions: List[CompletionWithDay]


class WeeklyStatsSummary(BaseModel):
    total_routines: int
    success_count: int
    in_progress_count: int
    total_completions: int


class WeeklyStatsResponse(BaseModel):
    week_start: str
    week_end: str
    routines: List[RoutineStats]
    summary: WeeklyStatsSummary


# ============ Dashboard Models ============
class RecentActivity(BaseModel):
    id: str
    type: str  # task_completed, reflection_added, routine_completed
    title: str
    date: datetime


class UpcomingDeadline(BaseModel):
    task_id: int
    title: str
    due_date: date
    days_left: int


class WeeklyProgress(BaseModel):
    routines_completed: int
    routines_total: int
    completion_rate: float


class DashboardStats(BaseModel):
    total_experiences: int
    completed_tasks: int
    active_roadmaps: int
    total_tags: int
    recent_activities: List[RecentActivity]
    upcoming_deadlines: List[UpcomingDeadline]
    weekly_progress: WeeklyProgress


# ============ Template Models ============
class TemplateTaskItem(BaseModel):
    title: str
    category: str
    duration: str
    priority: str = Field(pattern="^(required|preferred)$")
    order: int


class TemplateRoutineItem(BaseModel):
    title: str
    category: str
    frequency: int = Field(ge=1, le=7)
    color: str
    order: int


class TemplateCreate(BaseModel):
    title: str
    category: str
    duration: str
    difficulty: str = Field(pattern="^(beginner|intermediate|advanced)$")
    description: str
    tasks: List[TemplateTaskItem]
    routines: List[TemplateRoutineItem]


class Template(BaseModel):
    id: int
    title: str
    category: str
    duration: str
    difficulty: str
    description: str
    tasks: List[TemplateTaskItem]
    routines: List[TemplateRoutineItem]
    created_at: datetime


class TemplateListItem(BaseModel):
    id: int
    title: str
    category: str
    duration: str
    difficulty: str
    description: str
    created_at: datetime


class RoadmapFromTemplateRequest(BaseModel):
    template_id: int
    start_date: date
    customizations: Optional[dict] = None


# ============ Tag Models ============
class TagWithCount(BaseModel):
    name: str
    count: int
    category: Optional[str] = None


class TagExperience(BaseModel):
    id: int
    title: str
    date_range: str
    category: str


# ============ Export Models ============
class ExportRequest(BaseModel):
    include_experiences: bool = True
    include_tasks: bool = True
    include_routines: bool = True
    date_range: Optional[dict] = None


class ExportData(BaseModel):
    exported_at: datetime
    user: dict
    data: dict


# ============ AI Models ============
class ReflectionRequest(BaseModel):
    experience_id: Optional[int] = None
    reflection: dict


class GrowthArea(BaseModel):
    area: str
    progress: str
    evidence: str


class Recommendation(BaseModel):
    priority: str
    action: str
    reason: str


class ReflectionQuality(BaseModel):
    score: int
    strengths: List[str]
    improvements: List[str]


class NextSteps(BaseModel):
    immediate: str
    short_term: str
    long_term: str


class AIInsights(BaseModel):
    summary: str
    growth_areas: List[GrowthArea]
    patterns: List[str]
    recommendations: List[Recommendation]
    reflection_quality: ReflectionQuality
    next_steps: NextSteps
    generated_at: datetime


class LearningPathRequest(BaseModel):
    current_skills: dict
    target_role: str
    timeline: str
    focus_areas: List[str]


class PhaseItem(BaseModel):
    phase: int
    title: str
    duration: str
    topics: List[str]
    projects: List[str]


class WeeklyRoutineItem(BaseModel):
    activity: str
    frequency: int
    reason: str


class Milestone(BaseModel):
    month: int
    goal: str
    metrics: List[str]


class LearningPath(BaseModel):
    phases: List[PhaseItem]
    weekly_routines: List[WeeklyRoutineItem]
    milestones: List[Milestone]


class AIQuestion(BaseModel):
    question: str
    purpose: str
    tags: List[str]


class ReflectionQuestions(BaseModel):
    ai_question1: AIQuestion
    ai_question2: AIQuestion
    ai_question3: AIQuestion
