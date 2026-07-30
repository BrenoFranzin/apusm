// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutorCard.tsx
// ======================================================

import type { Instrutor } from "../types/instrutor.types";

interface Props {
  instrutor: Instrutor;
  onEditar?: (instrutor: Instrutor) => void;
  onExcluir?: (id: string) => void;
}

export function InstrutorCard({ instrutor, onEditar, onExcluir }: Props) {
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 500,
          fontSize: 14,
          margin: 0,
          color: "var(--text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {instrutor.nome}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "2px 0 0" }}>
          {instrutor.especialidade || "—"}
          {instrutor.terceirizado ? " · Terceirizado" : ""}
        </p>
      </div>

      {onEditar && (
        <button
          onClick={() => onEditar(instrutor)}
          style={{
            fontSize: 12,
            color: "#2563eb",
            border: "1px solid #93c5fd",
            borderRadius: 6,
            padding: "5px 10px",
            background: "var(--background-primary)",
            marginLeft: 8,
             whiteSpace: "nowrap",
          }}
        >
          ✎ Editar
        </button>
      )}

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
            marginLeft: 8,
            whiteSpace: "nowrap",
          }}
        >
          🗑️ Excluir
        </button>
      )}
    </div>
  );
}

export default InstrutorCard;