import { FormLead } from "./FormLead";

/** "Precisa de ajuda pra encontrar o imóvel ideal?" (seção Curadoria do site antigo). */
export function Curadoria({ id = "curadoria" }: { id?: string }) {
  return (
    <section id={id} className="container-site scroll-mt-24 pt-16 md:pt-24">
      <div className="grid gap-10 rounded-3xl bg-sand-50 p-6 md:grid-cols-[1fr_1.1fr] md:p-12">
        <div>
          <p className="text-[14px] font-semibold uppercase tracking-wide text-brand-700">Curadoria</p>
          <h2 className="titulo-secao mt-2">Precisa de ajuda pra encontrar o imóvel ideal?</h2>
          <p className="mt-4 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Conte o que você procura e o nosso time seleciona os imóveis que combinam com você, para comprar ou alugar.
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card md:p-7">
          <FormLead
            origem="curadoria"
            campos={["email", "bairro", "valor"]}
            opcoesNegocio={[
              { valor: "comprar", rotulo: "Comprar" },
              { valor: "alugar", rotulo: "Alugar" },
            ]}
            rotuloBairro="Bairro de preferência"
            placeholderBairro="Ex.: Ipanema, Leblon, Gávea"
            botao="Quero a curadoria"
          />
        </div>
      </div>
    </section>
  );
}
