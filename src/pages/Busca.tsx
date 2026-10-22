import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { GradeImoveis } from "../components/CardImovel";
import { Icone } from "../components/Icone";
import { useSeo } from "../lib/seo";
import {
  custoMensal,
  doNegocio,
  ehComercial,
  resumoBairros,
  rotuloTipo,
  slug,
  useVitrine,
  type Imovel,
  type Negocio,
} from "../lib/vitrine";

const POR_PAGINA = 18;

const ORDENS = {
  recentes: "Mais recentes",
  menor: "Menor preço",
  maior: "Maior preço",
  total: "Menor custo mensal",
  area: "Maior área",
} as const;
type Ordem = keyof typeof ORDENS;

function numero(v: string | null): number | null {
  if (!v) return null;
  const n = Number(v.replace(/\D/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normal(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default function Busca({ negocio }: { negocio: Negocio }) {
  const { bairro: bairroSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const navegar = useNavigate();
  const [painel, setPainel] = useState(false);
  const [pagina, setPagina] = useState(1);
  const estado = useVitrine();
  const todos = estado.status === "ok" ? estado.vitrine.imoveis : [];
  const base = useMemo(() => doNegocio(todos, negocio), [todos, negocio]);
  const bairros = useMemo(() => resumoBairros(base), [base]);
  const bairroAtual = bairros.find((b) => b.slug === bairroSlug);

  const q = params.get("q") ?? "";
  const tipo = params.get("tipo") ?? "";
  const grupo = params.get("grupo") ?? "";
  const quartos = numero(params.get("quartos"));
  const vagas = numero(params.get("vagas"));
  const precoMin = numero(params.get("min"));
  const precoMax = numero(params.get("max"));
  const areaMin = numero(params.get("area"));
  const ordem = (params.get("ordem") as Ordem) in ORDENS ? (params.get("ordem") as Ordem) : "recentes";

  const preco = (i: Imovel) => (negocio === "alugar" ? i.valor_locacao : i.valor_venda) ?? 0;

  const lista = useMemo(() => {
    const termo = normal(q.trim());
    let r = base.filter((i) => {
      if (bairroSlug && (!i.bairro || slug(i.bairro) !== bairroSlug)) return false;
      if (tipo && i.tipo !== tipo) return false;
      if (grupo === "comercial" && !ehComercial(i)) return false;
      if (grupo === "residencial" && ehComercial(i)) return false;
      if (quartos && (i.quartos ?? 0) < quartos) return false;
      if (vagas && (i.vagas ?? 0) < vagas) return false;
      if (precoMin && preco(i) < precoMin) return false;
      if (precoMax && preco(i) > precoMax) return false;
      if (areaMin && (i.area_util_m2 ?? 0) < areaMin) return false;
      if (termo) {
        const alvo = normal([i.codigo, i.bairro, i.cidade, i.tipo, i.titulo, i.descricao].filter(Boolean).join(" "));
        if (!termo.split(/\s+/).every((p) => alvo.includes(p))) return false;
      }
      return true;
    });
    r = [...r];
    if (ordem === "menor") r.sort((a, b) => preco(a) - preco(b));
    if (ordem === "maior") r.sort((a, b) => preco(b) - preco(a));
    if (ordem === "area") r.sort((a, b) => (b.area_util_m2 ?? 0) - (a.area_util_m2 ?? 0));
    if (ordem === "total") r.sort((a, b) => (custoMensal(a) ?? preco(a)) - (custoMensal(b) ?? preco(b)));
    return r;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, bairroSlug, q, tipo, grupo, quartos, vagas, precoMin, precoMax, areaMin, ordem, negocio]);

  useEffect(() => setPagina(1), [lista]);

  const tiposDisponiveis = useMemo(() => [...new Set(base.map((i) => i.tipo).filter(Boolean) as string[])].sort(), [base]);

  const rotuloNegocio = negocio === "alugar" ? "para alugar" : "à venda";
  const tituloTipo = tipo ? rotuloTipo(tipo, true) : grupo === "comercial" ? "Imóveis comerciais" : "Imóveis";
  const local = bairroAtual ? bairroAtual.nome : "no Rio de Janeiro";
  const h1 = `${tituloTipo} ${rotuloNegocio} ${bairroAtual ? `em ${local}` : local}`;
  useSeo(
    h1,
    `${lista.length || ""} ${tituloTipo.toLowerCase()} ${rotuloNegocio} ${bairroAtual ? `em ${bairroAtual.nome}` : "no Rio de Janeiro"} com fotos, vídeo, condomínio e IPTU. Patrimóvel Administradora.`.trim(),
  );

  function definir(chave: string, valor: string | null) {
    const p = new URLSearchParams(params);
    if (valor) p.set(chave, valor);
    else p.delete(chave);
    setParams(p, { replace: true });
  }

  function limpar() {
    setParams(new URLSearchParams(), { replace: true });
  }

  const ativos = [q, tipo, grupo, quartos, vagas, precoMin, precoMax, areaMin].filter(Boolean).length;
  const faixas =
    negocio === "alugar"
      ? [2000, 3000, 5000, 8000, 12000, 20000, 40000]
      : [500000, 800000, 1200000, 2000000, 3000000, 5000000, 10000000];
  const fmt = (v: number) => (v >= 1000000 ? `R$ ${(v / 1000000).toLocaleString("pt-BR")} mi` : `R$ ${(v / 1000).toLocaleString("pt-BR")} mil`);

  const filtros = (
    <div className="grid gap-5">
      <div>
        <label className="rotulo" htmlFor="f-q">Palavra ou código</label>
        <input id="f-q" className="campo" value={q} onChange={(e) => definir("q", e.target.value)} placeholder="Ex.: varanda, vista mar, AP0408" />
      </div>
      <div>
        <label className="rotulo" htmlFor="f-bairro">Bairro</label>
        <select
          id="f-bairro"
          className="campo"
          value={bairroSlug ?? ""}
          onChange={(e) => {
            const s = e.target.value;
            const busca = params.toString();
            navegar(`/${negocio}${s ? `/${s}` : ""}${busca ? `?${busca}` : ""}`, { replace: true });
          }}
        >
          <option value="">Todos os bairros</option>
          {bairros.map((b) => <option key={b.slug} value={b.slug}>{b.nome} ({negocio === "alugar" ? b.alugar : b.comprar})</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="rotulo" htmlFor="f-tipo">Tipo</label>
          <select id="f-tipo" className="campo" value={tipo} onChange={(e) => definir("tipo", e.target.value || null)}>
            <option value="">Todos</option>
            {tiposDisponiveis.map((t) => <option key={t} value={t}>{rotuloTipo(t)}</option>)}
          </select>
        </div>
        <fieldset className="col-span-2">
          <legend className="rotulo">Uso</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand-100 p-1">
            {[["", "Todos"], ["residencial", "Residencial"], ["comercial", "Comercial"]].map(([v, r]) => (
              <button key={v} type="button" onClick={() => definir("grupo", v || null)} aria-pressed={grupo === v} className={`rounded-lg px-2 py-2 text-[14px] font-medium ${grupo === v ? "bg-white shadow-sm" : "text-ink-muted"}`}>
                {r}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="rotulo" htmlFor="f-min">Preço mínimo</label>
          <select id="f-min" className="campo" value={precoMin ?? ""} onChange={(e) => definir("min", e.target.value || null)}>
            <option value="">Sem mínimo</option>
            {faixas.map((v) => <option key={v} value={v}>{fmt(v)}</option>)}
          </select>
        </div>
        <div>
          <label className="rotulo" htmlFor="f-max">Preço máximo</label>
          <select id="f-max" className="campo" value={precoMax ?? ""} onChange={(e) => definir("max", e.target.value || null)}>
            <option value="">Sem máximo</option>
            {faixas.map((v) => <option key={v} value={v}>{fmt(v)}</option>)}
          </select>
        </div>
      </div>
      <fieldset>
        <legend className="rotulo">Quartos</legend>
        <div className="grid grid-cols-5 gap-1.5">
          {[null, 1, 2, 3, 4].map((n) => (
            <button key={n ?? 0} type="button" onClick={() => definir("quartos", n ? String(n) : null)} aria-pressed={quartos === n} className={`rounded-lg border py-2 text-[14px] font-medium ${quartos === n ? "border-brand-600 bg-brand-50 text-brand-800" : "border-sand-300"}`}>
              {n ? `${n}+` : "Todos"}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="rotulo">Vagas</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {[null, 1, 2, 3].map((n) => (
            <button key={n ?? 0} type="button" onClick={() => definir("vagas", n ? String(n) : null)} aria-pressed={vagas === n} className={`rounded-lg border py-2 text-[14px] font-medium ${vagas === n ? "border-brand-600 bg-brand-50 text-brand-800" : "border-sand-300"}`}>
              {n ? `${n}+` : "Todas"}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label className="rotulo" htmlFor="f-area">Área útil mínima</label>
        <select id="f-area" className="campo" value={areaMin ?? ""} onChange={(e) => definir("area", e.target.value || null)}>
          <option value="">Qualquer tamanho</option>
          {[40, 60, 80, 100, 150, 200, 300, 500].map((v) => <option key={v} value={v}>A partir de {v} m²</option>)}
        </select>
      </div>
      {ativos > 0 && (
        <button type="button" onClick={limpar} className="text-left text-[14px] font-semibold text-brand-700 underline underline-offset-2">
          Limpar filtros
        </button>
      )}
    </div>
  );

  const visiveis = lista.slice(0, pagina * POR_PAGINA);

  return (
    <div className="container-site pt-8 md:pt-10">
      <nav aria-label="Caminho" className="mb-4 text-[14px] text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-ink">Início</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to={`/${negocio}`} className="hover:text-ink">{negocio === "alugar" ? "Alugar" : "Comprar"}</Link></li>
          {bairroAtual && (<><li aria-hidden="true">/</li><li className="text-ink">{bairroAtual.nome}</li></>)}
        </ol>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-sand-200 pb-6">
        <div>
          <h1 className="text-[28px] font-bold leading-tight md:text-[38px]">{h1}</h1>
          <p className="num mt-2 text-[15px] text-ink-soft" aria-live="polite">
            {estado.status === "carregando" ? "Carregando imóveis..." : `${lista.length} ${lista.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}`}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="basis-full sm:basis-auto">
            <div className="inline-flex rounded-full bg-sand-100 p-1">
              {(["alugar", "comprar"] as const).map((n) => (
                <Link key={n} to={`/${n}${bairroSlug ? `/${bairroSlug}` : ""}`} className={`rounded-full px-4 py-2 text-[14px] font-semibold ${negocio === n ? "bg-white shadow-sm" : "text-ink-muted"}`}>
                  {n === "alugar" ? "Alugar" : "Comprar"}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-1 gap-2 sm:flex-none">
            <label className="sr-only" htmlFor="ordem">Ordenar por</label>
            <select id="ordem" className="campo min-w-0 flex-1 py-2.5 sm:w-auto sm:flex-none" value={ordem} onChange={(e) => definir("ordem", e.target.value === "recentes" ? null : e.target.value)}>
              {Object.entries(ORDENS)
                .filter(([k]) => negocio === "alugar" || k !== "total")
                .map(([k, r]) => <option key={k} value={k}>{r}</option>)}
            </select>
            <button type="button" onClick={() => setPainel(true)} className="btn-contorno shrink-0 px-4 py-2.5 lg:hidden">
              <Icone nome="filtro" className="h-[18px] w-[18px]" /> Filtros{ativos ? ` (${ativos})` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 pt-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="sticky top-[96px]">{filtros}</div>
        </aside>

        <div className="min-w-0">
          {estado.status === "erro" ? (
            <div className="rounded-2xl border border-sand-200 p-8 text-center">
              <p className="text-[18px] font-semibold">Não conseguimos carregar os imóveis agora.</p>
              <p className="mt-1 text-ink-soft">Atualize a página em instantes ou fale com a gente pelo WhatsApp.</p>
            </div>
          ) : estado.status === "ok" && lista.length === 0 ? (
            <div className="rounded-2xl border border-sand-200 p-8 text-center">
              <p className="text-[18px] font-semibold">Nenhum imóvel com esses filtros.</p>
              <p className="mt-1 text-ink-soft">Tente tirar algum filtro ou conte para a gente o que você procura no WhatsApp.</p>
              <button type="button" onClick={limpar} className="btn-escuro mt-5">Limpar filtros</button>
            </div>
          ) : (
            <>
              <GradeImoveis lista={visiveis} negocio={negocio} carregando={estado.status === "carregando"} />
              {visiveis.length < lista.length && (
                <div className="mt-10 text-center">
                  <button type="button" onClick={() => setPagina((p) => p + 1)} className="btn-contorno num px-8">
                    Mostrar mais {Math.min(POR_PAGINA, lista.length - visiveis.length)} de {lista.length - visiveis.length}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {painel && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <button className="absolute inset-0 bg-ink/40" aria-label="Fechar filtros" onClick={() => setPainel(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
              <p className="text-[18px] font-semibold">Filtros</p>
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sand-100" aria-label="Fechar filtros" onClick={() => setPainel(false)}>
                <Icone nome="fechar" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-5">{filtros}</div>
            <div className="border-t border-sand-200 p-4">
              <button className="btn-primario num w-full" onClick={() => setPainel(false)}>Ver {lista.length} imóveis</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
