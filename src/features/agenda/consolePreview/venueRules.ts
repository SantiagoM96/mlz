import type { ConsoleVenue } from './model';

export type VenueInput = Omit<ConsoleVenue, 'id'>;

/** Normalización editorial idéntica a la del formulario de sedes original. */
export function normalizeVenueInput(value: VenueInput): VenueInput {
  return {
    name: value.name.trim().replace(/\s+/g, ' '),
    locality: value.locality.trim().replace(/\s+/g, ' '),
    address: value.address.trim().replace(/\s+/g, ' '),
  };
}

/** Devuelve el primer error sin modificar el catálogo de sedes. */
export function validateVenueInput(venue: VenueInput, venues: readonly ConsoleVenue[]): string | null {
  if (!venue.name || !venue.locality || !venue.address) {
    return 'Completá nombre, localidad y dirección para guardar la sede.';
  }
  if (venues.some(item => item.name.toLocaleLowerCase('es-AR') === venue.name.toLocaleLowerCase('es-AR')
    && item.locality.toLocaleLowerCase('es-AR') === venue.locality.toLocaleLowerCase('es-AR'))) {
    return 'Esta sede ya está registrada. Seleccionala en la lista.';
  }
  return null;
}
