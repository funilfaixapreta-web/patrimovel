import { useEffect, useState } from "react";
import { validadeTermoDias } from "../config";

// PROTÓTIPO: conta, anúncios e termos guardados só neste navegador (localStorage).
// Quando existir backend, troque as funções deste arquivo por chamadas à API
// mantendo as mesmas assinaturas; as telas não precisam mudar.

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  rg: string;
  cpf: string;
  estadoCivil: string;
  nascimento: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  criadoEm: string;
}

export type StatusAnuncio = "rascunho" | "em_aprovacao" | "ativo" | "pausado" | "recusado";
export type NegocioAnuncio = "venda" | "locacao" | "venda_locacao";

export interface FotoAnuncio {
  id: string;
  nome: string;
}

export interface Termo {
  versao: string;
  aceitoEm: string;
  validoAte: string;
}

export interface Anuncio {
  id: string;
  codigo: string;
  usuarioId: string;
  status: StatusAnuncio;
  etapa: number;
  criadoEm: string;
  atualizadoEm: string;
  enviadoEm?: string;
  // 1
  finalidade: string;
  // 2
  tipo: string;
  fase: string;
  previsaoConclusao: string;
  anoConstrucao: string;
  localChaves: string;
  ocupacao: string;
  padrao: string;
  // 3
  condominio: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bloco: string;
  andar: string;
  bairro: string;
  cidade: string;
  uf: string;
  lat: number | null;
  lng: number | null;
  ocultarEndereco: boolean;
  // 4
  dormitorios: string;
  suites: string;
  banheiros: string;
  lavabos: string;
  areaUtil: string;
  areaTotal: string;
  areaPrivativa: string;
  areaComum: string;
  vagas: string;
  salas: string;
  mobiliado: string;
  face: string;
  posicaoSolar: string;
  // 5
  comodidades: string[];
  // 6
  fotos: FotoAnuncio[];
  // 7
  negocio: NegocioAnuncio | "";
  valorVenda: number | null;
  valorLocacao: number | null;
  valorCondominio: number | null;
  valorIptu: number | null;
  iptuPeriodo: "mensal" | "anual";
  aceitaFinanciamento: boolean;
  aceitaPermuta: boolean;
  // 8
  titulo: string;
  descricao: string;
  termo?: Termo;
}

const K_USUARIOS = "padm:proto:usuarios";
const K_SESSAO = "padm:proto:sessao";
const K_ANUNCIOS = "padm:proto:anuncios";
const EVENTO = "padm:proto";
export const VERSAO_TERMO = "2026.1";

function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento cheio ou bloqueado */
  }
  window.dispatchEvent(new Event(EVENTO));
}

export function novoId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------- Conta ----------

function usuarios(): Record<string, Usuario> {
  return ler(K_USUARIOS, {});
}

export function usuarioAtual(): Usuario | null {
  const id = ler<string | null>(K_SESSAO, null);
  return id ? usuarios()[id] ?? null : null;
}

export function porEmail(email: string): Usuario | null {
  const e = email.trim().toLowerCase();
  return Object.values(usuarios()).find((u) => u.email === e) ?? null;
}

export function criarConta(dados: { nome: string; email: string; telefone: string }): Usuario {
  const u: Usuario = {
    id: novoId(),
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    telefone: dados.telefone,
    rg: "",
    cpf: "",
    estadoCivil: "",
    nascimento: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    criadoEm: new Date().toISOString(),
  };
  gravar(K_USUARIOS, { ...usuarios(), [u.id]: u });
  gravar(K_SESSAO, u.id);
  return u;
}

/** No protótipo a senha não é conferida nem guardada. */
export function entrar(email: string): Usuario | null {
  const u = porEmail(email);
  if (u) gravar(K_SESSAO, u.id);
  return u;
}

export function sair() {
  gravar(K_SESSAO, null);
}

export function salvarPerfil(u: Usuario) {
  gravar(K_USUARIOS, { ...usuarios(), [u.id]: u });
}

// ---------- Anúncios ----------

function todosAnuncios(): Anuncio[] {
  return ler(K_ANUNCIOS, []);
}

