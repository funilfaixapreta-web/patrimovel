import { useEffect, useState } from "react";
import { usarExemplo, vitrineUrl } from "../config";

// Formato do endpoint imoveis-vitrine do CRM (ver supabase/functions/imoveis-vitrine/vitrine.ts).
export type Finalidade = "venda" | "locacao" | "venda_locacao";

export interface Imovel {
  codigo: string;
  titulo: string | null;
  finalidade: Finalidade;
  tipo: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  valor_venda: number | null;
  valor_locacao: number | null;
  condominio: number | null;
  iptu: number | null;
  quartos: number | null;
  suites: number | null;
  banheiros: number | null;
  vagas: number | null;
  area_util_m2: number | null;
  area_total_m2: number | null;
  caracteristicas: string[];
  descricao: string | null;
  fotos: string[];
  videos: string[];
  tour_virtual_url: string | null;
  updated_at: string;
}

export interface Vitrine {
  imobiliaria: { nome: string; email: string | null; telefone: string | null; whatsapp: string | null };
  total: number;
  imoveis: Imovel[];
  exemplo?: boolean;
}

let cache: Promise<Vitrine> | null = null;

async function baixar(url: string): Promise<Vitrine> {
  const r = await fetch(url, { headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`Vitrine respondeu ${r.status}`);
  return (await r.json()) as Vitrine;
}

export function carregarVitrine(): Promise<Vitrine> {
  if (!cache) {
    cache = (async () => {
      try {
        const v = await baixar(vitrineUrl);
        if (v.total > 0 || !usarExemplo) return v;
      } catch (e) {
        if (!usarExemplo) throw e;
      }
      const exemplo = await baixar("/data/vitrine-exemplo.json");
      return { ...exemplo, exemplo: true };
    })();
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

type Estado = { status: "carregando" } | { status: "erro" } | { status: "ok"; vitrine: Vitrine };

export function useVitrine(): Estado {
  const [estado, setEstado] = useState<Estado>({ status: "carregando" });
  useEffect(() => {
    let vivo = true;
    carregarVitrine()
      .then((vitrine) => vivo && setEstado({ status: "ok", vitrine }))
      .catch(() => vivo && setEstado({ status: "erro" }));
    return () => {
      vivo = false;
    };
  }, []);
  return estado;
}

// ---------- Regras de negócio ----------

export type Negocio = "alugar" | "comprar";

export function serveParaAlugar(i: Imovel) {
  return (i.finalidade === "locacao" || i.finalidade === "venda_locacao") && !!i.valor_locacao;
}
export function serveParaComprar(i: Imovel) {
  return (i.finalidade === "venda" || i.finalidade === "venda_locacao") && !!i.valor_venda;
}
export function doNegocio(lista: Imovel[], negocio: Negocio) {
  return lista.filter(negocio === "alugar" ? serveParaAlugar : serveParaComprar);
}

/** Aluguel + condomínio + IPTU mensal. Só faz sentido para locação. */
export function custoMensal(i: Imovel): number | null {
  if (!i.valor_locacao) return null;
  return i.valor_locacao + (i.condominio ?? 0) + (i.iptu ?? 0);
}

export const TIPOS_RESIDENCIAIS = ["apartamento", "cobertura / penthouse", "casa", "flat"];
export const TIPOS_COMERCIAIS = ["sala", "andar corporativo", "loja", "conjunto comercial", "prédio"];

export function ehComercial(i: Imovel) {
  return TIPOS_COMERCIAIS.includes((i.tipo ?? "").toLowerCase());
}

const ROTULO_TIPO: Record<string, [string, string]> = {
  apartamento: ["Apartamento", "Apartamentos"],
  "cobertura / penthouse": ["Cobertura", "Coberturas"],
  casa: ["Casa", "Casas"],
  flat: ["Flat", "Flats"],
  sala: ["Sala comercial", "Salas comerciais"],
  "andar corporativo": ["Andar corporativo", "Andares corporativos"],
  loja: ["Loja", "Lojas"],
  "conjunto comercial": ["Conjunto comercial", "Conjuntos comerciais"],
  prédio: ["Prédio", "Prédios"],
};

export function rotuloTipo(tipo: string | null, plural = false): string {
  const t = (tipo ?? "").toLowerCase();
  const r = ROTULO_TIPO[t];
  if (r) return plural ? r[1] : r[0];
  if (!t) return plural ? "Imóveis" : "Imóvel";
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return plural ? cap + "s" : cap;
}

/** Título curto e consistente para card e ficha (os títulos do CRM variam muito). */
export function tituloImovel(i: Imovel): string {
  const tipo = rotuloTipo(i.tipo);
  const partes = [tipo];
  if (i.quartos && !ehComercial(i)) partes.push(`com ${i.quartos} ${i.quartos === 1 ? "quarto" : "quartos"}`);
  else if (i.area_util_m2) partes.push(`de ${formatarArea(i.area_util_m2)}`);
  return `${partes.join(" ")}${i.bairro ? ` em ${i.bairro}` : ""}`;
}

export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function porCodigo(lista: Imovel[], codigo: string) {
  const c = codigo.toUpperCase();
  return lista.find((i) => i.codigo === c);
}

export interface ResumoBairro {
  nome: string;
  slug: string;
  total: number;
  alugar: number;
  comprar: number;
  foto: string | null;
  cidade: string | null;
}

export function resumoBairros(lista: Imovel[]): ResumoBairro[] {
  const mapa = new Map<string, ResumoBairro>();
  for (const i of lista) {
    if (!i.bairro) continue;
    const s = slug(i.bairro);
    const r = mapa.get(s) ?? { nome: i.bairro, slug: s, total: 0, alugar: 0, comprar: 0, foto: null, cidade: i.cidade };
    r.total++;
    if (serveParaAlugar(i)) r.alugar++;
    if (serveParaComprar(i)) r.comprar++;
    if (!r.foto && i.fotos[0] && !ehComercial(i)) r.foto = i.fotos[0];
    mapa.set(s, r);
  }
  for (const r of mapa.values()) {
    if (!r.foto) r.foto = lista.find((i) => i.bairro && slug(i.bairro) === r.slug && i.fotos[0])?.fotos[0] ?? null;
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome));
}

export function similares(lista: Imovel[], base: Imovel, quantos = 4): Imovel[] {
  const mesmoNegocio = (i: Imovel) =>
    (serveParaAlugar(base) && serveParaAlugar(i)) || (serveParaComprar(base) && serveParaComprar(i));
  const candidatos = lista.filter((i) => i.codigo !== base.codigo && mesmoNegocio(i));
  const pontos = (i: Imovel) =>
    (i.bairro && i.bairro === base.bairro ? 4 : 0) +
    (i.tipo === base.tipo ? 2 : 0) +
    (ehComercial(i) === ehComercial(base) ? 1 : 0);
  return candidatos
    .map((i) => ({ i, p: pontos(i) }))
    .filter((x) => x.p >= 3)
    .sort((a, b) => b.p - a.p)
    .slice(0, quantos)
    .map((x) => x.i);
}

// ---------- Formatação ----------

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

export function formatarPreco(v: number | null | undefined, centavos = false): string {
  if (!v) return "Consulte";
  return (centavos ? brlCentavos : brl).format(v);
}

export function formatarArea(v: number | null | undefined): string {
  if (!v) return "";
  return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v)} m²`;
}

/** ID do YouTube a partir das URLs mais comuns. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
