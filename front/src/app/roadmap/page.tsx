'use client';

import { useState, useEffect, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet, apiPost } from '@/lib/api';
import { JobPosting as ApiJobPosting, Goal } from '@/types/api';

type SidebarItem = {
  id: string;
  label: string;
  emoji?: string;
};

type SidebarSection = {
  id: string;
  title: string;
  icon: string;
  items: SidebarItem[];
};

type CalendarTask = {
  id: string;
  title: string;
  date: string;
  isCompleted?: boolean; // 체크박스 완료 상태
};

type DailyTask = {
  id: string;
  title: string;
  category: string;
  dateRange: string;
  date?: string;
  priority?: 'required' | 'preferred' | string; // 필수/우대 구분
};

type WeeklyRoutine = {
  id: string;
  title: string;
  category: string;
  frequency: number; // 주 몇 회 (1-7)
  color: string; // 루틴 색상
  completions: { [date: string]: boolean }; // 날짜별 완료 상태
  isRoutine: true; // 루틴 태스크 구분용
};

type JobPosting = {
  id: string;
  title: string;
  company: string;
  status: string;
  deadline: string;
  tags: string[];
  requirements?: Array<{
    description: string;
    category?: string;
    priority?: string;
  }>;
  url?: string;
};

const INITIAL_SIDEBAR_SECTIONS: SidebarSection[] = [
  { id: 'resume', title: 'MY RESUME', icon: '', items: [] },
  { id: 'experience', title: 'MY EXPERIENCE', icon: '', items: [] },
  { id: 'objective', title: 'OBJECTIVE', icon: '', items: [] },
  { id: 'memo', title: 'MEMO', icon: '', items: [] },
  { id: 'link', title: 'LINK', icon: '', items: [] },
  { id: 'coverletter', title: 'COVER LETTER', icon: '', items: [] }
];

export default function RoadmapPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1));
  const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarSections, setSidebarSections] = useState<SidebarSection[]>(INITIAL_SIDEBAR_SECTIONS);
  const [draggedTask, setDraggedTask] = useState<DailyTask | null>(null);
  const [newItemInput, setNewItemInput] = useState<{ [key: string]: string }>({});
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  
  // 체크박스 상태 관리
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [selectAllTasks, setSelectAllTasks] = useState(false);
  const [selectAllJobs, setSelectAllJobs] = useState(false);

  // 회고 모달 상태
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [completedTaskForReflection, setCompletedTaskForReflection] = useState<DailyTask | null>(null);
  const [reflection, setReflection] = useState({
    learned: '',
    challenges: '',
    solutions: '',
    improvements: ''
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [resourceInput, setResourceInput] = useState('');

  // 주간 뷰 관련 상태
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    category: '',
    date: '',
    priority: 'preferred'
  });

  // 루틴 관련 상태
  const [weeklyRoutines, setWeeklyRoutines] = useState<WeeklyRoutine[]>([]);
  const [showAddRoutineModal, setShowAddRoutineModal] = useState(false);
  const [newRoutineData, setNewRoutineData] = useState({
    title: '',
    category: '',
    frequency: 3,
    color: '#3B82F6'
  });

  // localStorage에서 데이터 로드하는 함수
  const loadFromLocalStorage = () => {
    const savedCalendarTasks = localStorage.getItem('calendarTasks');
    const savedDailyTasks = localStorage.getItem('dailyTasks');
    const savedSidebarSections = localStorage.getItem('sidebarSections');
    const savedJobPostings = localStorage.getItem('jobPostings');
    const savedWeeklyRoutines = localStorage.getItem('weeklyRoutines');
    
    if (savedCalendarTasks) setCalendarTasks(JSON.parse(savedCalendarTasks));
    if (savedDailyTasks) setDailyTasks(JSON.parse(savedDailyTasks));
    if (savedSidebarSections) setSidebarSections(JSON.parse(savedSidebarSections));
    if (savedJobPostings) {
      const jobs = JSON.parse(savedJobPostings);
      console.log('로드된 공고:', jobs);
      setJobPostings(jobs);
    }
    if (savedWeeklyRoutines) setWeeklyRoutines(JSON.parse(savedWeeklyRoutines));
  };

  // 초기 로드
  useEffect(() => {
    if (!getUserId()) {
      router.push('/login');
      return;
    }
    
    loadFromLocalStorage();
    loadGoalJobs();
  }, [router]);

  // 페이지 포커스 시 localStorage 다시 로드 (다른 페이지에서 추가한 데이터 감지)
  useEffect(() => {
    const handleFocus = () => {
      console.log('페이지 포커스 - localStorage 다시 로드');
      loadFromLocalStorage();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // storage 이벤트 리스너 (같은 origin의 다른 탭에서 변경 감지)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage 변경 감지:', e.key);
      if (e.key === 'jobPostings' && e.newValue) {
        const jobs = JSON.parse(e.newValue);
        console.log('새로운 공고 데이터:', jobs);
        setJobPostings(jobs);
      } else if (e.key === 'calendarTasks' && e.newValue) {
        setCalendarTasks(JSON.parse(e.newValue));
      } else if (e.key === 'dailyTasks' && e.newValue) {
        setDailyTasks(JSON.parse(e.newValue));
      } else if (e.key === 'sidebarSections' && e.newValue) {
        setSidebarSections(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // CustomEvent 리스너 (같은 페이지 내에서 변경 감지)
  useEffect(() => {
    const handleJobPostingsUpdate = (e: CustomEvent) => {
      console.log('CustomEvent 받음 - 공고 업데이트:', e.detail);
      setJobPostings(e.detail);
    };

    window.addEventListener('jobPostingsUpdated', handleJobPostingsUpdate as EventListener);
    return () => window.removeEventListener('jobPostingsUpdated', handleJobPostingsUpdate as EventListener);
  }, []);

  // 데이터 변경시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('calendarTasks', JSON.stringify(calendarTasks));
  }, [calendarTasks]);

  useEffect(() => {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('sidebarSections', JSON.stringify(sidebarSections));
  }, [sidebarSections]);

  useEffect(() => {
    localStorage.setItem('jobPostings', JSON.stringify(jobPostings));
  }, [jobPostings]);

  useEffect(() => {
    localStorage.setItem('weeklyRoutines', JSON.stringify(weeklyRoutines));
  }, [weeklyRoutines]);

  const loadGoalJobs = async () => {
    try {
      setLoading(true);
      
      // 먼저 localStorage에서 로드 (즉시 표시)
      loadFromLocalStorage();
      
      // 백엔드 API에서 목표 목록 가져오기
      const response = await apiGet<any>('/goals').catch((error) => {
        // 404는 정상 상황 (목표가 없음)
        if (error.message?.includes('404') || error.message?.includes('NOT_FOUND')) {
          console.log('아직 설정된 목표가 없습니다.');
          return null;
        }
        console.error('목표 로딩 중 오류:', error);
        return null;
      });
      console.log('백엔드에서 가져온 응답:', response);
      
      // 응답이 배열인지 객체인지 확인
      let goals: any[] = [];
      if (response) {
        if (Array.isArray(response)) {
          goals = response;
        } else if (response.goals && Array.isArray(response.goals)) {
          goals = response.goals;
        } else if (typeof response === 'object') {
          // 단일 객체인 경우 배열로 변환
          goals = [response];
        }
      }
      console.log('처리된 목표 배열:', goals);
      
      if (goals.length > 0) {
        const matchedJobs: JobPosting[] = [];
        const allTasks: DailyTask[] = [];
        
        // 각 목표에 대해 처리
        for (const goal of goals) {
          console.log('처리 중인 목표:', goal);
          console.log('목표 필드:', {
            id: goal.id,
            job_posting_id: goal.job_posting_id,
            job_title: goal.job_title,
            company_name: goal.company_name,
            target_date: goal.target_date,
            is_active: goal.is_active
          });
          
          // 공고 정보 변환
          // 백엔드에서 requirements[]와 preferred[] 배열을 받아서 하나의 배열로 합치기
          const combinedRequirements = [
            ...(Array.isArray(goal.requirements) 
              ? goal.requirements.map((req: string) => ({
                  description: req,
                  category: '필수',
                  priority: 'required' as const
                }))
              : []),
            ...(Array.isArray(goal.preferred) 
              ? goal.preferred.map((pref: string) => ({
                  description: pref,
                  category: '우대',
                  priority: 'preferred' as const
                }))
              : [])
          ];
          
          const job: JobPosting = {
            id: String(goal.job_posting_id || goal.id),
            title: goal.job_title || goal.title || '제목 없음',
            company: goal.company_name || goal.company || '회사 미정',
            status: goal.is_active ? '진행중' : '마감',
            deadline: goal.target_date ? new Date(goal.target_date).toLocaleDateString('ko-KR') : '상시채용',
            tags: [goal.company_name, goal.job_title].filter(Boolean),
            requirements: combinedRequirements,
            url: goal.url || ''
          };
          console.log('변환된 Job:', job);
          matchedJobs.push(job);
          
          // 해당 목표의 태스크들 가져오기
          try {
            const tasks = await apiGet<any[]>(`/tasks?goal_id=${goal.id}`);
            console.log(`목표 ${goal.id}의 태스크:`, tasks);
            
            // 태스크를 DailyTask 형식으로 변환
            tasks.forEach(task => {
              // 백엔드 priority 값 변환: high -> required, medium/low -> preferred
              let frontendPriority: 'required' | 'preferred' = 'preferred';
              if (task.priority === 'high') {
                frontendPriority = 'required';
              } else if (task.priority === 'medium' || task.priority === 'low') {
                frontendPriority = 'preferred';
              } else if (task.priority === 'required' || task.priority === 'preferred') {
                // 이미 올바른 형식인 경우
                frontendPriority = task.priority;
              }
              
              allTasks.push({
                id: String(task.id),
                title: task.title || task.description,
                category: task.category || '학습',
                dateRange: task.due_date ? new Date(task.due_date).toLocaleDateString('ko-KR') : '기한 없음',
                date: task.due_date,
                priority: frontendPriority
              });
              
              // 완료된 태스크는 캘린더에도 추가
              if (task.is_completed && task.completed_at) {
                setCalendarTasks(prev => {
                  const exists = prev.some(t => t.id === String(task.id));
                  if (!exists) {
                    return [...prev, {
                      id: String(task.id),
                      title: task.title || task.description,
                      date: task.completed_at.split('T')[0]
                    }];
                  }
                  return prev;
                });
              }
            });
          } catch (error) {
            console.error(`목표 ${goal.id}의 태스크 로딩 실패:`, error);
          }
        }
        
        // 상태 업데이트
        setJobPostings(matchedJobs);
        setDailyTasks(allTasks);
        
        // localStorage에 백업 저장
        localStorage.setItem('jobPostings', JSON.stringify(matchedJobs));
        localStorage.setItem('dailyTasks', JSON.stringify(allTasks));
        
        console.log('로딩 완료:', { jobs: matchedJobs.length, tasks: allTasks.length });
      } else {
        // API에서 데이터 없으면 localStorage만 사용
        console.log('백엔드에 목표가 없습니다. localStorage 데이터 사용');
      }
    } catch (error) {
      console.error('공고 로딩 실패:', error);
      // 오류 발생시 localStorage 데이터 유지
    } finally {
      setLoading(false);
    }
  };

    const addRequirementToSchedule = async (requirement: string, jobTitle: string, priority: 'required' | 'preferred' = 'preferred') => {
    // 프론트엔드 priority를 백엔드 형식으로 변환
    const backendPriority = priority === 'required' ? 'high' : 'medium';
    const today = new Date();
    const scheduledDate = new Date(today);
    scheduledDate.setDate(scheduledDate.getDate() + 7);
    
    const dateStr = `${scheduledDate.getFullYear()}-${String(scheduledDate.getMonth() + 1).padStart(2, '0')}-${String(scheduledDate.getDate()).padStart(2, '0')}`;
    
    const newTask: CalendarTask = {
      id: Date.now().toString(),
      title: `${requirement.substring(0, 15)}...`,
      date: dateStr
    };
    
    const newDailyTask: DailyTask = {
      id: (Date.now() + 1).toString(),
      title: `${jobTitle} - ${requirement}`,
      category: '자격요건',
      dateRange: `${scheduledDate.getFullYear()}년 ${scheduledDate.getMonth() + 1}월 ${scheduledDate.getDate()}일`,
      date: dateStr,
      priority: priority
    };
    
    setCalendarTasks(prev => [...prev, newTask]);
    setDailyTasks(prev => [...prev, newDailyTask]);
    
    try {
      await apiPost('/tasks', {
        title: `${jobTitle} - ${requirement}`,
        description: requirement,
        due_date: dateStr,
        priority: backendPriority // 백엔드 형식 사용: 'high' 또는 'medium'
      });
    } catch (error) {
      console.log('오프라인 모드: 로컬에만 저장됨');
    }
    
    alert(`"${requirement}"이(가) 스케줄에 추가되었습니다!`);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: DragEvent, task: DailyTask) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnCalendar = async (e: DragEvent, day: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 루틴 태스크인지 확인
    const isRoutineTask = draggedTask.priority === 'routine';
    const routine = weeklyRoutines.find(r => r.id === draggedTask.id);

    if (isRoutineTask && routine) {
      // 루틴 처리: 캘린더에 추가하고 자동 완료 처리
      const newCalendarTask: CalendarTask = {
        id: `${routine.id}-${dateStr}`, // 날짜별 고유 ID
        title: routine.title.substring(0, 15),
        date: dateStr,
        isCompleted: true // 자동 완료
      };

      setCalendarTasks(prev => [...prev, newCalendarTask]);
      
      // 루틴 완료 상태 업데이트
      setWeeklyRoutines(prev => prev.map(r => {
        if (r.id === routine.id) {
          const completions = { ...r.completions };
          completions[dateStr] = true;
          return { ...r, completions };
        }
        return r;
      }));

      alert(`✅ 루틴 "${routine.title}"이 ${dateStr}에 완료 처리되었습니다!`);
      
    } else {
      // 일반 태스크 처리
      const newCalendarTask: CalendarTask = {
        id: draggedTask.id,
        title: draggedTask.title.substring(0, 15),
        date: dateStr
      };

      setCalendarTasks(prev => [...prev, newCalendarTask]);
      
      // Daily Task 업데이트
      setDailyTasks(prev => 
        prev.map(t => 
          t.id === draggedTask.id 
            ? { ...t, date: dateStr, dateRange: `${year}년 ${month + 1}월 ${day}일` }
            : t
        )
      );

      // 백엔드 API 업데이트 (완료 처리)
      try {
        await apiPost(`/tasks/${draggedTask.id}/complete`, {
          completed_at: dateStr
        });
        console.log('태스크 완료 처리됨:', draggedTask.id);
      } catch (error) {
        console.error('태스크 완료 처리 실패:', error);
      }

      // 회고 모달 표시
      setCompletedTaskForReflection({...draggedTask, date: dateStr});
      setShowReflectionModal(true);
    }

    setDraggedTask(null);
  };

  const saveReflection = () => {
    if (!completedTaskForReflection) return;

    // 유효성 검사
    if (!reflection.learned.trim()) {
      alert('배운 점을 작성해주세요.');
      return;
    }

    // 경험으로 저장
    const experiences = JSON.parse(localStorage.getItem('experiences') || '[]');
    const newExperience = {
      id: Date.now().toString(),
      taskId: completedTaskForReflection.id,
      title: completedTaskForReflection.title,
      category: completedTaskForReflection.category,
      completedDate: completedTaskForReflection.date || new Date().toISOString().split('T')[0],
      reflection: {
        learned: reflection.learned,
        challenges: reflection.challenges,
        solutions: reflection.solutions,
        improvements: reflection.improvements
      },
      tags,
      relatedResources: resources
    };

    experiences.push(newExperience);
    localStorage.setItem('experiences', JSON.stringify(experiences));

    // 초기화
    setReflection({ learned: '', challenges: '', solutions: '', improvements: '' });
    setTags([]);
    setResources([]);
    setTagInput('');
    setResourceInput('');
    setShowReflectionModal(false);
    setCompletedTaskForReflection(null);

    alert('회고가 저장되었습니다! "나의 경험"에서 확인하세요.');
  };

  const skipReflection = () => {
    setReflection({ learned: '', challenges: '', solutions: '', improvements: '' });
    setTags([]);
    setResources([]);
    setShowReflectionModal(false);
    setCompletedTaskForReflection(null);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addResource = () => {
    if (resourceInput.trim() && !resources.includes(resourceInput.trim())) {
      setResources([...resources, resourceInput.trim()]);
      setResourceInput('');
    }
  };

  const removeResource = (resource: string) => {
    setResources(resources.filter(r => r !== resource));
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('이 작업을 삭제하시겠습니까?')) {
      setDailyTasks(prev => prev.filter(t => t.id !== taskId));
      setCalendarTasks(prev => prev.filter(t => t.id !== taskId));
      
      // 백엔드에서도 삭제
      try {
        await apiPost(`/tasks/${taskId}/delete`, {});
        console.log('태스크 삭제됨:', taskId);
      } catch (error) {
        console.error('태스크 삭제 실패:', error);
      }
      
      // 선택 목록에서도 제거
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }
  };

  // Task List 체크박스 핸들러
  const handleToggleAllTasks = () => {
    if (selectAllTasks) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(dailyTasks.map(t => t.id)));
    }
    setSelectAllTasks(!selectAllTasks);
  };

  const handleToggleTask = (taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleDeleteSelectedTasks = async () => {
    if (selectedTaskIds.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedTaskIds.size}개의 작업을 삭제하시겠습니까?`)) {
      const idsToDelete = Array.from(selectedTaskIds);
      
      // UI에서 먼저 제거
      setDailyTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)));
      setCalendarTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)));
      
      // 백엔드에서 삭제
      for (const taskId of idsToDelete) {
        try {
          await apiPost(`/tasks/${taskId}/delete`, {});
        } catch (error) {
          console.error(`태스크 ${taskId} 삭제 실패:`, error);
        }
      }
      
      setSelectedTaskIds(new Set());
      setSelectAllTasks(false);
    }
  };

  // Job 체크박스 핸들러
  const handleToggleAllJobs = () => {
    if (selectAllJobs) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(jobPostings.map(j => j.id)));
    }
    setSelectAllJobs(!selectAllJobs);
  };

  const handleToggleJob = (jobId: string) => {
    setSelectedJobIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleDeleteSelectedJobs = async () => {
    if (selectedJobIds.size === 0) {
      alert('삭제할 목표를 선택해주세요.');
      return;
    }

    if (confirm(`선택한 ${selectedJobIds.size}개의 목표를 삭제하시겠습니까?`)) {
      const idsToDelete = Array.from(selectedJobIds);
      
      // UI에서 먼저 제거
      setJobPostings(prev => prev.filter(j => !selectedJobIds.has(j.id)));
      
      // localStorage 업데이트
      const updatedJobs = jobPostings.filter(j => !selectedJobIds.has(j.id));
      localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
      
      // 백엔드에서 목표 삭제 (구현된 경우)
      for (const jobId of idsToDelete) {
        try {
          await apiPost(`/goals/${jobId}/delete`, {});
        } catch (error) {
          console.error(`목표 ${jobId} 삭제 실패:`, error);
        }
      }
      
      setSelectedJobIds(new Set());
      setSelectAllJobs(false);
      
      // 관련 태스크도 삭제
      setDailyTasks(prev => prev.filter(t => !idsToDelete.includes(t.id)));
    }
  };

  const handleDeleteCalendarTask = (taskId: string) => {
    if (confirm('이 일정을 삭제하시겠습니까?')) {
      // 캘린더에서 제거
      setCalendarTasks(prev => prev.filter(t => t.id !== taskId));
      
      // 루틴 완료 기록에서 제거 (루틴-날짜 조합 ID인 경우)
      if (taskId.includes('-')) {
        const [routineId, dateStr] = taskId.split('-');
        setWeeklyRoutines(prev => prev.map(routine => {
          if (routine.id === routineId) {
            const completions = { ...routine.completions };
            delete completions[dateStr];
            return { ...routine, completions };
          }
          return routine;
        }));
      } else {
        // 일반 태스크인 경우 dailyTasks에서 날짜 정보만 제거 (태스크 자체는 유지)
        setDailyTasks(prev => 
          prev.map(t => 
            t.id === taskId 
              ? { ...t, date: undefined, dateRange: t.dateRange.includes('년') ? '' : t.dateRange }
              : t
          )
        );
      }
    }
  };

  // 사이드바 아이템 추가
  const addSidebarItem = (sectionId: string) => {
    const inputValue = newItemInput[sectionId]?.trim();
    if (!inputValue) return;

    setSidebarSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items, { id: Date.now().toString(), label: inputValue }]
            }
          : section
      )
    );

    setNewItemInput(prev => ({ ...prev, [sectionId]: '' }));
    setEditingSectionId(null);
  };

  // 사이드바 아이템 삭제
  const deleteSidebarItem = (sectionId: string, itemId: string) => {
    setSidebarSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      )
    );
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length < 42) days.push(null);
    return days;
  };

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const getTasksForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarTasks.filter(task => task.date === dateStr);
  };

  // 주간 뷰 관련 함수
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(currentWeekStart);
    start.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const changeWeek = (delta: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setCurrentWeekStart(newDate);
  };

  const getTasksForWeekDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return calendarTasks.filter(task => task.date === dateStr);
  };

  const handleAddTask = () => {
    if (!newTaskData.title.trim() || !newTaskData.date) {
      alert('일정 제목과 날짜를 입력해주세요.');
      return;
    }

    const newTask: CalendarTask = {
      id: Date.now().toString(),
      title: newTaskData.title,
      date: newTaskData.date
    };

    setCalendarTasks(prev => [...prev, newTask]);
    
    // 새로운 DailyTask도 추가
    if (newTaskData.category) {
      const newDailyTask: DailyTask = {
        id: Date.now().toString() + '-daily',
        title: newTaskData.title,
        category: newTaskData.category,
        dateRange: newTaskData.date,
        date: newTaskData.date,
        priority: newTaskData.priority
      };
      setDailyTasks(prev => [...prev, newDailyTask]);
    }

    // 모달 닫고 초기화
    setShowAddTaskModal(false);
    setNewTaskData({
      title: '',
      category: '',
      date: '',
      priority: 'preferred'
    });
  };

  // 루틴 추가 - 태스크 목록에 추가됨
  const handleAddRoutine = () => {
    if (!newRoutineData.title.trim()) {
      alert('루틴 제목을 입력해주세요.');
      return;
    }

    const newRoutine: WeeklyRoutine = {
      id: Date.now().toString(),
      title: newRoutineData.title,
      category: newRoutineData.category,
      frequency: newRoutineData.frequency,
      color: newRoutineData.color,
      completions: {},
      isRoutine: true
    };

    setWeeklyRoutines(prev => [...prev, newRoutine]);
    
    // 태스크 목록에도 추가 (드래그 가능하도록)
    const newTask: DailyTask = {
      id: newRoutine.id,
      title: `🔁 ${newRoutine.title} (주${newRoutine.frequency}회)`,
      category: newRoutine.category || '루틴',
      dateRange: `주 ${newRoutine.frequency}회 목표`,
      priority: 'routine' // 루틴 구분용
    };
    
    setDailyTasks(prev => [...prev, newTask]);
    
    setShowAddRoutineModal(false);
    setNewRoutineData({
      title: '',
      category: '',
      frequency: 3,
      color: '#3B82F6'
    });
  };

  // 루틴 체크박스 토글
  const toggleRoutineCompletion = (routineId: string, dateStr: string) => {
    setWeeklyRoutines(prev => prev.map(routine => {
      if (routine.id === routineId) {
        const completions = { ...routine.completions };
        completions[dateStr] = !completions[dateStr];
        return { ...routine, completions };
      }
      return routine;
    }));
  };

  // 루틴 삭제
  const handleDeleteRoutine = (routineId: string) => {
    if (confirm('이 루틴을 삭제하시겠습니까?')) {
      setWeeklyRoutines(prev => prev.filter(r => r.id !== routineId));
      // 태스크 목록에서도 삭제
      setDailyTasks(prev => prev.filter(t => t.id !== routineId));
    }
  };

  // 주간 루틴 달성 여부 계산
  const getRoutineWeeklyStatus = (routine: WeeklyRoutine, weekStartDate: Date) => {
    // 주간 날짜 배열 생성
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + i);
      return date;
    });
    
    const completedCount = weekDates.filter(date => {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return routine.completions[dateStr];
    }).length;

    return {
      completedCount,
      targetCount: routine.frequency,
      isSuccess: completedCount >= routine.frequency,
      progress: Math.min(100, (completedCount / routine.frequency) * 100)
    };
  };

  const calendarDays = generateCalendar();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Schedule</h2>
                {/* 뷰 모드 전환 버튼 */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'month' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    월간
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      viewMode === 'week' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    주간
                  </button>
                </div>
              </div>
              {/* 일정 추가 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddRoutineModal(true)}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  루틴 추가
                </button>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  일정 추가
                </button>
              </div>
            </div>
            
            {viewMode === 'month' ? (
              // 월간 뷰
              <>
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
                    <button onClick={() => setCurrentDate(new Date())} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">오늘</button>
                  </div>
                  <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
            <div className="p-2">
              <div className="grid grid-cols-7 mb-1">
                {weekDays.map((day, index) => (
                  <div key={day} className={`text-center text-xs font-medium py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'}`}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays.map((day, index) => {
                  const tasks = day ? getTasksForDate(day) : [];
                  const dayOfWeek = index % 7;
                  return (
                    <div 
                      key={index} 
                      className={`bg-white p-1.5 min-h-[80px] ${!day ? 'bg-gray-50' : 'cursor-pointer hover:bg-blue-50'} transition-colors`}
                      onDragOver={day ? handleDragOver : undefined}
                      onDrop={day ? (e) => handleDropOnCalendar(e, day) : undefined}
                    >
                      {day && (
                        <>
                          <div className={`text-xs mb-1 ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'}`}>{day}</div>
                          {tasks.map(task => (
                            <div 
                              key={task.id} 
                              className="text-[10px] bg-red-500 text-white rounded px-1 py-0.5 mb-0.5 truncate flex items-center justify-between group"
                            >
                              <span className="flex-1 truncate">{task.title}</span>
                              <button
                                onClick={() => handleDeleteCalendarTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 ml-1 hover:text-red-200"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
              </>
            ) : (
              // 주간 뷰 (마이루틴 스타일)
              <>
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <button onClick={() => changeWeek(-1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {currentWeekStart.getFullYear()}년 {currentWeekStart.getMonth() + 1}월 {currentWeekStart.getDate()}일 ~ {(() => {
                        const endDate = new Date(currentWeekStart);
                        endDate.setDate(endDate.getDate() + 6);
                        return `${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;
                      })()}
                    </span>
                    <button onClick={() => setCurrentWeekStart(new Date())} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">이번 주</button>
                  </div>
                  <button onClick={() => changeWeek(1)} className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-3">
                    {getWeekDates().map((date, index) => {
                      const tasks = getTasksForWeekDate(date);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const dayOfWeek = date.getDay();
                      
                      return (
                        <div key={index} className="flex flex-col">
                          {/* 요일 헤더 */}
                          <div className={`text-center mb-3 ${isToday ? 'bg-blue-100 rounded-lg py-2' : 'py-2'}`}>
                            <div className={`text-xs font-medium mb-1 ${
                              dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-600'
                            }`}>
                              {weekDays[dayOfWeek]}
                            </div>
                            <div className={`text-lg font-bold ${
                              isToday ? 'text-blue-600' : dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-900'
                            }`}>
                              {date.getDate()}
                            </div>
                          </div>
                          
                          {/* 일정 카드들 */}
                          <div 
                            className="flex-1 bg-gray-50 rounded-lg p-2 min-h-[400px] space-y-2"
                            onDragOver={handleDragOver}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (!draggedTask) return;
                              
                              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              
                              const newCalendarTask: CalendarTask = {
                                id: Date.now().toString(),
                                title: draggedTask.title,
                                date: dateStr
                              };
                              
                              setCalendarTasks(prev => [...prev, newCalendarTask]);
                              setDraggedTask(null);
                            }}
                          >
                            {/* 루틴 표시 (드래그로 배치된 것만) */}
                            {weeklyRoutines.map(routine => {
                              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              const isCompleted = routine.completions[dateStr] || false;
                              
                              // 이 날짜에 완료된 루틴만 표시
                              if (!isCompleted) return null;
                              
                              return (
                                <div
                                  key={`${routine.id}-${dateStr}`}
                                  className="bg-white rounded-lg p-3 shadow-sm border-2 transition-all group"
                                  style={{ borderColor: routine.color }}
                                >
                                  <div className="flex items-start gap-2">
                                    <div 
                                      className="w-4 h-4 rounded flex items-center justify-center text-white text-xs font-bold mt-0.5"
                                      style={{ backgroundColor: routine.color }}
                                    >
                                      ✓
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-medium leading-relaxed text-gray-900">
                                        🔁 {routine.title}
                                      </p>
                                      {routine.category && (
                                        <span className="text-[10px] text-gray-500 mt-1 block">
                                          {routine.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* 일반 일정 표시 */}
                            {tasks.length === 0 && !weeklyRoutines.some(r => {
                              const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                              return r.completions[dateStr];
                            }) ? (
                              <div className="text-center text-xs text-gray-400 mt-8">
                                일정 없음
                              </div>
                            ) : (
                              tasks.map(task => (
                                <div
                                  key={task.id}
                                  className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-medium text-gray-900 flex-1 leading-relaxed">
                                      {task.title}
                                    </p>
                                    <button
                                      onClick={() => handleDeleteCalendarTask(task.id)}
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Task List ({dailyTasks.length})</h2>
              <div className="flex items-center gap-2">
                {selectedTaskIds.size > 0 && (
                  <button
                    onClick={handleDeleteSelectedTasks}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    선택 삭제 ({selectedTaskIds.size})
                  </button>
                )}
                <span className="text-xs text-gray-500">드래그하여 캘린더에 추가하세요</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left w-8">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={selectAllTasks}
                        onChange={handleToggleAllTasks}
                      />
                    </th>
                    <th className="px-4 py-2 text-left font-medium">구분</th>
                    <th className="px-4 py-2 text-left font-medium">우대/필수</th>
                    <th className="px-4 py-2 text-left font-medium">내용</th>
                    <th className="px-4 py-2 text-left font-medium">일정</th>
                    <th className="px-4 py-2 text-left font-medium w-20">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTasks.map(task => {
                    const isRequired = task.priority === 'required' || task.priority === '필수';
                    const isPreferred = task.priority === 'preferred' || task.priority === '우대';
                    
                    return (
                      <tr 
                        key={task.id} 
                        className={`border-b hover:bg-gray-50 cursor-move ${selectedTaskIds.has(task.id) ? 'bg-blue-50' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedTaskIds.has(task.id)}
                            onChange={() => handleToggleTask(task.id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-700">
                            {task.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            isRequired 
                              ? 'bg-red-100 text-red-700 border border-red-300' 
                              : isPreferred 
                              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isRequired ? '필수' : isPreferred ? '우대' : task.priority || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.title}</td>
                        <td className="px-4 py-3 text-gray-600">{task.dateRange}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 루틴 관리 섹션 */}
          {weeklyRoutines.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">내 루틴 ({weeklyRoutines.length})</h2>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {weeklyRoutines.map(routine => {
                  // 이번 주 달성률 계산 (드래그로 배치된 횟수 기준)
                  const weekStatus = getRoutineWeeklyStatus(routine, currentWeekStart);

                  return (
                    <div
                      key={routine.id}
                      className="border-2 rounded-lg p-4 hover:shadow-md transition-all"
                      style={{ borderColor: routine.color }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">🔁 {routine.title}</h3>
                          {routine.category && (
                            <span className="text-xs text-gray-500">{routine.category}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRoutine(routine.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">목표</span>
                          <span className="font-semibold">주 {routine.frequency}회</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">이번 주 진행</span>
                          <span className={`font-semibold ${weekStatus.isSuccess ? 'text-green-600' : ''}`} style={{ color: weekStatus.isSuccess ? '#16a34a' : routine.color }}>
                            {weekStatus.completedCount} / {weekStatus.targetCount}
                            {weekStatus.isSuccess && ' ✓'}
                          </span>
                        </div>
                        {/* 달성 진행 바 */}
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${weekStatus.progress}%`,
                              backgroundColor: weekStatus.isSuccess ? '#16a34a' : routine.color
                            }}
                          />
                        </div>
                        <div className="text-xs text-center text-gray-500">
                          {weekStatus.isSuccess ? (
                            <span className="text-green-600 font-semibold">✨ 이번 주 목표 달성! ✨</span>
                          ) : (
                            <span>{Math.round(weekStatus.progress)}% 달성 중</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Job ({jobPostings.length})</h2>
              <div className="flex items-center gap-2">
                {selectedJobIds.size > 0 && (
                  <button
                    onClick={handleDeleteSelectedJobs}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    선택 삭제 ({selectedJobIds.size})
                  </button>
                )}
                <button 
                  onClick={loadGoalJobs}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  새로고침
                </button>
              </div>
            </div>
            <div className="px-4 py-3 border-b flex items-center gap-3">
              <input 
                type="checkbox" 
                className="rounded"
                checked={selectAllJobs}
                onChange={handleToggleAllJobs}
              />
              <span className="text-xs font-medium text-gray-600">전체 선택</span>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
              ) : jobPostings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📋</div>
                  <p className="text-gray-600 mb-4">설정된 목표 공고가 없습니다</p>
                  <button
                    onClick={() => router.push('/goal-setting')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    목표 설정하러 가기
                  </button>
                </div>
              ) : (
                jobPostings.map(job => (
                  <div 
                    key={job.id} 
                    className={`border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow ${
                      selectedJobIds.has(job.id) ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedJobIds.has(job.id)}
                            onChange={() => handleToggleJob(job.id)}
                          />
                          <h3 className="font-medium text-sm">{job.title}</h3>
                        </div>
                        <p className="text-xs text-gray-600 ml-6">{job.company}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        job.status === '진행중' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 ml-6 text-xs text-gray-600 mb-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{job.deadline}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-6 mt-2 mb-3">
                      {job.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded">{tag}</span>
                      ))}
                    </div>
                    <div className="ml-6 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowJobDetail(true);
                        }}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        자격요건 확인
                      </button>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded hover:bg-gray-100 flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          원본 보기
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="w-64 bg-white border-l overflow-y-auto">
          {sidebarSections.map(section => (
            <div key={section.id} className="border-b">
              <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{section.icon}</span>
                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">{section.title}</span>
                </div>
                <button
                  onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {editingSectionId === section.id ? '닫기' : '+'}
                </button>
              </div>
              <div className="py-1">
                {section.items.map(item => (
                  <div key={item.id} className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group">
                    <div className="flex items-center gap-1.5">
                      {item.emoji && <span className="text-xs">{item.emoji}</span>}
                      <span className="text-xs text-gray-700">{item.label}</span>
                    </div>
                    <button
                      onClick={() => deleteSidebarItem(section.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 text-xs hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {editingSectionId === section.id && (
                  <div className="px-3 py-2 flex gap-1">
                    <input
                      type="text"
                      value={newItemInput[section.id] || ''}
                      onChange={(e) => setNewItemInput(prev => ({ ...prev, [section.id]: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addSidebarItem(section.id)}
                      placeholder="항목 추가..."
                      className="flex-1 text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => addSidebarItem(section.id)}
                      className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      추가
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 자격요건 상세 모달 */}
      {showJobDetail && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedJob.company} - {selectedJob.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    자격요건 및 우대사항을 확인하고 스케줄에 추가하세요
                  </p>
                </div>
                <button
                  onClick={() => setShowJobDetail(false)}
                  className="p-2 hover:bg-white rounded-lg transition-all"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* 필수 요건 */}
                {selectedJob.requirements?.filter(r => r.priority === 'required' || false).length! > 0 && (
                  <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                    <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      필수 요건 ({selectedJob.requirements?.filter(r => r.priority === 'required').length || 0})
                    </h3>
                    <div className="space-y-3">
                      {selectedJob.requirements
                        ?.filter(r => r.priority === 'required')
                        .map((req, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <div>
                                  <p className="text-sm text-gray-900 font-medium">{req.description}</p>
                                  {req.category && (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">
                                      {req.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => addRequirementToSchedule(req.description, selectedJob.title, 'required')}
                              className="flex-shrink-0 text-xs px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 whitespace-nowrap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              스케줄 추가
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 우대사항 */}
                {selectedJob.requirements?.filter(r => r.priority === 'preferred' || false).length! > 0 && (
                  <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                    <h3 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      우대사항 ({selectedJob.requirements?.filter(r => r.priority === 'preferred').length || 0})
                    </h3>
                    <div className="space-y-3">
                      {selectedJob.requirements
                        ?.filter(r => r.priority === 'preferred')
                        .map((req, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-2">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <div>
                                  <p className="text-sm text-gray-900 font-medium">{req.description}</p>
                                  {req.category && (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                      {req.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => addRequirementToSchedule(req.description, selectedJob.title, 'preferred')}
                              className="flex-shrink-0 text-xs px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 whitespace-nowrap"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              스케줄 추가
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* 안내 */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">스케줄 추가 안내</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 각 요건별로 "스케줄 추가" 버튼을 클릭하면 일정에 자동 추가됩니다</li>
                        <li>• 추가된 일정은 캘린더와 DAILY LIST에서 확인할 수 있습니다</li>
                        <li>• 필수 요건을 우선적으로 스케줄에 추가하는 것을 권장합니다</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setShowJobDetail(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회고 작성 모달 */}
      {showReflectionModal && completedTaskForReflection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* 모달 헤더 */}
            <div className="p-8 border-b border-gray-200 bg-gray-50">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">태스크 완료</h2>
                <p className="text-sm text-gray-600">경험을 회고로 남겨 자산화하세요</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="font-semibold text-gray-900">{completedTaskForReflection.title}</p>
                <p className="text-sm text-gray-600 mt-1">{completedTaskForReflection.category} · {completedTaskForReflection.dateRange}</p>
              </div>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* 배운 점 (필수) */}
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-2">
                    배운 점 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reflection.learned}
                    onChange={(e) => setReflection({...reflection, learned: e.target.value})}
                    placeholder="이 태스크를 통해 무엇을 배웠나요?"
                    className="form-control min-h-[100px]"
                    required
                  />
                </div>

                {/* 어려웠던 점 */}
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-2">
                    어려웠던 점
                  </label>
                  <textarea
                    value={reflection.challenges}
                    onChange={(e) => setReflection({...reflection, challenges: e.target.value})}
                    placeholder="어떤 부분이 어려웠나요?"
                    className="form-control min-h-[80px]"
                  />
                </div>

                {/* 해결 과정 */}
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-2">
                    해결 과정
                  </label>
                  <textarea
                    value={reflection.solutions}
                    onChange={(e) => setReflection({...reflection, solutions: e.target.value})}
                    placeholder="어떻게 문제를 해결했나요?"
                    className="form-control min-h-[80px]"
                  />
                </div>

                {/* 개선점 */}
                <div>
                  <label className="block text-sm font-bold text-text-dark mb-2">
                    개선점 및 다음 목표
                  </label>
                  <textarea
                    value={reflection.improvements}
                    onChange={(e) => setReflection({...reflection, improvements: e.target.value})}
                    placeholder="다음에는 어떻게 개선할 수 있을까요?"
                    className="form-control min-h-[80px]"
                  />
                </div>

                {/* 태그 추가 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    기술 스택 & 태그
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="예: React, TypeScript, API..."
                      className="form-control flex-1"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 text-sm font-medium flex items-center gap-2 border border-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 관련 자료 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    관련 자료 (URL, 문서 등)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={resourceInput}
                      onChange={(e) => setResourceInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addResource())}
                      placeholder="https://..."
                      className="form-control flex-1"
                    />
                    <button
                      type="button"
                      onClick={addResource}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {resources.map((resource, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
                      >
                        <span className="flex-1 truncate text-gray-700">{resource}</span>
                        <button
                          type="button"
                          onClick={() => removeResource(resource)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={skipReflection}
                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                나중에 작성
              </button>
              <button
                onClick={saveReflection}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm hover:shadow-md transition-all"
              >
                회고 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 추가 모달 */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">새 일정 추가</h2>
                <button
                  onClick={() => {
                    setShowAddTaskModal(false);
                    setNewTaskData({
                      title: '',
                      category: '',
                      date: '',
                      priority: 'preferred'
                    });
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                >
                  <span className="text-gray-600 text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="p-6">
              <div className="space-y-4">
                {/* 일정 제목 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    일정 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTaskData.title}
                    onChange={(e) => setNewTaskData({...newTaskData, title: e.target.value})}
                    placeholder="예: React 공부하기"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 날짜 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    날짜 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newTaskData.date}
                    onChange={(e) => setNewTaskData({...newTaskData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    카테고리 (선택)
                  </label>
                  <select
                    value={newTaskData.category}
                    onChange={(e) => setNewTaskData({...newTaskData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">선택 안함</option>
                    <option value="백엔드">백엔드</option>
                    <option value="프론트엔드">프론트엔드</option>
                    <option value="AI">AI</option>
                    <option value="데이터">데이터</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                {/* 우선순위 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    우선순위
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewTaskData({...newTaskData, priority: 'required'})}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        newTaskData.priority === 'required'
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      필수
                    </button>
                    <button
                      onClick={() => setNewTaskData({...newTaskData, priority: 'preferred'})}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                        newTaskData.priority === 'preferred'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      우대
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTaskData({
                    title: '',
                    category: '',
                    date: '',
                    priority: 'preferred'
                  });
                }}
                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleAddTask}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-sm hover:shadow-md transition-all"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 루틴 추가 모달 */}
      {showAddRoutineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* 모달 헤더 */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">새 루틴 추가</h2>
                <button
                  onClick={() => {
                    setShowAddRoutineModal(false);
                    setNewRoutineData({
                      title: '',
                      category: '',
                      frequency: 3,
                      color: '#3B82F6'
                    });
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                >
                  <span className="text-gray-600 text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="p-6">
              <div className="space-y-4">
                {/* 루틴 제목 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    루틴 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRoutineData.title}
                    onChange={(e) => setNewRoutineData({...newRoutineData, title: e.target.value})}
                    placeholder="예: 운동하기, 코딩 공부"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    카테고리 (선택)
                  </label>
                  <select
                    value={newRoutineData.category}
                    onChange={(e) => setNewRoutineData({...newRoutineData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">선택 안함</option>
                    <option value="운동">운동</option>
                    <option value="학습">학습</option>
                    <option value="독서">독서</option>
                    <option value="프로젝트">프로젝트</option>
                    <option value="건강">건강</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                {/* 주당 횟수 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    주당 목표 횟수 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      value={newRoutineData.frequency}
                      onChange={(e) => setNewRoutineData({...newRoutineData, frequency: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-gray-900 min-w-[60px] text-center">
                      주 {newRoutineData.frequency}회
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 루틴을 생성한 후 태스크 목록에서 원하는 날짜로 드래그해서 배치하세요!
                  </p>
                </div>

                {/* 색상 선택 */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    루틴 색상
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newRoutineData.color}
                      onChange={(e) => setNewRoutineData({...newRoutineData, color: e.target.value})}
                      className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewRoutineData({...newRoutineData, color})}
                          className={`w-8 h-8 rounded-lg border-2 ${
                            newRoutineData.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 모달 푸터 */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddRoutineModal(false);
                  setNewRoutineData({
                    title: '',
                    category: '',
                    frequency: 3,
                    color: '#3B82F6'
                  });
                }}
                className="px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                취소
              </button>
              <button
                onClick={handleAddRoutine}
                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-sm hover:shadow-md transition-all"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
