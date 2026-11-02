import { useState } from 'react';
import type { AgendaActivity } from '../../data/agenda';

const PREVIEW_LENGTH = 430;

function previewText(description: string): string {
  if (description.length <= PREVIEW_LENGTH) return description;
  const excerpt = description.slice(0, PREVIEW_LENGTH);
  const sentence = Math.max(excerpt.lastIndexOf('. '), excerpt.lastIndexOf('.\n'));
  return (sentence > 180 ? excerpt.slice(0, sentence + 1) : excerpt.trimEnd()).trim();
}

/** Descripción de la actividad con fuente explícita y expansión accesible. */
export function ActivityDescription({ activity }: { activity: AgendaActivity }) {
  const [expanded, setExpanded] = useState(false);
  const description = activity.description?.trim();
  if (!description) return null;

  const long = description.length > PREVIEW_LENGTH;
  const shown = long && !expanded ? previewText(description) : description;

  return (
    <section aria-label="Descripción de la actividad" className="max-w-[680px]">
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
        <p className="min-w-0 whitespace-pre-line text-[18px] leading-[26px] text-grey-900">
          {shown}{long && !expanded ? '…' : ''}
        </p>
      </div>

      {activity.descriptionIsIllustrative && (
        <p className="mt-2 text-[12px] leading-5 text-[#68737c]">
          Descripción ilustrativa · Información pendiente de validación
        </p>
      )}

      {long && (
        <button type="button" onClick={() => setExpanded(value => !value)}
          aria-expanded={expanded}
          className="mt-3 min-h-8 rounded-sm text-[16px] font-bold text-primary-600
            underline-offset-2 hover:underline focus-visible:outline-2
            focus-visible:outline-offset-2 focus-visible:outline-primary-600">
          {expanded ? 'Leer menos' : 'Leer descripción completa'}
        </button>
      )}
    </section>
  );
}
