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

/**
 * Registros del catálogo que contienen enumeraciones verificables en una sola
 * línea. Las barras dentro de nombres o alternativas (DNI/CUIL, y/o) NO se
 * interpretan como separadores generales.
 */
const documentosEnumerados: Record<string, string[]> = {
  R028: [
    'Constancia de ARCA', 'DNI', 'Constancia de Ingresos Brutos',
    'Boleta de Edesur paga', 'Boleta de Tasas Servicios Generales paga', 'Libro de Actas',
  ],
  R111: [
    'VTV',
    'Cédula verde',
    'DNI',
    'Monotributo',
    'Libreta sanitaria del titular o conductor',
    'Contrato de sociedad o poder ante escribano',
    'Libro de actas de 200 fojas',
    'Libre deuda',
  ],
  R088: [
    'Contrato de locación',
    'Habilitación del comercio',
    'Croquis de la estructura / ocupación',
    'Fotomontaje',
    'Libre deuda de tasas',
    'DNI',
    'Seguro contra terceros',
  ],
  R005: [
    'Nota de solicitud',
    'Reconocimiento municipal/vigencia',
    'Recibo municipal',
    'Último balance aprobado',
    'Acta de la última asamblea',
    'DNI del representante legal con poder o designación',
  ],
  R024: [
    'DNI',
    'Constancia de CUIT/CUIL',
    'Correo electrónico y teléfono',
  ],
};

/** Separar solo enumeraciones explícitas; conservar las alternativas internas. */
export function documentacionPublica(tramite: Tramite): string[] {
  if (tramite.id === 'R036') return [...fichaR036.documentos];
  const documentosDelTramite = documentosEnumerados[tramite.id];
  if (documentosDelTramite) return [...documentosDelTramite];

  // Enumeraciones de documentos separadas por comas: solo registros con
  // elementos independientes verificados, sin cláusulas condicionales.
  const listasPorComas = new Set([
    'R001','R002','R003','R006','R014','R016','R017','R037','R039',
    'R069','R071','R075','R079','R083','R085','R089','R091',
    'R093','R105','R109','R110','R112','R122','R123',
  ]);
  if (listasPorComas.has(tramite.id)) {
    return tramite.documentacion.split(/[,;]+/).map(item => item.trim().replace(/[.]$/, '')).filter(Boolean);
  }

  const texto = tramite.documentacion.trim();
  if (!texto) return [];
  return texto
    .split(/\r?\n|;\s*|(?:^|\s)[•]\s*/)
    .map((item) => item.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);
}

/**
 * Los registros de ORIGEN usan números sueltos, "1. Paso", "1)Paso",
 * listas por líneas y textos corridos. Interpretar solo separadores
 * verificables; conservar siempre el texto de origen y no crear instrucciones.
 */
export type BloqueProcedimiento =
  | { tipo: 'pasos'; items: string[] }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'texto'; texto: string };

const numeroSuelto = /^(\d{1,2})[.)]?$/;

function agregarPasos(bloques: BloqueProcedimiento[], pasos: string[]) {
  const validos = pasos.map(paso => paso.trim()).filter(Boolean);
  if (validos.length) bloques.push({ tipo: 'pasos', items: validos });
}

function parsearNumerosSueltos(lineas: string[]): BloqueProcedimiento[] | null {
  const marcas = lineas.filter(linea => numeroSuelto.test(linea));
  if (marcas.length < 2) return null;
  const bloques: BloqueProcedimiento[] = [];
  const previas: string[] = [];
  const pasos: string[] = [];
  let ultimoIndice: number | null = null;

  for (const linea of lineas) {
    const marca = linea.match(numeroSuelto);
    if (marca) {
      ultimoIndice = Number(marca[1]);
      pasos.push('');
    } else if (ultimoIndice === null) {
      previas.push(linea);
    } else {
      const indice = pasos.length - 1;
      pasos[indice] = [pasos[indice], linea].filter(Boolean).join(' ');
    }
  }
  // R030: "Recepcionarse" figura justo antes del marcador 2;
  // es el primer paso del relevamiento, no un título editorial inventado.
  const primeraMarca = Number(marcas[0]?.match(numeroSuelto)?.[1] ?? 0);
  if (primeraMarca === 2 && previas.length === 1) {
    pasos.unshift(previas[0] ?? '');
  } else if (previas.length) {
    bloques.push({ tipo: 'texto', texto: previas.join(' ') });
  }
  agregarPasos(bloques, pasos);
  return bloques;
}

