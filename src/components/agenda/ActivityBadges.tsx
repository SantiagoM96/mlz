import type { AgendaActivity } from '../../data/agenda';
import { MaterialIcon } from '../ui/MaterialIcon';

const styles: Record<AgendaActivity['badges'][number]['kind'], string> = {
  rain: 'bg-[#e5f0ff] text-[#006eff]',
  accessible: 'bg-[#ecddff] text-[#9747ff]',
  registration: 'bg-[#fff7dd] text-[#f59c00]',
  featured: 'bg-[#ecddff] text-[#9747ff]',
};

export function ActivityBadges({ badges, variant = 'default' }: { badges: AgendaActivity['badges']; variant?: 'default' | 'summary' }) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Características de la actividad">
      {badges.map((badge) => (
        <span
          key={badge.kind}
          data-agenda-chip="activity"
          className={`inline-flex min-w-0 items-center gap-1.5 rounded-[6px] font-medium ${variant === 'summary' ? 'min-h-[30px] max-w-full px-[10px] py-1 text-[18px] leading-[22px]' : 'min-h-6 max-w-full px-2 py-0.5 text-[16px] leading-5'} ${styles[badge.kind]}`}
        >
          <MaterialIcon
            name={
              badge.kind === 'accessible' ? 'accessible_forward'
                : badge.kind === 'featured' ? 'star'
                : badge.kind === 'rain' ? 'rainy'
                : 'confirmation_number'
            }
            size={variant === 'summary' ? 20 : badge.kind === 'rain' ? 18 : 16}
          />
          {badge.label}
        </span>
      ))}
    </div>
  );
}
