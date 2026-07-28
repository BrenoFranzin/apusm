// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: modalidade.schema.ts
// ======================================================

import { z } from "zod";

export const modalidadeSchema = z.object({
  nome: z.string().min(2, "Informe o nome da modalidade").max(80),
  icone: z.string().min(1, "Escolha um ícone"),
  cor: z.string().min(4, "Escolha uma cor"),
  sala: z.string().min(1, "Selecione a sala"),
});

export type ModalidadeFormData = z.infer<typeof modalidadeSchema>;
