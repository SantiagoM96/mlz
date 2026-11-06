import type { ConsoleDraft } from './model';
import { INITIAL_DRAFT } from './demoData';
import { FormField, SectionTitle, inputClass, noteClass } from './ConsoleFormPrimitives';

interface Props {
  draft: ConsoleDraft;
  onDraftChange: (changes: Partial<ConsoleDraft>) => void;
}

/** Inscripción común a las programaciones, sin persistir ni activar enlaces externos. */
export function ConsoleRegistrationSection({ draft, onDraftChange }: Props) {
  return (
            <section aria-labelledby="console-registration">
              <div id="console-registration">
                <SectionTitle number={3} title="Inscripción"
                  subtitle="Una misma modalidad de inscripción para todas las fechas de la actividad." />
              </div>
              <div className="space-y-4">
                <FormField label="Modalidad" htmlFor="registration-mode">
                  <select id="registration-mode" className={inputClass} value={draft.registrationMode}
                    onChange={event => {
                      const registrationMode = event.target.value as ConsoleDraft['registrationMode'];
                      onDraftChange({
                        registrationMode,
                        registrationInformation: registrationMode === 'in-person'
                          && draft.registrationInformation === INITIAL_DRAFT.registrationInformation
                          ? '' : draft.registrationInformation,
                      });
                    }}>
                    <option value="none">Sin inscripción</option>
                    <option value="online">Inscripción online</option>
                    <option value="in-person">Inscripción presencial</option>
                  </select>
                </FormField>
                {draft.registrationMode === 'online' && (
                  <FormField label="Enlace de inscripción" htmlFor="registration-url">
                    <input id="registration-url" type="url" className={inputClass}
                      placeholder="https://ejemplo.gob.ar/inscripcion"
                      value={draft.registrationUrl}
                      onChange={event => onDraftChange({ registrationUrl: event.target.value })} />
                  </FormField>
                )}
                {draft.registrationMode !== 'none' && (
                  <FormField label={'Información de inscripción ' +
                    (draft.registrationMode === 'online' ? '(opcional)' : '')}
                    htmlFor="registration-info">
                    <textarea id="registration-info" className={inputClass + ' min-h-[100px] resize-y'} rows={3}
                      value={draft.registrationInformation}
                      placeholder={draft.registrationMode === 'in-person'
                        ? 'Indicá dónde y cómo inscribirse presencialmente' : 'Aclaraciones para inscribirse'}
                      onChange={event => onDraftChange({ registrationInformation: event.target.value })} />
                  </FormField>
                )}
                <p className={noteClass}>
                  La información de inscripción se mostrará en la ficha pública, debajo de «Cuándo y dónde».
                </p>
              </div>
            </section>
  );
}
