// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: ModalidadeCard.tsx
// ======================================================
import { Pencil, Trash2, DoorOpen } from "lucide-react";
import type { Modalidade } from "../types/modalidade.types";
import type { Instrutor } from "../../instrutores/types/instrutor.types";

interface Props {
  modalidade: Modalidade;
  instrutores: Instrutor[];
  onEditar?: (modalidade: Modalidade) => void;
  onExcluir?: (id: string) => void;
}

export function ModalidadeCard({ modalidade, instrutores, onEditar, onExcluir }: Props) {
  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "var(--radius-md)",
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

      <p style={{ fontWeight: 700, fontSize: 14.5, margin: 0, color: "var(--text-primary)" }}>
        {modalidade.nome}
      </p>

      <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "5px 0 8px", display: "flex", alignItems: "center", gap: 5 }}>
        <DoorOpen size={13} />
        {Array.isArray(modalidade.salas) ? Array.from(new Set(modalidade.salas)).join(", ") : (modalidade as any).sala ?? "-"}
      </p>

      {modalidade.descricao && (
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 8px", fontStyle: "italic" }}>
          ℹ️ {modalidade.descricao}
        </p>
      )}

      <span
        style={{
          fontSize: 11,
          background: modalidade.cor,
          color: "#fff",
          padding: "3px 9px",
          borderRadius: 999,
          fontWeight: 600,
          display: "inline-block",
        }}
      >
        {modalidade.instrutoresIds
          .map((id) => instrutores.find((i) => i.id === id)?.nome)
          .filter(Boolean)
          .join(", ") || "Sem instrutor"}
      </span>

      {(onEditar || onExcluir) && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 6,
          }}
        >
          {onEditar && (
            <button
              onClick={() => onEditar(modalidade)}
              title="Editar"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30,
                border: "none", borderRadius: "var(--radius-sm)",
                background: "var(--color-info-light)",
                cursor: "pointer",
              }}
            >
              <Pencil size={14} color="var(--color-info)" />
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
              title="Excluir"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 30, height: 30,
                border: "none", borderRadius: "var(--radius-sm)",
                background: "var(--color-danger-light)",
                cursor: "pointer",
              }}
            >
              <Trash2 size={14} color="var(--color-danger)" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ModalidadeCard;