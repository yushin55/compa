// 날짜 유틸리티 함수

// YYYY.MM.DD 형식으로 날짜 포맷
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// D-Day 계산 (음수면 지났음, 양수면 남았음)
export const calculateDday = (targetDate: Date | string): number => {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const today = new Date();
  
  // 시간 제거 (자정 기준으로 계산)
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// D-Day 문자열 생성
export const formatDday = (targetDate: Date | string): string => {
  const dday = calculateDday(targetDate);
  
  if (dday === 0) return 'D-Day';
  if (dday < 0) return `D+${Math.abs(dday)}`;
  return `D-${dday}`;
};

// YYYY-MM-DD 형식으로 날짜 포맷 (API용)
export const formatDateForAPI = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 오늘 날짜인지 확인
export const isToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

// LocalStorage 유틸리티
export const storage = {
  // 데이터 가져오기
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // 데이터 저장
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  },

  // 데이터 삭제
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  // 모든 데이터 삭제
  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

// LocalStorage 키 상수
export const STORAGE_KEYS = {
  EXPERIENCES: 'experiences',
  JOB_POSTINGS: 'jobPostings',
  CALENDAR_TASKS: 'calendarTasks',
  DAILY_TASKS: 'dailyTasks',
  SIDEBAR_SECTIONS: 'sidebarSections'
} as const;
