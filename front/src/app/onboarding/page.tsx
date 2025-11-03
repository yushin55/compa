'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserId, apiPut, apiPost, apiDelete } from '@/lib/api';
import { Education, Language, Certificate, Project, Activity } from '@/types/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
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
    <div className="min-h-screen bg-bg-light py-8">
      {/* 진행도 표시 */}
      <div className="bg-white shadow-card sticky top-0 z-50 py-6 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: '기본정보' },
              { num: 2, label: '학력/어학' },
              { num: 3, label: '경험/활동' },
              { num: 4, label: '완료' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      currentStep > step.num
                        ? 'bg-secondary text-white'
                        : currentStep === step.num
                        ? 'bg-primary text-white'
                        : 'bg-border-color text-text-light'
                    }`}
                  >
                    {step.num}
                  </div>
                  <div className="text-sm mt-2 font-medium">{step.label}</div>
                </div>
                {index < 3 && (
                  <div className={`h-0.5 flex-1 mx-2 ${currentStep > step.num ? 'bg-secondary' : 'bg-border-color'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 폼 섹션 */}
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Step 1: 기본 정보 */}
        {currentStep === 1 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-6">기본 정보</h2>
            
            <div className="form-group">
              <label className="form-label">이메일 주소</label>
              <input
                type="email"
                className="form-control"
                value={userId}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">희망 직무 분야 *</label>
              <select
                className="form-control"
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

            <div className="flex justify-end mt-8">
              <button onClick={handleStep1Next} className="btn btn-primary">
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 학력 및 어학 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* 학력 정보 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">📚 학력 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">학교명</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="예: 서울대학교"
                    value={education.school}
                    onChange={(e) => setEducation({ ...education, school: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">전공</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="예: 컴퓨터공학과"
                    value={education.major}
                    onChange={(e) => setEducation({ ...education, major: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">학점</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="예: 4.0 / 4.5"
                    value={education.gpa}
                    onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">졸업 여부</label>
                  <select
                    className="form-control"
                    value={education.graduation_status}
                    onChange={(e) => setEducation({ ...education, graduation_status: e.target.value as any })}
                  >
                    <option value="enrolled">재학 중</option>
                    <option value="expected">졸업 예정</option>
                    <option value="graduated">졸업</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 어학 능력 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">🌐 어학 능력</h3>
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <div key={index} className="bg-bg-light p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="어학 종류 (예: TOEIC)"
                        value={lang.language_type}
                        onChange={(e) => updateLanguage(index, 'language_type', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="점수"
                        value={lang.score}
                        onChange={(e) => updateLanguage(index, 'score', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="form-control flex-1"
                          value={lang.acquisition_date || ''}
                          onChange={(e) => updateLanguage(index, 'acquisition_date', e.target.value)}
                        />
                        <button
                          onClick={() => removeLanguage(index)}
                          className="btn btn-danger"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addLanguage}
                  className="w-full py-3 border-2 border-dashed border-border-color rounded-lg text-text-light hover:border-primary hover:text-primary transition-colors"
                >
                  + 어학 성적 추가
                </button>
              </div>
            </div>

            {/* 자격증 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">🏆 자격증</h3>
              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <div key={index} className="bg-bg-light p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="자격증명"
                        value={cert.certificate_name || ''}
                        onChange={(e) => updateCertificate(index, 'certificate_name', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          className="form-control flex-1"
                          value={cert.acquisition_date || ''}
                          onChange={(e) => updateCertificate(index, 'acquisition_date', e.target.value)}
                        />
                        <button
                          onClick={() => removeCertificate(index)}
                          className="btn btn-danger"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addCertificate}
                  className="w-full py-3 border-2 border-dashed border-border-color rounded-lg text-text-light hover:border-primary hover:text-primary transition-colors"
                >
                  + 자격증 추가
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => goToStep(1)} className="btn btn-outline">
                이전
              </button>
              <button onClick={handleStep2Next} className="btn btn-primary">
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 경험 및 활동 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* 프로젝트 경험 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">💼 프로젝트 경험</h3>
              <div className="space-y-4">
                {projects.map((proj, index) => (
                  <div key={index} className="bg-bg-light p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="프로젝트명"
                        value={proj.project_name || ''}
                        onChange={(e) => updateProject(index, 'project_name', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="역할"
                        value={proj.role || ''}
                        onChange={(e) => updateProject(index, 'role', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="기간 (예: 2023.03 - 2023.08)"
                        value={proj.period || ''}
                        onChange={(e) => updateProject(index, 'period', e.target.value)}
                      />
                      <button
                        onClick={() => removeProject(index)}
                        className="btn btn-danger"
                      >
                        삭제
                      </button>
                    </div>
                    <textarea
                      className="form-control mt-4"
                      rows={3}
                      placeholder="프로젝트 설명"
                      value={proj.description || ''}
                      onChange={(e) => updateProject(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
                <button
                  onClick={addProject}
                  className="w-full py-3 border-2 border-dashed border-border-color rounded-lg text-text-light hover:border-primary hover:text-primary transition-colors"
                >
                  + 프로젝트 추가
                </button>
              </div>
            </div>

            {/* 대외활동 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">🎯 대외활동</h3>
              <div className="space-y-4">
                {activities.map((act, index) => (
                  <div key={index} className="bg-bg-light p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="활동명"
                        value={act.activity_name || ''}
                        onChange={(e) => updateActivity(index, 'activity_name', e.target.value)}
                      />
                      <select
                        className="form-control"
                        value={act.activity_type || ''}
                        onChange={(e) => updateActivity(index, 'activity_type', e.target.value)}
                      >
                        <option value="">활동 유형 선택</option>
                        <option value="인턴">인턴</option>
                        <option value="공모전">공모전</option>
                        <option value="봉사활동">봉사활동</option>
                        <option value="동아리">동아리</option>
                        <option value="대외활동">대외활동</option>
                        <option value="기타">기타</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="기간 (예: 2022.03 - 현재)"
                        value={act.period || ''}
                        onChange={(e) => updateActivity(index, 'period', e.target.value)}
                      />
                      <button
                        onClick={() => removeActivity(index)}
                        className="btn btn-danger"
                      >
                        삭제
                      </button>
                    </div>
                    <textarea
                      className="form-control mt-4"
                      rows={2}
                      placeholder="활동 설명"
                      value={act.description || ''}
                      onChange={(e) => updateActivity(index, 'description', e.target.value)}
                    />
                  </div>
                ))}
                <button
                  onClick={addActivity}
                  className="w-full py-3 border-2 border-dashed border-border-color rounded-lg text-text-light hover:border-primary hover:text-primary transition-colors"
                >
                  + 활동 추가
                </button>
              </div>
            </div>

            {/* 자기소개 */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">✍️ 자기소개</h3>
              <textarea
                className="form-control"
                rows={6}
                placeholder="자신을 어필할 수 있는 핵심 역량 및 경험을 간략히 기술해주세요."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => goToStep(2)} className="btn btn-outline">
                이전
              </button>
              <button onClick={handleComplete} className="btn btn-secondary">
                완료
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 완료 */}
        {currentStep === 4 && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">스펙 등록 완료!</h2>
            <p className="text-text-light mb-8 text-lg">
              입력하신 스펙을 바탕으로 맞춤형 분석을 제공합니다.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-secondary px-12"
            >
              내 스펙 분석 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
