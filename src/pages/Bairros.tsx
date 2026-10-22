import { Link, useParams } from "react-router-dom";
import { GradeImoveis } from "../components/CardImovel";
import { Icone } from "../components/Icone";
import { textosBairros } from "../content";
import { useSeo } from "../lib/seo";
import { doNegocio, ehComercial, formatarPreco, resumoBairros, slug, useVitrine, type Imovel } from "../lib/vitrine";
import NaoEncontrado from "./NaoEncontrado";

export function ListaBairros() {
  useSeo("Bairros onde temos imóveis no Rio de Janeiro", "Guia dos bairros com imóveis da Patrimóvel Administradora: Barra, Leblon, Ipanema, Copacabana, Botafogo, Centro e outros.");
  const estado = useVitrine();
  const bairros = estado.status === "ok" ? resumoBairros(estado.vitrine.imoveis) : [];
  return (
    <div className="container-site pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Bairros</h1>
      <p className="mt-3 max-w-2xl text-[17px] text-ink-soft">Cada bairro tem o seu jeito de morar e de trabalhar. Escolha um para ver o guia e os imóveis disponíveis agora.</p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {estado.status === "carregando" &&
          Array.from({ length: 6 }, (_, k) => <li key={k} className="aspect-[4/3] animate-pulse rounded-2xl bg-sand-100" />)}
        {bairros.map((b) => (
          <li key={b.slug}>
            <Link to={`/bairros/${b.slug}`} className="group block overflow-hidden rounded-2xl border border-sand-200 bg-white transition-shadow hover:shadow-card">
              <div className="aspect-[16/10] overflow-hidden bg-sand-100">
                {b.foto && <img src={b.foto} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
              </div>
              <div className="p-5">
                <p className="text-[19px] font-semibold">{b.nome}</p>
                {textosBairros[b.slug] && <p className="mt-1 text-[15px] text-ink-soft">{textosBairros[b.slug].chamada}</p>}
                <p className="num mt-3 text-[14px] text-ink-muted">
                  {[b.alugar && `${b.alugar} para alugar`, b.comprar && `${b.comprar} à venda`].filter(Boolean).join(" · ")}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function mediana(v: number[]) {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function Numeros({ lista }: { lista: Imovel[] }) {
  const aluguel = doNegocio(lista, "alugar").filter((i) => !ehComercial(i) && i.area_util_m2);
  const venda = doNegocio(lista, "comprar").filter((i) => !ehComercial(i) && i.area_util_m2);
  const m2Aluguel = mediana(aluguel.map((i) => i.valor_locacao! / i.area_util_m2!));
  const m2Venda = mediana(venda.map((i) => i.valor_venda! / i.area_util_m2!));
  const itens = [
    { r: "Imóveis disponíveis", v: String(lista.length) },
    aluguel.length >= 3 && m2Aluguel ? { r: "Aluguel residencial por m²", v: `${formatarPreco(m2Aluguel, true)}` } : null,
    venda.length >= 3 && m2Venda ? { r: "Venda residencial por m²", v: formatarPreco(m2Venda) } : null,
  ].filter(Boolean) as { r: string; v: string }[];
  return (
    <div>
      <dl className="grid gap-3 sm:grid-cols-3">
        {itens.map((x) => (
          <div key={x.r} className="rounded-2xl border border-sand-200 p-5">
            <dt className="text-[14px] text-ink-muted">{x.r}</dt>
            <dd className="num mt-1 text-[26px] font-bold">{x.v}</dd>
          </div>
        ))}
      </dl>
      {itens.length > 1 && <p className="mt-2 text-[13px] text-ink-muted">Mediana dos imóveis anunciados pela Patrimóvel ADM neste bairro, atualizada a cada carga da vitrine.</p>}
    </div>
  );
}

export function PaginaBairro() {
  const { bairro = "" } = useParams();
  const estado = useVitrine();
  const todos = estado.status === "ok" ? estado.vitrine.imoveis : [];
  const lista = todos.filter((i) => i.bairro && slug(i.bairro) === bairro);
  const nome = lista[0]?.bairro ?? bairro.replace(/-/g, " ");
  const texto = textosBairros[bairro];
  useSeo(`Imóveis em ${nome}`, `${texto?.chamada ?? `Imóveis em ${nome}`}. Veja apartamentos, casas e salas para alugar e comprar em ${nome} com a Patrimóvel Administradora.`);

  if (estado.status === "ok" && lista.length === 0) return <NaoEncontrado mensagem={`No momento não temos imóveis em ${nome}.`} />;

  const alugar = doNegocio(lista, "alugar");
  const comprar = doNegocio(lista, "comprar");
  const foto = resumoBairros(lista)[0]?.foto;

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        {foto && <img src={foto} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45" />}
        <div className="container-site py-16 md:py-24">
          <nav aria-label="Caminho" className="mb-4 text-[14px] text-white/75">
            <Link to="/bairros" className="inline-flex items-center gap-1 hover:text-white"><Icone nome="esquerda" className="h-4 w-4" /> Bairros</Link>
          </nav>
          <h1 className="text-[38px] font-bold leading-tight md:text-[56px]">{nome}</h1>
          {texto && <p className="mt-3 text-[19px] font-medium text-white/90">{texto.chamada}</p>}
        </div>
      </section>
      <div className="container-site pt-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <p className="max-w-xl text-[17px] leading-relaxed text-ink-soft">
            {texto?.texto ?? `Veja os imóveis da Patrimóvel ADM em ${nome}. Se não encontrar o que procura, fale com a gente pelo WhatsApp e avisamos quando entrar um imóvel com o seu perfil.`}
          </p>
          {estado.status === "ok" && <Numeros lista={lista} />}
        </div>

        {alugar.length > 0 && (
          <section className="pt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[26px] font-bold">Para alugar em {nome}</h2>
              <Link to={`/alugar/${bairro}`} className="font-semibold text-brand-700">Filtrar os {alugar.length}</Link>
            </div>
            <GradeImoveis lista={alugar.slice(0, 6)} negocio="alugar" />
          </section>
        )}
        {comprar.length > 0 && (
          <section className="pt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[26px] font-bold">À venda em {nome}</h2>
              <Link to={`/comprar/${bairro}`} className="font-semibold text-brand-700">Filtrar os {comprar.length}</Link>
            </div>
            <GradeImoveis lista={comprar.slice(0, 6)} negocio="comprar" />
          </section>
        )}
        {estado.status === "carregando" && <div className="pt-14"><GradeImoveis lista={[]} carregando /></div>}
      </div>
    </>
  );
}
