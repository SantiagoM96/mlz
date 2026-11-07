import type { ReactNode } from 'react';

// Estilos de la consola existente: conservar el radio 4px del formulario.
// Los controles del editor de programaciones usan un radio distinto.
export const inputClass = 'min-h-12 w-full min-w-0 rounded-[4px] border border-[#93bfe0] bg-white px-4 py-2.5 text-[16px] leading-6 text-[#236999] outline-none transition-colors placeholder:text-[#8baac3] focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-[#236999]/20';
export const labelClass = 'mb-1.5 block text-[16px] font-bold leading-6 text-primary-600';
export const noteClass = 'mt-2 text-[14px] leading-[21px] text-[#718092]';

export function FormField({ label, htmlFor, children, hint }: {
  label: string; htmlFor: string; children: ReactNode; hint?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass} htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p className={noteClass}>{hint}</p>}
    </div>
  );
}

export function SectionTitle({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[24px] font-bold leading-[30px] text-primary-600">
        {number}. {title}
      </h2>
      {subtitle && <p className="mt-1 text-[16px] leading-6 text-grey-900">{subtitle}</p>}
    </div>
  );
}
