import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/layout/PageContainer';
import { MaterialIcon } from '../../components/ui/MaterialIcon';

export function HomePage() {
  return (
    <PageContainer className="min-h-[50vh] py-12">
      <h1 className="mb-4 text-[32px] font-bold text-primary-600">Municipio de Lomas de Zamora</h1>
      <p className="max-w-[720px] text-[18px] leading-7">La portada general del municipio se incorporará cuando esté disponible su diseño.</p>
      <Link to="/agenda-de-la-comunidad" className="mt-6 inline-flex min-h-12 items-center rounded bg-primary-600 px-6 py-2 font-bold text-white hover:bg-primary-700">
        Ver Agenda de la Comunidad <MaterialIcon name="chevron_right" size={20} className="ml-2" />
      </Link>
    </PageContainer>
  );
}
