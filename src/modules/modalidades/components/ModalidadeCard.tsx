// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: ModalidadeCard.tsx
// ======================================================

import type { Modalidade } from "../types/modalidade.types";

interface Props {
  modalidade: Modalidade;
  onEditar?: (modalidade: Modalidade) => void;
  onExcluir?: (id: string) => void;
}

export function ModalidadeCard({ modalidade, onEditar, onExcluir }: Props) {
  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: modalidade.cor + "22",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
          fontSize: 18,
        }}
      >
        {modalidade.icone}
      </div>

      <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>
        {modalidade.nome}
      </p>

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 8px" }}>
        🚪 {Array.isArray(modalidade.salas) ? modalidade.salas.join(", ") : (modalidade as any).sala ?? "-"}
      </p>

      <span
        style={{
          fontSize: 11,
          background: modalidade.cor,
          color: "#fff",
          padding: "3px 8px",
          borderRadius: 6,
          fontWeight: 600,
        }}
      >
        {modalidade.instrutoresIds.length} instrutor(es)
      </span>

      {(onEditar || onExcluir) && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          {onEditar && (
            <button
              onClick={() => onEditar(modalidade)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                padding: "5px 10px",
                background: "#2563eb",
                cursor: "pointer",
              }}
            >
              ✎ Editar
            </button>
          )}

          {onExcluir && (
            <button
              onClick={() => {
                const confirmar = window.confirm(
                  `Excluir a modalidade "${modalidade.nome}"? Essa ação não pode ser desfeita.`
                );
                if (confirmar) onExcluir(modalidade.id);
              }}
              style={{
                fontSize: 12,
                color: "var(--color-danger)",
                border: "1px solid var(--color-danger)",
                borderRadius: 6,
                padding: "5px 10px",
                background: "var(--background-primary)",
              }}
            >
              🗑️ Excluir
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ModalidadeCard;