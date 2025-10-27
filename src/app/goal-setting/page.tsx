'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet, apiPost } from '@/lib/api';
import { JobPosting, UserProgress } from '@/types/api';

export default function GoalSettingPage() {
  const router = useRouter();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postings, progress] = await Promise.all([
        apiGet<JobPosting[]>('/job-postings'),
        apiGet<UserProgress>('/progress').catch(() => null),
      ]);
      setJobPostings(postings);
      setUserProgress(progress);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectGoal = async (posting: JobPosting) => {
    try {
      await apiPost('/goals', {
        job_posting_id: posting.id,
      });
      setSelectedJob(posting);
      setShowJobDetail(true);
    } catch (error) {
      console.error('목표 설정 실패:', error);
      alert('목표 설정에 실패했습니다.');
    }
  };

  const generateAutoPlan = async () => {
    if (!selectedJob) return;
    
    setGeneratingPlan(true);
    try {
      // AI가 갭 분석을 기반으로 주간 계획 자동 생성
      await apiPost('/tasks/auto-generate', {
        job_posting_id: selectedJob.id,
      });
      
      alert('주간 계획이 자동으로 생성되었습니다! 로드맵 페이지에서 확인하세요.');
      router.push('/roadmap');
    } catch (error) {
      console.error('자동 계획 생성 실패:', error);
      alert('계획 생성에 실패했습니다.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  const filteredPostings = jobPostings.filter(posting =>
    posting.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
          <div className="text-text-gray">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-20">
        {/* 헤더 */}
        <div className="border-b border-border-color bg-white">
          <div className="max-w-7xl mx-auto px-8 py-12">
            <h1 className="text-display-2 font-bold text-text-dark mb-4">
              목표 설정
            </h1>
            <p className="text-body-1 text-text-gray">
              관심있는 채용공고를 선택하고 자동으로 학습 계획을 생성하세요
            </p>
          </div>
        </div>

        {/* 검색 */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="relative">
            <input
              type="text"
              placeholder="회사명, 포지션, 키워드로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control pl-12"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 공고 목록 */}
        <div className="max-w-7xl mx-auto px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPostings.map((posting) => {
              const gap = userProgress?.gap_analysis?.find(g => g.job_posting_id === posting.id);
              const metCount = gap?.requirements.filter(r => r.is_met).length || 0;
              const totalCount = gap?.requirements.length || 0;
              const matchRate = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

              return (
                <div
                  key={posting.id}
                  className="border-2 border-border-color rounded-3xl p-6 hover:shadow-toss-hover transition-all cursor-pointer bg-white"
                  onClick={() => {
                    setSelectedJob(posting);
                    setShowJobDetail(true);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-title-1 font-bold text-text-dark">
                          {posting.company}
                        </h3>
                        {posting.is_active && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                            채용중
                          </span>
                        )}
                      </div>
                      <p className="text-title-2 text-text-gray">
                        {posting.title}
                      </p>
                    </div>
                  </div>

                  {posting.description && (
                    <p className="text-body-2 text-text-gray mb-4 line-clamp-2">
                      {posting.description}
                    </p>
                  )}

                  {/* 매칭률 */}
                  {gap && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-dark">
                          매칭률
                        </span>
                        <span className={`text-sm font-bold ${
                          matchRate >= 80 ? 'text-green-600' :
                          matchRate >= 50 ? 'text-blue-600' :
                          matchRate >= 30 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {matchRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            matchRate >= 80 ? 'bg-green-500' :
                            matchRate >= 50 ? 'bg-blue-500' :
                            matchRate >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${matchRate}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 요구사항 미리보기 */}
                  {posting.requirements && posting.requirements.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-text-dark">주요 요구사항</div>
                      <div className="space-y-1">
                        {posting.requirements.slice(0, 3).map((req, idx) => {
                          const isMet = gap?.requirements.find(r => r.description === req.description)?.is_met;
                          return (
                            <div key={idx} className="flex items-start gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                                isMet ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="text-sm text-text-gray flex-1">
                                {req.description}
                              </span>
                            </div>
                          );
                        })}
                        {posting.requirements.length > 3 && (
                          <div className="text-sm text-text-light pl-3.5">
                            외 {posting.requirements.length - 3}개
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border-color flex items-center justify-between">
                    <div className="text-sm text-text-light">
                      {posting.url && (
                        <span className="text-primary hover:underline">
                          공고 상세보기 →
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectGoal(posting);
                      }}
                      className="btn btn-primary"
                    >
                      목표로 설정
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 공고 상세 모달 */}
        {showJobDetail && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* 모달 헤더 */}
              <div className="p-6 border-b border-border-color flex items-center justify-between">
                <div>
                  <h2 className="text-title-1 font-bold text-text-dark mb-1">
                    {selectedJob.company} - {selectedJob.title}
                  </h2>
                  <p className="text-body-2 text-text-gray">
                    채용공고 상세정보
                  </p>
                </div>
                <button
                  onClick={() => setShowJobDetail(false)}
                  className="p-2 hover:bg-bg-light rounded-lg transition-all"
                >
                  <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* iframe으로 실제 공고 페이지 표시 */}
              <div className="flex-1 overflow-hidden">
                {selectedJob.url ? (
                  <iframe
                    src={selectedJob.url}
                    className="w-full h-full border-0"
                    title={`${selectedJob.company} 채용공고`}
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                ) : (
                  <div className="p-8 overflow-y-auto h-full">
                    <div className="max-w-4xl mx-auto">
                      {/* 공고 설명 */}
                      {selectedJob.description && (
                        <div className="mb-8">
                          <h3 className="text-title-2 font-bold text-text-dark mb-4">포지션 소개</h3>
                          <p className="text-body-1 text-text-gray whitespace-pre-line">
                            {selectedJob.description}
                          </p>
                        </div>
                      )}

                      {/* 요구사항 */}
                      {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-title-2 font-bold text-text-dark mb-4">자격 요건</h3>
                          <div className="space-y-3">
                            {selectedJob.requirements.map((req, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary bg-opacity-10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-primary text-sm font-bold">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-body-1 text-text-dark font-medium">
                                    {req.description}
                                  </p>
                                  {req.category && (
                                    <span className="inline-block mt-1 text-sm text-text-light">
                                      #{req.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 갭 분석 */}
                      {userProgress?.gap_analysis?.find(g => g.job_posting_id === selectedJob.id) && (
                        <div className="mb-8">
                          <h3 className="text-title-2 font-bold text-text-dark mb-4">내 스펙 분석</h3>
                          <div className="space-y-3">
                            {userProgress.gap_analysis
                              .find(g => g.job_posting_id === selectedJob.id)
                              ?.requirements.map((req, idx) => (
                                <div
                                  key={idx}
                                  className={`p-4 rounded-xl border-2 ${
                                    req.is_met
                                      ? 'bg-green-50 border-green-200'
                                      : 'bg-red-50 border-red-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    {req.is_met ? (
                                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    <div className="flex-1">
                                      <p className={`font-semibold ${
                                        req.is_met ? 'text-green-800' : 'text-red-800'
                                      }`}>
                                        {req.description}
                                      </p>
                                      {req.gap_detail && (
                                        <p className="text-sm text-text-gray mt-1">
                                          {req.gap_detail}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 모달 푸터 */}
              <div className="p-6 border-t border-border-color flex items-center justify-between bg-bg-light">
                <div className="text-sm text-text-gray">
                  {selectedJob.url && (
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      원본 공고 새 창에서 보기 ↗
                    </a>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJobDetail(false)}
                    className="btn btn-outline"
                  >
                    닫기
                  </button>
                  <button
                    onClick={generateAutoPlan}
                    disabled={generatingPlan}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {generatingPlan ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        생성 중...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        자동 계획 생성
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
