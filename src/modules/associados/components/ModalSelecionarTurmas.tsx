// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: ModalSelecionarTurmas.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (turmaIds: string[]) => void;
}

const DIA_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb",
};

export default function ModalSelecionarTurmas({ aberto, onFechar, onConfirmar }: Props) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    turmasService.listar().then(setTurmas);
    modalidadesService.listar().then(setModalidades);
    setSelecionadas([]);
    setGrupoAberto(null);
  }, [aberto]);

  const turmasPorModalidade = useMemo(() => {
    const grupos: Record<string, Turma[]> = {};
    for (const turma of turmas) {
      if (!grupos[turma.modalidadeId]) grupos[turma.modalidadeId] = [];
      grupos[turma.modalidadeId].push(turma);
    }
    for (const modId in grupos) {
      grupos[modId].sort((a, b) => {
        const diaCmp = a.dia.localeCompare(b.dia);
        return diaCmp !== 0 ? diaCmp : a.horario.localeCompare(b.horario);
      });
    }
    return grupos;
  }, [turmas]);

  function toggleTurma(turmaId: string) {
    setSelecionadas((prev) =>
      prev.includes(turmaId) ? prev.filter((id) => id !== turmaId) : [...prev, turmaId]
    );
  }

  if (!aberto) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--background-primary)",
          borderRadius: 12,
          boxShadow: "var(--shadow-lg)",
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottom: "1px solid var(--border-default)" }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: 17, margin: 0, color: "var(--text-primary)" }}>Selecionar turmas</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "2px 0 0" }}>Opcional. Pode pular e matricular depois.</p>
          </div>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
          >
            ×
          </button>
        </div>

        <div style={{ overflowY: "auto", flex: 1 }}>
          {modalidades.map((mod, i) => {
            const turmasDoGrupo = turmasPorModalidade[mod.id] || [];
            const qtdSelecionadasNoGrupo = turmasDoGrupo.filter((t) => selecionadas.includes(t.id)).length;
            const estaAberta = grupoAberto === mod.id;

            return (
              <div key={mod.id} style={{ borderTop: i > 0 ? "1px solid var(--border-default)" : "none" }}>
                <button
                  type="button"
                  onClick={() => setGrupoAberto(estaAberta ? null : mod.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                    <span>{mod.icone}</span>
                    <span style={{ fontWeight: 500 }}>{mod.nome}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>({turmasDoGrupo.length})</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {qtdSelecionadasNoGrupo > 0 && (
                      <span style={{ fontSize: 11, background: "var(--color-success-light)", color: "var(--color-success)", padding: "3px 8px", borderRadius: 999 }}>
                        {qtdSelecionadasNoGrupo}
                      </span>
                    )}
                    <span style={{ color: "var(--text-secondary)" }}>{estaAberta ? "▲" : "▼"}</span>
                  </span>
                </button>

                {estaAberta && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, padding: 12, background: "var(--background-tertiary)" }}>
                    {turmasDoGrupo.map((turma) => {
                      const marcada = selecionadas.includes(turma.id);
                      return (
                        <label
                          key={turma.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 13,
                            border: `1px solid ${marcada ? "var(--color-success)" : "var(--border-default)"}`,
                            borderRadius: 8,
                            padding: "6px 8px",
                            cursor: "pointer",
                            background: marcada ? "var(--color-success-light)" : "var(--background-primary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={marcada}
                            onChange={() => toggleTurma(turma.id)}
                          />
                          <span>{DIA_LABEL[turma.dia] ?? turma.dia} {turma.horario}</span>
                        </label>
                      );
                    })}
                    {turmasDoGrupo.length === 0 && (
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", gridColumn: "1 / -1" }}>Nenhuma turma cadastrada</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: 16, borderTop: "1px solid var(--border-default)" }}>
          <button
            onClick={onFechar}
            style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", cursor: "pointer" }}
          >
            Pular
          </button>
          <button
            onClick={() => onConfirmar(selecionadas)}
            style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "var(--color-primary)", color: "#ffffff", fontWeight: 600, cursor: "pointer" }}
          >
            Confirmar {selecionadas.length > 0 ? `(${selecionadas.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}