import { MaterialIcon } from '../ui/MaterialIcon';

export interface SelectedFilterChip {
  id: string;
  label: string;
  ariaLabel?: string;
  testId?: string;
}

type Props<T extends SelectedFilterChip> = {
  items: readonly T[];
  onRemove: (item: T) => void;
  onClear: () => void;
  className?: string;
};

/**
 * Misma estructura y tokens para los chips activos de Agenda y Trámites.
 * En mobile, el scroll horizontal deja la acción Limpiar siempre accesible.
 */
export function AgendaSelectedFilterChips<T extends SelectedFilterChip>({
  items, onRemove, onClear, className = '',
}: Props<T>) {
  return <div aria-label="Filtros seleccionados" role="group"
    className={`agenda-filter-chips mt-4 flex flex-wrap items-center gap-2 ${className}`.trim()}>
    <div className="agenda-filter-chips-scroll">
      {items.map(item => <button type="button" key={item.id}
        onClick={() => onRemove(item)}
        aria-label={item.ariaLabel ?? `Quitar filtro: ${item.label}`}
        data-agenda-chip="selected" data-testid={item.testId}
        className="agenda-filter-chip inline-flex min-h-[30px] items-center gap-2 rounded-[6px] bg-info-500 px-2.5 text-[14px] font-medium text-white hover:bg-[#005bd1]">
        <span>{item.label}</span><MaterialIcon name="close" size={15} />
      </button>)}
    </div>
    <button type="button" onClick={onClear}
      className="agenda-filter-clear min-h-[30px] px-2 font-bold text-primary-600 underline-offset-2 hover:underline">
      Limpiar
    </button>
  </div>;
}
