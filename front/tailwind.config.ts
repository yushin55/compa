import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3182F6',
        'primary-dark': '#1B64DA',
        'primary-light': '#4593FC',
        secondary: '#00C7AE',
        'secondary-dark': '#00B89F',
        danger: '#F04452',
        warning: '#FFA940',
        'text-dark': '#191F28',
        'text-gray': '#4E5968',
        'text-light': '#8B95A1',
        'bg-light': '#F9FAFB',
        'bg-lighter': '#FFFFFF',
        'border-color': '#E5E8EB',
      },
      boxShadow: {
        toss: '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'toss-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'toss-card': '0 1px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Noto Sans KR"',
          'sans-serif',
        ],
      },
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-2': ['3.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline': ['2.5rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '700' }],
        'title-1': ['2rem', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-2': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-1': ['1.125rem', { lineHeight: '1.7', letterSpacing: '-0.005em' }],
        'body-2': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.005em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },
      scale: {
        '98': '0.98',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
