import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';

export function HomePage() {
  return <PageContainer className="min-h-[50vh] py-12">
    <h1 className="mb-4 text-[32px] font-bold text-brand-600">Municipio de Lomas de Zamora</h1>
    <p className="max-w-[720px] text-[18px] leading-7">Esta es una página provisional. La Home municipal se incorporará cuando esté disponible su diseño definitivo.</p>
    <Link to="/jovenes-en-comunidad" className="mt-6 inline-flex min-h-12 items-center rounded bg-brand-600 px-6 py-2 font-bold text-white hover:bg-brand-700">Ver Jóvenes en Comunidad <span aria-hidden="true" className="ml-2">›</span></Link>
  </PageContainer>;
}
