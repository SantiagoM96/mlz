import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PageContainer } from '../layout/PageContainer';

const menuLabels = ['Municipio', 'Gestión', 'Trámites', 'Turnos'];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const logo = import.meta.env.BASE_URL + 'assets/municipio-logo.png';

  return (
    <header className="bg-brand-600 text-white">
      <PageContainer className="flex min-h-[104px] items-center justify-between gap-4">
        <Link
          to="/"
          className="min-w-0 shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Municipio de Lomas de Zamora: inicio"
          onClick={() => setOpen(false)}
        >
          <img
            src={logo}
            width="277"
            height="72"
            className="h-auto w-[min(277px,calc(100vw-112px))] object-contain lg:w-[277px]"
            alt="Municipio de Lomas de Zamora — Gobierno de la Comunidad"
          />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-5 lg:flex">
          {menuLabels.map((label) => (
            <span key={label} className="px-1 py-3 text-[18px] font-bold">
              {label}
              {label !== 'Municipio' && (
                <span aria-hidden="true" className="ml-2">
                  ›
                </span>
              )}
            </span>
          ))}
        </nav>

        <span className="hidden shrink-0 text-right text-[15px] leading-4 font-bold lg:block">
          Comunidad
          <br />
          <span className="text-[23px]">LOMAS</span>
        </span>

        <button
          type="button"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[4px] bg-brand-500 text-white hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
          aria-controls="menu-municipal"
          aria-expanded={open}
          aria-label={open ? 'Cerrar navegación' : 'Abrir navegación'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l14 14M19 5 5 19" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </PageContainer>

      {open && (
        <nav
          id="menu-municipal"
          aria-label="Navegación móvil"
          className="border-t border-white/20 bg-brand-700 lg:hidden"
        >
          <PageContainer className="flex flex-col py-3">
            <Link
              to="/"
              className="px-3 py-3 font-bold focus-visible:outline-white"
              onClick={() => setOpen(false)}
            >
              Inicio
            </Link>
            <Link
              to="/jovenes-en-comunidad"
              aria-current={
                location.pathname.endsWith('/jovenes-en-comunidad') ? 'page' : undefined
              }
              className="px-3 py-3 font-bold focus-visible:outline-white"
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
