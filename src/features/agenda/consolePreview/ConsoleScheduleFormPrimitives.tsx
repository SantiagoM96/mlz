import type { ReactNode } from 'react';
import { labelClass } from './ConsoleFormPrimitives';

// El modal usa radio 6px, distinto del formulario general (4px): conservarlo.
export const inputClass = 'min-h-12 w-full min-w-0 rounded-[6px] border border-[#93bfe0] bg-white px-4 py-2.5 text-[16px] leading-6 text-[#236999] outline-none placeholder:text-[#8baac3] focus-visible:border-primary-600 focus-visible:ring-2 focus-visible:ring-[#236999]/20';

export function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div className="min-w-0">
    <label htmlFor={id} className={labelClass}>{label}</label>
    {children}
  </div>;
}
