// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutorForm.tsx
// ======================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  instrutorSchema,
  type InstrutorFormData,
} from "../schemas/instrutor.schema";

const CORES = [
  "#185fa5", "#f97316", "#993556", "#ec4899", "#0ea5e9",
  "#64748b", "#7c3aed", "#d97706", "#0f6e56", "#84cc16",
  "#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#9333ea",
  "#0891b2", "#e11d48", "#65a30d", "#4b5563", "#0f172a",
  "#f43f5e", "#14b8a6", "#a855f7", "#eab308", "#059669",
];

interface Props {
  onSubmit: (dados: InstrutorFormData) => void;
}

export default function InstrutorForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InstrutorFormData>({
    resolver: zodResolver(instrutorSchema) as any,
    defaultValues: {
      nome: "",
      cor: CORES[0],
      especialidade: "",
      terceirizado: false,
    },
  });

  const corSelecionada = watch("cor");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        maxWidth: 420,
        color: "var(--text-primary)",
      }}
    >
      <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px", color: "var(--text-primary)" }}>
        Novo instrutor
      </p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Nome</label>
      <input
        placeholder="Ex.: Maria Silva"
        {...register("nome")}
        style={{
          width: "100%",
          margin: "4px 0 4px",
          padding: 8,
          background: "var(--background-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 6,
        }}
      />
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "0 0 8px" }}>
        {errors.nome?.message}
      </p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Especialidade</label>
      <input
        placeholder="Ex.: Pilates"
        {...register("especialidade")}
        style={{
          width: "100%",
          margin: "4px 0 12px",
          padding: 8,
          background: "var(--background-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 6,
        }}
      />

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cor</label>
      <div style={{ display: "flex", gap: 8, margin: "6px 0 14px", flexWrap: "wrap" }}>
        {CORES.map((cor) => (
          <button
            key={cor}
            type="button"
            onClick={() => setValue("cor", cor)}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: cor,
              border:
                corSelecionada === cor
                  ? "2px solid var(--text-primary)"
                  : "2px solid transparent",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 14, color: "var(--text-primary)" }}>
        <input type="checkbox" {...register("terceirizado")} />
        Terceirizado (só dá aula, sem plantão)
      </label>

      <button
        type="submit"
        style={{
          width: "100%",
          background: "var(--color-primary)",
          color: "#fff",
          padding: 10,
          borderRadius: 8,
          border: "none",
        }}
      >
        Salvar instrutor
      </button>
    </form>
  );
}
