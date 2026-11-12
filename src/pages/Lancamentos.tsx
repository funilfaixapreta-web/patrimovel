import { Link } from "react-router-dom";
import { FormLead } from "../components/FormLead";
import { Galeria } from "../components/Galeria";
import { Icone, IconeWhatsApp } from "../components/Icone";
import {
  fotosDoLancamento,
  lancamentoPorSlug,
  lancamentos,
  pastaLancamento,
  plantasDoLancamento,
  textoLancamentos,
  type Lancamento,
} from "../content/lancamentos";
import { linkWhatsApp, rastrear } from "../lib/leads";
import { useJsonLd, useSeo } from "../lib/seo";
import NaoEncontrado from "./NaoEncontrado";

function mensagemWhats(l: Lancamento) {
  return `Olá! Vi o ${l.nome} no site da Patrimóvel ADM e quero receber a apresentação completa.`;
}

function BotaoWhats({ l, local, className = "btn-whats" }: { l: Lancamento; local: string; className?: string }) {
  return (
    <a
      href={linkWhatsApp(mensagemWhats(l))}
      target="_blank"
      rel="noopener"
      onClick={() => rastrear("whatsapp_click", { local, lancamento: l.slug })}
      className={className}
    >
      <IconeWhatsApp className="h-5 w-5" /> Fale com o nosso time
    </a>
  );
}

