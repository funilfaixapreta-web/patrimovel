import { supabase } from "./supabase";
import type { FotoAnuncio } from "./conta";

// Fotos dos anúncios no bucket público site-anuncios do Supabase, em
// <usuario>/<anuncio>/<foto>.jpg. A URL pública vai para o imóvel do CRM e
// para a vitrine depois da aprovação.

const BUCKET = "site-anuncios";

export async function salvarFoto(usuarioId: string, anuncioId: string, id: string, nome: string, blob: Blob): Promise<FotoAnuncio> {
  const caminho = `${usuarioId}/${anuncioId}/${id}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`${nome}: não foi possível enviar a foto. Tente de novo.`);
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
  return { id, nome, caminho, url: data.publicUrl };
}

export async function apagarFotos(fotos: FotoAnuncio[]) {
  const caminhos = fotos.map((f) => f.caminho).filter(Boolean);
  if (caminhos.length) await supabase.storage.from(BUCKET).remove(caminhos);
}

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

/** URL para mostrar a foto. Cadastros antigos do protótipo não têm URL. */
export function useFotoUrl(foto: FotoAnuncio | undefined) {
  return foto?.url ?? null;
}
