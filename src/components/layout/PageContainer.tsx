import type { ReactNode } from 'react';

/**
 * Contenedor institucional compartido: ancho máximo total de 1200px.
 * En pantallas chicas conserva el gutter, y desde 1232px usa los 1200px completos.
 */
export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      data-layout-container="true"
      className={'mx-auto w-full max-w-[1200px] px-4 min-[1232px]:px-0 ' + className}
    >
      {children}
    </div>
  );
}
