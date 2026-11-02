import { Link } from 'react-router-dom';
import { MaterialIcon } from '../ui/MaterialIcon';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbsProps {
  items: readonly BreadcrumbItem[];
  className?: string;
  tone?: 'primary' | 'neutral';
}

/**
 * Reutilizable en todas las páginas. Figma: Geometria Medium 18,
 * último ítem Bold 18, separadores de 24 px y gap horizontal de 8 px.
 */
export function Breadcrumbs({ items, className = '', tone = 'primary' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Ruta de navegación"
      className={`my-6 w-full text-[18px] leading-6 ${tone === 'neutral' ? 'text-grey-900' : 'text-primary-600'} ${className}`}
    >
      <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const classes = `rounded-sm ${isLast ? 'font-bold break-words' : 'font-medium whitespace-nowrap'}`;

          return (
            <li key={index} className="inline-flex min-w-0 items-center gap-2">
              {index > 0 && <MaterialIcon name="chevron_right" size={24} />}
              {item.to && !isLast ? (
                <Link
                  className={`${classes} underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600`}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={classes}
                  aria-current={isLast ? 'page' : undefined}
                  data-testid={isLast ? 'breadcrumb-current' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
