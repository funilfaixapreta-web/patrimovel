import { useState } from "react";
import { Link } from "react-router-dom";
import { FormLead } from "../components/FormLead";
import { Icone } from "../components/Icone";
import { taxaAdministracao } from "../config";
import { faqAdministracao, incluso, passosAdministracao } from "../content";
import { useSeo } from "../lib/seo";
import { formatarPreco, resumoBairros, useVitrine } from "../lib/vitrine";

export function Faq({ itens }: { itens: readonly (readonly [string, string])[] }) {
  return (
    <div className="divide-y divide-sand-200 border-y border-sand-200">
      {itens.map(([p, r]) => (
        <details key={p} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
            {p}
            <Icone nome="baixo" className="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-ink-soft">{r}</p>
        </details>
      ))}
    </div>
  );
}

function Simulador({ taxa }: { taxa: number }) {
  const [aluguel, setAluguel] = useState(6000);
  const desconto = Math.round(aluguel * taxa);
  return (
    <section className="container-site pt-20" aria-labelledby="t-sim">
      <div className="grid gap-8 rounded-3xl bg-sand-50 p-8 md:grid-cols-2 md:p-12">
        <div>
          <h2 id="t-sim" className="titulo-secao">Quanto você recebe por mês</h2>
          <p className="mt-3 text-[16px] text-ink-soft">Coloque o aluguel e veja o valor que cai na sua conta depois da taxa de administração.</p>
          <label htmlFor="sim-aluguel" className="rotulo mt-6">Aluguel mensal</label>
          <input id="sim-aluguel" type="range" min={1500} max={40000} step={500} value={aluguel} onChange={(e) => setAluguel(Number(e.target.value))} className="w-full accent-brand-600" />
          <p className="num mt-2 text-[22px] font-bold">{formatarPreco(aluguel)}</p>
        </div>
        <dl className="grid content-center gap-3 rounded-2xl bg-white p-6">
          <div className="flex justify-between text-[16px]"><dt className="text-ink-soft">Aluguel</dt><dd className="num">{formatarPreco(aluguel)}</dd></div>
          <div className="flex justify-between text-[16px]"><dt className="text-ink-soft">Taxa de administração ({(taxa * 100).toLocaleString("pt-BR")}%)</dt><dd className="num">- {formatarPreco(desconto)}</dd></div>
          <div className="flex justify-between border-t border-sand-200 pt-3 text-[20px] font-bold"><dt>Você recebe</dt><dd className="num text-brand-700">{formatarPreco(aluguel - desconto)}</dd></div>
        </dl>
      </div>
    </section>
  );
}

export default function Administracao() {
  useSeo(
    "Administração de imóveis no Rio de Janeiro",
    "Alugue seu imóvel com a Patrimóvel Administradora: avaliação, anúncio, análise do inquilino, contrato, vistoria, cobrança mensal, repasse e informe para o IR.",
  );
  const estado = useVitrine();
  const n = estado.status === "ok" ? estado.vitrine.imoveis.length : null;
  const bairros = estado.status === "ok" ? resumoBairros(estado.vitrine.imoveis).length : null;

  return (
    <>
      <section className="border-b border-sand-200 bg-sand-50">
        <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div className="lg:pt-6">
            <p className="text-[14px] font-semibold text-brand-700">Para proprietários</p>
            <h1 className="mt-3 text-[36px] font-bold leading-[1.08] md:text-[52px]">Administração de imóveis no Rio de Janeiro</h1>
            <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-ink-soft">
              Você entrega a chave e a gente cuida do resto: inquilino, contrato, cobrança e repasse. Todo mês você recebe o aluguel com extrato, e no começo do ano, o informe para o Imposto de Renda.
            </p>
            <ul className="mt-8 grid gap-3 text-[16px]">
              {["Anúncio grátis no site e nos portais ZAP, Viva Real e OLX", "Corretor acompanhando cada visita", "Taxa apresentada por escrito antes de você assinar"].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><Icone nome="check" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" /> {t}</li>
              ))}
            </ul>
            {n !== null && n > 0 && (
              <p className="num mt-8 text-[15px] text-ink-muted">
                Hoje são {n} imóveis anunciados pela Patrimóvel ADM em {bairros} bairros.
              </p>
            )}
          </div>
          <div id="formulario" className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card md:p-8">
            <h2 className="text-[22px] font-bold">Peça uma avaliação do aluguel</h2>
            <p className="mb-6 mt-1 text-[15px] text-ink-soft">Respondemos pelo WhatsApp em horário comercial.</p>
            <FormLead
              origem="administracao"
              campos={["email", "bairro"]}
              opcoesNegocio={[
                { valor: "administrar", rotulo: "Alugar e administrar" },
                { valor: "vender", rotulo: "Vender" },
              ]}
              botao="Quero uma avaliação"
            />
            <p className="mt-5 border-t border-sand-200 pt-4 text-[14px] text-ink-soft">
              Prefere cadastrar o imóvel você mesmo, com fotos e valores? <Link to="/anunciar" className="font-semibold text-brand-700 underline">Anuncie online</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="container-site pt-20" aria-labelledby="t-incluso">
        <h2 id="t-incluso" className="titulo-secao max-w-2xl">O que está incluído</h2>
        <ul className="mt-8 grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
          {incluso.map(([t, d]) => (
            <li key={t} className="border-t-2 border-ink pt-4">
              <p className="text-[17px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-site pt-20" aria-labelledby="t-passos">
        <h2 id="t-passos" className="titulo-secao">Como funciona</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-4">
          {passosAdministracao.map(([t, d], k) => (
            <li key={t} className="rounded-2xl bg-sand-50 p-6">
              <span className="num grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-[15px] font-bold text-white">{k + 1}</span>
              <p className="mt-4 text-[17px] font-semibold">{t}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {taxaAdministracao !== null && <Simulador taxa={taxaAdministracao} />}

      <section id="troca" className="container-site pt-20" aria-labelledby="t-troca">
        <div className="grid gap-8 rounded-3xl bg-ink p-8 text-white md:grid-cols-[1.3fr_1fr] md:p-12">
          <div>
            <h2 id="t-troca" className="text-[28px] font-bold leading-tight md:text-[36px]">Já está alugado com outra administradora?</h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/80">
              Dá para trocar sem mexer no contrato do inquilino. Pegamos o contrato em andamento, avisamos o inquilino e assumimos a cobrança e o repasse a partir do mês seguinte.
            </p>
          </div>
          <ol className="grid content-center gap-3 text-[15px]">
            {["Você nos manda o contrato atual", "Conferimos garantia, reajuste e pendências", "Avisamos o inquilino e a administradora anterior", "O próximo aluguel já vem com a gente"].map((t, k) => (
              <li key={t} className="flex items-start gap-3"><span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/30 text-[13px]">{k + 1}</span>{t}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-site pt-20" aria-labelledby="t-faq">
        <h2 id="t-faq" className="titulo-secao mb-8">Perguntas frequentes</h2>
        <Faq itens={faqAdministracao} />
        <a href="#formulario" className="btn-primario mt-10">Pedir avaliação do meu imóvel</a>
      </section>
    </>
  );
}
