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

/**
 * Documentación declarada como inexistente o no especificada en ORIGEN.
 * Nunca mostrar "No hay", "-", "Varias" o una referencia a otra oficina
 * como si fueran archivos que el vecino debe presentar. La base no cambia.
 *
 * R035: el relevamiento no nombra los documentos, por lo que se omite
 * la falsa lista hasta contar con contenido editorial específico.
 */
export function documentacionInformativa(texto: string): boolean {
  const normalizado = texto.trim().toLocaleLowerCase('es-AR')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.!]+$/g, '').trim();
  if (!normalizado || /^[-–—.]$/.test(normalizado)) return false;
  const sinDocumentos = new Set([
    'ninguna', 'ninguno', 'no', 'no hay', 'no se requiere',
    'no es necesaria documentacion',
    'no es necesario ningun tipo de documentacion',
    'no lo dice el portal', 'varias', 'no aplica', 'no corresponde',
    'mesa de entradas o elomas la solicita',
  ]);
  if (sinDocumentos.has(normalizado)) return false;
  return true;
}

/**
 * R051 contiene documentación específica en un párrafo explicativo y R116
 * declara que la documentación se determina caso por caso. Ninguno debe
 * mostrarse como un documento individual con ícono, ni eliminarse.
 */
const notasDocumentales = new Set([
  'R051', 'R116', 'R015', 'R056', 'R062', 'R077', 'R104', 'R131',
]);
export function notaDocumentacionPublica(tramite: Tramite): string {
  // El relevamiento de R077 mezcla datos para identificar el reclamo con
  // una propuesta interna de agregar un campo de carga de imágenes.
  // La sugerencia interna no es documentación requerida al vecino.
  if (tramite.id === 'R077') {
    return (tramite.documentacion.split(/\.\s*También\b/iu)[0] ?? '')
      .replace(/^\s*[-•]\s*/u, '').trim();
  }
  // R012 identifica dos documentos y una tercera exigencia opcional.
  if (tramite.id === 'R012') {
    return tramite.documentacion.match(/en caso de tener,\s*documentación de trayectoria educativa previa\.?/iu)?.[0] ?? '';
  }
  // R041 distingue el documento base de los planos adicionales condicionales.
  // La condición sigue siendo el texto declarado en ORIGEN, no un requisito nuevo.
  if (tramite.id === 'R041') {
    return (tramite.documentacion.split(/\r?\n/)[0] ?? '')
      .replace(/^Debe presentar:\s*Plano Obra\s+y\s+/iu, '').trim();
  }
  return notasDocumentales.has(tramite.id) ? tramite.documentacion.trim() : '';
}

