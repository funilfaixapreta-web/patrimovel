import { Link } from "react-router-dom";
import { GradeImoveis } from "../components/CardImovel";
import { FormLead } from "../components/FormLead";
import { Icone, IconeWhatsApp } from "../components/Icone";
import { areaDoCliente, empresa } from "../config";
import { useFavoritos } from "../lib/favoritos";
import { linkWhatsApp, rastrear } from "../lib/leads";
import { useSeo } from "../lib/seo";
import { resumoBairros, useVitrine } from "../lib/vitrine";

function Contatos() {
  return (
    <dl className="grid gap-6 text-[16px]">
      <div>
        <dt className="text-[14px] text-ink-muted">WhatsApp</dt>
        <dd className="mt-1">
          <a href={linkWhatsApp("Olá! Vim pelo site da Patrimóvel ADM.")} target="_blank" rel="noopener" onClick={() => rastrear("whatsapp_click", { local: "contato" })} className="num inline-flex items-center gap-2 text-[20px] font-semibold hover:text-brand-700">
            <IconeWhatsApp className="h-5 w-5 text-[#1f8f4e]" /> {empresa.whatsappTexto}
          </a>
        </dd>
      </div>
      <div>
        <dt className="text-[14px] text-ink-muted">Telefone</dt>
        <dd className="mt-1">
          <a href={`tel:${empresa.telefoneLink}`} onClick={() => rastrear("phone_click", { local: "contato" })} className="num text-[20px] font-semibold hover:text-brand-700">{empresa.telefone}</a>
        </dd>
      </div>
      <div>
        <dt className="text-[14px] text-ink-muted">E-mail</dt>
        <dd className="mt-1 break-words font-medium">{empresa.email}</dd>
      </div>
      <div>
        <dt className="text-[14px] text-ink-muted">Escritório</dt>
        <dd className="mt-1 font-medium">
          {empresa.endereco}<br />{empresa.bairroCidade}
          <br />
          <a href={empresa.mapaUrl} target="_blank" rel="noopener" className="mt-1 inline-flex items-center gap-1 text-[15px] font-semibold text-brand-700 underline underline-offset-2">
            <Icone nome="pino" className="h-4 w-4" /> Abrir no mapa
          </a>
        </dd>
      </div>
      <div>
        <dt className="text-[14px] text-ink-muted">Horário</dt>
        <dd className="mt-1 font-medium">{empresa.horario}</dd>
      </div>
    </dl>
  );
}

export function Contato() {
  useSeo("Contato", "WhatsApp, telefone, e-mail e endereço da Patrimóvel Administradora, na Av. das Américas, Barra da Tijuca.");
  return (
    <div className="container-site pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Fale com a Patrimóvel ADM</h1>
      <p className="mt-3 max-w-2xl text-[17px] text-ink-soft">O jeito mais rápido é o WhatsApp. Se preferir, deixe sua mensagem e um corretor responde em horário comercial.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Contatos />
        <div className="rounded-3xl border border-sand-200 p-6 md:p-8">
          <h2 className="mb-6 text-[22px] font-bold">Mande sua mensagem</h2>
          <FormLead
            origem="contato"
            campos={["email", "negocio", "mensagem"]}
            opcoesNegocio={[
              { valor: "alugar", rotulo: "Quero alugar" },
              { valor: "comprar", rotulo: "Quero comprar" },
              { valor: "administrar", rotulo: "Tenho imóvel para alugar" },
              { valor: "vender", rotulo: "Tenho imóvel para vender" },
            ]}
            placeholderMensagem="Como podemos ajudar?"
          />
        </div>
      </div>
    </div>
  );
}

