// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmaCard.tsx
// ======================================================
import { User, DoorOpen, Trash2 } from "lucide-react";
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
        borderRadius: "var(--radius-md)",
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          minWidth: 58,
          textAlign: "center",
          background: cor,
          color: "#fff",
          borderRadius: "var(--radius-sm)",
          padding: "8px 6px",
          fontWeight: 700,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {turma.horario}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, margin: 0, color: "var(--text-primary)" }}>
          {modalidade ? `${modalidade.icone} ${modalidade.nome}` : "Modalidade removida"}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <User size={12} /> {instrutor?.nome ?? "Sem instrutor"}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <DoorOpen size={12} /> {turma.sala}
          </span>
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
          title="Excluir turma"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            border: "none",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-danger-light)",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <Trash2 size={15} color="var(--color-danger)" />
        </button>
      )}
    </div>
  );
}

export default TurmaCard;