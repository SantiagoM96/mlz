import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './app/router';
import 'material-symbols/outlined.css';
import './styles/globals.css';

const mount = document.getElementById('root');
if (!mount) throw new Error('No se encontró el contenedor raíz de la aplicación');

createRoot(mount).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
