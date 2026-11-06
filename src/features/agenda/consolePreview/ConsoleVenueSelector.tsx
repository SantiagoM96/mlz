import { useState } from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import type { ConsoleVenue } from './model';
import { venueById } from './scheduleRules';
import { Field, inputClass } from './ConsoleScheduleFormPrimitives';

interface Props {
  venueId: string;
  venues: readonly ConsoleVenue[];
  onVenueChange: (venueId: string) => void;
  onCreateVenue: (venue: Omit<ConsoleVenue, 'id'>) => string;
}

/** Selector y alta de sedes reutilizables, sin conocer el resto del formulario. */
export function ConsoleVenueSelector({ venueId, venues, onVenueChange, onCreateVenue }: Props) {
  const [addingVenue, setAddingVenue] = useState(false);
  const [venueFields, setVenueFields] = useState({ name: '', locality: '', address: '' });
  const [venueError, setVenueError] = useState('');
  const venue = venueById(venueId, venues);

  const addVenue = () => {
    const next = {
      name: venueFields.name.trim().replace(/\s+/g, ' '),
      locality: venueFields.locality.trim().replace(/\s+/g, ' '),
      address: venueFields.address.trim().replace(/\s+/g, ' '),
    };
    if (!next.name || !next.locality || !next.address) {
      setVenueError('Completá nombre, localidad y dirección para guardar la sede.');
      return;
    }
    if (venues.some(item => item.name.toLocaleLowerCase('es-AR') === next.name.toLocaleLowerCase('es-AR')
      && item.locality.toLocaleLowerCase('es-AR') === next.locality.toLocaleLowerCase('es-AR'))) {
      setVenueError('Esta sede ya está registrada. Seleccionala en la lista.');
      return;
    }
    const id = onCreateVenue(next);
    onVenueChange(id);
    setVenueError('');
    setAddingVenue(false);
  };
  return (
    <>
          <div className="space-y-2">
            <Field id="console-schedule-venue" label="Lugar">
              <select id="console-schedule-venue" value={venueId} className={inputClass}
                onChange={event => onVenueChange(event.target.value)}>
                {venues.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
              </select>
            </Field>
            <button type="button" onClick={() => { setAddingVenue(current => !current); setVenueError(''); }}
              className="inline-flex min-h-10 items-center gap-2 rounded-[6px] text-[15px] font-bold text-primary-600 hover:underline"
              aria-expanded={addingVenue}>
              <MaterialIcon name="add" size={20}/> Agregar nuevo lugar
            </button>
          </div>
          {addingVenue && (
            <section aria-label="Nuevo lugar" data-testid="console-new-venue"
              className="space-y-3 rounded-[8px] border border-[#c5dce9] bg-[#f5f9fc] p-4">
              <h3 className="font-bold text-primary-600">Nuevo lugar</h3>
              <Field id="console-venue-name" label="Nombre del lugar">
                <input id="console-venue-name" className={inputClass} value={venueFields.name}
                  onChange={event => { setVenueFields(v => ({ ...v, name: event.target.value })); setVenueError(''); }}
                  placeholder="Ej.: Centro Cultural del Barrio"/>
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field id="console-venue-locality" label="Localidad">
                  <input id="console-venue-locality" className={inputClass} value={venueFields.locality}
                    onChange={event => { setVenueFields(v => ({ ...v, locality: event.target.value })); setVenueError(''); }}
                    placeholder="Ej.: Banfield"/>
                </Field>
                <Field id="console-venue-address" label="Dirección">
                  <input id="console-venue-address" className={inputClass} value={venueFields.address}
                    onChange={event => { setVenueFields(v => ({ ...v, address: event.target.value })); setVenueError(''); }}
                    placeholder="Calle y altura"/>
                </Field>
              </div>
              {venueError && <p role="alert" className="text-[14px] font-medium text-[#ac343e]">{venueError}</p>}
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setAddingVenue(false)}
                  className="min-h-11 rounded-[6px] border border-primary-600 px-4 font-bold text-primary-600">Cancelar lugar</button>
                <button type="button" onClick={addVenue}
                  className="min-h-11 rounded-[6px] bg-primary-600 px-4 font-bold text-white">Guardar lugar</button>
              </div>
            </section>
          )}
          <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-3 gap-y-1 text-[14px] leading-6 text-[#5d7182]">
            <dt>Localidad</dt><dd>{venue.locality}</dd>
            <dt>Dirección</dt><dd>{venue.address}</dd>
            <dt>Google Maps</dt><dd>
              <a href={'https://www.google.com/maps/search/?api=1&query=' +
                encodeURIComponent(venue.address + ', ' + venue.locality + ', Buenos Aires, Argentina')}
                target="_blank" rel="noopener noreferrer"
                className="font-medium text-primary-600 underline underline-offset-2">
                Ver ubicación <MaterialIcon name="arrow_forward" size={16} className="inline"/>
              </a>
            </dd>
          </dl>
    </>
  );
}
