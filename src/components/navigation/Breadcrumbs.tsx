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
 * Breadcrumb institucional: una sola línea, con el elemento actual truncado
 * cuando no entra. En mobile se mantienen visibles el padre y la página actual.
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // El breadcrumb institucional siempre utiliza el azul primario.
  const linkColor = 'text-primary-600 visited:text-primary-600 hover:text-primary-600';

  return (
    <nav
      aria-label="Ruta de navegación"
      className={`my-6 w-full min-w-0 text-[18px] leading-6
        text-primary-600 ${className}`}
    >
      <ol className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isParent = index === items.length - 2;
          const hideOnMobile = index < items.length - 2;
          const classes = `rounded-sm ${isLast ? 'block min-w-0 truncate font-bold' : 'font-medium whitespace-nowrap'}`;

          return (
            <li
              key={index}
              className={`min-w-0 items-center gap-2
                ${isLast ? 'inline-flex flex-1' : hideOnMobile ? 'hidden shrink-0 sm:inline-flex' : 'inline-flex shrink-0'}`}
            >
              {index > 0 && (
                <MaterialIcon
                  name="chevron_right" size={24}
                  className={`shrink-0 ${isParent && items.length > 2 ? 'hidden sm:inline-flex' : ''}`}
                />
              )}
              {item.to && !isLast ? (
                <Link
                  className={`${classes} ${linkColor} underline-offset-2 hover:underline
                    focus-visible:outline-2 focus-visible:outline-primary-600`}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={classes}
                  title={isLast ? item.label : undefined}
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
