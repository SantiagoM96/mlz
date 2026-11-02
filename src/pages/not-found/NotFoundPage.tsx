import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';

export function NotFoundPage() {
  return <PageContainer className="flex min-h-[50vh] flex-col items-start justify-center py-16">
    <p className="text-[72px] leading-none font-bold text-primary-600">404</p>
    <h1 className="mt-4 text-[30px] font-bold text-primary-600">No encontramos esta página</h1>
    <p className="mt-3 text-[18px]">Puede que la dirección haya cambiado o que la página todavía no esté disponible.</p>
    <Link to="/" className="mt-7 inline-flex min-h-12 items-center rounded bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-700">Volver al inicio</Link>
  </PageContainer>;
}
