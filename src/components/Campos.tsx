import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export function Rotulo({ htmlFor, children, obrigatorio, opcional }: { htmlFor?: string; children: ReactNode; obrigatorio?: boolean; opcional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="rotulo">
      {children}
      {obrigatorio && <span className="text-brand-600"> *</span>}
      {opcional && <span className="font-normal text-ink-muted"> (opcional)</span>}
    </label>
  );
}

type TextoProps = {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  obrigatorio?: boolean;
  opcional?: boolean;
  erro?: string | null;
  dica?: string;
  sufixo?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export function CampoTexto({ rotulo, valor, aoMudar, obrigatorio, opcional, erro, dica, sufixo, className = "", ...resto }: TextoProps) {
  const id = useId();
  return (
    <div className={className}>
      <Rotulo htmlFor={id} obrigatorio={obrigatorio} opcional={opcional}>{rotulo}</Rotulo>
      <div className="relative">
        <input
          id={id}
          value={valor}
          onChange={(e) => aoMudar(e.target.value)}
          aria-invalid={!!erro}
          aria-describedby={erro || dica ? `${id}-ajuda` : undefined}
          className={`campo ${sufixo ? "pr-12" : ""} ${erro ? "border-brand-600" : ""}`}
          {...resto}
        />
        {sufixo && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-ink-muted">{sufixo}</span>}
      </div>
      {(erro || dica) && (
        <p id={`${id}-ajuda`} className={`mt-1.5 text-[13px] ${erro ? "text-brand-700" : "text-ink-muted"}`}>{erro || dica}</p>
      )}
    </div>
  );
}

export function CampoNumero(props: Omit<TextoProps, "inputMode">) {
  return <CampoTexto inputMode="decimal" {...props} aoMudar={(v) => props.aoMudar(v.replace(/[^\d,]/g, ""))} />;
}

export function CampoSelect({
  rotulo,
  valor,
  aoMudar,
  opcoes,
  obrigatorio,
  opcional,
  erro,
  vazio = "Selecione",
  className = "",
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly string[];
  obrigatorio?: boolean;
  opcional?: boolean;
  erro?: string | null;
  vazio?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <Rotulo htmlFor={id} obrigatorio={obrigatorio} opcional={opcional}>{rotulo}</Rotulo>
      <select id={id} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-invalid={!!erro} className={`campo ${erro ? "border-brand-600" : ""} ${valor ? "" : "text-ink-muted"}`}>
        <option value="">{vazio}</option>
        {opcoes.map((o) => <option key={o} value={o} className="text-ink">{o}</option>)}
      </select>
      {erro && <p className="mt-1.5 text-[13px] text-brand-700">{erro}</p>}
    </div>
  );
}

export function Escolhas({
  rotulo,
  valor,
  aoMudar,
  opcoes,
  obrigatorio,
  erro,
  colunas = "grid-cols-2 sm:grid-cols-3",
}: {
  rotulo: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: readonly string[];
  obrigatorio?: boolean;
  erro?: string | null;
  colunas?: string;
}) {
  return (
    <fieldset>
      <legend className="rotulo">{rotulo}{obrigatorio && <span className="text-brand-600"> *</span>}</legend>
      <div className={`grid gap-2 ${colunas}`}>
        {opcoes.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={valor === o}
            onClick={() => aoMudar(valor === o ? "" : o)}
            className={`rounded-xl border px-3 py-2.5 text-left text-[14.5px] transition-colors ${valor === o ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-sand-300 hover:border-ink/30"}`}
          >
            {o}
          </button>
        ))}
      </div>
      {erro && <p className="mt-1.5 text-[13px] text-brand-700">{erro}</p>}
    </fieldset>
  );
}

export function Contador({ rotulo, valor, aoMudar, obrigatorio, erro, max = 20 }: { rotulo: string; valor: string; aoMudar: (v: string) => void; obrigatorio?: boolean; erro?: string | null; max?: number }) {
  const n = valor === "" ? null : Number(valor);
  const id = useId();
  return (
    <div>
      <Rotulo htmlFor={id} obrigatorio={obrigatorio}>{rotulo}</Rotulo>
      <div className={`flex items-center rounded-xl border ${erro ? "border-brand-600" : "border-sand-300"}`}>
        <button type="button" aria-label={`Menos ${rotulo.toLowerCase()}`} onClick={() => aoMudar(n && n > 0 ? String(n - 1) : "0")} className="grid h-12 w-12 place-items-center text-[20px] text-ink-soft hover:text-ink">−</button>
        <input
          id={id}
          inputMode="numeric"
          value={valor}
          onChange={(e) => aoMudar(e.target.value.replace(/\D/g, "").slice(0, 3))}
          className="num h-12 w-full min-w-0 bg-transparent text-center text-[16px] font-semibold focus:outline-none"
          placeholder="0"
        />
        <button type="button" aria-label={`Mais ${rotulo.toLowerCase()}`} onClick={() => aoMudar(String(Math.min(max, (n ?? 0) + 1)))} className="grid h-12 w-12 place-items-center text-[20px] text-ink-soft hover:text-ink">+</button>
      </div>
      {erro && <p className="mt-1.5 text-[13px] text-brand-700">{erro}</p>}
    </div>
  );
}

const moeda = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Valor em reais digitado como no app do banco: os dígitos entram pela direita. */
export function CampoDinheiro({ rotulo, valor, aoMudar, obrigatorio, opcional, erro, dica }: { rotulo: string; valor: number | null; aoMudar: (v: number | null) => void; obrigatorio?: boolean; opcional?: boolean; erro?: string | null; dica?: string }) {
  const id = useId();
  return (
    <div>
      <Rotulo htmlFor={id} obrigatorio={obrigatorio} opcional={opcional}>{rotulo}</Rotulo>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-muted">R$</span>
        <input
          id={id}
          inputMode="numeric"
          value={valor ? moeda.format(valor) : ""}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 13);
            aoMudar(d ? Number(d) / 100 : null);
          }}
          placeholder="0,00"
          aria-invalid={!!erro}
          className={`campo num pl-11 ${erro ? "border-brand-600" : ""}`}
        />
      </div>
      {(erro || dica) && <p className={`mt-1.5 text-[13px] ${erro ? "text-brand-700" : "text-ink-muted"}`}>{erro || dica}</p>}
    </div>
  );
}

export function Marcar({ marcado, aoMudar, children }: { marcado: boolean; aoMudar: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px]">
      <input type="checkbox" checked={marcado} onChange={(e) => aoMudar(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-brand-600" />
      <span>{children}</span>
    </label>
  );
}
