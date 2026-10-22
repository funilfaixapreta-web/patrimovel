import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AvisoPrototipo, CampoTexto } from "../../components/Campos";
import { criarConta, entrar, porEmail, useConta } from "../../lib/conta";
import { mascaraTelefone, telefoneValido } from "../../lib/leads";
import { useSeo } from "../../lib/seo";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export default function Entrar() {
  useSeo("Entrar ou criar conta");
  const [params] = useSearchParams();
  const volta = params.get("volta") || "/conta/imoveis";
  const navegar = useNavigate();
  const usuario = useConta();
  const [aba, setAba] = useState<"entrar" | "criar">(params.get("aba") === "criar" ? "criar" : "entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);

  if (usuario) return <Navigate to={volta} replace />;

  function enviar(e: FormEvent) {
    e.preventDefault();
    setAviso(null);
    const er: Record<string, string> = {};
    if (!emailOk(email)) er.email = "Confira o e-mail.";
    if (senha.length < 6) er.senha = "A senha precisa ter pelo menos 6 caracteres.";
    if (aba === "criar") {
      if (nome.trim().split(/\s+/).length < 2) er.nome = "Escreva nome e sobrenome.";
      if (!telefoneValido(telefone)) er.telefone = "Informe o celular com DDD.";
      if (!aceite) er.aceite = "Para criar a conta, aceite os termos de uso.";
      if (!er.email && porEmail(email)) er.email = "Já existe uma conta com este e-mail. Entre por aqui.";
    }
    setErros(er);
    if (Object.keys(er).length) return;
    if (aba === "entrar") {
      const u = entrar(email);
      if (!u) {
        setErros({ email: "Não encontramos uma conta com este e-mail." });
        setAviso("Ainda não tem conta? Toque em Criar conta.");
        return;
      }
    } else {
      criarConta({ nome, email, telefone });
    }
    navegar(volta, { replace: true });
  }

  return (
    <div className="container-site grid gap-10 pt-10 md:pt-14 lg:grid-cols-[1fr_440px] lg:items-start">
      <div className="max-w-xl lg:pt-6">
        <h1 className="text-[32px] font-bold leading-tight md:text-[44px]">Anuncie e acompanhe seu imóvel</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
          Com a conta você cadastra o imóvel em etapas, envia as fotos, acompanha a aprovação do anúncio e renova a autorização de divulgação quando vencer.
        </p>
        <ul className="mt-6 grid gap-2.5 text-[15.5px]">
          {["Salva o cadastro e continua depois", "Mostra o status de cada anúncio", "Guarda os imóveis que você curtiu"].map((t) => (
            <li key={t} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-600" />{t}</li>
          ))}
        </ul>
        <div className="mt-8 rounded-2xl bg-sand-50 p-5 text-[15px] text-ink-soft">
          Já tem imóvel administrado ou contrato de aluguel com a gente? O extrato, o repasse e a 2ª via do boleto ficam na <Link to="/area-do-cliente" className="font-semibold text-brand-700 underline">área do cliente</Link>.
        </div>
      </div>

      <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card md:p-8">
        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-sand-100 p-1" role="tablist">
          {([["entrar", "Entrar"], ["criar", "Criar conta"]] as const).map(([v, r]) => (
            <button key={v} role="tab" aria-selected={aba === v} onClick={() => { setAba(v); setErros({}); setAviso(null); }} className={`rounded-lg py-2.5 text-[15px] font-semibold ${aba === v ? "bg-white shadow-sm" : "text-ink-muted"}`}>
              {r}
            </button>
          ))}
        </div>
        <form onSubmit={enviar} noValidate className="grid gap-4">
          {aba === "criar" && <CampoTexto rotulo="Nome completo" valor={nome} aoMudar={setNome} autoComplete="name" erro={erros.nome} />}
          <CampoTexto rotulo="E-mail" valor={email} aoMudar={setEmail} type="email" inputMode="email" autoComplete="email" erro={erros.email} />
          {aba === "criar" && <CampoTexto rotulo="Celular com DDD" valor={telefone} aoMudar={(v) => setTelefone(mascaraTelefone(v))} inputMode="tel" autoComplete="tel" placeholder="(21) 99999-9999" erro={erros.telefone} />}
          <CampoTexto rotulo="Senha" valor={senha} aoMudar={setSenha} type="password" autoComplete={aba === "entrar" ? "current-password" : "new-password"} erro={erros.senha} />
          {aba === "criar" && (
            <div>
              <label className="flex items-start gap-3 text-[14px] text-ink-soft">
                <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
                <span>Li e aceito os <Link to="/termos-de-uso" className="underline">termos de uso</Link> e a <Link to="/privacidade" className="underline">política de privacidade</Link>.</span>
              </label>
              {erros.aceite && <p className="mt-1.5 text-[13px] text-brand-700">{erros.aceite}</p>}
            </div>
          )}
          {aviso && <p className="rounded-xl bg-brand-50 px-4 py-3 text-[14px] text-brand-800" role="alert">{aviso}</p>}
          <button type="submit" className="btn-primario w-full py-3.5 text-[16px]">{aba === "entrar" ? "Entrar" : "Criar conta"}</button>
          {aba === "entrar" && (
            <button type="button" onClick={() => setAviso("No site final, enviaremos um link para o seu e-mail criar uma senha nova.")} className="text-[14px] font-semibold text-ink-soft underline underline-offset-2">
              Esqueci minha senha
            </button>
          )}
        </form>
        <AvisoPrototipo className="mt-6" />
      </div>
    </div>
  );
}