/** Separar solo enumeraciones explícitas; conservar las alternativas internas. */
export function documentacionPublica(tramite: Tramite): string[] {
  if (tramite.id === 'R036') return [...fichaR036.documentos];
  // En R041 la primera línea mezcla un documento obligatorio y una condición.
  // Evita mostrar la cláusula «dependiendo del trámite» con ícono de archivo.
  if (tramite.id === 'R041') {
    const lineas = tramite.documentacion.split(/\r?\n/)
      .map(linea => linea.trim()).filter(Boolean);
    return ['Plano Obra', ...lineas.slice(1)];
  }
  // No convertir una enumeración por guiones o comas en un único «archivo».
  // Solo se aplican estas separaciones cuando los ítems están identificados.
  if (tramite.id === 'R010') {
    return tramite.documentacion.split(/\s+-\s+/u).map(item => item.trim()).filter(Boolean);
  }
  if (tramite.id === 'R013') {
    return tramite.documentacion.split(/,\s*/u).map(item => item.trim()).filter(Boolean);
  }
  if (tramite.id === 'R011') {
    return tramite.documentacion.replace(/^Se requiere\s+/iu, '')
      .replace(/\s+y\s+dni\s*$/iu, ', dni')
      .split(/,\s*/u).map(item => item.trim()).filter(Boolean);
  }
  if (tramite.id === 'R012') {
    return ['fotocopia del DNI con domicilio en Lomas de Zamora', 'fotocopia del CUD'];
  }
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
  if (!texto || notaDocumentacionPublica(tramite) || !documentacionInformativa(texto)) return [];

  // En las listas con viñetas, una línea que no comienza con viñeta
  // continúa el documento anterior. Evita que «propietarios. (comprador)»
  // o «aclaración del mismo» aparezcan como archivos independientes.
  const lineas = texto.split(/\r?\n/).map(linea => linea.trim()).filter(Boolean);
  if (lineas.length > 1 && /^[•*]\s*/u.test(lineas[0] ?? '')) {
    const documentos: string[] = [];
    for (const linea of lineas) {
      if (/^[•*]\s*/u.test(linea)) {
        documentos.push(linea.replace(/^[•*]\s*/u, '').trim());
      } else if (documentos.length) {
        const indice = documentos.length - 1;
        documentos[indice] = [documentos[indice], linea].filter(Boolean).join(' ');
      }
    }
    return documentos.filter(Boolean);
  }

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

/**
 * Solo los registros verificados cuyo circuito de ORIGEN enumera etapas
 * mediante guiones. No dividir guiones del resto del catálogo: pueden ser
 * alternativas, aclaraciones o parte de un nombre.
 *
 * R121: solicitud - autorización - confirmación - implementación.
 * R132: ingreso - confirmación/rechazo/cancelación - ejecución.
 * R031: portal - petición - resolución.
 * R034: recorrido por cinco áreas municipales.
 * R123: carga del pedido - devolución de Tránsito - cobertura del evento.
 */
const procedimientosConEtapasSeparadasPorGuiones = new Set([
  'R121', 'R132', 'R031', 'R034', 'R123',
]);

function parsearEtapasPorGuiones(tramite: Tramite, texto: string): BloqueProcedimiento[] | null {
  if (!procedimientosConEtapasSeparadasPorGuiones.has(tramite.id)) return null;

  // Los guiones internos de "autorizado-cancelado-rechazado" de R123
  // expresan alternativas, no pasos distintos. Solo normalizamos los dos
  // separadores específicos registrados en ORIGEN.
  const normalizado = tramite.id === 'R123'
    ? texto
      .replace(/(?<=pedido)-(?=esperar)/iu, ' - ')
      .replace(/\s+-(?=cobertura)/iu, ' - ')
    : tramite.id === 'R034'
      ? texto.replace(/\s+-(?=Secretaria)/iu, ' - ')
      : texto;
  const etapas = normalizado.split(/\s+[-–—]\s*/u)
    .map(etapa => etapa.trim()).filter(Boolean);
  if (etapas.length < 3 || etapas.length > 15) return null;
  return [{ tipo: 'pasos', items: etapas }];
}



/**
 * Enumeración 1- Paso, 2 - Paso, etc. detectada en R010, R114, R115
 * y R118. Se respetan las notas anteriores a la numeración.
 */
function parsearNumerosConGuion(lineas: readonly string[]): BloqueProcedimiento[] | null {
  const numeroYTexto = /^(\d{1,2})\s*[-–—]\s*(.+)$/u;
  const pasos: string[] = [];
  const introduccion: string[] = [];
  let iniciado = false;
  for (const linea of lineas) {
    const match = linea.match(numeroYTexto);
    if (match && Number(match[1]) === pasos.length + 1) {
      iniciado = true;
      pasos.push((match[2] ?? '').trim());
      continue;
    }
    if (!iniciado) {
      introduccion.push(linea);
    } else if (pasos.length) {
      // Una línea de continuación pertenece al paso anterior, no agrega uno nuevo.
      const index = pasos.length - 1;
      pasos[index] = [pasos[index], linea].filter(Boolean).join(' ');
    }
  }
  if (pasos.length < 2) return null;
  return [
    ...(introduccion.length ? [{ tipo: 'texto' as const, texto: introduccion.join(' ') }] : []),
    { tipo: 'pasos' as const, items: pasos },
  ];
}

/**
 * Otras delimitaciones de etapas verificadas registro por registro.
 * Una barra dentro de un documento, alternativa o nombre NO es un
 * separador general. Solo se admiten estos circuitos concretos.
 */
const pasosPorBarras = new Set(['R009', 'R037', 'R133']);
const pasosPorOraciones = new Set(['R131']);
function parsearEtapasAlternativas(tramite: Tramite, texto: string): BloqueProcedimiento[] | null {
  let items: string[];
  if (pasosPorBarras.has(tramite.id)) {
    items = texto.split(/\s*\/\s*/u).map(x => x.trim()).filter(Boolean);
  } else if (pasosPorOraciones.has(tramite.id)) {
    items = texto.split(/\.\s+/u).map(x => x.trim().replace(/\.$/u, '')).filter(Boolean);
  } else return null;
  if (items.length < 3 || items.length > 10) return null;
  return [{ tipo: 'pasos', items }];
}

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

/**
 * El relevamiento contiene además circuitos con acciones identificables en un
 * único párrafo, sin numeración. Solo se separan IDs cotejados con ORIGEN.
 * No es un parser genérico de comas: una coma también puede unir documentos,
 * condiciones, modalidades o nombres de oficinas.
 */
const circuitosPorComasVerificados = new Set([
  'R001', 'R003', 'R004', 'R005', 'R027', 'R028', 'R079', 'R081',
  'R082', 'R083', 'R084', 'R085', 'R086', 'R088', 'R097', 'R100',
  'R101', 'R103', 'R104', 'R109', 'R110', 'R112', 'R122', 'R124',
]);
const circuitosPorOracionesVerificados = new Set([
  'R007', 'R008', 'R014', 'R058', 'R065', 'R067', 'R087',
  'R094', 'R099', 'R102', 'R107', 'R108', 'R113', 'R117',
]);

/**
 * Delimitaciones que no deben separar comas interiores de una enumeración
 * («nombre, dirección, tipo de material»), opciones de pago o condiciones.
 */
const circuitosConLimitesEspecificos: Record<string, RegExp> = {
  R057: /,\s*(?=(?:le pedimos|un representante|se establece|se le comunica|en las semanas))/iu,
  R059: /,\s*(?=(?:un representante|se establece|se le comunica|en las semanas))/iu,
  R061: /,\s*(?=(?:se les comenta|na vez))/iu,
  R068: /,\s*(?=se le piden)/iu,
  R069: /,\s*(?=(?:en cuanto|se realiza))/iu,
  R070: /,\s*(?=se les asigna)/iu,
  R071: /,\s*(?=el reclamo)/iu,
  R073: /,\s*(?=el reclamo)/iu,
  R075: /,\s*(?=(?:en cuanto|se realiza))/iu,
};

function parsearCircuitoNarrativo(tramite: Tramite, texto: string): BloqueProcedimiento[] | null {
  const separadorEspecifico = circuitosConLimitesEspecificos[tramite.id];
  let partes: string[];
  if (circuitosPorComasVerificados.has(tramite.id)) {
    partes = texto.split(/,\s*/u);
  } else if (circuitosPorOracionesVerificados.has(tramite.id)) {
    partes = texto.split(/(?<=[.!?])\s+(?=[a-záéíóúñ])/iu);
  } else if (separadorEspecifico) {
    partes = texto.split(separadorEspecifico);
  } else {
    return null;
  }
  const items = partes.map(parte => parte.trim()).filter(Boolean);
  // Un cambio en el origen no debe forzar una numeración inválida.
  if (items.length < 2 || items.length > 18) return null;
  return [{ tipo: 'pasos', items }];
}

export function bloquesProcedimiento(tramite: Tramite): BloqueProcedimiento[] {
  if (tramite.id === 'R036') return [{ tipo: 'pasos', items: [...fichaR036.pasos] }];

  // «Cómo inicia» identifica el canal (web, mail, ventanilla); no es un procedimiento.
  const texto = tramite.pasos.trim().replace(/\r\n?/g, '\n');
  if (!texto || /^[.\s-]+$/.test(texto)) return [];

  const guionesVerificados = parsearEtapasPorGuiones(tramite, texto);
  if (guionesVerificados) return guionesVerificados;
  const circuitoNarrativo = parsearCircuitoNarrativo(tramite, texto);
  if (circuitoNarrativo) return circuitoNarrativo;

  const lineas = texto.split('\n').map(linea => linea.trim()).filter(Boolean);
  const numerosConGuion = parsearNumerosConGuion(lineas);
  if (numerosConGuion) return numerosConGuion;
  const etapasAlternativas = parsearEtapasAlternativas(tramite, texto);
  if (etapasAlternativas) return etapasAlternativas;
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
