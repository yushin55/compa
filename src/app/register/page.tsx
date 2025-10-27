'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [terms, setTerms] = useState({
    all: false,
    service: false,
    privacy: false,
    marketing: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleAllTerms = (checked: boolean) => {
    setTerms({
      all: checked,
      service: checked,
      privacy: checked,
      marketing: checked,
    });
  };

  const toggleTerm = (term: keyof typeof terms) => {
    const newTerms = { ...terms, [term]: !terms[term] };
    newTerms.all = newTerms.service && newTerms.privacy && newTerms.marketing;
    setTerms(newTerms);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 일치 검증
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 유효성 검증
    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    // 필수 약관 동의 검증
    if (!terms.service || !terms.privacy) {
      setError('필수 약관에 동의해주세요.');
      return;
    }

    setLoading(true);

    try {
      await apiPost('/auth/register', {
        user_id: formData.user_id,
        email: formData.email,
        password: formData.password,
      });

      alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      router.push('/login');
    } catch (err: any) {
      setError(err.error || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark mb-6">
            <span className="text-4xl font-bold text-white">S</span>
          </div>
          <h1 className="text-headline mb-3 text-text-dark">
            스펙체크 회원가입
          </h1>
          <p className="text-body-1 text-text-gray">
            목표를 향한 첫 걸음을 시작하세요
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="alert alert-warning mb-6">
            {error}
          </div>
        )}

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">아이디 *</label>
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
            <label className="form-label">이메일 *</label>
            <input
              type="email"
              className="form-control"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 *</label>
            <input
              type="password"
              className="form-control"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호 확인 *</label>
            <input
              type="password"
              className="form-control"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              required
            />
          </div>

          {/* 약관 동의 */}
          <div className="bg-bg-light rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border-color">
              <input
                type="checkbox"
                id="terms-all"
                checked={terms.all}
                onChange={(e) => toggleAllTerms(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="terms-all" className="font-semibold cursor-pointer">
                전체 약관 동의
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms-service"
                  checked={terms.service}
                  onChange={() => toggleTerm('service')}
                  className="w-4 h-4"
                />
                <label htmlFor="terms-service" className="text-sm cursor-pointer">
                  이용약관 동의 (필수)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms-privacy"
                  checked={terms.privacy}
                  onChange={() => toggleTerm('privacy')}
                  className="w-4 h-4"
                />
                <label htmlFor="terms-privacy" className="text-sm cursor-pointer">
                  개인정보 처리방침 동의 (필수)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms-marketing"
                  checked={terms.marketing}
                  onChange={() => toggleTerm('marketing')}
                  className="w-4 h-4"
                />
                <label htmlFor="terms-marketing" className="text-sm cursor-pointer">
                  마케팅 정보 수신 동의 (선택)
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        {/* 로그인 링크 */}
        <div className="text-center mt-6">
          <p className="text-text-light">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              로그인
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
