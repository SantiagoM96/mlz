import type { AgendaActivity } from '../../../../data/agenda';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';
import { getActivityMapQuery, getActivityMapUrl } from '../../utils/activityMap';
import { formatActivityAddress } from '../../utils/formatActivityAddress';

/**
 * Agenda V2 · Figma 7508:17278 / 7508:17259.
 * Mobile: información a la izquierda y miniatura de mapa a la derecha. Sin mapa gigante debajo.
 */
export function ActivityLocationMap({ activity }: { activity: AgendaActivity }) {
  if (!activity.address) return null;

  const venue = activity.venue || activity.locality;
  const mapQuery = getActivityMapQuery(activity);
  const googleMapsUrl = getActivityMapUrl(activity);

  return (
    <section aria-label="Mapa de ubicación">
      <h2 className="sr-only">Ubicación en el mapa</h2>
      <div
        data-testid="agenda-location-card"
        className="grid grid-cols-[minmax(0,1fr)_112px] overflow-hidden rounded-lg border border-[#d1d1d1] bg-white
          sm:grid-cols-[minmax(0,1fr)_41.4%]"
      >
        <div
          data-testid="agenda-location-details"
          className="flex min-w-0 flex-col justify-center gap-2 p-4"
        >
          <p className="break-words text-[18px] font-bold leading-normal text-grey-900">{venue}</p>
          <p className="break-words text-[18px] font-normal leading-normal text-grey-900">
            {formatActivityAddress(activity.address, activity.locality)}
          </p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit max-w-full items-center gap-[6px] rounded-sm
              text-[18px] font-medium leading-normal text-primary-600 no-underline
              hover:underline focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-primary-600"
          >
            <span>Ver en Google Maps</span>
            <MaterialIcon name="chevron_right" size={24} />
          </a>
        </div>
        <iframe
          title={'Mapa de ' + venue}
          src={'https://www.google.com/maps?q=' + mapQuery + '&output=embed'}
          className="h-full min-h-[148px] w-full border-0 pointer-events-none sm:min-h-[147px] sm:pointer-events-auto"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
