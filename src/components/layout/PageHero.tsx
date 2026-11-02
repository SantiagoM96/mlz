export interface PageHeroProps {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
}

/** Banner adaptativo de páginas institucionales, reutilizable con otras imágenes. */
export function PageHero({ desktopSrc, mobileSrc, alt, className = '' }: PageHeroProps) {
  return (
    <picture className="block">
      {mobileSrc && <source media="(max-width: 767px)" srcSet={mobileSrc} />}
      <img
        src={desktopSrc}
        className={`aspect-[25/14] w-full rounded-[4px] object-cover md:aspect-[25/7] ${className}`}
        width="1200"
        height="336"
        alt={alt}
        fetchPriority="high"
      />
    </picture>
  );
}
