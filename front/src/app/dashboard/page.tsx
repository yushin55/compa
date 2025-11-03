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
  const [editMode, setEditMode] = useState<string | null>(null);
  const [showDetailedScores, setShowDetailedScores] = useState(false);

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

  const categories = [
    { name: '전공', score: data.radar_scores.education, key: 'education', color: 'from-blue-500 to-blue-600' },
    { name: '자격증', score: data.radar_scores.certificate, key: 'certificate', color: 'from-purple-500 to-purple-600' },
    { name: '어학', score: data.radar_scores.language, key: 'language', color: 'from-green-500 to-green-600' },
    { name: '공모전', score: 5.5, key: 'contest', color: 'from-yellow-500 to-yellow-600' }, // 임시 데이터
    { name: '프로젝트', score: data.radar_scores.project, key: 'project', color: 'from-red-500 to-red-600' },
    { name: '대외활동', score: data.radar_scores.activity, key: 'activity', color: 'from-pink-500 to-pink-600' },
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
          {/* 전체 요약 - 6각형 레이더 차트 또는 7개 원형 그래프 */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
            {!showDetailedScores ? (
              // 6각형 레이더 차트 뷰
              <>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-text-dark mb-2">
                    나의 역량 분석
                  </h2>
                  <p className="text-sm text-text-gray">
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
                          fill="url(#radarGradient)"
                          fillOpacity="0.5"
                          stroke="#60a5fa"
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
                              stroke="#1e40af"
                              strokeWidth="3"
                            />
                          </g>
                        ))}

                        {/* 그라디언트 정의 */}
                        <defs>
                          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
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
                              <div className="bg-white px-3 py-2 rounded-lg shadow-md border-2 border-primary">
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
                        <div key={cat.key} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <h3 className="text-base font-bold text-text-dark">{cat.name}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${level.color}`}>
                                {level.label}
                              </span>
                            </div>
                            <div className="text-xl font-bold text-primary">
                              {cat.score.toFixed(1)}
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    {/* 평균 점수 */}
                    <div className="bg-gradient-to-r from-primary to-blue-500 rounded-xl p-4 shadow-lg text-white mt-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-semibold opacity-90 mb-1">평균 점수</div>
                          <div className="text-2xl font-bold">
                            {(hexagonCategories.reduce((sum, cat) => sum + cat.score, 0) / hexagonCategories.length).toFixed(1)}
                          </div>
                        </div>
                        <div className="text-xs opacity-90">/ 10점</div>
                      </div>
                    </div>

                    {/* 자세히 보기 버튼 */}
                    <button
                      onClick={() => setShowDetailedScores(true)}
                      className="w-full mt-5 bg-white text-primary font-bold py-3 rounded-xl hover:bg-gray-50 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      7개 분야 상세 점수 보기
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // 7개 원형 그래프 상세 뷰
              <>
                <div className="text-center mb-8">
                  <button
                    onClick={() => setShowDetailedScores(false)}
                    className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark mb-3 font-semibold text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    레이더 차트로 돌아가기
                  </button>
                  <h2 className="text-2xl font-bold text-text-dark mb-2">
                    타이틀을 입력하세요
                  </h2>
                  <p className="text-sm text-text-gray">
                    7개 분야별로 나의 스펙을 확인하고 부족한 부분을 채워나가세요
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                  {categories.map((spec, index) => {
                    const percentage = (spec.score / 10) * 100;
                    const circumference = 2 * Math.PI * 90;
                    const strokeDashoffset = circumference - (percentage / 100) * circumference;

                    return (
                      <div
                        key={spec.key}
                        className="group relative bg-white rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
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
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
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

                          {/* 진행 바 */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${spec.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            />
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
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-text-dark mb-1">
                        종합 평균 점수
                      </h3>
                      <p className="text-xs text-text-gray">
                        7개 분야의 평균 점수입니다
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary mb-0.5">
                        {avgScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-text-gray font-semibold">/ 10점</div>
                    </div>
                  </div>
                  
                  {/* 전체 진행률 */}
                  <div className="mt-5">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${(avgScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 세부 정보 */}
          <div className="space-y-5">
            {/* 스펙 수정 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">스펙 체크</h3>
                  <p className="text-sm text-blue-800">
                    각 섹션의 수정 버튼을 클릭하여 최신 정보로 업데이트하세요
                  </p>
                </div>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-3.5 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-all"
                >
                  전체 재입력
                </button>
              </div>
            </div>

            {/* 학력 */}
            {data.education && (
              <div className="border border-border-color rounded-xl p-5 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-text-dark">학력</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getScoreLevel(data.radar_scores.education).color}`}>
                      {getScoreLevel(data.radar_scores.education).label}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/onboarding?step=1')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-body-2 text-text-gray min-w-20">학교</span>
                    <span className="text-body-1 text-text-dark font-medium">{data.education.school}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-body-2 text-text-gray min-w-20">전공</span>
                    <span className="text-body-1 text-text-dark">{data.education.major}</span>
                  </div>
                  {data.education.gpa && (
                    <div className="flex items-center gap-2">
                      <span className="text-body-2 text-text-gray min-w-20">학점</span>
                      <span className="text-body-1 text-text-dark">{data.education.gpa}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-body-2 text-text-gray min-w-20">상태</span>
                    <span className="text-body-1 text-text-dark">
                      {data.education.graduation_status === 'graduated' ? '졸업' : 
                       data.education.graduation_status === 'expected' ? '졸업예정' : '재학중'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 어학 */}
            {data.languages.length > 0 && (
              <div className="border border-border-color rounded-2xl p-6 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-title-2 font-bold text-text-dark">어학 능력</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreLevel(data.radar_scores.language).color}`}>
                      {getScoreLevel(data.radar_scores.language).label}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/onboarding?step=2')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between p-3 bg-bg-light rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-body-1 font-semibold text-text-dark">{lang.language_type}</span>
                        <span className="text-body-1 text-text-gray">{lang.score}</span>
                      </div>
                      {lang.acquisition_date && (
                        <span className="text-sm text-text-light">{lang.acquisition_date}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 자격증 */}
            {data.certificates.length > 0 && (
              <div className="border border-border-color rounded-2xl p-6 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-title-2 font-bold text-text-dark">자격증</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreLevel(data.radar_scores.certificate).color}`}>
                      {getScoreLevel(data.radar_scores.certificate).label}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/onboarding?step=2')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    수정
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {data.certificates.map((cert) => (
                    <div key={cert.id} className="p-3 bg-bg-light rounded-xl">
                      <div className="text-body-1 font-semibold text-text-dark mb-1">{cert.certificate_name}</div>
                      {cert.acquisition_date && (
                        <div className="text-sm text-text-light">{cert.acquisition_date}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 프로젝트 */}
            {data.projects.length > 0 && (
              <div className="border border-border-color rounded-2xl p-6 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-title-2 font-bold text-text-dark">프로젝트 경험</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreLevel(data.radar_scores.project).color}`}>
                      {getScoreLevel(data.radar_scores.project).label}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/onboarding?step=3')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-4">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-bg-light rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-body-1 font-bold text-text-dark">{proj.project_name}</h4>
                        {proj.period && (
                          <span className="text-sm text-text-light">{proj.period}</span>
                        )}
                      </div>
                      {proj.role && (
                        <div className="text-sm text-text-gray mb-2">{proj.role}</div>
                      )}
                      {proj.description && (
                        <p className="text-body-2 text-text-gray mb-2">{proj.description}</p>
                      )}
                      {proj.tech_stack && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {proj.tech_stack.split(',').map((tech, idx) => (
                            <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-text-gray">
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 대외활동 */}
            {data.activities.length > 0 && (
              <div className="border border-border-color rounded-2xl p-6 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-title-2 font-bold text-text-dark">대외활동</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreLevel(data.radar_scores.activity).color}`}>
                      {getScoreLevel(data.radar_scores.activity).label}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push('/onboarding?step=3')}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    수정
                  </button>
                </div>
                <div className="space-y-3">
                  {data.activities.map((act) => (
                    <div key={act.id} className="p-4 bg-bg-light rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-body-1 font-semibold text-text-dark">{act.activity_name}</h4>
                        {act.period && (
                          <span className="text-sm text-text-light">{act.period}</span>
                        )}
                      </div>
                      {act.activity_type && (
                        <div className="text-sm text-text-gray mb-2">{act.activity_type}</div>
                      )}
                      {act.description && (
                        <p className="text-body-2 text-text-gray">{act.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 경험 아카이브 섹션 */}
          <ExperienceSection />

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

// 경험 섹션 컴포넌트
function ExperienceSection() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<any[]>([]);

  useEffect(() => {
    const saved = storage.get<any[]>(STORAGE_KEYS.EXPERIENCES, []);
    setExperiences(saved);
  }, []);

  if (experiences.length === 0) return null;

  // 태그 통계
  const allTags = experiences.flatMap(exp => exp.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10);

  // 잔디 캘린더 데이터 (최근 3개월)
  const grassData: Record<string, number> = {};
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);

  experiences.forEach(exp => {
    const date = exp.completedDate;
    grassData[date] = (grassData[date] || 0) + 1;
  });

  // 잔디 캘린더 날짜 배열 생성 (최근 12주)
  const weeks: Date[][] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 83); // 12주 전
  
  for (let week = 0; week < 12; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + week * 7 + day);
      days.push(date);
    }
    weeks.push(days);
  }

  // 월별 경험 수
  const monthlyData: Record<string, number> = {};
  experiences.forEach(exp => {
    const date = new Date(exp.completedDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-text-dark">나의 경험 통계</h3>
        <button
          onClick={() => router.push('/experience')}
          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
        >
          전체 보기
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-semibold mb-1">총 경험</p>
              <p className="text-3xl font-bold text-purple-900">{experiences.length}</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-semibold mb-1">기술 스택</p>
              <p className="text-3xl font-bold text-blue-900">{Object.keys(tagCounts).length}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-semibold mb-1">이번 달</p>
              <p className="text-3xl font-bold text-green-900">
                {experiences.filter(exp => {
                  const expDate = new Date(exp.completedDate);
                  return expDate.getMonth() === today.getMonth() && 
                         expDate.getFullYear() === today.getFullYear();
                }).length}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 태그 클라우드 */}
      <div className="bg-white rounded-2xl border border-border-color p-6">
        <h4 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          상위 기술 스택
        </h4>
        <div className="flex flex-wrap gap-2">
          {topTags.map(([tag, count]) => {
            const size = Math.min((count as number) * 2 + 12, 24);
            return (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-lg bg-primary bg-opacity-10 text-primary font-medium hover:bg-primary hover:text-white transition-all cursor-pointer"
                style={{ fontSize: `${size}px` }}
              >
                {tag} ({count as number})
              </span>
            );
          })}
        </div>
      </div>

      {/* 잔디 캘린더 */}
      <div className="bg-white rounded-2xl border border-border-color p-6">
        <h4 className="text-lg font-bold text-text-dark mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          경험 캘린더 (최근 12주)
        </h4>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((date, dayIdx) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const count = grassData[dateStr] || 0;
                  const intensity = count === 0 ? 'bg-gray-100' :
                                   count === 1 ? 'bg-green-200' :
                                   count === 2 ? 'bg-green-400' :
                                   'bg-green-600';
                  return (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm ${intensity} transition-all hover:ring-2 hover:ring-primary cursor-pointer`}
                      title={`${dateStr}: ${count}개 경험`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-text-gray">
            <span>적음</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-green-200" />
            <div className="w-3 h-3 rounded-sm bg-green-400" />
            <div className="w-3 h-3 rounded-sm bg-green-600" />
            <span>많음</span>
          </div>
        </div>
      </div>
    </div>
  );
}
