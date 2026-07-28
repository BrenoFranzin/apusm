// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: ModalidadeForm.tsx
// ======================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

import {
  modalidadeSchema,
  type ModalidadeFormData,
} from "../schemas/modalidade.schema";

const CORES = ["#7F77DD", "#1D9E75", "#D85A30", "#D4537E"];
const SALAS = ["Sala 1", "Sala 2", "Sala 3", "Sala 4", "Sala 5"];

interface Props {
  onSubmit: (dados: ModalidadeFormData) => void;
}

export default function ModalidadeForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ModalidadeFormData>({
    resolver: zodResolver(modalidadeSchema) as any,
    defaultValues: {
      nome: "",
      icone: ICONES[0],
      cor: CORES[0],
      sala: SALAS[0],
    },
  });

  const corSelecionada = watch("cor");
  const iconeSelecionado = watch("icone");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);

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
        Nova modalidade
      </p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Nome</label>
      <input
        placeholder="Ex.: Jiu-jitsu"
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

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Sala (obrigatório)</label>
      <select
        {...register("sala")}
        style={{
          width: "100%",
          margin: "4px 0 12px",
          padding: 8,
          background: "var(--background-primary)",
          color: "var(--text-primary)",
          border: "1px solid var(--border-default)",
          borderRadius: 6,
        }}
      >
        {SALAS.map((sala) => (
          <option key={sala} value={sala}>
            {sala}
          </option>
        ))}
      </select>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Ícone</label>
      <div style={{ margin: "6px 0 12px", position: "relative" }}>
        <button
          type="button"
          onClick={() => setMostrarEmojis((v) => !v)}
          style={{
            fontSize: 24,
            padding: 8,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--background-primary)",
          }}
        >
          {iconeSelecionado || "🧘"}
        </button>

        {mostrarEmojis && (
          <div style={{ position: "absolute", zIndex: 50, marginTop: 4 }}>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setValue("icone", emojiData.emoji);
                setMostrarEmojis(false);
              }}
            />
          </div>
        )}
      </div>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cor</label>
      <div style={{ display: "flex", gap: 8, margin: "6px 0 14px" }}>
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
        Salvar modalidade
      </button>
    </form>
  );
}