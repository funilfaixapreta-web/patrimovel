import { Link } from "react-router-dom";
import { useSeo } from "../lib/seo";

export default function NaoEncontrado({ mensagem = "Esta página não existe ou mudou de endereço." }: { mensagem?: string }) {
  useSeo("Página não encontrada");
  return (
    <div className="container-site py-20 text-center md:py-28">
      <p className="num text-[14px] font-semibold text-brand-700">404</p>
      <h1 className="mt-2 text-[30px] font-bold md:text-[40px]">Não encontramos o que você procurou</h1>
      <p className="mx-auto mt-3 max-w-lg text-[17px] text-ink-soft">{mensagem}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Link to="/alugar" className="btn-primario">Imóveis para alugar</Link>
        <Link to="/comprar" className="btn-contorno">Imóveis à venda</Link>
      </div>
    </div>
  );
}
