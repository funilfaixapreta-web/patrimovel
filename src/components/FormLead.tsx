import { useId, useState, type FormEvent, type ReactNode } from "react";
import { enviarLead, mascaraTelefone, telefoneValido, type Lead } from "../lib/leads";
import { Icone } from "./Icone";

type Campo = "email" | "mensagem" | "bairro" | "negocio" | "visita";

interface Props {
  origem: Lead["origem"];
  campos?: Campo[];
  imovelCodigo?: string;
  negocioPadrao?: Lead["negocio"];
  opcoesNegocio?: { valor: NonNullable<Lead["negocio"]>; rotulo: string }[];
  botao?: string;
  rodape?: ReactNode;
  placeholderMensagem?: string;
  escuro?: boolean;
}

function amanha() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function FormLead({
  origem,
  campos = ["email"],
  imovelCodigo,
  negocioPadrao,
  opcoesNegocio,
  botao = "Enviar",
  rodape,
  placeholderMensagem = "Conte o que você procura (opcional)",
}: Props) {
  const id = useId();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [bairro, setBairro] = useState("");
  const [negocio, setNegocio] = useState<Lead["negocio"]>(negocioPadrao ?? opcoesNegocio?.[0]?.valor);
  const [data, setData] = useState("");
  const [periodo, setPeriodo] = useState("manhã");
  const [erro, setErro] = useState<string | null>(null);
  const [estado, setEstado] = useState<"livre" | "enviando" | "api" | "whatsapp">("livre");

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    if (nome.trim().length < 2) return setErro("Escreva seu nome.");
    if (!telefoneValido(telefone)) return setErro("Confira o WhatsApp com DDD, por exemplo (21) 99999-9999.");
    if (campos.includes("visita") && !data) return setErro("Escolha o dia da visita.");
    setEstado("enviando");
    try {
      const r = await enviarLead({
        origem,
        nome: nome.trim(),
        telefone,
        email: email.trim() || undefined,
        mensagem: mensagem.trim() || undefined,
        bairro: bairro.trim() || undefined,
        negocio,
        imovel_codigo: imovelCodigo,
        data_visita: data ? data.split("-").reverse().join("/") : undefined,
        periodo_visita: campos.includes("visita") ? periodo : undefined,
        pagina: window.location.pathname,
      });
      setEstado(r.via);
    } catch {
      setEstado("livre");
      setErro("Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp.");
    }
  }

  if (estado === "api" || estado === "whatsapp") {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-6 text-ink" role="status">
        <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-[#e3f4ea] text-[#1d7a46]">
          <Icone nome="check" className="h-6 w-6" />
        </div>
        <p className="text-[18px] font-semibold">{estado === "api" ? "Recebemos seu contato." : "Sua mensagem está pronta no WhatsApp."}</p>
        <p className="mt-1 text-[15px] text-ink-soft">
          {estado === "api"
            ? "Um corretor da Patrimóvel ADM vai falar com você pelo WhatsApp em horário comercial."
            : "Se o WhatsApp não abriu, toque no botão verde da página para falar com a gente."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="grid gap-4">
      {opcoesNegocio && (
        <fieldset>
          <legend className="rotulo">O que você precisa</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {opcoesNegocio.map((o) => (
              <label key={o.valor} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-[15px] ${negocio === o.valor ? "border-brand-600 bg-brand-50 text-brand-800" : "border-sand-300 bg-white"}`}>
                <input type="radio" name={`${id}-negocio`} value={o.valor} checked={negocio === o.valor} onChange={() => setNegocio(o.valor)} className="accent-brand-600" />
                {o.rotulo}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div>
        <label htmlFor={`${id}-nome`} className="rotulo">Nome</label>
        <input id={`${id}-nome`} className="campo" autoComplete="name" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
      </div>
      <div className={campos.includes("email") ? "grid gap-4 sm:grid-cols-2" : ""}>
        <div>
          <label htmlFor={`${id}-tel`} className="rotulo">WhatsApp com DDD</label>
          <input id={`${id}-tel`} className="campo num" inputMode="tel" autoComplete="tel" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="(21) 99999-9999" />
        </div>
        {campos.includes("email") && (
          <div>
            <label htmlFor={`${id}-email`} className="rotulo">E-mail <span className="font-normal text-ink-muted">(opcional)</span></label>
            <input id={`${id}-email`} className="campo" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          </div>
        )}
      </div>
      {campos.includes("bairro") && (
        <div>
          <label htmlFor={`${id}-bairro`} className="rotulo">Bairro do imóvel</label>
          <input id={`${id}-bairro`} className="campo" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Ex.: Barra da Tijuca" />
        </div>
      )}
      {campos.includes("visita") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-data`} className="rotulo">Dia da visita</label>
            <input id={`${id}-data`} className="campo num" type="date" min={amanha()} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div>
            <label htmlFor={`${id}-periodo`} className="rotulo">Período</label>
            <select id={`${id}-periodo`} className="campo" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="fim de tarde">Fim de tarde</option>
            </select>
          </div>
        </div>
      )}
      {campos.includes("mensagem") && (
        <div>
          <label htmlFor={`${id}-msg`} className="rotulo">Mensagem</label>
          <textarea id={`${id}-msg`} className="campo min-h-[96px] resize-y" value={mensagem} onChange={(e) => setMensagem(e.target.value)} placeholder={placeholderMensagem} />
        </div>
      )}
      {erro && <p className="rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand-800" role="alert">{erro}</p>}
      <button type="submit" className="btn-primario w-full py-3.5 text-[16px]" disabled={estado === "enviando"}>
        {estado === "enviando" ? "Enviando..." : botao}
      </button>
      {rodape ?? (
        <p className="text-[12.5px] leading-relaxed text-ink-muted">
          Usamos seus dados só para responder este contato. Veja a <a href="/privacidade" className="underline">política de privacidade</a>.
        </p>
      )}
    </form>
  );
}
