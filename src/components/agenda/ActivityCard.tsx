import type { AgendaActivity } from '../../data/agenda';
import { AgendaIcon } from './AgendaIcon';

const styles = {
  rain: 'bg-[#e5f0ff] text-[#006eff]',
  accessible: 'bg-[#ecddff] text-[#9747ff]',
  registration: 'bg-[#fff7dd] text-[#f59c00]',
} as const;

export function ActivityCard({ activity, onOpen }: { activity: AgendaActivity; onOpen: (activity: AgendaActivity) => void }) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e7e7e7] bg-white" data-testid="agenda-card">
      <img src={activity.image} alt="" className="h-[154px] w-full object-cover" loading="lazy" />
      <div className="flex flex-1 flex-col gap-3 px-6 pt-3 pb-[18px]">
        <p className="text-[16px] font-medium uppercase leading-[26px] text-[#888888]">{activity.category}</p>
        <h2 className="text-[22px] font-bold leading-[28px] text-primary-600">{activity.title}</h2>
        <div className="flex flex-wrap gap-2">
          {activity.badges.map(b => <span key={b.kind} className={`inline-flex min-h-6 items-center gap-1 rounded-[6px] px-[6px] text-sm font-medium ${styles[b.kind]}`}>
            <AgendaIcon size={15} name={b.kind === 'accessible' ? 'accessible' : 'ticket'} />{b.label}
          </span>)}
        </div>
        <div className="mt-1 flex flex-col gap-3 text-[18px] font-bold leading-6 text-grey-900">
          <p className="flex items-center gap-2"><AgendaIcon name="calendar" />{activity.dayLabel}</p>
          <p className="flex items-center gap-2"><AgendaIcon name="clock" />{activity.timeLabel}</p>
        </div>
        <button type="button" onClick={() => onOpen(activity)} className="mt-auto inline-flex min-h-7 items-center self-start pt-1 text-[16px] font-medium text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600">
          Ver más <span aria-hidden="true" className="ml-2">›</span>
        </button>
      </div>
    </article>
  );
}
