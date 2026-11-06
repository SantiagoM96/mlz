import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface Props {
  id: string;
  label: string;
  source: string;
  onFile: (file: File | undefined) => void;
  onRemove: () => void;
}

/** Portada y galería comparten los mismos estados y affordances. */
export function ConsoleImageUpload({ id, label, source, onFile, onRemove }: Props) {
  return (
    <div className="min-w-0" data-testid="console-image-upload">
      <label htmlFor={id}
        className={'flex min-h-[128px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[8px] border text-center ' +
          (source
            ? 'border-[#c6dce8] bg-white'
            : 'border-dashed border-[#93bfe0] bg-[#f5f9fc] hover:border-primary-600 hover:bg-[#eaf3f9]')}
        title={source ? 'Reemplazar ' + label : 'Agregar ' + label}>
        {source ? (
          <div className="relative h-[128px] w-full">
            <img src={source} alt={label + ' seleccionada'} className="h-full w-full object-cover"/>
            <span className="absolute inset-x-0 bottom-0 flex min-h-9 items-center justify-center gap-1.5 bg-[#174d70]/90 px-2 text-[13px] font-bold text-white">
              <MaterialIcon name="edit" size={18}/> Reemplazar
            </span>
          </div>
        ) : (
          <span className="flex flex-col items-center gap-2 px-2 py-3 text-[14px] font-medium text-primary-600">
            <MaterialIcon name="add" size={27}/>
            Agregar {label.toLocaleLowerCase('es-AR')}
          </span>
        )}
        <input id={id} type="file" accept="image/*" className="sr-only"
          aria-label={source ? 'Reemplazar ' + label : 'Agregar ' + label}
          onChange={event => {
            onFile(event.target.files?.[0]);
            event.target.value = '';
          }}/>
      </label>
      {source && (
        <button type="button" onClick={onRemove}
          aria-label={'Eliminar ' + label}
          className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-[14px] font-bold text-[#b5444b] hover:underline">
          <MaterialIcon name="delete" size={18}/> Eliminar
        </button>
      )}
    </div>
  );
}
