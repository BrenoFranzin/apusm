// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutorCard.tsx
// ======================================================
import { Pencil, Trash2 } from "lucide-react";
import type { Instrutor } from "../types/instrutor.types";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";

interface Props {
  instrutor: Instrutor;
  onEditar?: (instrutor: Instrutor) => void;
  onExcluir?: (id: string) => void;
}

export function InstrutorCard({ instrutor, onEditar, onExcluir }: Props) {
  const { turmas } = useTurmas();
  const { modalidades } = useModalidades();

  const turmasDoInstrutor = turmas.filter((t) => t.instrutorId === instrutor.id);
  const modalidadesNomes = Array.from(
    new Set(
      turmasDoInstrutor
        .map((t) => modalidades.find((m) => m.id === t.modalidadeId)?.nome)
        .filter(Boolean)
    )
  );

  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        padding: 16,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: instrutor.cor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {instrutor.nome.slice(0, 2).toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontWeight: 700,
          fontSize: 14,
          margin: 0,
          color: "var(--text-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {instrutor.nome}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "3px 0 0" }}>
          {modalidadesNomes.length > 0
            ? `${modalidadesNomes.join(", ")} · ${turmasDoInstrutor.length} turma(s)`
            : "Sem turmas vinculadas"}
          {instrutor.terceirizado ? (
            <span style={{ fontWeight: 700, color: "#991b1b" }}> · Terceirizado</span>
          ) : ""}
        </p>
      </div>

      {onEditar && (
        <button
          onClick={() => onEditar(instrutor)}
          title="Editar"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, border: "none", borderRadius: "var(--radius-sm)",
            background: "var(--color-info-light)", cursor: "pointer", flexShrink: 0,
          }}
        >
          <Pencil size={14} color="var(--color-info)" />
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
          title="Excluir"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 32, height: 32, border: "none", borderRadius: "var(--radius-sm)",
            background: "var(--color-danger-light)", cursor: "pointer", flexShrink: 0,
          }}
        >
          <Trash2 size={14} color="var(--color-danger)" />
        </button>
      )}
    </div>
  );
}

export default InstrutorCard;