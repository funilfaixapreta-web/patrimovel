import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CardImovel, Fatos } from "../components/CardImovel";
import { FormLead } from "../components/FormLead";
import { Galeria, VideoYoutube } from "../components/Galeria";
import { Icone, IconeWhatsApp } from "../components/Icone";
import { empresa } from "../config";
import { useFavoritos } from "../lib/favoritos";
import { linkWhatsApp, mensagemImovel, rastrear } from "../lib/leads";
import { registrarVisita } from "../lib/visitas";
import { useJsonLd, useSeo } from "../lib/seo";
import {
  custoMensal,
  ehComercial,
  formatarArea,
  formatarPreco,
  porCodigo,
  rotuloTipo,
  serveParaAlugar,
  serveParaComprar,
  similares,
  slug,
  tituloImovel,
  useVitrine,
  youtubeId,
  type Imovel as TImovel,
} from "../lib/vitrine";
import NaoEncontrado from "./NaoEncontrado";

function Descricao({ texto }: { texto: string }) {
  const [inteira, setInteira] = useState(false);
  const blocos = texto.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const curtos = inteira ? blocos : blocos.slice(0, 5);
  return (
    <div>
      <div className="space-y-3 text-[16px] leading-relaxed text-ink-soft">
        {curtos.map((b, k) =>
          /^[•\-*]/.test(b) ? (
            <p key={k} className="flex gap-2"><span className="text-brand-600">•</span><span>{b.replace(/^[•\-*]\s*/, "")}</span></p>
          ) : (
            <p key={k}>{b}</p>
          ),
        )}
      </div>
      {blocos.length > 5 && (
        <button type="button" onClick={() => setInteira(!inteira)} className="mt-3 font-semibold text-brand-700 underline underline-offset-2">
          {inteira ? "Mostrar menos" : "Ler descrição completa"}
        </button>
      )}
    </div>
  );
}

