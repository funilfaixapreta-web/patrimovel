import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icone } from "../../components/Icone";
import { ETAPAS } from "../../content-anuncio";
import { excluirAnuncio, pausarAnuncio, reativarAnuncio, useAnuncios, useConta, type Anuncio, type StatusAnuncio } from "../../lib/conta";
import { apagarFotos, useFotoUrl } from "../../lib/fotos";
import { useSeo } from "../../lib/seo";
import { formatarPreco } from "../../lib/vitrine";

export const STATUS: Record<StatusAnuncio, { rotulo: string; classe: string }> = {
  rascunho: { rotulo: "Rascunho", classe: "bg-sand-100 text-ink-soft" },
  em_aprovacao: { rotulo: "Em aprovação", classe: "bg-[#fdf0dc] text-[#8a4b00]" },
  ativo: { rotulo: "No ar", classe: "bg-[#e3f4ea] text-[#1d7a46]" },
  pausado: { rotulo: "Pausado", classe: "bg-sand-200 text-ink-soft" },
  recusado: { rotulo: "Recusado", classe: "bg-brand-50 text-brand-800" },
};

export function tituloAnuncio(a: Anuncio) {
  const partes = [a.tipo || "Imóvel sem tipo"];
  if (a.bairro) partes.push(`em ${a.bairro}`);
  return partes.join(" ");
}

function Capa({ a }: { a: Anuncio }) {
  const url = useFotoUrl(a.fotos[0]);
  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-sand-100 sm:w-48">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-ink-muted"><Icone nome="foto" className="h-7 w-7" /></div>}
    </div>
  );
}

