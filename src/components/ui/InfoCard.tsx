import { useId, type ReactNode } from 'react';

export interface InfoCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** SimpleCard de Figma: padding 24, gap 16, radius 4, título 24/30. */
export function InfoCard({ title, children, className = '' }: InfoCardProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className={`flex flex-col gap-4 rounded-[4px] bg-panel p-6 ${className}`}
    >
      <h2 id={headingId} className="text-[24px] leading-[30px] font-bold text-primary-600">
        {title}
      </h2>
      {children}
    </section>
  );
}
