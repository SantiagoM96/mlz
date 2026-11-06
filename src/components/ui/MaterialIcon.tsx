import type { CSSProperties } from 'react';

/**
 * Material Symbols Outlined, fuente oficial de Google distribuida localmente.
 * Los iconos del UI Kit utilizan este componente, nunca SVG dibujados a mano.
 * Los logotipos de marcas e institucionales se gestionan por separado.
 */
export type MaterialIconName =
  | 'bookmark'
  | 'chevron_right'
  | 'arrow_forward'
  | 'arrow_back'
  | 'menu'
  | 'close'
  | 'search'
  | 'calendar_month'
  | 'event_available'
  | 'schedule'
  | 'expand_more'
  | 'filter_list'
  | 'tune'
  | 'map'
  | 'location_on'
  | 'grid_view'
  | 'sort'
  | 'swap_vert'
  | 'confirmation_number'
  | 'accessible_forward'
  | 'accessible'
  | 'rainy'
  | 'comedy_mask'
  | 'check'
  | 'link'
  | 'content_copy'
  | 'add'
  | 'edit'
  | 'delete'
  | 'groups'
  | 'record_voice_over'
  | 'star'
  | 'info';

export type MaterialIconProps = {
  name: MaterialIconName;
  size?: number;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  filled?: boolean;
  className?: string;
};

export function MaterialIcon({
  name,
  size = 24,
  weight = 400,
  filled = false,
  className = '',
}: MaterialIconProps) {
  const style: CSSProperties = {
    fontSize: size,
    width: size,
    height: size,
    fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${Math.max(20, Math.min(48, size))}`,
  };

  return (
    <span
      aria-hidden="true"
      data-material-symbol={name}
      className={`material-symbols-outlined inline-flex shrink-0 select-none items-center justify-center overflow-hidden align-middle leading-none ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}
