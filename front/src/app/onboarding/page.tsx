'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, apiPut, apiPost, apiDelete } from '@/lib/api';
import { Education, Language, Certificate, Project, Activity } from '@/types/api';

// 한국 주요 대학교 데이터
const UNIVERSITIES = [
  '서울대학교', '연세대학교', '고려대학교', '카이스트(KAIST)', '포항공과대학교(POSTECH)',
  '성균관대학교', '한양대학교', '중앙대학교', '경희대학교', '한국외국어대학교',
  '서울시립대학교', '건국대학교', '동국대학교', '홍익대학교', '숙명여자대학교',
  '이화여자대학교', '서강대학교', '광운대학교', '국민대학교', '세종대학교',
  '부산대학교', '경북대학교', '전남대학교', '충남대학교', '전북대학교',
  '인하대학교', '아주대학교', '가천대학교', '단국대학교', '명지대학교'
];

// 주요 전공 데이터
const MAJORS = [
  '컴퓨터공학과', '소프트웨어학과', '전자공학과', '정보통신공학과', '인공지능학과',
  '데이터사이언스학과', '경영학과', '경제학과', '심리학과', '사회학과',
  '영어영문학과', '국어국문학과', '중어중문학과', '일어일문학과', '불어불문학과',
  '수학과', '통계학과', '물리학과', '화학과', '생명과학과',
  '기계공학과', '화학공학과', '신소재공학과', '건축학과', '산업공학과',
  '의예과', '약학과', '간호학과', '디자인학과', '미디어커뮤니케이션학과'
];

// 어학 시험 종류
const LANGUAGE_TESTS = [
  'TOEIC', 'TOEIC Speaking', 'TOEFL', 'IELTS', 'OPIc',
  'TEPS', 'HSK', 'JLPT', 'DELE', 'DELF', 'TestDaF'
];

// 자격증 종류
const CERTIFICATES = [
  '정보처리기사', '정보처리산업기사', 'SQLD', 'SQLP', '빅데이터분석기사',
  'AWS Certified Solutions Architect', 'Google Cloud Certified', '컴퓨터활용능력 1급',
  '워드프로세서', 'ITQ', 'MOS', '토목기사', '건축기사',
  '전기기사', '전자기사', '회계관리 1급', '재경관리사', '사회조사분석사',
  '물류관리사', '유통관리사', '한국사능력검정시험', '주택관리사', '공인중개사'
];

// 프로젝트 템플릿 (3가지)
const PROJECT_TEMPLATES = [
  {
    id: 1,
    name: '📱 개발 프로젝트',
    content: `[프로젝트 개요]
프로젝트명을 입력하세요 (예: 웹 기반 쇼핑몰 플랫폼)

[내가 진행한 작업]
• 담당 역할 및 구체적인 업무 내용을 작성하세요
• 어떤 문제를 해결했는지 설명하세요
• 주도적으로 진행한 작업이 있다면 강조하세요

[내가 사용한 기술 스택]
• 프론트엔드: React, TypeScript, Tailwind CSS
• 백엔드: Node.js, Express
• 데이터베이스: MongoDB
• 기타: Git, Docker 등

[프로젝트 성과]
• 정량적 성과 (예: 사용자 증가율, 성능 개선율 등)
• 정성적 성과 (예: 사용자 만족도 향상, 팀 협업 경험 등)`
  },
  {
    id: 2,
    name: '🎓 학술/연구 프로젝트',
    content: `[연구 주제]
연구 또는 학술 프로젝트의 주제를 입력하세요

[연구 목적 및 배경]
• 왜 이 주제를 선택했는지
• 해결하고자 한 문제가 무엇인지
• 연구의 의의

[연구 방법 및 과정]
• 어떤 방법론을 사용했는지
• 데이터 수집 및 분석 방법
• 연구 진행 과정에서의 어려움과 해결 방법

[연구 결과 및 기여]
• 주요 발견 사항
• 학술적/실용적 기여도
• 향후 발전 가능성`
  },
  {
    id: 3,
    name: '🏆 팀 프로젝트/경진대회',
    content: `[프로젝트/대회명]
프로젝트 또는 참가한 경진대회명을 입력하세요

[팀 구성 및 내 역할]
• 팀 규모 (예: 4명)
• 내 포지션 및 담당 업무
• 리더십 경험이 있다면 강조

[프로젝트 내용]
• 기획 의도 및 목표
• 구현 내용 및 주요 기능
• 차별화 포인트

[성과 및 배운 점]
• 수상 경력 (있다면)
• 프로젝트를 통해 배운 점
• 팀워크 및 협업 경험`
  }
];

