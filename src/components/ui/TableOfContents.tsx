import type { Initiative } from '../../data/jovenes';

function BookmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 4.5h12v15l-6-4-6 4v-15Z" />
    </svg>
  );
}

export function TableOfContents({ initiatives }: { initiatives: Initiative[] }) {
  return (
    <div className="rounded-[4px] bg-panel p-6">
      <h2 className="mb-4 text-[24px] leading-[30px] font-bold text-primary-600">
        Índice
      </h2>
      <nav aria-label="Índice de iniciativas">
        <ol className="flex flex-col gap-4">
          {initiatives.map((item) => (
            <li key={item.id}>
              <a
                href={'#' + item.id}
                className="flex items-start gap-2 rounded-sm text-[18px] leading-[26px] font-bold text-primary-600 hover:underline focus-visible:outline-2 focus-visible:outline-primary-600"
              >
                <span className="mt-0.5 shrink-0">
                  <BookmarkIcon />
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
