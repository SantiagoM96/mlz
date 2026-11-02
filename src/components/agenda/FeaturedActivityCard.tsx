import { Link } from 'react-router-dom';
import type { AgendaActivity } from '../../data/agenda';
import { ActivityBadges } from './ActivityBadges';
import { MaterialIcon } from '../ui/MaterialIcon';

export function FeaturedActivityCard({ activity }: { activity: AgendaActivity }) {
  return (
    <article data-testid="agenda-featured" className="grid overflow-hidden rounded-lg border border-[#e7e7e7] bg-white md:grid-cols-2">
      <img src={activity.image} alt="Representación teatral en el escenario" width="924" height="543"
        className="h-[249px] w-full object-cover md:h-[362px]" fetchPriority="high" />
      <div className="flex min-h-[327px] flex-col gap-3 p-6 md:min-h-[362px] md:px-8 md:py-4">
        <p className="text-[16px] font-medium uppercase leading-6 text-[#888]">{activity.type}</p>
        <h2 className="text-[30px] leading-9 font-bold text-primary-600">{activity.title}</h2>
        <ActivityBadges badges={activity.badges} />
        <div className="space-y-3 text-[18px] leading-6 text-grey-900">
          <p className="flex items-center gap-2 font-bold"><MaterialIcon name="calendar_month" size={20} />{activity.dayLabel}</p>
          <p className="flex items-center gap-2 font-bold"><MaterialIcon name="schedule" size={20} />{activity.timeLabel}</p>
          <div className="flex items-start gap-2">
            <MaterialIcon name="location_on" size={20} className="mt-0.5 shrink-0" />
            <div><p className="font-bold">{activity.venue}</p><p>{activity.address}</p></div>
          </div>
        </div>
        <Link className="mt-auto inline-flex self-start rounded-sm pt-2 text-[18px] font-medium text-primary-600 hover:underline focus-visible:outline-2" to={`/agenda-de-la-comunidad/actividades/${activity.id}`}>Ver más</Link>
      </div>
    </article>
  );
}
