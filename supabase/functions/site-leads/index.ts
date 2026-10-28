import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { lerLeadSite, mesclarObservacoes, resumoDoLead, ROTULO_ORIGEM, tipoNegocio, variantesDoTelefone, type LeadSite } from "./lead.ts";

// Endpoint PÚBLICO dos formulários do site (verify_jwt = false):
//   POST /functions/v1/site-leads?org=<org_id>
// Só aceita org com orgs.site_publico = true.
//
// Lead NOVO entra no funil padrão da org em "new", com source = 'site'.
// Lead que JÁ existe (mesmo celular, com ou sem o 9º dígito, ou mesmo e-mail)
// não muda de etapa: ganha o imóvel e o registro do formulário.
// Depois: roleta (se ligada para "new"), senão o corretor do imóvel; sem
// ninguém, o aviso vai para os gestores da org.

// deno-lint-ignore no-explicit-any
type Db = any;

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_ORIGEM_PERMITIDA") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
};

function json(status: number, corpo: unknown) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

async function avisar(db: Db, orgId: string, userIds: string[], contactId: string, nome: string, lead: LeadSite) {
  if (!userIds.length) return;
  try {
    const { data: notifs, error } = await db
      .from("notifications")
      .insert(userIds.map((userId) => ({
        org_id: orgId,
        user_id: userId,
        type: "lead_roleta",
        title: `Novo lead do site · ${ROTULO_ORIGEM[lead.origem]}`,
        body: lead.codigoImovel ? `${nome} · imóvel ${lead.codigoImovel}` : nome,
        data: { contact_id: contactId, url: "/corretor" },
      })))
      .select("id");
    if (error) return console.error("[site-leads] aviso:", error.message);
    for (const n of notifs ?? []) {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
        body: JSON.stringify({ notification_id: n.id }),
      }).catch((e) => console.error("[site-leads] push:", e));
    }
  } catch (e) {
    console.error("[site-leads] falha ao avisar:", e);
  }
}

async function gestores(db: Db, orgId: string): Promise<string[]> {
  const { data } = await db.from("users").select("id, can_manage_corretores").eq("org_id", orgId);
  const todos = (data ?? []) as { id: string; can_manage_corretores: boolean | null }[];
  const g = todos.filter((u) => u.can_manage_corretores);
  return (g.length ? g : todos).map((u) => u.id);
}

/** Roleta ligada para "new" gira; senão, o corretor responsável do imóvel recebe. */
async function entregar(db: Db, orgId: string, contactId: string, lead: LeadSite): Promise<string | null> {
  const { data: cfg } = await db.from("lead_roulette_settings").select("is_enabled, trigger_stages").eq("org_id", orgId).maybeSingle();
  if (cfg?.is_enabled === true && Array.isArray(cfg.trigger_stages) && cfg.trigger_stages.includes("new")) {
    const { data: giro, error } = await db.rpc("spin_lead_roulette", { p_contact_id: contactId, p_origin: "roulette" });
    if (error) console.error("[site-leads] roleta:", error.message);
    if (giro?.ok === true && giro.corretor_id) return String(giro.corretor_id);
  }
  if (!lead.codigoImovel) return null;
  const { data: imovel } = await db.from("imoveis").select("corretor_id").eq("org_id", orgId).eq("codigo", lead.codigoImovel).maybeSingle();
  if (!imovel?.corretor_id) return null;
  const { error } = await db.from("contacts").update({ assigned_to: imovel.corretor_id, assigned_at: new Date().toISOString() })
    .eq("id", contactId).is("assigned_to", null);
  if (error) { console.error("[site-leads] responsável:", error.message); return null; }
  return String(imovel.corretor_id);
}

