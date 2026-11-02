import { useEffect } from 'react';
import type { AgendaActivity } from '../../data/agenda';
import { AgendaIcon } from './AgendaIcon';

export function ActivityDetails({ activity, onClose }: { activity: AgendaActivity; onClose: () => void }) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="agenda-dialog-title" className="max-h-[90vh] w-full max-w-[520px] overflow-auto rounded-lg bg-white shadow-2xl">
      <div className="relative">
        <img src={activity.image} alt="" className="h-[180px] w-full object-cover" />
        <button autoFocus type="button" aria-label="Cerrar detalle" onClick={onClose} className="absolute right-3 top-3 rounded-full bg-white p-2 text-grey-900 shadow"><AgendaIcon name="close" size={20}/></button>
      </div>
      <div className="space-y-4 p-6">
        <p className="text-sm font-medium uppercase text-[#888]">{activity.category}</p>
        <h2 id="agenda-dialog-title" className="text-[28px] font-bold text-primary-600">{activity.title}</h2>
        <p className="flex gap-2 font-medium"><AgendaIcon name="calendar"/>{activity.dayLabel}</p>
        <p className="flex gap-2 font-medium"><AgendaIcon name="clock"/>{activity.timeLabel}</p>
        <p className="text-sm text-[#6b7280]">Localidad de referencia del prototipo: {activity.locality}.</p>
        <p className="rounded-md bg-[#f3f7fc] p-3 text-sm">Esta tarjeta utiliza los datos de ejemplo del diseño de Figma. Las actividades reales y sus ubicaciones se incorporarán cuando exista una fuente de datos confirmada.</p>
        <button type="button" onClick={onClose} className="rounded bg-primary-600 px-5 py-3 font-bold text-white">Cerrar</button>
      </div>
    </section>
  </div>;
}
