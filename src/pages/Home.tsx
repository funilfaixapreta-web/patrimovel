import { Link } from "react-router-dom";
import { BuscaHero } from "../components/BuscaHero";
import { GradeImoveis } from "../components/CardImovel";
import { Icone } from "../components/Icone";
import { passosAdministracao } from "../content";
import { empresa } from "../config";
import { useSeo } from "../lib/seo";
import { doNegocio, ehComercial, resumoBairros, useVitrine } from "../lib/vitrine";

export default function Home() {
  useSeo(
    "Patrimóvel Administradora | Imóveis para alugar e comprar no Rio de Janeiro",
    "Apartamentos, coberturas, casas, salas e andares corporativos para alugar e comprar na Barra, Zona Sul e Centro do Rio. Administração de imóveis do Grupo Patrimóvel.",
  );
  const estado = useVitrine();
  const imoveis = estado.status === "ok" ? estado.vitrine.imoveis : [];
  const carregando = estado.status === "carregando";
  const alugar = doNegocio(imoveis, "alugar");
  const comprar = doNegocio(imoveis, "comprar");
  const bairros = resumoBairros(imoveis);
  const comerciais = imoveis.filter(ehComercial);
  const residenciaisAlugar = alugar.filter((i) => !ehComercial(i));
  const residenciaisComprar = comprar.filter((i) => !ehComercial(i));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-mar">
        <picture>
          <source media="(max-width: 767px)" srcSet="/img/hero-ipanema-mobile.webp" />
          <source media="(max-width: 1100px)" srcSet="/img/hero-ipanema-900.webp 900w, /img/hero-ipanema-1760.webp 1760w" sizes="100vw" />
          <img
            src="/img/hero-ipanema-1760.webp"
            alt="Vista aérea da praia de Ipanema com o Morro Dois Irmãos ao fundo"
            width={1760}
            height={990}
            {...{ fetchpriority: "high" }}
            className="absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center]"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b2233]/70 via-[#0b2233]/25 to-[#0b2233]/70" />
        <div className="container-site pb-10 pt-16 md:pb-16 md:pt-28">
          <div className="max-w-4xl text-white">
            <p className="mb-4 text-[14px] font-medium text-white/85">Patrimóvel Administradora · CRECI {empresa.creci}</p>
            <h1 className="text-[34px] font-bold leading-[1.08] md:text-[54px]">Encontre imóveis exclusivos na Barra e Zona Sul do Rio</h1>
          </div>
          <div className="mt-8 max-w-4xl md:mt-10">
            <BuscaHero bairros={bairros} imoveis={imoveis} />
          </div>
          {bairros.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Bairros com mais imóveis">
              {bairros.slice(0, 6).map((b) => (
                <li key={b.slug}>
                  <Link to={`/bairros/${b.slug}`} className="num inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1.5 text-[14px] text-white backdrop-blur hover:bg-white/20">
                    {b.nome} <span className="text-white/70">{b.total}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Proprietário */}
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="container-site flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><Icone nome="chave" /></span>
            <div>
              <p className="text-[18px] font-semibold">Tem um imóvel para alugar ou vender?</p>
              <p className="text-[15px] text-ink-soft">A gente anuncia, escolhe o inquilino, faz o contrato e repassa o aluguel todo mês.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/administracao" className="btn-escuro">Administração de imóveis</Link>
            <Link to="/vender" className="btn-contorno">Quero vender</Link>
          </div>
        </div>
      </section>

      {/* Destaques aluguel */}
      <section className="container-site pt-16 md:pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="titulo-secao">Para alugar</h2>
            <p className="mt-2 text-[16px] text-ink-soft">Valores com condomínio e IPTU somados, para você comparar de verdade.</p>
          </div>
          <Link to="/alugar" className="num inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
            Ver {alugar.length || "todos os"} imóveis para alugar <Icone nome="seta" className="h-4 w-4" />
          </Link>
        </div>
        <GradeImoveis lista={(residenciaisAlugar.length >= 6 ? residenciaisAlugar : alugar).slice(0, 6)} negocio="alugar" carregando={carregando} />
      </section>

      {/* Destaques venda */}
      <section className="container-site pt-16 md:pt-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="titulo-secao">À venda</h2>
            <p className="mt-2 text-[16px] text-ink-soft">Apartamentos, coberturas e casas da nossa carteira.</p>
          </div>
          <Link to="/comprar" className="num inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
            Ver {comprar.length || "todos os"} imóveis à venda <Icone nome="seta" className="h-4 w-4" />
          </Link>
        </div>
        <GradeImoveis lista={(residenciaisComprar.length >= 6 ? residenciaisComprar : comprar).slice(0, 6)} negocio="comprar" carregando={carregando} />
      </section>

      {/* Bairros */}
      {bairros.length > 0 && (
        <section className="container-site pt-20 md:pt-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="titulo-secao">Onde estão os nossos imóveis</h2>
              <p className="mt-2 text-[16px] text-ink-soft">Escolha o bairro para ver o guia e tudo que está disponível nele.</p>
            </div>
            <Link to="/bairros" className="inline-flex items-center gap-1.5 font-semibold text-brand-700 hover:text-brand-800">
              Todos os bairros <Icone nome="seta" className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {bairros.slice(0, 8).map((b) => (
              <li key={b.slug}>
                <Link to={`/bairros/${b.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand-100 md:aspect-[4/3]">
                  {b.foto && <img src={b.foto} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[18px] font-semibold leading-tight">{b.nome}</p>
                    <p className="num text-[13.5px] text-white/85">{b.total} {b.total === 1 ? "imóvel" : "imóveis"}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Corporativo */}
      {comerciais.length > 0 && (
        <section className="container-site pt-20 md:pt-24">
          <div className="grid gap-8 overflow-hidden rounded-3xl bg-ink p-8 text-white md:grid-cols-[1.2fr_1fr] md:p-12">
            <div>
              <p className="num text-[14px] font-medium text-white/70">{comerciais.length} imóveis comerciais na carteira</p>
              <h2 className="mt-3 text-[28px] font-bold leading-tight md:text-[36px]">Salas, lojas e andares corporativos</h2>
              <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-white/80">
                Andares inteiros em Botafogo e no Centro, salas na Barra e lojas de rua, com área e custos mensais em cada anúncio.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <Link to="/alugar?grupo=comercial" className="btn bg-white text-ink hover:bg-sand-100">Comerciais para alugar</Link>
                <Link to="/comprar?grupo=comercial" className="btn border border-white/30 text-white hover:bg-white/10">Comerciais à venda</Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-3 self-end">
              {["andar corporativo", "sala", "loja", "conjunto comercial"].map((t) => {
                const n = comerciais.filter((i) => i.tipo === t).length;
                if (!n) return null;
                return (
                  <li key={t} className="rounded-2xl border border-white/15 p-4">
                    <p className="num text-[28px] font-bold">{n}</p>
                    <p className="text-[14px] text-white/75">{t === "sala" ? "salas" : t === "loja" ? "lojas" : t === "andar corporativo" ? "andares corporativos" : "conjuntos comerciais"}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Como a administração funciona */}
      <section className="container-site pt-20 md:pt-24">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="titulo-secao">Seu imóvel alugado e administrado</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">
              Somos a administradora do Grupo Patrimóvel. Cuidamos de tudo entre a primeira visita e a entrega das chaves, e depois todo mês, até o fim do contrato.
            </p>
            <Link to="/administracao" className="btn-primario mt-7">Conhecer a administração</Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {passosAdministracao.map(([titulo, texto], k) => (
              <li key={titulo} className="rounded-2xl border border-sand-200 p-5">
                <span className="num text-[13px] font-semibold text-brand-700">Passo {k + 1}</span>
                <p className="mt-1 text-[17px] font-semibold">{titulo}</p>
                <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contato */}
      <section className="container-site pt-20 md:pt-24">
        <div className="grid gap-6 rounded-3xl border border-sand-200 bg-sand-50 p-8 md:grid-cols-3 md:p-10">
          <div className="md:col-span-1">
            <h2 className="text-[24px] font-bold leading-tight">Fale com a Patrimóvel ADM</h2>
            <p className="mt-2 text-[15px] text-ink-soft">{empresa.horario}</p>
          </div>
          <dl className="grid gap-5 text-[15px] sm:grid-cols-2 md:col-span-2">
            <div>
              <dt className="text-ink-muted">WhatsApp</dt>
              <dd className="num mt-0.5 text-[18px] font-semibold">{empresa.whatsappTexto}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Telefone</dt>
              <dd className="num mt-0.5 text-[18px] font-semibold">{empresa.telefone}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Escritório</dt>
              <dd className="mt-0.5">{empresa.endereco}, {empresa.bairroCidade}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">E-mail</dt>
              <dd className="mt-0.5 break-words">{empresa.email}</dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
