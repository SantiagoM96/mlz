export function AgendaPromo() {
  return <section aria-label="Recorrido Interactivo del Café" className="relative mt-6 flex min-h-[232px] flex-col justify-center gap-6 overflow-hidden rounded-lg bg-gradient-to-r from-[#7b4b23] via-[#6b3e22] to-[#3c271d] px-6 py-7 text-white md:flex-row md:items-center md:justify-between md:px-14">
    <div className="relative z-10 max-w-[560px] text-[18px] leading-6">
      <p>Conocé todas las cafeterías de Lomas y los productos destacados de cada una de ellas. Navegá el mapa y elegí una ubicación para ver las tiendas de café en la zona.</p>
      <span className="mt-4 inline-flex font-bold">Recorrido del café · Próximamente</span>
    </div>
    <img src={import.meta.env.BASE_URL + 'assets/agenda/home-cafe.jpg'} alt="Recorrido Interactivo del Café" className="relative z-10 max-h-[185px] w-full max-w-[330px] object-contain" loading="lazy" />
  </section>;
}
