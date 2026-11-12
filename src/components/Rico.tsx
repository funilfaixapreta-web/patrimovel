import { Fragment } from "react";

/** Texto com **negrito** (conteúdo do blog e dos lançamentos). */
export function Rico({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}
