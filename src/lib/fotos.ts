import { useEffect, useState } from "react";

// PROTÓTIPO: fotos dos anúncios guardadas no IndexedDB do navegador.

const BANCO = "padm-proto";
const LOJA = "fotos";

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    const r = indexedDB.open(BANCO, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(LOJA);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error);
  });
}

async function operar<T>(modo: IDBTransactionMode, fazer: (loja: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await abrir();
  return new Promise((ok, erro) => {
    const tx = db.transaction(LOJA, modo);
    const r = fazer(tx.objectStore(LOJA));
    r.onsuccess = () => ok(r.result as T);
    r.onerror = () => erro(r.error);
  });
}

export const salvarFoto = (id: string, blob: Blob) => operar<IDBValidKey>("readwrite", (l) => l.put(blob, id));
export const lerFoto = (id: string) => operar<Blob | undefined>("readonly", (l) => l.get(id));
export const apagarFoto = (id: string) => operar<undefined>("readwrite", (l) => l.delete(id));

export const FORMATOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
export const TAMANHO_MAX_MB = 20;

/** Reduz para no máximo 1920 px no lado maior e converte em JPEG. */
export async function prepararFoto(arquivo: File): Promise<Blob> {
  if (!FORMATOS_ACEITOS.includes(arquivo.type)) throw new Error(`${arquivo.name}: envie em JPG, PNG ou WebP.`);
  if (arquivo.size > TAMANHO_MAX_MB * 1024 * 1024) throw new Error(`${arquivo.name}: o arquivo passa de ${TAMANHO_MAX_MB} MB.`);
  const bitmap = await createImageBitmap(arquivo);
  const escala = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * escala);
  canvas.height = Math.round(bitmap.height * escala);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((ok, erro) => canvas.toBlob((b) => (b ? ok(b) : erro(new Error("Não foi possível ler a foto."))), "image/jpeg", 0.84));
}

/** URL temporária para mostrar uma foto guardada. */
export function useFotoUrl(id: string | undefined) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) return;
    let ativo = true;
    let criada: string | null = null;
    lerFoto(id)
      .then((b) => {
        if (b && ativo) {
          criada = URL.createObjectURL(b);
          setUrl(criada);
        }
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
      if (criada) URL.revokeObjectURL(criada);
    };
  }, [id]);
  return url;
}