/** O que o visitante olhou no site (site-visitas) passa a aparecer no lead. */
async function ligarVisitante(db: Db, orgId: string, lead: LeadSite, contactId: string) {
  if (!lead.visitante) return;
  const { error } = await db.rpc("ligar_visitante_ao_contato", { p_org_id: orgId, p_visitante: lead.visitante, p_contact_id: contactId });
  if (error) console.error("[site-leads] visitante:", error.message);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method === "GET") return json(200, { ok: true, servico: "site-leads" });
  if (req.method !== "POST") return json(405, { error: "Use POST" });

  const url = new URL(req.url);
  const orgId = url.searchParams.get("org") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(orgId)) return json(400, { error: "Informe org na URL" });

  const bruto = await req.text();
  if (bruto.length > 10_000) return json(413, { error: "Formulário grande demais" });
  let corpo: unknown;
  try { corpo = JSON.parse(bruto); } catch { return json(400, { error: "JSON inválido" }); }
  const lido = lerLeadSite(corpo);
  if ("erro" in lido) return json(422, { error: lido.erro });
  const lead = lido;

  const db: Db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: org } = await db.from("orgs").select("id, site_publico").eq("id", orgId).maybeSingle();
  if (!org?.site_publico) return json(404, { error: "Org sem site" });

  const agora = new Date().toISOString();
  try {
    let existente: { id: string; name: string | null; email: string | null; observations: string | null; traffic_source: string | null } | null = null;
    if (lead.telefone) {
      const { data } = await db.from("contacts").select("id, name, email, observations, traffic_source, phone_e164")
        .eq("org_id", orgId).in("phone_e164", variantesDoTelefone(lead.telefone));
      existente = (data ?? []).find((c: { phone_e164: string }) => c.phone_e164 === lead.telefone) ?? data?.[0] ?? null;
    }
    if (!existente && lead.email) {
      const { data } = await db.from("contacts").select("id, name, email, observations, traffic_source")
        .eq("org_id", orgId).ilike("email", lead.email).limit(1);
      existente = data?.[0] ?? null;
    }

    if (existente) {
      const { error } = await db.from("contacts").update({
        observations: mesclarObservacoes(existente.observations, lead, agora),
        ...(existente.name ? {} : lead.nome ? { name: lead.nome } : {}),
        ...(existente.email ? {} : lead.email ? { email: lead.email } : {}),
        ...(existente.traffic_source ? {} : { traffic_source: "Site" }),
      }).eq("id", existente.id);
      if (error) throw error;
      await ligarVisitante(db, orgId, lead, existente.id);
      return json(200, { success: true, deduped: true });
    }

    const { data: pipe } = await db.from("kanban_pipes").select("id")
      .eq("org_id", orgId).order("is_default", { ascending: false }).limit(1).maybeSingle();
    const nome = lead.nome || "Lead do site";
    const { data: novo, error } = await db.from("contacts").insert({
      org_id: orgId,
      name: nome,
      email: lead.email,
      phone_e164: lead.telefone,
      pipe_id: pipe?.id ?? null,
      pipeline_stage: "new",
      source: "site",
      traffic_source: "Site",
      tipo_negocio: tipoNegocio(lead),
      origem_plataforma: "site",
      origem_formulario: ROTULO_ORIGEM[lead.origem],
      origem_url: lead.pagina,
      origem_titulo: resumoDoLead(lead).slice(0, 300),
      origem_bruta: corpo,
      origem_capturada_em: agora,
      observations: mesclarObservacoes(null, lead, agora),
      locale: "pt-BR",
    }).select("id").single();
    if (error) throw error;

    await ligarVisitante(db, orgId, lead, novo.id);
    const corretorId = await entregar(db, orgId, novo.id, lead);
    await avisar(db, orgId, corretorId ? [corretorId] : await gestores(db, orgId), novo.id, nome, lead);

    // O id do contato não volta para o navegador: o endpoint é público.
    return json(200, { success: true });
  } catch (e) {
    console.error("[site-leads] erro:", e);
    return json(500, { error: "Erro ao gravar o lead" });
  }
});
