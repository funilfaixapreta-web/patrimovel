import { Link, NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { AvisoPrototipo } from "../../components/Campos";
import { Icone } from "../../components/Icone";
import { iniciais, situacaoTermo, useAnuncios, useConta } from "../../lib/conta";

export default function ContaLayout() {
  const usuario = useConta();
  const local = useLocation();
  const anuncios = useAnuncios(usuario?.id);
  if (!usuario) return <Navigate to={`/entrar?volta=${encodeURIComponent(local.pathname + local.search)}`} replace />;

  const pendentesTermo = anuncios.filter((a) => a.status !== "rascunho" && ["vencendo", "vencido", "pendente"].includes(situacaoTermo(a).situacao)).length;
  const link = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-sand-100 hover:text-ink"}`;
  const params = new URLSearchParams(local.search);
  const negocio = params.get("negocio");

  return (
    <div className="container-site pt-8 md:pt-10">
      <AvisoPrototipo className="mb-6" />
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-[96px] lg:self-start">
          <div className="flex items-center gap-3 rounded-2xl border border-sand-200 p-4 lg:flex-col lg:p-6 lg:text-center">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-[17px] font-semibold text-white lg:h-16 lg:w-16 lg:text-[22px]">{iniciais(usuario.nome)}</span>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-semibold">{usuario.nome}</p>
              <p className="truncate text-[13.5px] text-ink-muted">{usuario.email}</p>
            </div>
          </div>
          <nav aria-label="Minha conta" className="mt-3 overflow-x-auto lg:overflow-visible">
            <ul className="flex gap-1 whitespace-nowrap lg:flex-col lg:whitespace-normal">
              <li><NavLink to="/conta/perfil" className={link}><Icone nome="usuario" className="h-[18px] w-[18px]" /> Meu perfil</NavLink></li>
              <li>
                <NavLink to="/conta/imoveis" className={link}><Icone nome="casa" className="h-[18px] w-[18px]" /> Meus imóveis</NavLink>
                {local.pathname === "/conta/imoveis" && (
                  <ul className="ml-9 hidden gap-0.5 py-1 lg:grid">
                    {[["", "Todos"], ["alugar", "Para alugar"], ["vender", "Para vender"]].map(([v, r]) => (
                      <li key={v}>
                        <Link to={v ? `/conta/imoveis?negocio=${v}` : "/conta/imoveis"} className={`block rounded-lg px-3 py-1.5 text-[14px] ${(negocio ?? "") === v ? "font-semibold text-brand-700" : "text-ink-muted hover:text-ink"}`}>{r}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              <li><NavLink to="/favoritos" className={link}><Icone nome="coracao" className="h-[18px] w-[18px]" /> Meus favoritos</NavLink></li>
              <li>
                <NavLink to="/conta/termos" className={link}>
                  <Icone nome="documento" className="h-[18px] w-[18px]" /> Aceite de termos e renovação
                  {pendentesTermo > 0 && <span className="num ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1.5 text-[11.5px] font-semibold text-white">{pendentesTermo}</span>}
                </NavLink>
              </li>
            </ul>
          </nav>
          <Link to="/anunciar" className="btn-primario mt-4 hidden w-full lg:inline-flex"><Icone nome="mais" className="h-[18px] w-[18px]" /> Anunciar imóvel</Link>
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
