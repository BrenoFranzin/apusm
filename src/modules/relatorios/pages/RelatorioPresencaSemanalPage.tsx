// ======================================================
// APUSM SaaS — Módulo Relatórios
// Arquivo: RelatorioPresencaSemanalPage.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { presencaSemanalService } from "../services/presencaSemanal.service";
import type { RegistroPresencaSemanal, StatusSemana, StatusSemanalRegistro } from "../types/presencaSemanal.types";

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const DIA_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb",
};

function calcularQtdSemanas(ano: number, mes: number): number {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const inicioSemana1 = new Date(primeiroDia);
  inicioSemana1.setDate(1 - primeiroDia.getDay());
  const diffDias = Math.floor((ultimoDia.getTime() - inicioSemana1.getTime()) / 86400000);
  return Math.floor(diffDias / 7) + 1;
}
const ORDEM_DIA = ["seg", "ter", "qua", "qui", "sex", "sab"];
const ORDINAL = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª"];

function calcularFaixaSemana(ano: number, mes: number, semana: number): { inicio: Date; fim: Date; label: string } {
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const inicioSemana1 = new Date(primeiroDia);
  inicioSemana1.setDate(1 - primeiroDia.getDay());

  const inicioBruto = new Date(inicioSemana1);
  inicioBruto.setDate(inicioBruto.getDate() + (semana - 1) * 7);
  const fimBruto = new Date(inicioBruto);
  fimBruto.setDate(fimBruto.getDate() + 6);

  // corta a faixa para nao ultrapassar os limites do mes
  const inicio = inicioBruto < primeiroDia ? primeiroDia : inicioBruto;
  const fim = fimBruto > ultimoDia ? ultimoDia : fimBruto;

  const fmt = (d: Date) => String(d.getDate()).padStart(2, "0");
  return { inicio, fim, label: `${fmt(inicio)} a ${fmt(fim)}` };
}

function statusSemana(
  ano: number,
  mes: number,
  semana: number,
  turmasComModalidade: { turma: any; modalidade: any }[],
  registros: RegistroPresencaSemanal[],
  statusManual?: StatusSemana
): "atual" | "completa" | "pendente" | "cancelada" | "ferias" {
  if (statusManual === "cancelada") return "cancelada";
  if (statusManual === "ferias") return "ferias";

  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  if (hojeSemHora >= inicio && hojeSemHora <= fim) return "atual";

  const todasPreenchidas =
    turmasComModalidade.length > 0 &&
    turmasComModalidade.every(({ turma }) =>
      registros.some((r) => r.turmaId === turma.id && r.semana === semana)
    );

  return todasPreenchidas ? "completa" : "pendente";
}


