import type { ConsoleSchedule } from './model';
import { Field, inputClass } from './ConsoleScheduleFormPrimitives';

interface Props {
  value: ConsoleSchedule;
  onScheduleChange: (changes: Partial<ConsoleSchedule>) => void;
}

/** Opciones propias del encuentro; edición controlada por el diálogo. */
export function ConsoleScheduleAdditionalFields({ value, onScheduleChange }: Props) {
  return (
    <>
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[16px] font-bold text-primary-600">
            <input type="checkbox" checked={value.suspendedByRain}
              onChange={event => onScheduleChange({ suspendedByRain: event.target.checked })}
              className="h-5 w-5 accent-[#236999]"/> Se suspende por lluvia
          </label>
          <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)]">
            <Field id="console-schedule-participants-type" label="Participantes (tipo)">
              <select id="console-schedule-participants-type" className={inputClass}
                value={value.participantsType} onChange={event =>
                  onScheduleChange({ participantsType: event.target.value as ConsoleSchedule['participantsType'] })}>
                <option value="artists">Artistas</option>
                <option value="speakers">Oradores</option>
                <option value="participants">Otros participantes</option>
              </select>
            </Field>
            <Field id="console-schedule-participants" label="Artistas, oradores o participantes (opcional)">
              <textarea id="console-schedule-participants" rows={2} className={inputClass + ' resize-y'}
                placeholder="Ej.: Andrea Gauna, Lautaro Rotela"
                value={value.participants} onChange={event => onScheduleChange({ participants: event.target.value })}/>
            </Field>
          </div>
          <Field id="console-schedule-detail" label="Detalle de esta programación (opcional)">
            <textarea id="console-schedule-detail" rows={3} className={inputClass + ' resize-y'}
              placeholder="Información específica de esta fecha, si corresponde"
              value={value.detail} onChange={event => onScheduleChange({ detail: event.target.value })}/>
          </Field>
    </>
  );
}