function LinhaValor({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${destaque ? "border-t border-sand-200 pt-3 text-[17px] font-bold text-ink" : "text-[15px] text-ink-soft"}`}>
      <dt>{rotulo}</dt>
      <dd className="num">{valor}</dd>
    </div>
  );
}

function Valores({ i }: { i: TImovel }) {
  const aluga = serveParaAlugar(i);
  const vende = serveParaComprar(i);
  const total = custoMensal(i);
  return (
    <div className="space-y-4">
      {aluga && (
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Aluguel</p>
          <p className="num mt-1 text-[30px] font-bold leading-none">{formatarPreco(i.valor_locacao)}<span className="text-[16px] font-medium text-ink-muted"> /mês</span></p>
          <dl className="mt-4 space-y-2">
            {i.condominio && <LinhaValor rotulo="Condomínio" valor={formatarPreco(i.condominio, true)} />}
            {i.iptu && <LinhaValor rotulo="IPTU por mês" valor={formatarPreco(i.iptu, true)} />}
            {total && total !== i.valor_locacao && <LinhaValor rotulo="Total por mês" valor={formatarPreco(total, true)} destaque />}
          </dl>
          <p className="mt-2 text-[12.5px] text-ink-muted">Seguro incêndio e taxas do contrato informados na proposta.</p>
        </div>
      )}
      {vende && (
        <div className={aluga ? "border-t border-sand-200 pt-4" : ""}>
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-muted">Venda</p>
          <p className="num mt-1 text-[30px] font-bold leading-none">{formatarPreco(i.valor_venda)}</p>
          {!aluga && (i.condominio || i.iptu) && (
            <dl className="mt-4 space-y-2">
              {i.condominio && <LinhaValor rotulo="Condomínio" valor={formatarPreco(i.condominio, true)} />}
              {i.iptu && <LinhaValor rotulo="IPTU por mês" valor={formatarPreco(i.iptu, true)} />}
            </dl>
          )}
          {i.area_util_m2 && i.valor_venda && (
            <p className="num mt-2 text-[13px] text-ink-muted">{formatarPreco(Math.round(i.valor_venda / i.area_util_m2))} por m² de área útil</p>
          )}
        </div>
      )}
    </div>
  );
}

function CaixaContato({ i }: { i: TImovel }) {
  const [aba, setAba] = useState<"visita" | "duvida">("visita");
  const titulo = tituloImovel(i);
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-card md:p-6">
      <Valores i={i} />
      <a
        href={linkWhatsApp(mensagemImovel(i.codigo, titulo))}
        target="_blank"
        rel="noopener"
        onClick={() => { rastrear("whatsapp_click", { local: "ficha", imovel_codigo: i.codigo }); registrarVisita(i.codigo, "whatsapp"); }}
        className="btn-whats mt-6 w-full py-3.5 text-[16px]"
      >
        <IconeWhatsApp /> Conversar no WhatsApp
      </a>
      <div className="mt-6 border-t border-sand-200 pt-5">
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-sand-100 p-1" role="tablist">
          {([["visita", "Agendar visita"], ["duvida", "Tirar dúvida"]] as const).map(([v, r]) => (
            <button key={v} role="tab" aria-selected={aba === v} onClick={() => setAba(v)} className={`rounded-lg py-2 text-[14px] font-semibold ${aba === v ? "bg-white shadow-sm" : "text-ink-muted"}`}>
              {r}
            </button>
          ))}
        </div>
        {aba === "visita" ? (
          <FormLead key="visita" origem="ficha_visita" campos={["visita"]} imovelCodigo={i.codigo} negocioPadrao={serveParaAlugar(i) ? "alugar" : "comprar"} botao="Pedir horário de visita" />
        ) : (
          <FormLead key="duvida" origem="ficha_contato" campos={["email", "mensagem"]} imovelCodigo={i.codigo} negocioPadrao={serveParaAlugar(i) ? "alugar" : "comprar"} botao="Enviar pergunta" placeholderMensagem="Ex.: aceita pet? Qual a garantia?" />
        )}
      </div>
      <p className="mt-4 text-center text-[13px] text-ink-muted">
        Ou ligue <a href={`tel:${empresa.telefoneLink}`} className="num font-semibold text-ink underline" onClick={() => { rastrear("phone_click", { local: "ficha" }); registrarVisita(i.codigo, "telefone"); }}>{empresa.telefone}</a>
      </p>
    </div>
  );
}

export default function Imovel() {
  const { codigo = "" } = useParams();
  const estado = useVitrine();
  const { tem, alternar } = useFavoritos();
  const todos = estado.status === "ok" ? estado.vitrine.imoveis : [];
  const i = porCodigo(todos, codigo);
  const titulo = i ? tituloImovel(i) : "Imóvel";
  useEffect(() => {
    if (i?.codigo) registrarVisita(i.codigo, "visualizou");
  }, [i?.codigo]);
  const negocioTexto = i ? [serveParaAlugar(i) && "para alugar", serveParaComprar(i) && "à venda"].filter(Boolean).join(" e ") : "";

  useSeo(
    i ? `${titulo} ${negocioTexto} · ${i.codigo}` : "Imóvel",
    i
      ? `${rotuloTipo(i.tipo)} ${negocioTexto} em ${i.bairro}, ${i.cidade}. ${[i.area_util_m2 && formatarArea(i.area_util_m2), i.quartos && `${i.quartos} quartos`, i.vagas && `${i.vagas} vagas`].filter(Boolean).join(", ")}. Código ${i.codigo}.`
      : undefined,
    i?.fotos[0],
  );

  const ld = useMemo(
    () =>
      i
        ? {
            "@context": "https://schema.org",
            "@type": "RealEstateListing",
            name: titulo,
            url: `https://www.patrimoveladm.com.br/imovel/${i.codigo}`,
            image: i.fotos.slice(0, 5),
            datePosted: i.updated_at,
            offers: [
              serveParaAlugar(i) && { "@type": "Offer", price: i.valor_locacao, priceCurrency: "BRL", businessFunction: "http://purl.org/goodrelations/v1#LeaseOut" },
              serveParaComprar(i) && { "@type": "Offer", price: i.valor_venda, priceCurrency: "BRL", businessFunction: "http://purl.org/goodrelations/v1#Sell" },
            ].filter(Boolean),
            about: {
              "@type": ehComercial(i) ? "Place" : "Apartment",
              floorSize: i.area_util_m2 ? { "@type": "QuantitativeValue", value: i.area_util_m2, unitCode: "MTK" } : undefined,
              numberOfRooms: i.quartos ?? undefined,
              address: { "@type": "PostalAddress", addressLocality: i.cidade, addressRegion: i.uf, streetAddress: i.bairro },
            },
          }
        : null,
    [i, titulo],
  );
  useJsonLd("ld-imovel", ld);

  if (estado.status === "carregando") {
    return (
      <div className="container-site pt-8" aria-busy="true">
        <div className="h-[460px] animate-pulse rounded-2xl bg-sand-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-sand-100" />
      </div>
    );
  }
  if (!i) return <NaoEncontrado mensagem={`Não encontramos o imóvel ${codigo.toUpperCase()}. Ele pode ter sido alugado ou vendido.`} />;

  const parecidos = similares(todos, i);
  const video = i.videos.map(youtubeId).find(Boolean) ?? null;
  const videoLink = !video ? i.videos[0] : null;
  const favorito = tem(i.codigo);
  const negocio = serveParaAlugar(i) ? "alugar" : "comprar";

  const ficha: [string, string][] = [
    ["Código", i.codigo],
    ["Tipo", rotuloTipo(i.tipo)],
    ["Área útil", formatarArea(i.area_util_m2)],
    ["Área total", formatarArea(i.area_total_m2)],
    ...(!ehComercial(i) ? ([["Quartos", i.quartos ? String(i.quartos) : ""], ["Suítes", i.suites ? String(i.suites) : ""]] as [string, string][]) : []),
    ["Banheiros", i.banheiros ? String(i.banheiros) : ""],
    ["Vagas", i.vagas ? String(i.vagas) : ""],
    ["Bairro", i.bairro ?? ""],
  ];

  async function compartilhar() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: titulo, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* usuário cancelou */
    }
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="container-site pt-6 md:pt-8">
        <nav aria-label="Caminho" className="mb-4 text-[14px] text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link to="/" className="hover:text-ink">Início</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to={`/${negocio}`} className="hover:text-ink">{negocio === "alugar" ? "Alugar" : "Comprar"}</Link></li>
            {i.bairro && (<><li aria-hidden="true">/</li><li><Link to={`/${negocio}/${slug(i.bairro)}`} className="hover:text-ink">{i.bairro}</Link></li></>)}
            <li aria-hidden="true">/</li>
            <li className="num text-ink">{i.codigo}</li>
          </ol>
        </nav>

        <Galeria fotos={i.fotos} titulo={titulo} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-10">
            <header>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="num text-[14px] font-medium text-ink-muted">{rotuloTipo(i.tipo)} · Código {i.codigo}</p>
                  <h1 className="mt-1 text-[28px] font-bold leading-tight md:text-[36px]">{titulo}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-[16px] text-ink-soft">
                    <Icone nome="pino" className="h-[18px] w-[18px] text-brand-600" /> {[i.bairro, i.cidade && `${i.cidade}, ${i.uf}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => alternar(i.codigo)} aria-pressed={favorito} className={`btn-contorno px-4 py-2.5 ${favorito ? "text-brand-700" : ""}`}>
                    <Icone nome="coracao" className="h-[18px] w-[18px]" preenchido={favorito} /> {favorito ? "Salvo" : "Salvar"}
                  </button>
                  <button type="button" onClick={compartilhar} className="btn-contorno px-4 py-2.5" aria-label="Compartilhar imóvel">
                    <Icone nome="compartilhar" className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </div>
              <Fatos i={i} className="mt-5 gap-x-6 text-[16px]" />
            </header>

            <div className="lg:hidden"><CaixaContato i={i} /></div>

            {i.descricao && (
              <section aria-labelledby="t-desc">
                <h2 id="t-desc" className="mb-4 text-[22px] font-bold">Sobre o imóvel</h2>
                <Descricao texto={i.descricao} />
              </section>
            )}

            {(video || videoLink || i.tour_virtual_url) && (
              <section aria-labelledby="t-video" className="space-y-4">
                <h2 id="t-video" className="text-[22px] font-bold">Vídeo e tour</h2>
                {video && <VideoYoutube id={video} titulo={titulo} />}
                <div className="flex flex-wrap gap-2">
                  {videoLink && <a href={videoLink} target="_blank" rel="noopener" className="btn-contorno"><Icone nome="play" className="h-4 w-4" preenchido /> Assistir ao vídeo</a>}
                  {i.tour_virtual_url && <a href={i.tour_virtual_url} target="_blank" rel="noopener" className="btn-contorno"><Icone nome="tour" className="h-[18px] w-[18px]" /> Abrir tour virtual 360°</a>}
                </div>
              </section>
            )}

            <section aria-labelledby="t-ficha">
              <h2 id="t-ficha" className="mb-4 text-[22px] font-bold">Ficha técnica</h2>
              <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-sand-200 bg-sand-200 sm:grid-cols-4">
                {ficha.filter(([, v]) => v).map(([r, v]) => (
                  <div key={r} className="bg-white p-4">
                    <dt className="text-[13px] text-ink-muted">{r}</dt>
                    <dd className="num mt-0.5 text-[16px] font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {i.caracteristicas.length > 0 && (
              <section aria-labelledby="t-carac">
                <h2 id="t-carac" className="mb-4 text-[22px] font-bold">O imóvel tem</h2>
                <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {i.caracteristicas.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-[15px] text-ink-soft"><Icone nome="check" className="h-[18px] w-[18px] text-brand-600" /> {c}</li>
                  ))}
                </ul>
              </section>
            )}

            {serveParaAlugar(i) && (
              <section aria-labelledby="t-alugar" className="rounded-2xl bg-sand-50 p-6">
                <h2 id="t-alugar" className="text-[20px] font-bold">Como alugar este imóvel</h2>
                <ol className="mt-4 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Visite", "Agende pelo formulário ou pelo WhatsApp. Um corretor acompanha a visita."],
                    ["Envie a proposta", "Você manda os documentos e escolhe a garantia. A nossa equipe faz a análise."],
                    ["Assine e receba a chave", "Contrato, vistoria com fotos e entrega das chaves."],
                  ].map(([t, d], k) => (
                    <li key={t}>
                      <p className="num text-[13px] font-semibold text-brand-700">{k + 1}</p>
                      <p className="font-semibold">{t}</p>
                      <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">{d}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-[96px]"><CaixaContato i={i} /></div>
          </aside>
        </div>

        {parecidos.length > 0 && (
          <section className="pt-16" aria-labelledby="t-parecidos">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <h2 id="t-parecidos" className="text-[24px] font-bold">Parecidos {i.bairro && parecidos.some((p) => p.bairro === i.bairro) ? `em ${i.bairro}` : "na nossa carteira"}</h2>
              {i.bairro && <Link to={`/${negocio}/${slug(i.bairro)}`} className="font-semibold text-brand-700">Ver todos em {i.bairro}</Link>}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {parecidos.map((p) => <CardImovel key={p.codigo} i={p} negocio={negocio} />)}
            </div>
          </section>
        )}
      </div>

      {/* Barra fixa no celular */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="container-site flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="num truncate text-[17px] font-bold">
              {formatarPreco(serveParaAlugar(i) ? i.valor_locacao : i.valor_venda)}
              {serveParaAlugar(i) && <span className="text-[13px] font-medium text-ink-muted"> /mês</span>}
            </p>
            {serveParaAlugar(i) && custoMensal(i) !== i.valor_locacao && <p className="num truncate text-[12.5px] text-ink-muted">Total {formatarPreco(custoMensal(i))}</p>}
          </div>
          <a
            href={linkWhatsApp(mensagemImovel(i.codigo, titulo))}
            target="_blank"
            rel="noopener"
            onClick={() => { rastrear("whatsapp_click", { local: "ficha_barra", imovel_codigo: i.codigo }); registrarVisita(i.codigo, "whatsapp"); }}
            className="btn-whats px-4 py-3"
          >
            <IconeWhatsApp /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
