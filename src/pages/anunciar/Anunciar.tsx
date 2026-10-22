import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { AvisoPrototipo, CampoDinheiro, CampoNumero, CampoSelect, CampoTexto, Contador, Escolhas, Marcar, Rotulo } from "../../components/Campos";
import { Icone } from "../../components/Icone";
import { Logo } from "../../components/Layout";
import { validadeTermoDias } from "../../config";
import {
  ETAPAS,
  FACE,
  FASES,
  FINALIDADES,
  GRUPOS_COMODIDADES,
  LOCAL_CHAVES,
  MOBILIADO,
  OCUPACAO,
  PADRAO,
  POSICAO_SOLAR,
  TEXTO_TERMO,
  TIPOS_POR_FINALIDADE,
  UFS,
} from "../../content-anuncio";
import { anuncio, enviarParaAprovacao, novoAnuncio, salvarAnuncio, useConta, type Anuncio } from "../../lib/conta";
import { buscarCep, localizar, mascaraCep } from "../../lib/endereco";
import { useSeo } from "../../lib/seo";
import { formatarPreco } from "../../lib/vitrine";
import NaoEncontrado from "../NaoEncontrado";
import { EtapaFotos } from "./EtapaFotos";

const MapaPino = lazy(() => import("./MapaPino"));

type Erros = Record<string, string>;
type Mudar = (p: Partial<Anuncio>) => void;

const num = (v: string) => (v ? Number(v.replace(",", ".")) : 0);
const residencial = (a: Anuncio) => a.finalidade === "residencial" || a.finalidade === "rural";
const qtd = (v: string, um: string, varios: string) => (v && v !== "0" ? `${v} ${v === "1" ? um : varios}` : null);
const iptuMensal = (a: Anuncio) => (a.valorIptu ? (a.iptuPeriodo === "anual" ? a.valorIptu / 12 : a.valorIptu) : 0);

function validar(etapa: number, a: Anuncio, aceite: boolean): Erros {
  const e: Erros = {};
  if (etapa === 1 && !a.finalidade) e.finalidade = "Escolha a finalidade para continuar.";
  if (etapa === 2) {
    if (!a.tipo) e.tipo = "Escolha o tipo do imóvel.";
    if (!a.fase) e.fase = "Informe a fase do imóvel.";
    if (a.fase && a.fase !== "Pronto para morar" && !a.previsaoConclusao) e.previsaoConclusao = "Informe a previsão de entrega.";
    if (a.anoConstrucao && (num(a.anoConstrucao) < 1850 || num(a.anoConstrucao) > new Date().getFullYear())) e.anoConstrucao = "Ano inválido.";
  }
  if (etapa === 3) {
    if (a.cep && a.cep.replace(/\D/g, "").length !== 8) e.cep = "O CEP tem 8 números.";
    if (!a.logradouro.trim()) e.logradouro = "Informe a rua.";
    if (!a.numero.trim()) e.numero = "Informe o número.";
    if (!a.bairro.trim()) e.bairro = "Informe o bairro.";
    if (!a.cidade.trim()) e.cidade = "Informe a cidade.";
    if (!a.uf) e.uf = "Informe o estado.";
  }
  if (etapa === 4) {
    if (residencial(a) && a.dormitorios === "") e.dormitorios = "Informe os quartos (0 se não tiver).";
    if (a.banheiros === "") e.banheiros = "Informe os banheiros.";
    if (!num(a.areaUtil)) e.areaUtil = "Informe a área útil.";
    if (num(a.areaTotal) && num(a.areaTotal) < num(a.areaUtil)) e.areaTotal = "A área total não pode ser menor que a útil.";
    if (num(a.suites) > num(a.dormitorios) && residencial(a)) e.suites = "Mais suítes do que quartos.";
    if (!a.mobiliado) e.mobiliado = "Informe se o imóvel é mobiliado.";
  }
  if (etapa === 7) {
    if (!a.negocio) e.negocio = "Escolha venda, locação ou os dois.";
    if ((a.negocio === "venda" || a.negocio === "venda_locacao") && !a.valorVenda) e.valorVenda = "Informe o valor de venda.";
    if ((a.negocio === "locacao" || a.negocio === "venda_locacao") && !a.valorLocacao) e.valorLocacao = "Informe o valor do aluguel.";
  }
  if (etapa === 8 && a.status === "rascunho" && !aceite) e.aceite = "Para enviar, aceite o termo de autorização.";
  return e;
}

