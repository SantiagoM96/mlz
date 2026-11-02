import { Outlet, ScrollRestoration } from 'react-router-dom';
import { SiteHeader } from '../components/navigation/SiteHeader';
import { SiteFooter } from '../components/layout/SiteFooter';

export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a className="skip-link" href="#contenido-principal">Saltar al contenido</a>
      <SiteHeader />
      <main id="contenido-principal" className="flex-1" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  );
}
