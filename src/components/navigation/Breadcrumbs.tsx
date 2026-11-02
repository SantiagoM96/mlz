import { Link } from 'react-router-dom';

type Breadcrumb = { label: string; to?: string };

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="my-6 text-[13px] leading-6 text-brand-600">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => <li key={item.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-neutral-400" aria-hidden="true">›</span>}
          {item.to ? <Link className="rounded-sm underline-offset-2 hover:underline focus-visible:outline-2" to={item.to}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
        </li>)}
      </ol>
    </nav>
  );
}