// 대외활동 템플릿 (3가지)
const ACTIVITY_TEMPLATES = [
  {
    id: 1,
    name: '🎯 동아리/학회 활동',
    content: `[동아리/학회명]
활동한 동아리 또는 학회의 이름을 입력하세요

[활동 기간 및 역할]
• 활동 기간: 2023.03 ~ 2024.02
• 내 역할: 예) 기획팀장, 운영진, 프로젝트 리더 등

[주요 활동 내용]
• 정기적으로 진행한 활동
• 특별히 기획하거나 참여한 프로젝트
• 대외적인 활동이나 협업 경험

[활동 성과 및 배운 점]
• 활동을 통한 구체적 성과
• 개인적 성장 및 배운 점
• 리더십 또는 협업 경험`
  },
  {
    id: 2,
    name: '💼 인턴/실무 경험',
    content: `[회사/기관명 및 부서]
근무한 회사명과 소속 부서를 입력하세요

[근무 기간 및 직무]
• 근무 기간: 2023.06 ~ 2023.08
• 직무: 예) 마케팅 인턴, 개발 인턴, 기획 인턴 등

[담당 업무 및 프로젝트]
• 주요 업무 내용
• 참여한 프로젝트
• 사용한 도구 및 기술

[성과 및 실무 역량]
• 구체적인 성과 (수치 포함 시 더욱 좋음)
• 습득한 실무 능력
• 조직 생활 및 커뮤니케이션 경험`
  },
  {
    id: 3,
    name: '🌟 봉사/리더십 활동',
    content: `[활동명]
봉사 활동 또는 리더십 프로그램 이름을 입력하세요

[활동 기간 및 역할]
• 활동 기간
• 내 역할 및 책임

[활동 목적 및 내용]
• 활동의 목적과 의의
• 구체적인 활동 내용
• 대상 및 규모

[활동을 통한 성장]
• 사회적 가치 실현 경험
• 리더십 발휘 사례
• 문제 해결 및 소통 능력 향상`
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  // 검색 및 필터링 상태
  const [schoolSearch, setSchoolSearch] = useState('');
  const [majorSearch, setMajorSearch] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showMajorDropdown, setShowMajorDropdown] = useState(false);
  
  // 템플릿 선택 모달 상태
  const [showProjectTemplateModal, setShowProjectTemplateModal] = useState(false);
  const [showActivityTemplateModal, setShowActivityTemplateModal] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number>(-1); // 현재 편집 중인 항목의 인덱스
  
  // Step 1: 기본 정보
  const [step1Data, setStep1Data] = useState({
    job_field: '',
  });

  // Step 2: 학력 및 어학
  const [education, setEducation] = useState({
    school: '',
    major: '',
    gpa: '',
    graduation_status: 'enrolled' as 'graduated' | 'expected' | 'enrolled',
  });
  const [languages, setLanguages] = useState<Partial<Language>[]>([]);
  const [certificates, setCertificates] = useState<Partial<Certificate>[]>([]);

  // Step 3: 경험 및 활동
  const [projects, setProjects] = useState<Partial<Project>[]>([]);
  const [activities, setActivities] = useState<Partial<Activity>[]>([]);
  const [introduction, setIntroduction] = useState('');

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.push('/login');
      return;
    }
    setUserId(id);

    // 드롭다운 외부 클릭 감지
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowSchoolDropdown(false);
        setShowMajorDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [router]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
    window.scrollTo(0, 0);
  };

  const handleStep1Next = () => {
    if (!step1Data.job_field) {
      alert('희망 직무를 선택해주세요.');
      return;
    }
    goToStep(2);
  };

  const handleStep2Next = async () => {
    try {
      // 학력 정보 저장
      if (education.school || education.major) {
        await apiPut('/specs/education', education);
      }

      // 어학 성적 저장
      for (const lang of languages) {
        if (lang.language_type && lang.score) {
          await apiPost('/specs/languages', {
            language_type: lang.language_type,
            score: lang.score,
            acquisition_date: lang.acquisition_date || null,
          });
        }
      }

      // 자격증 저장
      for (const cert of certificates) {
        if (cert.certificate_name) {
          await apiPost('/specs/certificates', {
            certificate_name: cert.certificate_name,
            acquisition_date: cert.acquisition_date || null,
          });
        }
      }

      goToStep(3);
    } catch (error: any) {
      alert('저장 중 오류가 발생했습니다: ' + (error.error || error.message));
    }
  };

  const handleComplete = async () => {
    try {
      // 프로젝트 저장
      for (const proj of projects) {
        if (proj.project_name) {
          await apiPost('/specs/projects', proj);
        }
      }

      // 활동 저장
      for (const act of activities) {
        if (act.activity_name) {
          await apiPost('/specs/activities', act);
        }
      }

      // 사용자 스펙 정보 및 온보딩 완료 저장
      await apiPut('/specs', {
        job_field: step1Data.job_field,
        introduction: introduction,
        onboarding_completed: true,
      });

      goToStep(4);
    } catch (error: any) {
      alert('저장 중 오류가 발생했습니다: ' + (error.error || error.message));
    }
  };

  const addLanguage = () => {
    setLanguages([...languages, { language_type: '', score: '', acquisition_date: '' }]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const addCertificate = () => {
    setCertificates([...certificates, { certificate_name: '', acquisition_date: '' }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: string, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const addProject = () => {
    setProjects([...projects, { project_name: '', role: '', period: '', description: '' }]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: string, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const addActivity = () => {
    setActivities([...activities, { activity_name: '', activity_type: '', period: '', description: '' }]);
  };

  const removeActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const updateActivity = (index: number, field: string, value: string) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value };
    setActivities(updated);
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* 진행도 표시 */}
      <div className="bg-white shadow-sm sticky top-0 z-50 py-6 mb-10 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-center text-xl font-semibold text-gray-900 mb-8">
              프로필 등록
            </h1>
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: '기본정보' },
                { num: 2, label: '학력 & 어학' },
                { num: 3, label: '경험 & 활동' },
                { num: 4, label: '완료' },
              ].map((step, index) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                        currentStep > step.num
                          ? 'bg-blue-600 text-white'
                          : currentStep === step.num
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.num ? '✓' : step.num}
                    </div>
                    <div className={`text-xs mt-2 font-medium ${
                      currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                  </div>
                  {index < 3 && (
                    <div className={`h-px flex-1 mx-4 ${
                      currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 폼 섹션 */}
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Step 1: 기본 정보 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">기본 정보</h2>
              <p className="text-sm text-gray-500">취업 준비를 위한 기본 정보를 입력해주세요</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                  value={userId || ''}
                  readOnly
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  희망 직무 <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={step1Data.job_field}
                  onChange={(e) => setStep1Data({ ...step1Data, job_field: e.target.value })}
                  required
                >
                  <option value="">선택하세요</option>
                  <option value="프론트엔드 개발">프론트엔드 개발</option>
                  <option value="백엔드 개발">백엔드 개발</option>
                  <option value="풀스택 개발">풀스택 개발</option>
                  <option value="데이터 분석">데이터 분석</option>
                  <option value="AI/ML 엔지니어">AI/ML 엔지니어</option>
                  <option value="마케팅">마케팅</option>
                  <option value="기획">기획</option>
                  <option value="디자인">디자인</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button 
                onClick={handleStep1Next} 
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 학력 및 어학 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* 학력 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">학력</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">학교명</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="학교명을 검색하세요"
                    value={education.school}
                    onChange={(e) => {
                      setEducation({ ...education, school: e.target.value });
                      setSchoolSearch(e.target.value);
                      setShowSchoolDropdown(true);
                    }}
                    onFocus={() => setShowSchoolDropdown(true)}
                  />
                  {showSchoolDropdown && schoolSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {UNIVERSITIES.filter(uni => 
                        uni.toLowerCase().includes(schoolSearch.toLowerCase())
                      ).map((uni, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onClick={() => {
                            setEducation({ ...education, school: uni });
                            setSchoolSearch(uni);
                            setShowSchoolDropdown(false);
                          }}
                        >
                          {uni}
                        </div>
                      ))}
                      {UNIVERSITIES.filter(uni => 
                        uni.toLowerCase().includes(schoolSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">전공</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="전공을 검색하세요"
                    value={education.major}
                    onChange={(e) => {
                      setEducation({ ...education, major: e.target.value });
                      setMajorSearch(e.target.value);
                      setShowMajorDropdown(true);
                    }}
                    onFocus={() => setShowMajorDropdown(true)}
                  />
                  {showMajorDropdown && majorSearch && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {MAJORS.filter(major => 
                        major.toLowerCase().includes(majorSearch.toLowerCase())
                      ).map((major, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                          onClick={() => {
                            setEducation({ ...education, major });
                            setMajorSearch(major);
                            setShowMajorDropdown(false);
                          }}
                        >
                          {major}
                        </div>
                      ))}
                      {MAJORS.filter(major => 
                        major.toLowerCase().includes(majorSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          검색 결과가 없습니다
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">학점</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="4.0 / 4.5"
                    value={education.gpa}
                    onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                  <select
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={education.graduation_status}
                    onChange={(e) => setEducation({ ...education, graduation_status: e.target.value as any })}
                  >
                    <option value="enrolled">재학중</option>
                    <option value="expected">졸업예정</option>
                    <option value="graduated">졸업</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 어학 능력 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">어학 능력</h3>
                <div className="text-xs text-gray-500">
                  시험 종류를 선택하세요
                </div>
              </div>
              <div className="space-y-3">
                {languages.map((lang, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative">
                        {lang.language_type && !LANGUAGE_TESTS.includes(lang.language_type) ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="어학 시험명을 입력하세요"
                            value={lang.language_type || ''}
                            onChange={(e) => updateLanguage(index, 'language_type', e.target.value)}
                          />
                        ) : (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={lang.language_type || ''}
                            onChange={(e) => {
                              if (e.target.value === '기타') {
                                updateLanguage(index, 'language_type', '');
                              } else {
                                updateLanguage(index, 'language_type', e.target.value);
                              }
                            }}
                          >
                            <option value="">시험 선택</option>
                            {LANGUAGE_TESTS.map((test, idx) => (
                              <option key={idx} value={test}>{test}</option>
                            ))}
                            <option value="기타">기타 (직접 입력)</option>
                          </select>
                        )}
                      </div>
                      <input
                        type="text"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="점수/등급 (예: 900, IH)"
                        value={lang.score}
                        onChange={(e) => updateLanguage(index, 'score', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={lang.acquisition_date || ''}
                          onChange={(e) => updateLanguage(index, 'acquisition_date', e.target.value)}
                        />
                        <button
                          onClick={() => removeLanguage(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  + 어학 성적 추가
                </button>
              </div>
            </div>

            {/* 자격증 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">자격증</h3>
                <div className="text-xs text-gray-500">
                  자격증을 선택하거나 직접 입력하세요
                </div>
              </div>
              <div className="space-y-3">
                {certificates.map((cert, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="relative">
                        {cert.certificate_name && !CERTIFICATES.includes(cert.certificate_name) ? (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="자격증명을 입력하세요"
                            value={cert.certificate_name || ''}
                            onChange={(e) => updateCertificate(index, 'certificate_name', e.target.value)}
                          />
                        ) : (
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            value={cert.certificate_name || ''}
                            onChange={(e) => {
                              if (e.target.value === '기타') {
                                updateCertificate(index, 'certificate_name', '');
                              } else {
                                updateCertificate(index, 'certificate_name', e.target.value);
                              }
                            }}
                          >
                            <option value="">자격증 선택</option>
                            {CERTIFICATES.map((certName, idx) => (
                              <option key={idx} value={certName}>{certName}</option>
                            ))}
                            <option value="기타">기타 (직접 입력)</option>
                          </select>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={cert.acquisition_date || ''}
                          onChange={(e) => updateCertificate(index, 'acquisition_date', e.target.value)}
                        />
                        <button
                          onClick={() => removeCertificate(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addCertificate}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  + 자격증 추가
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => goToStep(1)} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button 
                onClick={handleStep2Next} 
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 경험 및 활동 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* 프로젝트 경험 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">프로젝트</h3>
                <button
                  onClick={addProject}
                  className="text-xs bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors font-medium"
                >
                  + 등록
                </button>
              </div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-800">
                  💡 <strong>작성 팁:</strong> 프로젝트명, 본인의 역할, 사용한 기술, 구체적인 성과를 포함하면 좋습니다.
                  본문 입력란 오른쪽 버튼으로 템플릿을 선택할 수 있습니다!
                </p>
              </div>
              <div className="space-y-4">
                {projects.map((proj, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="프로젝트명 (예: 웹 커뮤니티 플랫폼 개발)"
                          value={proj.project_name || ''}
                          onChange={(e) => updateProject(index, 'project_name', e.target.value)}
                        />
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="역할 (예: 프론트엔드 개발 담당)"
                          value={proj.role || ''}
                          onChange={(e) => updateProject(index, 'role', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="기간 (예: 2023.03 - 2023.08)"
                          value={proj.period || ''}
                          onChange={(e) => updateProject(index, 'period', e.target.value)}
                        />
                        <button
                          onClick={() => removeProject(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700">프로젝트 설명</label>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentEditIndex(index);
                                setShowProjectTemplateModal(true);
                              }}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors whitespace-nowrap"
                            >
                              📋 템플릿 선택
                            </button>
                          </div>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            rows={6}
                            placeholder="프로젝트 설명 및 성과&#10;&#10;• 사용 기술: React, TypeScript 등&#10;• 주요 역할: UI/UX 개발, API 연동 등&#10;• 성과: 사용자 증가, 성능 개선 등"
                            value={proj.description || ''}
                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addProject}
                  className="w-full py-3 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  + 프로젝트 추가
                </button>
              </div>
            </div>

            {/* 대외활동 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">대외활동</h3>
                <button
                  onClick={addActivity}
                  className="text-xs bg-green-50 text-green-600 px-4 py-2 rounded-md hover:bg-green-100 transition-colors font-medium"
                >
                  + 등록
                </button>
              </div>
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-xs text-green-800">
                  💡 <strong>작성 팁:</strong> 활동명, 기간, 본인의 역할, 활동 내용, 구체적인 성과를 포함하면 좋습니다.
                  본문 입력란 오른쪽 버튼으로 템플릿을 선택할 수 있습니다!
                </p>
              </div>
              <div className="space-y-4">
                {activities.map((act, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="활동명 (예: IT 연합 동아리)"
                          value={act.activity_name || ''}
                          onChange={(e) => updateActivity(index, 'activity_name', e.target.value)}
                        />
                        <select
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          value={act.activity_type || ''}
                          onChange={(e) => updateActivity(index, 'activity_type', e.target.value)}
                        >
                          <option value="">유형 선택</option>
                          <option value="인턴">인턴</option>
                          <option value="공모전">공모전</option>
                          <option value="봉사활동">봉사활동</option>
                          <option value="동아리">동아리</option>
                          <option value="대외활동">대외활동</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          placeholder="기간 (예: 2023.03 ~ 2024.02)"
                          value={act.period || ''}
                          onChange={(e) => updateActivity(index, 'period', e.target.value)}
                        />
                        <button
                          onClick={() => removeActivity(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-700">활동 내용</label>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentEditIndex(index);
                                setShowActivityTemplateModal(true);
                              }}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200 transition-colors whitespace-nowrap"
                            >
                              📋 템플릿 선택
                            </button>
                          </div>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            rows={5}
                            placeholder="활동 내용 및 성과&#10;&#10;• 주요 활동: 스터디, 프로젝트 등&#10;• 본인 역할: 팀장, 개발자 등&#10;• 성과: 수상, 프로젝트 완수 등"
                            value={act.description || ''}
                            onChange={(e) => updateActivity(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addActivity}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 hover:border-green-400 hover:text-green-600 transition-all text-sm font-medium"
                >
                  + 활동 추가
                </button>
              </div>
            </div>

            {/* 자기소개 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">자기소개</h3>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                rows={6}
                placeholder="자신의 강점과 경험을 간단히 소개해주세요"
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>

            <div className="flex justify-between pt-4">
              <button 
                onClick={() => goToStep(2)} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button 
                onClick={handleComplete} 
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 완료 */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow-sm p-12 border border-gray-200 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                등록이 완료되었습니다
              </h2>
              <p className="text-gray-600 mb-8">
                이제 맞춤형 분석 결과를 확인할 수 있습니다
              </p>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              대시보드로 이동
            </button>
          </div>
        )}
      </div>

      {/* 프로젝트 템플릿 선택 모달 */}
      {showProjectTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">프로젝트 템플릿 선택</h3>
              <button
                onClick={() => {
                  setShowProjectTemplateModal(false);
                  setCurrentEditIndex(-1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                프로젝트 유형에 맞는 템플릿을 선택하세요. 선택한 템플릿이 자동으로 입력됩니다.
              </p>
              
              <div className="space-y-4">
                {PROJECT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all cursor-pointer"
                    onClick={() => {
                      if (currentEditIndex >= 0) {
                        updateProject(currentEditIndex, 'description', template.content);
                      }
                      setShowProjectTemplateModal(false);
                      setCurrentEditIndex(-1);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-semibold text-gray-900">{template.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">템플릿 {template.id}</span>
                    </div>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                      {template.content}
                    </pre>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowProjectTemplateModal(false);
                    setCurrentEditIndex(-1);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대외활동 템플릿 선택 모달 */}
      {showActivityTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">대외활동 템플릿 선택</h3>
              <button
                onClick={() => {
                  setShowActivityTemplateModal(false);
                  setCurrentEditIndex(-1);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-6">
                활동 유형에 맞는 템플릿을 선택하세요. 선택한 템플릿이 자동으로 입력됩니다.
              </p>
              
              <div className="space-y-4">
                {ACTIVITY_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-400 transition-all cursor-pointer"
                    onClick={() => {
                      if (currentEditIndex >= 0) {
                        updateActivity(currentEditIndex, 'description', template.content);
                      }
                      setShowActivityTemplateModal(false);
                      setCurrentEditIndex(-1);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-base font-semibold text-gray-900">{template.name}</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">템플릿 {template.id}</span>
                    </div>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded border border-gray-200 max-h-40 overflow-y-auto">
                      {template.content}
                    </pre>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowActivityTemplateModal(false);
                    setCurrentEditIndex(-1);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
