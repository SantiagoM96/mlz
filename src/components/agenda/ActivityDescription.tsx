import type { AgendaActivity } from '../../data/agenda';

/** Descripción completa, sin truncado ni límite artificial de ancho o altura. */
export function ActivityDescription({ activity }: { activity: AgendaActivity }) {
  const description = activity.description?.trim();
  if (!description) return null;

  const paragraphs = description.split(/\r?\n+/).map(paragraph => paragraph.trim()).filter(Boolean);

  return (
    <section aria-label="Descripción de la actividad" className="w-full min-w-0">
      <div className="flex items-start gap-2">
        {activity.descriptionIsIllustrative && (
          <span
            data-testid="agenda-illustrative-dot"
            role="img"
            aria-label="Descripción ilustrativa, no confirmada"
            title="Texto orientativo creado para este prototipo. No figura en la planilla original."
            className="mt-[10px] size-[8px] shrink-0 rounded-full bg-[#d32f2f]"
          />
        )}
        <div className="min-w-0 flex-1 space-y-3">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="break-words text-[18px] leading-[26px] text-grey-900">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {activity.descriptionIsIllustrative && (
        <p className="mt-2 text-[12px] leading-5 text-[#68737c]">
          Descripción ilustrativa · Información pendiente de validación
        </p>
      )}
    </section>
  );
}
