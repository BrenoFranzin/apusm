// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: instrutores.mock.ts
// ======================================================

import type { Instrutor } from "../types/instrutor.types";

export const instrutoresMock: Instrutor[] = [
  { id: "1",  nome: "Rochester", cor: "#444441", especialidades: ["Coordenador"],         terceirizado: false },
  { id: "2",  nome: "Rafaela",   cor: "#185fa5", especialidades: ["Pilates"],             terceirizado: false },
  { id: "3",  nome: "Eduardo",   cor: "#BA7517", especialidades: ["Coordenador Adjunto"], terceirizado: false },
  { id: "4",  nome: "Bia",       cor: "#993556", especialidades: ["Alongamento"],         terceirizado: false },
  { id: "5",  nome: "Carol",     cor: "#D4537E", especialidades: ["Dança Ritmos"],        terceirizado: false },
  { id: "6",  nome: "Josi",      cor: "#378ADD", especialidades: ["Pilates"],             terceirizado: false },
  { id: "7",  nome: "Leonardo",  cor: "#5F5E5A", especialidades: ["Funcional"],           terceirizado: false },
  { id: "8",  nome: "Liriana",   cor: "#534AB7", especialidades: ["Yoga"],                terceirizado: true  },
  { id: "9",  nome: "Ticiana",   cor: "#854F0B", especialidades: ["Yoga"],                terceirizado: true  },
  { id: "10", nome: "Manu",      cor: "#085041", especialidades: ["Bike", "Hit Dance"],   terceirizado: true  },
  { id: "11", nome: "Jane",      cor: "#639922", especialidades: ["Musicalização"],       terceirizado: true  },
  { id: "12", nome: "Marion",    cor: "#A32D2D", especialidades: ["Dança de Salão"],      terceirizado: true  },
  { id: "13", nome: "Mauren",    cor: "#7F77DD", especialidades: [],                      terceirizado: false },
  { id: "14", nome: "João",      cor: "#412402", especialidades: ["Jiu-Jitsu"],           terceirizado: true  },
];
