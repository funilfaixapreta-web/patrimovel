import { useRef, useState, type DragEvent } from "react";
import { Icone } from "../../components/Icone";
import { novoId, type FotoAnuncio } from "../../lib/conta";
import { apagarFoto, prepararFoto, salvarFoto, TAMANHO_MAX_MB, useFotoUrl } from "../../lib/fotos";

const MAX_FOTOS = 40;

function Miniatura({ f, posicao, total, selecionada, aoSelecionar, aoMover, aoCapa }: {
  f: FotoAnuncio;
  posicao: number;
  total: number;
  selecionada: boolean;
  aoSelecionar: () => void;
  aoMover: (d: -1 | 1) => void;
  aoCapa: () => void;
}) {
  const url = useFotoUrl(f.id);
  return (
    <li className={`group relative overflow-hidden rounded-xl border-2 bg-sand-100 ${selecionada ? "border-brand-600" : "border-transparent"}`}>
      <div className="aspect-[4/3]">{url && <img src={url} alt={`Foto ${posicao + 1}: ${f.nome}`} className="h-full w-full object-cover" />}</div>
      <label className="absolute left-2 top-2 grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-white/95 shadow-sm">
        <input type="checkbox" checked={selecionada} onChange={aoSelecionar} className="h-4 w-4 accent-brand-600" aria-label={`Selecionar foto ${posicao + 1}`} />
      </label>
      {posicao === 0 ? (
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-1 text-[11.5px] font-semibold text-white"><Icone nome="estrela" className="h-3 w-3" preenchido /> Capa</span>
      ) : (
        <button type="button" onClick={aoCapa} className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[11.5px] font-semibold text-ink opacity-100 shadow-sm md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100">
          Usar como capa
        </button>
      )}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
        <span className="num rounded-full bg-ink/75 px-2 py-0.5 text-[12px] font-semibold text-white">{posicao + 1}</span>
        <span className="flex gap-1">
          <button type="button" disabled={posicao === 0} onClick={() => aoMover(-1)} aria-label="Mover para a esquerda" className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 shadow-sm disabled:opacity-40"><Icone nome="esquerda" className="h-4 w-4" /></button>
          <button type="button" disabled={posicao === total - 1} onClick={() => aoMover(1)} aria-label="Mover para a direita" className="grid h-8 w-8 place-items-center rounded-lg bg-white/95 shadow-sm disabled:opacity-40"><Icone nome="direita" className="h-4 w-4" /></button>
        </span>
      </div>
    </li>
  );
}

export function EtapaFotos({ fotos, aoMudar }: { fotos: FotoAnuncio[]; aoMudar: (f: FotoAnuncio[]) => void }) {
  const entrada = useRef<HTMLInputElement>(null);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [processando, setProcessando] = useState<{ feitas: number; total: number } | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const [arrastando, setArrastando] = useState(false);

  async function adicionar(lista: FileList | File[]) {
    const arquivos = [...lista].slice(0, Math.max(0, MAX_FOTOS - fotos.length));
    if (!arquivos.length) {
      setErros([`O limite é de ${MAX_FOTOS} fotos por imóvel.`]);
      return;
    }
    const novas: FotoAnuncio[] = [];
    const falhas: string[] = [];
    setProcessando({ feitas: 0, total: arquivos.length });
    for (const [k, arq] of arquivos.entries()) {
      try {
        const blob = await prepararFoto(arq);
        const id = novoId();
        await salvarFoto(id, blob);
        novas.push({ id, nome: arq.name });
      } catch (e) {
        falhas.push((e as Error).message);
      }
      setProcessando({ feitas: k + 1, total: arquivos.length });
    }
    setProcessando(null);
    setErros(falhas);
    if (novas.length) aoMudar([...fotos, ...novas]);
  }

  function mover(i: number, d: -1 | 1) {
    const l = [...fotos];
    [l[i], l[i + d]] = [l[i + d], l[i]];
    aoMudar(l);
  }

  function capa(i: number) {
    const l = [...fotos];
    const [f] = l.splice(i, 1);
    aoMudar([f, ...l]);
  }

  async function excluirSelecionadas() {
    await Promise.all(selecionadas.map((id) => apagarFoto(id).catch(() => undefined)));
    aoMudar(fotos.filter((f) => !selecionadas.includes(f.id)));
    setSelecionadas([]);
  }

  function soltar(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
    if (e.dataTransfer.files.length) adicionar(e.dataTransfer.files);
  }

  return (
    <div className="grid gap-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={soltar}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${arrastando ? "border-brand-600 bg-brand-50" : "border-sand-300 bg-sand-50"}`}
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-brand-700 shadow-sm"><Icone nome="upload" className="h-6 w-6" /></span>
        <p className="mt-4 text-[17px] font-semibold">Arraste as fotos para cá</p>
        <p className="mt-1 text-[14px] text-ink-muted">JPG, PNG ou WebP, até {TAMANHO_MAX_MB} MB cada. Até {MAX_FOTOS} fotos.</p>
        <button type="button" onClick={() => entrada.current?.click()} className="btn-escuro mt-5" disabled={!!processando}>
          {processando ? `Preparando ${processando.feitas} de ${processando.total}...` : "Escolher fotos"}
        </button>
        <input ref={entrada} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => { if (e.target.files) adicionar(e.target.files); e.target.value = ""; }} />
      </div>

      {erros.length > 0 && (
        <ul className="rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand-800" role="alert">
          {erros.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <div className="grid gap-2 rounded-xl bg-sand-50 p-4 text-[14px] text-ink-soft sm:grid-cols-3">
        <p><b className="text-ink">Na horizontal</b>, com o celular deitado.</p>
        <p><b className="text-ink">De dia</b>, com cortinas abertas e luzes acesas.</p>
        <p><b className="text-ink">A capa</b> é a primeira: use a sala ou a vista.</p>
      </div>

      {fotos.length > 0 && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="num text-[15px] font-semibold">{fotos.length} {fotos.length === 1 ? "foto adicionada" : "fotos adicionadas"}</p>
            <div className="flex items-center gap-2">
              {selecionadas.length > 0 && <button type="button" onClick={() => setSelecionadas([])} className="text-[14px] text-ink-muted underline">Limpar seleção</button>}
              <button type="button" onClick={excluirSelecionadas} disabled={!selecionadas.length} className="btn-contorno px-4 py-2 text-[14px] disabled:opacity-40">
                <Icone nome="lixo" className="h-4 w-4" /> Excluir {selecionadas.length ? `${selecionadas.length} ${selecionadas.length === 1 ? "foto" : "fotos"}` : "selecionadas"}
              </button>
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {fotos.map((f, i) => (
              <Miniatura
                key={f.id}
                f={f}
                posicao={i}
                total={fotos.length}
                selecionada={selecionadas.includes(f.id)}
                aoSelecionar={() => setSelecionadas((s) => (s.includes(f.id) ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                aoMover={(d) => mover(i, d)}
                aoCapa={() => capa(i)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
