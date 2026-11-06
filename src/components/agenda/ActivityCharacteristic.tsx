import { MaterialIcon, type MaterialIconName } from '../ui/MaterialIcon';

/**
 * Variante del componente de información de Agenda en Figma:
 * - Con label: día o recurrencia y período en dos líneas.
 * - Sin label: una sola línea (fecha puntual u horario).
 */
type Props = {
  icon: MaterialIconName;
  /** Jerarquía secundaria de sede (17 px) y dirección (15 px) en el estudio de Figma. */
  size?: 'default' | 'place';
} & (
  | { variant: 'con-label'; label: string; value: string }
  | { variant: 'sin-label'; value: string; label?: never }
);

export function ActivityCharacteristic(props: Props) {
  const isPlace = props.size === 'place';
  return (
    <div data-agenda-characteristic={props.variant} data-agenda-block={isPlace ? 'place' : 'default'} className="flex min-w-0 items-start gap-2">
      <MaterialIcon name={props.icon} size={20} className="mt-0.5" />
      {props.variant === 'con-label' ? (
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className={`break-words font-bold text-grey-900 ${isPlace ? 'text-[17px] leading-[23px]' : 'text-[18px] leading-6'}`}>{props.label}</p>
          <p className={`break-words font-normal text-grey-900 ${isPlace ? 'text-[15px] leading-[21px]' : 'text-[16px] leading-[22px]'}`}>{props.value}</p>
        </div>
      ) : (
        <p className="min-w-0 flex-1 break-words text-[18px] font-bold leading-6 text-grey-900">
          {props.value}
        </p>
      )}
    </div>
  );
}
