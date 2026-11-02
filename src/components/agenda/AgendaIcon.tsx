import type { SVGProps } from 'react';

type IconName = 'search' | 'calendar' | 'clock' | 'chevron' | 'filters' | 'map' | 'grid' | 'sort' | 'close' | 'ticket' | 'accessible' | 'check' | 'info';
type Props = SVGProps<SVGSVGElement> & { name: IconName; size?: number };

export function AgendaIcon({ name, size = 20, ...props }: Props) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const icon = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 15l2 2 5-5" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    filters: <><path d="M4 7h16M4 12h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="white" /><circle cx="15" cy="12" r="2" fill="white" /><circle cx="9" cy="17" r="2" fill="white" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    sort: <><path d="M8 20V4m0 0L5 7m3-3 3 3M16 4v16m0 0-3-3m3 3 3-3" /></>,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    ticket: <><path d="M3 7h18v4a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" /><path d="M12 7v11" strokeDasharray="2 2" /></>,
    accessible: <><circle cx="12" cy="4" r="2" /><path d="M8 9l4 1 5-1M12 10v4l-3 6M12 14l5 6" /><circle cx="11" cy="16" r="6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  }[name];

  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} {...common} {...props}>{icon}</svg>;
}
