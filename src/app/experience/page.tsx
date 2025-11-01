'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId } from '@/lib/api';
import { storage, STORAGE_KEYS } from '@/lib/utils';

type Experience = {
  id: string;
  taskId: string;
  title: string;
  category: string;
  completedDate: string;
  reflection: {
    learned: string;
    challenges: string;
    solutions: string;
    improvements: string;
  };
  tags: string[];
  relatedResources: string[];
};

export default function ExperiencePage() {
  const router = useRouter();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!getUserId()) {
      router.push('/login');
      return;
    }
    loadExperiences();
  }, [router]);

  const loadExperiences = () => {
    const saved = storage.get<Experience[]>(STORAGE_KEYS.EXPERIENCES, []);
    setExperiences(saved);
    setLoading(false);
  };

  // 모든 태그 추출
  const allTags = Array.from(
    new Set(experiences.flatMap(exp => exp.tags))
  );

  // 태그별 카운트
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = experiences.filter(exp => exp.tags.includes(tag)).length;
    return acc;
  }, {} as Record<string, number>);

  // 필터링된 경험
  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.reflection.learned.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => exp.tags.includes(tag));
    
    const matchesPeriod = (() => {
      if (selectedPeriod === 'all') return true;
      const expDate = new Date(exp.completedDate);
      const now = new Date();
      switch (selectedPeriod) {
        case 'week':
          return (now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24) <= 7;
        case 'month':
          return (now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24) <= 30;
        case 'quarter':
          return (now.getTime() - expDate.getTime()) / (1000 * 60 * 60 * 24) <= 90;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesTags && matchesPeriod;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const exportExperiences = (format: 'markdown' | 'pdf') => {
    if (filteredExperiences.length === 0) {
      alert('내보낼 경험이 없습니다.');
      return;
    }

    if (format === 'markdown') {
      let markdown = '# 나의 경험 아카이브\n\n';
      markdown += `작성일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
      markdown += `총 ${filteredExperiences.length}개의 경험\n\n---\n\n`;

      filteredExperiences.forEach((exp, idx) => {
        markdown += `## ${idx + 1}. ${exp.title}\n\n`;
        markdown += `- **카테고리**: ${exp.category}\n`;
        markdown += `- **완료일**: ${exp.completedDate}\n`;
        markdown += `- **태그**: ${exp.tags.join(', ')}\n\n`;
        markdown += `### 💡 배운 점\n${exp.reflection.learned}\n\n`;
        markdown += `### 😰 어려웠던 점\n${exp.reflection.challenges}\n\n`;
        markdown += `### 🔧 해결 과정\n${exp.reflection.solutions}\n\n`;
        markdown += `### 📈 개선점\n${exp.reflection.improvements}\n\n`;
        if (exp.relatedResources.length > 0) {
          markdown += `### 📚 관련 자료\n`;
          exp.relatedResources.forEach(resource => {
            markdown += `- ${resource}\n`;
          });
        }
        markdown += `\n---\n\n`;
      });

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `경험아카이브_${new Date().toISOString().split('T')[0]}.md`;
      a.click();
    } else {
      alert('PDF 내보내기는 곧 지원될 예정입니다.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-text-gray">로딩 중...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="border-b border-border-color">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              나의 경험 아카이브
            </h1>
            <p className="text-sm text-text-gray">
              완료한 태스크의 회고를 모아보고, 포트폴리오로 활용하세요
            </p>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 font-semibold mb-2">총 경험</p>
              <p className="text-4xl font-bold text-gray-900">{experiences.length}</p>
              <p className="text-xs text-gray-500 mt-2">완료된 회고</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 font-semibold mb-2">기술 스택</p>
              <p className="text-4xl font-bold text-gray-900">{allTags.length}</p>
              <p className="text-xs text-gray-500 mt-2">등록된 태그</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 font-semibold mb-2">이번 달</p>
              <p className="text-4xl font-bold text-gray-900">
                {experiences.filter(exp => {
                  const expDate = new Date(exp.completedDate);
                  const now = new Date();
                  return expDate.getMonth() === now.getMonth() && 
                         expDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
              <p className="text-xs text-gray-500 mt-2">월간 완료</p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 font-semibold mb-2">평균 태그</p>
              <p className="text-4xl font-bold text-gray-900">
                {experiences.length > 0 
                  ? (experiences.reduce((sum, exp) => sum + exp.tags.length, 0) / experiences.length).toFixed(1)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">태스크당</p>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-xl border border-border-color p-6 mb-6">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* 검색 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-text-dark mb-2">검색</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="제목, 배운 점, 태그로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control pl-10"
                  />
                  <svg 
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-gray"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* 기간 필터 */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">기간</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="form-control"
                >
                  <option value="all">전체</option>
                  <option value="week">최근 1주일</option>
                  <option value="month">최근 1개월</option>
                  <option value="quarter">최근 3개월</option>
                </select>
              </div>
            </div>

            {/* 태그 필터 */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-2">
                  태그 필터 {selectedTags.length > 0 && `(${selectedTags.length}개 선택)`}
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 text-text-gray hover:bg-gray-200'
                      }`}
                    >
                      {tag} ({tagCounts[tag]})
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="mt-2 text-sm text-primary hover:underline"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            )}

            {/* 내보내기 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-color">
              <div className="text-sm text-text-gray">
                {filteredExperiences.length}개의 경험이 검색되었습니다
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportExperiences('markdown')}
                  disabled={filteredExperiences.length === 0}
                  className="btn btn-outline btn-sm"
                >
                  Markdown 내보내기
                </button>
                <button
                  onClick={() => exportExperiences('pdf')}
                  disabled={filteredExperiences.length === 0}
                  className="btn btn-primary btn-sm"
                >
                  PDF 내보내기
                </button>
              </div>
            </div>
          </div>

          {/* 경험 목록 */}
          {filteredExperiences.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {experiences.length === 0 
                  ? '아직 기록된 경험이 없습니다'
                  : '검색 결과가 없습니다'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {experiences.length === 0
                  ? '로드맵에서 태스크를 완료하고 회고를 작성해보세요'
                  : '다른 검색어나 필터를 사용해보세요'}
              </p>
              {experiences.length === 0 && (
                <button
                  onClick={() => router.push('/roadmap')}
                  className="btn btn-primary"
                >
                  로드맵으로 이동
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExperiences.map(exp => (
                <div
                  key={exp.id}
                  onClick={() => {
                    setSelectedExperience(exp);
                    setShowDetail(true);
                  }}
                  className="group bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                >
                  {/* 카드 헤더 */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {exp.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(exp.completedDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {exp.title}
                    </h3>
                  </div>

                  {/* 카드 내용 */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {exp.reflection.learned}
                      </p>
                    </div>

                    {/* 태그 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {exp.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                      {exp.tags.length > 3 && (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          +{exp.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* 하단 정보 */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">회고 작성 완료</span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                        자세히 →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 상세 모달 */}
        {showDetail && selectedExperience && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              {/* 모달 헤더 */}
              <div className="p-8 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        {selectedExperience.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(selectedExperience.completedDate).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedExperience.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                  >
                    <span className="text-gray-600 text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* 모달 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-5">
                  {/* 배운 점 */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      배운 점
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedExperience.reflection.learned}
                    </p>
                  </div>

                  {/* 어려웠던 점 */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      어려웠던 점
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedExperience.reflection.challenges}
                    </p>
                  </div>

                  {/* 해결 과정 */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      해결 과정
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedExperience.reflection.solutions}
                    </p>
                  </div>

                  {/* 개선점 */}
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      개선점 및 다음 목표
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedExperience.reflection.improvements}
                    </p>
                  </div>

                  {/* 태그 */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">기술 스택 & 태그</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExperience.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-md text-sm bg-gray-100 text-gray-700 font-medium border border-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 관련 자료 */}
                  {selectedExperience.relatedResources.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-text-dark mb-3">관련 자료</h3>
                      <div className="space-y-2">
                        {selectedExperience.relatedResources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              {resource}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="p-6 border-t border-border-color flex items-center justify-end gap-3 bg-bg-light">
                <button
                  onClick={() => setShowDetail(false)}
                  className="btn btn-outline"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
