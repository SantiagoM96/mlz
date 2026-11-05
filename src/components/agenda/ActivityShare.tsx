import { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Algunos navegadores bloquean Clipboard API; intentar el método alternativo.
  }
  const field = document.createElement('textarea');
  field.value = value;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    field.remove();
  }
  return copied;
}

export function ActivityShare({ title }: { title: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = encodeURIComponent(title + ' ' + url);
  const assets = import.meta.env.BASE_URL + 'assets/agenda/';

  const copyLink = async () => {
    const ok = await copyToClipboard(url);
    setCopyState(ok ? 'copied' : 'error');
  };

  const platformIcon = (platform: 'whatsapp' | 'facebook') =>
    <img src={assets + 'social-' + platform + '.svg'} width="20" height="20" alt="" aria-hidden="true" />;
  const classes = 'inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-primary-600 text-primary-600 transition-colors hover:bg-[#f3f7fc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600';

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2 text-primary-600" aria-label="Compartir actividad">
      <a className={classes} href={'https://api.whatsapp.com/send?text=' + shareText}
        target="_blank" rel="noopener noreferrer" aria-label="Compartir por WhatsApp">
        {platformIcon('whatsapp')}
      </a>
      <a className={classes} href={'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)}
        target="_blank" rel="noopener noreferrer" aria-label="Compartir por Facebook">
        {platformIcon('facebook')}
      </a>
      <button type="button" onClick={copyLink} className={classes}
        aria-label={copyState === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}
        title={copyState === 'copied' ? 'Enlace copiado' : 'Copiar enlace'}>
        <MaterialIcon name={copyState === 'copied' ? 'check' : 'link'} size={20} />
      </button>
      <span className="text-[18px] font-bold leading-[26px]">Compartir</span>
      <span className="sr-only" role="status" aria-live="polite">
        {copyState === 'copied' ? 'Enlace copiado al portapapeles' :
          copyState === 'error' ? 'No se pudo copiar el enlace' : ''}
      </span>
    </div>
  );
}
