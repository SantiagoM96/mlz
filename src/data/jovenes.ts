export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] };

export type Initiative = {
  id: string;
  title: string;
  blocks: ContentBlock[];
  showPointsButton?: boolean;
};

export const introduction = [
  'Desde Jóvenes en Comunidad fomentamos la participación democrática y ciudadana de las juventudes como un componente social y comunitario.',
  'Acompañamos, fortalecemos y articulamos con los Centros de Estudiantes y facilitamos talleres de formación y herramientas para los chicos y chicas de Lomas.',
  'Tenemos el programa Punto Joven, que ofrece cursos, talleres, y eventos culturales, deportivos y de ocio; además de coordinar con diversas áreas del Municipio para fomentar la recreación y el compañerismo.',
];

export const initiatives: Initiative[] = [
  {
    id: 'punto-joven', title: 'Punto Joven', showPointsButton: true,
    blocks: [
      { kind: 'paragraph', text: 'Punto Joven es un programa destinado a jóvenes de entre 12 y 29 años que ofrece talleres, cursos, propuestas culturales, encuentros comunitarios y actividades recreativas en distintos barrios de Lomas.' },
      { kind: 'paragraph', text: 'Las actividades son gratuitas y las inscripciones están abiertas durante todo el año. Para participar, es necesario completar un formulario o una planilla de inscripción.' },
      { kind: 'paragraph', text: 'Conocé los Puntos Jóvenes, encontrá la sede más cercana y accedé al formulario de inscripción.' },
    ],
  },
  {
    id: 'participacion-estudiantil', title: 'Participación y Organización Estudiantil',
    blocks: [
      { kind: 'paragraph', text: 'Acompañamos y asesoramos a los estudiantes de las escuelas secundarias y del nivel superior del distrito para que cada institución cuente con su Centro de Estudiantes.' },
      { kind: 'paragraph', text: 'Facilitamos propuestas, proyectos e iniciativas con el objetivo de promover la participación democrática y el compromiso con la comunidad educativa.' },
    ],
  },
  {
    id: 'copa-joven', title: 'Copa Joven',
    blocks: [
      { kind: 'paragraph', text: 'Es una iniciativa itinerante deportiva de torneos recreativos que promueve la integración, el juego y la convivencia sana entre chicos y chicas.' },
      { kind: 'paragraph', text: 'A través de competencias en distintas disciplinas, promueve el desarrollo comunitario y fortalece el espíritu de compañerismo.' },
      { kind: 'paragraph', text: 'Está abierta a equipos, organizaciones y familias y quienes quieran participar y formar equipos de competencias con la comunidad y bajo equipos del Municipio.' },
    ],
  },
  {
    id: 'construyendo-democracia', title: 'Construyendo Democracia',
    blocks: [
      { kind: 'paragraph', text: 'Este programa brinda acompañamiento, herramientas y un espacio para promover los derechos de las y los jóvenes. A través de encuentros participativos y debates se busca impulsar su protagonismo en los temas que atraviesan su cotidianidad.' },
      { kind: 'paragraph', text: 'Entre sus ejes de trabajo se abordan propuestas sobre:' },
      { kind: 'list', items: ['Género y diversidad.', 'Convivencia y prevención de violencias.', 'Ambiente y desarrollo sostenible.', 'Ciudadanía digital y autocuidado.', 'Participación y organización juvenil.'] },
      { kind: 'paragraph', text: 'Si querés participar, podés escribirnos a nuestro instagram @jovenesencomunidad' },
    ],
  },
  {
    id: 'voto-joven', title: 'Voto Joven',
    blocks: [
      { kind: 'paragraph', text: 'Ofrecemos charlas y talleres para acompañar y reflexionar junto a jóvenes que votan por primera vez, entendiendo la importancia de su rol en la democracia.' },
      { kind: 'paragraph', text: 'En estos encuentros se tratan temas como las leyes Sáenz Peña, derechos políticos y voto joven, la organización del Estado, frentes electorales, cómo funciona el proceso electoral, el voto migrante y las plataformas electorales.' },
      { kind: 'paragraph', text: 'Si representás a una institución y te interesa coordinar un encuentro, escribinos a @jovenesencomunidad' },
    ],
  },
  {
    id: 'lideres-ambientales', title: 'Líderes ambientales',
    blocks: [
      { kind: 'paragraph', text: 'Proponemos y apoyamos a las escuelas secundarias en la formación de grupos de Líderes Ambientales Escolares, con el objetivo de “ambientalizar” las instituciones educativas y valorizar las experiencias actuales.' },
      { kind: 'paragraph', text: 'Nos enfocamos en identificar y capacitar a estudiantes interesados en convertirse en líderes ambientales, trabajando en colaboración con los centros de estudiantes para implementar buenas prácticas ambientales en sus escuelas y comunidades.' },
    ],
  },
  {
    id: 'impulso-joven', title: 'Impulso Joven',
    blocks: [
      { kind: 'paragraph', text: 'Impulso Joven es un programa de formación y desarrollo profesional para jóvenes de 16 a 29 años que ofrece una propuesta de formación en oficios tradicionales, herramientas digitales y administración o educación financiera para responder a las demandas del mercado laboral.' },
      { kind: 'paragraph', text: 'El proyecto acompaña las trayectorias formativas con asesoramiento integral para potenciar las competencias para el empleo. Al finalizar los cursos, brinda los recursos prácticos necesarios para que cada participante pueda diseñar y poner en marcha su primer proyecto.' },
    ],
  },
  {
    id: 'atardecer-joven', title: 'Atardecer Joven',
    blocks: [
      { kind: 'paragraph', text: 'Es una propuesta destinada a promover espacios de encuentro para las juventudes y la comunidad en general mediante actividades recreativas, culturales, deportivas y artísticas desarrolladas en espacios públicos.' },
      { kind: 'paragraph', text: 'Entre las propuestas posibles se incluyen:' },
      { kind: 'list', items: ['Radio abierta o streaming.', 'Stands.', 'Espacio literario.', 'Presentaciones artísticas y culturales.', 'Espacio de juegos.', 'Actividades deportivas.', 'Intervenciones recreativas y comunitarias.'] },
    ],
  },
  {
    id: 'liga-joven', title: 'Liga Joven de la Comunidad',
    blocks: [
      { kind: 'paragraph', text: 'Es una propuesta deportiva competitiva de Futsal destinada a equipos en tres categorías (Sub-15, Sub-18 y Sub-21) que se lleva a cabo todos los sábados en distintas sedes de Lomas de Zamora. Busca consolidar una liga estable y formativa que funcione como un espacio de encuentro, deporte y disfrute para las y los jóvenes, sirviendo además como punto de acceso a las diversas herramientas y programas del municipio.' },
    ],
  },
];
