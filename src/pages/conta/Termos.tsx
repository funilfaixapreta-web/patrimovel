import { useState } from "react";
import { Link } from "react-router-dom";
import { Icone } from "../../components/Icone";
import { validadeTermoDias } from "../../config";
import { TEXTO_TERMO } from "../../content-anuncio";
import { renovarTermo, situacaoTermo, useAnuncios, useConta, type Anuncio, type SituacaoTermo } from "../../lib/conta";
import { useSeo } from "../../lib/seo";
import { tituloAnuncio } from "./MeusImoveis";

const SITUACAO: Record<SituacaoTermo, { rotulo: (d: number | null) => string; classe: string }> = {
  pendente: { rotulo: () => "Aceite pendente", classe: "bg-brand-50 text-brand-800" },
  vencido: { rotulo: (d) => `Venceu há ${Math.abs(d ?? 0)} ${Math.abs(d ?? 0) === 1 ? "dia" : "dias"}`, classe: "bg-brand-50 text-brand-800" },
  vencendo: { rotulo: (d) => `Vence em ${d} ${d === 1 ? "dia" : "dias"}`, classe: "bg-[#fdf0dc] text-[#8a4b00]" },
  vigente: { rotulo: () => "Vigente", classe: "bg-[#e3f4ea] text-[#1d7a46]" },
};

const data = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");

function TextoTermo({ aoFechar, aoAceitar, titulo }: { aoFechar: () => void; aoAceitar?: () => void; titulo: string }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Termo de autorização">
      <button className="absolute inset-0 bg-ink/40" aria-label="Fechar" onClick={aoFechar} />
      <div className="relative max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-float md:p-8">
        <p className="text-[13px] font-semibold text-brand-700">Termo de autorização de divulgação</p>
        <h2 className="mt-1 text-[22px] font-bold">{titulo}</h2>
        <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-ink-soft">
          {TEXTO_TERMO.map((p) => <p key={p}>{p}</p>)}
          <p>Validade: {validadeTermoDias} dias a partir do aceite.</p>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={aoFechar} className="btn-contorno">Fechar</button>
          {aoAceitar && <button type="button" onClick={aoAceitar} className="btn-primario">Aceitar e renovar</button>}
        </div>
      </div>
    </div>
  );
}

function Linha({ a }: { a: Anuncio }) {
  const [aberto, setAberto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const { situacao, dias } = situacaoTermo(a);
  async function renovar() {
    setErro(null);
    setOcupado(true);
    try {
      await renovarTermo(a);
      setAberto(false);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }
  const s = SITUACAO[situacao];
  const precisa = situacao !== "vigente";
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-sand-200 p-5 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${s.classe}`}>{s.rotulo(dias)}</span>
          <span className="num text-[13px] text-ink-muted">{a.codigo}</span>
        </div>
        <p className="mt-1.5 text-[16.5px] font-semibold">{tituloAnuncio(a)}</p>
        {a.termo && (
          <p className="num mt-0.5 text-[14px] text-ink-muted">Aceito em {data(a.termo.aceitoEm)} · válido até {data(a.termo.validoAte)} · versão {a.termo.versao}</p>
        )}
        {erro && <p className="mt-2 text-[13.5px] text-brand-700" role="alert">{erro}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setAberto(true)} className="btn-contorno px-4 py-2 text-[14px]"><Icone nome="documento" className="h-4 w-4" /> Ler termo</button>
        {precisa && (
          <button type="button" disabled={ocupado} onClick={renovar} className="btn-primario px-4 py-2 text-[14px] disabled:opacity-50">{situacao === "pendente" ? "Aceitar" : "Renovar"}</button>
        )}
      </div>
      {aberto && <TextoTermo titulo={tituloAnuncio(a)} aoFechar={() => setAberto(false)} aoAceitar={precisa ? renovar : undefined} />}
    </li>
  );
}

export default function Termos() {
  useSeo("Aceite de termos e renovação");
  const usuario = useConta();
  const anuncios = useAnuncios(usuario?.id).filter((a) => a.status !== "rascunho");
  const [aba, setAba] = useState<"renovacao" | "todos">("renovacao");
  const pendentes = anuncios.filter((a) => situacaoTermo(a).situacao !== "vigente");
  const lista = aba === "renovacao" ? pendentes : anuncios;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-[28px] font-bold md:text-[34px]">Aceite de termos e renovação</h1>
        <p className="mt-1 max-w-2xl text-[15px] text-ink-soft">
          Cada imóvel precisa de uma autorização de divulgação válida. Ela vale {validadeTermoDias} dias e avisamos 30 dias antes de vencer.
        </p>
      </div>
      <div className="inline-flex self-start rounded-full bg-sand-100 p-1">
        {([["renovacao", `Precisam de ação (${pendentes.length})`], ["todos", `Todos (${anuncios.length})`]] as const).map(([v, r]) => (
          <button key={v} type="button" aria-pressed={aba === v} onClick={() => setAba(v)} className={`num rounded-full px-4 py-2 text-[14px] font-semibold ${aba === v ? "bg-white shadow-sm" : "text-ink-muted"}`}>{r}</button>
        ))}
      </div>
      {lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand-300 p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e3f4ea] text-[#1d7a46]"><Icone nome="check" className="h-6 w-6" /></span>
          <p className="mt-4 text-[18px] font-semibold">{anuncios.length ? "Nenhum termo precisa de aceite ou renovação agora." : "Você ainda não enviou nenhum imóvel."}</p>
          {!anuncios.length && <Link to="/anunciar" className="btn-primario mt-6">Anunciar imóvel</Link>}
        </div>
      ) : (
        <ul className="grid gap-3">{lista.map((a) => <Linha key={a.id} a={a} />)}</ul>
      )}
    </div>
  );
}
