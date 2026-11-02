import { useEffect } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { PageContainer } from '../../components/layout/PageContainer';
import { Button } from '../../components/ui/Button';
import { TableOfContents } from '../../components/ui/TableOfContents';
import { initiatives, introduction, type ContentBlock, type Initiative } from '../../data/jovenes';

const instagramUrl = 'https://www.instagram.com/jovenesencomunidad/';

function LinkedParagraph({ text }: { text: string }) {
  const handle = '@jovenesencomunidad';
  const index = text.indexOf(handle);
  if (index === -1) return <p>{text}</p>;
  return <p>{text.slice(0, index)}<a href={instagramUrl} target="_blank" rel="noopener noreferrer">{handle}</a>{text.slice(index + handle.length)}</p>;
}

function Content({ blocks }: { blocks: ContentBlock[] }) {
  return <div className="article-copy">
    {blocks.map((block, index) => block.kind === 'paragraph'
      ? <LinkedParagraph key={index} text={block.text} />
      : <ul key={index}>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>)}
  </div>;
}

function InitiativeSection({ initiative, first }: { initiative: Initiative; first?: boolean }) {
  return <section id={initiative.id} className={'article-section ' + (first ? '!pt-0' : '')} aria-labelledby={'heading-' + initiative.id}>
    <h3 id={'heading-' + initiative.id}>{initiative.title}</h3>
    <Content blocks={initiative.blocks} />
    {initiative.showPointsButton && <div className="mt-6"><Button disabled title="La página de Puntos Jóvenes se incorporará en una etapa posterior">Ver Puntos Jóvenes <span aria-hidden="true">›</span></Button></div>}
  </section>;
}

export function JovenesEnComunidadPage() {
  useEffect(() => { document.title = 'Jóvenes en Comunidad | Municipio Lomas de Zamora'; }, []);
  const heroPath = import.meta.env.BASE_URL + 'assets/jovenes-hero.jpg';
  return <PageContainer className="pb-4 pt-8">
    <img src={heroPath} className="aspect-[25/7] w-full rounded-[4px] object-cover" width="1200" height="336" alt="Jóvenes reunidos en una actividad comunitaria de Lomas de Zamora" />
    <Breadcrumbs items={[{ label: 'Inicio', to: '/' }, { label: 'Gestión' }, { label: 'Jóvenes en Comunidad' }]} />
    <h1 className="mb-6 text-[32px] leading-[40px] font-bold text-brand-600">Jóvenes en Comunidad</h1>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <div className="min-w-0">
        <section aria-label="Presentación de Jóvenes en Comunidad" className="article-copy mb-6">
          {introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
        <h2 className="mb-6 text-[18px] leading-[26px] font-bold tracking-[0.03em] text-brand-600">INICIATIVAS</h2>
        <div>{initiatives.map((initiative, index) => <InitiativeSection key={initiative.id} initiative={initiative} first={index === 0} />)}</div>
      </div>
      <aside aria-label="Navegación y contacto de Jóvenes en Comunidad" className="min-w-0 space-y-6 lg:sticky lg:top-6">
        <TableOfContents initiatives={initiatives} />
        <div className="rounded-[4px] bg-panel p-6">
          <h2 className="mb-4 text-[24px] leading-[30px] font-bold text-brand-600">Contacto</h2>
          <a className="text-[16px] leading-[24px] font-bold text-brand-600 underline-offset-2 hover:underline focus-visible:outline-2" href={instagramUrl} target="_blank" rel="noopener noreferrer">@jovenesencomunidad</a>
        </div>
      </aside>
    </div>
  </PageContainer>;
}
