import { PageContainer } from '../../components/layout/PageContainer';

export function HomePage() {
  return (
    <PageContainer className="min-h-[50vh] py-12">
      <h1 className="mb-4 text-[32px] font-bold text-primary-600">
        Municipio de Lomas de Zamora
      </h1>
      <p className="max-w-[720px] text-[18px] leading-7">
        Portada provisional del repositorio de prototipos web municipales.
      </p>
      <p className="mt-4 max-w-[720px] text-[18px] leading-7">
        Los prototipos independientes de BAE, Crónica y Deportes conservan sus rutas existentes.
      </p>
    </PageContainer>
  );
}
