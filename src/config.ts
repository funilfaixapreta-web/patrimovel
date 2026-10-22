// Dados de contato e integrações. Tudo que muda sem mexer em layout fica aqui.
// Itens marcados com CONFIRMAR precisam do ok da Patrimóvel ADM antes de ir ao ar.

export const empresa = {
  nome: "Patrimóvel Administradora",
  nomeCurto: "Patrimóvel ADM",
  creci: "0005083",
  endereco: "Av. das Américas, 500, bloco 16",
  bairroCidade: "Barra da Tijuca, Rio de Janeiro, RJ",
  mapaUrl: "https://www.google.com/maps/search/?api=1&query=Av.+das+Am%C3%A9ricas%2C+500%2C+Barra+da+Tijuca%2C+Rio+de+Janeiro",
  telefone: "(21) 3152-5985",
  telefoneLink: "+552131525985",
  // CONFIRMAR: o site atual usa este WhatsApp; o cadastro do CRM tem +55 21 92367-3097.
  whatsappTexto: "(21) 96456-3479",
  whatsapp: "5521964563479",
  email: "leadsadministradora@patrimoveladm.com.br",
  horario: "Segunda a sexta, das 9h às 18h. Sábado, das 9h às 14h.",
  redes: [
    { nome: "Instagram", url: "https://www.instagram.com/patrimoveladm" },
    { nome: "Facebook", url: "https://www.facebook.com/patrimoveladm" },
    { nome: "LinkedIn", url: "https://www.linkedin.com/company/patrimoveladm" },
  ],
};

// CONFIRMAR: endereço do portal da Superlógica para cada perfil. Null mostra o atendimento no lugar.
export const areaDoCliente = {
  proprietario: null as string | null,
  inquilino: null as string | null,
};

// CONFIRMAR: taxa de administração (ex.: 0.08 para 8%). Null esconde o simulador da página de administração.
export const taxaAdministracao: number | null = null;

// CONFIRMAR: por quantos dias vale o aceite do termo de divulgação antes de pedir renovação.
export const validadeTermoDias = 180;

const env = import.meta.env;
export const vitrineUrl: string =
  env.VITE_VITRINE_URL ||
  "https://tdjvryuublqixpzqnzvs.supabase.co/functions/v1/imoveis-vitrine?org=284ccccb-2ea3-464b-a89f-8185b732b38f";
export const usarExemplo: boolean = env.VITE_VITRINE_FALLBACK === "true" || (env.DEV && env.VITE_VITRINE_FALLBACK !== "false");
export const leadsUrl: string = env.VITE_LEADS_URL || "";
export const gtmId: string = env.VITE_GTM_ID || "";
