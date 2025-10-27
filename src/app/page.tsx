'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState<{ [key: number]: boolean }>({});
  const [countStats, setCountStats] = useState({ early: 0, job: 0, skill: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">미리 출근</h1>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors font-medium"
          >
            시작하기
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-12 tracking-tight">
            출근하기 전에,
          </h2>
          <button 
            onClick={() => router.push('/register')}
            className="inline-block px-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-all font-medium text-lg"
          >
            더 알아보기
          </button>
        </div>
      </section>

      {/* Section 1: 조기 퇴사 통계 */}
      <section 
        className="scroll-section py-20 px-6 bg-gray-50"
        data-index={1}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[1] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              기업 60.9%
            </h3>
            <p className="text-2xl text-blue-600 font-bold mb-12 text-center">
              "신입사원 평균 1~3년 내 퇴사한다"
            </p>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* 파이 차트 영역 */}
              <div className="relative">
                <div className="relative w-80 h-80 mx-auto p-4">
                  {/* 파이 차트 SVG */}
                  <svg viewBox="0 0 240 240" className="transform -rotate-90 w-full h-full">
                    {/* 배경 (회색) */}
                    <circle
                      cx="120"
                      cy="120"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
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
                    <div className="text-5xl font-bold text-sky-500">{countStats.early}%</div>
                    <div className="text-xl text-gray-700 mt-2">1~3년</div>
                  </div>
                </div>
                <p className="text-center text-gray-600 mt-4">조기 퇴사한 신입사원의 평균 근속 기간</p>
              </div>

              {/* 이유 리스트 */}
              <div className="bg-sky-50 rounded-3xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  신입사원 조기 퇴사 이유
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">직무 적합성 불일치</div>
                      <div className="text-sm text-gray-600">58.9%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-400 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">낮은 연봉</div>
                      <div className="text-sm text-gray-600">42.5%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-sky-300 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">맞지 않은 사내 문화</div>
                      <div className="text-sm text-gray-600">26.6%</div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-6">인사 담당자 446명 대상 | 자료제공: 인크루트</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 일자리 감소 그래프 */}
      <section 
        className="scroll-section py-20 px-6"
        data-index={2}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[2] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              양질의 일자리는 줄어들고
            </h3>
            <p className="text-xl text-gray-600 mb-12 text-center">
              고용률 24 구인배수는 역대 최저 <span className="font-bold text-red-600">0.39</span>
            </p>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">고용률 24 구인배수</h4>
                <p className="text-sm text-gray-600">구직자 1명당 일자리 수</p>
              </div>
              
              {/* 막대 그래프 */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">'22.6</span>
                    <span className="text-sm font-bold">0.78</span>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-sky-400 transition-all ease-in-out rounded-lg"
                      style={{ 
                        width: isVisible[2] ? '78%' : '0%',
                        transitionDuration: '2000ms'
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">'23.6</span>
                    <span className="text-sm font-bold">0.66</span>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-sky-400 transition-all ease-in-out rounded-lg"
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
                    <span className="text-sm font-medium">'24.6</span>
                    <span className="text-sm font-bold">0.49</span>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-sky-400 transition-all ease-in-out rounded-lg"
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
                    <span className="text-sm font-medium">'25.6</span>
                    <span className="text-sm font-bold text-red-600">{countStats.job}</span>
                  </div>
                  <div className="h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 transition-all ease-in-out rounded-lg"
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
        className="scroll-section py-20 px-6 bg-gray-50"
        data-index={3}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${
            isVisible[3] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
              2030년까지 직무 스킬의
            </h3>
            <p className="text-5xl font-bold text-sky-600 mb-12 text-center">
              {countStats.skill}%가 바뀝니다
            </p>

            <div className="bg-white rounded-3xl p-8 shadow-lg">
              {/* 라인 그래프 시뮬레이션 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-2">직무 스킬 변화율</h4>
                <p className="text-sm text-gray-600">2015년 대비 스킬 변화 추이</p>
              </div>
              
              <div className="relative h-80 bg-gray-50 rounded-xl p-6">
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex items-end justify-between gap-3 border-b-2 border-l-2 border-gray-300 pl-2 pb-2">
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
                          className="w-full bg-sky-400 rounded-t transition-all ease-in-out"
                          style={{ 
                            height: isVisible[3] ? `${(item.height / 42) * 100}%` : '0%',
                            transitionDuration: '2000ms',
                            transitionDelay: `${index * 100}ms`
                          }}
                        >
                          {item.height > 25 && isVisible[3] && (
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-sky-600 transition-opacity duration-1000"
                              style={{ transitionDelay: `${index * 100 + 1500}ms` }}
                            >
                              {item.height}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between gap-3 mt-2 pl-2">
                    {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((year, index) => (
                      <div key={index} className="flex-1 text-center">
                        {index % 2 === 0 && (
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            '{String(year).slice(2)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-sky-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-sky-600">32%</div>
                  <div className="text-sm text-gray-600 mt-1">최근 3년간 변화</div>
                </div>
                <div className="bg-sky-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-sky-600">70%</div>
                  <div className="text-sm text-gray-600 mt-1">2030년 예상 변화</div>
                </div>
                <div className="bg-sky-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-sky-600">2.5년</div>
                  <div className="text-sm text-gray-600 mt-1">스킬 반감기</div>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-6">
                자료: LinkedIn Future of Skills, WEF Future of Jobs Report 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 솔루션 제시 */}
      <section 
        className="scroll-section py-20 px-6"
        data-index={4}
      >
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${
            isVisible[4] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              그래서 우리는,<br />
              <span className="text-sky-600">진짜 하고 싶은 일</span>을 찾아야 합니다
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              직무 불일치를 줄이고, 변화하는 스킬에 대응하려면<br />
              실제 직무를 미리 경험하고 내게 맞는 일을 찾아야 합니다
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: 기능 소개 카드들 */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              미리 출근이 제공하는 기능
            </h3>
            <p className="text-xl text-gray-600">
              현직자가 설계한 실무 과제로 직무를 체험하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 기능 카드 1: 웹툰 스토리텔링 */}
            <div
              data-index={5}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[5] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    웹툰 형식의 직무 스토리텔링
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    현직자의 하루를 따라가며 실제 업무 환경과 프로세스를 생생하게 체험하세요.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>

            {/* 기능 카드 2: 맥락 기반 과제 */}
            <div
              data-index={6}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[6] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    맥락 기반 미니 과제
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    실제 업무 상황 속에서 과제를 수행하며 실무 감각을 키울 수 있습니다.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>

            {/* 기능 카드 3: AI 스킬 분석 */}
            <div
              data-index={7}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[7] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    AI 스킬 갭 분석
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    목표 직무 대비 부족한 스킬을 수치로 시각화하여 학습 방향을 제시합니다.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>

            {/* 기능 카드 4: 퀘스트 & 뱃지 */}
            <div
              data-index={8}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[8] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    퀘스트 & 뱃지 시스템
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    직무별 과제를 수행하고 검증 가능한 역량 뱃지와 경험치를 획득하세요.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>

            {/* 기능 카드 5: 현직자 멘토링 */}
            <div
              data-index={9}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[9] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    현직자 멘토링
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    AMA와 포트폴리오 리뷰를 통해 현직자의 실질적인 조언을 받을 수 있습니다.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>

            {/* 기능 카드 6: 성장 대시보드 */}
            <div
              data-index={10}
              className={`scroll-section group cursor-pointer transition-all duration-700 transform ${
                isVisible[10] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <div className="relative h-96 rounded-3xl bg-sky-100 p-8 flex flex-col justify-end overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-white transition-colors duration-500">
                    성장 대시보드
                  </h3>
                  <p className="text-gray-700 leading-relaxed group-hover:text-gray-100 transition-colors duration-500">
                    주간 성장 스코어와 목표 직무 매칭도를 한눈에 파악할 수 있습니다.
                  </p>
                </div>

                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            지금 바로 시작하세요
          </h3>
          <p className="text-xl text-gray-600 mb-10">
            출근하기 전에 미리 경험하는 직무 체험<br />
            당신의 커리어를 미리 출근과 함께 시작하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/register')}
              className="px-10 py-4 bg-sky-500 text-white rounded-full text-lg font-bold hover:bg-sky-600 transition-all transform hover:scale-105 shadow-lg"
            >
              무료로 시작하기
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-10 py-4 bg-transparent border-2 border-gray-900 text-gray-900 rounded-full text-lg font-bold hover:bg-gray-900 hover:text-white transition-all"
            >
              로그인
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">미리 출근</h3>
          </div>
          <p className="text-gray-400 text-sm">출근하기 전에 미리 경험하는 직무 체험 플랫폼</p>
        </div>
      </footer>
    </div>
  );
}
