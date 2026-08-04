// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmasPage.tsx
// Gerenciamento de Salas movido para Configurações
// ======================================================

import { useEffect, useState } from "react";

import { useTurmas } from "../hooks/useTurmas";
import TurmaForm from "../components/TurmaForm";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useSalas } from "@/modules/salas/hooks/useSalas";
import type { Turma } from "../types/turma.types";

const DIAS_ORDEM: Turma["dia"][] = ["seg", "ter", "qua", "qui", "sex", "sab"];

const DIA_LABEL: Record<string, string> = {
  seg: "Segunda-feira",
  ter: "Terça-feira",
  qua: "Quarta-feira",
  qui: "Quinta-feira",
  sex: "Sexta-feira",
  sab: "Sábado",
};

export default function TurmasPage() {
  const { turmas, criar, excluir, erro } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { salas } = useSalas();

  const [agora, setAgora] = useState<{ dia: string; hhmm: string } | null>(null);

  useEffect(() => {
    async function buscarHoraInternet() {
      try {
        const resp = await fetch("https://worldtimeapi.org/api/timezone/America/Sao_Paulo");
        const data = await resp.json();
        const dt = new Date(data.datetime);
        const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
        const dia = diasSemana[dt.getDay()];
        const hhmm = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
        setAgora({ dia, hhmm });
      } catch {
        // Se a internet falhar, simplesmente nenhuma aula fica destacada
      }
    }
    buscarHoraInternet();
  }, []);

  function proximoHorario(horario: string) {
    const [h, m] = horario.split(":").map(Number);
    const totalMin = h * 60 + m + 60;
    const hh = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  function estaAcontecendoAgora(dia: string, horario: string) {
    if (!agora || agora.dia !== dia) return false;
    return agora.hhmm >= horario && agora.hhmm < proximoHorario(horario);
  }

  const [mostrarForm, setMostrarForm] = useState(false);

  const turmasPorDia = DIAS_ORDEM.map((dia) => ({
    dia,
    turmas: turmas
      .filter((t) => t.dia === dia)
      .slice()
      .sort((a, b) => a.horario.localeCompare(b.horario)),
  })).filter((grupo) => grupo.turmas.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Turmas</h1>
          <p style={{ color: "var(--page-subheading)" }}>
            {turmas.length} turmas cadastradas em {turmasPorDia.length} dias
          </p>
        </div>

        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Nova turma"}
        </button>
      </div>

      {/* ===== Bloco de Turmas ===== */}
      <div
        style={{
          border: "1px solid var(--border-default)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          background: "var(--background-primary)",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)" }}>
          Turmas por dia da semana
        </p>

        {mostrarForm && (
          <>
            <TurmaForm
              modalidades={modalidades}
              instrutores={instrutores}
              salas={salas}
              onSubmit={async (dados) => {
                const ok = await criar(dados);
                if (ok) setMostrarForm(false);
              }}
            />
            {erro && <p style={{ color: "#dc2626", fontSize: 13 }}>{erro}</p>}
          </>
        )}

        {turmasPorDia.length === 0 && (
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Nenhuma turma cadastrada ainda.
          </p>
        )}

        {turmasPorDia.map(({ dia, turmas: turmasDoDia }) => (
          <div key={dia} style={{ marginBottom: 24, padding: 16, border: "2px solid var(--color-primary)", borderRadius: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                {DIA_LABEL[dia]}
              </p>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  background: "var(--background-tertiary)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {turmasDoDia.length} turma(s)
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8, background: "var(--background-secondary)", borderRadius: 8, overflow: "hidden" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-default)" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Horário</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Modalidade</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Instrutor</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Sala</th>
                  <th style={{ padding: "10px 8px", width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {turmasDoDia.map((turma) => {
                  const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
                  const instrutor = instrutores.find((i) => i.id === turma.instrutorId);
                  const cor = modalidade?.cor ?? "#6b7280";
                  const emAndamento = estaAcontecendoAgora(turma.dia, turma.horario);
                  return (
                    <tr
                      key={turma.id}
                      style={{
                        borderBottom: "1px solid var(--border-default)",
                        background: emAndamento ? "var(--color-primary-light)" : "transparent",
                        boxShadow: emAndamento ? "inset 3px 0 0 var(--color-primary)" : "none",
                      }}
                    >
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{turma.horario}</span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: cor, display: "inline-block", flexShrink: 0 }} />
                          {modalidade ? `${modalidade.icone} ${modalidade.nome}` : "Modalidade removida"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-primary)" }}>
                        {instrutor?.nome ?? "Sem instrutor"}
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-primary)" }}>
                        {turma.sala}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            const confirmar = window.confirm(
                              `Excluir esta turma (${DIA_LABEL[turma.dia]} ${turma.horario})? Essa ação não pode ser desfeita.`
                            );
                            if (confirmar) excluir(turma.id);
                          }}
                          style={{
                            fontSize: 12,
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            padding: "5px 10px",
                            background: "var(--color-danger)",
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}