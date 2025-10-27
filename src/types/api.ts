// OpenAPI 스키마 기반 TypeScript 타입 정의

export interface User {
  user_id: string;
  email: string;
  created_at: string;
}

export interface UserSpec {
  id: number;
  user_id: string;
  job_field: string | null;
  introduction: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: number;
  user_id: string;
  school: string | null;
  major: string | null;
  gpa: string | null;
  graduation_status: 'graduated' | 'expected' | 'enrolled' | null;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: number;
  user_id: string;
  language_type: string;
  score: string;
  acquisition_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  user_id: string;
  certificate_name: string;
  acquisition_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: string;
  project_name: string;
  role: string | null;
  period: string | null;
  description: string | null;
  tech_stack: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  user_id: string;
  activity_name: string;
  activity_type: string | null;
  period: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  user_id: string;
  job_title: string;
  company_name: string;
  location: string | null;
  deadline: string | null;
  experience_level: string | null;
  requirements: string[];
  preferred: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobRequirement {
  description: string;
  category?: string;
  importance?: 'required' | 'preferred';
}

export interface JobPosting {
  id: number;
  company: string;
  title: string;
  description?: string;
  url?: string;
  requirements: JobRequirement[];
  preferred?: JobRequirement[];
  location?: string;
  experience_level?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GapRequirement {
  description: string;
  is_met: boolean;
  gap_detail?: string;
}

export interface UserProgressGap {
  job_posting_id: number;
  requirements: GapRequirement[];
}

export interface UserProgress {
  user_spec?: UserSpec;
  education?: Education | null;
  languages?: Language[];
  certificates?: Certificate[];
  projects?: Project[];
  activities?: Activity[];
  gap_analysis?: UserProgressGap[];
}

export interface Task {
  id: number;
  user_id: string;
  goal_id: number | null;
  title: string;
  description: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  priority: 'high' | 'medium' | 'low' | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  user_spec: UserSpec;
  education: Education | null;
  languages: Language[];
  certificates: Certificate[];
  projects: Project[];
  activities: Activity[];
  stats: {
    language_count: number;
    certificate_count: number;
    project_count: number;
    activity_count: number;
  };
  radar_scores: {
    education: number;
    language: number;
    certificate: number;
    project: number;
    activity: number;
  };
}

export interface GapAnalysis {
  goal: Goal;
  analysis: {
    requirements_met: RequirementCheck[];
    requirements_gap: RequirementCheck[];
    preferred_met: RequirementCheck[];
    preferred_gap: RequirementCheck[];
    suggested_tasks: string[];
  };
}

export interface RequirementCheck {
  requirement: string;
  status: 'met' | 'partial' | 'not_met';
  user_value: string | null;
}

export interface RoadmapProgress {
  goal: Goal | null;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  days_remaining: number | null;
  today_tasks: Task[];
}

export interface ApiError {
  error: string;
  code: string;
}
