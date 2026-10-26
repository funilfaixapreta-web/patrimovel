import { supabase } from "./supabase";

// Guarda o endereço que caiu na página não encontrada (tabela
// site_nao_encontradas, só INSERT para o navegador) para corrigir os links
// que chegam de fora. Falha calada: o visitante não pode ver erro por isso.
const jaRegistrados = new Set<string>();

export function registrarNaoEncontrada(endereco: string) {
  if (jaRegistrados.has(endereco)) return;
  jaRegistrados.add(endereco);
  void supabase
    .from("site_nao_encontradas")
    .insert({ caminho: endereco.slice(0, 500), referencia: (document.referrer || "").slice(0, 500) || null })
    .then(({ error }) => error && console.warn("[404]", error.message));
}
