import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { siteOrgId } from "../config";
import { enviarLeadAoCrm } from "./leads";
import { supabase } from "./supabase";

// Conta do anunciante, anúncios e termos no Supabase do CRM (tabelas
// site_anunciantes e site_anuncios, migration em supabase/migrations).
// Login: Supabase Auth com e-mail e senha. Mudança de status (enviar, pausar,
// reativar, renovar, excluir) só por RPC; o navegador grava só etapa e dados.
// As telas leem um retrato em memória, atualizado a cada gravação.

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
  /** Caminho no bucket site-anuncios: <usuario>/<anuncio>/<foto>.jpg */
  caminho: string;
  url: string;
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
  /** Quem pausou: o próprio anunciante, a equipe no CRM ou o termo vencido. */
  pausadoPor?: "anunciante" | "equipe" | "termo";
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

export const VERSAO_TERMO = "2026.1";

export function novoId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// ---------- Retrato em memória ----------

interface Estado {
  /** false até a sessão salva no navegador ser lida. */
  pronto: boolean;
  usuario: Usuario | null;
  anuncios: Anuncio[];
  /** O usuário abriu o link de "esqueci minha senha" e precisa criar uma nova. */
  novaSenha: boolean;
}

let estado: Estado = { pronto: false, usuario: null, anuncios: [], novaSenha: false };
const ouvintes = new Set<() => void>();

function definir(p: Partial<Estado>) {
  estado = { ...estado, ...p };
  ouvintes.forEach((f) => f());
}

function assinar(f: () => void) {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

function falha(e: { message?: string; code?: string } | null, padrao = "Não foi possível salvar agora. Tente de novo."): never {
  // Mensagens das RPCs (errcode 22023/P0002) já vêm em português para o anunciante.
  if (e?.code === "22023" || e?.code === "P0002") throw new Error(e.message);
  console.error(e);
  throw new Error(padrao);
}

// ---------- Conversão banco <-> telas ----------

type LinhaUsuario = {
  id: string; nome: string; email: string; telefone: string; rg: string; cpf: string; estado_civil: string;
  nascimento: string; cep: string; rua: string; numero: string; complemento: string; bairro: string;
  cidade: string; uf: string; criado_em: string;
};

type LinhaAnuncio = {
  id: string; codigo: string; anunciante_id: string; status: StatusAnuncio; pausado_por: Anuncio["pausadoPor"] | null;
  etapa: number; dados: Record<string, unknown>; termo_versao: string | null; termo_aceito_em: string | null;
  termo_valido_ate: string | null; enviado_em: string | null; criado_em: string; atualizado_em: string;
};

const CONTROLE = ["id", "codigo", "usuarioId", "status", "pausadoPor", "etapa", "criadoEm", "atualizadoEm", "enviadoEm", "termo"] as const;

function deLinhaUsuario(l: LinhaUsuario): Usuario {
  return {
    id: l.id, nome: l.nome, email: l.email, telefone: l.telefone, rg: l.rg, cpf: l.cpf, estadoCivil: l.estado_civil,
    nascimento: l.nascimento, cep: l.cep, rua: l.rua, numero: l.numero, complemento: l.complemento, bairro: l.bairro,
    cidade: l.cidade, uf: l.uf, criadoEm: l.criado_em,
  };
}

function paraLinhaUsuario(u: Usuario) {
  return {
    nome: u.nome.trim(), telefone: u.telefone, rg: u.rg, cpf: u.cpf, estado_civil: u.estadoCivil, nascimento: u.nascimento,
    cep: u.cep, rua: u.rua, numero: u.numero, complemento: u.complemento, bairro: u.bairro, cidade: u.cidade, uf: u.uf,
  };
}

function deLinhaAnuncio(l: LinhaAnuncio): Anuncio {
  const base = novoAnuncio(l.anunciante_id);
  return {
    ...base,
    ...(l.dados as Partial<Anuncio>),
    id: l.id,
    codigo: l.codigo,
    usuarioId: l.anunciante_id,
    status: l.status,
    pausadoPor: l.pausado_por ?? undefined,
    etapa: l.etapa,
    criadoEm: l.criado_em,
    atualizadoEm: l.atualizado_em,
    enviadoEm: l.enviado_em ?? undefined,
    termo: l.termo_versao && l.termo_aceito_em && l.termo_valido_ate
      ? { versao: l.termo_versao, aceitoEm: l.termo_aceito_em, validoAte: l.termo_valido_ate }
      : undefined,
  };
}

function dadosDo(a: Anuncio) {
  const d: Record<string, unknown> = { ...a };
  CONTROLE.forEach((k) => delete d[k]);
  return d;
}

function guardarAnuncio(a: Anuncio) {
  const lista = estado.anuncios.filter((x) => x.id !== a.id);
  definir({ anuncios: [a, ...lista].sort((x, y) => y.atualizadoEm.localeCompare(x.atualizadoEm)) });
  return a;
}

// ---------- Sessão ----------

let carregando = 0;

async function carregar(sessao: Session | null) {
  const vez = ++carregando;
  if (!sessao) return definir({ pronto: true, usuario: null, anuncios: [] });
  let { data: perfil } = await supabase.from("site_anunciantes").select("*").eq("id", sessao.user.id).maybeSingle();
  if (!perfil) {
    // Primeiro login (inclusive depois de confirmar o e-mail): cria o perfil com o que veio no cadastro.
    const meta = sessao.user.user_metadata ?? {};
    const { data, error } = await supabase
      .from("site_anunciantes")
      .insert({ id: sessao.user.id, org_id: siteOrgId, nome: String(meta.nome ?? ""), telefone: String(meta.telefone ?? "") })
      .select("*")
      .single();
    if (error) console.error("[conta] perfil:", error);
    perfil = data;
  }
  const { data: linhas, error } = await supabase.from("site_anuncios").select("*").order("atualizado_em", { ascending: false });
  if (error) console.error("[conta] anúncios:", error);
  if (vez !== carregando) return;
  definir({
    pronto: true,
    usuario: perfil ? deLinhaUsuario(perfil as LinhaUsuario) : null,
    anuncios: ((linhas ?? []) as LinhaAnuncio[]).map(deLinhaAnuncio),
  });
}

supabase.auth.onAuthStateChange((evento, sessao) => {
  if (evento === "PASSWORD_RECOVERY") definir({ novaSenha: true });
  if (evento === "TOKEN_REFRESHED" || evento === "USER_UPDATED") return;
  // Fora do callback: chamar o supabase aqui dentro trava o cliente.
  setTimeout(() => void carregar(sessao), 0);
});

// ---------- Conta ----------

export function usuarioAtual(): Usuario | null {
  return estado.usuario;
}

const MENSAGENS_LOGIN: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme o e-mail pelo link que enviamos antes de entrar.",
  "User already registered": "Já existe uma conta com este e-mail. Entre por aqui.",
};

