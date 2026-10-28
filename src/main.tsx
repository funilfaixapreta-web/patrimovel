import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/onest";
import "./index.css";
import App from "./App";
import { carregarVitrine } from "./lib/vitrine";

// Fotos protegidas (pedido da Patrimóvel em 22/10): sem "salvar imagem" no
// botão direito e sem arrastar a foto para fora. Não impede print, mas tira
// o caminho fácil de copiar o anúncio.
const naFoto = (e: Event) => e.target instanceof HTMLImageElement && e.preventDefault();
document.addEventListener("contextmenu", naFoto);
document.addEventListener("dragstart", naFoto);

// Começa a baixar os imóveis junto com o JavaScript, antes da primeira tela pedir.
carregarVitrine().catch(() => undefined);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
