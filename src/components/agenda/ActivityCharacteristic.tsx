import { MaterialIcon, type MaterialIconName } from '../ui/MaterialIcon';

/**
 * Variante del componente Figma Cards_buscadores / Características:
 * - Con label: etiqueta en negrita y valor regular, ambos de 18 px.
 * - Sin label: valor en negrita de 18 px (regular en el detalle si se solicita).
 * Ícono de 20 px, gap horizontal 8 px.
 */
type Props = {
  icon: MaterialIconName;
  field?: 'date' | 'time' | 'place' | 'artists';
} & (
  | { variant: 'con-label'; label: string; value: string }
  | { variant: 'sin-label'; value: string; label?: never; textWeight?: 'bold' | 'normal' }
);

export function ActivityCharacteristic(props: Props) {
  return (
    <div data-agenda-characteristic={props.variant} data-agenda-field={props.field} className="flex min-w-0 items-start gap-2">
      <MaterialIcon name={props.icon} size={20} className="mt-0.5" />
      {props.variant === 'con-label' ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="break-words text-[18px] font-bold leading-[22px] text-grey-900">
            {props.label}
          </p>
          <p className="break-words text-[18px] font-normal leading-[22px] text-grey-900">
            {props.value}
          </p>
        </div>
      ) : (
        <p className={'min-w-0 flex-1 break-words text-[18px] leading-[22px] text-grey-900 ' +
          (props.textWeight === 'normal' ? 'font-normal' : 'font-bold')}>
          {props.value}
        </p>
      )}
    </div>
  );
}