export function anunciosDo(usuarioId: string): Anuncio[] {
  return todosAnuncios()
    .filter((a) => a.usuarioId === usuarioId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function anuncio(id: string): Anuncio | null {
  return todosAnuncios().find((a) => a.id === id) ?? null;
}

export function novoAnuncio(usuarioId: string): Anuncio {
  const agora = new Date().toISOString();
  const seq = todosAnuncios().length + 1;
  return {
    id: novoId(),
    codigo: `ANU-${String(seq).padStart(4, "0")}`,
    usuarioId,
    status: "rascunho",
    etapa: 1,
    criadoEm: agora,
    atualizadoEm: agora,
    finalidade: "",
    tipo: "",
    fase: "",
    previsaoConclusao: "",
    anoConstrucao: "",
    localChaves: "",
    ocupacao: "",
    padrao: "",
    condominio: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bloco: "",
    andar: "",
    bairro: "",
    cidade: "",
    uf: "",
    lat: null,
    lng: null,
    ocultarEndereco: true,
    dormitorios: "",
    suites: "",
    banheiros: "",
    lavabos: "",
    areaUtil: "",
    areaTotal: "",
    areaPrivativa: "",
    areaComum: "",
    vagas: "",
    salas: "",
    mobiliado: "",
    face: "",
    posicaoSolar: "",
    comodidades: [],
    fotos: [],
    negocio: "",
    valorVenda: null,
    valorLocacao: null,
    valorCondominio: null,
    valorIptu: null,
    iptuPeriodo: "mensal",
    aceitaFinanciamento: false,
    aceitaPermuta: false,
    titulo: "",
    descricao: "",
  };
}

export function salvarAnuncio(a: Anuncio) {
  const lista = todosAnuncios();
  const atualizado = { ...a, atualizadoEm: new Date().toISOString() };
  const i = lista.findIndex((x) => x.id === a.id);
  if (i >= 0) lista[i] = atualizado;
  else lista.push(atualizado);
  gravar(K_ANUNCIOS, lista);
  return atualizado;
}

export function excluirAnuncio(id: string) {
  gravar(K_ANUNCIOS, todosAnuncios().filter((a) => a.id !== id));
}

export function enviarParaAprovacao(a: Anuncio): Anuncio {
  const agora = new Date();
  const validade = new Date(agora.getTime() + validadeTermoDias * 86400000);
  return salvarAnuncio({
    ...a,
    status: "em_aprovacao",
    etapa: 8,
    enviadoEm: agora.toISOString(),
    termo: { versao: VERSAO_TERMO, aceitoEm: agora.toISOString(), validoAte: validade.toISOString() },
  });
}

export function renovarTermo(a: Anuncio): Anuncio {
  const agora = new Date();
  const validade = new Date(agora.getTime() + validadeTermoDias * 86400000);
  return salvarAnuncio({ ...a, termo: { versao: VERSAO_TERMO, aceitoEm: agora.toISOString(), validoAte: validade.toISOString() } });
}

export type SituacaoTermo = "pendente" | "vigente" | "vencendo" | "vencido";

export function situacaoTermo(a: Anuncio): { situacao: SituacaoTermo; dias: number | null } {
  if (!a.termo) return { situacao: "pendente", dias: null };
  const dias = Math.ceil((new Date(a.termo.validoAte).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { situacao: "vencido", dias };
  if (dias <= 30) return { situacao: "vencendo", dias };
  if (a.termo.versao !== VERSAO_TERMO) return { situacao: "pendente", dias };
  return { situacao: "vigente", dias };
}

// ---------- Hook ----------

export function useConta() {
  const [estado, setEstado] = useState(() => ({ usuario: usuarioAtual() }));
  useEffect(() => {
    const atualizar = () => setEstado({ usuario: usuarioAtual() });
    window.addEventListener(EVENTO, atualizar);
    window.addEventListener("storage", atualizar);
    return () => {
      window.removeEventListener(EVENTO, atualizar);
      window.removeEventListener("storage", atualizar);
    };
  }, []);
  return estado.usuario;
}

export function useAnuncios(usuarioId: string | undefined) {
  const [lista, setLista] = useState<Anuncio[]>(() => (usuarioId ? anunciosDo(usuarioId) : []));
  useEffect(() => {
    const atualizar = () => setLista(usuarioId ? anunciosDo(usuarioId) : []);
    atualizar();
    window.addEventListener(EVENTO, atualizar);
    return () => window.removeEventListener(EVENTO, atualizar);
  }, [usuarioId]);
  return lista;
}

export function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}
