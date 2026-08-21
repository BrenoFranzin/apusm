// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: AssociadoTable.tsx
// ======================================================
import type { CSSProperties } from "react";
import { Eye, Pencil, Trash2, Phone } from "lucide-react";
import type { Associado } from "../types/associado.types";
import { formatarTelefone } from "../utils/telefone";

interface Props {
  associados: Associado[];
  onVisualizar?: (id: string) => void;
  onEditar?: (id: string) => void;
  onExcluir?: (id: string) => void;
}

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  ATIVO:     { bg: "var(--color-success-light)", color: "var(--color-success)" },
  PENDENTE:  { bg: "var(--color-warning-light)", color: "var(--color-warning)" },
  INATIVO:   { bg: "var(--background-tertiary)", color: "var(--text-secondary)" },
  BLOQUEADO: { bg: "var(--color-danger-light)",  color: "var(--color-danger)" },
};

export function AssociadoTable({ associados, onVisualizar, onEditar, onExcluir }: Props) {
  return (
    <div className="apusm-card" style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
            <th style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>Nome</th>
            <th style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>Telefone</th>
            <th style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3 }}>Status</th>
            <th style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, textAlign: "right" }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {associados.map((associado) => {
            const statusStyle = STATUS_STYLE[associado.status] ?? STATUS_STYLE.ATIVO;

            return (
              <tr
                key={associado.id}
                style={{ borderTop: "1px solid var(--border-default)", transition: "background 0.12s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--background-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "13px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {associado.nome}
                </td>

                <td style={{ padding: "13px 16px", color: "var(--text-secondary)" }}>
                  {associado.telefone ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Phone size={13} /> {formatarTelefone(associado.telefone)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>

                <td style={{ padding: "13px 16px" }}>
                  <span
                    style={{
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "4px 11px",
                      borderRadius: 999,
                    }}
                  >
                    {associado.status}
                  </span>
                </td>

                <td style={{ padding: "13px 16px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: 6 }}>
                    {onVisualizar && (
                      <button onClick={() => onVisualizar(associado.id)} title="Visualizar" style={botaoIcone}>
                        <Eye size={15} color="var(--text-secondary)" />
                      </button>
                    )}

                    {onEditar && (
                      <button onClick={() => onEditar(associado.id)} title="Editar" style={botaoIcone}>
                        <Pencil size={15} color="var(--color-info)" />
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
                        title="Excluir"
                        style={{ ...botaoIcone, background: "var(--color-danger-light)" }}
                      >
                        <Trash2 size={15} color="var(--color-danger)" />
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

const botaoIcone: CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-sm)",
  background: "var(--background-primary)",
  cursor: "pointer",
};

export default AssociadoTable;