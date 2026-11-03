import type { AgendaActivity } from '../../../../data/agenda';
import { MaterialIcon } from '../../../../components/ui/MaterialIcon';

/** Solo URLs http(s) absolutas; nunca usar datos de inscripción como enlaces. */
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

/** CTA debajo de la caja, dentro de la columna sticky del resumen. */
export function ActivityRegistrationLink({ activity }: { activity: AgendaActivity }) {
  const href = validRegistrationUrl(activity.registrationUrl);
  if (!href) return null;

  return (
    <a data-testid="agenda-registration-link" href={href} target="_blank" rel="noopener noreferrer"
      aria-label={`Inscribirme a ${activity.title} (se abre en una pestaña nueva)`}
      className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-primary-600 px-5 py-3 text-center text-[18px] font-bold text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-info-500">
      Inscribirme
      <MaterialIcon name="arrow_forward" size={22} />
    </a>
  );
}
