import { empresa, leadsUrl } from "../config";
import { visitanteId } from "./visitas";

export type OrigemLead =
  | "ficha_contato"
  | "ficha_visita"
  | "administracao"
  | "vender"
  | "contato"
  | "home_proprietario"
  | "anuncio";

export interface Lead {
  origem: OrigemLead;
  nome: string;
  telefone: string;
  email?: string;
  mensagem?: string;
  imovel_codigo?: string;
  negocio?: "alugar" | "comprar" | "administrar" | "vender";
  bairro?: string;
  data_visita?: string;
  periodo_visita?: string;
  pagina: string;
}

export function rastrear(evento: string, dados: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: evento, ...dados });
}

export function linkWhatsApp(mensagem: string, numero = empresa.whatsapp) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagemImovel(codigo: string, titulo: string) {
  return `Olá! Vi no site o imóvel ${codigo} (${titulo}) e quero mais informações.`;
}

function mensagemDoLead(l: Lead): string {
  const linhas = [`Olá! Meu nome é ${l.nome}.`];
  if (l.origem === "ficha_visita" && l.imovel_codigo) {
    linhas.push(`Quero agendar uma visita ao imóvel ${l.imovel_codigo}${l.data_visita ? ` no dia ${l.data_visita}` : ""}${l.periodo_visita ? `, de ${l.periodo_visita}` : ""}.`);
  } else if (l.imovel_codigo) {
    linhas.push(`Tenho interesse no imóvel ${l.imovel_codigo}.`);
  } else if (l.negocio === "administrar") {
    linhas.push(`Tenho um imóvel${l.bairro ? ` em ${l.bairro}` : ""} e quero conversar sobre a administração.`);
  } else if (l.negocio === "vender") {
    linhas.push(`Quero avaliar meu imóvel${l.bairro ? ` em ${l.bairro}` : ""} para vender.`);
  }
  if (l.mensagem) linhas.push(l.mensagem);
  return linhas.join(" ");
}

/** POST no site-leads do CRM (supabase/functions/site-leads). */
export async function enviarLeadAoCrm(l: Lead) {
  const r = await fetch(leadsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...l, visitante: visitanteId(), enviado_em: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`Falha ao enviar (${r.status})`);
}

/**
 * Envia o formulário para o CRM. Com VITE_LEADS_URL=whatsapp, abre o WhatsApp
 * da administradora com a mensagem pronta no lugar.
 */
export async function enviarLead(l: Lead): Promise<{ via: "api" | "whatsapp" }> {
  rastrear("generate_lead", { lead_origem: l.origem, imovel_codigo: l.imovel_codigo, negocio: l.negocio });
  if (leadsUrl) {
    await enviarLeadAoCrm(l);
    return { via: "api" };
  }
  window.open(linkWhatsApp(mensagemDoLead(l)), "_blank", "noopener");
  return { via: "whatsapp" };
}

export function telefoneValido(t: string) {
  const d = t.replace(/\D/g, "");
  return d.length >= 10 && d.length <= 13;
}

export function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
