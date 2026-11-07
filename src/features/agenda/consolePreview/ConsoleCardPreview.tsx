import type { AgendaActivity } from '../../../data/agenda';
import { ActivityCard } from '../../../components/agenda/ActivityCard';
import { getPublicActivityViews } from '../utils/publicActivityViews';
import type { ConsoleDraft, ConsoleSchedule, ConsoleVenue } from './model';
import { makePreviewActivity } from './previewActivity';

export function CardPreview({ draft, schedules, venues, onViewDetail }: {
  draft: ConsoleDraft;
  schedules: ConsoleSchedule[];
  venues: readonly ConsoleVenue[];
  onViewDetail: (activity: AgendaActivity) => void;
}) {
  const editorialActivity = makePreviewActivity(draft, schedules, venues);
  const publicViews = getPublicActivityViews(editorialActivity);

  return (
    <div>
      <h2 className="mb-2 text-[24px] font-bold leading-[30px] text-primary-600">Vista previa</h2>
      <p className="mb-5 text-[14px] leading-5 text-[#687f91]">
        {publicViews.length === 1
          ? 'Una ficha pública para esta actividad'
          : publicViews.length + ' fichas públicas, separadas por sede o encuentro'}
      </p>
      <div className="flex min-w-0 flex-col gap-4">
        {publicViews.map(activity => (
          <div key={activity.id} data-testid="console-preview-card" className="min-w-0">
            <ActivityCard
              activity={activity}
              previewDateISO="1900-01-01"
              onViewDetail={() => onViewDetail(activity)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
