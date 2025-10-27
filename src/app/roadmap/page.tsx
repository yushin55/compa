'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet, apiPatch, apiPost } from '@/lib/api';
import { RoadmapProgress, Task } from '@/types/api';
import { formatDate, formatDday } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 드래그 가능한 태스크 컴포넌트
function DraggableTask({
  task,
  onEdit,
  onToggle,
}: {
  task: Task;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button')) {
          onEdit();
        }
      }}
      className={`p-3 rounded-xl cursor-move transition-all ${
        task.is_completed
          ? 'bg-green-100 border border-green-200'
          : 'bg-purple-50 border border-purple-200 hover:shadow-md'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="mt-0.5"
        >
          {task.is_completed ? (
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-4 h-4 border-2 border-purple-400 rounded"></div>
          )}
        </button>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${
            task.is_completed ? 'line-through text-green-800' : 'text-purple-900'
          }`}>
            {task.title}
          </div>
          {task.priority && (
            <div className={`text-xs mt-1 ${
              task.priority === 'high' ? 'text-red-600' :
              task.priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<RoadmapProgress | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [view, setView] = useState<'timeline' | 'weekly'>('timeline');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [draggedDate, setDraggedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!getUserId()) {
      router.push('/login');
      return;
    }

    loadRoadmap();
  }, [router]);

  const loadRoadmap = async () => {
    try {
      const [progressData, tasksData] = await Promise.all([
        apiGet<RoadmapProgress>('/roadmap/progress'),
        apiGet<Task[]>('/tasks'),
      ]);

      setProgress(progressData);
      setTasks(tasksData);
    } catch (error: any) {
      console.error('로드맵 로드 실패:', error);
      if (error.code === 'NOT_FOUND') {
        alert('먼저 목표를 설정해주세요.');
        router.push('/goal-setting');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: number, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await apiPatch(`/tasks/${taskId}/incomplete`);
      } else {
        await apiPatch(`/tasks/${taskId}/complete`);
      }
      
      loadRoadmap();
    } catch (error) {
      console.error('태스크 업데이트 실패:', error);
      alert('태스크 업데이트에 실패했습니다.');
    }
  };

  const getFilteredTasks = () => {
    if (filter === 'completed') {
      return tasks.filter(t => t.is_completed);
    } else if (filter === 'pending') {
      return tasks.filter(t => !t.is_completed);
    }
    return tasks;
  };

  const getStatusColor = (task: Task) => {
    if (task.is_completed) return 'bg-green-50 border-green-200';
    const daysLeft = task.due_date ? 
      Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    if (daysLeft && daysLeft < 3) return 'bg-red-50 border-red-200';
    if (daysLeft && daysLeft < 7) return 'bg-yellow-50 border-yellow-200';
    return 'bg-white border-border-color';
  };

  const getWeekDays = () => {
    const week = [];
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay()); // 일요일부터 시작
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const openEditModal = (task: Task) => {
    setEditingTask({ ...task });
    setShowEditModal(true);
  };

  const saveTaskEdit = async () => {
    if (!editingTask) return;

    try {
      await apiPatch(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
        due_date: editingTask.due_date,
        priority: editingTask.priority,
      });
      
      setShowEditModal(false);
      setEditingTask(null);
      loadRoadmap();
    } catch (error) {
      console.error('태스크 수정 실패:', error);
      alert('태스크 수정에 실패했습니다.');
    }
  };

  const addNewTask = async () => {
    if (!newTask.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    try {
      await apiPost('/tasks', {
        ...newTask,
        goal_id: progress?.goal?.id || null,
      });
      
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
      });
      loadRoadmap();
    } catch (error) {
      console.error('태스크 추가 실패:', error);
      alert('태스크 추가에 실패했습니다.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    // 드래그한 태스크와 드롭한 날짜 찾기
    const taskId = active.id as number;
    const newDate = draggedDate;

    if (!newDate) return;

    try {
      // 태스크의 날짜 업데이트
      await apiPatch(`/tasks/${taskId}`, {
        due_date: newDate.toISOString().split('T')[0],
      });
      
      loadRoadmap();
    } catch (error) {
      console.error('태스크 이동 실패:', error);
      alert('태스크 이동에 실패했습니다.');
    } finally {
      setDraggedDate(null);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-body-1 text-text-gray">로딩 중...</div>
          </div>
        </div>
      </>
    );
  }

  if (!progress) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-headline mb-4 text-text-dark">목표가 없습니다</div>
            <button onClick={() => router.push('/goal-setting')} className="btn btn-primary">
              목표 설정하기
            </button>
          </div>
        </div>
      </>
    );
  }

  const filteredTasks = getFilteredTasks();
  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="border-b border-border-color">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-display-2 mb-3 text-text-dark">
                  {progress.goal?.job_title || '목표 없음'}
                </h1>
                <div className="flex items-center gap-4 text-body-1 text-text-gray">
                  <span>{progress.goal?.company_name}</span>
                  <span>•</span>
                  <span>{progress.goal?.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  일정 추가
                </button>
                {progress.goal?.deadline && (
                  <div className="text-right">
                    <div className="text-sm text-text-gray mb-1">마감일</div>
                    <div className="text-title-1 font-bold text-primary">
                      {formatDday(progress.goal.deadline)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 진행률 */}
            <div className="bg-bg-light rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-body-1 font-semibold text-text-dark">
                  전체 진행률
                </div>
                <div className="text-title-1 font-bold text-primary">
                  {Math.round(progress.progress_percentage)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progress.progress_percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm text-text-gray">
                <span>완료 {completedCount}개</span>
                <span>전체 {totalCount}개</span>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 */}
        <div className="border-b border-border-color bg-white sticky top-16 z-10">
          <div className="max-w-5xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'all'
                      ? 'bg-primary text-white'
                      : 'text-text-gray hover:bg-bg-light'
                  }`}
                >
                  전체 {totalCount}
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'pending'
                      ? 'bg-primary text-white'
                      : 'text-text-gray hover:bg-bg-light'
                  }`}
                >
                  진행중 {totalCount - completedCount}
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'completed'
                      ? 'bg-primary text-white'
                      : 'text-text-gray hover:bg-bg-light'
                  }`}
                >
                  완료 {completedCount}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('timeline')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    view === 'timeline'
                      ? 'bg-secondary text-white'
                      : 'text-text-gray hover:bg-bg-light'
                  }`}
                >
                  타임라인
                </button>
                <button
                  onClick={() => setView('weekly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    view === 'weekly'
                      ? 'bg-secondary text-white'
                      : 'text-text-gray hover:bg-bg-light'
                  }`}
                >
                  주간 일정
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 타임라인 태스크 리스트 */}
        <div className="max-w-5xl mx-auto px-8 py-12">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-20 text-text-gray">
              해당하는 태스크가 없습니다.
            </div>
          ) : view === 'timeline' ? (
            /* 타임라인 뷰 */
            <div className="relative">
              {/* 타임라인 라인 */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border-color" />

              {/* 태스크 목록 */}
              <div className="space-y-6">
                {filteredTasks.map((task, index) => (
                  <div key={task.id} className="relative flex gap-6">
                    {/* 타임라인 도트 */}
                    <div className="relative z-10 flex-shrink-0">
                      <button
                        onClick={() => toggleTask(task.id, task.is_completed)}
                        className={`w-12 h-12 rounded-full border-4 border-white transition-all ${
                          task.is_completed
                            ? 'bg-secondary shadow-lg'
                            : 'bg-white border-border-color hover:border-primary'
                        } flex items-center justify-center cursor-pointer`}
                      >
                        {task.is_completed && (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* 태스크 카드 */}
                    <div className={`flex-1 border-2 rounded-2xl p-6 transition-all ${getStatusColor(task)} ${
                      task.is_completed ? 'opacity-60' : 'hover:shadow-toss-hover'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-title-2 font-semibold ${
                          task.is_completed ? 'line-through text-text-gray' : 'text-text-dark'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {task.due_date && (
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              task.is_completed
                                ? 'bg-green-100 text-green-700'
                                : Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 3
                                ? 'bg-red-100 text-red-700'
                                : Math.ceil((new Date(task.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) < 7
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {task.is_completed ? '완료' : formatDate(task.due_date)}
                            </div>
                          )}
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <svg className="w-5 h-5 text-text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className={`text-body-2 mb-4 ${
                          task.is_completed ? 'text-text-light' : 'text-text-gray'
                        }`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-text-light">
                        {task.priority && (
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 주간 캘린더 뷰 */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div>
                {/* 주간 네비게이션 */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateWeek('prev')}
                    className="p-2 hover:bg-bg-light rounded-lg transition-all"
                  >
                    <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-title-1 font-bold text-text-dark">
                    {currentWeek.getFullYear()}년 {currentWeek.getMonth() + 1}월
                  </h2>
                  <button
                    onClick={() => navigateWeek('next')}
                    className="p-2 hover:bg-bg-light rounded-lg transition-all"
                  >
                    <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* 주간 그리드 */}
                <div className="grid grid-cols-7 gap-3">
                  {getWeekDays().map((day, idx) => {
                    const dayTasks = getTasksForDay(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={idx}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDraggedDate(day);
                        }}
                        className={`border-2 rounded-2xl p-4 min-h-[200px] transition-all ${
                          isToday ? 'border-primary bg-blue-50' : 
                          draggedDate?.toDateString() === day.toDateString() 
                            ? 'border-secondary bg-green-50' 
                            : 'border-border-color bg-white'
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="text-sm text-text-gray mb-1">
                            {['일', '월', '화', '수', '목', '금', '토'][idx]}
                          </div>
                          <div className={`text-2xl font-bold ${
                            isToday ? 'text-primary' : 'text-text-dark'
                          }`}>
                            {day.getDate()}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {dayTasks.map((task) => (
                            <DraggableTask
                              key={task.id}
                              task={task}
                              onEdit={() => openEditModal(task)}
                              onToggle={() => toggleTask(task.id, task.is_completed)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </DndContext>
          )}
        </div>

        {/* 태스크 수정 모달 */}
        {showEditModal && editingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-title-1 font-bold mb-6 text-text-dark">태스크 수정</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">제목</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">설명</label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="form-control min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">마감일</label>
                  <input
                    type="date"
                    value={editingTask.due_date || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">우선순위</label>
                  <select
                    value={editingTask.priority || 'medium'}
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="form-control"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={saveTaskEdit}
                  className="btn btn-primary flex-1"
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                  }}
                  className="btn btn-outline flex-1"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 일정 추가 모달 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-title-1 font-bold mb-6 text-text-dark">새 일정 추가</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">제목 *</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="form-control"
                    placeholder="할 일을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">설명</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="form-control min-h-[100px]"
                    placeholder="상세 내용을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">마감일</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-dark mb-2">우선순위</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="form-control"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={addNewTask}
                  className="btn btn-primary flex-1"
                >
                  추가
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTask({
                      title: '',
                      description: '',
                      due_date: '',
                      priority: 'medium',
                    });
                  }}
                  className="btn btn-outline flex-1"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
