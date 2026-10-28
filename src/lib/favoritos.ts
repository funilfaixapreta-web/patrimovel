import { useCallback, useEffect, useState } from "react";
import { registrarVisita } from "./visitas";

const CHAVE = "padm:favoritos";
const EVENTO = "padm:favoritos";

function ler(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function gravar(lista: string[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista));
  } catch {
    /* navegador sem armazenamento: favoritos valem só nesta visita */
  }
  window.dispatchEvent(new Event(EVENTO));
}

/** Favoritos sem login, guardados no navegador. */
export function useFavoritos() {
  const [lista, setLista] = useState<string[]>(ler);
  useEffect(() => {
    const atualizar = () => setLista(ler());
    window.addEventListener(EVENTO, atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener(EVENTO, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);
  const alternar = useCallback((codigo: string) => {
    const atual = ler();
    const tinha = atual.includes(codigo);
    const nova = tinha ? atual.filter((c) => c !== codigo) : [...atual, codigo];
    registrarVisita(codigo, tinha ? "desfavoritou" : "favoritou");
    setLista(nova);
    gravar(nova);
  }, []);
  return { lista, alternar, tem: (codigo: string) => lista.includes(codigo) };
}
