import { useRef, useState } from 'react';
import { AgendaFilterCounter } from '../../components/agenda/AgendaFilterCounter';
import { AgendaFilterGroupPanel } from '../../components/agenda/AgendaFilterGroupPanel';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { useAgendaOutsideDismiss } from '../../features/agenda/hooks/useAgendaOutsideDismiss';

export const turnoOpciones = ['Requiere turno', 'No requiere turno'] as const;
export const camposFiltro = ['destinatario', 'tema', 'turno', 'modalidad', 'etiqueta'] as const;
export type CampoFiltro = typeof camposFiltro[number];
export type FiltrosTramites = {
  destinatario: readonly string[];
  tema: string;
  turno: string;
  modalidad: string;
  etiqueta: string;
};

type Props = {
  value: FiltrosTramites;
  temas: readonly string[];
  destinatarios: readonly string[];
  modalidades: readonly string[];
  resultCount: number;
  onChange: (campo: CampoFiltro, value: string) => void;
  onReset: () => void;
};

export function TramitesMoreFilters({
  value, temas, destinatarios, modalidades, resultCount, onChange, onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useAgendaOutsideDismiss(open, rootRef, buttonRef, () => setOpen(false));

  // El contador usa la cantidad total de selecciones, como en Agenda.
  // Las opciones elegidas afuera y dentro del panel leen exactamente el mismo estado.
  const count = value.destinatario.length +
    Number(Boolean(value.tema)) + Number(Boolean(value.turno)) +
    Number(Boolean(value.modalidad)) + Number(Boolean(value.etiqueta));
  const groups = [
    { key: 'destinatario', title: '¿Para quién es?', options: destinatarios,
      selected: value.destinatario, selectionControl: 'checkbox' as const },
    { key: 'tema', title: 'Tema', options: temas,
      selected: value.tema ? [value.tema] : [], selectionControl: 'radio' as const },
    { key: 'turno', title: 'Turno', options: turnoOpciones,
      selected: value.turno ? [value.turno] : [], selectionControl: 'radio' as const },
    { key: 'modalidad', title: 'Modalidad', options: modalidades,
      selected: value.modalidad ? [value.modalidad] : [], selectionControl: 'radio' as const },
  ];

  return <div ref={rootRef} className="relative min-w-0" data-testid="tramites-more-filters">
    <button ref={buttonRef} type="button" aria-haspopup="dialog"
      aria-expanded={open} aria-controls="tramites-more-filters-panel"
      aria-description={count ? count + (count === 1 ? ' filtro seleccionado' : ' filtros seleccionados') : undefined}
      onClick={() => setOpen(current => !current)}
      className={'agenda-filter-trigger agenda-motion-control flex h-12 w-full min-w-0 items-center justify-center rounded border border-[#5ba8d5] bg-white px-4 text-[16px] text-primary-600 transition-colors duration-150 hover:border-primary-600 hover:bg-[#f4f9fd] focus-visible:outline-2 ' + (open || count ? 'agenda-filter-trigger-active' : '')}>
      <span data-agenda-more-content className="inline-flex shrink-0 items-center gap-2">
        <span data-agenda-more-label className="whitespace-nowrap">Más filtros</span>
        <span data-tram-counter-slot><AgendaFilterCounter count={count} /></span>
        <MaterialIcon name="tune" size={24}/>
      </span>
    </button>
    {open && <AgendaFilterGroupPanel
      groups={groups}
      dialogId="tramites-more-filters-panel"
      ariaLabel="Filtros de trámites"
      title="Filtrar trámites"
      onToggle={(key, option) => {
        onChange(key as CampoFiltro, option);
      }}
      onApply={() => setOpen(false)}
      onReset={onReset}
      onClose={() => setOpen(false)}
      resultCount={resultCount}
      anchorRef={buttonRef}
    />}
  </div>;
}
