import { z } from "zod";

export const instrutorSchema = z.object({
  nome: z.string().min(2, "Informe o nome do instrutor").max(80),
  cor: z.string().min(4, "Escolha uma cor"),
  icone: z.string().optional().transform((v) => v ?? "🧑‍🏫"),
  especialidade: z.string().optional().transform((v) => v ?? ""),
  terceirizado: z.boolean(),
});

export type InstrutorFormData = z.infer<typeof instrutorSchema>;