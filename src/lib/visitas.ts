import { visitasUrl } from "../config";

// O que cada visitante olhou vai para o CRM (supabase/functions/site-visitas).
// O visitante é um id aleatório deste navegador: não diz quem é a pessoa. Só
// quando ela manda um formulário (que leva o mesmo id) o corretor passa a ver,
// no lead, os imóveis que ela olhou antes e depois.

const CHAVE = "padm:visitante";
const VISTOS = "padm:vistos";
// A mesma ficha aberta de novo em menos de 30 minutos não conta outra visita.
const JANELA_MS = 30 * 60 * 1000;

export type EventoVisita = "visualizou" | "favoritou" | "desfavoritou" | "whatsapp" | "telefone";

export function visitanteId(): string | null {
  if (recusou()) return null;
  try {
    let id = localStorage.getItem(CHAVE);
    if (!id && typeof crypto !== "undefined" && "randomUUID" in crypto) {
      id = crypto.randomUUID();
      localStorage.setItem(CHAVE, id);
    }
    return id;
  } catch {
    return null; // navegador sem armazenamento: não registra
  }
}

function jaContou(codigo: string): boolean {
  try {
    const vistos = JSON.parse(sessionStorage.getItem(VISTOS) ?? "{}") as Record<string, number>;
    const agora = Date.now();
    if (vistos[codigo] && agora - vistos[codigo] < JANELA_MS) return true;
    vistos[codigo] = agora;
    sessionStorage.setItem(VISTOS, JSON.stringify(vistos));
  } catch { /* sem sessionStorage conta sempre */ }
  return false;
}

/** Quem recusou no aviso de cookies (Layout, padm:cookies) não é registrado. */
function recusou(): boolean {
  try {
    return localStorage.getItem("padm:cookies") === "recusado";
  } catch {
    return true;
  }
}

export function registrarVisita(codigo: string, evento: EventoVisita) {
  if (recusou()) return;
  const visitante = visitanteId();
  if (!visitasUrl || !visitante || !codigo) return;
  if (evento === "visualizou" && jaContou(codigo)) return;
  fetch(visitasUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitante, imovel_codigo: codigo, evento, pagina: window.location.pathname }),
    keepalive: true,
  }).catch(() => { /* registro de visita nunca atrapalha a navegação */ });
}
