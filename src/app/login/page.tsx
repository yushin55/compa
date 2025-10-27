'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost, setUserId } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiPost<{
        message: string;
        user_id: string;
        onboarding_completed: boolean;
      }>('/auth/login', formData);

      // 로그인 성공 - user_id 저장
      setUserId(response.user_id);

      // 온보딩 완료 여부에 따라 리다이렉트
      if (response.onboarding_completed) {
        router.push('/roadmap');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.error || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mb-6">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <h1 className="text-headline mb-3 text-text-dark">
            스펙체크
          </h1>
          <p className="text-body-1 text-text-gray">
            목표를 향한 가장 스마트한 발걸음
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-warning mb-6">
            {error}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input
              type="text"
              className="form-control"
              placeholder="아이디를 입력하세요"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-control"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {/* 회원가입 링크 */}
        <div className="text-center mt-6">
          <p className="text-text-light">
            아직 회원이 아니신가요?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </div>

        {/* 랜딩 페이지로 돌아가기 */}
        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-text-light hover:text-primary">
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
