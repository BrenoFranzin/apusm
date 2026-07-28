// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmaCard.tsx
// ======================================================

import type { Turma } from "../types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import type { Instrutor } from "@/modules/instrutores/types/instrutor.types";

interface Props {
  turma: Turma;
  modalidade?: Modalidade;
  instrutor?: Instrutor;
  onExcluir?: (id: string) => void;
}

const DIA_LABEL: Record<string, string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta",
  qui: "Quinta", sex: "Sexta", sab: "Sábado",
};

export function TurmaCard({ turma, modalidade, instrutor, onExcluir }: Props) {
  const cor = modalidade?.cor ?? "#6b7280";

  return (
    <div
      style={{
        background: "var(--background-primary)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          minWidth: 58,
          textAlign: "center",
          background: cor,
          color: "#fff",
          borderRadius: 8,
          padding: "8px 6px",
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {turma.horario}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 500, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>
          {modalidade ? `${modalidade.icone} ${modalidade.nome}` : "Modalidade removida"}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "3px 0 0" }}>
          👤 {instrutor?.nome ?? "Sem instrutor"} · 🚪 {turma.sala}
        </p>
      </div>

      {onExcluir && (
        <button
          onClick={() => {
            const confirmar = window.confirm(
              `Excluir esta turma (${DIA_LABEL[turma.dia]} ${turma.horario})? Essa ação não pode ser desfeita.`
            );
            if (confirmar) onExcluir(turma.id);
          }}
          style={{
            fontSize: 12,
            color: "var(--color-danger)",
            border: "1px solid var(--color-danger)",
            borderRadius: 6,
            padding: "5px 10px",
            background: "var(--background-primary)",
            flexShrink: 0,
          }}
        >
          🗑️
        </button>
      )}
    </div>
  );
}

export default TurmaCard;