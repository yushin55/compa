import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-border-color py-20">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <h1 className="text-display-2 mb-4 text-text-dark animate-fade-in">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-1 text-text-gray animate-slide-up">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