function parsearNumerosEnTexto(texto: string): BloqueProcedimiento[] | null {
  // También reconoce "1)Paso" sin espacio y "1. Paso 2. Paso" en un párrafo.
  const regex = /(?:^|\s)(\d{1,2})[.)]\s*(?=\S)/gu;
  // Una dirección puede incluir "Siria 75)" u otra cifra entre paréntesis.
  // Los marcadores del procedimiento deben ser números pequeños y consecutivos.
  const candidatas = Array.from(texto.matchAll(regex));
  const marcas: RegExpMatchArray[] = [];
  let ultimoNumero = 0;
  for (const candidata of candidatas) {
    const numero = Number(candidata[1]);
    if (numero > 20 || numero < 1) continue;
    if (numero === 1 || numero === ultimoNumero + 1) {
      marcas.push(candidata);
      ultimoNumero = numero;
    }
  }
  if (marcas.length < 2) return null;

  const bloques: BloqueProcedimiento[] = [];
  const introduccion = texto.slice(0, marcas[0]?.index ?? 0).trim();
  if (introduccion) bloques.push({ tipo: 'texto', texto: introduccion });

  let grupo: string[] = [];
  for (let i = 0; i < marcas.length; i++) {
    const marca = marcas[i];
    if (!marca) continue;
    const siguienteMarca = marcas[i + 1];
    const inicio = (marca.index ?? 0) + marca[0].length;
    const fin = siguienteMarca?.index ?? texto.length;
    let contenido = texto.slice(inicio, fin).trim();
    const numeroActual = Number(marca[1]);
    const numeroSiguiente = Number(siguienteMarca?.[1] ?? 0);

    // En un trámite puede comenzar una segunda secuencia condicional.
    // Mantener el encabezado del relevamiento en vez de sumarlo al paso anterior.
    if (numeroSiguiente === 1 && numeroActual !== 1) {
      const separacion = contenido.match(/^([\s\S]+?)\n\s*\n([\s\S]+)$/);
      if (separacion) {
        contenido = (separacion[1] ?? '').trim();
        grupo.push(contenido);
        agregarPasos(bloques, grupo);
        grupo = [];
        bloques.push({ tipo: 'texto', texto: (separacion[2] ?? '').trim() });
        continue;
      }
    }

    grupo.push(contenido);
    if (numeroSiguiente === 1 && numeroActual !== 1) {
      agregarPasos(bloques, grupo);
      grupo = [];
    }
  }
  agregarPasos(bloques, grupo);
  return bloques;
}

export function bloquesProcedimiento(tramite: Tramite): BloqueProcedimiento[] {
  if (tramite.id === 'R036') return [{ tipo: 'pasos', items: [...fichaR036.pasos] }];

  const texto = (tramite.pasos || tramite.comoIniciar).trim().replace(/\r\n?/g, '\n');
  if (!texto || /^[.\s-]+$/.test(texto)) return [];

  const lineas = texto.split('\n').map(linea => linea.trim()).filter(Boolean);
  const numerosSueltos = parsearNumerosSueltos(lineas);
  if (numerosSueltos) return numerosSueltos;

  const numerados = parsearNumerosEnTexto(texto);
  if (numerados) return numerados;

  if (lineas.length > 1) {
    const items = lineas.map(linea => linea.replace(/^\s*[-•]\s*/, '').trim()).filter(Boolean);
    // R033 registra documentación en la columna de procedimiento.
    // No transformar esos nombres de documentos en pasos numerados falsos.
    const parecenDocumentos = items.some(item =>
      /^(?:DNI|título de propiedad|formulario \d+|denuncia policial)\b/i.test(item));
    return [{ tipo: parecenDocumentos ? 'lista' : 'pasos', items }];
  }

  return [{ tipo: 'texto', texto }];
}