export function ListaLancamentos() {
  useSeo(
    "Lançamentos em Ipanema",
    "Lançamentos exclusivos na Rua Prudente de Morais, em Ipanema: Orla Ipanema, Belavista Ipanema, Vista Ipanema e 786 Prudente, com curadoria da Patrimóvel ADM.",
    "/img/lancamentos/hero.webp",
  );
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src="/img/lancamentos/hero.webp" alt="Pôr do sol em Ipanema" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />
        <div className="container-site py-20 md:py-32">
          <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-white/80">Lançamentos 2025</p>
          <h1 className="mt-3 max-w-3xl text-[36px] font-bold leading-tight md:text-[56px]">{textoLancamentos.titulo}</h1>
          <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-white/90">{textoLancamentos.subtitulo}</p>
        </div>
      </section>
      <div className="container-site pt-12 md:pt-16">
        <div className="max-w-3xl space-y-4 text-[17px] leading-relaxed text-ink-soft">
          {textoLancamentos.textos.map((t) => <p key={t}>{t}</p>)}
        </div>
      </div>
      <div className="container-site grid gap-10 pt-12 md:pt-16">
        {lancamentos.map((l, i) => (
          <article key={l.slug} className={`grid overflow-hidden rounded-3xl border border-sand-200 md:grid-cols-2 ${i % 2 ? "md:[&>a]:order-2" : ""}`}>
            <Link to={`/${l.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-sand-100 md:aspect-auto md:min-h-[420px]">
              <img src={`${pastaLancamento(l.slug)}/hero.webp`} alt={l.nome} loading={i ? "lazy" : "eager"} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-ink">{l.selo}</span>
            </Link>
            <div className="flex flex-col p-6 md:p-10">
              <h2 className="text-[28px] font-bold md:text-[34px]">{l.nome}</h2>
              <ul className="mt-4 grid gap-2 text-[15px] text-ink-soft">
                {l.itensCartao.map((t) => (
                  <li key={t} className="flex gap-2"><Icone nome="check" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />{t}</li>
                ))}
              </ul>
              <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">{l.resumo}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-6">
                <Link to={`/${l.slug}`} className="btn-escuro">Conheça o {l.nome}</Link>
                <BotaoWhats l={l} local="lista_lancamentos" className="btn-contorno" />
              </div>
              <p className="mt-4 text-[12.5px] text-ink-muted">{textoLancamentos.aviso}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export function PaginaLancamento({ slug }: { slug: string }) {
  const l = lancamentoPorSlug(slug);
  useSeo(
    l ? `${l.nome} · Lançamento em Ipanema` : "Lançamento não encontrado",
    l ? `${l.nome}, ${l.endereco}. ${l.chamada}. ${l.resumo}`.slice(0, 300) : undefined,
    l ? `${pastaLancamento(l.slug)}/hero.webp` : undefined,
  );
  useJsonLd(
    "ld-lancamento",
    l
      ? {
          "@context": "https://schema.org",
          "@type": "Residence",
          name: l.nome,
          description: l.resumo,
          address: { "@type": "PostalAddress", streetAddress: l.endereco.split(" · ")[0], addressLocality: "Rio de Janeiro", addressRegion: "RJ", addressCountry: "BR" },
          image: `${pastaLancamento(l.slug)}/hero.webp`,
        }
      : null,
  );
  if (!l) return <NaoEncontrado endereco={`/${slug}`} />;

  const base = pastaLancamento(l.slug);
  const fotos = fotosDoLancamento(l);
  const plantas = plantasDoLancamento(l);
  const outros = lancamentos.filter((o) => o.slug !== l.slug);

  return (
    <>
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-ink text-white">
        <img src={`${base}/hero.webp`} alt={`Fachada do ${l.nome}`} {...{ fetchpriority: "high" }} className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" />
        <div className="container-site pb-12 pt-24 md:pb-16">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/80">{l.selo}</p>
          <img src={`${base}/logo.webp`} alt={l.nome} className="mt-4 h-auto max-h-[120px] w-auto max-w-[min(360px,80vw)] object-contain object-left" />
          <h1 className="sr-only">{l.nome}</h1>
          <p className="mt-5 max-w-2xl text-[18px] font-medium md:text-[20px]">{l.chamada}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[15px] text-white/85"><Icone nome="pino" className="h-4 w-4" />{l.endereco}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#contato" className="btn bg-white text-ink hover:bg-white/90">Agende sua visita</a>
            <BotaoWhats l={l} local="hero_lancamento" />
          </div>
        </div>
      </section>

      <div className="container-site grid gap-10 pt-14 md:grid-cols-[1fr_1.4fr] md:pt-20">
        <p className="text-[14px] font-semibold uppercase tracking-wide text-brand-700">{l.intro.rotulo}</p>
        <div className="space-y-4 text-[18px] leading-relaxed text-ink-soft">
          {l.intro.textos.map((t) => <p key={t}>{t}</p>)}
        </div>
      </div>

      <section className="container-site pt-14 md:pt-20">
        <h2 className="titulo-secao max-w-2xl">{l.conceito.titulo}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {l.conceito.itens.map((c) => (
            <div key={c.titulo} className="rounded-2xl bg-sand-50 p-6">
              <h3 className="text-[18px] font-semibold">{c.titulo}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-ink-soft">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-site pt-14 md:pt-20" aria-label="Fotos">
        <Galeria fotos={fotos} titulo={l.nome} />
        <p className="mt-2 text-[12.5px] text-ink-muted">Imagens ilustrativas.</p>
      </section>

      <section className="container-site pt-14 md:pt-20">
        <p className="text-[14px] font-semibold uppercase tracking-wide text-brand-700">{l.lazer.rotulo}</p>
        <h2 className="titulo-secao mt-2 max-w-2xl">{l.lazer.titulo}</h2>
        <ul className="mt-7 flex flex-wrap gap-2">
          {l.lazer.itens.map((t) => (
            <li key={t} className="rounded-full border border-sand-300 px-4 py-2 text-[15px]">{t}</li>
          ))}
        </ul>
      </section>

      <section className="container-site pt-14 md:pt-20">
        <p className="text-[14px] font-semibold uppercase tracking-wide text-brand-700">Tipologias</p>
        <h2 className="titulo-secao mt-2 max-w-2xl">{l.tipologias.titulo}</h2>
        <ul className="mt-7 grid gap-3 md:grid-cols-2">
          {l.tipologias.itens.map((t) => (
            <li key={t.nome} className="rounded-2xl border border-sand-200 p-5">
              <p className="text-[18px] font-semibold">{t.nome}</p>
              <p className="mt-1 text-[15.5px] text-ink-soft">{t.detalhe}</p>
            </li>
          ))}
        </ul>
        {l.tipologias.nota && <p className="mt-4 text-[15.5px] text-ink-soft">{l.tipologias.nota}</p>}
        {plantas.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plantas.map((p, i) => (
              <a key={p} href={p} target="_blank" rel="noopener" className="block overflow-hidden rounded-2xl border border-sand-200 bg-white">
                <img src={p} alt={`Planta ${i + 1} do ${l.nome}`} loading="lazy" className="aspect-[4/3] w-full object-contain p-2" />
              </a>
            ))}
          </div>
        )}
        <div className="mt-6"><a href="#contato" className="btn-escuro">Escolha o seu layout</a></div>
      </section>

      {l.secoes.map((s) => (
        <section key={s.titulo} className="container-site grid gap-6 pt-14 md:grid-cols-[1fr_1.4fr] md:pt-20">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-wide text-brand-700">{s.rotulo}</p>
            <h2 className="mt-2 text-[24px] font-bold leading-tight md:text-[30px]">{s.titulo}</h2>
          </div>
          <div className="space-y-3 text-[17px] leading-relaxed text-ink-soft">
            {s.textos.map((t) => <p key={t}>{t}</p>)}
          </div>
        </section>
      ))}

      {l.mapa && (
        <section className="container-site pt-14 md:pt-20">
          <h2 className="text-[24px] font-bold md:text-[30px]">Localização</h2>
          <p className="mt-1 text-[16px] text-ink-soft">{l.endereco}</p>
          <img src={`${base}/mapa.webp`} alt={`Mapa da região do ${l.nome}`} loading="lazy" className="mt-5 w-full rounded-2xl border border-sand-200" />
        </section>
      )}

      <section className="container-site pt-14 md:pt-20">
        <div className="rounded-3xl border border-sand-200 p-6 md:p-10">
          <h2 className="text-[22px] font-bold">Ficha técnica</h2>
          <ul className="mt-4 grid gap-2 text-[15.5px] text-ink-soft">
            {l.fichaTecnica.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
      </section>

      <section id="contato" className="container-site scroll-mt-24 pt-14 md:pt-20">
        <div className="grid gap-10 rounded-3xl bg-ink p-6 text-white md:grid-cols-2 md:p-12">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-white/70">Lançamento {l.nome}</p>
            <h2 className="mt-3 text-[28px] font-bold leading-tight md:text-[38px]">{l.investimento.titulo}</h2>
            <p className="mt-5 text-[20px] font-semibold">{l.investimento.valor}</p>
            {l.investimento.referencia && <p className="mt-3 text-[15.5px] leading-relaxed text-white/80">{l.investimento.referencia}</p>}
            <p className="mt-3 text-[13px] text-white/60">* Valor sujeito a alteração sem aviso prévio, conforme disponibilidade e tabela vigente.</p>
            <div className="mt-6"><BotaoWhats l={l} local="contato_lancamento" /></div>
          </div>
          <div className="rounded-2xl bg-white p-5 text-ink md:p-7">
            <p className="mb-4 text-[17px] font-semibold">Receba a apresentação completa</p>
            <FormLead origem="lancamento" empreendimento={l.nome} negocioPadrao="comprar" campos={["email", "mensagem"]} placeholderMensagem="Conte o que você procura (opcional)" botao="Quero receber" />
          </div>
        </div>
      </section>

      <div className="container-site pt-10">
        <p className="max-w-4xl text-[12.5px] leading-relaxed text-ink-muted"><strong>Aviso legal:</strong> {l.aviso}</p>
      </div>

      <section className="container-site pt-14 md:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[24px] font-bold md:text-[30px]">Outros lançamentos</h2>
          <Link to="/lancamentos" className="text-[15px] font-semibold text-brand-700 hover:underline">Ver todos</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {outros.map((o) => (
            <Link key={o.slug} to={`/${o.slug}`} className="group overflow-hidden rounded-2xl border border-sand-200">
              <img src={`${pastaLancamento(o.slug)}/hero.webp`} alt={o.nome} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="p-4">
                <p className="text-[12.5px] font-semibold uppercase tracking-wide text-brand-700">{o.selo}</p>
                <p className="mt-1 text-[18px] font-semibold">{o.nome}</p>
              </div>
            </Link>
          ))}
        </div>
        {l.post && (
          <p className="mt-6 text-[15px]">
            Leia também no blog: <Link to={`/post/${l.post}`} className="font-semibold text-brand-700 hover:underline">{l.nome} em detalhes</Link>
          </p>
        )}
      </section>
    </>
  );
}
