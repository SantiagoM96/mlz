import type { AgendaActivity } from '../../data/agenda';

/** Descripción completa sin recortes ni avisos internos del prototipo. */
export function ActivityDescription({ activity }: { activity: AgendaActivity }) {
  const description = activity.description?.trim();
  if (!description) return null;

  const paragraphs = description.split(/\r?\n+/).map(paragraph => paragraph.trim()).filter(Boolean);

  return (
    <section aria-label="Descripción de la actividad" className="w-full min-w-0">
      <div className="space-y-3">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="break-words text-[18px] leading-[26px] text-grey-900">
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
