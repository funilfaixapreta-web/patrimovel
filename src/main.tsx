import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/onest";
import "./index.css";
import App from "./App";
import { carregarVitrine } from "./lib/vitrine";

// Começa a baixar os imóveis junto com o JavaScript, antes da primeira tela pedir.
carregarVitrine().catch(() => undefined);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
