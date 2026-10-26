import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { destinoDaListaAntiga } from "./lib/rotasAntigas";
import Home from "./pages/Home";

const Busca = lazy(() => import("./pages/Busca"));
const Imovel = lazy(() => import("./pages/Imovel"));
const Administracao = lazy(() => import("./pages/Administracao"));
const Vender = lazy(() => import("./pages/Vender"));
const ListaBairros = lazy(() => import("./pages/Bairros").then((m) => ({ default: m.ListaBairros })));
const PaginaBairro = lazy(() => import("./pages/Bairros").then((m) => ({ default: m.PaginaBairro })));
const Contato = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.Contato })));
const Sobre = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.Sobre })));
const AreaDoCliente = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.AreaDoCliente })));
const Favoritos = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.Favoritos })));
const Privacidade = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.Privacidade })));
const TermosDeUso = lazy(() => import("./pages/Institucionais").then((m) => ({ default: m.TermosDeUso })));
const NaoEncontrado = lazy(() => import("./pages/NaoEncontrado"));
// Protótipo da conta do anunciante
const Entrar = lazy(() => import("./pages/conta/Entrar"));
const ContaLayout = lazy(() => import("./pages/conta/ContaLayout"));
const Perfil = lazy(() => import("./pages/conta/Perfil"));
const MeusImoveis = lazy(() => import("./pages/conta/MeusImoveis"));
const Termos = lazy(() => import("./pages/conta/Termos"));
const Anunciar = lazy(() => import("./pages/anunciar/Anunciar"));

function Carregar({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="container-site min-h-[60vh] pt-10" aria-busy="true" />}>{children}</Suspense>;
}

/** URLs antigas da Arbo: /imovel/{tipo}/{negocio}/{cidade}/{uf}/{bairro}/{CODIGO} */
function ImovelAntigo() {
  const { "*": resto = "" } = useParams();
  const codigo = resto.split("/").filter(Boolean).pop() ?? "";
  return <Navigate to={`/imovel/${codigo}`} replace />;
}

/** Listagens antigas da Arbo: /imoveis/[para-alugar|a-venda]/[tipo]/{bairro-cidade-uf} */
function ListaAntiga() {
  const { "*": resto = "" } = useParams();
  return <Navigate to={destinoDaListaAntiga(resto)} replace />;
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/alugar", element: <Carregar><Busca key="alugar" negocio="alugar" /></Carregar> },
      { path: "/alugar/:bairro", element: <Carregar><Busca key="alugar" negocio="alugar" /></Carregar> },
      { path: "/comprar", element: <Carregar><Busca key="comprar" negocio="comprar" /></Carregar> },
      { path: "/comprar/:bairro", element: <Carregar><Busca key="comprar" negocio="comprar" /></Carregar> },
      { path: "/imovel/:codigo", element: <Carregar><Imovel /></Carregar> },
      { path: "/imovel/*", element: <ImovelAntigo /> },
      { path: "/imoveis/*", element: <ListaAntiga /> },
      { path: "/anunciar-imovel", element: <Navigate to="/anunciar" replace /> },
      { path: "/conheca/*", element: <Navigate to="/sobre" replace /> },
      { path: "/administracao", element: <Carregar><Administracao /></Carregar> },
      { path: "/vender", element: <Carregar><Vender /></Carregar> },
      { path: "/bairros", element: <Carregar><ListaBairros /></Carregar> },
      { path: "/bairros/:bairro", element: <Carregar><PaginaBairro /></Carregar> },
      { path: "/contato", element: <Carregar><Contato /></Carregar> },
      { path: "/fale-conosco", element: <Navigate to="/contato" replace /> },
      { path: "/sobre", element: <Carregar><Sobre /></Carregar> },
      { path: "/area-do-cliente", element: <Carregar><AreaDoCliente /></Carregar> },
      { path: "/favoritos", element: <Carregar><Favoritos /></Carregar> },
      { path: "/privacidade", element: <Carregar><Privacidade /></Carregar> },
      { path: "/termos-de-uso", element: <Carregar><TermosDeUso /></Carregar> },
      { path: "/entrar", element: <Carregar><Entrar /></Carregar> },
      {
        path: "/conta",
        element: <Carregar><ContaLayout /></Carregar>,
        children: [
          { index: true, element: <Navigate to="/conta/imoveis" replace /> },
          { path: "perfil", element: <Carregar><Perfil /></Carregar> },
          { path: "imoveis", element: <Carregar><MeusImoveis /></Carregar> },
          { path: "termos", element: <Carregar><Termos /></Carregar> },
        ],
      },
      { path: "/cadastre-seu-imovel", element: <Navigate to="/anunciar" replace /> },
      { path: "*", element: <Carregar><NaoEncontrado /></Carregar> },
    ],
  },
  // Cadastro do imóvel em tela cheia, sem o cabeçalho do site.
  { path: "/anunciar/:id?", element: <Carregar><Anunciar /></Carregar> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
