import { IconLink } from './IconLink';
import { InfoCard } from './InfoCard';

export interface TableOfContentsItem {
  id: string;
  label: string;
}

export interface TableOfContentsProps {
  items: readonly TableOfContentsItem[];
  title?: string;
}

/** Índice reutilizable e independiente del modelo de datos de cada página. */
export function TableOfContents({ items, title = 'Índice' }: TableOfContentsProps) {
  return (
    <InfoCard title={title}>
      <nav aria-label="Índice de iniciativas">
        <ol className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id}>
              <IconLink icon="bookmark" href={'#' + item.id}>
                {item.label}
              </IconLink>
            </li>
          ))}
        </ol>
      </nav>
    </InfoCard>
  );
}
