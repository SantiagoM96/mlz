import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SiteLayout } from '../layouts/SiteLayout';
import { HomePage } from '../pages/home/HomePage';
import { AgendaPage } from '../pages/agenda/AgendaPage';
import { AgendaHomePage } from '../pages/agenda/AgendaHomePage';
import { AgendaActivityDetailPage } from '../pages/agenda/AgendaActivityDetailPage';
import { AgendaConsolePreviewPage } from '../pages/agenda/AgendaConsolePreviewPage';
import { JovenesEnComunidadPage } from '../pages/jovenes-en-comunidad/JovenesEnComunidadPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';
import { TramitesCatalogPage, TramiteDetailPage } from '../pages/tramites/TramitesPages';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const router = createBrowserRouter([{
  element: <SiteLayout />,
  children: [
    { path: '/', element: <HomePage /> },
    { path: '/agenda-de-la-comunidad', element: <AgendaHomePage /> },
    { path: '/agenda-de-la-comunidad/actividades', element: <AgendaPage /> },
    { path: '/agenda-de-la-comunidad/actividades/:id', element: <AgendaActivityDetailPage /> },
    { path: '/jovenes-en-comunidad', element: <JovenesEnComunidadPage /> },
    { path: '/tramites', element: <TramitesCatalogPage /> },
    { path: '/tramites/:id', element: <TramiteDetailPage /> },
    { path: '*', element: <NotFoundPage /> },
  ],
}, {
  path: '/agenda-de-la-comunidad/consola-preview',
  element: <AgendaConsolePreviewPage />,
}], { basename });
export function AppRouter() { return <RouterProvider router={router} />; }
