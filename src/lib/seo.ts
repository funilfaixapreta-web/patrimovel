import { useEffect } from "react";

const PADRAO_DESC =
  "Imóveis para alugar e comprar na Barra, Zona Sul e Centro do Rio e administração de imóveis do Grupo Patrimóvel. CRECI 0005083.";

function meta(nome: string, conteudo: string, atributo: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${nome}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(atributo, nome);
    document.head.appendChild(el);
  }
  el.content = conteudo;
}

/** Título e descrição únicos por página. */
export function useSeo(titulo: string, descricao = PADRAO_DESC, imagem?: string) {
  useEffect(() => {
    const completo = titulo.includes("Patrimóvel") ? titulo : `${titulo} | Patrimóvel ADM`;
    document.title = completo;
    meta("description", descricao);
    meta("og:title", completo, "property");
    meta("og:description", descricao, "property");
    if (imagem) meta("og:image", imagem, "property");
    let canon = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `https://www.patrimoveladm.com.br${window.location.pathname}`;
  }, [titulo, descricao, imagem]);
}

export function useJsonLd(id: string, dados: object | null) {
  useEffect(() => {
    if (!dados) return;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    el.text = JSON.stringify(dados);
    document.head.appendChild(el);
    return () => el.remove();
  }, [id, dados]);
}
