'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet } from '@/lib/api';
import { DashboardData } from '@/types/api';
import { storage, STORAGE_KEYS } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailedScores, setShowDetailedScores] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [animateGauges, setAnimateGauges] = useState(false);

  useEffect(() => {
    if (!getUserId()) {
      router.push('/login');
      return;
    }

    loadDashboard();
  }, [router]);

  const loadDashboard = async () => {
    try {
      const dashboardData = await apiGet<DashboardData>('/specs/dashboard');
      setData(dashboardData);
      // 데이터 로드 후 애니메이션 트리거
      setAnimateGauges(false);
      setTimeout(() => setAnimateGauges(true), 100);
    } catch (error: any) {
      console.error('대시보드 로드 실패:', error);
      alert('대시보드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 8) return { label: '우수', color: 'bg-green-100 text-green-700' };
    if (score >= 6) return { label: '양호', color: 'bg-blue-100 text-blue-700' };
    if (score >= 4) return { label: '보통', color: 'bg-yellow-100 text-yellow-700' };
    return { label: '부족', color: 'bg-gray-100 text-gray-700' };
  };

  // 각 섹션별 저장 함수
  const handleSaveEducation = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/specs/education', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 학력 정보가 저장되었습니다!');
        setEditingSection(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 저장 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 저장 오류: ' + e);
    }
  };

  const handleSaveLanguage = async () => {
    try {
      if (!editingItemId) {
        alert('❌ 수정할 항목 ID가 없습니다');
        return;
      }
      const res = await fetch(`http://127.0.0.1:8000/specs/languages/${editingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 어학능력 정보가 저장되었습니다!');
        setEditingSection(null);
        setEditingItemId(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 저장 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 저장 오류: ' + e);
    }
  };

  const handleSaveCertificate = async () => {
    try {
      if (!editingItemId) {
        alert('❌ 수정할 항목 ID가 없습니다');
        return;
      }
      const res = await fetch(`http://127.0.0.1:8000/specs/certificates/${editingItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 자격증 정보가 저장되었습니다!');
        setEditingSection(null);
        setEditingItemId(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 저장 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 저장 오류: ' + e);
    }
  };

  const handleSaveProject = async () => {
    try {
      const projects = editFormData.projects || [];
      
      // 각 프로젝트를 개별적으로 업데이트
      for (const proj of projects) {
        if (!proj.id) continue;
        
        const res = await fetch(`http://127.0.0.1:8000/specs/projects/${proj.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': getUserId() || ''
          },
          body: JSON.stringify({
            project_name: proj.project_name,
            period: proj.period,
            role: proj.role,
            description: proj.description,
            tech_stack: proj.tech_stack
          })
        });
        
        if (!res.ok) {
          const error = await res.json();
          alert('❌ 저장 오류: ' + (error.detail?.error || '알 수 없는 오류'));
          return;
        }
      }
      
      alert('✅ 프로젝트 정보가 저장되었습니다!');
      setEditingSection(null);
      loadDashboard();
    } catch (e) {
      alert('❌ 저장 오류: ' + e);
    }
  };

  const handleSaveActivity = async () => {
    try {
      const activities = editFormData.activities || [];
      
      // 각 활동을 개별적으로 업데이트
      for (const act of activities) {
        if (!act.id) continue;
        
        const res = await fetch(`http://127.0.0.1:8000/specs/activities/${act.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': getUserId() || ''
          },
          body: JSON.stringify({
            activity_name: act.activity_name,
            activity_type: act.activity_type,
            period: act.period,
            description: act.description
          })
        });
        
        if (!res.ok) {
          const error = await res.json();
          alert('❌ 저장 오류: ' + (error.detail?.error || '알 수 없는 오류'));
          return;
        }
      }
      
      alert('✅ 대외활동 정보가 저장되었습니다!');
      setEditingSection(null);
      loadDashboard();
    } catch (e) {
      alert('❌ 저장 오류: ' + e);
    }
  };

  // 추가 핸들러
  const handleAddLanguage = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/specs/languages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 어학능력이 추가되었습니다!');
        setIsAddingNew(false);
        setEditingSection(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 추가 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 추가 오류: ' + e);
    }
  };

  const handleAddCertificate = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/specs/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 자격증이 추가되었습니다!');
        setIsAddingNew(false);
        setEditingSection(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 추가 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 추가 오류: ' + e);
    }
  };

  const handleAddProject = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/specs/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 프로젝트가 추가되었습니다!');
        setIsAddingNew(false);
        setEditingSection(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 추가 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 추가 오류: ' + e);
    }
  };

  const handleAddActivity = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/specs/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId() || ''
        },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        alert('✅ 대외활동이 추가되었습니다!');
        setIsAddingNew(false);
        setEditingSection(null);
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 추가 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 추가 오류: ' + e);
    }
  };

  // 삭제 핸들러
  const handleDeleteLanguage = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/specs/languages/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': getUserId() || ''
        }
      });
      if (res.ok) {
        alert('✅ 삭제되었습니다!');
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 삭제 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 삭제 오류: ' + e);
    }
  };

  const handleDeleteCertificate = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/specs/certificates/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': getUserId() || ''
        }
      });
      if (res.ok) {
        alert('✅ 삭제되었습니다!');
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 삭제 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 삭제 오류: ' + e);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/specs/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': getUserId() || ''
        }
      });
      if (res.ok) {
        alert('✅ 삭제되었습니다!');
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 삭제 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 삭제 오류: ' + e);
    }
  };

  const handleDeleteActivity = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/specs/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': getUserId() || ''
        }
      });
      if (res.ok) {
        alert('✅ 삭제되었습니다!');
        loadDashboard();
      } else {
        const error = await res.json();
        alert('❌ 삭제 오류: ' + (error.detail?.error || '알 수 없는 오류'));
      }
    } catch (e) {
      alert('❌ 삭제 오류: ' + e);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-body-1 text-text-gray">로딩 중...</div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-headline mb-4 text-text-dark">스펙 데이터가 없습니다</div>
            <button onClick={() => router.push('/onboarding')} className="btn btn-primary">
              온보딩 시작하기
            </button>
          </div>
        </div>
      </>
    );
  }

  // radar_scores가 없을 경우 기본값 사용
  const radarScores = data.radar_scores || {
    education: 0,
    certificate: 0,
    language: 0,
    project: 0,
    activity: 0
  };

  const categories = [
    { name: '전공', score: radarScores.education || 0, key: 'education', color: 'from-blue-500 to-blue-600' },
    { name: '자격증', score: radarScores.certificate || 0, key: 'certificate', color: 'from-purple-500 to-purple-600' },
    { name: '어학', score: radarScores.language || 0, key: 'language', color: 'from-green-500 to-green-600' },
    { name: '공모전', score: 5.5, key: 'contest', color: 'from-yellow-500 to-yellow-600' }, // 임시 데이터
    { name: '프로젝트', score: radarScores.project || 0, key: 'project', color: 'from-red-500 to-red-600' },
    { name: '대외활동', score: radarScores.activity || 0, key: 'activity', color: 'from-pink-500 to-pink-600' },
  ];

  // 6각형용 (대외활동 제외 - 처음 6개만)
  const hexagonCategories = categories.slice(0, 6);

  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const avgScore = totalScore / categories.length;

  // 6각형 레이더 차트 포인트 계산
  const getRadarPoints = () => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 180;
    
    return hexagonCategories.map((cat, index) => {
      const angle = (Math.PI * 2 * index) / hexagonCategories.length - Math.PI / 2;
      const radius = (cat.score / 10) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, angle, cat };
    });
  };

  const radarPoints = getRadarPoints();
  const radarPathData = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  
  // 배경 육각형들 (10, 8, 6, 4, 2점 레벨)
  const getBackgroundHexagon = (level: number) => {
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 180;
    const radius = (level / 10) * maxRadius;
    
    return hexagonCategories.map((cat, index) => {
      const angle = (Math.PI * 2 * index) / hexagonCategories.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y };
    }).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="border-b border-border-color">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <h1 className="text-3xl mb-2 text-text-dark font-bold">스펙체크</h1>
            <p className="text-sm text-text-gray">
              현재 보유한 역량을 확인하고 강점을 파악하세요
            </p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* 전체 요약 - 6각형 레이더 차트 또는 6개 원형 그래프 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
            {!showDetailedScores ? (
              // 6각형 레이더 차트 뷰
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    나의 역량 분석
                  </h2>
                  <p className="text-sm text-gray-600">
                    6개 핵심 분야의 역량을 한눈에 확인하세요
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* 레이더 차트 */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <svg width="380" height="380" viewBox="0 0 400 400" className="drop-shadow-lg">
                        {/* 배경 육각형들 */}
                        {[10, 8, 6, 4, 2].map((level) => (
                          <path
                            key={level}
                            d={getBackgroundHexagon(level)}
                            fill="none"
                            stroke="#9ca3af"
                            strokeWidth="2"
                            opacity={level === 10 ? 0.8 : 0.6}
                          />
                        ))}
                        
                        {/* 축선 */}
                        {radarPoints.map((point, index) => (
                          <line
                            key={index}
                            x1="200"
                            y1="200"
                            x2={200 + 180 * Math.cos(point.angle)}
                            y2={200 + 180 * Math.sin(point.angle)}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            strokeDasharray="4,4"
                          />
                        ))}

                        {/* 실제 데이터 영역 */}
                        <path
                          d={radarPathData}
                          fill="#3b82f6"
                          fillOpacity="0.2"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeLinejoin="round"
                        />

                        {/* 데이터 포인트 */}
                        {radarPoints.map((point, index) => (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="7"
                              fill="white"
                              stroke="#3b82f6"
                              strokeWidth="3"
                            />
                          </g>
                        ))}
                      </svg>

                      {/* 라벨 */}
                      <div className="absolute inset-0">
                        {radarPoints.map((point, index) => {
                          const labelRadius = 210;
                          const labelX = 200 + labelRadius * Math.cos(point.angle);
                          const labelY = 200 + labelRadius * Math.sin(point.angle);
                          
                          return (
                            <div
                              key={index}
                              className="absolute transform -translate-x-1/2 -translate-y-1/2"
                              style={{
                                left: `${labelX}px`,
                                top: `${labelY}px`,
                              }}
                            >
                              <div className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-300">
                                <div className="text-sm font-bold text-text-dark text-center whitespace-nowrap">
                                  {point.cat.name}
                                </div>
                                <div className="text-xs text-primary text-center font-semibold">
                                  {point.cat.score.toFixed(1)}점
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 점수 리스트 */}
                  <div className="space-y-3">
                    {hexagonCategories.map((cat) => {
                      const percentage = (cat.score / 10) * 100;
                      const level = getScoreLevel(cat.score);
                      
                      return (
                        <div key={cat.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-sm transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-base font-bold text-gray-900">{cat.name}</h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                                {level.label}
                              </span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">
                              {cat.score.toFixed(1)}
                            </div>
                          </div>
                          {/* 10칸 블록 표시: 점수(0~10)에 따라 칸이 채워집니다 */}
                          <div className="mt-2">
                            {(() => {
                              const filledCount = Math.round(cat.score); // 소수는 반올림하여 칸 수 결정
                              const displayCount = animateGauges ? filledCount : 0;
                              const colorClass = cat.key === 'education' ? 'bg-blue-500' :
                                cat.key === 'certificate' ? 'bg-purple-500' :
                                cat.key === 'language' ? 'bg-green-500' :
                                cat.key === 'contest' ? 'bg-yellow-500' :
                                cat.key === 'project' ? 'bg-red-500' : 'bg-pink-500';

                              return (
                                <div className="flex items-center">
                                  <div className="flex gap-2 w-full">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                      <div
                                        key={i}
                                        className={`flex-1 h-3 ${i < displayCount ? colorClass : 'bg-gray-200'} rounded-md transition-colors`}
                                        aria-hidden
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}

                    {/* 평균 점수 */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200 mt-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">평균 점수</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {(hexagonCategories.reduce((sum, cat) => sum + cat.score, 0) / hexagonCategories.length).toFixed(1)}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600">/ 10점</div>
                      </div>
                    </div>

                    {/* 자세히 보기 버튼 */}
                    <button
                      onClick={() => {
                        setShowDetailedScores(true);
                        // 상세 보기로 전환 시 애니메이션 리셋 후 재시작
                        setAnimateGauges(false);
                        setTimeout(() => setAnimateGauges(true), 100);
                      }}
                      className="w-full mt-5 bg-white text-blue-600 font-bold py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      6개 분야 상세 점수 보기
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // 6개 원형 그래프 상세 뷰
              <>
                <div className="text-center mb-8">
                  <button
                    onClick={() => {
                      setShowDetailedScores(false);
                      // 레이더 차트로 돌아갈 때 애니메이션 리셋 후 재시작
                      setAnimateGauges(false);
                      setTimeout(() => setAnimateGauges(true), 100);
                    }}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark mb-3 font-semibold text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    레이더 차트로 돌아가기
                  </button>
                  <h2 className="text-2xl font-bold text-text-dark mb-2">
                    역량 체크
                  </h2>
                  <p className="text-sm text-text-gray">
                    6개 분야별로 나의 스펙을 확인하고 부족한 부분을 채워나가세요
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {categories.slice(0, 3).map((spec, index) => {
                    const percentage = (spec.score / 10) * 100;
                    const circumference = 2 * Math.PI * 90;
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                      <div
                        key={spec.key}
                        className="group relative bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-500"
                      >
                        {/* 원형 그래프 */}
                        <div className="relative w-40 h-40 mx-auto mb-5">
                          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                            {/* 배경 원 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="90"
                              stroke="#e5e7eb"
                              strokeWidth="12"
                              fill="none"
                            />
                            {/* 진행률 원 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="90"
                              stroke={`url(#gradient-${index})`}
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={circumference}
                              strokeDashoffset={animateGauges ? strokeDashoffset : circumference}
                              strokeLinecap="round"
                              className="transition-all duration-[2500ms] ease-out"
                            />
                            {/* 그라디언트 정의 */}
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={spec.color.includes('blue') ? '#3b82f6' : 
                                                             spec.color.includes('purple') ? '#a855f7' :
                                                             spec.color.includes('green') ? '#22c55e' :
                                                             spec.color.includes('yellow') ? '#eab308' :
                                                             spec.color.includes('red') ? '#ef4444' :
                                                             spec.color.includes('pink') ? '#ec4899' : '#6366f1'} />
                                <stop offset="100%" stopColor={spec.color.includes('blue') ? '#2563eb' : 
                                                               spec.color.includes('purple') ? '#9333ea' :
                                                               spec.color.includes('green') ? '#16a34a' :
                                                               spec.color.includes('yellow') ? '#ca8a04' :
                                                               spec.color.includes('red') ? '#dc2626' :
                                                               spec.color.includes('pink') ? '#db2777' : '#4f46e5'} />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* 중앙 텍스트 */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={`text-4xl font-bold bg-gradient-to-r ${spec.color} bg-clip-text text-transparent mb-0.5`}>
                              {spec.score.toFixed(1)}
                            </div>
                            <div className="text-xs text-text-gray font-semibold">/ 10점</div>
                          </div>
                        </div>

                        {/* 카테고리 이름 */}
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-text-dark mb-1.5 group-hover:text-primary transition-colors">
                            {spec.name}
                          </h3>
                          
                          {/* 점수 설명 */}
                          <div className="flex items-center justify-center gap-1.5 mb-3">
                            {spec.score >= 8 ? (
                              <>
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-green-600 font-semibold">우수</span>
                              </>
                            ) : spec.score >= 6 ? (
                              <>
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-blue-600 font-semibold">보통</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-orange-600 font-semibold">개선 필요</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 호버 시 디테일 정보 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold mb-2">{spec.name}</div>
                            <div className="text-xs text-gray-300 mb-3">
                              현재 {spec.score.toFixed(1)}점 / 10점 만점
                            </div>
                            <button 
                              onClick={() => router.push('/onboarding')}
                              className="bg-white text-primary px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                            >
                              상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 두 번째 줄: 나머지 4개 (3개 기본 + 1개는 평균) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {categories.slice(3).map((spec, index) => {
                    const percentage = (spec.score / 10) * 100;
                    const circumference = 2 * Math.PI * 90;
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                      <div
                        key={spec.key}
                        className="group relative bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-500"
                      >
                        {/* 원형 그래프 */}
                        <div className="relative w-40 h-40 mx-auto mb-5">
                          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 200 200">
                            {/* 배경 원 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="90"
                              stroke="#e5e7eb"
                              strokeWidth="12"
                              fill="none"
                            />
                            {/* 진행률 원 */}
                            <circle
                              cx="100"
                              cy="100"
                              r="90"
                              stroke={`url(#gradient-${index + 3})`}
                              strokeWidth="12"
                              fill="none"
                              strokeDasharray={circumference}
                              strokeDashoffset={animateGauges ? strokeDashoffset : circumference}
                              strokeLinecap="round"
                              className="transition-all duration-[2500ms] ease-out"
                            />
                            {/* 그라디언트 정의 */}
                            <defs>
                              <linearGradient id={`gradient-${index + 3}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={spec.color.includes('blue') ? '#3b82f6' : 
                                                             spec.color.includes('purple') ? '#a855f7' :
                                                             spec.color.includes('green') ? '#22c55e' :
                                                             spec.color.includes('yellow') ? '#eab308' :
                                                             spec.color.includes('red') ? '#ef4444' :
                                                             spec.color.includes('pink') ? '#ec4899' : '#6366f1'} />
                                <stop offset="100%" stopColor={spec.color.includes('blue') ? '#2563eb' : 
                                                               spec.color.includes('purple') ? '#9333ea' :
                                                               spec.color.includes('green') ? '#16a34a' :
                                                               spec.color.includes('yellow') ? '#ca8a04' :
                                                               spec.color.includes('red') ? '#dc2626' :
                                                               spec.color.includes('pink') ? '#db2777' : '#4f46e5'} />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          {/* 중앙 텍스트 */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={`text-4xl font-bold bg-gradient-to-r ${spec.color} bg-clip-text text-transparent mb-0.5`}>
                              {spec.score.toFixed(1)}
                            </div>
                            <div className="text-xs text-text-gray font-semibold">/ 10점</div>
                          </div>
                        </div>

                        {/* 카테고리 이름 */}
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-text-dark mb-1.5 group-hover:text-primary transition-colors">
                            {spec.name}
                          </h3>
                          
                          {/* 점수 설명 */}
                          <div className="flex items-center justify-center gap-1.5 mb-3">
                            {spec.score >= 8 ? (
                              <>
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-green-600 font-semibold">우수</span>
                              </>
                            ) : spec.score >= 6 ? (
                              <>
                                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-blue-600 font-semibold">보통</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-orange-600 font-semibold">개선 필요</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* 호버 시 디테일 정보 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/90 to-black/80 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-5">
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold mb-2">{spec.name}</div>
                            <div className="text-xs text-gray-300 mb-3">
                              현재 {spec.score.toFixed(1)}점 / 10점 만점
                            </div>
                            <button 
                              onClick={() => router.push('/onboarding')}
                              className="bg-white text-primary px-5 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                            >
                              상세보기
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 전체 평균 점수 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        종합 평균 점수
                      </h3>
                      <p className="text-xs text-gray-600">
                        6개 분야의 평균 점수입니다
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600 mb-0.5">
                        {avgScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600 font-semibold">/ 10점</div>
                    </div>
                  </div>
                  
                  {/* 전체 진행률 */}
                  <div className="mt-5">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-[2500ms] ease-out"
                        style={{ width: animateGauges ? `${(avgScore / 10) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 세부 정보 */}
          {/* 깔끔한 스펙 카드 - 세로 일렬 배치 */}
          <div className="space-y-3">
            {/* 학력 카드 */}
            {data.education && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-all">
                <div 
                  onClick={() => {
                    if (expandedSection === 'education') {
                      setExpandedSection(null);
                      setEditingSection(null);
                    } else {
                      setExpandedSection('education');
                      setEditingSection(null);
                      setEditFormData({
                        school: data.education?.school || '',
                        major: data.education?.major || '',
                        gpa: data.education?.gpa || '',
                        graduation_status: data.education?.graduation_status || 'current'
                      });
                    }
                  }}
                  className="cursor-pointer"
                >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">학력</h3>
                    <span className="text-xs text-gray-500">{data.education.school}</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'education' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                </div>

                {expandedSection === 'education' && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {editingSection === 'education' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-700">학교</label>
                          <input
                            type="text"
                            value={editFormData.school}
                            onChange={(e) => setEditFormData({...editFormData, school: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">전공</label>
                          <input
                            type="text"
                            value={editFormData.major}
                            onChange={(e) => setEditFormData({...editFormData, major: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">학점</label>
                          <input
                            type="text"
                            value={editFormData.gpa}
                            onChange={(e) => setEditFormData({...editFormData, gpa: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">상태</label>
                          <select
                            value={editFormData.graduation_status}
                            onChange={(e) => setEditFormData({...editFormData, graduation_status: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="current">재학중</option>
                            <option value="expected">졸업예정</option>
                            <option value="graduated">졸업</option>
                          </select>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEducation();
                            }}
                            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-700 transition-all"
                          >
                            저장
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSection(null);
                            }}
                            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 font-semibold">학교</span>
                          <span className="text-gray-900">{data.education.school}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t border-gray-100">
                          <span className="text-gray-600 font-semibold">전공</span>
                          <span className="text-gray-900">{data.education.major}</span>
                        </div>
                        {data.education.gpa && (
                          <div className="flex justify-between py-2 border-t border-gray-100">
                            <span className="text-gray-600 font-semibold">학점</span>
                            <span className="text-gray-900">{data.education.gpa}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 border-t border-gray-100">
                          <span className="text-gray-600 font-semibold">상태</span>
                          <span className="text-gray-900">
                            {data.education.graduation_status === 'graduated' ? '졸업' : 
                             data.education.graduation_status === 'expected' ? '졸업예정' : '재학중'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSection('education');
                          }}
                          className="w-full mt-4 bg-blue-100 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          수정하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 어학 카드 */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-all">
                <div
                  onClick={() => {
                    if (expandedSection === 'language') {
                      setExpandedSection(null);
                      setEditingSection(null);
                      setEditingItemId(null);
                    } else {
                      setExpandedSection('language');
                      setEditingSection(null);
                      setEditingItemId(null);
                    }
                  }}
                  className="cursor-pointer"
                >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">어학능력</h3>
                    <span className="text-xs text-gray-500">{data.languages?.length || 0}개</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'language' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                </div>

                {expandedSection === 'language' && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {/* 기존 어학능력 목록 먼저 표시 */}
                    <div className="space-y-3">
                      {data.languages?.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">등록된 어학능력이 없습니다</p>
                      ) : (
                        data.languages?.map((lang) => (
                          <div key={lang.id}>
                            {editingItemId === lang.id && editingSection === 'language' ? (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                                <h4 className="font-semibold text-gray-900 mb-2">어학능력 수정</h4>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">언어</label>
                                  <input
                                    type="text"
                                    value={editFormData.language_type || ''}
                                    onChange={(e) => setEditFormData({...editFormData, language_type: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    placeholder="예: TOEIC, TOEFL, OPIC 등"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">점수</label>
                                  <input
                                    type="text"
                                    value={editFormData.score || ''}
                                    onChange={(e) => setEditFormData({...editFormData, score: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                    placeholder="점수 또는 등급"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-semibold text-gray-700">취득일</label>
                                  <input
                                    type="date"
                                    value={editFormData.acquisition_date || ''}
                                    onChange={(e) => setEditFormData({...editFormData, acquisition_date: e.target.value})}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                  />
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSaveLanguage();
                                    }}
                                    className="flex-1 bg-gray-900 text-white font-medium py-2 px-3 rounded hover:bg-gray-800 transition-all"
                                  >
                                    저장
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingItemId(null);
                                      setEditingSection(null);
                                    }}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded hover:bg-gray-50 transition-all"
                                  >
                                    취소
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{lang.language_type}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{lang.score}</p>
                                    {lang.acquisition_date && (
                                      <p className="text-xs text-gray-500 mt-1">취득일: {lang.acquisition_date}</p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingItemId(lang.id);
                                      setEditingSection('language');
                                      setEditFormData({
                                        language_type: lang.language_type,
                                        score: lang.score,
                                        acquisition_date: lang.acquisition_date || ''
                                      });
                                    }}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-1.5 text-sm rounded hover:bg-gray-50 transition-all"
                                  >
                                    수정
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteLanguage(lang.id);
                                    }}
                                    className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-1.5 text-sm rounded hover:bg-gray-50 transition-all"
                                  >
                                    삭제
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* 추가 버튼을 기존 항목 아래에 배치 */}
                    {isAddingNew && editingSection === 'language' ? (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">새 어학능력 추가</h4>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">언어</label>
                          <input
                            type="text"
                            value={editFormData.language_type || ''}
                            onChange={(e) => setEditFormData({...editFormData, language_type: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="예: TOEIC, TOEFL, OPIC 등"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">점수</label>
                          <input
                            type="text"
                            value={editFormData.score || ''}
                            onChange={(e) => setEditFormData({...editFormData, score: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                            placeholder="점수 또는 등급"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">취득일</label>
                          <input
                            type="date"
                            value={editFormData.acquisition_date || ''}
                            onChange={(e) => setEditFormData({...editFormData, acquisition_date: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddLanguage();
                            }}
                            className="flex-1 bg-gray-900 text-white font-medium py-2 px-3 rounded hover:bg-gray-800 transition-all"
                          >
                            추가
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAddingNew(false);
                              setEditingSection(null);
                            }}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded hover:bg-gray-50 transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingNew(true);
                          setEditingSection('language');
                          setEditingItemId(null);
                          setEditFormData({ language_type: '', score: '', acquisition_date: '' });
                        }}
                        className="w-full bg-white border-2 border-gray-400 text-gray-700 font-medium py-2 rounded hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        새 어학능력 추가
                      </button>
                    )}
                  </div>
                )}
              </div>

            {/* 자격증 카드 */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-all">
                <div
                  onClick={() => {
                    if (expandedSection === 'certificate') {
                      setExpandedSection(null);
                      setEditingSection(null);
                      setEditingItemId(null);
                    } else {
                      setExpandedSection('certificate');
                      setEditingSection(null);
                      setEditingItemId(null);
                    }
                  }}
                  className="cursor-pointer"
                >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">자격증</h3>
                    <span className="text-xs text-gray-500">{data.certificates?.length || 0}개</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'certificate' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                </div>

                {expandedSection === 'certificate' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {/* 기존 자격증 목록 먼저 표시 */}
                    <div className="space-y-2">
                      {data.certificates && data.certificates.length > 0 ? (
                        data.certificates.map((cert) => (
                        <div key={cert.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          {editingSection === 'certificate' && editingItemId === cert.id && !isAddingNew ? (
                            // 수정 모드
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm font-semibold text-gray-700">자격증명</label>
                                <input
                                  type="text"
                                  value={editFormData.certificate_name || ''}
                                  onChange={(e) => setEditFormData({...editFormData, certificate_name: e.target.value})}
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-semibold text-gray-700">취득일</label>
                                <input
                                  type="text"
                                  value={editFormData.acquisition_date || ''}
                                  onChange={(e) => setEditFormData({...editFormData, acquisition_date: e.target.value})}
                                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                                  placeholder="YYYY-MM-DD"
                                />
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveCertificate();
                                  }}
                                  className="flex-1 bg-gray-900 text-white font-medium py-2 px-3 rounded hover:bg-gray-800 transition-all"
                                >
                                  저장
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSection(null);
                                    setEditingItemId(null);
                                  }}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded hover:bg-gray-50 transition-all"
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          ) : (
                            // 보기 모드
                            <div>
                              <div className="mb-2">
                                <span className="text-gray-900 font-semibold">{cert.certificate_name}</span>
                                {cert.acquisition_date && (
                                  <div className="text-xs text-gray-500 mt-1">{cert.acquisition_date}</div>
                                )}
                              </div>
                              <div className="flex gap-2 mt-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingSection('certificate');
                                    setEditingItemId(cert.id);
                                    setIsAddingNew(false);
                                    setEditFormData({
                                      certificate_name: cert.certificate_name,
                                      acquisition_date: cert.acquisition_date || ''
                                    });
                                  }}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-1.5 text-sm rounded hover:bg-gray-50 transition-all"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCertificate(cert.id);
                                  }}
                                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-1.5 text-sm rounded hover:bg-gray-50 transition-all"
                                >
                                  삭제
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">등록된 자격증이 없습니다</p>
                      )}
                    </div>

                    {/* 추가 버튼을 기존 항목 아래에 배치 */}
                    {isAddingNew && editingSection === 'certificate' ? (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                        <h4 className="font-semibold text-gray-900 mb-2">새 자격증 추가</h4>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">자격증명</label>
                          <input
                            type="text"
                            value={editFormData.certificate_name || ''}
                            onChange={(e) => setEditFormData({...editFormData, certificate_name: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            placeholder="예: 정보처리기사, SQLD 등"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">취득일</label>
                          <input
                            type="date"
                            value={editFormData.acquisition_date || ''}
                            onChange={(e) => setEditFormData({...editFormData, acquisition_date: e.target.value})}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddCertificate();
                            }}
                            className="flex-1 bg-gray-900 text-white font-medium py-2 px-3 rounded hover:bg-gray-800 transition-all"
                          >
                            추가
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAddingNew(false);
                              setEditingSection(null);
                            }}
                            className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2 px-3 rounded hover:bg-gray-50 transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddingNew(true);
                          setEditingSection('certificate');
                          setEditingItemId(null);
                          setEditFormData({ certificate_name: '', acquisition_date: '' });
                        }}
                        className="w-full bg-white border-2 border-gray-400 text-gray-700 font-medium py-2 rounded hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        새 자격증 추가
                      </button>
                    )}
                  </div>
                )}
              </div>

            {/* 프로젝트 카드 */}
            {data.projects && data.projects.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-all">
                <div
                onClick={() => {
                  if (expandedSection === 'project') {
                    setExpandedSection(null);
                    setEditingSection(null);
                    setEditingItemId(null);
                  } else {
                    setExpandedSection('project');
                    setEditingSection(null);
                    setEditingItemId(null);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">프로젝트 경험</h3>
                    <span className="text-xs text-gray-500">{data.projects.length}개</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'project' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                </div>

                {expandedSection === 'project' && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {editingSection === 'project' ? (
                      <div className="space-y-3">
                        {editFormData.projects?.map((proj: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">프로젝트명</label>
                              <input
                                type="text"
                                value={proj.project_name}
                                onChange={(e) => {
                                  const updated = [...(editFormData.projects || [])];
                                  updated[idx].project_name = e.target.value;
                                  setEditFormData({...editFormData, projects: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">기간</label>
                              <input
                                type="text"
                                value={proj.period || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.projects || [])];
                                  updated[idx].period = e.target.value;
                                  setEditFormData({...editFormData, projects: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">역할</label>
                              <input
                                type="text"
                                value={proj.role || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.projects || [])];
                                  updated[idx].role = e.target.value;
                                  setEditFormData({...editFormData, projects: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">설명</label>
                              <textarea
                                value={proj.description || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.projects || [])];
                                  updated[idx].description = e.target.value;
                                  setEditFormData({...editFormData, projects: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">기술스택</label>
                              <input
                                type="text"
                                value={proj.tech_stack || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.projects || [])];
                                  updated[idx].tech_stack = e.target.value;
                                  setEditFormData({...editFormData, projects: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                placeholder="쉼표로 구분"
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleSaveProject}
                            className="flex-1 bg-red-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-700 transition-all"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.projects && data.projects.map((proj) => (
                          <div key={proj.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm text-gray-900">{proj.project_name}</h4>
                              {proj.period && (
                                <span className="text-xs text-gray-500">{proj.period}</span>
                              )}
                            </div>
                            {proj.role && (
                              <div className="text-xs text-gray-600 mb-1">{proj.role}</div>
                            )}
                            {proj.description && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{proj.description}</p>
                            )}
                            {proj.tech_stack && (
                              <div className="flex flex-wrap gap-1">
                                {proj.tech_stack.split(',').slice(0, 4).map((tech, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-gray-200 rounded text-xs text-gray-700">
                                    {tech.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setEditingSection('project');
                            setEditFormData({
                              projects: (data.projects || []).map(proj => ({
                                id: proj.id,
                                project_name: proj.project_name,
                                period: proj.period || '',
                                role: proj.role || '',
                                description: proj.description || '',
                                tech_stack: proj.tech_stack || ''
                              }))
                            });
                          }}
                          className="w-full mt-4 bg-red-100 text-red-700 font-semibold py-2 rounded-lg hover:bg-red-200 transition-all"
                        >
                          수정하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 대외활동 카드 */}
            {data.activities && data.activities.length > 0 && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 hover:shadow-md transition-all">
                <div
                onClick={() => {
                  if (expandedSection === 'activity') {
                    setExpandedSection(null);
                    setEditingSection(null);
                    setEditingItemId(null);
                  } else {
                    setExpandedSection('activity');
                    setEditingSection(null);
                    setEditingItemId(null);
                  }
                }}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900">대외활동</h3>
                    <span className="text-xs text-gray-500">{data.activities.length}개</span>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'activity' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                </div>

                {expandedSection === 'activity' && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-4 border-t border-gray-200 space-y-3"
                  >
                    {editingSection === 'activity' ? (
                      <div className="space-y-3">
                        {editFormData.activities?.map((act: any, idx: number) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">활동명</label>
                              <input
                                type="text"
                                value={act.activity_name}
                                onChange={(e) => {
                                  const updated = [...(editFormData.activities || [])];
                                  updated[idx].activity_name = e.target.value;
                                  setEditFormData({...editFormData, activities: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">활동유형</label>
                              <input
                                type="text"
                                value={act.activity_type || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.activities || [])];
                                  updated[idx].activity_type = e.target.value;
                                  setEditFormData({...editFormData, activities: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">기간</label>
                              <input
                                type="text"
                                value={act.period || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.activities || [])];
                                  updated[idx].period = e.target.value;
                                  setEditFormData({...editFormData, activities: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">설명</label>
                              <textarea
                                value={act.description || ''}
                                onChange={(e) => {
                                  const updated = [...(editFormData.activities || [])];
                                  updated[idx].description = e.target.value;
                                  setEditFormData({...editFormData, activities: updated});
                                }}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={handleSaveActivity}
                            className="flex-1 bg-pink-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-pink-700 transition-all"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingSection(null)}
                            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-lg hover:bg-gray-300 transition-all"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {data.activities && data.activities.map((act) => (
                          <div key={act.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-sm text-gray-900">{act.activity_name}</h4>
                              {act.period && (
                                <span className="text-xs text-gray-500">{act.period}</span>
                              )}
                            </div>
                            {act.activity_type && (
                              <div className="text-xs text-gray-600 mb-1">{act.activity_type}</div>
                            )}
                            {act.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">{act.description}</p>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            setEditingSection('activity');
                            setEditFormData({
                              activities: (data.activities || []).map(act => ({
                                id: act.id,
                                activity_name: act.activity_name,
                                activity_type: act.activity_type || '',
                                period: act.period || '',
                                description: act.description || ''
                              }))
                            });
                          }}
                          className="w-full mt-4 bg-pink-100 text-pink-700 font-semibold py-2 rounded-lg hover:bg-pink-200 transition-all"
                        >
                          수정하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-12 text-center bg-gradient-to-br from-blue-50 to-white rounded-2xl p-12 border border-blue-100">
            <h3 className="text-title-1 font-bold mb-4 text-text-dark">
              이제 목표를 설정해보세요
            </h3>
            <p className="mb-8 text-body-1 text-text-gray">
              실제 채용 공고를 기반으로 당신만의 로드맵을 만들어보세요
            </p>
            <button
              onClick={() => router.push('/goal-setting')}
              className="btn btn-primary"
            >
              목표 설정하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
