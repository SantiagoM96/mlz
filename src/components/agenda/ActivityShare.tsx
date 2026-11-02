import { useState } from 'react';

export function ActivityShare({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(title + ' ' + url);
  const shareOnInstagram = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url });
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      // Ignorar la cancelación voluntaria de compartir.
    }
  };
  const assets = import.meta.env.BASE_URL + 'assets/agenda/';
  const icon = (platform: 'whatsapp' | 'instagram' | 'facebook') =>
    <img src={assets + 'social-' + platform + '.svg'} width="20" height="20" alt="" aria-hidden="true" />;

  const classes = 'inline-flex size-[28px] items-center justify-center rounded-full border border-primary-600 text-primary-600 hover:bg-[#f3f7fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';

  return (
    <div className="mb-6 flex items-center gap-2 text-primary-600" aria-label="Compartir actividad">
      <a className={classes} href={`https://api.whatsapp.com/send?text=${shareText}`}
         target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
        {icon('whatsapp')}
      </a>
      <button type="button" className={classes} onClick={shareOnInstagram}
        aria-label="Compartir o copiar enlace para Instagram">{icon('instagram')}</button>
      <a className={classes} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
         target="_blank" rel="noopener noreferrer" aria-label="Compartir por Facebook">
        {icon('facebook')}
      </a>
      <span className="font-bold">{copied ? 'Enlace copiado' : 'Compartir'}</span>
    </div>
  );
}
