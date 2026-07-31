// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutores.mock.ts
// ======================================================

import type { Instrutor } from "../types/instrutor.types";

export const instrutoresMock: Instrutor[] = [
  { id: "1",  nome: "Rochester", cor: "#444441", especialidades: ["Coordenador"],         terceirizado: false },
  { id: "2",  nome: "Rafaela",   cor: "#185fa5", especialidades: ["Pilates"],             terceirizado: false },
  { id: "3",  nome: "Eduardo",   cor: "#BA7517", especialidade: "Coordenador Adjunto", terceirizado: false },
  { id: "4",  nome: "Bia",       cor: "#993556", especialidade: "Alongamento",         terceirizado: false },
  { id: "5",  nome: "Carol",     cor: "#D4537E", especialidade: "Dança Ritmos",        terceirizado: false },
  { id: "6",  nome: "Josi",      cor: "#378ADD", especialidade: "Pilates",             terceirizado: false },
  { id: "7",  nome: "Leonardo",  cor: "#5F5E5A", especialidade: "Funcional",           terceirizado: false },
  { id: "8",  nome: "Liriana",   cor: "#534AB7", especialidade: "Yoga",                terceirizado: false },
  { id: "9",  nome: "Ticiana",   cor: "#854F0B", especialidade: "Yoga",                terceirizado: false },
  { id: "10", nome: "Manu",      cor: "#085041", especialidade: "Bike/HIIT",           terceirizado: false },
  { id: "11", nome: "Jane",      cor: "#639922", especialidade: "Musicalização",       terceirizado: false },
  { id: "12", nome: "Marion",    cor: "#A32D2D", especialidade: "Dança de Salão",      terceirizado: false },
  { id: "13", nome: "Mauren",    cor: "#7F77DD", especialidade: "",                    terceirizado: false },
  { id: "14", nome: "João",      cor: "#412402", especialidade: "Jiu-Jitsu",           terceirizado: true  },
];