import { Link, NavLink, useParams } from "react-router-dom";
import { IconeWhatsApp } from "../components/Icone";
import { Rico } from "../components/Rico";
import { categorias, postPorSlug, posts, type Categoria, type Post } from "../content/blog";
import { lancamentoPorSlug } from "../content/lancamentos";
import { linkWhatsApp, rastrear } from "../lib/leads";
import { useJsonLd, useSeo } from "../lib/seo";
import NaoEncontrado from "./NaoEncontrado";

function dataLonga(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

function CardPost({ p }: { p: Post }) {
  return (
    <Link to={`/post/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200">
      <img src={p.capa} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[13px] text-ink-muted">{dataLonga(p.data)} · 2 min de leitura</p>
        <h2 className="mt-2 text-[19px] font-semibold leading-snug group-hover:text-brand-700">{p.titulo}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{p.resumo}</p>
      </div>
    </Link>
  );
}

function MenuCategorias() {
  const item = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-[14.5px] font-medium ${isActive ? "bg-ink text-white" : "border border-sand-300 hover:border-ink/40"}`;
  return (
    <nav aria-label="Categorias do blog" className="flex flex-wrap gap-2">
      <NavLink end to="/blog" className={item}>Todos os posts</NavLink>
      {categorias.map((c) => (
        <NavLink key={c.slug} to={`/blog/categories/${c.slug}`} className={item}>{c.nome}</NavLink>
      ))}
    </nav>
  );
}

export function ListaBlog() {
  const { categoria } = useParams();
  const cat = categorias.find((c) => c.slug === (categoria ?? "").normalize("NFC").toLowerCase());
  useSeo(
    cat ? `Blog · ${cat.nome}` : "Blog",
    "Lançamentos, bairros e o mercado de imóveis de alto padrão no Rio de Janeiro, pelo time da Patrimóvel ADM.",
  );
  const lista = cat ? posts.filter((p) => p.categorias.includes(cat.slug as Categoria)) : posts;
  return (
    <div className="container-site pt-10 md:pt-14">
      <p className="text-[14px] font-semibold text-brand-700">Blog</p>
      <h1 className="mt-2 text-[32px] font-bold leading-tight md:text-[44px]">{cat ? cat.nome : "Histórias de quem vive o Rio"}</h1>
      <div className="mt-6"><MenuCategorias /></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((p) => <CardPost key={p.slug} p={p} />)}
      </div>
    </div>
  );
}

export function PaginaPost() {
  const { slug = "" } = useParams();
  const p = postPorSlug(slug);
  useSeo(p ? p.titulo : "Post não encontrado", p?.resumo, p?.capa);
  useJsonLd(
    "ld-post",
    p
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: p.titulo,
          datePublished: p.data,
          image: p.capa,
          author: { "@type": "Organization", name: "Patrimóvel ADM" },
        }
      : null,
  );
  if (!p) return <NaoEncontrado endereco={`/post/${slug}`} />;
  const lanc = p.lancamento ? lancamentoPorSlug(p.lancamento) : null;
  const recentes = posts.filter((o) => o.slug !== p.slug).slice(0, 2);
  return (
    <article className="container-site pt-10 md:pt-14">
      <div className="mx-auto max-w-[760px]">
        <MenuCategorias />
        <h1 className="mt-8 text-[30px] font-bold leading-tight md:text-[42px]">{p.titulo}</h1>
        <p className="mt-3 text-[14px] text-ink-muted">Patrimóvel ADM · {dataLonga(p.data)} · 2 min de leitura</p>
        <div className="mt-8 space-y-5 text-[17.5px] leading-relaxed text-ink-soft">
          {p.blocos.map((b, i) => {
            if (b.t === "img") return <img key={i} src={b.src} alt="" loading={i < 3 ? "eager" : "lazy"} className="w-full rounded-2xl" />;
            if (b.t === "lista") {
              return (
                <ul key={i} className="list-disc space-y-1.5 pl-6">
                  {b.itens.map((t) => <li key={t}><Rico texto={t} /></li>)}
                </ul>
              );
            }
            if (b.t === "h2") return <h2 key={i} className="pt-4 text-[24px] font-bold leading-snug text-ink md:text-[28px]"><Rico texto={b.x} /></h2>;
            if (b.t === "h3") return <p key={i} className="text-[21px] font-medium leading-snug text-ink"><Rico texto={b.x} /></p>;
            if (b.t === "cita") return <blockquote key={i} className="border-l-4 border-brand-600 pl-5 text-[19px] italic text-ink"><Rico texto={b.x} /></blockquote>;
            return <p key={i}><Rico texto={b.x} /></p>;
          })}
        </div>
        <div className="mt-10 flex flex-wrap gap-3 rounded-2xl bg-sand-50 p-6">
          <p className="w-full text-[18px] font-semibold">Fale com o nosso time</p>
          {lanc && <Link to={`/${lanc.slug}`} className="btn-escuro">Conheça o {lanc.nome}</Link>}
          <a
            href={linkWhatsApp(`Olá! Li no blog da Patrimóvel ADM sobre "${p.titulo}" e quero saber mais.`)}
            target="_blank"
            rel="noopener"
            onClick={() => rastrear("whatsapp_click", { local: "blog", post: p.slug })}
            className="btn-whats"
          >
            <IconeWhatsApp className="h-5 w-5" /> Chamar no WhatsApp
          </a>
        </div>
        <div className="mt-14">
          <div className="flex items-end justify-between">
            <h2 className="text-[22px] font-bold">Posts recentes</h2>
            <Link to="/blog" className="text-[15px] font-semibold text-brand-700 hover:underline">Ver tudo</Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {recentes.map((o) => <CardPost key={o.slug} p={o} />)}
          </div>
        </div>
      </div>
    </article>
  );
}
