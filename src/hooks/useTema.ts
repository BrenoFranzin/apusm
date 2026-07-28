// ======================================================
// APUSM SaaS — Tema claro/escuro
// ======================================================

import { useEffect, useState } from "react";

const CHAVE = "apusm:tema";

export function useTema() {
  const [escuro, setEscuro] = useState<boolean>(() => {
    return localStorage.getItem(CHAVE) === "escuro";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", escuro);
    localStorage.setItem(CHAVE, escuro ? "escuro" : "claro");
  }, [escuro]);

  return { escuro, alternar: () => setEscuro((v) => !v) };
}