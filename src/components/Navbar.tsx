'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearUserId, getUserId } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getUserId());
  }, []);

  const handleLogout = () => {
    clearUserId();
    router.push('/login');
  };

  // 로그인하지 않은 페이지에서는 네비게이션 바를 표시하지 않음
  if (!isLoggedIn) {
    return null;
  }

  return (
    <nav className="bg-white/95 backdrop-blur-lg border-b border-border-color sticky top-0 z-50 transition-all">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/roadmap" className="text-lg font-bold text-text-dark flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-base font-bold text-white">S</span>
            </div>
            <span>스펙체크</span>
          </Link>
          
          <div className="flex items-center gap-1.5">
            <Link
              href="/roadmap"
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                pathname === '/roadmap' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-text-gray hover:text-text-dark hover:bg-bg-light'
              }`}
            >
              로드맵
            </Link>
            <Link
              href="/dashboard"
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                pathname === '/dashboard' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-text-gray hover:text-text-dark hover:bg-bg-light'
              }`}
            >
              스펙체크
            </Link>
            <Link
              href="/goal-setting"
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                pathname === '/goal-setting' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-text-gray hover:text-text-dark hover:bg-bg-light'
              }`}
            >
              목표 설정
            </Link>
            <Link
              href="/experience"
              className={`px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                pathname === '/experience' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-text-gray hover:text-text-dark hover:bg-bg-light'
              }`}
            >
              나의 경험
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-lg font-semibold text-sm text-text-gray hover:text-danger hover:bg-red-50 transition-all ml-1.5"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
