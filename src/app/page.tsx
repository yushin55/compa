'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState<{ [key: number]: boolean }>({});
  const [countStats, setCountStats] = useState({ early: 0, job: 0, skill: 0 });
  const [openDetail, setOpenDetail] = useState<'an' | 'com' | 'cal' | null>(null);
  const [hoverDetail, setHoverDetail] = useState<'an' | 'com' | 'cal' | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 클릭으로 고정된 상세(openDetail)가 있으면 우선 사용하고, 없으면 호버 상태를 보여줍니다.
  const activeDetail = openDetail ?? hoverDetail;

  useEffect(() => {
    // 이미 로그인한 경우 로드맵으로 리다이렉트
    const userId = getUserId();
    if (userId) {
      router.push('/roadmap');
      return;
    }

    // Intersection Observer 설정
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setIsVisible((prev) => ({ ...prev, [index]: true }));
            
            // 통계 카운팅 애니메이션
            if (index === 1) {
              animateCount(0, 60.9, 2500, (val) => setCountStats(prev => ({ ...prev, early: val })));
            }
            if (index === 2) {
              animateCount(0, 0.39, 2500, (val) => setCountStats(prev => ({ ...prev, job: val })));
            }
            if (index === 3) {
              animateCount(0, 70, 2500, (val) => setCountStats(prev => ({ ...prev, skill: val })));
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    // 모든 섹션 요소 관찰
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => {
      observerRef.current?.observe(section);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [router]);

  const animateCount = (start: number, end: number, duration: number, callback: (val: number) => void) => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic for smoother animation
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const value = start + (end - start) * easeProgress;
      callback(parseFloat(value.toFixed(end < 1 ? 2 : 1)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">스펙체크</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm"
            >
              로그인
            </button>
            <button 
              onClick={() => router.push('/register')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              시작하기
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              취업 준비,<br />체계적으로 시작하세요
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              실제 채용공고 기반으로 목표를 설정하고,<br />
              나만의 로드맵을 만들어 경험을 쌓아가세요
            </p>
            <button 
              onClick={() => router.push('/register')}
              className="inline-block px-8 py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-base shadow-lg hover:shadow-xl"
            >
              무료로 시작하기
            </button>
          </div>
        </div>
      </section>

      {/* Section 1: 조기 퇴사 통계 */}
      <section 
        className="scroll-section py-20 px-6 bg-gradient-to-b from-white to-gray-50"
        data-index={1}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-semibold mb-4">
                신입사원 조기 퇴사
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                기업 <span className="text-red-600">{countStats.early}%</span>
              </h3>
              <p className="text-xl text-gray-600">
                "신입사원 평균 1~3년 내 퇴사한다"
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* 파이 차트 영역 */}
              <div className="relative">
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="relative w-72 h-72 mx-auto">
                    {/* 파이 차트 SVG */}
                    <svg viewBox="0 0 240 240" className="transform -rotate-90 w-full h-full">
                      {/* 배경 (회색) */}
                      <circle
                        cx="120"
                        cy="120"
                        r="90"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="50"
                      />
                    {/* 1-3년 (하늘색) - 60.9% */}
                    <circle
                      cx="120"
                      cy="120"
                      r="90"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="50"
                      strokeDasharray={`${isVisible[1] ? countStats.early * 5.655 : 0} 565.5`}
                      className="transition-all ease-in-out"
                      style={{ transitionDuration: '2500ms' }}
                    />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold text-red-600">{countStats.early}%</div>
                      <div className="text-base text-gray-600 mt-2">1~3년 내 퇴사</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 이유 리스트 */}
              <div className="space-y-4">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  조기 퇴사의 주요 원인
                </h4>
                <div className="space-y-3">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">직무 적합성 불일치</div>
                      <div className="text-2xl font-bold text-red-600">58.9%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '58.9%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">낮은 연봉</div>
                      <div className="text-2xl font-bold text-orange-600">42.5%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '42.5%' }}></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-gray-900">조직 문화 불일치</div>
                      <div className="text-2xl font-bold text-yellow-600">26.6%</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '26.6%' }}></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-6">인사 담당자 446명 대상 설문 | 자료: 인크루트</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 일자리 감소 그래프 */}
      <section 
        className="scroll-section py-20 px-6 bg-gray-50"
        data-index={2}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                취업 시장 변화
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                양질의 일자리는 줄어들고
              </h3>
              <p className="text-xl text-gray-600">
                고용률 24 구인배수는 역대 최저 <span className="font-bold text-orange-600">{countStats.job}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-2">고용률 24 구인배수 추이</h4>
                <p className="text-sm text-gray-600">구직자 1명당 일자리 수 (낮을수록 취업 어려움)</p>
              </div>
              
              {/* 막대 그래프 */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">'22.6</span>
                    <span className="text-base font-bold text-gray-900">0.78</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all ease-in-out"
                      style={{ 
                        width: isVisible[2] ? '78%' : '0%',
                        transitionDuration: '2000ms'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">'23.6</span>
                    <span className="text-base font-bold text-gray-900">0.66</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all ease-in-out"
                      style={{ 
                        width: isVisible[2] ? '66%' : '0%',
                        transitionDuration: '2000ms',
                        transitionDelay: '300ms'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">'24.6</span>
                    <span className="text-base font-bold text-gray-900">0.49</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all ease-in-out"
                      style={{ 
                        width: isVisible[2] ? '49%' : '0%',
                        transitionDuration: '2000ms',
                        transitionDelay: '600ms'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">'25.6</span>
                    <span className="text-base font-bold text-red-600">{countStats.job}</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all ease-in-out"
                      style={{ 
                        width: isVisible[2] ? `${countStats.job * 100}%` : '0%',
                        transitionDuration: '2000ms',
                        transitionDelay: '900ms'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">자료: 고용노동부 고용행정 통계</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 스킬 변화 통계 */}
      <section 
        className="scroll-section py-20 px-6 bg-white"
        data-index={3}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                스킬 변화 가속화
              </div>
              <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                2030년까지 직무 스킬의
              </h3>
              <p className="text-5xl font-bold text-blue-600">
                {countStats.skill}%가 바뀝니다
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              {/* 라인 그래프 시뮬레이션 */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-2">직무 스킬 변화율 추이</h4>
                <p className="text-sm text-gray-600">2015년 대비 필요 스킬 변화 비율</p>
              </div>
              
              <div className="relative h-80 bg-gradient-to-b from-gray-50 to-white rounded-xl p-6">
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-end justify-between gap-2 border-b-2 border-l-2 border-gray-300 pl-2 pb-2">
                    {[
                      { year: 2015, height: 2 },
                      { year: 2016, height: 5 },
                      { year: 2017, height: 8 },
                      { year: 2018, height: 9 },
                      { year: 2019, height: 24 },
                      { year: 2020, height: 24 },
                      { year: 2021, height: 23 },
                      { year: 2022, height: 30 },
                      { year: 2023, height: 32 },
                      { year: 2024, height: 38 },
                      { year: 2025, height: 42 }
                    ].map((item, index) => (
                      <div key={index} className="flex-1 flex justify-end h-full relative">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all ease-in-out"
                          style={{ 
                            height: isVisible[3] ? `${(item.height / 42) * 100}%` : '0%',
                            transitionDuration: '2000ms',
                            transitionDelay: `${index * 100}ms`
                          }}
                        >
                          {item.height > 25 && isVisible[3] && (
                            <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-600 transition-opacity duration-1000 bg-white px-1.5 py-0.5 rounded"
                              style={{ transitionDelay: `${index * 100 + 1500}ms` }}
                            >
                              {item.height}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between gap-2 mt-4 pl-2">
                    {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year, index) => (
                      <div key={index} className="flex-1 text-center">
                        <span className="text-xs text-gray-600 font-semibold">
                          {String(year).slice(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid md:grid-cols-3 gap-5">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">32%</div>
                  <div className="text-sm text-gray-600">최근 3년간 변화</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">70%</div>
                  <div className="text-sm text-gray-600">2030년 예상 변화</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 mb-2">2.5년</div>
                  <div className="text-sm text-gray-600">스킬 반감기</div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500 mt-8">
                출처: LinkedIn Future of Skills, WEF Future of Jobs Report 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 솔루션 제시 */}
      <section 
        className="scroll-section py-20 px-6 bg-gray-50"
        data-index={4}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${
            isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <div className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-6">
              스펙 체크의 솔루션
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              그래서 우리는<br />
              <span className="text-blue-600">진짜 자신의 위치를 찾아야 합니다</span>
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              자신의 역량을 확인하고, 원하는 기업에 취직하기 위해<br />
              개인비서를 통한 맞춤형 커리어 관리가 필요합니다
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: 기능 소개 카드들 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              핵심 기능
            </div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              스펙 체크가 제공하는 기능
            </h3>
            <p className="text-xl text-gray-600">
              자신의 역량을 분석하여 스스로의 위치를 파악하고 계획해서 원하는 회사에 취직하세요
            </p>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 기능 카드 1: 역량 분석 */}
            <div
              data-index={5}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              onClick={() => setOpenDetail(openDetail === 'an' ? null : 'an')}
            >
              <div className="h-80 rounded-2xl bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-blue-600">AN</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    개인 맞춤 역량 분석
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    개인의 전공, 자격증, 어학 점수 등을 바탕으로 역량 점수를 분석하고 자신의 위치를 확인해보세요
                  </p>
                </div>
                <div className="text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  자세히 보기 →
                </div>
              </div>
            </div>

            {/* 기능 카드 2: 기업 추천 */}
            <div
              data-index={7}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[7] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              onClick={() => setOpenDetail(openDetail === 'com' ? null : 'com')}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="h-80 rounded-2xl bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-green-600">COM</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    기업 추천 및 맞춤 분석
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    본인의 목표를 기반으로 다양한 기업을 알아보고 기업 인재상에 맞는 역량을 준비해보세요
                  </p>
                </div>
                <div className="text-green-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  자세히 보기 →
                </div>
              </div>
            </div>

            {/* 기능 카드 3: TASK 관리 */}
            <div
              data-index={8}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[8] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              onClick={() => setOpenDetail(openDetail === 'cal' ? null : 'cal')}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="h-80 rounded-2xl bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-orange-600">CAL</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    TASK 관리
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    자신의 역량 및 추천 기업을 바탕으로 맞춤형 TASK를 제안받고 관리해보세요
                  </p>
                </div>
                <div className="text-orange-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                  자세히 보기 →
                </div>
              </div>
            </div>
          </div>

          {/* 상세 설명 패널 (클릭 고정 또는 호버 프리뷰) */}
          {activeDetail && (
            <div className="max-w-6xl mx-auto mt-10 p-10 md:p-12 bg-white rounded-2xl shadow-lg text-lg">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {activeDetail === 'an' && '개인 맞춤 역량 분석 자세히 보기'}
                  {activeDetail === 'com' && '기업 추천 및 맞춤형 기업 분석 자세히 보기'}
                  {activeDetail === 'cal' && 'TASK 관리 자세히 보기'}
                </h4>
                <button
                  onClick={() => { setOpenDetail(null); setHoverDetail(null); }}
                  className="text-gray-600 hover:text-gray-800 text-lg px-3 py-2 border rounded-md"
                  aria-label="닫기"
                >
                  닫기
                </button>
              </div>

              {activeDetail === 'an' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  {/* 왼쪽: AN 메인 이미지 (더 크게) */}
                  <div className="relative bg-gray-50 rounded-lg">
                    <img src="/images/AN.png" alt="AN" className="w-full h-[36rem] object-contain rounded-lg shadow-lg" />
                    
                  </div>

                  {/* 오른쪽: AN2 이미지 + 설명 (데스크톱에서 AN의 우측에 위치) */}
                  <div className="flex flex-col">
                    <div className="bg-gray-50 rounded-lg mb-6">
                      <img src="/images/AN2.png" alt="AN2" className="w-full h-[24rem] object-contain rounded-lg shadow-lg" />
                    </div>
                    <div>
                      <h5 className="text-xl font-semibold mb-4">기능 요약</h5>
                      <p className="text-gray-700 mb-6">사용자의 이력과 입력 정보를 바탕으로 항목별 가중치를 적용해 종합 역량 점수를 계산합니다. 분석 결과는 시각화된 차트와 함께 개선 우선순위, 추천 TASK로 연결되어 실천까지 이어집니다.</p>
                      <p className="text-gray-700">이미지에서 각 항목의 세부 점수를 확인할 수 있으며, 여기서는 기능의 동작 방식과 결과 활용 흐름(분석 → 우선순위 → 자동 TASK 생성)을 간결히 안내합니다.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeDetail === 'com' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="relative bg-gray-50 rounded-lg">
                    <img src="/images/COM.png" alt="COM" className="w-full h-[36rem] object-contain rounded-lg shadow-lg" />
                    <div className="absolute right-8 top-8 bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold">매치율 78%</div>

                  </div>
                  <div>
                    <div className="bg-gray-50 rounded-lg mb-6">
                      <img src="/images/COMPA.png" alt="COMPA" className="w-full h-[28rem] object-contain rounded-lg shadow" />
                    </div>
                    <p className="text-gray-700 mb-6">매치율 기반으로 직무별·회사별 우선 준비 항목을 자동으로 도출합니다. 예: 포트폴리오 추가, 특정 자격증 취득, 어학 점수 향상 등.</p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2"><span className="text-sky-600 font-semibold">•</span> 자격증/스킬 보완 과제</li>
                      <li className="flex items-start gap-2"><span className="text-sky-600 font-semibold">•</span> 포트폴리오 보강 과제</li>
                      <li className="flex items-start gap-2"><span className="text-sky-600 font-semibold">•</span> 모의면접/시험 준비 스케줄</li>
                    </ul>
                    <p className="text-sm text-gray-500 mt-4">원클릭으로 이 계획을 TASK로 변환하여 캘린더에 배치할 수 있습니다.</p>
                  </div>
                </div>
              )}

              {activeDetail === 'cal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                  <div className="relative bg-gray-50 rounded-lg">
                    <img src="/images/CAL.png" alt="CAL" className="w-full h-[36rem] object-contain rounded-lg shadow-lg" />
                    <div className="absolute right-8 top-8 bg-white/90 text-gray-900 px-4 py-2 rounded-full font-semibold">진행률 42%</div>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold mb-3">TASK 관리 및 진행 게이지</h5>
                    <p className="text-gray-700 mb-4">자동 생성된 계획은 캘린더에 배치되며 사용자가 수행 상태를 업데이트할 때마다 전체 진행 게이지가 채워집니다. 아래는 예시 흐름입니다.</p>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                      <li>자동 생성된 TASK를 확인하고 캘린더에 배치</li>
                      <li>작업을 수행하면 상태를 '완료'로 표시</li>
                      <li>완료된 작업 비율에 따라 진행 게이지(프로필/목표 대비)가 상승</li>
                    </ol>
                    <div className="mt-6">
                      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400" style={{ width: '42%' }}></div>
                      </div>
                      <div className="text-sm text-gray-600 mt-2">진행률 예시: 42%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl text-gray-600 mb-12">
            취업이 걱정인 당신에게 적합한 맞춤형 비서<br />
            당신의 커리어를 스펙 체크와 함께 시작하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="px-10 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              무료로 시작하기
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-10 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              로그인
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">스펙 체크</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                취업이 걱정인 당신에게 적합한 맞춤형 비서.<br />
                체계적인 취업 준비를 시작하세요.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">역량 분석</li>
                <li className="hover:text-white transition-colors cursor-pointer">기업 추천</li>
                <li className="hover:text-white transition-colors cursor-pointer">TASK 관리</li>
                <li className="hover:text-white transition-colors cursor-pointer">나의 경험</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">문의</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">고객 지원</li>
                <li className="hover:text-white transition-colors cursor-pointer">이용 약관</li>
                <li className="hover:text-white transition-colors cursor-pointer">개인정보처리방침</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 스펙 체크. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
