import { MaterialIcon, type MaterialIconName } from '../ui/MaterialIcon';

/**
 * Variante del componente de información de Agenda en Figma:
 * - Con label: día o recurrencia y período en dos líneas.
 * - Sin label: una sola línea (fecha puntual u horario).
 */
type Props = {
  icon: MaterialIconName;
} & (
  | { variant: 'con-label'; label: string; value: string }
  | { variant: 'sin-label'; value: string; label?: never }
);

export function ActivityCharacteristic(props: Props) {
  return (
    <div data-agenda-characteristic={props.variant} className="flex min-w-0 items-start gap-2">
      <MaterialIcon name={props.icon} size={20} className="mt-0.5" />
      {props.variant === 'con-label' ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="break-words text-[18px] font-bold leading-6 text-grey-900">{props.label}</p>
          <p className="break-words text-[16px] font-normal leading-[22px] text-grey-900">{props.value}</p>
        </div>
      ) : (
        <p className="min-w-0 flex-1 break-words text-[18px] font-bold leading-6 text-grey-900">
          {props.value}
        </p>
      )}
    </div>
  );
}
