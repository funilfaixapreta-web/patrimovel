import { useEffect, useState, type FormEvent } from "react";
import { CampoSelect, CampoTexto } from "../../components/Campos";
import { Icone } from "../../components/Icone";
import { ESTADO_CIVIL, UFS } from "../../content-anuncio";
import { salvarPerfil, useConta, type Usuario } from "../../lib/conta";
import { buscarCep, cpfValido, mascaraCep, mascaraCpf } from "../../lib/endereco";
import { mascaraTelefone, telefoneValido } from "../../lib/leads";
import { useSeo } from "../../lib/seo";

export default function Perfil() {
  useSeo("Meu perfil");
  const usuario = useConta();
  const [f, setF] = useState<Usuario | null>(usuario ?? null);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [buscandoCep, setBuscandoCep] = useState(false);

  useEffect(() => {
    if (usuario && !f) setF(usuario);
  }, [usuario, f]);
  if (!f) return null;

  const mudar = (campo: keyof Usuario) => (v: string) => {
    setSalvo(false);
    setF((x) => (x ? { ...x, [campo]: v } : x));
  };

  async function aoCep(v: string) {
    const cep = mascaraCep(v);
    mudar("cep")(cep);
    if (cep.length === 9) {
      setBuscandoCep(true);
      try {
        const e = await buscarCep(cep);
        if (e) setF((x) => (x ? { ...x, rua: e.logradouro || x.rua, bairro: e.bairro || x.bairro, cidade: e.cidade || x.cidade, uf: e.uf || x.uf } : x));
        else setErros((er) => ({ ...er, cep: "CEP não encontrado. Preencha o endereço à mão." }));
      } catch {
        /* sem internet: segue preenchimento manual */
      } finally {
        setBuscandoCep(false);
      }
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!f) return;
    const er: Record<string, string> = {};
    if (f.nome.trim().split(/\s+/).length < 2) er.nome = "Escreva nome e sobrenome.";
    if (!telefoneValido(f.telefone)) er.telefone = "Informe o celular com DDD.";
    if (f.cpf && !cpfValido(f.cpf)) er.cpf = "CPF inválido. Confira os números.";
    if (f.nascimento && new Date(f.nascimento) > new Date()) er.nascimento = "A data não pode ser no futuro.";
    setErros(er);
    if (Object.keys(er).length) return;
    setErroGeral(null);
    setSalvando(true);
    try {
      setF(await salvarPerfil(f));
      setSalvo(true);
    } catch (err) {
      setErroGeral((err as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} noValidate className="grid gap-8">
      <div>
        <h1 className="text-[28px] font-bold md:text-[34px]">Meu perfil</h1>
        <p className="mt-1 text-[15px] text-ink-soft">Usamos estes dados no termo de autorização e no contrato do seu imóvel.</p>
      </div>

      <section className="grid gap-4 rounded-2xl border border-sand-200 p-5 md:p-6">
        <h2 className="text-[17px] font-semibold">Dados cadastrais</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <CampoTexto rotulo="Nome completo" valor={f.nome} aoMudar={mudar("nome")} autoComplete="name" erro={erros.nome} className="md:col-span-2" />
          <CampoTexto rotulo="E-mail" valor={f.email} aoMudar={() => undefined} readOnly dica="Para trocar o e-mail, fale com o atendimento." />
          <CampoTexto rotulo="Celular" valor={f.telefone} aoMudar={(v) => mudar("telefone")(mascaraTelefone(v))} inputMode="tel" autoComplete="tel" erro={erros.telefone} />
          <CampoTexto rotulo="CPF" valor={f.cpf} aoMudar={(v) => mudar("cpf")(mascaraCpf(v))} inputMode="numeric" placeholder="000.000.000-00" opcional erro={erros.cpf} />
          <CampoTexto rotulo="RG" valor={f.rg} aoMudar={mudar("rg")} opcional />
          <CampoSelect rotulo="Estado civil" valor={f.estadoCivil} aoMudar={mudar("estadoCivil")} opcoes={ESTADO_CIVIL} opcional />
          <CampoTexto rotulo="Data de nascimento" valor={f.nascimento} aoMudar={mudar("nascimento")} type="date" max={new Date().toISOString().slice(0, 10)} opcional erro={erros.nascimento} />
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-sand-200 p-5 md:p-6">
        <h2 className="text-[17px] font-semibold">Endereço</h2>
        <div className="grid gap-4 md:grid-cols-6">
          <CampoTexto rotulo="CEP" valor={f.cep} aoMudar={aoCep} inputMode="numeric" placeholder="00000-000" erro={erros.cep} dica={buscandoCep ? "Buscando endereço..." : "O endereço é preenchido pelo CEP."} className="md:col-span-2" />
          <CampoTexto rotulo="Rua" valor={f.rua} aoMudar={mudar("rua")} autoComplete="address-line1" className="md:col-span-4" />
          <CampoTexto rotulo="Número" valor={f.numero} aoMudar={mudar("numero")} className="md:col-span-2" />
          <CampoTexto rotulo="Complemento" valor={f.complemento} aoMudar={mudar("complemento")} opcional className="md:col-span-4" />
          <CampoTexto rotulo="Bairro" valor={f.bairro} aoMudar={mudar("bairro")} className="md:col-span-2" />
          <CampoTexto rotulo="Cidade" valor={f.cidade} aoMudar={mudar("cidade")} className="md:col-span-3" />
          <CampoSelect rotulo="UF" valor={f.uf} aoMudar={mudar("uf")} opcoes={UFS} vazio="--" className="md:col-span-1" />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={salvando} className="btn-primario px-8 disabled:opacity-60">{salvando ? "Salvando..." : "Salvar alterações"}</button>
        {erroGeral && <p className="text-[15px] text-brand-700" role="alert">{erroGeral}</p>}
        {salvo && <p className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1d7a46]" role="status"><Icone nome="check" className="h-5 w-5" /> Dados salvos</p>}
      </div>
    </form>
  );
}
