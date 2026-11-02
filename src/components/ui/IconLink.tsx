import type { ComponentPropsWithoutRef } from 'react';
import { Icon, type IconName } from './Icon';

export type IconLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'children'> & {
  icon: IconName;
  children: string;
};

/** Figma Button/link/l: icono 24, gap 4, texto Geometria Bold 18/26. */
export function IconLink({ icon, children, className = '', ...rest }: IconLinkProps) {
  return (
    <a
      {...rest}
      className={`flex min-h-[26px] items-start gap-1 rounded-[4px] text-[18px] leading-[26px] font-bold text-primary-600 no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${className}`}
    >
      <Icon name={icon} />
      <span className="min-w-0">{children}</span>
    </a>
  );
}
