/** Introducción editorial compartida por la portada y el listado de Agenda. */
export function AgendaIntro({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <h1 className="text-[32px] font-bold leading-10 text-primary-600">¡Agenda Anual de la Comunidad 2026!</h1>
      <p className="mt-2 text-[18px] leading-[26px] text-grey-900">Encontrá mes a mes todas las actividades culturales, deportivas y ambientales para disfrutar en tu barrio.</p>
    </div>
  );
}
