import type { MaterialIconName } from '../../components/ui/MaterialIcon';

/** Íconos semánticos del UI Kit, con una misma escala de 18 px en tags. */
const iconosPorDestinatario: Readonly<Record<string, MaterialIconName>> = {
  'Vecinos y vecinas': 'groups',
  'Profesionales': 'work_outline',
  'Comercios y empresas': 'storefront',
  'Instituciones': 'account_balance',
  'Organizaciones sociales': 'diversity_3',
};

export function iconoDestinatario(destinatario: string): MaterialIconName {
  return iconosPorDestinatario[destinatario] ?? 'groups';
}
