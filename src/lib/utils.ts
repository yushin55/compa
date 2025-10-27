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
