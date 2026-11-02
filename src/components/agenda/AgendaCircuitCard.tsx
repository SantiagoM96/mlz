import { Link } from 'react-router-dom';

export interface AgendaCircuit {
  title: string;
  description: string;
  actionLabel: string;
  image: string;
  variant: 'theater' | 'cafe';
  to?: string;
}

/** Tarjeta de circuito; móvil sigue el frame Home 432 px, desktop muestra ambos. */
export function AgendaCircuitCard({ circuit }: { circuit: AgendaCircuit }) {
  return (
    <article className={`relative isolate min-h-[450px] flex-col justify-end overflow-hidden rounded-lg bg-[#5b3185] text-white md:min-h-[516px] ${circuit.variant === 'cafe' ? 'hidden md:flex' : 'flex'}`}>
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${circuit.variant === 'cafe' ? 'bg-gradient-to-b from-[#4b3026] to-[#805029]' : 'bg-gradient-to-b from-[#261a58] to-[#470095]'}`} />
      <img src={circuit.image} alt="" className="absolute inset-x-0 top-0 -z-10 h-[52%] w-full object-cover object-center" loading="lazy" />
      <div className="relative z-10 flex flex-col gap-4 bg-gradient-to-t from-black/30 via-black/10 to-transparent px-6 pb-7 pt-10 md:px-12">
        <h2 className="text-[30px] font-bold leading-10">{circuit.title}</h2>
        <p className="text-[18px] leading-[26px]">{circuit.description}</p>
        {circuit.to ? <Link className="text-[18px] font-bold hover:underline" to={circuit.to}>{circuit.actionLabel}</Link> :
          <span className="text-[18px] font-bold">{circuit.actionLabel} · Próximamente</span>}
      </div>
    </article>
  );
}
