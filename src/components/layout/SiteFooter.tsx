import { PageContainer } from './PageContainer';

const emergencyNumbers = [
  { number: '100', service: 'Bomberos' },
  { number: '103', service: 'Defensa Civil' },
  { number: '107', service: 'Emergencias' },
  { number: '911', service: 'Policía' },
  { number: '147', service: 'Seguridad Lomas' },
  { number: '144', service: 'Violencia de Género' },
];

export function SiteFooter() {
  const logo = import.meta.env.BASE_URL + 'assets/municipio-logo.png';
  return <footer className="mt-8 bg-brand-600 py-10 text-white">
    <PageContainer className="space-y-6">
      <img className="h-auto w-[277px] max-w-full" src={logo} width="277" height="72" alt="Municipio de Lomas de Zamora — Gobierno de la Comunidad" />
      <section aria-label="Centro de atención a la comunidad" className="space-y-4">
        <h2 className="text-2xl leading-8 font-bold">Centro de Atención a la Comunidad</h2>
        <div className="flex flex-wrap gap-4">
          <span className="inline-flex min-h-12 items-center rounded bg-success-500 px-6 text-[18px] font-bold">Escribinos por WhatsApp</span>
          <span className="inline-flex min-h-12 items-center rounded bg-brand-500 px-6 text-[18px] font-bold">Formulario de Consultas</span>
        </div>
        <p className="flex flex-wrap gap-x-2 text-[24px] leading-tight font-bold md:text-[32px]"><span>0800-666-6666</span><span className="hidden sm:inline">|</span><span>0800-122-5662</span></p>
      </section>
      <nav aria-label="Enlaces institucionales" className="flex flex-wrap items-center gap-3 text-base">
        <span>Newsletter</span><span aria-hidden="true">|</span><span>Boletín Oficial</span><span aria-hidden="true">|</span><span>HCD</span>
      </nav>
      <section aria-label="Redes sociales" className="space-y-3">
        <h2 className="text-2xl leading-8 font-bold">¡Seguinos en nuestras redes!</h2>
        <div className="inline-flex flex-wrap items-center gap-3 rounded bg-white px-4 py-3 text-brand-600">
          <span aria-label="Instagram" title="Instagram" className="text-sm font-bold">IG</span>
          <span aria-label="X" title="X" className="text-sm font-bold">X</span>
          <span aria-label="TikTok" title="TikTok" className="text-sm font-bold">TT</span>
          <span aria-label="Facebook" title="Facebook" className="text-sm font-bold">f</span>
          <span aria-label="YouTube" title="YouTube" className="text-sm font-bold">YT</span>
        </div>
      </section>
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[16px] leading-[26px]">
        {emergencyNumbers.map((entry) => <li key={entry.number}><strong>{entry.number}</strong> {entry.service}</li>)}
      </ul>
      <p className="border-t border-white/40 pt-5 text-sm">© Municipio Lomas de Zamora | Todos los derechos reservados 2024.</p>
    </PageContainer>
  </footer>;
}
