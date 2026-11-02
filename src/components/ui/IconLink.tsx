import type { ComponentPropsWithoutRef } from 'react';
import { MaterialIcon, type MaterialIconName } from './MaterialIcon';

export type IconLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'children'> & {
  icon?: MaterialIconName;
  /** Los símbolos institucionales o logotipos de redes NO son iconos de Material Symbols. */
  brandIcon?: 'instagram';
  children: string;
};

export function IconLink({
  icon,
  brandIcon,
  children,
  className = '',
  ...rest
}: IconLinkProps) {
  return (
    <a
      {...rest}
      className={`flex min-h-[26px] items-start gap-1 rounded-[4px] text-[18px] leading-[26px] font-bold text-primary-600 no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ${className}`}
    >
      {brandIcon ? (
        <img
          data-brand-icon={brandIcon}
          src={import.meta.env.BASE_URL + 'assets/icons/' + brandIcon + '.svg'}
          alt=""
          aria-hidden="true"
          width="24"
          height="24"
          className="size-6 shrink-0"
        />
      ) : icon ? (
        <MaterialIcon name={icon} size={24} />
      ) : null}
      <span className="min-w-0">{children}</span>
    </a>
  );
}
