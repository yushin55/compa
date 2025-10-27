'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getUserId, apiGet, apiPost } from '@/lib/api';
import { JobPosting, UserProgress } from '@/types/api';

// 실제 채용 공고 데이터
const REAL_JOB_POSTINGS = [
  // IT/개발 분야
  {
    id: 'kakao-fe-1',
    company: '카카오',
    title: '프론트엔드 개발자',
    category: 'IT/개발',
    description: '카카오의 다양한 서비스를 함께 만들어갈 프론트엔드 개발자를 모집합니다.',
    logo_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/65240c33017800001.png',
    poster_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/6562f7bc017800001.png',
    url: 'https://careers.kakao.com/jobs',
    is_active: true,
    requirements: [
      { description: 'React, Vue.js 등 프론트엔드 프레임워크 경험 2년 이상', category: '필수', priority: 'required' },
      { description: 'JavaScript/TypeScript 능숙', category: '필수', priority: 'required' },
      { description: 'RESTful API 연동 경험', category: '필수', priority: 'required' },
      { description: '웹 성능 최적화 경험', category: '우대', priority: 'preferred' },
      { description: 'Next.js 사용 경험', category: '우대', priority: 'preferred' },
      { description: '디자인 시스템 구축 경험', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'naver-be-1',
    company: '네이버',
    title: '백엔드 개발자',
    category: 'IT/개발',
    description: '네이버 서비스의 안정적인 운영과 새로운 기능 개발을 담당할 백엔드 개발자를 찾습니다.',
    logo_url: 'https://www.navercorp.com/img/ko/recruit/logo_naver.png',
    poster_url: 'https://recruit.navercorp.com/naver/rcrtReferFriend/images/img_refer_friend.png',
    url: 'https://recruit.navercorp.com/rcrt/list.do',
    is_active: true,
    requirements: [
      { description: 'Java, Spring Framework 경험 3년 이상', category: '필수', priority: 'required' },
      { description: 'RDBMS, NoSQL 활용 경험', category: '필수', priority: 'required' },
      { description: '대용량 트래픽 처리 경험', category: '우대', priority: 'preferred' },
      { description: 'MSA 아키텍처 이해', category: '우대', priority: 'preferred' },
      { description: 'Kafka, Redis 경험', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'coupang-fullstack-1',
    company: '쿠팡',
    title: '풀스택 개발자',
    category: 'IT/개발',
    description: '쿠팡의 이커머스 플랫폼을 함께 발전시킬 풀스택 개발자를 모집합니다.',
    logo_url: 'https://companieslogo.com/img/orig/CPNG-34ede411.png',
    poster_url: 'https://static.coupangcdn.com/image/coupang/common/logo_coupang_w350.png',
    url: 'https://www.coupang.jobs/kr/jobs/',
    is_active: true,
    requirements: [
      { description: 'React, Node.js 개발 경험', category: '필수', priority: 'required' },
      { description: 'AWS 클라우드 서비스 활용', category: '필수', priority: 'required' },
      { description: '데이터베이스 설계 및 최적화', category: '필수', priority: 'required' },
      { description: 'Git 협업 경험', category: '필수', priority: 'required' },
      { description: 'Docker, Kubernetes 경험', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'toss-mobile-1',
    company: '토스',
    title: 'iOS 개발자',
    category: 'IT/개발',
    description: '토스 앱의 최고의 사용자 경험을 만들어갈 iOS 개발자를 찾습니다.',
    logo_url: 'https://static.toss.im/png-icons/logo-toss-blue.png',
    poster_url: 'https://static.toss.im/assets/homepage/tossim/og/toss_og.png',
    url: 'https://toss.im/career/jobs',
    is_active: true,
    requirements: [
      { description: 'Swift/SwiftUI 능숙', category: '필수', priority: 'required' },
      { description: 'iOS 앱 개발 및 배포 경험 2년 이상', category: '필수', priority: 'required' },
      { description: 'MVVM, Clean Architecture 이해', category: '필수', priority: 'required' },
      { description: '성능 최적화 및 디버깅 능력', category: '우대', priority: 'preferred' },
      { description: 'RxSwift, Combine 경험', category: '우대', priority: 'preferred' },
    ]
  },
  
  // 디자인 분야
  {
    id: 'kakao-uiux-1',
    company: '카카오',
    title: 'UX/UI 디자이너',
    category: '디자인',
    description: '사용자 중심의 디자인으로 카카오 서비스를 혁신할 디자이너를 모집합니다.',
    logo_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/65240c33017800001.png',
    poster_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/6562f7bc017800001.png',
    url: 'https://careers.kakao.com/jobs',
    is_active: true,
    requirements: [
      { description: 'Figma, Sketch 등 디자인 툴 능숙', category: '필수', priority: 'required' },
      { description: '사용자 리서치 및 분석 경험 2년 이상', category: '필수', priority: 'required' },
      { description: '프로토타이핑 제작 능력', category: '필수', priority: 'required' },
      { description: '개발자와의 협업 경험', category: '우대', priority: 'preferred' },
      { description: '디자인 시스템 구축 경험', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'naver-graphic-1',
    company: '네이버',
    title: '그래픽 디자이너',
    category: '디자인',
    description: '네이버 브랜드의 시각적 아이덴티티를 만들어갈 그래픽 디자이너를 찾습니다.',
    logo_url: 'https://www.navercorp.com/img/ko/recruit/logo_naver.png',
    poster_url: 'https://recruit.navercorp.com/naver/rcrtReferFriend/images/img_refer_friend.png',
    url: 'https://recruit.navercorp.com/rcrt/list.do',
    is_active: true,
    requirements: [
      { description: 'Adobe Creative Suite 능숙', category: '필수', priority: 'required' },
      { description: '브랜드 디자인 경험 3년 이상', category: '필수', priority: 'required' },
      { description: '타이포그래피 이해', category: '필수', priority: 'required' },
      { description: '포트폴리오 필수', category: '필수', priority: 'required' },
      { description: '모션 그래픽 경험', category: '우대', priority: 'preferred' },
    ]
  },
  
  // 기획 분야
  {
    id: 'toss-pm-1',
    company: '토스',
    title: '프로덕트 매니저',
    category: '기획',
    description: '토스의 혁신적인 금융 서비스를 기획하고 실행할 PM을 모집합니다.',
    logo_url: 'https://static.toss.im/png-icons/logo-toss-blue.png',
    poster_url: 'https://static.toss.im/assets/homepage/tossim/og/toss_og.png',
    url: 'https://toss.im/career/jobs',
    is_active: true,
    requirements: [
      { description: '데이터 기반 의사결정 경험', category: '필수', priority: 'required' },
      { description: 'SQL, 데이터 분석 능력', category: '필수', priority: 'required' },
      { description: '프로덕트 로드맵 수립 경험', category: '필수', priority: 'required' },
      { description: '다양한 팀과의 협업 능력', category: '우대', priority: 'preferred' },
      { description: 'A/B 테스트 설계 및 분석', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'coupang-strategy-1',
    company: '쿠팡',
    title: '비즈니스 전략 기획자',
    category: '기획',
    description: '쿠팡의 비즈니스 성장을 이끌 전략 기획자를 찾습니다.',
    logo_url: 'https://companieslogo.com/img/orig/CPNG-34ede411.png',
    poster_url: 'https://static.coupangcdn.com/image/coupang/common/logo_coupang_w350.png',
    url: 'https://www.coupang.jobs/kr/jobs/',
    is_active: true,
    requirements: [
      { description: '시장 분석 및 리서치 경험', category: '필수', priority: 'required' },
      { description: 'Excel, PowerPoint 능숙', category: '필수', priority: 'required' },
      { description: '전략 수립 및 실행 경험', category: '필수', priority: 'required' },
      { description: '커뮤니케이션 능력', category: '우대', priority: 'preferred' },
    ]
  },
  
  // 마케팅 분야
  {
    id: 'naver-marketing-1',
    company: '네이버',
    title: '디지털 마케터',
    category: '마케팅',
    description: '네이버 서비스의 성장을 이끌 디지털 마케터를 모집합니다.',
    logo_url: 'https://www.navercorp.com/img/ko/recruit/logo_naver.png',
    poster_url: 'https://recruit.navercorp.com/naver/rcrtReferFriend/images/img_refer_friend.png',
    url: 'https://recruit.navercorp.com/rcrt/list.do',
    is_active: true,
    requirements: [
      { description: '퍼포먼스 마케팅 경험 2년 이상', category: '필수', priority: 'required' },
      { description: 'Google Analytics, 광고 플랫폼 활용', category: '필수', priority: 'required' },
      { description: 'A/B 테스트 및 데이터 분석', category: '필수', priority: 'required' },
      { description: '콘텐츠 기획 및 제작', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'kakao-brand-1',
    company: '카카오',
    title: '브랜드 마케터',
    category: '마케팅',
    description: '카카오 브랜드의 가치를 전달할 마케터를 찾습니다.',
    logo_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/65240c33017800001.png',
    poster_url: 'https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/6562f7bc017800001.png',
    url: 'https://careers.kakao.com/jobs',
    is_active: true,
    requirements: [
      { description: '브랜드 캠페인 기획 및 실행', category: '필수', priority: 'required' },
      { description: 'SNS 마케팅 경험', category: '필수', priority: 'required' },
      { description: '크리에이티브 감각', category: '우대', priority: 'preferred' },
      { description: '트렌드 분석 능력', category: '우대', priority: 'preferred' },
    ]
  },
  
  // 데이터 분야
  {
    id: 'toss-data-1',
    company: '토스',
    title: '데이터 분석가',
    category: '데이터',
    description: '데이터로 토스의 비즈니스 인사이트를 발굴할 분석가를 모집합니다.',
    logo_url: 'https://static.toss.im/png-icons/logo-toss-blue.png',
    poster_url: 'https://static.toss.im/assets/homepage/tossim/og/toss_og.png',
    url: 'https://toss.im/career/jobs',
    is_active: true,
    requirements: [
      { description: 'SQL, Python 능숙', category: '필수', priority: 'required' },
      { description: '통계 분석 및 가설 검증', category: '필수', priority: 'required' },
      { description: '데이터 시각화 (Tableau, PowerBI)', category: '우대', priority: 'preferred' },
      { description: '비즈니스 이해도', category: '우대', priority: 'preferred' },
    ]
  },
  {
    id: 'coupang-ml-1',
    company: '쿠팡',
    title: 'ML 엔지니어',
    category: '데이터',
    description: '머신러닝으로 쿠팡의 추천 시스템을 고도화할 엔지니어를 찾습니다.',
    logo_url: 'https://companieslogo.com/img/orig/CPNG-34ede411.png',
    poster_url: 'https://static.coupangcdn.com/image/coupang/common/logo_coupang_w350.png',
    url: 'https://www.coupang.jobs/kr/jobs/',
    is_active: true,
    requirements: [
      { description: 'Python, TensorFlow/PyTorch 경험', category: '필수', priority: 'required' },
      { description: '머신러닝 모델 개발 및 배포', category: '필수', priority: 'required' },
      { description: '추천 시스템 구축 경험 우대', category: '우대', priority: 'preferred' },
      { description: '논문 구현 능력', category: '우대', priority: 'preferred' },
    ]
  },
];

const CATEGORIES = ['전체', 'IT/개발', '디자인', '기획', '마케팅', '데이터'];

// 추천 데이터: 공모전, 자격증, 어학
const RECOMMENDATIONS = {
  contests: [
    { id: 'contest-1', title: '네이버 해커톤 2025', category: 'IT/개발', keywords: ['React', 'Next.js', '프론트엔드', '웹'], deadline: '2025-12-31', url: 'https://d2.naver.com' },
    { id: 'contest-2', title: 'AWS 클라우드 챌린지', category: 'IT/개발', keywords: ['AWS', '클라우드', '인프라', 'Docker'], deadline: '2025-11-30', url: 'https://aws.amazon.com' },
    { id: 'contest-3', title: '카카오 AI 챌린지', category: 'IT/개발', keywords: ['AI', 'ML', '데이터', '알고리즘'], deadline: '2025-12-15', url: 'https://www.kakaocorp.com' },
    { id: 'contest-4', title: '토스 핀테크 아이디어톤', category: 'IT/개발', keywords: ['핀테크', '금융', 'API', 'React'], deadline: '2025-11-20', url: 'https://toss.im' },
    { id: 'contest-5', title: 'UX/UI 디자인 어워드', category: '디자인', keywords: ['UX', 'UI', 'Figma', '디자인'], deadline: '2025-12-10', url: 'https://www.uxaward.com' },
    { id: 'contest-6', title: '빅데이터 분석 경진대회', category: '데이터', keywords: ['데이터', 'SQL', 'Python', '분석'], deadline: '2025-11-25', url: 'https://www.bigdata.com' },
  ],
  certificates: [
    { id: 'cert-1', title: '정보처리기사', category: 'IT/개발', keywords: ['Java', 'Spring', '데이터베이스', '알고리즘'], difficulty: '중', period: '3개월' },
    { id: 'cert-2', title: 'AWS Certified Solutions Architect', category: 'IT/개발', keywords: ['AWS', '클라우드', '인프라'], difficulty: '상', period: '6개월' },
    { id: 'cert-3', title: 'Google Analytics 자격증', category: '마케팅', keywords: ['Analytics', '데이터', '마케팅'], difficulty: '하', period: '1개월' },
    { id: 'cert-4', title: 'ADsP 데이터분석 준전문가', category: '데이터', keywords: ['데이터', 'SQL', '통계', '분석'], difficulty: '중', period: '2개월' },
    { id: 'cert-5', title: 'SQLD SQL 개발자', category: 'IT/개발', keywords: ['SQL', '데이터베이스', 'RDBMS'], difficulty: '중', period: '2개월' },
  ],
  languages: [
    { id: 'lang-1', title: '토익 Speaking IH 이상', test: 'TOEIC Speaking', target: 'IH (130-150)', keywords: ['영어', '회화', '비즈니스'], period: '3개월' },
    { id: 'lang-2', title: '토익 800점 이상', test: 'TOEIC', target: '800+', keywords: ['영어', '독해', '청해'], period: '3개월' },
    { id: 'lang-3', title: 'OPIc IM2 이상', test: 'OPIc', target: 'IM2 이상', keywords: ['영어', '회화', '실전'], period: '2개월' },
    { id: 'lang-4', title: 'JLPT N2 이상', test: 'JLPT', target: 'N2 이상', keywords: ['일본어', 'JLPT'], period: '4개월' },
  ],
};

export default function GoalSettingPage() {
  const router = useRouter();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDetail, setShowJobDetail] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  
  // 추천 시스템 상태
  const [recommendedItems, setRecommendedItems] = useState<{
    contests: typeof RECOMMENDATIONS.contests;
    certificates: typeof RECOMMENDATIONS.certificates;
    languages: typeof RECOMMENDATIONS.languages;
  }>({ contests: [], certificates: [], languages: [] });
  const [selectedRecommendations, setSelectedRecommendations] = useState<string[]>([]);
  const [gapFeedback, setGapFeedback] = useState<{
    required_gaps: string[];
    preferred_gaps: string[];
    action_items: string[];
    timeline: string;
  } | null>(null);

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
      // API에서 데이터를 가져오되, 실패하면 REAL_JOB_POSTINGS 사용
      try {
        const [postings, progress, dashboard] = await Promise.all([
          apiGet<JobPosting[]>('/job-postings'),
          apiGet<UserProgress>('/progress').catch(() => null),
          apiGet<any>('/dashboard').catch(() => null),
        ]);
        setJobPostings(postings.length > 0 ? postings : REAL_JOB_POSTINGS as any);
        setUserProgress(dashboard || progress);
      } catch (error) {
        // API 실패시 실제 공고 데이터 사용
        setJobPostings(REAL_JOB_POSTINGS as any);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectGoal = async (posting: JobPosting) => {
    try {
      // 백엔드 API 사용: 채용 공고에서 목표 자동 생성
      const goal = await apiPost(`/goals/from-job-posting/${posting.id}`, {
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90일 후
      });
      
      console.log('목표 생성 완료 (백엔드 API):', goal);
      
      // 로컬 스토리지에도 저장 (로드맵 페이지에서 즉시 사용할 수 있도록)
      const existingJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
      const newJob = {
        id: posting.id,
        title: posting.title,
        company: posting.company,
        status: '진행중',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        tags: posting.requirements.filter(r => r.priority === 'required').slice(0, 2).map(r => r.description.substring(0, 10)),
        requirements: posting.requirements,
        url: posting.url
      };
      
      // 중복 체크
      const isDuplicate = existingJobs.some((job: any) => job.id === newJob.id);
      if (!isDuplicate) {
        const updatedJobs = [...existingJobs, newJob];
        localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
        
        // CustomEvent 발생시켜 다른 컴포넌트에 알림
        window.dispatchEvent(new CustomEvent('jobPostingsUpdated', { 
          detail: updatedJobs 
        }));
        
        console.log('공고 추가됨:', newJob);
        alert(`"${posting.title}"이(가) 로드맵에 추가되었습니다!\n자동으로 학습 계획도 생성되었습니다.`);
      } else {
        alert('이미 로드맵에 추가된 공고입니다.');
      }
      
      setSelectedJob(posting);
      setShowJobDetail(true);
      
      // 추천 항목 생성
      generateRecommendations(posting);
      
      // 갭 분석 및 피드백 생성
      const feedback = analyzeGapAndGenerateFeedback(posting);
      setGapFeedback(feedback);
    } catch (error) {
      console.error('목표 설정 실패:', error);
      // API 실패시 로컬 스토리지에만 저장
      const existingJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
      const newJob = {
        id: posting.id,
        title: posting.title,
        company: posting.company,
        status: '진행중',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        tags: posting.requirements.filter(r => r.priority === 'required').slice(0, 2).map(r => r.description.substring(0, 10)),
        requirements: posting.requirements,
        url: posting.url
      };
      
      const isDuplicate = existingJobs.some((job: any) => job.id === newJob.id);
      if (!isDuplicate) {
        const updatedJobs = [...existingJobs, newJob];
        localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
        
        // CustomEvent 발생
        window.dispatchEvent(new CustomEvent('jobPostingsUpdated', { 
          detail: updatedJobs 
        }));
        
        console.log('공고 추가됨 (오프라인):', newJob);
        alert(`"${posting.title}"이(가) 로드맵에 추가되었습니다! (오프라인 모드)`);
      } else {
        alert('이미 로드맵에 추가된 공고입니다.');
      }
      
      setSelectedJob(posting);
      setShowJobDetail(true);
      generateRecommendations(posting);
      
      const feedback = analyzeGapAndGenerateFeedback(posting);
      setGapFeedback(feedback);
    }
  };

  // 우대사항 기반 추천 생성
  const generateRecommendations = (posting: JobPosting) => {
    // 우대 요구사항 추출
    const preferredReqs = posting.requirements
      .filter(req => req.priority === 'preferred')
      .map(req => req.description.toLowerCase());
    
    // 키워드 매칭
    const matchScore = (keywords: string[], reqText: string) => {
      return keywords.filter(keyword => 
        reqText.includes(keyword.toLowerCase())
      ).length;
    };
    
    // 공모전 추천 (우대사항 키워드 매칭)
    const matchedContests = RECOMMENDATIONS.contests
      .map(contest => ({
        ...contest,
        score: preferredReqs.reduce((sum, req) => 
          sum + matchScore(contest.keywords, req), 0
        )
      }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // 자격증 추천
    const matchedCertificates = RECOMMENDATIONS.certificates
      .map(cert => ({
        ...cert,
        score: preferredReqs.reduce((sum, req) => 
          sum + matchScore(cert.keywords, req), 0
        )
      }))
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    // 어학 추천 (영어/일본어 우대사항 있으면)
    const hasLanguageReq = preferredReqs.some(req => 
      req.includes('영어') || req.includes('일본어') || req.includes('어학')
    );
    const matchedLanguages = hasLanguageReq 
      ? RECOMMENDATIONS.languages.filter(lang => 
          preferredReqs.some(req => 
            lang.keywords.some(k => req.includes(k.toLowerCase()))
          )
        ).slice(0, 2)
      : [];
    
    setRecommendedItems({
      contests: matchedContests,
      certificates: matchedCertificates,
      languages: matchedLanguages
    });
    setSelectedRecommendations([]);
  };

  // 갭 분석 및 피드백 생성
  const analyzeGapAndGenerateFeedback = (posting: JobPosting) => {
    if (!userProgress) return null;

    const feedback = {
      required_gaps: [] as string[],
      preferred_gaps: [] as string[],
      action_items: [] as string[],
      timeline: '' as string
    };

    // 필수 요건 체크
    const requiredReqs = posting.requirements.filter(r => r.priority === 'required');
    requiredReqs.forEach(req => {
      const desc = req.description.toLowerCase();
      let isMet = false;

      // 전공 체크
      if (desc.includes('전공') || desc.includes('학과')) {
        isMet = userProgress.education?.major !== null;
      }
      // 경험/년차 체크
      else if (desc.includes('년') || desc.includes('경험')) {
        isMet = (userProgress.projects?.length || 0) >= 2;
      }
      // 기술 스택 체크 (프로젝트에서 확인)
      else if (desc.includes('react') || desc.includes('javascript') || desc.includes('typescript')) {
        const hasTechStack = userProgress.projects?.some(p => 
          p.tech_stack?.toLowerCase().includes(desc.split(' ')[0].toLowerCase())
        );
        isMet = hasTechStack || false;
      }

      if (!isMet) {
        feedback.required_gaps.push(req.description);
      }
    });

    // 우대사항 체크
    const preferredReqs = posting.requirements.filter(r => r.priority === 'preferred');
    preferredReqs.forEach(req => {
      const desc = req.description.toLowerCase();
      let isMet = false;

      // 자격증 체크
      if (desc.includes('자격증')) {
        isMet = (userProgress.certificates?.length || 0) > 0;
      }
      // 어학 체크
      else if (desc.includes('토익') || desc.includes('영어') || desc.includes('어학')) {
        isMet = (userProgress.languages?.length || 0) > 0;
      }
      // 수상/공모전 체크
      else if (desc.includes('수상') || desc.includes('공모전')) {
        isMet = userProgress.activities?.some(a => 
          a.activity_type?.includes('공모전') || a.activity_type?.includes('수상')
        ) || false;
      }
      // 기술 스택 체크
      else {
        const hasTechStack = userProgress.projects?.some(p => 
          p.tech_stack?.toLowerCase().includes(desc.split(' ')[0].toLowerCase())
        );
        isMet = hasTechStack || false;
      }

      if (!isMet) {
        feedback.preferred_gaps.push(req.description);
      }
    });

    // 액션 아이템 생성
    if (feedback.required_gaps.length > 0) {
      feedback.action_items.push(`🔴 필수 요건 ${feedback.required_gaps.length}개 부족 - 최우선 보완 필요`);
      feedback.required_gaps.forEach(gap => {
        if (gap.toLowerCase().includes('프로젝트') || gap.toLowerCase().includes('경험')) {
          feedback.action_items.push(`→ ${gap}: 관련 사이드 프로젝트 1-2개 진행 (3-6개월)`);
        } else if (gap.toLowerCase().includes('기술') || gap.toLowerCase().includes('stack')) {
          feedback.action_items.push(`→ ${gap}: 온라인 강의 수강 및 토이 프로젝트 제작 (2-3개월)`);
        } else {
          feedback.action_items.push(`→ ${gap}: 관련 학습 및 경험 쌓기`);
        }
      });
    }

    if (feedback.preferred_gaps.length > 0) {
      feedback.action_items.push(`🟡 우대사항 ${feedback.preferred_gaps.length}개 부족 - 경쟁력 강화 필요`);
      feedback.preferred_gaps.forEach(gap => {
        if (gap.toLowerCase().includes('자격증')) {
          feedback.action_items.push(`→ ${gap}: 관련 자격증 취득 (2-3개월)`);
        } else if (gap.toLowerCase().includes('토익') || gap.toLowerCase().includes('영어')) {
          feedback.action_items.push(`→ ${gap}: 토익/오픽 목표 점수 달성 (2-4개월)`);
        } else if (gap.toLowerCase().includes('공모전') || gap.toLowerCase().includes('수상')) {
          feedback.action_items.push(`→ ${gap}: 관련 공모전 참가 및 수상 목표 (3-6개월)`);
        } else {
          feedback.action_items.push(`→ ${gap}: 관련 프로젝트 또는 스터디 진행`);
        }
      });
    }

    if (feedback.required_gaps.length === 0 && feedback.preferred_gaps.length === 0) {
      feedback.action_items.push('✅ 모든 요건을 충족하고 있습니다!');
      feedback.action_items.push('→ 포트폴리오 정리 및 면접 준비에 집중하세요');
      feedback.timeline = '지원 가능';
    } else {
      const totalMonths = Math.max(
        feedback.required_gaps.length * 2,
        feedback.preferred_gaps.length
      );
      feedback.timeline = `약 ${totalMonths}개월 준비 필요`;
    }

    return feedback;
  };

  const toggleRecommendation = (id: string) => {
    setSelectedRecommendations(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const generateAutoPlan = async () => {
    if (!selectedJob) return;
    
    const userId = getUserId();
    if (!userId) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }
    
    setGeneratingPlan(true);
    try {
      console.log('자동 계획 생성 시작:', selectedJob);
      console.log('사용자 ID:', userId);
      console.log('공고 ID:', selectedJob.id, '타입:', typeof selectedJob.id);
      
      // 1. 먼저 목표 생성 (이미 있으면 기존 목표 사용)
      const goal: any = await apiPost(`/goals/from-job-posting/${selectedJob.id}`, {
        target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      
      console.log('목표 생성 완료:', goal);
      
      // 2. 선택된 추천 항목을 태스크로 변환
      type TaskData = {
        title: string;
        description: string;
        category: string;
        due_date: string;
      };
      
      const recommendedTasks: TaskData[] = selectedRecommendations.map(id => {
        const contest = recommendedItems.contests.find(c => c.id === id);
        if (contest) {
          return {
            title: contest.title,
            description: `마감일: ${contest.deadline}\n${contest.keywords.join(', ')}`,
            category: '공모전',
            due_date: contest.deadline
          };
        }
        
        const cert = recommendedItems.certificates.find(c => c.id === id);
        if (cert) {
          return {
            title: cert.title,
            description: `예상 기간: ${cert.period}, 난이도: ${cert.difficulty}\n${cert.keywords.join(', ')}`,
            category: '자격증',
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }
        
        const lang = recommendedItems.languages.find(l => l.id === id);
        if (lang) {
          return {
            title: lang.title,
            description: `목표: ${lang.target}, 시험: ${lang.test}`,
            category: '어학',
            due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        }
        
        return null;
      }).filter((task): task is TaskData => task !== null);

      // 3. 추천 항목이 있으면 태스크로 추가
      if (recommendedTasks.length > 0) {
        for (const task of recommendedTasks) {
          await apiPost('/tasks', {
            goal_id: goal.id,
            title: task.title,
            description: task.description,
            category: task.category,
            due_date: task.due_date,
            is_completed: false
          });
        }
        console.log('추천 항목 태스크 생성 완료:', recommendedTasks.length);
      }
      
      // 4. localStorage에도 저장 (즉시 반영)
      const existingJobs = JSON.parse(localStorage.getItem('jobPostings') || '[]');
      const newJob = {
        id: selectedJob.id,
        title: selectedJob.title,
        company: selectedJob.company,
        status: '진행중',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR'),
        tags: selectedJob.requirements.filter(r => r.priority === 'required').slice(0, 2).map(r => r.description.substring(0, 10)),
        requirements: selectedJob.requirements,
        url: selectedJob.url
      };
      
      const isDuplicate = existingJobs.some((job: any) => job.id === newJob.id);
      if (!isDuplicate) {
        const updatedJobs = [...existingJobs, newJob];
        localStorage.setItem('jobPostings', JSON.stringify(updatedJobs));
        window.dispatchEvent(new CustomEvent('jobPostingsUpdated', { detail: updatedJobs }));
      }
      
      alert(`✅ 자동 계획이 생성되었습니다!\n- 목표: ${selectedJob.title}\n- 태스크: ${recommendedTasks.length}개\n\n로드맵 페이지에서 확인하세요.`);
      router.push('/roadmap');
    } catch (error) {
      console.error('자동 계획 생성 실패 상세:', error);
      
      let errorMessage = '알 수 없는 오류';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 사용자 등록 안된 경우
        if (errorMessage.includes('user') || errorMessage.includes('foreign key')) {
          errorMessage = `사용자 등록이 필요합니다.\n\n백엔드에 사용자를 먼저 등록해주세요.\n사용자 ID: ${userId}`;
        }
      }
      
      alert(`❌ 계획 생성에 실패했습니다.\n\n${errorMessage}\n\n콘솔(F12)에서 자세한 로그를 확인하세요.`);
    } finally {
      setGeneratingPlan(false);
    }
  };

  const filteredPostings = jobPostings.filter(posting => {
    const matchesCategory = selectedCategory === '전체' || (posting as any).category === selectedCategory;
    const matchesSearch = 
      posting.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      posting.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (posting as any).category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="border-b border-border-color bg-white">
          <div className="max-w-[1600px] mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              목표 설정
            </h1>
            <p className="text-sm text-text-gray">
              관심있는 채용공고를 선택하고 자동으로 학습 계획을 생성하세요
            </p>
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="border-b border-border-color bg-white sticky top-14 z-10">
          <div className="max-w-[1600px] mx-auto px-6">
            <div className="flex gap-1.5 py-3 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-primary text-white shadow-toss-hover'
                      : 'bg-bg-light text-text-gray hover:bg-gray-200'
                  }`}
                >
                  {category}
                  <span className="ml-1.5 text-xs">
                    {category === '전체' 
                      ? jobPostings.length
                      : jobPostings.filter(p => (p as any).category === category).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="max-w-[1600px] mx-auto px-6 py-6">
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
          
          {/* 검색 결과 카운트 */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-text-gray">
              총 <span className="font-bold text-primary">{filteredPostings.length}</span>개의 공고
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-sm text-text-gray hover:text-text-dark"
              >
                검색 초기화
              </button>
            )}
          </div>
        </div>

        {/* 공고 목록 */}
        <div className="max-w-[1600px] mx-auto px-6 pb-16">
          {filteredPostings.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-title-1 font-bold text-text-dark mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-body-2 text-text-gray">
                다른 키워드로 검색해보세요
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredPostings.map((posting) => {
                const gap = userProgress?.gap_analysis?.find(g => g.job_posting_id === posting.id);
                const metCount = gap?.requirements.filter(r => r.is_met).length || 0;
                const totalCount = gap?.requirements.length || 0;
                const matchRate = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;
                const requiredReqs = posting.requirements?.filter(r => (r as any).priority === 'required') || [];
                const preferredReqs = posting.requirements?.filter(r => (r as any).priority === 'preferred') || [];

                return (
                  <div
                    key={posting.id}
                    className="group relative cursor-pointer"
                    onClick={() => {
                      setSelectedJob(posting);
                      setShowJobDetail(true);
                    }}
                  >
                    {/* 메인 카드 */}
                    <div className="relative bg-white rounded-2xl overflow-hidden shadow-md transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:scale-105 group-hover:-translate-y-2">
                      {/* 회사 로고 배경 */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
                        {(posting as any).logo_url && (
                          <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="w-32 h-32 flex items-center justify-center bg-white rounded-2xl shadow-lg p-4">
                              <img
                                src={(posting as any).logo_url}
                                alt={`${posting.company} 로고`}
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `<div class="text-4xl font-bold text-primary">${posting.company[0]}</div>`;
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* 채용중 뱃지 */}
                        {posting.is_active && (
                          <div className="absolute top-4 right-4">
                            <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                              채용중
                            </span>
                          </div>
                        )}

                        {/* 카테고리 뱃지 */}
                        {(posting as any).category && (
                          <div className="absolute bottom-4 left-4">
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-primary text-xs font-bold rounded-full shadow-md">
                              {(posting as any).category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 카드 내용 */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-text-dark mb-2 group-hover:text-primary transition-colors">
                          {posting.company}
                        </h3>
                        <p className="text-base text-text-gray mb-4 font-medium">
                          {posting.title}
                        </p>

                        {/* 필수 요건 미리보기 */}
                        <div className="space-y-2 mb-4">
                          <div className="text-xs font-semibold text-text-dark uppercase tracking-wide">필수 요건</div>
                          {requiredReqs.slice(0, 2).map((req, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-sm text-text-gray">
                              <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="line-clamp-1">{req.description}</span>
                            </div>
                          ))}
                          {requiredReqs.length > 2 && (
                            <div className="text-xs text-primary font-semibold pl-6">
                              +{requiredReqs.length - 2}개 더보기
                            </div>
                          )}
                        </div>

                        {/* 하단 정보 */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs text-text-light">
                            요구사항 {posting.requirements?.length || 0}개
                          </span>
                          <div className="flex items-center gap-1 text-primary">
                            <span className="text-sm font-bold">상세보기</span>
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 호버 시 나타나는 세부사항 오버레이 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-white">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <h4 className="text-lg font-bold mb-3">{posting.company}</h4>
                          <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                            {posting.description}
                          </p>

                          {/* 필수 vs 우대 요약 */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <div className="text-xs text-gray-300 mb-1">필수 요건</div>
                              <div className="text-xl font-bold">{requiredReqs.length}개</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                              <div className="text-xs text-gray-300 mb-1">우대사항</div>
                              <div className="text-xl font-bold">{preferredReqs.length}개</div>
                            </div>
                          </div>

                          {/* 매칭률 */}
                          {gap && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold">나와의 매칭률</span>
                                <span className={`text-lg font-bold ${
                                  matchRate >= 70 ? 'text-green-400' :
                                  matchRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {matchRate}%
                                </span>
                              </div>
                              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-1000 ${
                                    matchRate >= 70 ? 'bg-green-400' :
                                    matchRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${matchRate}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* CTA 버튼 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectGoal(posting);
                            }}
                            className="w-full bg-white text-primary font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            목표로 설정하기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 공고 상세 모달 */}
        {showJobDetail && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* 모달 헤더 */}
              <div className="p-6 border-b border-border-color bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-4">
                  {(selectedJob as any).logo_url && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white shadow-md flex-shrink-0 flex items-center justify-center p-3">
                      <img
                        src={(selectedJob as any).logo_url}
                        alt={`${selectedJob.company} 로고`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-2xl font-bold text-primary">${selectedJob.company[0]}</div>`;
                          }
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-title-1 font-bold text-text-dark mb-1">
                      {selectedJob.company} - {selectedJob.title}
                    </h2>
                    <p className="text-body-2 text-text-gray">
                      채용공고 상세정보 및 스펙 비교 분석
                    </p>
                  </div>
                  <button
                    onClick={() => setShowJobDetail(false)}
                    className="p-2 hover:bg-white rounded-lg transition-all"
                  >
                    <svg className="w-6 h-6 text-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">
                  {/* 스펙 비교 그래프 */}
                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                      <h3 className="text-title-2 font-bold text-text-dark mb-6 flex items-center gap-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        자격요건 충족도 분석
                      </h3>
                      
                      {/* 필수 요건 vs 우대사항 분리 */}
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        {/* 필수 요건 */}
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-text-dark flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              필수 요건
                            </h4>
                            <span className="text-sm font-semibold text-red-600">
                              {selectedJob.requirements.filter(r => (r as any).priority === 'required').length}개
                            </span>
                          </div>
                          <div className="space-y-2">
                            {selectedJob.requirements
                              .filter(r => (r as any).priority === 'required')
                              .map((req, idx) => {
                                // 임시로 랜덤 매칭 생성 (실제로는 userProgress에서 가져와야 함)
                                const isMet = Math.random() > 0.5;
                                return (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    {isMet ? (
                                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    <span className={isMet ? 'text-text-dark' : 'text-text-gray'}>
                                      {req.description}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* 우대사항 */}
                        <div className="bg-white rounded-xl p-5 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-text-dark flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              우대사항
                            </h4>
                            <span className="text-sm font-semibold text-blue-600">
                              {selectedJob.requirements.filter(r => (r as any).priority === 'preferred').length}개
                            </span>
                          </div>
                          <div className="space-y-2">
                            {selectedJob.requirements
                              .filter(r => (r as any).priority === 'preferred')
                              .map((req, idx) => {
                                const isMet = Math.random() > 0.6;
                                return (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    {isMet ? (
                                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                    <span className={isMet ? 'text-text-dark' : 'text-text-gray'}>
                                      {req.description}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>

                      {/* 종합 그래프 */}
                      <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h4 className="font-bold text-text-dark mb-4">종합 매칭률</h4>
                        <div className="space-y-4">
                          {/* 필수요건 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-text-gray">필수 요건 충족률</span>
                              <span className="text-sm font-bold text-red-600">65%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all duration-1000"
                                style={{ width: '65%' }}
                              />
                            </div>
                          </div>

                          {/* 우대사항 */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-text-gray">우대사항 충족률</span>
                              <span className="text-sm font-bold text-blue-600">40%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                                style={{ width: '40%' }}
                              />
                            </div>
                          </div>

                          {/* 전체 */}
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-text-dark">전체 매칭률</span>
                              <span className="text-lg font-bold text-primary">55%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000"
                                style={{ width: '55%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI 피드백 및 액션 플랜 */}
                  {gapFeedback && gapFeedback.action_items.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-title-2 font-bold text-text-dark">AI 갭 분석 & 액션 플랜</h3>
                          <p className="text-sm text-text-gray">현재 스펙 분석 결과 및 개선 방향</p>
                        </div>
                        <div className="ml-auto bg-white px-4 py-2 rounded-full border-2 border-purple-300">
                          <span className="text-sm font-bold text-purple-600">{gapFeedback.timeline}</span>
                        </div>
                      </div>

                      {/* 부족한 요건 요약 */}
                      {(gapFeedback.required_gaps.length > 0 || gapFeedback.preferred_gaps.length > 0) && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          {gapFeedback.required_gaps.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold text-red-700">필수 요건 부족</span>
                              </div>
                              <div className="text-2xl font-bold text-red-600">{gapFeedback.required_gaps.length}개</div>
                            </div>
                          )}
                          {gapFeedback.preferred_gaps.length > 0 && (
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold text-yellow-700">우대사항 부족</span>
                              </div>
                              <div className="text-2xl font-bold text-yellow-600">{gapFeedback.preferred_gaps.length}개</div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 액션 아이템 */}
                      <div className="bg-white rounded-lg p-5 space-y-3">
                        <h4 className="font-bold text-text-dark flex items-center gap-2">
                          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                          구체적인 액션 플랜
                        </h4>
                        <div className="space-y-2">
                          {gapFeedback.action_items.map((item, idx) => (
                            <div 
                              key={idx}
                              className={`p-3 rounded-lg ${
                                item.startsWith('🔴') ? 'bg-red-50 border border-red-200' :
                                item.startsWith('🟡') ? 'bg-yellow-50 border border-yellow-200' :
                                item.startsWith('✅') ? 'bg-green-50 border border-green-200' :
                                'bg-gray-50'
                              }`}
                            >
                              <p className={`text-sm ${
                                item.startsWith('→') ? 'pl-4 text-text-gray' : 'font-semibold text-text-dark'
                              }`}>
                                {item}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 빠른 시작 버튼 */}
                      {gapFeedback.action_items.length > 1 && !gapFeedback.action_items[0].includes('✅') && (
                        <div className="mt-4 p-4 bg-primary bg-opacity-10 rounded-lg border-2 border-primary border-opacity-30">
                          <p className="text-sm text-primary font-semibold mb-2">
                            💡 아래 추천 항목을 선택하면 액션 플랜이 자동으로 로드맵에 추가됩니다
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 공고 설명 */}
                  {selectedJob.description && (
                    <div>
                      <h3 className="text-title-2 font-bold text-text-dark mb-4">포지션 소개</h3>
                      <p className="text-body-1 text-text-gray whitespace-pre-line bg-gray-50 p-5 rounded-xl">
                        {selectedJob.description}
                      </p>
                    </div>
                  )}

                  {/* 원본 공고 링크 */}
                  {selectedJob.url && (
                    <div className="bg-primary bg-opacity-5 rounded-xl p-6 border-2 border-primary border-opacity-20">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-text-dark mb-1">원본 채용 공고 확인</h4>
                          <p className="text-sm text-text-gray">
                            자세한 내용은 회사 공식 채용 페이지에서 확인하세요
                          </p>
                        </div>
                        <a
                          href={selectedJob.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary flex items-center gap-2"
                        >
                          공고 보기
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 추천 항목 */}
                  {(recommendedItems.contests.length > 0 || 
                    recommendedItems.certificates.length > 0 || 
                    recommendedItems.languages.length > 0) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <h3 className="text-title-2 font-bold text-text-dark">맞춤 추천</h3>
                        <span className="text-sm text-text-gray">우대사항 기반 추천</span>
                      </div>

                      {/* 공모전 추천 */}
                      {recommendedItems.contests.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                          <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            추천 공모전 ({recommendedItems.contests.length})
                          </h4>
                          <div className="space-y-2">
                            {recommendedItems.contests.map((contest) => (
                              <label
                                key={contest.id}
                                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecommendations.includes(contest.id)}
                                  onChange={() => toggleRecommendation(contest.id)}
                                  className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-text-dark">{contest.title}</div>
                                  <div className="text-xs text-text-gray mt-1">
                                    마감: {contest.deadline}
                                  </div>
                                  <div className="text-xs text-blue-600 mt-1">
                                    {contest.keywords.join(', ')}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 자격증 추천 */}
                      {recommendedItems.certificates.length > 0 && (
                        <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                          <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            추천 자격증 ({recommendedItems.certificates.length})
                          </h4>
                          <div className="space-y-2">
                            {recommendedItems.certificates.map((cert) => (
                              <label
                                key={cert.id}
                                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100 hover:border-purple-300 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecommendations.includes(cert.id)}
                                  onChange={() => toggleRecommendation(cert.id)}
                                  className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-text-dark">{cert.title}</div>
                                  <div className="text-xs text-text-gray mt-1">
                                    난이도: {cert.difficulty} | 예상 기간: {cert.period}
                                  </div>
                                  <div className="text-xs text-purple-600 mt-1">
                                    {cert.keywords.join(', ')}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 어학 추천 */}
                      {recommendedItems.languages.length > 0 && (
                        <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                          <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z" clipRule="evenodd" />
                            </svg>
                            추천 어학 시험 ({recommendedItems.languages.length})
                          </h4>
                          <div className="space-y-2">
                            {recommendedItems.languages.map((lang) => (
                              <label
                                key={lang.id}
                                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 hover:border-green-300 cursor-pointer transition-all"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecommendations.includes(lang.id)}
                                  onChange={() => toggleRecommendation(lang.id)}
                                  className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded"
                                />
                                <div className="flex-1">
                                  <div className="font-semibold text-text-dark">{lang.title}</div>
                                  <div className="text-xs text-text-gray mt-1">
                                    목표: {lang.target} | 예상 기간: {lang.period}
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    {lang.test}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedRecommendations.length > 0 && (
                        <div className="bg-primary bg-opacity-10 rounded-xl p-4 border-2 border-primary border-opacity-30">
                          <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {selectedRecommendations.length}개 항목 선택됨 - 자동 계획 생성 시 로드맵에 추가됩니다
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="p-6 border-t border-border-color flex items-center justify-end gap-3 bg-bg-light">
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
        )}
      </div>
    </>
  );
}
