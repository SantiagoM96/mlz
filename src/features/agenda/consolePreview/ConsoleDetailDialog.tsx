import { useRef } from 'react';
import type { AgendaActivity } from '../../../data/agenda';
import { ActivityDescription } from '../../../components/agenda/ActivityDescription';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { ActivityRegistrationLink } from '../components/detail/ActivityRegistrationLink';
import { ActivityLocationMap } from '../components/detail/ActivityLocationMap';
import { getActivitySchedulePresentations, getUniqueActivityLocations } from '../utils/activitySchedules';
import { useConsoleDialogFocus } from './useConsoleDialogFocus';
import { ConsoleDetailScheduleSummary } from './ConsoleDetailScheduleSummary';

/**
 * Simulación del detalle público: no navega a una actividad real y no envía datos.
 * Reutiliza componentes del sitio para mantener la fidelidad del diseño.
 */
export function ConsoleDetailDialog({
  activity, galleryImages, onClose,
}: {
  activity: AgendaActivity;
  galleryImages: readonly string[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const { onKeyDown } = useConsoleDialogFocus({
    panelRef, initialFocusRef: closeRef, onClose,
  });

  const presentations = getActivitySchedulePresentations(activity, '1900-01-01');
  const badges = activity.schedules
    ? activity.badges.filter(badge => badge.kind !== 'rain')
    : activity.badges;

  const missing = (activity.schedules ?? []).filter(
    schedule => !presentations.some(item => item.id === schedule.id),
  );
  const uniqueLocations = getUniqueActivityLocations(presentations);
  const oneLocation = uniqueLocations.length === 1
    && (activity.schedules?.length ?? 0) === presentations.length;
  const first = oneLocation ? uniqueLocations[0] : null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[#102c40]/65 px-0 py-0 sm:px-4 sm:py-5"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        ref={panelRef}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="console-detail-heading"
        data-testid="console-detail-preview"
        className="relative min-h-dvh w-full max-w-[1300px] bg-white shadow-xl sm:min-h-0 sm:rounded-[12px]"
      >
        <div className="sticky top-0 z-10 flex min-h-[64px] items-center justify-between gap-3 border-b border-[#dbe4eb] bg-white px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-primary-600">Vista previa · Ficha pública</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose}
            className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-[6px] border border-[#d9e5ed] px-3 text-[16px] font-bold text-primary-600 hover:bg-[#f2f8fc] focus-visible:outline-2 focus-visible:outline-primary-600"
            aria-label="Cerrar vista previa del detalle">
            <MaterialIcon name="close" size={20} />
            <span className="hidden min-[390px]:inline">Cerrar</span>
          </button>
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 pt-6 min-[1232px]:px-0">
          <p className="mb-6 break-words text-[16px] leading-6 text-primary-600">
            Inicio <span className="px-2">›</span> Agenda de la Comunidad
            <span className="px-2">›</span> <strong>{activity.title}</strong>
          </p>
          <div className="grid min-w-0 items-start gap-4 lg:items-stretch lg:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,430px)]">
            <div className="min-w-0 lg:col-start-1 lg:row-start-1">
              <div className="space-y-4">
                <p className="text-[16px] font-medium uppercase text-[#787878]">{activity.type}</p>
                <h2 id="console-detail-heading" className="break-words text-[32px] font-bold leading-10 text-primary-600">
                  {activity.title}
                </h2>
              </div>
              <div id="agenda-console-panel-information"
                data-testid="agenda-console-detail-information"
                className="mt-4 min-w-0 space-y-4 lg:space-y-6">
                <ActivityDescription activity={activity} />
              <img
                data-testid="agenda-console-detail-image"
                className="aspect-[400/224] w-full rounded-lg object-cover lg:aspect-[2/1] lg:rounded-[10px]"
                src={activity.image}
                alt=""
              />
              {galleryImages.length > 0 && (
                <section aria-label="Galería de imágenes">
                  <h3 className="mb-3 text-[20px] font-bold text-primary-600">Galería de imágenes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {galleryImages.map((url, index) => url && (
                      <img key={index} src={url} alt={'Foto adicional ' + (index + 1)}
                        className="aspect-[3/2] w-full rounded-[8px] object-cover" />
                    ))}
                  </div>
                </section>
              )}
              </div>
            </div>

            {/* El tabpanel es una superficie de contenido; su pista de sticky es independiente. */}
            <div data-testid="agenda-console-detail-sidebar"
              className="min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-4">
              <div id="agenda-console-panel-when-where"
                className="flow-root min-w-0 space-y-4 lg:contents lg:space-y-0">
              <p className="flex items-center gap-2 text-[18px] font-bold text-primary-600">
                <MaterialIcon name="link" size={20} /> Compartir
              </p>
              <div data-testid="agenda-console-detail-sticky" className="lg:sticky lg:top-[88px] lg:max-h-[calc(100dvh-112px)] lg:overflow-y-auto lg:overscroll-contain">
              <ConsoleDetailScheduleSummary
                activity={activity}
                presentations={presentations}
                missing={missing}
                badges={badges}
                multipleLocations={uniqueLocations.length > 1}
              />
              <ActivityRegistrationLink
                activity={{ ...activity, registrationUrl: undefined }}
                preview
              />
              </div>
              </div>
            </div>
            {first && (
              <div data-testid="agenda-console-detail-map-panel"
                className="min-w-0 lg:col-start-1 lg:row-start-2">
                <ActivityLocationMap activity={{
                  ...activity,
                  locality: first.locality,
                  venue: first.venue,
                  address: first.address,
                }} />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
