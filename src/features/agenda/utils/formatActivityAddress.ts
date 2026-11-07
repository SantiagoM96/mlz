interface ActivityAddressParts {
  street: string | undefined;
  locality: string | undefined;
}

/** Única regla para separar calle/localidad; cada vista conserva su propio formato. */
function splitActivityAddress(normalized: string): ActivityAddressParts {
  // La planilla separa con coma; algunas actividades destacadas usan « - ».
  const parts = /^(.*?)\s*(?:,\s*|\s+-\s+)([^,]+)$/.exec(normalized);
  return {
    street: parts?.[1]?.trim(),
    locality: parts?.[2]?.trim(),
  };
}

/** Formato de presentación; no modifica la dirección usada por Google Maps. */
export function formatActivityAddress(address: string | undefined, locality: string): string {
  if (!address?.trim()) return 'Dirección a confirmar';

  const normalized = address.trim();
  const parts = splitActivityAddress(normalized);
  const street = parts.street ?? normalized;
  const displayedLocality = parts.locality || locality.trim();

  // Convierte «Calle 123» en «Calle N° 123» sin duplicar una numeración existente.
  const streetWithNumber = street.replace(/\s+(?:N[°ºo.]?\s*)?(\d+[A-Za-z]?)$/i, ' N° $1');

  return displayedLocality ? `${streetWithNumber} - ${displayedLocality}` : streetWithNumber;
}

/**
 * Ubicación compacta de la tarjeta de Agenda V2:
 * conserva la numeración tal como vino, sin agregar «N°», y separa localidad con «·».
 * Nunca infiere la dirección física cuando falta.
 */
export function formatActivityCardAddress(address: string | undefined, locality: string): string {
  const normalized = address?.trim();
  if (!normalized) return 'Dirección a confirmar';

  const parts = splitActivityAddress(normalized);
  const street = parts.street || normalized;
  const location = parts.locality || locality.trim();
  return location ? `${street} · ${location}` : street;
}
