import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import type { ConsoleDraft } from './model';
import { CATEGORY_TYPES } from './demoData';
import { FormField, SectionTitle, inputClass } from './ConsoleFormPrimitives';

interface Props {
  draft: ConsoleDraft;
  typesByCategory: Readonly<Record<string, readonly string[]>>;
  onDraftChange: (changes: Partial<ConsoleDraft>) => void;
  onCategoryChange: (category: string) => void;
  onAddType: () => void;
}

/** Campos generales de la actividad; sin estado interno ni lógica de publicación. */
export function ConsoleGeneralInfoSection({
  draft, typesByCategory, onDraftChange, onCategoryChange, onAddType,
}: Props) {
  return (
            <section aria-labelledby="console-information">
              <div id="console-information"><SectionTitle number={1} title="Información general" /></div>
              <div className="space-y-4">
                <FormField label="Título" htmlFor="console-title">
                  <input id="console-title" className={inputClass} value={draft.title}
                    onChange={event => onDraftChange({ title: event.target.value })} placeholder="Nombre de la actividad" />
                </FormField>
                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <FormField label="Categoría" htmlFor="console-category">
                    <select id="console-category" className={inputClass} value={draft.category}
                      onChange={event => onCategoryChange(event.target.value)}>
                      {Object.keys(CATEGORY_TYPES).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Tipo de actividad" htmlFor="console-type">
                    <select id="console-type" className={inputClass} value={draft.type}
                      onChange={event => onDraftChange({ type: event.target.value })}>
                      {[...new Set([...(typesByCategory[draft.category] ?? []), draft.type])].map(type =>
                        <option key={type} value={type}>{type}</option>)}
                    </select>
                    <button type="button" onClick={() => onAddType()}
                      className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded-[6px] text-[15px] font-bold text-primary-600 hover:underline">
                      <MaterialIcon name="add" size={19}/> Agregar tipo de actividad
                    </button>
                  </FormField>
                </div>
                <p className="text-[14px] leading-5 text-[#61788b]">
                  Las categorías son fijas; los tipos se pueden agregar desde la consola.
                </p>
                <FormField label="Descripción general" htmlFor="console-description">
                  <textarea id="console-description" rows={4} className={inputClass + ' min-h-[120px] resize-y'}
                    value={draft.description} onChange={event => onDraftChange({ description: event.target.value })}
                    placeholder="Contá de qué se trata la actividad" />
                </FormField>
                <div className="space-y-3 pt-1">
                  <label className="flex min-h-7 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
                    <input type="checkbox" checked={draft.inclusive}
                      onChange={event => onDraftChange({ inclusive: event.target.checked })}
                      className="h-5 w-5 accent-[#236999]" />
                    Disciplina inclusiva
                  </label>
                </div>
              </div>
            </section>
  );
}