function CartaoAnuncio({ a }: { a: Anuncio }) {
  const [confirmar, setConfirmar] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const st = STATUS[a.status];
  const editar = a.status === "rascunho" || a.status === "em_aprovacao" || a.status === "recusado";
  async function fazer(f: () => Promise<unknown>) {
    setErro(null);
    setOcupado(true);
    try {
      await f();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  const excluir = () =>
    fazer(async () => {
      await excluirAnuncio(a.id);
      // Rascunho nunca foi ao CRM: as fotos podem sair. Enviado, o imóvel do CRM ainda aponta para elas.
      if (a.status === "rascunho") await apagarFotos(a.fotos).catch(() => undefined);
    });
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-sand-200 p-4 sm:flex-row">
      <Capa a={a} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${st.classe}`}>{st.rotulo}</span>
          <span className="num text-[13px] text-ink-muted">{a.codigo}</span>
        </div>
        <p className="text-[17px] font-semibold leading-snug">{tituloAnuncio(a)}</p>
        <p className="num text-[14.5px] text-ink-soft">
          {[a.valorLocacao && `Aluguel ${formatarPreco(a.valorLocacao)}`, a.valorVenda && `Venda ${formatarPreco(a.valorVenda)}`, a.areaUtil && `${a.areaUtil} m²`, a.dormitorios && `${a.dormitorios} quartos`]
            .filter(Boolean)
            .join(" · ") || "Valores ainda não informados"}
        </p>
        {a.status === "rascunho" && (
          <div className="mt-1">
            <div className="flex gap-1" aria-hidden="true">
              {ETAPAS.map((_, k) => <span key={k} className={`h-1.5 flex-1 rounded-full ${k < a.etapa - 1 ? "bg-ink" : "bg-sand-200"}`} />)}
            </div>
            <p className="num mt-1.5 text-[13px] text-ink-muted">Parou na etapa {a.etapa} de {ETAPAS.length}: {ETAPAS[a.etapa - 1]?.nome}</p>
          </div>
        )}
        {a.status === "em_aprovacao" && <p className="text-[13.5px] text-ink-muted">Nossa equipe confere os dados e as fotos antes de publicar. Você vê aqui quando o anúncio entrar no ar.</p>}
        {a.status === "recusado" && <p className="text-[13.5px] text-ink-muted">Nossa equipe não aprovou este cadastro. Confira os dados e as fotos e envie de novo, ou fale com o atendimento.</p>}
        {a.status === "pausado" && a.pausadoPor === "equipe" && <p className="text-[13.5px] text-ink-muted">Pausado pela nossa equipe. Fale com o atendimento para voltar ao ar.</p>}
        {a.status === "pausado" && a.pausadoPor === "termo" && (
          <p className="text-[13.5px] text-ink-muted">Saiu do ar porque a autorização de divulgação venceu. <Link to="/conta/termos" className="font-semibold underline">Renove o termo</Link> para voltar.</p>
        )}
        {erro && <p className="rounded-xl bg-brand-50 px-3 py-2 text-[13.5px] text-brand-800" role="alert">{erro}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {editar && (
            <Link to={`/anunciar/${a.id}`} className="btn-contorno px-4 py-2 text-[14px]">
              <Icone nome="editar" className="h-4 w-4" /> {a.status === "rascunho" ? "Continuar cadastro" : "Editar"}
            </Link>
          )}
          {a.status === "ativo" && (
            <button type="button" disabled={ocupado} onClick={() => fazer(() => pausarAnuncio(a))} className="btn-contorno px-4 py-2 text-[14px] disabled:opacity-50">
              <Icone nome="pausa" className="h-4 w-4" /> Pausar anúncio
            </button>
          )}
          {a.status === "pausado" && a.pausadoPor === "anunciante" && (
            <button type="button" disabled={ocupado} onClick={() => fazer(() => reativarAnuncio(a))} className="btn-contorno px-4 py-2 text-[14px] disabled:opacity-50">
              <Icone nome="play" className="h-4 w-4" /> Reativar
            </button>
          )}
          {!confirmar ? (
            <button type="button" onClick={() => setConfirmar(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[14px] text-ink-muted hover:text-brand-700">
              <Icone nome="lixo" className="h-4 w-4" /> Excluir
            </button>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-[13.5px] text-brand-800">
              Excluir este imóvel?
              <button type="button" disabled={ocupado} onClick={excluir} className="font-semibold underline">Sim, excluir</button>
              <button type="button" onClick={() => setConfirmar(false)} className="underline">Cancelar</button>
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export default function MeusImoveis() {
  useSeo("Meus imóveis");
  const usuario = useConta();
  const anuncios = useAnuncios(usuario?.id);
  const [params, setParams] = useSearchParams();
  const negocio = params.get("negocio") ?? "";
  const status = (params.get("status") ?? "") as StatusAnuncio | "";

  const definir = (k: string, v: string) => {
    const p = new URLSearchParams(params);
    if (v) p.set(k, v);
    else p.delete(k);
    setParams(p, { replace: true });
  };

  const lista = anuncios.filter((a) => {
    if (negocio === "alugar" && !(a.negocio === "locacao" || a.negocio === "venda_locacao")) return false;
    if (negocio === "vender" && !(a.negocio === "venda" || a.negocio === "venda_locacao")) return false;
    if (status && a.status !== status) return false;
    return true;
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold md:text-[34px]">Meus imóveis</h1>
          <p className="num mt-1 text-[15px] text-ink-soft">{anuncios.length} {anuncios.length === 1 ? "imóvel cadastrado" : "imóveis cadastrados"}</p>
        </div>
        <Link to="/anunciar" className="btn-primario"><Icone nome="mais" className="h-[18px] w-[18px]" /> Anunciar imóvel</Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-sand-200 pb-4">
        <div className="inline-flex rounded-full bg-sand-100 p-1">
          {[["", "Todos"], ["alugar", "Para alugar"], ["vender", "Para vender"]].map(([v, r]) => (
            <button key={v} type="button" onClick={() => definir("negocio", v)} aria-pressed={negocio === v} className={`rounded-full px-4 py-2 text-[14px] font-semibold ${negocio === v ? "bg-white shadow-sm" : "text-ink-muted"}`}>{r}</button>
          ))}
        </div>
        <label className="sr-only" htmlFor="filtro-status">Status do imóvel</label>
        <select id="filtro-status" value={status} onChange={(e) => definir("status", e.target.value)} className="campo w-auto py-2.5 sm:ml-auto">
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.rotulo}</option>)}
        </select>
      </div>

      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700"><Icone nome="casa" className="h-6 w-6" /></span>
          <p className="mt-4 text-[18px] font-semibold">{anuncios.length ? "Nenhum imóvel com esse filtro." : "Você ainda não cadastrou nenhum imóvel."}</p>
          <p className="mx-auto mt-1 max-w-md text-[15px] text-ink-soft">
            {anuncios.length ? "Troque o filtro para ver os outros cadastros." : "O cadastro leva uns 10 minutos e você pode parar e continuar depois. Tenha as fotos do imóvel à mão."}
          </p>
          {!anuncios.length && <Link to="/anunciar" className="btn-primario mt-6">Cadastrar meu primeiro imóvel</Link>}
        </div>
      ) : (
        <ul className="grid gap-4">{lista.map((a) => <CartaoAnuncio key={a.id} a={a} />)}</ul>
      )}
    </div>
  );
}
