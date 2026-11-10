// Feed de imoveis do CRM para o Canal Pro (Grupo OLX: ZAP, Viva Real e OLX).
// O feed e montado no CRM (edge imoveis-feed-vrsync), mas o Supabase devolve
// toda resposta de funcao como text/plain. Este endereco repassa o mesmo XML
// com Content-Type application/xml, que e o que o Canal Pro espera.
//   GET /api/feed-canal-pro?token=<feed_token>   (token: CRM > Imoveis > Portais)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://tdjvryuublqixpzqnzvs.supabase.co";
const ORG_ID = process.env.VITE_SITE_ORG_ID || "284ccccb-2ea3-464b-a89f-8185b732b38f";

export async function GET(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  if (!token) return new Response("Informe o token", { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });

  const origem = new URL(`${SUPABASE_URL}/functions/v1/imoveis-feed-vrsync`);
  origem.searchParams.set("org", ORG_ID);
  origem.searchParams.set("token", token);
  const portal = url.searchParams.get("portal");
  if (portal) origem.searchParams.set("portal", portal);

  const r = await fetch(origem, { headers: { Accept: "application/xml" } });
  const corpo = await r.text();
  return new Response(corpo, {
    status: r.status,
    headers: r.ok
      ? { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" }
      : { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
