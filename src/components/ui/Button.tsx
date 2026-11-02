import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
  title?: string;
};

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700',
  secondary: 'bg-primary-500 text-white hover:bg-primary-600',
  success: 'bg-success-500 text-white hover:bg-success-600',
} as const;

export function Button({ children, href, disabled = false, variant = 'primary', className = '', title }: ButtonProps) {
  const classes = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-[4px] px-6 py-2.5 text-[18px] leading-[26px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 ' + variants[variant] + ' ' + className;
  if (href && !disabled) return <a className={classes} href={href} title={title}>{children}</a>;
  return <button className={classes + (disabled ? ' cursor-not-allowed opacity-75' : '')} type="button" disabled={disabled} title={title}>{children}</button>;
}
