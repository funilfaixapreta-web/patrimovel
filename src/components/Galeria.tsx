import { useCallback, useEffect, useState } from "react";
import { Icone } from "./Icone";

export function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);
  const total = fotos.length;
  const ir = useCallback((d: number) => setAberta((a) => (a === null ? a : (a + d + total) % total)), [total]);

  useEffect(() => {
    if (aberta === null) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberta(null);
      if (e.key === "ArrowRight") ir(1);
      if (e.key === "ArrowLeft") ir(-1);
    };
    document.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [aberta, ir]);

  if (!total) {
    return <div className="grid aspect-[16/9] place-items-center rounded-2xl bg-sand-100 text-ink-muted"><Icone nome="foto" className="h-10 w-10" /></div>;
  }

  const extras = fotos.slice(1, 5);
  return (
    <>
      <div className={`grid gap-2 overflow-hidden rounded-2xl ${extras.length ? "md:grid-cols-[2fr_1fr]" : ""}`}>
        <button type="button" onClick={() => setAberta(0)} className="relative aspect-[4/3] overflow-hidden bg-sand-100 md:aspect-auto md:h-[460px]" aria-label="Abrir fotos">
          <img src={fotos[0]} alt={titulo} {...{ fetchpriority: "high" }} className="h-full w-full object-cover" />
          <span className="num absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[13px] font-medium text-white">
            <Icone nome="foto" className="h-4 w-4" /> {total} fotos
          </span>
        </button>
        {extras.length > 0 && (
          <div className="hidden grid-cols-2 gap-2 md:grid md:h-[460px] md:grid-rows-2">
            {extras.map((f, k) => (
              <button key={f} type="button" onClick={() => setAberta(k + 1)} className="relative overflow-hidden bg-sand-100" aria-label={`Abrir foto ${k + 2}`}>
                <img src={f} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.04]" />
              </button>
            ))}
          </div>
        )}
      </div>

      {aberta !== null && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Fotos do imóvel" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <p className="num text-[14px]">{aberta + 1} de {total}</p>
            <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10" aria-label="Fechar fotos" onClick={() => setAberta(null)}>
              <Icone nome="fechar" className="h-6 w-6" />
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
            <img src={fotos[aberta]} alt={`${titulo}, foto ${aberta + 1}`} className="max-h-full max-w-full object-contain" />
            {total > 1 && (
              <>
                <button className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6" aria-label="Foto anterior" onClick={() => ir(-1)}>
                  <Icone nome="esquerda" className="h-6 w-6" />
                </button>
                <button className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6" aria-label="Próxima foto" onClick={() => ir(1)}>
                  <Icone nome="direita" className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {fotos.map((f, k) => (
              <button key={f} onClick={() => setAberta(k)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-md ${k === aberta ? "ring-2 ring-white" : "opacity-60"}`} aria-label={`Foto ${k + 1}`}>
                <img src={f} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function VideoYoutube({ id, titulo }: { id: string; titulo: string }) {
  const [tocar, setTocar] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
      {tocar ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={`Vídeo: ${titulo}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setTocar(true)} className="group absolute inset-0" aria-label="Assistir ao vídeo do imóvel">
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-80" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white shadow-float transition-transform group-hover:scale-105">
            <Icone nome="play" className="ml-1 h-7 w-7" preenchido />
          </span>
        </button>
      )}
    </div>
  );
}
