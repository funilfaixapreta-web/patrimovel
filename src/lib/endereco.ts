export interface EnderecoCep {
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export function mascaraCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/** Endereço pelo CEP (ViaCEP, serviço público e gratuito). */
export async function buscarCep(cep: string): Promise<EnderecoCep | null> {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return null;
  const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
  if (!r.ok) return null;
  const j = await r.json();
  if (j.erro) return null;
  return { logradouro: j.logradouro ?? "", bairro: j.bairro ?? "", cidade: j.localidade ?? "", uf: j.uf ?? "" };
}

/** Coordenadas aproximadas do endereço (OpenStreetMap Nominatim). Use com moderação: 1 consulta por ação. */
export async function localizar(partes: string[]): Promise<{ lat: number; lng: number } | null> {
  const q = partes.filter(Boolean).join(", ");
  if (!q) return null;
  const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`, {
    headers: { "Accept-Language": "pt-BR" },
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { lat: string; lon: string }[];
  return j[0] ? { lat: Number(j[0].lat), lng: Number(j[0].lon) } : null;
}

export function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function cpfValido(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  const dig = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(d[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return dig(9) === Number(d[9]) && dig(10) === Number(d[10]);
}
