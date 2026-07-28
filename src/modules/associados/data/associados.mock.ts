// ======================================================
// APUSM SaaS — Módulo Associados
// Arquivo: associados.mock.ts
// Dados falsos no novo padrão (nome + telefone)
// ======================================================

import type { Associado } from "../types/associado.types";
import { StatusAssociado } from "../types/associado.types";

export const associadosMock: Associado[] = [
  {
    id: "1",
    nome: "João Silva",
    telefone: "55999999999",
    status: StatusAssociado.ATIVO,
    dataCadastro: "2026-07-22",
    matriculas: [],
    frequencias: [],
    pagamentos: [],
    historico: [],
  },
  {
    id: "2",
    nome: "Maria Oliveira",
    telefone: "55988888888",
    status: StatusAssociado.PENDENTE,
    dataCadastro: "2026-06-10",
    matriculas: [],
    frequencias: [],
    pagamentos: [],
    historico: [],
  },
  {
    id: "3",
    nome: "Carlos Souza",
    telefone: "55977777777",
    status: StatusAssociado.INATIVO,
    dataCadastro: "2026-03-01",
    matriculas: [],
    frequencias: [],
    pagamentos: [],
    historico: [],
  },
];