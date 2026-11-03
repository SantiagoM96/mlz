import type { AgendaActivity } from '../../../../data/agenda';

export function ActivityInformation({ activity }: { activity: AgendaActivity }) {
  const fields = [
    { label: 'Tipo de actividad', value: activity.type },
    { label: 'Categoría', value: activity.category },
    { label: 'Localidad', value: activity.locality },
  ];

  return (
    <section aria-labelledby="agenda-general-information" className="pt-0">
      <h2 id="agenda-general-information" className="mb-5 text-[24px] font-bold text-primary-600">
        Información general
      </h2>
      <dl className="grid max-w-[900px] gap-x-10 gap-y-5 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.label} className="min-w-0 text-[18px] leading-[26px] text-grey-900">
            <dt className="text-[18px] font-bold leading-6">{field.label}</dt>
            <dd className="mt-1">{field.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
