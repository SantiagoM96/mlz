import type { KeyboardEvent } from 'react';

/** Mobile: pestañas de ficha según Figma 7543:7456. */
export type AgendaDetailTab = 'information' | 'when-where';

const tabs: { id: AgendaDetailTab; label: string }[] = [
  { id: 'information', label: 'Información' },
  { id: 'when-where', label: 'Cuándo y dónde' },
];

export function AgendaDetailMobileTabs({
  active, onChange, idPrefix,
}: {
  active: AgendaDetailTab;
  onChange: (next: AgendaDetailTab) => void;
  idPrefix: string;
}) {
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, selected: AgendaDetailTab) => {
    const index = tabs.findIndex(tab => tab.id === selected);
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    const next = tabs[nextIndex]?.id;
    if (!next) return;
    onChange(next);
    event.currentTarget.parentElement
      ?.querySelector<HTMLButtonElement>('[data-agenda-mobile-tab="' + next + '"]')
      ?.focus();
  };

  return (
    <div role="tablist" aria-label="Secciones de la actividad"
      data-testid="agenda-detail-mobile-tabs"
      className="flex w-full min-w-0 items-stretch">
      {tabs.map(tab => {
        const selected = tab.id === active;
        return (
          <button key={tab.id} type="button" role="tab"
            id={idPrefix + '-tab-' + tab.id}
            data-agenda-mobile-tab={tab.id}
            aria-selected={selected}
            aria-controls={idPrefix + '-panel-' + tab.id}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={event => onKey(event, tab.id)}
            className={'min-w-0 flex-1 border-b-[3px] px-2 py-2 text-center text-[18px] leading-[26px] ' +
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 ' +
              (selected
                ? 'border-primary-600 font-bold text-primary-600'
                : 'border-[#d1d1d1] font-normal text-[#888888] hover:text-primary-600')}
          >{tab.label}</button>
        );
      })}
    </div>
  );
}