// ---------- Etapas ----------

function Etapa1({ a, mudar, erros }: { a: Anuncio; mudar: Mudar; erros: Erros }) {
  return (
    <fieldset>
      <legend className="sr-only">Finalidade</legend>
      <div className="grid gap-3">
        {FINALIDADES.map((f) => (
          <label key={f.valor} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors md:p-5 ${a.finalidade === f.valor ? "border-brand-600 bg-brand-50" : "border-sand-300 hover:border-ink/30"}`}>
            <input type="radio" name="finalidade" value={f.valor} checked={a.finalidade === f.valor} onChange={() => mudar({ finalidade: f.valor, tipo: TIPOS_POR_FINALIDADE[f.valor].includes(a.tipo) ? a.tipo : "" })} className="h-5 w-5 accent-brand-600" />
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${a.finalidade === f.valor ? "bg-brand-600 text-white" : "bg-sand-100 text-ink-soft"}`}><Icone nome={f.icone} className="h-6 w-6" /></span>
            <span>
              <span className="block text-[17px] font-semibold">{f.rotulo}</span>
              <span className="block text-[14px] text-ink-muted">{f.texto}</span>
            </span>
          </label>
        ))}
      </div>
      {erros.finalidade && <p className="mt-3 text-[14px] text-brand-700">{erros.finalidade}</p>}
    </fieldset>
  );
}

function Etapa2({ a, mudar, erros }: { a: Anuncio; mudar: Mudar; erros: Erros }) {
  const pronto = a.fase === "Pronto para morar";
  return (
    <div className="grid gap-6">
      <div className="rounded-xl bg-sand-50 px-4 py-3 text-[14px] text-ink-soft">
        Finalidade: <b className="text-ink">{FINALIDADES.find((f) => f.valor === a.finalidade)?.rotulo}</b>
      </div>
      <CampoSelect rotulo="Tipo do imóvel" valor={a.tipo} aoMudar={(v) => mudar({ tipo: v })} opcoes={TIPOS_POR_FINALIDADE[a.finalidade] ?? []} obrigatorio erro={erros.tipo} />
      <Escolhas rotulo="Fase" valor={a.fase} aoMudar={(v) => mudar({ fase: v })} opcoes={FASES} obrigatorio erro={erros.fase} colunas="grid-cols-1 sm:grid-cols-3" />
      {a.fase && !pronto && (
        <CampoTexto rotulo="Previsão de entrega" type="month" valor={a.previsaoConclusao} aoMudar={(v) => mudar({ previsaoConclusao: v })} obrigatorio erro={erros.previsaoConclusao} className="max-w-xs" />
      )}
      {pronto && (
        <CampoNumero rotulo="Ano de construção" valor={a.anoConstrucao} aoMudar={(v) => mudar({ anoConstrucao: v.slice(0, 4) })} opcional placeholder="Ex.: 2012" erro={erros.anoConstrucao} className="max-w-xs" />
      )}
      <Escolhas rotulo="Onde estão as chaves" valor={a.localChaves} aoMudar={(v) => mudar({ localChaves: v })} opcoes={LOCAL_CHAVES} />
      <Escolhas rotulo="Ocupação" valor={a.ocupacao} aoMudar={(v) => mudar({ ocupacao: v })} opcoes={OCUPACAO} colunas="grid-cols-1 sm:grid-cols-3" />
      <CampoSelect rotulo="Padrão do imóvel" valor={a.padrao} aoMudar={(v) => mudar({ padrao: v })} opcoes={PADRAO} opcional className="max-w-sm" />
    </div>
  );
}

