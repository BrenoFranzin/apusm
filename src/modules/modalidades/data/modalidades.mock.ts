// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidades.mock.ts
// ======================================================

import type { Modalidade } from "../types/modalidade.types";

export const modalidadesMock: Modalidade[] = [
  { id: "1",  nome: "Pilates Solo",     icone: "🧘",  cor: "#7F77DD", sala: "Sala 1", instrutoresIds: [] },
  { id: "2",  nome: "Yoga",             icone: "🧘‍♀️", cor: "#1D9E75", sala: "Sala 1", instrutoresIds: [] },
  { id: "3",  nome: "Alongamento",      icone: "🤸",  cor: "#378ADD", sala: "Sala 1", instrutoresIds: [] },
  { id: "4",  nome: "Bike",             icone: "🚴",  cor: "#D85A30", sala: "Sala 5", instrutoresIds: [] },
  { id: "5",  nome: "Hit Dance",       icone: "💃",  cor: "#D4537E", sala: "Sala 3", instrutoresIds: [] },
  { id: "6",  nome: "Musicalização",    icone: "🎵",  cor: "#639922", sala: "Sala 2", instrutoresIds: [] },
  { id: "7",  nome: "Ritmos",           icone: "🕺",  cor: "#9333EA", sala: "Sala 3", instrutoresIds: [] },
  { id: "8",  nome: "Jump",             icone: "🏃",  cor: "#534AB7", sala: "Sala 2", instrutoresIds: [] },
  { id: "9",  nome: "Funcional",        icone: "🏋️",  cor: "#BA7517", sala: "Sala 2", instrutoresIds: [] },
  { id: "10", nome: "Dança de Salão",   icone: "💃",  cor: "#A32D2D", sala: "Sala 3", instrutoresIds: [] },
  { id: "11", nome: "Jiu-Jitsu",        icone: "🥋",  cor: "#2C2C2A", sala: "Sala 2", instrutoresIds: [] },
];