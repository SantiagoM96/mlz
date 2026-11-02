import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';
import { MaterialIcon } from '../ui/MaterialIcon';

const desktopMenu = [
  { label: 'Municipio', hasChevron: false },
  { label: 'Gestión', hasChevron: true },
  { label: 'Trámites', hasChevron: true },
  { label: 'Turnos', hasChevron: true },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const logoMunicipio = import.meta.env.BASE_URL + 'assets/logo-municipio-blanco.svg';
  const logoComunidad = import.meta.env.BASE_URL + 'assets/logo-comunidad-blanco.svg';

  return (
    <header className="bg-primary-600 text-white">
      <PageContainer className="site-header-content flex h-[104px] items-center justify-between gap-4">
        <Link
          to="/"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Municipio de Lomas de Zamora: ir al inicio"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoMunicipio}
            width="286"
            height="72"
            className="block h-auto w-[min(286px,calc(100vw-112px))] xl:w-[286px]"
            alt="Municipio de Lomas de Zamora — Gobierno de la Comunidad"
          />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-4 xl:flex">
          {desktopMenu.map(({ label, hasChevron }) =>
            label === 'Municipio' ? (
              <Link
                key={label}
                to="/"
                className="inline-flex min-h-12 items-center rounded-[4px] px-4 text-[18px] leading-[26px] font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
              >
                {label}
              </Link>
            ) : (
              <span
                key={label}
                className="inline-flex min-h-12 items-center gap-2 px-4 text-[18px] leading-[26px] font-bold"
              >
                {label}
                {hasChevron && <MaterialIcon name="chevron_right" size={24} />}
              </span>
            ),
          )}
        </nav>

        <img
          src={logoComunidad}
          width="131"
          height="40"
          className="hidden h-10 w-[131px] shrink-0 xl:block"
          alt="Comunidad Lomas"
        />

        <button
          type="button"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-primary-500 transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:hidden"
          aria-controls="menu-municipal"
          aria-expanded={open}
          aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <MaterialIcon name="close" size={24} />
          ) : (
            <MaterialIcon name="menu" size={24} />
          )}
        </button>
      </PageContainer>

      {open && (
        <nav
          id="menu-municipal"
          aria-label="Navegación móvil"
          className="border-t border-white/20 bg-primary-700 xl:hidden"
        >
          <PageContainer className="flex flex-col py-3">
            <Link
              to="/"
              className="rounded-sm px-3 py-3 font-bold focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/agenda-de-la-comunidad"
              aria-current={location.pathname.endsWith('/agenda-de-la-comunidad') ? 'page' : undefined}
              className="rounded-sm px-3 py-3 font-bold focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setOpen(false)}
            >
              Agenda de la Comunidad
            </Link>
            <Link
              to="/jovenes-en-comunidad"
              aria-current={location.pathname.endsWith('/jovenes-en-comunidad') ? 'page' : undefined}
              className="rounded-sm px-3 py-3 font-bold focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setOpen(false)}
            >
              Jóvenes en Comunidad
            </Link>
            <p className="px-3 pt-3 text-sm text-white/75">
              Próximamente: Gestión, Trámites y Turnos
            </p>
          </PageContainer>
        </nav>
      )}
    </header>
  );
}