function erroLogin(e: { message: string; status?: number }): never {
  if (e.status === 429) throw new Error("Muitas tentativas. Espere alguns minutos e tente de novo.");
  throw new Error(MENSAGENS_LOGIN[e.message] ?? e.message);
}

const voltaDoEmail = () => `${window.location.origin}/entrar`;

/** Cria a conta. `confirmar` = o projeto pede confirmação do e-mail antes de entrar. */
export async function criarConta(dados: { nome: string; email: string; telefone: string; senha: string }): Promise<{ confirmar: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: dados.email.trim().toLowerCase(),
    password: dados.senha,
    options: { data: { nome: dados.nome.trim(), telefone: dados.telefone, origem: "site", org_id: siteOrgId }, emailRedirectTo: voltaDoEmail() },
  });
  if (error) erroLogin(error);
  // Com confirmação ligada, e-mail já cadastrado volta sem erro e sem identidade.
  if (data.user && data.user.identities?.length === 0) throw new Error(MENSAGENS_LOGIN["User already registered"]);
  return { confirmar: !data.session };
}

export async function entrar(email: string, senha: string) {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) erroLogin(error);
}

export async function esqueciSenha(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: voltaDoEmail() });
  if (error) erroLogin(error);
}

export async function definirNovaSenha(senha: string) {
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) erroLogin(error);
  definir({ novaSenha: false });
}

export async function sair() {
  await supabase.auth.signOut();
}

export async function salvarPerfil(u: Usuario): Promise<Usuario> {
  const { data, error } = await supabase.from("site_anunciantes").update(paraLinhaUsuario(u)).eq("id", u.id).select("*").single();
  if (error) falha(error);
  const salvo = deLinhaUsuario(data as LinhaUsuario);
  definir({ usuario: salvo });
  return salvo;
}

// ---------- Anúncios ----------

