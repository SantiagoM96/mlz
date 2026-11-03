import type { AgendaActivity } from '../../../../data/agenda';
import { getActivityMapQuery, getActivityMapUrl } from '../../utils/activityMap';

/** Tarjeta compacta de ubicación, siguiendo la referencia de Deportes. */
export function ActivityLocationMap({ activity }: { activity: AgendaActivity }) {
  if (!activity.address) return null;

  const venue = activity.venue || activity.locality;
  const mapQuery = getActivityMapQuery(activity);
  const googleMapsUrl = getActivityMapUrl(activity);

  return (
    <section aria-label="Mapa de ubicación">
      <h2 className="sr-only">Ubicación en el mapa</h2>
      <div className="grid grid-cols-[minmax(0,1fr)_42%] overflow-hidden rounded-lg border border-[#dedede] bg-white">
        <div className="min-w-0 self-center px-4 py-3">
          <p className="text-[16px] font-bold leading-6 text-grey-900">{venue}</p>
          <p className="mt-1 break-words text-[16px] leading-6 text-grey-900">{activity.address}</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block rounded-sm text-[16px] font-bold leading-6 text-primary-600
              underline-offset-2 hover:underline focus-visible:outline-2
              focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Ver en Google Maps
          </a>
        </div>
        <iframe
          title={'Mapa de ' + venue}
          src={'https://www.google.com/maps?q=' + mapQuery + '&output=embed'}
          className="h-full min-h-[116px] w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  );
}
