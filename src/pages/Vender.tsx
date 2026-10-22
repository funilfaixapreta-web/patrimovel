import { Link } from "react-router-dom";
import { FormLead } from "../components/FormLead";
import { Icone } from "../components/Icone";
import { passosVenda } from "../content";
import { useSeo } from "../lib/seo";
import { doNegocio, useVitrine } from "../lib/vitrine";

export default function Vender() {
  useSeo(
    "Venda seu imóvel no Rio de Janeiro",
    "Avaliação, fotos, vídeo, anúncio nos portais e acompanhamento até a escritura. Venda seu imóvel com a Patrimóvel Administradora.",
  );
  const estado = useVitrine();
  const aVenda = estado.status === "ok" ? doNegocio(estado.vitrine.imoveis, "comprar").length : null;

  return (
    <>
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="lg:pt-6">
            <p className="text-[14px] font-semibold text-brand-700">Para proprietários</p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.08] md:text-[52px]">Venda seu imóvel com quem conhece o bairro</h1>
            <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink-soft">
              Começamos pela avaliação com base em vendas recentes da região. Depois cuidamos das fotos, do anúncio, das visitas e da papelada até a escritura.
            </p>
            {aVenda !== null && aVenda > 0 && (
              <p className="num mt-8 text-[15px] text-ink-muted">
                {aVenda} imóveis à venda na nossa carteira hoje. <Link to="/comprar" className="font-semibold text-brand-700 underline">Ver imóveis</Link>
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card md:p-8">
            <h2 className="text-[22px] font-bold">Peça a avaliação do seu imóvel</h2>
            <p className="mb-6 mt-1 text-[15px] text-ink-soft">Sem custo e sem compromisso.</p>
            <FormLead origem="vender" campos={["email", "bairro", "mensagem"]} negocioPadrao="vender" botao="Quero avaliar meu imóvel" placeholderMensagem="Tipo, metragem e valor que você imagina (opcional)" />
            <p className="mt-5 border-t border-sand-200 pt-4 text-[14px] text-ink-soft">
              Prefere cadastrar o imóvel você mesmo, com fotos e valores? <Link to="/anunciar" className="font-semibold text-brand-700 underline">Anuncie online</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="container-site pt-20" aria-labelledby="t-venda">
        <h2 id="t-venda" className="titulo-secao">Do anúncio à escritura</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {passosVenda.map(([t, d], k) => (
            <li key={t} className="rounded-2xl bg-sand-50 p-6">
              <span className="num grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[15px] font-bold text-white">{k + 1}</span>
              <p className="mt-4 text-[17px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-site pt-20">
        <div className="flex flex-col gap-6 rounded-3xl border border-sand-200 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Icone nome="chave" /></span>
            <div>
              <p className="text-[20px] font-semibold">Prefere alugar em vez de vender?</p>
              <p className="mt-1 text-[15px] text-ink-soft">Veja como funciona a administração do seu imóvel com a Patrimóvel ADM.</p>
            </div>
          </div>
          <Link to="/administracao" className="btn-escuro shrink-0">Ver administração</Link>
        </div>
      </section>
    </>
  );
}