function Etapa3({ a, mudar, erros }: { a: Anuncio; mudar: Mudar; erros: Erros }) {
  const [buscando, setBuscando] = useState<"cep" | "mapa" | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function noMapa(base?: Partial<Anuncio>) {
    const x = { ...a, ...base };
    setBuscando("mapa");
    setAviso(null);
    try {
      const pos = (await localizar([`${x.logradouro} ${x.numero}`.trim(), x.bairro, x.cidade, x.uf])) ?? (await localizar([x.logradouro, x.cidade, x.uf]));
      if (pos) mudar({ lat: pos.lat, lng: pos.lng });
      else setAviso("Não achamos o endereço no mapa. Arraste o pino até o imóvel.");
    } catch {
      setAviso("O mapa não respondeu. Arraste o pino até o imóvel.");
    } finally {
      setBuscando(null);
    }
  }

  async function aoCep(v: string) {
    const cep = mascaraCep(v);
    mudar({ cep });
    if (cep.length !== 9) return;
    setBuscando("cep");
    try {
      const e = await buscarCep(cep);
      if (!e) {
        setAviso("CEP não encontrado. Preencha o endereço abaixo.");
        return;
      }
      const preenchido = { logradouro: e.logradouro || a.logradouro, bairro: e.bairro || a.bairro, cidade: e.cidade || a.cidade, uf: e.uf || a.uf };
      mudar(preenchido);
      setAviso(null);
      if (a.lat === null) noMapa({ ...preenchido, cep });
    } catch {
      setAviso("Não foi possível consultar o CEP agora. Preencha à mão.");
    } finally {
      setBuscando((b) => (b === "cep" ? null : b));
    }
  }

  return (
    <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid content-start gap-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <CampoTexto rotulo="CEP" valor={a.cep} aoMudar={aoCep} inputMode="numeric" placeholder="00000-000" erro={erros.cep} dica={buscando === "cep" ? "Buscando endereço..." : undefined} />
          <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener" className="mt-1.5 inline-block text-[13px] font-semibold text-brand-700 underline">Não sei meu CEP</a>
        </div>
        <CampoTexto rotulo="Condomínio" valor={a.condominio} aoMudar={(v) => mudar({ condominio: v })} opcional placeholder="Nome do edifício ou condomínio" className="sm:col-span-3" />
        <CampoTexto rotulo="Rua" valor={a.logradouro} aoMudar={(v) => mudar({ logradouro: v })} obrigatorio erro={erros.logradouro} className="sm:col-span-4" />
        <CampoTexto rotulo="Número" valor={a.numero} aoMudar={(v) => mudar({ numero: v })} obrigatorio erro={erros.numero} className="sm:col-span-2" />
        <CampoTexto rotulo="Complemento" valor={a.complemento} aoMudar={(v) => mudar({ complemento: v })} opcional placeholder="Apto, sala" className="sm:col-span-2" />
        <CampoTexto rotulo="Bloco" valor={a.bloco} aoMudar={(v) => mudar({ bloco: v })} opcional className="sm:col-span-2" />
        <CampoNumero rotulo="Andar" valor={a.andar} aoMudar={(v) => mudar({ andar: v })} opcional className="sm:col-span-2" />
        <CampoTexto rotulo="Bairro" valor={a.bairro} aoMudar={(v) => mudar({ bairro: v })} obrigatorio erro={erros.bairro} className="sm:col-span-3" />
        <CampoTexto rotulo="Cidade" valor={a.cidade} aoMudar={(v) => mudar({ cidade: v })} obrigatorio erro={erros.cidade} className="sm:col-span-2" />
        <CampoSelect rotulo="UF" valor={a.uf} aoMudar={(v) => mudar({ uf: v })} opcoes={UFS} vazio="--" obrigatorio erro={erros.uf} className="sm:col-span-1" />
        <div className="sm:col-span-6">
          <Marcar marcado={a.ocultarEndereco} aoMudar={(v) => mudar({ ocultarEndereco: v })}>
            Mostrar só o bairro no anúncio <span className="text-ink-muted">(recomendado: o endereço exato fica só com a nossa equipe)</span>
          </Marcar>
        </div>
      </div>
      <div className="grid content-start gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Rotulo>Posição no mapa</Rotulo>
          <button type="button" onClick={() => noMapa()} disabled={!a.logradouro || buscando === "mapa"} className="btn-contorno px-4 py-2 text-[14px] disabled:opacity-50">
            <Icone nome="pino" className="h-4 w-4" /> {buscando === "mapa" ? "Localizando..." : "Localizar endereço"}
          </button>
        </div>
        <Suspense fallback={<div className="h-[320px] animate-pulse rounded-2xl bg-sand-100 md:h-[380px]" />}>
          <MapaPino lat={a.lat} lng={a.lng} aoMover={(lat, lng) => mudar({ lat, lng })} />
        </Suspense>
        <p className="text-[13px] text-ink-muted">{aviso ?? "Se o pino não estiver no lugar certo, arraste ou toque no mapa."}</p>
      </div>
    </div>
  );
}

