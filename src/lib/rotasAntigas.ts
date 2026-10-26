// Endereços de listagem do site antigo da Arbo, que o Google ainda tem:
//   /imoveis/{local}                        → guia do bairro (ou aluguel, se for só a cidade)
//   /imoveis/para-alugar/{local}            → /alugar[/bairro]
//   /imoveis/a-venda/{tipo}/{local}         → /comprar[/bairro]?tipo=
// {local} é "bairro-cidade-uf" (barra-da-tijuca-rio-de-janeiro-rj) ou só "cidade-uf".

import { TIPOS_COMERCIAIS, TIPOS_RESIDENCIAIS, slug } from "./vitrine";

const CIDADES = ["rio-de-janeiro", "petropolis"];
const NEGOCIO: Record<string, "alugar" | "comprar"> = { "para-alugar": "alugar", "a-venda": "comprar" };

/** "barra-da-tijuca-rio-de-janeiro-rj" → "barra-da-tijuca"; só a cidade → null. */
export function bairroDoLocal(local: string): string | null {
  const semUf = local.replace(/-[a-z]{2}$/, "");
  if (CIDADES.includes(semUf)) return null;
  const cidade = CIDADES.find((c) => semUf.endsWith(`-${c}`));
  return (cidade ? semUf.slice(0, -(cidade.length + 1)) : semUf) || null;
}

/** "cobertura-penthouse" → "cobertura / penthouse" (o tipo como a vitrine grava). */
function tipoDoSlug(s: string): string | null {
  return [...TIPOS_RESIDENCIAIS, ...TIPOS_COMERCIAIS].find((t) => slug(t) === s) ?? null;
}

/** Recebe o que vem depois de /imoveis/ e devolve o endereço novo equivalente. */
export function destinoDaListaAntiga(resto: string): string {
  const partes = resto.toLowerCase().split("/").filter(Boolean);
  const negocio = NEGOCIO[partes[0] ?? ""];
  if (negocio) partes.shift();
  const local = partes.length && /-[a-z]{2}$/.test(partes[partes.length - 1]) ? partes.pop()! : null;
  const tipo = partes.length ? tipoDoSlug(partes[0]) : null;
  const bairro = local ? bairroDoLocal(local) : null;

  if (!negocio) return bairro ? `/bairros/${bairro}` : "/alugar";
  return `/${negocio}${bairro ? `/${bairro}` : ""}${tipo ? `?tipo=${encodeURIComponent(tipo)}` : ""}`;
}

const CODIGO_IMOVEL = /\b([a-z]{2,3}\d{3,5}(?:_[a-z]+)?)\b/i;
const INICIO = new Set(["/index.html", "/index.htm", "/index.php", "/home", "/inicio", "/início"]);

/**
 * Último recurso antes da página não encontrada, para links que chegam de fora
 * (WhatsApp, Google, portais) num formato que o site não tem rota: qualquer
 * endereço com código de imóvel abre a ficha; variações da página inicial vão
 * para a home. null quando não dá para adivinhar.
 */
export function destinoDeEnderecoDesconhecido(caminho: string): string | null {
  let p = caminho.toLowerCase().replace(/\/+$/, "");
  try {
    p = decodeURIComponent(p);
  } catch {
    /* endereço com % quebrado: segue como veio */
  }
  // Sem letra nem número (ex.: "/**", copiado das Redirect URLs do Supabase): é a home.
  if (!/[a-z0-9]/.test(p) || INICIO.has(p)) return "/";
  const codigo = p.match(CODIGO_IMOVEL)?.[1];
  return codigo ? `/imovel/${codigo.toUpperCase()}` : null;
}
