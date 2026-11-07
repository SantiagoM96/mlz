import { useRef, useState, type FormEvent } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { useConsoleDialogFocus } from './useConsoleDialogFocus';

/** La categoría es fija; cada categoría admite nuevos tipos administrables. */
export function ConsoleTypeEditorDialog({
  category, existingTypes, onAdd, onClose,
}: {
  category: string;
  existingTypes: readonly string[];
  onAdd: (type: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  const { onKeyDown } = useConsoleDialogFocus({
    panelRef, initialFocusRef: inputRef, onClose,
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = name.trim().replace(/\s+/g, ' ');
    if (!next) {
      setError('Ingresá un nombre para el tipo de actividad.');
      inputRef.current?.focus();
      return;
    }
    if (existingTypes.some(type => type.toLocaleLowerCase('es-AR') === next.toLocaleLowerCase('es-AR'))) {
      setError('Este tipo ya existe dentro de la categoría.');
      inputRef.current?.focus();
      return;
    }
    onAdd(next);
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-[#102c40]/65 p-4"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panelRef} onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-labelledby="console-new-type-heading"
        data-testid="console-type-editor"
        className="w-full max-w-[490px] rounded-[12px] bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="console-new-type-heading" className="text-[24px] font-bold leading-8 text-primary-600">Agregar tipo de actividad</h2>
            <p className="mt-1 text-[15px] text-[#647789]">Categoría: {category}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar nuevo tipo"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-primary-600 hover:bg-[#eaf3f9]">
            <MaterialIcon name="close" size={24}/>
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="console-new-type" className="mb-1.5 block font-bold text-primary-600">Nombre del nuevo tipo</label>
            <input id="console-new-type" ref={inputRef} value={name}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'console-new-type-error' : undefined}
              onChange={event => { setName(event.target.value); setError(''); }}
              className="min-h-12 w-full rounded-[6px] border border-[#93bfe0] px-3 text-[16px] focus-visible:outline-2 focus-visible:outline-primary-600"
              placeholder="Ej.: Seminario"/>
          </div>
          {error && <p id="console-new-type-error" role="alert" className="text-[14px] font-medium text-[#ac343e]">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-[#edf0f3] pt-4">
            <button type="button" onClick={onClose}
              className="min-h-12 rounded-[6px] border border-primary-600 px-5 font-bold text-primary-600">Cancelar</button>
            <button type="submit" className="min-h-12 rounded-[6px] bg-primary-600 px-5 font-bold text-white hover:bg-primary-700">
              Guardar tipo
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
