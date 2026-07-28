// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutorCard.tsx
// ======================================================

import type { Instrutor } from "../types/instrutor.types";

interface Props {
  instrutor: Instrutor;
  onExcluir?: (id: string) => void;
}

export function InstrutorCard({ instrutor, onExcluir }: Props) {
  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: instrutor.cor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {instrutor.nome.slice(0, 2).toUpperCase()}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>
          {instrutor.nome}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
          {instrutor.especialidade || "—"}
          {instrutor.terceirizado ? " · Terceirizado" : ""}
        </p>
      </div>

      {onExcluir && (
        <button
          onClick={() => {
            const confirmar = window.confirm(
              `Excluir o instrutor "${instrutor.nome}"? Essa ação não pode ser desfeita.`
            );
            if (confirmar) onExcluir(instrutor.id);
          }}
          style={{
            fontSize: 12,
            color: "var(--color-danger)",
            border: "1px solid var(--color-danger)",
            borderRadius: 6,
            padding: "5px 10px",
            background: "var(--background-primary)",
            marginLeft: 12,
          }}
        >
          🗑️ Excluir
        </button>
      )}
    </div>
  );
}

export default InstrutorCard;
