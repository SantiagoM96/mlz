import raw from './tramites.json';

/** Modelo de lectura del catálogo municipal; snapshot público, nunca credenciales ni datos personales. */
export interface Tramite {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  modalidad: string;
  etiquetas: string[];
  destinatarios: string[];
  sinonimos: string;
  requisitos: string;
  documentacion: string;
  pasos: string;
  direccion: string;
  horarios: string;
  turno: string;
  comoIniciar: string;
  costo: string;
  monto: string;
  pago: string;
  plazo: string;
  normativa: string;
  web: string;
  estado: string;
  filaOrigen: number;
  canales: string;
  formatoDocumentacion: string;
  exenciones: string;
  detalleExenciones: string;
  normativaUrl: string;
  sedeAlternativa?: { lugar: string; dias: string; turno: string };
  otrosEnlaces?: string[];
}

export const tramites: readonly Tramite[] = raw;
export const temas: readonly string[] = Array.from(new Set(tramites.map((tramite) => tramite.categoria)));
export const destinatarios: readonly string[] = Array.from(new Set(tramites.flatMap((tramite) => tramite.destinatarios))).sort((a, b) => a.localeCompare(b, 'es'));

export function normalizarBusqueda(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-AR').trim();
}
