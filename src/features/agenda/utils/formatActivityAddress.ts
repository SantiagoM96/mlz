/** Formato de presentación; no modifica la dirección usada por Google Maps. */
export function formatActivityAddress(address: string | undefined, locality: string): string {
  if (!address?.trim()) return 'Dirección a confirmar';

  const normalized = address.trim();
  const comma = normalized.lastIndexOf(',');
  const street = comma >= 0 ? normalized.slice(0, comma).trim() : normalized;
  const addressLocality = comma >= 0 ? normalized.slice(comma + 1).trim() : '';
  const displayedLocality = addressLocality || locality.trim();

  // Convierte «Calle 123» en «Calle N° 123» sin duplicar una numeración existente.
  const streetWithNumber = street.replace(/\s+(?:N[°ºo.]?\s*)?(\d+[A-Za-z]?)$/i, ' N° $1');

  return displayedLocality ? `${streetWithNumber} - ${displayedLocality}` : streetWithNumber;
}
