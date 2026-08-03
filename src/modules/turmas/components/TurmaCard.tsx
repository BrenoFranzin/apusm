// ======================================================
// APUSM SaaS â€” MÃ³dulo Turmas
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
  seg: "Segunda", ter: "TerÃ§a", qua: "Quarta",
  qui: "Quinta", sex: "Sexta", sab: "SÃ¡bado",
};

export function TurmaCard({ turma, modalidade, instrutor, onExcluir }: Props) {
  const cor = modalidade?.cor ?? "#6b7280";

  return (
    <div
      style={{
        background: "var(--color-danger)",
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
          ðŸ‘¤ {instrutor?.nome ?? "Sem instrutor"} Â· ðŸšª {turma.sala}
        </p>
      </div>

      {onExcluir && (
        <button
          onClick={() => {
            const confirmar = window.confirm(
              `Excluir esta turma (${DIA_LABEL[turma.dia]} ${turma.horario})? Essa aÃ§Ã£o nÃ£o pode ser desfeita.`
            );
            if (confirmar) onExcluir(turma.id);
          }}
          style={{
            fontSize: 12,
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            padding: "5px 10px",
            background: "var(--color-danger)",
            flexShrink: 0,
          }}
        >
          ðŸ—‘ï¸
        </button>
      )}
    </div>
  );
}

export default TurmaCard;