/** Compatibilidad para consumidores que solamente necesitan un listado de pasos. */
export function pasosPublicos(tramite: Tramite): string[] {
  return bloquesProcedimiento(tramite)
    .filter((bloque): bloque is Extract<BloqueProcedimiento, { tipo: 'pasos' }> => bloque.tipo === 'pasos')
    .flatMap(bloque => bloque.items);
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
    .replace(/(\d)\s*hs?\.?(?=\s|$)/gi, '$1 h')
    .replace(/\bhs\.?(?=\s|$)/gi, 'h')
    .replace(/^Titulo\b/u, 'Título');
}



/** Formato uniforme para intervalos simples; conserva textos especiales. */
export function horarioPublico(valor: string): string {
  const texto = valor.trim().replace(/\\s+/g, ' ');
  if (!texto) return '';
  const normal = texto
    .replace(/\\b(?:lun(?:es)?\\s+a\\s+vie(?:rnes)?|l\\s+a\\s+v)\\b/gi, 'Lunes a viernes')
    .replace(/\\bde\\s+lunes\\s+a\\s+viernes\\b/gi, 'Lunes a viernes')
    .replace(/\\bentre\\s+las\\s+/gi, 'de ')
    .replace(/\\b(?:hasta\\s+las|y\\s+las)\\b/gi, 'a')
    .replace(/\\b(\\d{1,2})[.:](\\d{2})\\s*(?:hs?\\.?|horas?)?\\b/gi, (_m, h: string, min: string) => `${h.padStart(2, '0')}:${min}`)
    .replace(/\\b(\\d{1,2})\\s*(?:hs?\\.?|horas?)\\b/gi, (_m, h: string) => `${h.padStart(2, '0')}:00`)
    .replace(/\\s*(?:a\\.?m\\.?|p\\.?m\\.?)\\b/gi, '')
    .replace(/\\s+/g, ' ').trim();
  // Solo normalizar horas numéricas con un rango inequívoco (sin horarios múltiples).
  const rango = normal.match(/^(.*?)(?:de\\s+)?(\\d{1,2})(?::(\\d{2}))?\\s+a\\s+(\\d{1,2})(?::(\\d{2}))?\\s*(?:h|hs|horas)?\\.?$/i);
  if (!rango) return textoPublicoLegible(valor);
  const inicio = Number(rango[2]), fin = Number(rango[4]);
  if (inicio > 23 || fin > 23 || Number(rango[3] || 0) > 59 || Number(rango[5] || 0) > 59) return textoPublicoLegible(valor);
  const prefijo = (rango[1] || '').replace(/[,\\s-]+$/, '').trim();
  const hora = (h: number, m: string | undefined) => `${String(h).padStart(2, '0')}:${m || '00'}`;
  return `${prefijo ? textoPublicoLegible(prefijo) + ', ' : ''}de ${hora(inicio, rango[3])} a ${hora(fin, rango[5])} h`;
}

/** Sedes conocidas: no atribuir una dirección postal a una oficina sin fuente. */
export function sedePublica(lugar: string): { oficina: string; direccion: string; detalle: string } {
  const texto = textoPublicoLegible(lugar);
  const match = texto.match(/\\b(?:oficina|of[.,])\\s*(?:n[°º.]?\\s*)?(\\d+)\\b/i);
  if (!match) return { oficina: '', direccion: '', detalle: texto };
  const numero = match[1];
  const direccionEncontrada = texto.match(/(?:manuel\\s+castro|m\\.?\\s*castro)\\s*(?:n[°º.]?\\s*)?(\\d+)/i);
  const direccion = direccionEncontrada
    ? `Manuel Castro ${direccionEncontrada[1]}, Lomas de Zamora, Buenos Aires`
    : numero === '37' ? 'Manuel Castro 220, Lomas de Zamora, Buenos Aires' : '';
  const resto = texto.replace(match[0], '').replace(direccionEncontrada?.[0] || /$^/, '')
    .replace(/^[\\s,.-]+|[\\s,.-]+$/g, '').trim();
  return { oficina: `Oficina ${numero}`, direccion, detalle: resto };
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
