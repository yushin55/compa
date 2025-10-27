'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet } from '@/lib/api';
import { DashboardData } from '@/types/api';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null);

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
    { name: '학력', score: data.radar_scores.education, key: 'education' },
    { name: '어학', score: data.radar_scores.language, key: 'language' },
    { name: '자격증', score: data.radar_scores.certificate, key: 'certificate' },
    { name: '프로젝트', score: data.radar_scores.project, key: 'project' },
    { name: '대외활동', score: data.radar_scores.activity, key: 'activity' },
  ];

  const totalScore = categories.reduce((sum, cat) => sum + cat.score, 0);
  const avgScore = totalScore / categories.length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="border-b border-border-color">
          <div className="max-w-5xl mx-auto px-8 py-12">
            <h1 className="text-display-2 mb-3 text-text-dark">내 스펙</h1>
            <p className="text-body-1 text-text-gray">
              현재 보유한 역량을 확인하고 강점을 파악하세요
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12">
          {/* 전체 요약 */}
          <div className="bg-bg-light rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-title-1 font-bold text-text-dark">전체 역량 점수</h2>
              <div className="text-display-2 font-bold text-primary">
                {avgScore.toFixed(1)}<span className="text-title-2 text-text-gray">/10</span>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-4">
              {categories.map((cat) => {
                const level = getScoreLevel(cat.score);
                return (
                  <div key={cat.key} className="text-center">
                    <div className={`w-full h-24 rounded-xl mb-2 transition-all ${level.color} flex items-end justify-center pb-2 relative overflow-hidden`}>
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-current opacity-20 transition-all"
                        style={{ height: `${(cat.score / 10) * 100}%` }}
                      />
                      <span className="relative text-title-1 font-bold">{cat.score}</span>
                    </div>
                    <div className="text-sm font-medium text-text-dark">{cat.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 세부 정보 */}
          <div className="space-y-6">
            {/* 스펙 수정 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-title-2 font-bold text-blue-900 mb-2">스펙 업데이트</h3>
                  <p className="text-body-2 text-blue-800">
                    각 섹션의 수정 버튼을 클릭하여 최신 정보로 업데이트하세요
                  </p>
                </div>
                <button
                  onClick={() => router.push('/onboarding')}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all"
                >
                  전체 재입력
                </button>
              </div>
            </div>

            {/* 학력 */}
            {data.education && (
              <div className="border border-border-color rounded-2xl p-6 hover:shadow-toss-hover transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-title-2 font-bold text-text-dark">학력</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreLevel(data.radar_scores.education).color}`}>
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