// ------------------------------------------------------
// Modal de uma semana
// ------------------------------------------------------
function SemanaModal({
  semana,
  ano,
  mes,
  turmasComModalidade,
  registros,
  salvando,
  onAlterar,
  instrutorNome,
  onFechar,
  statusManual,
  onDefinirStatus,
  turmasNaoPreenchidas,
  statusManualDaTurma,
}: {
  semana: number;
  ano: number;
  mes: number;
  turmasComModalidade: { turma: any; modalidade: any }[];
  registros: RegistroPresencaSemanal[];
  salvando: string | null;
  onAlterar: (turmaId: string, semana: number, valor: string) => void;
  instrutorNome: (id: string) => string;
  onFechar: () => void;
  statusManual?: StatusSemana;
  onDefinirStatus: (semana: number, status: StatusSemana | null, turmaId?: string) => void;
  turmasNaoPreenchidas: { turma: any; modalidade: any }[];
  statusManualDaTurma: (turmaId: string) => StatusSemana | undefined;
}) {
  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const fmtCompleto = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  function valorAtual(turmaId: string): number {
    const r = registros.find((r) => r.turmaId === turmaId && r.semana === semana);
    return r?.totalAlunos ?? 0;
  }

  return (
    <div
      onClick={onFechar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-modal)" as unknown as number,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apusm-card"
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "var(--text-primary)" }}>
            {ORDINAL[semana - 1]} Semana — {MESES[mes]}/{ano}
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
          {fmtCompleto(inicio)} até {fmtCompleto(fim)}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button
            onClick={() => onDefinirStatus(semana, statusManual === "cancelada" ? null : "cancelada")}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${statusManual === "cancelada" ? "#64748b" : "var(--border-default)"}`,
              background: statusManual === "cancelada" ? "#64748b" : "var(--background-primary)",
              color: statusManual === "cancelada" ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {statusManual === "cancelada" ? "✓ Cancelada" : "Marcar como Cancelada"}
          </button>
          <button
            onClick={() => onDefinirStatus(semana, statusManual === "ferias" ? null : "ferias")}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${statusManual === "ferias" ? "#0ea5e9" : "var(--border-default)"}`,
              background: statusManual === "ferias" ? "#0ea5e9" : "var(--background-primary)",
              color: statusManual === "ferias" ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {statusManual === "ferias" ? "✓ Férias" : "Marcar como Férias"}
          </button>
        </div>

        {turmasNaoPreenchidas.length > 0 && (
          <div
            style={{
              border: "1px solid #f59e0b",
              background: "#f59e0b1a",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", margin: "0 0 6px" }}>
              ⚠ {turmasNaoPreenchidas.length} turma(s) sem presença preenchida nesta semana passada
            </p>
            {turmasNaoPreenchidas.map(({ turma, modalidade }) => (
              <div
                key={turma.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "4px 0",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--text-primary)" }}>
                  <span style={{ color: modalidade!.cor }}>{modalidade!.icone}</span> {modalidade!.nome} — {DIA_LABEL[turma.dia]} {turma.horario}
                </span>
                <span style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => onDefinirStatus(semana, statusManualDaTurma(turma.id) === "cancelada" ? null : "cancelada", turma.id)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: `1px solid ${statusManualDaTurma(turma.id) === "cancelada" ? "#64748b" : "var(--border-default)"}`,
                      background: statusManualDaTurma(turma.id) === "cancelada" ? "#64748b" : "var(--background-primary)",
                      color: statusManualDaTurma(turma.id) === "cancelada" ? "#ffffff" : "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {statusManualDaTurma(turma.id) === "cancelada" ? "✓ Cancelada" : "Cancelada"}
                  </button>
                  <button
                    onClick={() => onDefinirStatus(semana, statusManualDaTurma(turma.id) === "ferias" ? null : "ferias", turma.id)}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: `1px solid ${statusManualDaTurma(turma.id) === "ferias" ? "#0ea5e9" : "var(--border-default)"}`,
                      background: statusManualDaTurma(turma.id) === "ferias" ? "#0ea5e9" : "var(--background-primary)",
                      color: statusManualDaTurma(turma.id) === "ferias" ? "#ffffff" : "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {statusManualDaTurma(turma.id) === "ferias" ? "✓ Férias" : "Férias"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}

        {turmasComModalidade.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
                <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Modalidade</th>
                <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Turma</th>
                <th style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>Instrutor</th>
                <th style={{ padding: "6px 8px", textAlign: "center", color: "var(--text-secondary)" }}>Total alunos</th>
              </tr>
            </thead>
            <tbody>
              {turmasComModalidade.map(({ turma, modalidade }) => {
                const chave = `${turma.id}-${semana}`;
                return (
                  <tr key={turma.id} style={{ borderTop: `2px solid ${modalidade!.cor}22` }}>
                    <td style={{ padding: "6px 8px", color: "var(--text-primary)", fontWeight: 600 }}>
                      <span style={{ color: modalidade!.cor }}>{modalidade!.icone}</span> {modalidade!.nome}
                    </td>
                    <td style={{ padding: "6px 8px", color: "var(--text-primary)" }}>
                      {DIA_LABEL[turma.dia]} {turma.horario}
                    </td>
                    <td style={{ padding: "6px 8px", color: "var(--text-secondary)" }}>
                      {instrutorNome(turma.instrutorId)}
                    </td>
                    <td style={{ padding: "4px 8px", textAlign: "center" }}>
                      <input
                        type="number"
                        min={0}
                        defaultValue={valorAtual(turma.id)}
                        key={`${chave}-${valorAtual(turma.id)}`}
                        onBlur={(e) => onAlterar(turma.id, semana, e.target.value)}
                        style={{
                          width: 50,
                          padding: "4px 2px",
                          textAlign: "center",
                          border: "1px solid var(--border-default)",
                          borderRadius: 4,
                          background: salvando === chave ? "var(--color-primary-light)" : "var(--background-primary)",
                          color: "var(--text-primary)",
                          fontSize: 12,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// PÃ¡gina principal
// ------------------------------------------------------
export default function RelatorioPresencaSemanalPage() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [registros, setRegistros] = useState<RegistroPresencaSemanal[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [semanaAberta, setSemanaAberta] = useState<number | null>(null);
  const [statusSemanas, setStatusSemanas] = useState<StatusSemanalRegistro[]>([]);
  const qtdSemanas = useMemo(() => calcularQtdSemanas(ano, mes), [ano, mes]);
  const semanas = useMemo(() => Array.from({ length: qtdSemanas }, (_, i) => i + 1), [qtdSemanas]);

  const { turmas } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();

  async function carregar() {
    const lista = await presencaSemanalService.listarPorMes(ano, mes);
    setRegistros(lista);
    const status = await presencaSemanalService.listarStatusPorMes(ano, mes);
    setStatusSemanas(status);
  }

  async function handleDefinirStatus(semana: number, status: StatusSemana | null, turmaId?: string) {
    await presencaSemanalService.salvarStatus(ano, mes, semana, status, turmaId);
    await carregar();
  }

  function statusManualDaSemana(semana: number): StatusSemana | undefined {
    return statusSemanas.find((s) => s.semana === semana && !s.turmaId)?.status;
  }

  function statusManualDaTurma(semana: number, turmaId: string): StatusSemana | undefined {
    return statusSemanas.find((s) => s.semana === semana && s.turmaId === turmaId)?.status;
  }

  function isSemanaPassada(semana: number): boolean {
    const { fim } = calcularFaixaSemana(ano, mes, semana);
    const hoje = new Date();
    const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    return fim < hojeSemHora;
  }

  function turmasNaoPreenchidas(semana: number) {
    if (!isSemanaPassada(semana)) return [];
    return turmasComModalidade.filter(
      ({ turma }) =>
        !registros.some((r) => r.turmaId === turma.id && r.semana === semana) &&
        !statusManualDaTurma(semana, turma.id)
    );
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, ano]);

  const turmasComModalidade = useMemo(() => {
    return turmas
      .map((t) => ({ turma: t, modalidade: modalidades.find((m) => m.id === t.modalidadeId) }))
      .filter((x) => x.modalidade)
      .sort((a, b) =>
        a.modalidade!.nome.localeCompare(b.modalidade!.nome) ||
        ORDEM_DIA.indexOf(a.turma.dia) - ORDEM_DIA.indexOf(b.turma.dia) ||
        a.turma.horario.localeCompare(b.turma.horario)
      );
  }, [modalidades, turmas]);

  async function handleAlterar(turmaId: string, semana: number, valor: string) {
    const totalAlunos = Number(valor) || 0;
    const chave = `${turmaId}-${semana}`;
    setSalvando(chave);
    await presencaSemanalService.salvar({ turmaId, ano, mes, semana, totalAlunos });
    await carregar();
    setSalvando(null);
  }

  function instrutorNome(id: string) {
    return instrutores.find((i) => i.id === id)?.nome ?? "—";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)" }}>
          Presença Semanal por Modalidade
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>
          Registro manual do total de alunos por turma, semana a semana
        </p>
      </div>

      {/* Abas de mÃªs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {MESES.map((nome, i) => (
          <button
            key={nome}
            onClick={() => setMes(i)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${mes === i ? "var(--color-primary)" : "var(--border-default)"}`,
              background: mes === i ? "var(--color-primary)" : "var(--background-primary)",
              color: mes === i ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {nome}
          </button>
        ))}
      </div>

      {turmasComModalidade.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Nenhuma turma cadastrada.
        </p>
      )}

      {/* Botões de semana */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {semanas.map((semana) => {
          const { label } = calcularFaixaSemana(ano, mes, semana);
          const status = statusSemana(ano, mes, semana, turmasComModalidade, registros, statusManualDaSemana(semana));
          const corBorda =
            status === "atual" ? "#eab308"
            : status === "completa" ? "#22c55e"
            : status === "cancelada" ? "#64748b"
            : status === "ferias" ? "#0ea5e9"
            : "#ef4444";
          return (
            <button
              key={semana}
              onClick={() => setSemanaAberta(semana)}
              className="apusm-card"
              style={{
                padding: "14px 18px",
                borderRadius: 12,
                border: `2px solid ${corBorda}`,
                background: "var(--background-primary)",
                cursor: "pointer",
                textAlign: "left",
                minWidth: 160,
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px", color: "var(--text-primary)" }}>
                {ORDINAL[semana - 1]} SEMANA
              </p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                {label}
              </p>
            </button>
          );
        })}
      </div>

      {semanaAberta !== null && (
        <SemanaModal
          semana={semanaAberta}
          ano={ano}
          mes={mes}
          turmasComModalidade={turmasComModalidade}
          registros={registros}
          salvando={salvando}
          onAlterar={handleAlterar}
          instrutorNome={instrutorNome}
          onFechar={() => setSemanaAberta(null)}
          statusManual={statusManualDaSemana(semanaAberta)}
          onDefinirStatus={handleDefinirStatus}
          turmasNaoPreenchidas={turmasNaoPreenchidas(semanaAberta)}
          statusManualDaTurma={(turmaId) => statusManualDaTurma(semanaAberta, turmaId)}
        />
      )}
    </div>
  );
}