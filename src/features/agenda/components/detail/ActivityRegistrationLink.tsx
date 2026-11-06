import type { AgendaActivity } from '../../../../data/agenda';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';

/** Solo URLs absolutas http(s); no convertir textos de inscripción en enlaces. */
export function validRegistrationUrl(raw?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

/** La modalidad y su enlace son generales a la actividad, nunca a cada programación. */
export function ActivityRegistrationLink({ activity, preview = false }: { activity: AgendaActivity; preview?: boolean }) {
  // Si la actividad no tiene inscripción no crear un <div> vacío con mt-4:
  // ese margen agregaba 16px ficticios al final de «Cuándo y dónde».
  const registrationMode = activity.registrationMode ?? 'none';
  if (registrationMode === 'none') return null;

  const href = registrationMode === 'in-person'
    ? null : validRegistrationUrl(activity.registrationUrl);
  const information = activity.registrationInformation?.trim();
  const showPreviewButton = preview && registrationMode === 'online' && !href;

  if (!href && !information && !showPreviewButton) return null;

  return (
    <div className="mt-4 space-y-4">
      {information && (
        <section aria-label="Información de inscripción" className="text-[18px] leading-[26px] text-grey-900">
          <h3 className="font-bold">Inscripción</h3>
          <p className="mt-2 whitespace-pre-line">{information}</p>
        </section>
      )}
      {showPreviewButton && (
        <button type="button" disabled
          className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[4px] bg-primary-600 px-5 py-3 text-center text-[18px] font-bold text-white opacity-75">
          Inscribirse
        </button>
      )}
      {href && (
        <a data-testid="agenda-registration-link" href={href} target="_blank" rel="noopener noreferrer"
          aria-label={'Inscribirme a ' + activity.title + ' (se abre en una pestaña nueva)'}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-primary-600 px-5 py-3 text-center text-[18px] font-bold text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-500">
          Inscribirse
          <MaterialIcon name="arrow_forward" size={22} />
        </a>
      )}
    </div>
  );
}
