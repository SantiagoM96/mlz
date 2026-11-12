import { agendaV2PreviewActivities } from '../../../data/agenda-v2-previews';
import { getPublicActivityList } from './publicActivityViews';

/** Los mismos diez casos públicos se muestran en el buscador y en la Home.
 * Datos ficticios de validación visual; no son eventos anunciados.
 */
const showcaseIds = new Set([
  'preview-v2-yoga-dos-sedes',
  'preview-v2-folklore',
  'preview-v2-futbol',
  'preview-v2-reciclaje',
  'preview-v2-muestra',
  'preview-v2-compostaje',
  'preview-v2-huerta',
]);

export const publicAgendaShowcase = getPublicActivityList(
  agendaV2PreviewActivities.filter(activity => showcaseIds.has(activity.id)),
);