export function anunciosDo(usuarioId: string): Anuncio[] {
  return estado.anuncios.filter((a) => a.usuarioId === usuarioId);
}

export function anuncio(id: string): Anuncio | null {
  return estado.anuncios.find((a) => a.id === id) ?? null;
}

/** Anúncio novo só na memória; o código ANU-0000 vem do banco no primeiro salvamento. */
export function novoAnuncio(usuarioId: string): Anuncio {
  const agora = new Date().toISOString();
  return {
    id: novoId(),
    codigo: "",
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

/** Grava etapa e dados. Status e termo só mudam pelas funções abaixo. */
export async function salvarAnuncio(a: Anuncio): Promise<Anuncio> {
  const existe = estado.anuncios.some((x) => x.id === a.id);
  const consulta = existe
    ? supabase.from("site_anuncios").update({ etapa: a.etapa, dados: dadosDo(a) }).eq("id", a.id)
    : supabase.from("site_anuncios").insert({ id: a.id, anunciante_id: a.usuarioId, etapa: a.etapa, dados: dadosDo(a) });
  const { data, error } = await consulta.select("*").single();
  if (error) falha(error, existe ? undefined : "Não foi possível criar o cadastro agora. Tente de novo.");
  return guardarAnuncio(deLinhaAnuncio(data as LinhaAnuncio));
}

async function acao(rpc: string, id: string): Promise<Anuncio> {
  const { data, error } = await supabase.rpc(rpc, { p_id: id });
  if (error) falha(error);
  return guardarAnuncio(deLinhaAnuncio(data as LinhaAnuncio));
}

export async function excluirAnuncio(id: string) {
  const { error } = await supabase.rpc("site_excluir_anuncio", { p_id: id });
  if (error) falha(error, "Não foi possível excluir agora. Tente de novo.");
  definir({ anuncios: estado.anuncios.filter((a) => a.id !== id) });
}

/** Salva, aceita o termo e manda para a equipe. No reenvio, atualiza o imóvel no CRM. */
export async function enviarParaAprovacao(a: Anuncio): Promise<Anuncio> {
  await salvarAnuncio(a);
  const primeiraVez = !a.enviadoEm;
  const enviado = await acao("site_enviar_anuncio", a.id);
  const u = estado.usuario;
  if (primeiraVez && u) {
    // Proprietário com imóvel é lead de captação. Se falhar, o imóvel já está no CRM.
    enviarLeadAoCrm({
      origem: "anuncio",
      nome: u.nome,
      telefone: u.telefone,
      email: u.email,
      imovel_codigo: enviado.codigo,
      negocio: enviado.negocio === "locacao" ? "administrar" : "vender",
      bairro: enviado.bairro,
      pagina: window.location.pathname,
    }).catch((e) => console.error("[conta] lead do anúncio:", e));
  }
  return enviado;
}

export const renovarTermo = (a: Anuncio) => acao("site_renovar_termo", a.id);
export const pausarAnuncio = (a: Anuncio) => acao("site_pausar_anuncio", a.id);
export const reativarAnuncio = (a: Anuncio) => acao("site_reativar_anuncio", a.id);

export type SituacaoTermo = "pendente" | "vigente" | "vencendo" | "vencido";

export function situacaoTermo(a: Anuncio): { situacao: SituacaoTermo; dias: number | null } {
  if (!a.termo) return { situacao: "pendente", dias: null };
  const dias = Math.ceil((new Date(a.termo.validoAte).getTime() - Date.now()) / 86400000);
  if (dias < 0) return { situacao: "vencido", dias };
  if (dias <= 30) return { situacao: "vencendo", dias };
  if (a.termo.versao !== VERSAO_TERMO) return { situacao: "pendente", dias };
  return { situacao: "vigente", dias };
}

// ---------- Hooks ----------

/** undefined enquanto a sessão carrega; null sem login. */
export function useConta(): Usuario | null | undefined {
  return useSyncExternalStore(assinar, () => (estado.pronto ? estado.usuario : undefined));
}

export function useAnuncios(usuarioId: string | undefined) {
  const todos = useSyncExternalStore(assinar, () => estado.anuncios);
  return usuarioId ? todos.filter((a) => a.usuarioId === usuarioId) : [];
}

export function usePrecisaNovaSenha() {
  return useSyncExternalStore(assinar, () => estado.novaSenha);
}

export function iniciais(nome: string) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
}
