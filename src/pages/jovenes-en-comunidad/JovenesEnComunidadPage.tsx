import { useEffect } from 'react';
import { Breadcrumbs } from '../../components/navigation/Breadcrumbs';
import { PageContainer } from '../../components/layout/PageContainer';
import { PageHero } from '../../components/layout/PageHero';
import { Button } from '../../components/ui/Button';
import { TableOfContents } from '../../components/ui/TableOfContents';
import { InfoCard } from '../../components/ui/InfoCard';
import { IconLink } from '../../components/ui/IconLink';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { initiatives, introduction, type ContentBlock, type Initiative } from '../../data/jovenes';

const instagramUrl = 'https://www.instagram.com/jovenesencomunidad/';

function LinkedParagraph({ text }: { text: string }) {
  const handle = '@jovenesencomunidad';
  const index = text.indexOf(handle);
  if (index === -1) return <p>{text}</p>;

  return (
    <p>
      {text.slice(0, index)}
      <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
        {handle}
      </a>
      {text.slice(index + handle.length)}
    </p>
  );
}

function Content({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="article-copy">
      {blocks.map((block, index) =>
        block.kind === 'paragraph' ? (
          <LinkedParagraph key={index} text={block.text} />
        ) : (
          <ul key={index}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function InitiativeSection({ initiative, first }: { initiative: Initiative; first?: boolean }) {
  return (
    <section
      id={initiative.id}
      className={'article-section ' + (first ? '!pt-0' : '')}
      aria-labelledby={'heading-' + initiative.id}
    >
      <h3 id={'heading-' + initiative.id}>{initiative.title}</h3>
      <Content blocks={initiative.blocks} />
      {initiative.showPointsButton && (
        <div className="mt-6">
          <Button
            disabled
            title="La página de Puntos Jóvenes se incorporará en una etapa posterior"
          >
            Ver Puntos Jóvenes <MaterialIcon name="chevron_right" size={20} />
          </Button>
        </div>
      )}
    </section>
  );
}

export function JovenesEnComunidadPage() {
  useEffect(() => {
    document.title = 'Jóvenes en Comunidad | Municipio Lomas de Zamora';
  }, []);

  const heroDesktop = import.meta.env.BASE_URL + 'assets/jovenes-hero.jpg';
  const heroMobile = import.meta.env.BASE_URL + 'assets/jovenes-hero-mobile.jpg';

  return (
    <PageContainer className="pb-4 pt-8">
      <PageHero
        desktopSrc={heroDesktop}
        mobileSrc={heroMobile}
        alt="Jóvenes reunidos en una actividad comunitaria de Lomas de Zamora"
      />

      <Breadcrumbs
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Gestión' },
          { label: 'Jóvenes en Comunidad' },
        ]}
      />
      <h1 className="mb-6 text-[32px] leading-[40px] font-bold text-primary-600">
        Jóvenes en Comunidad
      </h1>

      {/*
        Mobile en Figma: presentación → índice/contacto → iniciativas.
        Desktop: presentación e iniciativas a la izquierda; índice a la derecha.
        Se comparte una única estructura accesible, sin duplicar contenido.
      */}
      <div className="grid items-start gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,778px)_minmax(0,390px)]">
        <section
          aria-label="Presentación de Jóvenes en Comunidad"
          className="article-copy intro-copy min-w-0 lg:col-start-1 lg:row-start-1"
        >
          {introduction.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        <aside
          aria-label="Índice y contacto de Jóvenes en Comunidad"
          className="w-full max-w-[390px] min-w-0 space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
        >
          <TableOfContents items={initiatives.map(({ id, title }) => ({ id, label: title }))} ariaLabel="Índice de iniciativas" />

          <InfoCard title="Contacto">
            <IconLink brandIcon="instagram" href={instagramUrl} target="_blank" rel="noopener noreferrer">
              @jovenesencomunidad
            </IconLink>
          </InfoCard>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <h2 data-testid="initiatives-heading" className="mb-6 text-[18px] leading-[26px] font-bold tracking-[0.03em] text-primary-600">
            INICIATIVAS
          </h2>
          <div>
            {initiatives.map((initiative, index) => (
              <InitiativeSection
                key={initiative.id}
                initiative={initiative}
                first={index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
