import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';

const styles: Record<AgendaActivity['badges'][number]['kind'], string> = {
  rain: 'bg-[#e5f0ff] text-[#006eff]',
  accessible: 'bg-[#ecddff] text-[#9747ff]',
  registration: 'bg-[#fff7dd] text-[#f59c00]',
  featured: 'bg-[#ecddff] text-[#9747ff]',
};

export function ActivityBadges({ badges, variant = 'default' }: {
  badges: AgendaActivity['badges'];
  variant?: 'default' | 'summary';
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Características de la actividad">
      {badges.map(badge => {
        const isSummary = variant === 'summary';
        // En Figma, el contenedor del ícono mide 18 px (lluvia) o 16 px
        // (otras chips); el pictograma ocupa un poco menos y queda centrado.
        const iconSize = isSummary ? 20 : badge.kind === 'rain' ? 18 : 16;
        const iconName = badge.kind === 'accessible' ? 'accessible'
          : badge.kind === 'featured' ? 'star'
            : badge.kind === 'rain' ? 'rainy'
              : 'confirmation_number';

        return (
          <span
            key={badge.kind}
            data-agenda-chip="activity"
            data-agenda-chip-kind={badge.kind}
            className={`inline-flex min-w-0 max-w-full items-center gap-[6px] rounded-[6px] font-medium ${isSummary
              ? 'min-h-[30px] px-[10px] py-1 text-[18px] leading-[22px]'
              : 'min-h-6 py-0 text-[16px] leading-5 ' + (badge.kind === 'rain' ? 'px-2' : 'px-[6px]')
            } ${styles[badge.kind]}`}
          >
            <span
              data-agenda-chip-icon
              aria-hidden="true"
              className="inline-flex shrink-0 items-center justify-center"
              style={{ width: iconSize, height: iconSize }}
            >
              <MaterialIcon
                name={iconName}
                size={iconSize}
                className={isSummary ? '' : 'scale-90'}
              />
            </span>
            <span data-agenda-chip-label className={isSummary ? "min-w-0 break-words leading-[22px]" : "min-w-0 break-words leading-5"}>
              {badge.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}
