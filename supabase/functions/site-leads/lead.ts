// Leitura do formulário do site (src/lib/leads.ts, tipo Lead). Módulo puro
// para poder ser testado sem banco: tudo que vem do navegador é cortado e
// normalizado aqui antes de chegar ao CRM.

export type OrigemLead =
  | "ficha_contato"
  | "ficha_visita"
  | "administracao"
  | "vender"
  | "contato"
  | "home_proprietario"
  | "anuncio";

export interface LeadSite {
  origem: OrigemLead;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  mensagem: string | null;
  codigoImovel: string | null;
  negocio: "alugar" | "comprar" | "administrar" | "vender" | null;
  bairro: string | null;
  dataVisita: string | null;
  periodoVisita: string | null;
  pagina: string | null;
}

const ORIGENS: OrigemLead[] = ["ficha_contato", "ficha_visita", "administracao", "vender", "contato", "home_proprietario", "anuncio"];
const NEGOCIOS = ["alugar", "comprar", "administrar", "vender"] as const;

/** Rótulo de cada formulário no card e no histórico do lead. */
export const ROTULO_ORIGEM: Record<OrigemLead, string> = {
  ficha_contato: "Ficha do imóvel",
  ficha_visita: "Agendar visita",
  administracao: "Página de administração",
  vender: "Página de venda",
  contato: "Fale conosco",
  home_proprietario: "Home (proprietário)",
  anuncio: "Anúncio cadastrado pelo proprietário",
};

function texto(v: unknown, max: number): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  return s ? s.slice(0, max) : null;
}

/** Somente dígitos com DDI 55; null se não parecer telefone brasileiro. */
export function telefoneE164(v: unknown): string | null {
  const digitos = String(v ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (!digitos) return null;
  const comDdi = digitos.startsWith("55") && digitos.length >= 12 ? digitos : `55${digitos}`;
  return comDdi.length === 12 || comDdi.length === 13 ? `+${comDdi}` : null;
}

/** Variantes do celular com e sem o 9º dígito, para achar o contato que já existe. */
export function variantesDoTelefone(e164: string): string[] {
  const d = e164.replace(/\D/g, "");
  const out = new Set([`+${d}`]);
  if (d.startsWith("55") && d.length >= 12) {
    const ddd = d.slice(2, 4);
    const resto = d.slice(4);
    if (resto.length === 9 && resto.startsWith("9")) out.add(`+55${ddd}${resto.slice(1)}`);
    else if (resto.length === 8) out.add(`+55${ddd}9${resto}`);
  }
  return [...out];
}

export function lerLeadSite(corpo: unknown): LeadSite | { erro: string } {
  const o = (corpo && typeof corpo === "object" ? corpo : {}) as Record<string, unknown>;
  const origem = String(o.origem ?? "") as OrigemLead;
  if (!ORIGENS.includes(origem)) return { erro: "origem inválida" };
  const email = texto(o.email, 120)?.toLowerCase() ?? null;
  const negocio = NEGOCIOS.find((n) => n === o.negocio) ?? null;
  const lead: LeadSite = {
    origem,
    nome: texto(o.nome, 120),
    telefone: telefoneE164(o.telefone),
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null,
    mensagem: texto(o.mensagem, 2000),
    codigoImovel: texto(o.imovel_codigo, 40)?.toUpperCase() ?? null,
    negocio,
    bairro: texto(o.bairro, 80),
    dataVisita: texto(o.data_visita, 20),
    periodoVisita: texto(o.periodo_visita, 20),
    pagina: texto(o.pagina, 300),
  };
  if (!lead.telefone && !lead.email) return { erro: "Informe telefone ou e-mail" };
  return lead;
}

/** alugar/comprar/vender para o tipo_negocio do CRM (venda, locacao). */
export function tipoNegocio(l: LeadSite): string | null {
  if (l.negocio === "alugar") return "locacao";
  if (l.negocio === "comprar" || l.negocio === "vender") return "venda";
  return null;
}

/** Texto que a equipe lê no card. */
export function resumoDoLead(l: LeadSite): string {
  const partes = [`${ROTULO_ORIGEM[l.origem]} (site)`];
  if (l.codigoImovel) partes.push(`Imóvel ${l.codigoImovel}`);
  if (l.negocio) partes.push(`Quer ${l.negocio}`);
  if (l.bairro) partes.push(`Bairro: ${l.bairro}`);
  if (l.dataVisita) partes.push(`Visita: ${l.dataVisita}${l.periodoVisita ? `, ${l.periodoVisita}` : ""}`);
  if (l.mensagem) partes.push(`Mensagem: ${l.mensagem}`);
  return partes.join(" · ");
}

/** Observações do contato: JSON {ai_fields, ai_internal, notes} ou texto antigo. */
export function lerObservacoes(obs: string | null): { ai_fields: Record<string, unknown>; ai_internal: Record<string, unknown>; notes?: string } {
  if (!obs) return { ai_fields: {}, ai_internal: {} };
  try {
    const p = JSON.parse(obs);
    if (p && typeof p === "object") return { ...p, ai_fields: p.ai_fields ?? {}, ai_internal: p.ai_internal ?? {} };
  } catch { /* texto livre antigo */ }
  return { ai_fields: {}, ai_internal: {}, notes: obs };
}

/**
 * Junta o formulário nas observações sem apagar o que a agente já gravou:
 * imovel_origem só é preenchido se estiver vazio, o imóvel novo entra em
 * imoveis_apresentados e o histórico do site fica em ai_internal.site.
 */
export function mesclarObservacoes(obs: string | null, l: LeadSite, quando: string): string {
  const atual = lerObservacoes(obs);
  const campos = { ...atual.ai_fields };
  if (l.codigoImovel) {
    if (!campos.imovel_origem) campos.imovel_origem = l.codigoImovel;
    const vistos = String(campos.imoveis_apresentados ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!vistos.includes(l.codigoImovel)) vistos.push(l.codigoImovel);
    campos.imoveis_apresentados = vistos.join(", ");
  }
  const finalidade = tipoNegocio(l);
  if (finalidade && !campos.finalidade) campos.finalidade = finalidade;
  if (l.bairro && !campos.bairro) campos.bairro = l.bairro;
  if (l.email && !campos.email) campos.email = l.email;
  if (l.dataVisita) campos.visita_pedida = `${l.dataVisita}${l.periodoVisita ? `, ${l.periodoVisita}` : ""}`;

  const historico = Array.isArray(atual.ai_internal.site) ? (atual.ai_internal.site as unknown[]) : [];
  const registro = { em: quando, formulario: l.origem, pagina: l.pagina, imovel: l.codigoImovel, resumo: resumoDoLead(l) };
  return JSON.stringify({
    ...atual,
    notes: atual.notes ?? resumoDoLead(l),
    ai_fields: campos,
    ai_internal: { ...atual.ai_internal, site: [...historico, registro].slice(-20) },
  });
}
