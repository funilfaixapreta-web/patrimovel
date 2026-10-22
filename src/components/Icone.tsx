// Ícones em SVG inline (traço 1.75), para não carregar biblioteca.
const caminhos: Record<string, JSX.Element> = {
  busca: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cama: <><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" /><path d="M3 18h18M3 21v-3M21 21v-3" /><path d="M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3M12 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" /></>,
  banho: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 3.5-1.3" /><path d="M7 19l-1 2M17 19l1 2" /></>,
  carro: <><path d="M5 16V11l2-5h10l2 5v5" /><path d="M3 16h18v3H3z" /><circle cx="7.5" cy="13" r=".5" /><circle cx="16.5" cy="13" r=".5" /></>,
  area: <><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></>,
  coracao: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  esquerda: <path d="M15 6l-6 6 6 6" />,
  direita: <path d="M9 6l6 6-6 6" />,
  baixo: <path d="M6 9l6 6 6-6" />,
  fechar: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  telefone: <path d="M6.6 3h2.6l1.5 4-2 1.3a12 12 0 0 0 6 6l1.3-2 4 1.5v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z" />,
  pino: <><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  foto: <><rect x="3" y="5" width="18" height="15" rx="2" /><circle cx="12" cy="12.5" r="3.5" /><path d="M8 5l1.5-2h5L16 5" /></>,
  calendario: <><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  filtro: <path d="M4 6h16M7 12h10M10 18h4" />,
  compartilhar: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.3 10.8 7.4-3.6M8.3 13.2l7.4 3.6" /></>,
  usuario: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  chave: <><circle cx="8" cy="14" r="4" /><path d="m11 11 8-8M16 6l2 2M14 8l2 2" /></>,
  predio: <><path d="M5 21V4h9v17M14 9h5v12" /><path d="M8 7.5h3M8 11h3M8 14.5h3M16.5 12.5h0M16.5 16h0" /></>,
  tour: <><circle cx="12" cy="12" r="8.5" /><ellipse cx="12" cy="12" rx="3.5" ry="8.5" /><path d="M3.5 12h17" /></>,
  casa: <><path d="M3.5 11 12 4l8.5 7" /><path d="M5.5 9.5V20h13V9.5" /><path d="M10 20v-5h4v5" /></>,
  loja: <><path d="M4 9h16l-1.5-5h-13L4 9Z" /><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" /><path d="M5.5 11.5V20h13v-8.5M10 20v-4.5h4V20" /></>,
  galpao: <><path d="M3 20V9l9-5 9 5v11" /><path d="M7 20v-7h10v7M7 16h10" /></>,
  rural: <><path d="M3 20h18" /><path d="M5 20V12l5-4 5 4v8" /><path d="M8.5 20v-4h3v4" /><path d="M17 20v-6M17 14c-1.5 0-2.5-1-2.5-2.5S16 9 17 8c1 1 2.5 2 2.5 3.5S18.5 14 17 14Z" /></>,
  sair: <><path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" /><path d="M10 16l-4-4 4-4M6 12h9" /></>,
  editar: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  lixo: <><path d="M4.5 7h15M9.5 7V4.5h5V7" /><path d="M6.5 7l1 13h9l1-13M10.5 11v5M13.5 11v5" /></>,
  upload: <><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></>,
  estrela: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6L12 4Z" />,
  pausa: <><path d="M9 6v12M15 6v12" /></>,
  documento: <><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" /><path d="M13.5 3.5V8h4.5M9 12.5h6M9 16h6" /></>,
  alerta: <><path d="M12 4 2.8 19.5h18.4L12 4Z" /><path d="M12 10v4.5M12 17.2v.1" /></>,
  relogio: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  mais: <path d="M12 5v14M5 12h14" />,
};

export function Icone({ nome, className = "h-5 w-5", preenchido = false }: { nome: keyof typeof caminhos | string; className?: string; preenchido?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={preenchido ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {caminhos[nome]}
    </svg>
  );
}

export function IconeWhatsApp({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" />
    </svg>
  );
}
