import { Link } from "react-router-dom";
import { useFavoritos } from "../lib/favoritos";
import {
  custoMensal,
  ehComercial,
  formatarArea,
  formatarPreco,
  rotuloTipo,
  serveParaAlugar,
  serveParaComprar,
  tituloImovel,
  type Imovel,
  type Negocio,
} from "../lib/vitrine";
import { Icone } from "./Icone";

export function Fatos({ i, className = "" }: { i: Imovel; className?: string }) {
  const itens: { icone: string; texto: string; rotulo: string }[] = [];
  if (i.area_util_m2) itens.push({ icone: "area", texto: formatarArea(i.area_util_m2), rotulo: "Área útil" });
  if (i.quartos && !ehComercial(i)) itens.push({ icone: "cama", texto: String(i.quartos), rotulo: i.quartos === 1 ? "quarto" : "quartos" });
  if (i.banheiros) itens.push({ icone: "banho", texto: String(i.banheiros), rotulo: i.banheiros === 1 ? "banheiro" : "banheiros" });
  if (i.vagas) itens.push({ icone: "carro", texto: String(i.vagas), rotulo: i.vagas === 1 ? "vaga" : "vagas" });
  return (
    <ul className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-ink-soft ${className}`}>
      {itens.map((f) => (
        <li key={f.icone} className="num inline-flex items-center gap-1.5" title={f.rotulo}>
          <Icone nome={f.icone} className="h-[18px] w-[18px] text-ink-muted" />
          <span>{f.texto}</span>
          <span className="sr-only">{f.rotulo}</span>
        </li>
      ))}
    </ul>
  );
}

export function CardImovel({ i, negocio, prioridade = false }: { i: Imovel; negocio?: Negocio; prioridade?: boolean }) {
  const { tem, alternar } = useFavoritos();
  const favorito = tem(i.codigo);
  const modo: Negocio = negocio ?? (serveParaAlugar(i) ? "alugar" : "comprar");
  const total = modo === "alugar" ? custoMensal(i) : null;
  const tambem = modo === "alugar" ? serveParaComprar(i) : serveParaAlugar(i);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white transition-shadow hover:shadow-card">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        {i.fotos[0] ? (
          <img
            src={i.fotos[0]}
            alt={tituloImovel(i)}
            loading={prioridade ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-muted"><Icone nome="foto" className="h-8 w-8" /></div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-semibold text-ink">{rotuloTipo(i.tipo)}</span>
          {i.videos.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink/80 px-2.5 py-1 text-[12px] font-medium text-white">
              <Icone nome="play" className="h-3 w-3" preenchido /> Vídeo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => alternar(i.codigo)}
          aria-pressed={favorito}
          aria-label={favorito ? "Tirar dos favoritos" : "Salvar nos favoritos"}
          className={`absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/95 transition-colors ${favorito ? "text-brand-600" : "text-ink-soft hover:text-brand-600"}`}
        >
          <Icone nome="coracao" className="h-5 w-5" preenchido={favorito} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div>
          <h3 className="text-[17px] font-semibold leading-snug">
            <Link to={`/imovel/${i.codigo}`} className="after:absolute after:inset-0 after:content-['']">
              {tituloImovel(i)}
            </Link>
          </h3>
          <p className="mt-0.5 text-[14px] text-ink-muted">{[i.bairro, i.cidade].filter(Boolean).join(", ")}</p>
        </div>
        <Fatos i={i} />
        <div className="mt-auto border-t border-sand-200 pt-3">
          <p className="num text-[20px] font-bold text-ink">
            {formatarPreco(modo === "alugar" ? i.valor_locacao : i.valor_venda)}
            {modo === "alugar" && <span className="text-[14px] font-medium text-ink-muted"> /mês</span>}
          </p>
          {total && total !== i.valor_locacao ? (
            <p className="num text-[13.5px] text-ink-muted">Total com condomínio e IPTU: <b className="font-semibold text-ink-soft">{formatarPreco(total)}</b></p>
          ) : modo === "comprar" && (i.condominio || i.iptu) ? (
            <p className="num text-[13.5px] text-ink-muted">
              {[i.condominio && `Condomínio ${formatarPreco(i.condominio)}`, i.iptu && `IPTU ${formatarPreco(i.iptu)}`].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          {tambem && <p className="mt-1 text-[12.5px] font-medium text-brand-700">{modo === "alugar" ? "Também à venda" : "Também para alugar"}</p>}
        </div>
      </div>
    </article>
  );
}

export function CardEsqueleto() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-sand-100" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-sand-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-sand-100" />
        <div className="h-6 w-2/5 animate-pulse rounded bg-sand-100" />
      </div>
    </div>
  );
}

export function GradeImoveis({ lista, negocio, carregando, quantosEsqueletos = 6 }: { lista: Imovel[]; negocio?: Negocio; carregando?: boolean; quantosEsqueletos?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {carregando
        ? Array.from({ length: quantosEsqueletos }, (_, k) => <CardEsqueleto key={k} />)
        : lista.map((i, k) => <CardImovel key={i.codigo} i={i} negocio={negocio} prioridade={k < 3} />)}
    </div>
  );
}