function Etapa4({ a, mudar, erros }: { a: Anuncio; mudar: Mudar; erros: Erros }) {
  const res = residencial(a);
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <h3 className="text-[16px] font-semibold">Cômodos</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {res && <Contador rotulo="Quartos" valor={a.dormitorios} aoMudar={(v) => mudar({ dormitorios: v })} obrigatorio erro={erros.dormitorios} />}
          {res && <Contador rotulo="Suítes" valor={a.suites} aoMudar={(v) => mudar({ suites: v })} erro={erros.suites} />}
          {!res && <Contador rotulo="Salas" valor={a.salas} aoMudar={(v) => mudar({ salas: v })} max={200} />}
          <Contador rotulo="Banheiros" valor={a.banheiros} aoMudar={(v) => mudar({ banheiros: v })} obrigatorio erro={erros.banheiros} />
          <Contador rotulo="Lavabos" valor={a.lavabos} aoMudar={(v) => mudar({ lavabos: v })} />
          <Contador rotulo="Vagas de garagem" valor={a.vagas} aoMudar={(v) => mudar({ vagas: v })} max={200} />
          {res && <Contador rotulo="Salas" valor={a.salas} aoMudar={(v) => mudar({ salas: v })} />}
        </div>
      </section>
      <section className="grid gap-4">
        <h3 className="text-[16px] font-semibold">Áreas</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <CampoNumero rotulo="Área útil" valor={a.areaUtil} aoMudar={(v) => mudar({ areaUtil: v })} sufixo="m²" obrigatorio erro={erros.areaUtil} />
          <CampoNumero rotulo="Área total" valor={a.areaTotal} aoMudar={(v) => mudar({ areaTotal: v })} sufixo="m²" erro={erros.areaTotal} />
          <CampoNumero rotulo="Área privativa" valor={a.areaPrivativa} aoMudar={(v) => mudar({ areaPrivativa: v })} sufixo="m²" />
          <CampoNumero rotulo="Área comum" valor={a.areaComum} aoMudar={(v) => mudar({ areaComum: v })} sufixo="m²" />
        </div>
      </section>
      <section className="grid gap-5">
        <Escolhas rotulo="Mobiliado?" valor={a.mobiliado} aoMudar={(v) => mudar({ mobiliado: v })} opcoes={MOBILIADO} obrigatorio erro={erros.mobiliado} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelect rotulo="Face do imóvel" valor={a.face} aoMudar={(v) => mudar({ face: v })} opcoes={FACE} opcional />
          <CampoSelect rotulo="Posição do sol" valor={a.posicaoSolar} aoMudar={(v) => mudar({ posicaoSolar: v })} opcoes={POSICAO_SOLAR} opcional />
        </div>
      </section>
    </div>
  );
}

