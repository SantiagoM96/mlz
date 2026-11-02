import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';

const styles: Record<AgendaActivity['badges'][number]['kind'], string> = {
  rain: 'bg-[#e5f0ff] text-[#006eff]',
  accessible: 'bg-[#ecddff] text-[#9747ff]',
  registration: 'bg-[#fff7dd] text-[#f59c00]',
  featured: 'bg-[#ecddff] text-[#9747ff]',
};

export function ActivityBadges({ badges }: { badges: AgendaActivity['badges'] }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Características de la actividad">
      {badges.map((badge) => (
        <span
          key={badge.kind}
          data-agenda-chip="activity"
          className={`inline-flex min-h-6 items-center gap-1 rounded-[6px] px-[6px] py-0.5 text-sm font-medium ${styles[badge.kind]}`}
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
