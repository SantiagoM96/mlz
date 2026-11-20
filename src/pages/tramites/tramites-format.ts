import type { Tramite } from '../../data/tramites';

/**
 * Contenidos específicos aprobados en la ficha R036 de Figma.
 * El catálogo público (nombre, descripción, etiquetas) sigue proviniendo
 * exclusivamente de CATALOGO DE TRÁMITES.
 */
const fichaR036 = {
  documentos: [
    'Formulario 1361',
    'Cédula catastral del inmueble',
    'DNI',
    'Factura de Edesur del año en curso',
  ],
  pasos: [
    'Reuní los documentos necesarios para presentar la solicitud.',
    'Presentá la documentación en Escribanía o por correo electrónico al área.',
    'Escribanía te avisará cuando el certificado esté listo o si necesitás completar documentación.',
  ],
} as const;

/** Nunca partir nombres de documentos por comas o diagonales arbitrarias. */
export function documentacionPublica(tramite: Tramite): string[] {
  if (tramite.id === 'R036') return [...fichaR036.documentos];

  const texto = tramite.documentacion.trim();
  if (!texto) return [];
  return texto
    .split(/\r?\n|;\s*|(?:^|\s)[•]\s*/)
    .map((item) => item.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Los formularios de ORIGEN suelen separar número y descripción con saltos:
 * 1\nRecepcionarse\n2\nSolicitar alta...  Convertirlo a pasos reales.
 * Si no hay secuencia verificable, conservar el texto sin inventar pasos.
 */
export function pasosPublicos(tramite: Tramite): string[] {
  if (tramite.id === 'R036') return [...fichaR036.pasos];

  const texto = (tramite.pasos || tramite.comoIniciar).trim();
  if (!texto) return [];

  const lineas = texto.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean);
  if (lineas.length >= 4 && lineas.length % 2 === 0 &&
    lineas.every((linea, indice) => indice % 2 === 1 || /^\d{1,2}[).]?$/.test(linea))) {
    return lineas.filter((_, indice) => indice % 2 === 1);
  }

  if (lineas.length >= 2 && lineas.every((linea) => /^\d+[).]\s+\S/.test(linea))) {
    return lineas.map((linea) => linea.replace(/^\d+[).]\s+/, '').trim());
  }

  return [];
}


/**
 * Presentación, no edición editorial: conserva el valor original del catálogo
 * y convierte únicamente los textos de ORIGEN escritos enteramente en mayúsculas
 * a formato de oración. Preserva siglas municipales y unidades horarias.
 */
export function textoPublicoLegible(valor: string): string {
  const original = valor.trim().replace(/[ \t]+/g, ' ');
  if (!original) return '';
  const mayusculas = original === original.toLocaleUpperCase('es-AR') &&
    /[A-ZÁÉÍÓÚÜÑ]/.test(original);
  const base = mayusculas ? original.toLocaleLowerCase('es-AR') : original;
  return base
    .replace(/^\p{L}/u, letra => letra.toLocaleUpperCase('es-AR'))
    .replace(/\b(dni|cuit|cuil|cbu|cvu|pb|arba|afip|pdf)\b/gi, sigla => sigla.toLocaleUpperCase('es-AR'))
    .replace(/\bhs\.?(?=\s|$)/gi, 'h')
    .replace(/(\d)\s*h(?=\s|$)/gi, '$1 h')
    .replace(/^Titulo\b/u, 'Título');
}


/** Tres entradas del mismo tema; R036 respeta los IDs visibles en Figma. */
export function otrosTramitesDelTema(actual: Tramite, catalogo: readonly Tramite[]): Tramite[] {
  const mismoTema = catalogo.filter(item =>
    item.categoria === actual.categoria && item.id !== actual.id);
  if (actual.id !== 'R036') return mismoTema.slice(0, 3);
  const idsDelDiseno = ['R093', 'R089', 'R046'];
  return idsDelDiseno
    .map(id => mismoTema.find(item => item.id === id))
    .filter((item): item is Tramite => Boolean(item));
}