function Etapa5({ a, mudar }: { a: Anuncio; mudar: Mudar }) {
  const [busca, setBusca] = useState("");
  const norm = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const alternar = (item: string) =>
    mudar({ comodidades: a.comodidades.includes(item) ? a.comodidades.filter((c) => c !== item) : [...a.comodidades, item] });
  const grupos = GRUPOS_COMODIDADES.map((g) => ({ ...g, itens: g.itens.filter((i) => norm(i).includes(norm(busca))) })).filter((g) => g.itens.length);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Icone nome="busca" className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted" />
          <label htmlFor="busca-comodidade" className="sr-only">Buscar comodidade</label>
          <input id="busca-comodidade" value={busca} onChange={(e) => setBusca(e.target.value)} className="campo pl-11" placeholder="Buscar: piscina, varanda, portaria..." />
        </div>
        <p className="num text-[14px] text-ink-muted">{a.comodidades.length} {a.comodidades.length === 1 ? "marcada" : "marcadas"}</p>
      </div>
      {grupos.map((g) => (
        <section key={g.titulo}>
          <h3 className="mb-3 text-[15px] font-semibold">{g.titulo}</h3>
          <div className="flex flex-wrap gap-2">
            {g.itens.map((i) => {
              const on = a.comodidades.includes(i);
              return (
                <button key={i} type="button" aria-pressed={on} onClick={() => alternar(i)} className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[14px] transition-colors ${on ? "border-brand-600 bg-brand-600 text-white" : "border-sand-300 hover:border-ink/40"}`}>
                  {on && <Icone nome="check" className="h-4 w-4" />} {i}
                </button>
              );
            })}
          </div>
        </section>
      ))}
      {!grupos.length && <p className="text-[15px] text-ink-muted">Nenhuma comodidade com "{busca}".</p>}
    </div>
  );
}

function Etapa7({ a, mudar, erros }: { a: Anuncio; mudar: Mudar; erros: Erros }) {
  const NEG = [["venda", "Vender"], ["locacao", "Alugar"], ["venda_locacao", "Vender e alugar"]] as const;
  const vende = a.negocio === "venda" || a.negocio === "venda_locacao";
  const aluga = a.negocio === "locacao" || a.negocio === "venda_locacao";
  const total = (a.valorLocacao ?? 0) + (a.valorCondominio ?? 0) + iptuMensal(a);
  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="rotulo">O que você quer fazer<span className="text-brand-600"> *</span></legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {NEG.map(([v, r]) => (
            <button key={v} type="button" aria-pressed={a.negocio === v} onClick={() => mudar({ negocio: v })} className={`rounded-xl border px-4 py-3 text-[15px] font-medium ${a.negocio === v ? "border-brand-600 bg-brand-50 text-brand-800" : "border-sand-300 hover:border-ink/30"}`}>{r}</button>
          ))}
        </div>
        {erros.negocio && <p className="mt-1.5 text-[13px] text-brand-700">{erros.negocio}</p>}
      </fieldset>
      {a.negocio && (
        <div className="grid gap-4 sm:grid-cols-2">
          {vende && <CampoDinheiro rotulo="Valor de venda" valor={a.valorVenda} aoMudar={(v) => mudar({ valorVenda: v })} obrigatorio erro={erros.valorVenda} />}
          {aluga && <CampoDinheiro rotulo="Aluguel por mês" valor={a.valorLocacao} aoMudar={(v) => mudar({ valorLocacao: v })} obrigatorio erro={erros.valorLocacao} />}
          <CampoDinheiro rotulo="Condomínio por mês" valor={a.valorCondominio} aoMudar={(v) => mudar({ valorCondominio: v })} opcional />
          <div>
            <CampoDinheiro rotulo="IPTU" valor={a.valorIptu} aoMudar={(v) => mudar({ valorIptu: v })} opcional />
            <div className="mt-2 inline-flex rounded-full bg-sand-100 p-1 text-[13px]">
              {(["mensal", "anual"] as const).map((p) => (
                <button key={p} type="button" aria-pressed={a.iptuPeriodo === p} onClick={() => mudar({ iptuPeriodo: p })} className={`rounded-full px-3 py-1 font-semibold ${a.iptuPeriodo === p ? "bg-white shadow-sm" : "text-ink-muted"}`}>
                  Valor {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {vende && (
        <div className="grid gap-3">
          <Marcar marcado={a.aceitaFinanciamento} aoMudar={(v) => mudar({ aceitaFinanciamento: v })}>Aceita financiamento bancário</Marcar>
          <Marcar marcado={a.aceitaPermuta} aoMudar={(v) => mudar({ aceitaPermuta: v })}>Aceita permuta</Marcar>
        </div>
      )}
      {aluga && a.valorLocacao ? (
        <div className="rounded-2xl bg-sand-50 p-5">
          <p className="text-[14px] text-ink-muted">Quanto o inquilino vai ver no anúncio por mês</p>
          <p className="num mt-1 text-[26px] font-bold">{formatarPreco(total, true)}</p>
          <p className="num text-[13.5px] text-ink-muted">
            Aluguel {formatarPreco(a.valorLocacao, true)}
            {a.valorCondominio ? ` + condomínio ${formatarPreco(a.valorCondominio, true)}` : ""}
            {a.valorIptu ? ` + IPTU ${formatarPreco(iptuMensal(a), true)}` : ""}
          </p>
        </div>
      ) : null}
      <p className="text-[13.5px] text-ink-muted">Nossa equipe pode sugerir ajustes nos valores com base nos imóveis parecidos da região antes de publicar.</p>
    </div>
  );
}

function Resumo({ titulo, etapa, irPara, linhas }: { titulo: string; etapa: number; irPara: (n: number) => void; linhas: unknown[] }) {
  const itens = linhas.filter((x): x is string => typeof x === "string" && x.length > 0);
  return (
    <div className="rounded-2xl border border-sand-200 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-semibold">{titulo}</p>
        <button type="button" onClick={() => irPara(etapa)} className="text-[13.5px] font-semibold text-brand-700 underline underline-offset-2">Editar</button>
      </div>
      <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{itens.length ? itens.join(" · ") : "Nada informado"}</p>
    </div>
  );
}

function Etapa8({ a, mudar, erros, aceite, setAceite, irPara }: { a: Anuncio; mudar: Mudar; erros: Erros; aceite: boolean; setAceite: (v: boolean) => void; irPara: (n: number) => void }) {
  const sugestao = [a.tipo, residencial(a) && num(a.dormitorios) ? `com ${a.dormitorios} ${num(a.dormitorios) === 1 ? "quarto" : "quartos"}` : a.areaUtil ? `de ${a.areaUtil} m²` : "", a.bairro && `em ${a.bairro}`].filter(Boolean).join(" ");
  useEffect(() => {
    if (!a.titulo && sugestao) mudar({ titulo: sugestao });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const finalidade = FINALIDADES.find((f) => f.valor === a.finalidade)?.rotulo;
  const negocio = { venda: "Venda", locacao: "Locação", venda_locacao: "Venda e locação", "": "" }[a.negocio];
  return (
    <div className="grid gap-8">
      <section className="grid gap-4">
        <CampoTexto rotulo="Título do anúncio" valor={a.titulo} aoMudar={(v) => mudar({ titulo: v.slice(0, 90) })} dica={`${a.titulo.length}/90 caracteres`} />
        <div>
          <Rotulo htmlFor="descricao" opcional>Descrição</Rotulo>
          <textarea id="descricao" value={a.descricao} onChange={(e) => mudar({ descricao: e.target.value })} className="campo min-h-[140px] resize-y" placeholder="Conte o que o imóvel tem de melhor: vista, reforma recente, rua tranquila, perto do metrô..." />
        </div>
      </section>
      <section className="grid gap-3">
        <h3 className="text-[16px] font-semibold">Confira os dados</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <Resumo titulo="Informações gerais" etapa={1} irPara={irPara} linhas={[finalidade]} />
          <Resumo titulo="Tipo, fase e ano" etapa={2} irPara={irPara} linhas={[a.tipo, a.fase, a.previsaoConclusao && `entrega ${a.previsaoConclusao.split("-").reverse().join("/")}`, a.anoConstrucao && `construído em ${a.anoConstrucao}`, a.ocupacao, a.localChaves && `chaves: ${a.localChaves.toLowerCase()}`]} />
          <Resumo titulo="Endereço" etapa={3} irPara={irPara} linhas={[[a.logradouro, a.numero].filter(Boolean).join(", "), a.complemento, a.bairro, a.cidade && `${a.cidade}/${a.uf}`, a.lat !== null ? "posição no mapa marcada" : "sem posição no mapa"]} />
          <Resumo titulo="Cômodos" etapa={4} irPara={irPara} linhas={[a.areaUtil && `${a.areaUtil} m² úteis`, qtd(a.dormitorios, "quarto", "quartos"), qtd(a.suites, "suíte", "suítes"), qtd(a.banheiros, "banheiro", "banheiros"), qtd(a.lavabos, "lavabo", "lavabos"), qtd(a.vagas, "vaga", "vagas"), qtd(a.salas, "sala", "salas"), a.mobiliado && `mobiliado: ${a.mobiliado.toLowerCase()}`]} />
          <Resumo titulo="Comodidades" etapa={5} irPara={irPara} linhas={[a.comodidades.slice(0, 8).join(", ") + (a.comodidades.length > 8 ? ` e mais ${a.comodidades.length - 8}` : "")]} />
          <Resumo titulo="Fotos" etapa={6} irPara={irPara} linhas={[a.fotos.length ? `${a.fotos.length} ${a.fotos.length === 1 ? "foto" : "fotos"}` : "Nenhuma foto: anúncios com fotos recebem muito mais contatos"]} />
          <Resumo titulo="Valores" etapa={7} irPara={irPara} linhas={[negocio, a.valorVenda && `venda ${formatarPreco(a.valorVenda)}`, a.valorLocacao && `aluguel ${formatarPreco(a.valorLocacao)}`, a.valorCondominio && `condomínio ${formatarPreco(a.valorCondominio)}`, a.valorIptu && `IPTU ${formatarPreco(a.valorIptu)} (${a.iptuPeriodo})`]} />
        </div>
      </section>
      {a.status === "rascunho" && (
        <section className="grid gap-3">
          <h3 className="text-[16px] font-semibold">Termo de autorização de divulgação</h3>
          <div className="max-h-48 space-y-2 overflow-y-auto rounded-2xl border border-sand-200 bg-sand-50 p-4 text-[14px] leading-relaxed text-ink-soft" tabIndex={0}>
            {TEXTO_TERMO.map((p) => <p key={p}>{p}</p>)}
            <p>Validade: {validadeTermoDias} dias a partir do aceite.</p>
          </div>
          <Marcar marcado={aceite} aoMudar={setAceite}>Li e aceito o termo de autorização de divulgação deste imóvel.</Marcar>
          {erros.aceite && <p className="text-[13px] text-brand-700">{erros.aceite}</p>}
        </section>
      )}
    </div>
  );
}

// ---------- Tela ----------

export default function Anunciar() {
  const { id } = useParams();
  const usuario = useConta();
  const navegar = useNavigate();
  const local = useLocation();
  const [a, setA] = useState<Anuncio | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [etapa, setEtapa] = useState(1);
  const [erros, setErros] = useState<Erros>({});
  const [aceite, setAceite] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const topo = useRef<HTMLDivElement>(null);
  useSeo(enviado ? "Imóvel enviado" : `Anunciar imóvel: ${ETAPAS[etapa - 1].nome}`);

  useEffect(() => {
    if (!usuario) return;
    if (id) {
      const achado = anuncio(id);
      if (!achado || achado.usuarioId !== usuario.id) return setNaoAchou(true);
      setA((atual) => atual ?? achado);
      setEtapa((e) => (e === 1 && achado.status === "rascunho" ? achado.etapa : e));
    } else {
      setA((atual) => atual ?? novoAnuncio(usuario.id));
    }
  }, [id, usuario]);

  const progresso = useMemo(() => (a ? Math.max(a.etapa, etapa) : 1), [a, etapa]);

  if (!usuario) return <Navigate to={`/entrar?volta=${encodeURIComponent(local.pathname)}&aba=criar`} replace />;
  if (naoAchou) return <NaoEncontrado mensagem="Este cadastro não existe ou é de outra conta." />;
  if (!a) return null;

  const mudar: Mudar = (p) => {
    setA((x) => (x ? { ...x, ...p } : x));
    setErros((er) => {
      const n = { ...er };
      Object.keys(p).forEach((k) => delete n[k]);
      return n;
    });
  };
  const persistir = (x: Anuncio, proxima: number) => {
    const salvo = salvarAnuncio({ ...x, etapa: x.status === "rascunho" ? Math.max(x.etapa, proxima) : x.etapa });
    setA(salvo);
    if (!id) navegar(`/anunciar/${salvo.id}`, { replace: true });
    return salvo;
  };
  const rolar = () => topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const irPara = (n: number) => {
    setErros({});
    setEtapa(n);
    rolar();
  };

  function proximo() {
    if (!a) return;
    const er = validar(etapa, a, aceite);
    setErros(er);
    if (Object.keys(er).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true'], .text-brand-700")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    if (etapa < ETAPAS.length) {
      persistir(a, etapa + 1);
      irPara(etapa + 1);
      return;
    }
    if (a.status === "rascunho") {
      setA(enviarParaAprovacao(a));
      setEnviado(true);
      window.scrollTo(0, 0);
    } else {
      salvarAnuncio(a);
      navegar("/conta/imoveis");
    }
  }

  function voltar() {
    if (a && (id || a.finalidade)) persistir(a, etapa);
    irPara(etapa - 1);
  }

  function sairSalvando() {
    if (a && (id || a.finalidade)) persistir(a, etapa);
    navegar("/conta/imoveis");
  }

  const passo = ETAPAS[etapa - 1];

  const cabecalho = (
    <header className="sticky z-30 border-b border-sand-200 bg-white" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="container-site flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Página inicial"><Logo className="h-8 w-auto" /></Link>
        {!enviado && <p className="num hidden text-[14px] text-ink-muted sm:block">Etapa {etapa} de {ETAPAS.length}</p>}
        {!enviado && (
          <button type="button" onClick={sairSalvando} className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink-soft hover:text-ink">
            <Icone nome="sair" className="h-[18px] w-[18px]" /> Salvar e sair
          </button>
        )}
      </div>
      {!enviado && (
        <div className="flex gap-1 px-0" aria-hidden="true">
          {ETAPAS.map((_, k) => <span key={k} className={`h-1 flex-1 ${k < etapa ? "bg-brand-600" : "bg-sand-200"}`} />)}
        </div>
      )}
    </header>
  );

  if (enviado) {
    return (
      <div className="min-h-screen bg-white">
        {cabecalho}
        <div className="container-site max-w-2xl py-16 text-center md:py-24">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e3f4ea] text-[#1d7a46]"><Icone nome="check" className="h-7 w-7" /></span>
          <h1 className="mt-6 text-[30px] font-bold leading-tight md:text-[40px]">Recebemos o seu imóvel</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-soft">
            O cadastro {a.codigo} está em aprovação. Um corretor da Patrimóvel ADM confere os dados e as fotos e fala com você pelo WhatsApp antes de publicar.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Link to="/conta/imoveis" className="btn-primario">Ver meus imóveis</Link>
            <Link to="/anunciar" reloadDocument className="btn-contorno">Cadastrar outro imóvel</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {cabecalho}
      <div ref={topo} className="container-site grid flex-1 gap-8 pb-32 pt-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-14 lg:pt-12" style={{ scrollMarginTop: 80 }}>
        <aside className="lg:sticky lg:top-[110px] lg:self-start">
          <p className="num text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">Etapa {etapa} · {passo.nome}</p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight md:text-[34px]">{passo.pergunta}</h1>
          <ol className="mt-8 hidden gap-1 lg:grid">
            {ETAPAS.map((e, k) => {
              const n = k + 1;
              const liberada = n <= progresso;
              return (
                <li key={e.nome}>
                  <button
                    type="button"
                    disabled={!liberada}
                    onClick={() => irPara(n)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[14.5px] ${n === etapa ? "bg-sand-100 font-semibold text-ink" : liberada ? "text-ink-soft hover:bg-sand-50" : "text-ink-muted/60"}`}
                  >
                    <span className={`num grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${n < progresso && n !== etapa ? "bg-ink text-white" : n === etapa ? "bg-brand-600 text-white" : "border border-sand-300"}`}>
                      {n < progresso && n !== etapa ? <Icone nome="check" className="h-3.5 w-3.5" /> : n}
                    </span>
                    {e.nome}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
        <main className="min-w-0">
          {etapa === 1 && <AvisoPrototipo className="mb-6" />}
          {etapa === 1 && <Etapa1 a={a} mudar={mudar} erros={erros} />}
          {etapa === 2 && <Etapa2 a={a} mudar={mudar} erros={erros} />}
          {etapa === 3 && <Etapa3 a={a} mudar={mudar} erros={erros} />}
          {etapa === 4 && <Etapa4 a={a} mudar={mudar} erros={erros} />}
          {etapa === 5 && <Etapa5 a={a} mudar={mudar} />}
          {etapa === 6 && <EtapaFotos fotos={a.fotos} aoMudar={(fotos) => { const x = { ...a, fotos }; setA(x); persistir(x, etapa); }} />}
          {etapa === 7 && <Etapa7 a={a} mudar={mudar} erros={erros} />}
          {etapa === 8 && <Etapa8 a={a} mudar={mudar} erros={erros} aceite={aceite} setAceite={setAceite} irPara={irPara} />}
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="container-site flex items-center justify-between gap-3 py-3">
          <button type="button" onClick={sairSalvando} className="text-[15px] font-semibold text-ink-soft underline underline-offset-2 hover:text-ink">Sair</button>
          <div className="flex gap-2">
            {etapa > 1 && <button type="button" onClick={voltar} className="btn-contorno px-6">Voltar</button>}
            <button type="button" onClick={proximo} className="btn-primario px-7">
              {etapa < ETAPAS.length ? "Próximo" : a.status === "rascunho" ? "Enviar para aprovação" : "Salvar alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
