import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '스텝업 - 맞춤형 취업 로드맵 설계 서비스',
  description: '당신의 스펙, 목표를 향한 가장 스마트한 발걸음',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
