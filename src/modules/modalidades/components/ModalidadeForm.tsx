// ======================================================
// APUSM SaaS – Módulo Modalidades
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

const CORES_PALETA = [
  "#F44336","#E91E63","#9C27B0","#673AB7","#3F51B5","#2196F3","#03A9F4","#00BCD4",
  "#009688","#4CAF50","#8BC34A","#CDDC39","#FFEB3B","#FFC107","#FF9800","#FF5722",
  "#795548","#9E9E9E","#607D8B","#000000","#FFFFFF","#7F77DD","#1D9E75","#D85A30",
  "#D4537E","#F06292","#BA68C8","#64B5F6","#4DB6AC","#81C784","#FFD54F","#FF8A65",
];

import { useSalas } from "@/modules/salas/hooks/useSalas";

interface Props {
  valoresIniciais?: Partial<ModalidadeFormData>;
  onSubmit: (dados: ModalidadeFormData) => void;
}

export default function ModalidadeForm({ valoresIniciais, onSubmit }: Props) {
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
      icone: "🧘",
      cor: CORES_PALETA[0],
      salas: [SALAS[0]],
      ...valoresIniciais,
    },
  });

  const salasSelecionadas = watch("salas") ?? [];

  function toggleSala(sala: string) {
    const atual = new Set(salasSelecionadas);
    if (atual.has(sala)) atual.delete(sala);
    else atual.add(sala);
    setValue("salas", Array.from(atual));
  }

  const corSelecionada = watch("cor");
  const iconeSelecionado = watch("icone");
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [mostrarCores, setMostrarCores] = useState(false);
  const [hexInput, setHexInput] = useState(valoresIniciais?.cor ?? CORES_PALETA[0]);

  function aplicarHex(valor: string) {
    const hex = valor.startsWith("#") ? valor : `#${valor}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setValue("cor", hex);
      setHexInput(hex);
    }
  }

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
        {valoresIniciais ? "Editar modalidade" : "Nova modalidade"}
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
          boxSizing: "border-box",
        }}
      />
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "0 0 8px" }}>
        {errors.nome?.message}
      </p>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Salas (uma ou mais)</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "6px 0 4px" }}>
        {SALAS.map((sala) => {
          const marcada = salasSelecionadas.includes(sala);
          return (
            <label
              key={sala}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${marcada ? "var(--color-primary)" : "var(--border-default)"}`,
                background: marcada ? "var(--color-primary-light)" : "var(--background-primary)",
                cursor: "pointer",
                fontSize: 13,
                color: "var(--text-primary)",
              }}
            >
              <input type="checkbox" checked={marcada} onChange={() => toggleSala(sala)} />
              {sala}
            </label>
          );
        })}
      </div>
      <p style={{ color: "var(--color-danger)", fontSize: 12, margin: "0 0 8px" }}>
        {errors.salas?.message}
      </p>

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
            cursor: "pointer",
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
              searchPlaceholder="Buscar emoji..."
              height={450}
              width={420}
              lazyLoadEmojis
            />
          </div>
        )}
      </div>

      <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Cor</label>

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 6px" }}>
        <button
          type="button"
          onClick={() => setMostrarCores((v) => !v)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: corSelecionada,
            border: "2px solid var(--border-default)",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
          {corSelecionada}
        </span>
      </div>

      {mostrarCores && (
        <div
          style={{
            background: "var(--background-primary)",
            border: "1px solid var(--border-default)",
            borderRadius: 10,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {CORES_PALETA.map((cor) => (
              <button
                key={cor}
                type="button"
                onClick={() => {
                  setValue("cor", cor);
                  setHexInput(cor);
                }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: cor,
                  border: corSelecionada === cor
                    ? "2px solid var(--text-primary)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  outline: corSelecionada === cor ? "2px solid var(--color-primary)" : "none",
                  outlineOffset: 1,
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="color"
              value={corSelecionada}
              onChange={(e) => {
                setValue("cor", e.target.value);
                setHexInput(e.target.value);
              }}
              style={{ width: 32, height: 32, border: "none", padding: 0, cursor: "pointer", borderRadius: 4 }}
            />
            <input
              type="text"
              value={hexInput}
              maxLength={7}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={(e) => aplicarHex(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); aplicarHex(hexInput); } }}
              placeholder="#000000"
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 13,
                border: "1px solid var(--border-default)",
                borderRadius: 6,
                background: "var(--background-primary)",
                color: "var(--text-primary)",
              }}
            />
            <button
              type="button"
              onClick={() => setMostrarCores(false)}
              style={{
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 6,
                border: "1px solid var(--border-default)",
                background: "var(--background-primary)",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        style={{
          width: "100%",
          background: "var(--color-primary)",
          color: "#fff",
          padding: 10,
          borderRadius: 8,
          border: "none",
          marginTop: 8,
          cursor: "pointer",
        }}
      >
        {valoresIniciais ? "Salvar edição" : "Salvar modalidade"}
      </button>
    </form>
  );
}