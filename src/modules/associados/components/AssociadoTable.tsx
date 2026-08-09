// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoTable.tsx
// ======================================================

import type { Associado } from "../types/associado.types";
import { formatarTelefone } from "../utils/telefone";

interface Props {
  associados: Associado[];
  onVisualizar?: (id: string) => void;
  onEditar?: (id: string) => void;
  onExcluir?: (id: string) => void;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ATIVO:     { bg: "#dcfce7", color: "#166534" },
  PENDENTE:  { bg: "#fef9c3", color: "#854d0e" },
  INATIVO:   { bg: "#f3f4f6", color: "#4b5563" },
  BLOQUEADO: { bg: "#fee2e2", color: "#991b1b" },
};

export function AssociadoTable({
  associados,
  onVisualizar,
  onEditar,
  onExcluir
}: Props) {

  return (
    <div className="apusm-card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>

        <thead>
          <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
            <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Nome</th>
            <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Telefone</th>
            <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>Status</th>
            <th style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, textAlign: "right" }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {associados.map((associado) => {
            const statusStyle = STATUS_STYLE[associado.status] ?? STATUS_STYLE.ATIVO;

            return (
              <tr key={associado.id} style={{ borderTop: "1px solid var(--border-default)" }}>

                <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>
                  {associado.nome}
                </td>

                <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
  {associado.telefone ? `📞 ${formatarTelefone(associado.telefone)}` : "—"}
</td>

                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                  >
                    {associado.status}
                  </span>
                </td>

                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 8 }}>
                    {onVisualizar && (
                      <button
                        onClick={() => onVisualizar(associado.id)}
                        style={{ fontSize: 13, padding: "6px 10px", border: "1px solid var(--border-default)", borderRadius: 6, background: "var(--background-primary)", color: "var(--text-primary)" }}
                      >
                        Ver
                      </button>
                    )}

                    {onEditar && (
                      <button
                        onClick={() => onEditar(associado.id)}
                        style={{ fontSize: 13, padding: "6px 10px", border: "1px solid var(--border-default)", borderRadius: 6, background: "var(--background-primary)", color: "var(--text-primary)" }}
                      >
                        Editar
                      </button>
                    )}

                    {onExcluir && (
                      <button
                        onClick={() => {
                          const confirmar = window.confirm(
                            `Excluir o associado "${associado.nome}"? Essa ação não pode ser desfeita.`
                          );
                          if (confirmar) onExcluir(associado.id);
                        }}
                        style={{ fontSize: 13, padding: "6px 10px", border: "none", borderRadius: 6, background: "var(--color-danger)", color: "#ffffff", fontWeight: 600, cursor: "pointer" }}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </td>

              </tr>
            );
          })}
        </tbody>

      </table>
    </div>
  );
}

export default AssociadoTable;