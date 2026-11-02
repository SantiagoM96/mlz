import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';

/** Los chips de actividad comparten Info 500 + blanco en todas sus variantes de Figma. */
export function ActivityBadges({ badges }: { badges: AgendaActivity['badges'] }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Características de la actividad">
      {badges.map((badge) => (
        <span
          key={badge.kind}
          data-agenda-chip="activity"
          className="inline-flex min-h-6 items-center gap-1 rounded-[6px] bg-info-500 px-[6px] py-0.5 text-sm font-medium text-white"
        >
          <MaterialIcon
            name={
              badge.kind === 'accessible' ? 'accessible_forward'
                : badge.kind === 'featured' ? 'star'
                : badge.kind === 'rain' ? 'rainy'
                : 'confirmation_number'
            }
            size={16}
          />
          {badge.label}
        </span>
      ))}
    </div>
  );
}
