import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SiteLayout } from '../layouts/SiteLayout';
import { HomePage } from '../pages/home/HomePage';
import { AgendaPage } from '../pages/agenda/AgendaPage';
import { JovenesEnComunidadPage } from '../pages/jovenes-en-comunidad/JovenesEnComunidadPage';
import { NotFoundPage } from '../pages/not-found/NotFoundPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const router = createBrowserRouter(
  [{
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/agenda-de-la-comunidad', element: <AgendaPage /> },
      { path: '/jovenes-en-comunidad', element: <JovenesEnComunidadPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  }],
  { basename },
);

export function AppRouter() { return <RouterProvider router={router} />; }