export function Sobre() {
  useSeo("Sobre a Patrimóvel Administradora", "A Patrimóvel Administradora é a empresa de locação, venda e administração de imóveis do Grupo Patrimóvel, com escritório na Barra da Tijuca.");
  const estado = useVitrine();
  const imoveis = estado.status === "ok" ? estado.vitrine.imoveis : [];
  const bairros = resumoBairros(imoveis);
  return (
    <>
      <div className="container-site pt-10 md:pt-14">
        <p className="text-[14px] font-semibold text-brand-700">Sobre nós</p>
        <h1 className="mt-3 max-w-3xl text-[32px] font-bold leading-tight md:text-[48px]">A administradora do Grupo Patrimóvel</h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed text-ink-soft">
            {/* CONFIRMAR: anos de mercado do grupo e da administradora. */}
            <p>
              A Patrimóvel Administradora faz parte do Grupo Patrimóvel, imobiliária com 46 anos de mercado no Rio de Janeiro. O grupo se dedica a lançamentos e vendas; a administradora cuida de locação, venda de imóveis prontos e administração de aluguéis.
            </p>
            <p>
              Trabalhamos com imóveis residenciais na Zona Sul e na Barra e com imóveis comerciais no Centro e em Botafogo. Nosso escritório fica na Av. das Américas, na Barra da Tijuca.
            </p>
            <p>CRECI {empresa.creci}.</p>
          </div>
          {imoveis.length > 0 && (
            <dl className="grid grid-cols-2 gap-3 self-start">
              <div className="rounded-2xl bg-sand-50 p-5">
                <dt className="text-[14px] text-ink-muted">Imóveis anunciados</dt>
                <dd className="num mt-1 text-[32px] font-bold">{imoveis.length}</dd>
              </div>
              <div className="rounded-2xl bg-sand-50 p-5">
                <dt className="text-[14px] text-ink-muted">Bairros</dt>
                <dd className="num mt-1 text-[32px] font-bold">{bairros.length}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
      <div className="container-site pt-16">
        <section className="max-w-3xl">
          <p className="text-[14px] font-semibold text-brand-700">Quem está à frente</p>
          <h2 className="mt-2 text-[24px] font-bold">Bruno Vasconcelos</h2>
          <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">
            Sócio da Patrimóvel Administradora, do Grupo Patrimóvel, com décadas de mercado imobiliário no Rio de Janeiro. Acompanha de perto a curadoria dos imóveis e o atendimento da equipe.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href="https://www.instagram.com/bruno.vasconcelos7/" target="_blank" rel="noopener" className="btn-contorno">Instagram</a>
            <a href="https://www.linkedin.com/in/brunovasconcelosrj/" target="_blank" rel="noopener" className="btn-contorno">LinkedIn</a>
          </div>
        </section>
      </div>
      <div className="container-site pt-16">
        <div className="grid gap-10 rounded-3xl border border-sand-200 p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-[24px] font-bold">Venha conversar</h2>
            <p className="mt-2 text-[16px] text-ink-soft">Atendemos pelo WhatsApp, por telefone e no escritório da Barra.</p>
          </div>
          <Contatos />
        </div>
      </div>
    </>
  );
}

export function AreaDoCliente() {
  useSeo("Área do cliente", "Acesso de proprietários e inquilinos da Patrimóvel Administradora: extrato, repasse, informe de rendimentos e 2ª via de boleto.");
  const portas = [
    {
      titulo: "Sou proprietário",
      itens: ["Extrato e data do repasse", "Informe de rendimentos para o IR", "Contratos e vistorias"],
      url: areaDoCliente.proprietario,
      mensagem: "Olá! Sou proprietário e preciso de acesso à área do cliente.",
      icone: "chave",
    },
    {
      titulo: "Sou inquilino",
      itens: ["2ª via do boleto", "Pedido de manutenção", "Renovação e saída do imóvel"],
      url: areaDoCliente.inquilino,
      mensagem: "Olá! Sou inquilino e preciso da 2ª via do boleto ou de acesso à área do cliente.",
      icone: "usuario",
    },
  ];
  return (
    <div className="container-site pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Área do cliente</h1>
      <p className="mt-3 max-w-2xl text-[17px] text-ink-soft">Escolha seu perfil para entrar. Se ainda não tem acesso, o atendimento libera pelo WhatsApp.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {portas.map((p) => (
          <section key={p.titulo} className="flex flex-col rounded-3xl border border-sand-200 p-7 md:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700"><Icone nome={p.icone} className="h-6 w-6" /></span>
            <h2 className="mt-5 text-[24px] font-bold">{p.titulo}</h2>
            <ul className="mt-4 grid gap-2.5 text-[16px] text-ink-soft">
              {p.itens.map((t) => <li key={t} className="flex items-center gap-2"><Icone nome="check" className="h-[18px] w-[18px] text-brand-600" /> {t}</li>)}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2 pt-2">
              {p.url ? (
                <a href={p.url} target="_blank" rel="noopener" className="btn-primario">Entrar <Icone nome="seta" className="h-4 w-4" /></a>
              ) : null}
              <a href={linkWhatsApp(p.mensagem)} target="_blank" rel="noopener" onClick={() => rastrear("whatsapp_click", { local: "area_cliente" })} className={p.url ? "btn-contorno" : "btn-whats"}>
                <IconeWhatsApp /> Falar com o atendimento
              </a>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function Favoritos() {
  useSeo("Imóveis salvos");
  const { lista } = useFavoritos();
  const estado = useVitrine();
  const imoveis = estado.status === "ok" ? estado.vitrine.imoveis.filter((i) => lista.includes(i.codigo)) : [];
  const sumiram = estado.status === "ok" ? lista.length - imoveis.length : 0;
  return (
    <div className="container-site pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Imóveis salvos</h1>
      <p className="mt-3 text-[17px] text-ink-soft">Ficam guardados neste navegador, sem precisar de cadastro.</p>
      <div className="mt-10">
        {estado.status === "ok" && imoveis.length === 0 ? (
          <div className="rounded-2xl border border-sand-200 p-8 text-center">
            <Icone nome="coracao" className="mx-auto h-8 w-8 text-brand-600" />
            <p className="mt-3 text-[18px] font-semibold">Você ainda não salvou nenhum imóvel.</p>
            <p className="mt-1 text-ink-soft">Toque no coração dos anúncios para guardar e comparar depois.</p>
            <div className="mt-5 flex justify-center gap-2">
              <Link to="/alugar" className="btn-escuro">Ver para alugar</Link>
              <Link to="/comprar" className="btn-contorno">Ver à venda</Link>
            </div>
          </div>
        ) : (
          <GradeImoveis lista={imoveis} carregando={estado.status === "carregando"} quantosEsqueletos={3} />
        )}
        {sumiram > 0 && <p className="mt-6 text-[14px] text-ink-muted">{sumiram} {sumiram === 1 ? "imóvel salvo saiu" : "imóveis salvos saíram"} do ar porque foram alugados ou vendidos.</p>}
      </div>
    </div>
  );
}

export function TermosDeUso() {
  useSeo("Termos de uso");
  // CONFIRMAR: texto jurídico deve ser revisado pelo cliente.
  const secoes: [string, string][] = [
    ["Sobre o site", `Este site é mantido pela ${empresa.nome}, CRECI ${empresa.creci}, com escritório na ${empresa.endereco}, ${empresa.bairroCidade}. Os imóveis mostrados podem mudar de preço ou sair do ar sem aviso, porque são alugados ou vendidos.`],
    ["Informações dos anúncios", "Valores de aluguel, venda, condomínio e IPTU são informados pelos proprietários e conferidos pela nossa equipe, mas só valem depois de confirmados na proposta ou no contrato."],
    ["Conta do anunciante", "Para cadastrar um imóvel você cria uma conta com nome, e-mail e celular. Você é responsável pelas informações e fotos enviadas e declara ter autorização do proprietário para anunciar o imóvel."],
    ["Aprovação e publicação", "Todo imóvel cadastrado passa pela aprovação da equipe antes de ser publicado. Podemos pedir ajustes, recusar anúncios com informações incompletas ou fotos de terceiros e retirar anúncios do ar."],
    ["Autorização de divulgação", "Ao enviar um imóvel, você aceita o termo de autorização de divulgação, que tem prazo de validade e pode ser renovado ou cancelado na área do anunciante."],
    ["Contato", `Dúvidas sobre estes termos: ${empresa.email} ou WhatsApp ${empresa.whatsappTexto}.`],
  ];
  return (
    <div className="container-site max-w-3xl pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Termos de uso</h1>
      <div className="mt-8 grid gap-7">
        {secoes.map(([t, p]) => (
          <section key={t}>
            <h2 className="text-[19px] font-semibold">{t}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-ink-soft">{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

export function Privacidade() {
  useSeo("Política de privacidade");
  // CONFIRMAR: texto jurídico deve ser revisado pelo cliente.
  return (
    <div className="container-site max-w-3xl pt-10 md:pt-14">
      <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Política de privacidade</h1>
      <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-ink-soft">
        <p>A {empresa.nome} usa os dados enviados nos formulários (nome, WhatsApp, e-mail e mensagem) apenas para responder o seu contato, agendar visitas e apresentar imóveis e serviços que você pediu.</p>
        <p>Não vendemos nem repassamos seus dados a terceiros fora do atendimento. Os dados ficam no nosso sistema de atendimento pelo tempo necessário para o relacionamento com você ou para cumprir obrigações legais.</p>
        <p>Com a sua autorização no aviso de cookies, o site usa ferramentas de medição para entender as visitas e melhorar os anúncios. Você pode recusar sem perder nenhuma função do site.</p>
        <p>Para pedir acesso, correção ou exclusão dos seus dados, escreva para {empresa.email} ou chame no WhatsApp {empresa.whatsappTexto}.</p>
      </div>
    </div>
  );
}
