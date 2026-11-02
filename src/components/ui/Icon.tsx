import type { CSSProperties } from 'react';

export type IconName = 'bookmark' | 'chevron-right' | 'instagram';

export interface IconProps {
  name: IconName;
  size?: 20 | 24;
  className?: string;
}

/**
 * Iconos exportados de los componentes originales de Figma.
 * CSS mask permite heredar currentColor y usar tokens del Design System.
 */
export function Icon({ name, size = 24, className = '' }: IconProps) {
  const src = import.meta.env.BASE_URL + 'assets/icons/' + name + '.svg';
  const maskStyle: CSSProperties = {
    maskImage: `url("${src}")`,
    WebkitMaskImage: `url("${src}")`,
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
  };

  return (
    <span
      aria-hidden="true"
      data-icon={name}
      className={`inline-block shrink-0 bg-current ${size === 24 ? 'size-6' : 'size-5'} ${className}`}
      style={maskStyle}
    />
  );
}
