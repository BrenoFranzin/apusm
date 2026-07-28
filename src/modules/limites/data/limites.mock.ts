// ======================================================
// APUSM SaaS — Módulo Limites
// Arquivo: limites.mock.ts
// ======================================================

import type { ConfiguracaoLimites } from "../types/limite.types";

export const limitesMock: ConfiguracaoLimites = {
  limitePadrao: 2,
  excecoes: [
    { modalidadeId: "4", modalidadeNome: "Bike", limiteTurmas: 1 },
    { modalidadeId: "11", modalidadeNome: "Jiu-Jitsu", limiteTurmas: 1 },
  ],
};