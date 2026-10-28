import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// Endpoint PÚBLICO do site (verify_jwt = false):
//   POST /functions/v1/site-visitas?org=<org_id>
//   { visitante: uuid, imovel_codigo, evento, pagina }
// Grava o que cada visitante olhou. O visitante é um id aleatório guardado no
// navegador: anônimo até mandar um formulário, quando o site-leads liga ele ao
// contato (ligar_visitante_ao_contato). Visitante já ligado grava direto no lead.

// deno-lint-ignore no-explicit-any
type Db = any;

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGEM_PERMITIDA") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
};

const EVENTOS = ["visualizou", "favoritou", "desfavoritou", "whatsapp", "telefone"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Um visitante de verdade não abre 120 fichas por hora; acima disso é robô.
const LIMITE_POR_HORA = 120;

function json(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return json(405, { error: "Use POST" });

  const orgId = new URL(req.url).searchParams.get("org") ?? "";
  if (!UUID.test(orgId)) return json(400, { error: "Informe org na URL" });

  const bruto = await req.text();
  if (bruto.length > 2_000) return json(413, { error: "Grande demais" });
  let corpo: Record<string, unknown>;
  try { corpo = JSON.parse(bruto); } catch { return json(400, { error: "JSON inválido" }); }

  const visitante = String(corpo.visitante ?? "");
  const evento = String(corpo.evento ?? "");
  const codigo = String(corpo.imovel_codigo ?? "").trim().toUpperCase().slice(0, 40);
  const pagina = corpo.pagina ? String(corpo.pagina).slice(0, 300) : null;
  if (!UUID.test(visitante) || !EVENTOS.includes(evento) || !codigo) return json(422, { error: "Dados inválidos" });

  const db: Db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: org } = await db.from("orgs").select("site_publico").eq("id", orgId).maybeSingle();
  if (!org?.site_publico) return json(404, { error: "Org sem site" });

  try {
    const umaHora = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await db.from("imovel_visualizacoes").select("id", { count: "exact", head: true })
      .eq("org_id", orgId).eq("visitante_id", visitante).gte("created_at", umaHora);
    if ((count ?? 0) >= LIMITE_POR_HORA) return json(429, { error: "Muitas visitas" });

    const { data: imovel } = await db.from("imoveis").select("id, codigo").eq("org_id", orgId).eq("codigo", codigo).maybeSingle();
    if (!imovel) return json(404, { error: "Imóvel não encontrado" });

    const agora = new Date().toISOString();
    const { data: quem } = await db.from("site_visitantes")
      .upsert({ visitante_id: visitante, org_id: orgId, ultima_visita: agora }, { onConflict: "org_id,visitante_id" })
      .select("contact_id").single();

    const { error } = await db.from("imovel_visualizacoes").insert({
      org_id: orgId, visitante_id: visitante, contact_id: quem?.contact_id ?? null,
      imovel_id: imovel.id, imovel_codigo: imovel.codigo, evento, pagina,
    });
    if (error) throw error;
    return json(200, { ok: true });
  } catch (e) {
    console.error("[site-visitas] erro:", e);
    return json(500, { error: "Erro ao gravar" });
  }
});
