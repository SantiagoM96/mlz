# Auditoría de las 125 fichas · Documentación y «¿Cómo se realiza?»

**Fecha:** 20 de noviembre de 2026  
**Fuente editorial autorizada:** [GUIA DE TRÁMITES - BASE FINAL](https://docs.google.com/spreadsheets/d/1vFc6Q_wh1tDp4fbGnw7exqXdQM0u72QY_FUxKKBe_44/edit), hojas CATALOGO DE TRÁMITES, BASE NUEVA y ORIGEN.  
**Implementación auditada:** `src/data/tramites.json`, `tramites-format.ts`, `TramitesPages.tsx`.  
**Alcance:** los 125 IDs del catálogo editorial; no incorporar registros ajenos ni utilizar datos de un trámite para otro.

## Integridad fuente-editorial

La comprobación con las hojas originales de BASE FINAL encontró **125/125 IDs seleccionados**, sin registros ausentes. Título público, descripción y categoría coinciden en los 125 casos. Los campos de Documentación y Procedimiento coinciden materialmente con ORIGEN; se encontraron 13 diferencias de espacios/normalización ya previstas por la generación de la base pública, no un intercambio de datos entre registros.

Los datos del catálogo y del relevamiento **no se modifican**. Los ajustes sólo determinan cómo renderizar el contenido autorizado. La ficha R036 conserva expresamente la composición y documentos/pasos definidos en Figma, que son una excepción editorial a revisar por separado.

## Clasificación de los 125 procedimientos

| Tratamiento | Cantidad | IDs |
|---|---:|---|
| Pasos numerados (líneas) | 8 | R018, R019, R020, R021, R022, R023, R029, R030 |
| Descripción sin enumeración inequívoca | 79 | R032, R117, R122, R124, R041, R087, R097, R099, R102, R001, R028, R035, R081, R082, R083, R084, R085, R086, R088, R100, R101, R103, R107, R108, R109, R110, R111, R112, R113, R005, R014, R015, R016, R017, R024, R025, R027, R038, R039, R043, R047, R042, R056, R057, R058, R059, R060, R061, R062, R063, R064, R065, R067, R069, R071, R073, R075, R077, R079, R011, R012, R013, R051, R054, R002, R050, R068, R076, R070, R078, R094, R098, R104, R116, R003, R004, R006, R007, R008 |
| Lista en campo de procedimiento | 1 | R033 |
| Etapas separadas por guiones | 5 | R121, R123, R132, R031, R034 |
| Etapas por oraciones verificadas | 1 | R131 |
| Etapas separadas por barras | 3 | R133, R037, R009 |
| Variante de Figma | 1 | R036 |
| Varias líneas | 13 | R046, R095, R096, R119, R120, R126, R044, R045, R066, R090, R072, R074, R080 |
| Pasos numerados (texto) | 8 | R089, R091, R092, R093, R105, R106, R053, R055 |
| Sin procedimiento informado | 2 | R125, R052 |
| Pasos numerados (1-) | 4 | R114, R115, R118, R010 |

Un párrafo narrativo sin enumeración verificable **no** se divide mecánicamente. Si describe un circuito, se conserva en texto continuo hasta que su segmentación esté aprobada. Las secuencias numeradas, líneas y delimitadores inequívocos usan `tram-timeline` cuando corresponde. Los títulos o notas previas a una numeración no se convierten en pasos.

## Tratamiento de documentación

- Se eliminó de **todas las fichas** la introducción genérica «Para realizar el trámite te van a solicitar la siguiente documentación».
- Cuando ORIGEN da una lista real de documentos, se conservan los ítems y el diseño con ícono de archivo.
- Cuando indica «No hay», «No se requiere», «Ninguna», «No» o un guion, no se muestra una falsa lista documental.
- Cuando no identifica la documentación con suficiente precisión («Varias», «No lo dice el portal» o remisión genérica a un área), se oculta el ícono de documento y se marca como pendiente editorial, **sin afirmar falsamente que no requiere documentación**.
- Total de **12 fichas** sin documentos ni notas publicables: R124, R031, R043, R057, R058, R059, R060, R061, R064, R070, R072, R035. El índice tampoco muestra anclas a secciones ausentes.
- **R051 y R116** contienen información documental específica o condicional escrita como texto explicativo. Se conserva íntegra como nota dentro de Documentación, sin mostrar un documento ficticio con ícono.

## Pendientes editoriales (sin suposiciones)

| IDs | Hallazgo |
|---|---|
| R031 | ORIGEN dice «no lo dice el PORTAL»: falta detalle de documentos |
| R035 | ORIGEN remite a Mesa de Entradas/eLomas para conocer documentación; el circuito interno es un texto sin hitos inequívocos |
| R043 | ORIGEN sólo dice «varias» como documentación |
| R051 | ORIGEN describe documentación por programa y detalla resumen de historia clínica, órdenes médicas e imágenes: se muestra como nota completa; requiere decisión editorial para desglosar los documentos por tipo de gestión |
| R052 y R125 | ORIGEN registra «.» en lugar del circuito de pasos; se omite «¿Cómo se realiza?» |
| R033 | La columna de procedimiento enumera documentos, no acciones; se conserva lista simple, no se inventa timeline |
| R034 | La columna de circuito enumera dependencias internas; validar si esa secuencia debería presentarse al vecino |
| R036 | Contenido de documentos/pasos específico de la ficha diseñada en Figma; cotejar validación editorial por separado si cambia |
| R041 | Documentación condicional dependiente de tipo de plano, necesita precisión editorial |
| R116 | La documentación varía según cada persona; una lista fija sería engañosa |
| R121 | ORIGEN dice «nota infarmativa»; errata de origen, requiere revisión editorial antes de cambiar el dato |
| R119 y R120 | Procedimientos largos entre áreas, requieren simplificación aprobada para lenguaje ciudadano |

## Matriz de las 125 fichas

| ID | Nombre público | Documentación renderizada | Procedimiento renderizado |
|---|---|---|---|
| R018 | Dar de alta un automotor para pagar la patente del Municipio | Listado desde ORIGEN | Pasos numerados (líneas) |
| R019 | Dar de alta una moto para pagar la patente municipal | Listado desde ORIGEN | Pasos numerados (líneas) |
| R020 | Dar de baja un automotor por cambio de radicación | Listado desde ORIGEN | Pasos numerados (líneas) |
| R021 | Dar de baja una moto por cambio de radicación | Listado desde ORIGEN | Pasos numerados (líneas) |
| R022 | Cambiar la titularidad impositiva de un vehículo | Listado desde ORIGEN | Pasos numerados (líneas) |
| R023 | Solicitar la exención de patente por discapacidad | Listado desde ORIGEN | Pasos numerados (líneas) |
| R029 | Dar de baja un automotor por robo | Listado desde ORIGEN | Pasos numerados (líneas) |
| R030 | Dar de baja un automotor por destrucción | Listado desde ORIGEN | Pasos numerados (líneas) |
| R032 | Hacer una denuncia impositiva por venta de vehículo | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R033 | Dar de baja una moto por robo o destrucción | Listado desde ORIGEN | Lista en campo de procedimiento |
| R117 | Obtener o renovar la licencia de conducir | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R121 | Solicitar permiso de estacionamiento por mudanza | Listado desde ORIGEN | Etapas separadas por guiones |
| R122 | Pedir control de alcoholemia para un viaje escolar | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R123 | Solicitar corte de calle, acompañamiento o permiso de carga | Listado desde ORIGEN | Etapas separadas por guiones |
| R124 | Reclamar por un vehículo mal estacionado por teléfono | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R131 | Solicitar acompañamiento de inspectores de tránsito | Listado desde ORIGEN | Etapas por oraciones verificadas |
| R132 | Solicitar espacio para carga, descarga o volquetes | Listado desde ORIGEN | Etapas separadas por guiones |
| R133 | Solicitar corte de tránsito para un evento | Listado desde ORIGEN | Etapas separadas por barras |
| R036 | Solicitar un certificado para escribanía | Documentos aprobados en Figma | Variante de Figma |
| R037 | Obtener un informe de deuda para la carpeta de obra | Listado desde ORIGEN | Etapas separadas por barras |
| R041 | Actualizar datos por subdivisión o unificación de inmueble | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R046 | Consultar el número de expediente o plano de obra | Listado desde ORIGEN | Varias líneas |
| R087 | Solicitar la aprobación de planos de obra | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R089 | Solicitar visado de plano de mensura | Listado desde ORIGEN | Pasos numerados (texto) |
| R091 | Inscribir la matrícula profesional para trámites de obra | Listado desde ORIGEN | Pasos numerados (texto) |
| R092 | Solicitar autenticación de plano de obra o mensura | Listado desde ORIGEN | Pasos numerados (texto) |
| R093 | Solicitar un certificado catastral | Listado desde ORIGEN | Pasos numerados (texto) |
| R095 | Solicitar firma del Certificado de Aptitud de Instalación Eléctrica | Listado desde ORIGEN | Varias líneas |
| R096 | Solicitar permiso de luz o fuerza motriz | Listado desde ORIGEN | Varias líneas |
| R097 | Inscribir profesionales para trámites técnicos del Municipio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R099 | Habilitar ascensores y equipos elevadores | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R102 | Presentar y visar planos de electromecánica | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R105 | Solicitar evaluación de proyectos en inmuebles patrimoniales | Listado desde ORIGEN | Pasos numerados (texto) |
| R119 | Solicitar escrituración por prescripción administrativa | Listado desde ORIGEN | Varias líneas |
| R120 | Solicitar escrituración por prescripción en barrios populares | Listado desde ORIGEN | Varias líneas |
| R125 | Solicitar protección de la vivienda familiar | Listado desde ORIGEN | Sin procedimiento informado |
| R126 | Solicitar escrituración social | Listado desde ORIGEN | Varias líneas |
| R001 | Inscribirse como proveedor del Municipio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R028 | Gestionar la habilitación, transferencia o cierre de un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R035 | Dar de baja un comercio en la tasa comercial | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R081 | Habilitar un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R082 | Dar de baja un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R083 | Tramitar licencia para vender bebidas alcohólicas (ReBA) | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R084 | Transferir un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R085 | Solicitar habilitación comercial provisoria | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R086 | Trasladar un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R088 | Solicitar permiso para ocupar espacio público frente a un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R100 | Cambiar el rubro de un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R101 | Ampliar la superficie de un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R103 | Solicitar aumento de potencia de un comercio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R107 | Solicitar autorización de funcionamiento de un natatorio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R108 | Habilitar una empresa conservadora de ascensores | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R109 | Solicitar habilitación para una feria franca | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R110 | Solicitar habilitación comercial por discapacidad | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R111 | Habilitar transporte de sustancias alimenticias | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R112 | Solicitar habilitación de un puesto de flores | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R113 | Solicitar Certificado de Complejidad Ambiental (CAA) | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R005 | Solicitar la eximición de la Tasa por Servicios Generales para instituciones | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R014 | Renovar la eximición de la Tasa por Servicios Generales para jubilados | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R015 | Solicitar o renovar la eximición de TSG para veteranos de guerra | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R016 | Solicitar por primera vez la eximición de TSG para jubilados | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R017 | Solicitar por primera vez la eximición de TSG para instituciones | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R024 | Solicitar una clave CIT para trámites de ARBA | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R025 | Presentar la declaración jurada de publicidad y ocupación | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R027 | Gestionar declaraciones, boletas y deudas de la tasa comercial | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R031 | Actualizar datos tributarios en el portal de autogestión | Omitido (no especificado/no requerido) | Etapas separadas por guiones |
| R034 | Dar de baja una unidad de comercio o vivienda | Listado desde ORIGEN | Etapas separadas por guiones |
| R038 | Solicitar la devolución de un pago duplicado | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R039 | Cambiar la titularidad de la Tasa por Servicios Generales | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R043 | Presentar documentación para una inspección fiscal | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R044 | Solicitar la devolución de un pago al Municipio | Listado desde ORIGEN | Varias líneas |
| R045 | Pedir la verificación de un pago al Municipio | Listado desde ORIGEN | Varias líneas |
| R047 | Solicitar la acreditación de un pago en otra cuenta | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R042 | Solicitar la inclusión o exclusión del alumbrado público | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R056 | Adherirse al programa de Recolección Textil | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R057 | Inscribir un comercio en Mi Comercio Recicla | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R058 | Inscribir un club en Mi Club Recicla | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R059 | Inscribir un edificio en Mi Edificio Recicla | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R060 | Sumarse al programa Día Verde | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R061 | Inscribirse como voluntario de la reserva natural | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R062 | Solicitar poda extraordinaria de un árbol | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R063 | Pedir autorización para podar raíces de un árbol | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R064 | Solicitar despeje de ramas que afectan el alumbrado | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R065 | Pedir autorización para podar un árbol | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R066 | Pedir autorización para extraer un árbol | Listado desde ORIGEN | Varias líneas |
| R067 | Solicitar la plantación de un árbol | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R069 | Reclamar la limpieza de un sumidero tapado | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R071 | Solicitar arreglo de una plaza o sus juegos | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R073 | Solicitar corte de pasto extraordinario | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R075 | Reclamar la limpieza de una zanja obstruida | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R077 | Denunciar un microbasural | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R079 | Solicitar semillas para una huerta | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R106 | Presentar una denuncia sobre obras o inmuebles | Listado desde ORIGEN | Pasos numerados (texto) |
| R009 | Tramitar el Certificado Único de Discapacidad (CUD) | Listado desde ORIGEN | Etapas separadas por barras |
| R011 | Solicitar atención en el servicio terapéutico y TEA | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R012 | Solicitar vacante en el Taller Protegido o un Centro de Día | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R013 | Inscribirse en el relevamiento de personas electrodependientes | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R051 | Solicitar estudios, prótesis, oxígeno o medicamentos | Nota documental de ORIGEN (sin ícono ficticio) | Descripción sin enumeración inequívoca |
| R052 | Solicitar turnos en centros de salud y hospitales | Listado desde ORIGEN | Sin procedimiento informado |
| R053 | Obtener la libreta sanitaria | Listado desde ORIGEN | Pasos numerados (texto) |
| R054 | Sacar turno para castrar a una mascota | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R002 | Hacer un reclamo de defensa del consumidor | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R050 | Solicitar asistencia y acompañamiento a víctimas | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R055 | Solicitar acompañamiento por violencia de género | Listado desde ORIGEN | Pasos numerados (texto) |
| R068 | Solicitar un módulo alimentario | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R076 | Solicitar asistencia habitacional | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R090 | Solicitar acompañamiento en el abordaje de masculinidades | Listado desde ORIGEN | Varias líneas |
| R070 | Solicitar una visita educativa a la reserva | Omitido (no especificado/no requerido) | Descripción sin enumeración inequívoca |
| R072 | Solicitar talleres de educación ambiental | Omitido (no especificado/no requerido) | Varias líneas |
| R074 | Inscribirse a cursos y tecnicaturas | Listado desde ORIGEN | Varias líneas |
| R078 | Inscribirse a cursos y talleres | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R080 | Inscribirse a talleres de oficios para emprendedoras | Listado desde ORIGEN | Varias líneas |
| R094 | Inscribirse a talleres de centros culturales | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R098 | Inscribirse a las escuelas del Municipio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R104 | Solicitar un artista o equipo de sonido para una institución | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R114 | Tramitar el DNI o actualizar tus datos | Listado desde ORIGEN | Pasos numerados (1-) |
| R115 | Solicitar el pasaporte argentino | Listado desde ORIGEN | Pasos numerados (1-) |
| R116 | Solicitar acompañamiento para tramitar documentación personal | Nota condicional de ORIGEN (sin ícono ficticio) | Descripción sin enumeración inequívoca |
| R118 | Recibir orientación para regularización migratoria y DNI | Listado desde ORIGEN | Pasos numerados (1-) |
| R003 | Solicitar el reconocimiento del Municipio para una institución | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R004 | Gestionar la personería jurídica de una institución | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R010 | Inscribir una comunidad religiosa en el Registro de Culto del Municipio | Listado desde ORIGEN | Pasos numerados (1-) |
| R006 | Renovar el arrendamiento en el cementerio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R007 | Solicitar el traslado de una persona fallecida | Listado desde ORIGEN | Descripción sin enumeración inequívoca |
| R008 | Solicitar una inhumación en el cementerio | Listado desde ORIGEN | Descripción sin enumeración inequívoca |

## Pruebas reproducibles

- `npm run validate:tramites`: 125 IDs, tipado de campos públicos, rutas y fuentes sin contactos privados.
- `tests/e2e/tramites-integridad-125.spec.ts`: recorre **todos los 125 IDs** en desktop y móvil de 390 px y verifica el nombre editorial, secciones condicionales, cantidad de documentos, pasos, notas, listas, ausencia de textos genéricos, ausencia del enlace genérico y desbordes móviles.
- `tests/e2e/tramites-react.spec.ts`: casos individuales de numeración por líneas, `1-`, barras, guiones, alternativas, procedimientos vacíos y documentación no especificada.
- Las pruebas estructurales no sustituyen una revisión editorial de las secuencias narrativas complejas ni una comparación visual píxel a píxel de las 125 fichas.
