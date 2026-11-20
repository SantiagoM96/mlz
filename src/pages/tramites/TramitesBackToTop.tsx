import { useEffect, useState } from 'react';
import { MaterialIcon } from '../../components/ui/MaterialIcon';

/** Navegación auxiliar exclusiva del catálogo extenso (nunca de fichas). */
export function TramitesBackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const comprobarScroll = () => setVisible(window.scrollY > 600);
    comprobarScroll();
    window.addEventListener('scroll', comprobarScroll, { passive: true });
    return () => window.removeEventListener('scroll', comprobarScroll);
  }, []);

  if (!visible) return null;

  const volverArriba = () => {
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reducirMovimiento ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className="tram-back-to-top"
      onClick={volverArriba}
      title="Volver arriba"
      aria-label="Volver arriba"
      data-testid="tramites-back-to-top"
    >
      <MaterialIcon name="keyboard_arrow_up" size={28} />
    </button>
  );
}
