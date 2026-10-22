import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { empresa, gtmId } from "../config";
import { iniciais, sair, useConta } from "../lib/conta";
import { linkWhatsApp, rastrear } from "../lib/leads";
import { useFavoritos } from "../lib/favoritos";
import { Icone, IconeWhatsApp } from "./Icone";

const NAV = [
  { to: "/alugar", rotulo: "Alugar" },
  { to: "/comprar", rotulo: "Comprar" },
  { to: "/administracao", rotulo: "Administração" },
  { to: "/vender", rotulo: "Vender" },
  { to: "/bairros", rotulo: "Bairros" },
  { to: "/contato", rotulo: "Contato" },
];

export function Logo({ branco = false, className = "h-9 w-auto md:h-10" }: { branco?: boolean; className?: string }) {
  return (
    <img
      src={branco ? "/img/logo-patrimovel-adm-branco.webp" : "/img/logo-patrimovel-adm-preto.webp"}
      alt="Patrimóvel Administradora"
      width={523}
      height={96}
      className={className}
    />
  );
}

/** Verdadeiro enquanto o topo da página ainda está sobre o hero da home. */
function useSobreHero(ativo: boolean) {
  const [sobre, setSobre] = useState(ativo);
  useEffect(() => {
    if (!ativo) return setSobre(false);
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const hero = document.getElementById("hero");
      const limite = (hero?.offsetHeight ?? window.innerHeight) - 72;
      setSobre(window.scrollY < limite);
    };
    const aoRolar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    medir();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      cancelAnimationFrame(quadro);
    };
  }, [ativo]);
  return sobre;
}

