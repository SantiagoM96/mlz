import { PageContainer } from './PageContainer';

const emergencyNumbers = [
  { number: '100', service: 'Bomberos' },
  { number: '103', service: 'Defensa Civil' },
  { number: '107', service: 'Emergencias' },
  { number: '911', service: 'Policía' },
  { number: '147', service: 'Seguridad Lomas' },
  { number: '144', service: 'Violencia de Género' },
];

const socialNetworks = ['instagram', 'x', 'tiktok', 'facebook', 'youtube'];

export function SiteFooter() {
  const logo = import.meta.env.BASE_URL + 'assets/logo-municipio-blanco.svg';

  return (
    <footer className="mt-8 bg-primary-600 py-10 text-white">
      <PageContainer className="space-y-6">
        <img
          className="block h-auto w-[350px] max-w-full"
          src={logo}
          width="286"
          height="72"
          alt="Municipio de Lomas de Zamora — Gobierno de la Comunidad"
        />

        <section aria-label="Centro de atención a la comunidad" className="space-y-4">
          <h2 className="text-[24px] leading-[30px] font-bold">
            Centro de Atención a la Comunidad
          </h2>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap">
            <span className="inline-flex min-h-12 items-center rounded bg-success-500 px-6 text-[18px] font-bold">
              Escribinos por WhatsApp
            </span>
            <span className="inline-flex min-h-12 items-center rounded bg-primary-500 px-6 text-[18px] font-bold">
              Formulario de Consultas
            </span>
          </div>
          <p className="flex flex-wrap gap-x-2 text-[32px] leading-[40px] font-bold">
            <span>0800-666-6666</span>
            <span aria-hidden="true">|</span>
            <span>0800-122-5662</span>
          </p>
        </section>

        <nav
          aria-label="Enlaces institucionales"
          className="flex flex-wrap items-center gap-3 text-base"
        >
          <span>Newsletter</span>
          <span aria-hidden="true">|</span>
          <span>Boletín Oficial</span>
          <span aria-hidden="true">|</span>
          <span>HCD</span>
        </nav>

        <section aria-label="Redes sociales" className="space-y-4">
          <h2 className="text-[24px] leading-[30px] font-bold">
            ¡Seguinos en nuestras redes!
          </h2>
          <div className="inline-flex h-12 w-[256px] items-center justify-between rounded bg-white px-4 text-primary-600">
            {socialNetworks.map((network) => (
              <span
                key={network}
                title={network}
                className="inline-flex h-6 w-6 items-center justify-center"
              >
                <img
                  src={import.meta.env.BASE_URL + 'assets/social/' + network + '.svg'}
                  alt={network}
                  width="24"
                  height="24"
                />
              </span>
            ))}
          </div>
        </section>

        <ul className="flex flex-wrap gap-x-4 gap-y-4 text-[18px] leading-[26px]">
          {emergencyNumbers.map((entry) => (
            <li key={entry.number}>
              <strong>{entry.number}</strong> {entry.service}
            </li>
          ))}
        </ul>
        <p className="border-t border-white/40 pt-5 text-sm">
          © Municipio Lomas de Zamora | Todos los derechos reservados 2024.
        </p>
      </PageContainer>
    </footer>
  );
}
