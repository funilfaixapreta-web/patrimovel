import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { porCodigo, rotuloTipo, slug, type Imovel, type Negocio, type ResumoBairro } from "../lib/vitrine";
import { Icone } from "./Icone";

const TIPOS = ["apartamento", "cobertura / penthouse", "casa", "flat", "sala", "andar corporativo", "loja"];

export function BuscaHero({ bairros, imoveis }: { bairros: ResumoBairro[]; imoveis: Imovel[] }) {
  const navegar = useNavigate();
  const [negocio, setNegocio] = useState<Negocio>("alugar");
  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState("");

  function buscar(e: FormEvent) {
    e.preventDefault();
    const t = termo.trim();
    // Código do imóvel vai direto para a ficha.
    if (/^[a-z]{2}\d{3,5}/i.test(t)) {
      const achado = porCodigo(imoveis, t) ?? imoveis.find((i) => i.codigo.startsWith(t.toUpperCase()));
      if (achado) return navegar(`/imovel/${achado.codigo}`);
    }
    const bairro = bairros.find((b) => b.slug === slug(t));
    const p = new URLSearchParams();
    if (tipo) p.set("tipo", tipo);
    if (t && !bairro) p.set("q", t);
    const base = `/${negocio}${bairro ? `/${bairro.slug}` : ""}`;
    navegar(p.toString() ? `${base}?${p}` : base);
  }

  return (
    <form onSubmit={buscar} className="rounded-2xl bg-white p-3 shadow-float md:p-4" role="search" aria-label="Buscar imóveis">
      <div className="mb-3 inline-flex rounded-full bg-sand-100 p-1" role="radiogroup" aria-label="Tipo de negócio">
        {(["alugar", "comprar"] as const).map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={negocio === n}
            onClick={() => setNegocio(n)}
            className={`rounded-full px-5 py-2 text-[15px] font-semibold transition-colors ${negocio === n ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
          >
            {n === "alugar" ? "Alugar" : "Comprar"}
          </button>
        ))}
      </div>
      <div className="grid gap-2 md:grid-cols-[1.6fr_1fr_auto]">
        <div>
          <label htmlFor="busca-termo" className="sr-only">Bairro ou código do imóvel</label>
          <input
            id="busca-termo"
            list="busca-bairros"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            className="campo h-14 text-[16px]"
            placeholder="Bairro ou código do imóvel"
            autoComplete="off"
          />
          <datalist id="busca-bairros">
            {bairros.map((b) => <option key={b.slug} value={b.nome} />)}
          </datalist>
        </div>
        <div>
          <label htmlFor="busca-tipo" className="sr-only">Tipo de imóvel</label>
          <select id="busca-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} className="campo h-14 text-[16px]">
            <option value="">Todos os tipos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{rotuloTipo(t)}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primario h-14 px-8 text-[16px]">
          <Icone nome="busca" /> Buscar
        </button>
      </div>
    </form>
  );
}