function MenuUsuario({ claro = false }: { claro?: boolean }) {
  const usuario = useConta();
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const local = useLocation();
  const navegar = useNavigate();
  useEffect(() => setAberto(false), [local.pathname]);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", tecla);
    };
  }, [aberto]);

  if (!usuario) {
    return (
      <Link to="/entrar" className={`hidden py-2.5 sm:inline-flex ${claro ? "btn bg-white text-ink hover:bg-white/90" : "btn-escuro"}`}>
        <Icone nome="usuario" className="h-[18px] w-[18px]" /> Entrar
      </Link>
    );
  }
  const item = "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] text-ink-soft hover:bg-sand-100 hover:text-ink";
  return (
    <div ref={caixa} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className={`flex items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 transition-colors ${claro ? "border-white/40 text-white hover:border-white/80" : "border-ink/15 hover:border-ink/40"}`}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white">{iniciais(usuario.nome)}</span>
        <Icone nome="baixo" className={`h-4 w-4 transition-transform ${aberto ? "rotate-180" : ""}`} />
        <span className="sr-only">Menu da conta</span>
      </button>
      {aberto && (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-2xl border border-sand-200 bg-white p-2 shadow-float">
          <div className="border-b border-sand-200 px-3 pb-3 pt-2">
            <p className="truncate text-[15px] font-semibold">{usuario.nome}</p>
            <p className="truncate text-[13px] text-ink-muted">{usuario.email}</p>
          </div>
          <div className="grid py-1">
            <Link role="menuitem" to="/conta/perfil" className={item}><Icone nome="usuario" className="h-[18px] w-[18px]" /> Meu perfil</Link>
            <Link role="menuitem" to="/conta/imoveis" className={item}><Icone nome="casa" className="h-[18px] w-[18px]" /> Imóveis anunciados</Link>
            <Link role="menuitem" to="/conta/termos" className={item}><Icone nome="documento" className="h-[18px] w-[18px]" /> Aceite de termos e renovação</Link>
          </div>
          <div className="grid border-t border-sand-200 pt-1">
            <Link role="menuitem" to="/favoritos" className={item}><Icone nome="coracao" className="h-[18px] w-[18px]" /> Imóveis curtidos</Link>
            <Link role="menuitem" to="/area-do-cliente" className={item}><Icone nome="chave" className="h-[18px] w-[18px]" /> Área do cliente</Link>
            <button role="menuitem" type="button" onClick={() => { sair(); navegar("/"); }} className={item}><Icone nome="sair" className="h-[18px] w-[18px]" /> Sair</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const usuario = useConta();
  const { lista } = useFavoritos();
  const local = useLocation();
  useEffect(() => setAberto(false), [local.pathname]);
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
  }, [aberto]);
  // Na home o cabeçalho fica por cima da foto, transparente, e ganha fundo branco ao passar dela.
  const home = local.pathname === "/";
  const claro = useSobreHero(home);

  return (
    <header
      className={`z-40 border-b transition-colors duration-300 ${home ? "fixed inset-x-0" : "sticky"} ${claro ? "border-transparent bg-transparent" : "border-sand-200 bg-white/95 backdrop-blur"}`}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="container-site flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label="Patrimóvel Administradora, página inicial" className="shrink-0">
          <Logo branco={claro} />
        </Link>
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  className={({ isActive }) =>
                    `rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors ${
                      claro ? "text-white/90 [text-shadow:0_1px_8px_rgba(0,0,0,.3)] hover:text-white" : isActive ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:text-ink"
                    }`
                  }
                >
                  {n.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/favoritos" className={`relative grid h-11 w-11 place-items-center rounded-full ${claro ? "text-white hover:bg-white/10" : "text-ink-soft hover:bg-sand-100"}`} aria-label={`Favoritos (${lista.length})`}>
            <Icone nome="coracao" className="h-[22px] w-[22px]" />
            {lista.length > 0 && (
              <span className="num absolute right-1 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white">{lista.length}</span>
            )}
          </Link>
          <Link to="/anunciar" className={`hidden py-2.5 xl:inline-flex ${claro ? "btn border border-white/60 text-white hover:bg-white/10" : "btn-contorno"}`}>Anuncie seu imóvel</Link>
          <MenuUsuario claro={claro} />
          <button className={`grid h-11 w-11 place-items-center rounded-full lg:hidden ${claro ? "text-white hover:bg-white/10" : "hover:bg-sand-100"}`} aria-label="Abrir menu" aria-expanded={aberto} onClick={() => setAberto(true)}>
            <Icone nome="menu" className="h-6 w-6" />
          </button>
        </div>
      </div>

      {aberto && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-ink/40" aria-label="Fechar menu" onClick={() => setAberto(false)} />
          <div
            className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col bg-white shadow-float"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
          >
            <div className="flex h-[72px] items-center justify-between px-5">
              <Logo className="h-8 w-auto" />
              <button className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-100" aria-label="Fechar menu" onClick={() => setAberto(false)}>
                <Icone nome="fechar" className="h-6 w-6" />
              </button>
            </div>
            <nav aria-label="Menu do celular" className="flex-1 overflow-y-auto px-3">
              <ul>
                {NAV.map((n) => (
                  <li key={n.to}>
                    <NavLink to={n.to} className={({ isActive }) => `block rounded-xl px-3 py-3.5 text-[17px] font-medium ${isActive ? "bg-brand-50 text-brand-700" : "text-ink"}`}>
                      {n.rotulo}
                    </NavLink>
                  </li>
                ))}
                <li>
                  <NavLink to="/sobre" className="block rounded-xl px-3 py-3.5 text-[17px] font-medium text-ink">Sobre a Patrimóvel ADM</NavLink>
                </li>
              </ul>
            </nav>
            <div className="grid gap-3 border-t border-sand-200 p-5">
              {usuario ? (
                <div className="grid gap-1 pb-2">
                  <p className="px-1 text-[13px] text-ink-muted">Conectado como {usuario.nome.split(" ")[0]}</p>
                  <Link to="/conta/perfil" className="rounded-lg px-1 py-1.5 text-[15px] font-medium">Meu perfil</Link>
                  <Link to="/conta/imoveis" className="rounded-lg px-1 py-1.5 text-[15px] font-medium">Imóveis anunciados</Link>
                  <Link to="/conta/termos" className="rounded-lg px-1 py-1.5 text-[15px] font-medium">Aceite de termos e renovação</Link>
                  <button type="button" onClick={sair} className="rounded-lg px-1 py-1.5 text-left text-[15px] font-medium text-ink-muted">Sair</button>
                </div>
              ) : (
                <Link to="/entrar" className="btn-escuro w-full">Entrar ou criar conta</Link>
              )}
              <Link to="/anunciar" className="btn-contorno w-full">Anuncie seu imóvel</Link>
              <Link to="/area-do-cliente" className="btn-contorno w-full">Área do cliente</Link>
              <a href={linkWhatsApp("Olá! Vim pelo site da Patrimóvel ADM.")} target="_blank" rel="noopener" className="btn-whats w-full" onClick={() => rastrear("whatsapp_click", { local: "menu" })}>
                <IconeWhatsApp /> {empresa.whatsappTexto}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Rodape() {
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-site grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo branco className="h-9 w-auto" />
          <p className="max-w-xs text-[15px] leading-relaxed">
            Locação, venda e administração de imóveis no Rio de Janeiro. Empresa do Grupo Patrimóvel.
          </p>
          <p className="text-[13px] text-white/60">CRECI {empresa.creci}</p>
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white">Imóveis</h2>
          <ul className="space-y-2.5 text-[15px]">
            <li><Link className="hover:text-white" to="/alugar">Para alugar</Link></li>
            <li><Link className="hover:text-white" to="/comprar">À venda</Link></li>
            <li><Link className="hover:text-white" to="/alugar?grupo=comercial">Salas e andares corporativos</Link></li>
            <li><Link className="hover:text-white" to="/bairros">Bairros</Link></li>
            <li><Link className="hover:text-white" to="/favoritos">Favoritos</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white">Proprietário</h2>
          <ul className="space-y-2.5 text-[15px]">
            <li><Link className="hover:text-white" to="/administracao">Administração de imóveis</Link></li>
            <li><Link className="hover:text-white" to="/administracao#troca">Trocar de administradora</Link></li>
            <li><Link className="hover:text-white" to="/vender">Vender meu imóvel</Link></li>
            <li><Link className="hover:text-white" to="/anunciar">Anunciar imóvel online</Link></li>
            <li><Link className="hover:text-white" to="/area-do-cliente">Área do cliente</Link></li>
            <li><Link className="hover:text-white" to="/sobre">Sobre nós</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white">Atendimento</h2>
          <ul className="space-y-2.5 text-[15px]">
            <li>
              <a className="hover:text-white" href={linkWhatsApp("Olá! Vim pelo site da Patrimóvel ADM.")} target="_blank" rel="noopener" onClick={() => rastrear("whatsapp_click", { local: "rodape" })}>
                WhatsApp {empresa.whatsappTexto}
              </a>
            </li>
            <li>
              <a className="hover:text-white" href={`tel:${empresa.telefoneLink}`} onClick={() => rastrear("phone_click", { local: "rodape" })}>
                Telefone {empresa.telefone}
              </a>
            </li>
            <li className="break-words">{empresa.email}</li>
            <li>{empresa.endereco}<br />{empresa.bairroCidade}</li>
            <li className="text-white/60">{empresa.horario}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-site flex flex-col gap-3 py-6 text-[13px] text-white/60 md:flex-row md:items-center md:justify-between" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}>
          <p>© {new Date().getFullYear()} {empresa.nome}. Todos os direitos reservados.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link className="hover:text-white" to="/termos-de-uso">Termos de uso</Link>
            <Link className="hover:text-white" to="/privacidade">Política de privacidade</Link>
            {empresa.redes.map((r) => (
              <a key={r.nome} className="hover:text-white" href={r.url} target="_blank" rel="noopener">{r.nome}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function BotaoWhatsFlutuante() {
  const local = useLocation();
  // Na ficha do imóvel o celular já tem a barra fixa com WhatsApp.
  if (local.pathname.startsWith("/imovel/")) return null;
  return (
    <a
      href={linkWhatsApp("Olá! Vim pelo site da Patrimóvel ADM.")}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      onClick={() => rastrear("whatsapp_click", { local: "flutuante" })}
      className="fixed z-30 grid h-14 w-14 place-items-center rounded-full bg-[#1f8f4e] text-white shadow-float transition-transform hover:scale-105"
      style={{ right: "calc(1rem + env(safe-area-inset-right, 0px))", bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <IconeWhatsApp className="h-7 w-7" />
    </a>
  );
}

const CHAVE_COOKIES = "padm:cookies";

function carregarGtm() {
  if (!gtmId || document.getElementById("gtm-script")) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  document.head.appendChild(s);
}

function AvisoCookies() {
  const [decidido, setDecidido] = useState(() => {
    try {
      return localStorage.getItem(CHAVE_COOKIES);
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (decidido === "aceito") carregarGtm();
  }, [decidido]);
  if (!gtmId || decidido) return null;
  const decidir = (v: string) => {
    try {
      localStorage.setItem(CHAVE_COOKIES, v);
    } catch {
      /* sem armazenamento */
    }
    setDecidido(v);
  };
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="container-site flex flex-col gap-3 py-4 text-[14px] md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-ink-soft">
          Usamos cookies para medir as visitas e melhorar os anúncios. Veja a <Link to="/privacidade" className="underline">política de privacidade</Link>.
        </p>
        <div className="flex gap-2">
          <button className="btn-contorno py-2.5" onClick={() => decidir("recusado")}>Recusar</button>
          <button className="btn-escuro py-2.5" onClick={() => decidir("aceito")}>Aceitar</button>
        </div>
      </div>
    </div>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    rastrear("page_view_spa", { page_path: pathname });
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <Rodape />
      <BotaoWhatsFlutuante />
      <AvisoCookies />
    </div>
  );
}
