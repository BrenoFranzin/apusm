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

const STATUS_CONFIG: Record<StatusSemana, { label: string; cor: string }> = {
  cancelada: { label: "Cancelada", cor: "#64748b" },
  ferias: { label: "Férias", cor: "#0ea5e9" },
  evento: { label: "Evento", cor: "#a855f7" },
};
const ORDEM_STATUS: StatusSemana[] = ["cancelada", "ferias", "evento"];

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
): "atual" | "completa" | "pendente" | StatusSemana {
  if (statusManual) return statusManual;

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

function baixarCsv(nomeArquivo: string, linhas: string[][]) {
  const conteudo = linhas
    .map((linha) => linha.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(";"))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}

// ------------------------------------------------------
// Botões de status (Cancelada / Férias / Evento) — fixos, sem quebra
// ------------------------------------------------------
function BotoesStatus({
  tamanho,
  statusAtual,
  onEscolher,
}: {
  tamanho: "grande" | "pequeno";
  statusAtual?: StatusSemana;
  onEscolher: (status: StatusSemana | null) => void;
}) {
  const isPequeno = tamanho === "pequeno";
  return (
    <div style={{ display: "flex", flexWrap: "nowrap", gap: isPequeno ? 6 : 8 }}>
      {ORDEM_STATUS.map((st) => {
        const ativo = statusAtual === st;
        const cfg = STATUS_CONFIG[st];
        return (
          <button
            key={st}
            onClick={() => onEscolher(ativo ? null : st)}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
              fontSize: isPequeno ? 11 : 12,
              fontWeight: 600,
              padding: isPequeno ? "3px 8px" : "6px 12px",
              borderRadius: isPequeno ? 6 : 8,
              border: `1px solid ${ativo ? cfg.cor : "var(--border-default)"}`,
              background: ativo ? cfg.cor : "var(--background-primary)",
              color: ativo ? "#ffffff" : "var(--text-primary)",
              cursor: "pointer",
            }}
          >
            {ativo ? `✓ ${cfg.label}` : cfg.label}
          </button>
        );
      })}
    </div>
  );
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
  onDefinirStatus: (semana: number, status: StatusSemana | null, turmaId?: string, motivo?: string) => void;
  turmasNaoPreenchidas: { turma: any; modalidade: any }[];
  statusManualDaTurma: (turmaId: string) => StatusSemana | undefined;
}) {
  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const fmtCompleto = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  function valorAtual(turmaId: string): number {
    const r = registros.find((r) => r.turmaId === turmaId && r.semana === semana);
    return r?.totalAlunos ?? 0;
  }

  function escolherStatus(status: StatusSemana | null, turmaId?: string) {
    if (!status) {
      onDefinirStatus(semana, null, turmaId);
      return;
    }
    const motivo = window.prompt(`Motivo/justificativa para "${STATUS_CONFIG[status].label}" (opcional):`) ?? undefined;
    onDefinirStatus(semana, status, turmaId, motivo || undefined);
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
          maxWidth: 1216,
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "var(--space-6)",
          position: "relative",
        }}
      >
        <button
          onClick={onFechar}
          style={{ position: "absolute", top: 14, right: 18, fontSize: 22, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 19, margin: 0, color: "var(--text-primary)" }}>
            {ORDINAL[semana - 1]} Semana — {MESES[mes]}/{ano}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", textAlign: "center" }}>
          {fmtCompleto(inicio)} até {fmtCompleto(fim)}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <BotoesStatus tamanho="grande" statusAtual={statusManual} onEscolher={(s) => escolherStatus(s)} />
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
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ color: "var(--text-primary)" }}>
                  <span style={{ color: modalidade!.cor }}>{modalidade!.icone}</span> {modalidade!.nome} — {DIA_LABEL[turma.dia]} {turma.horario}
                </span>
                <BotoesStatus
                  tamanho="pequeno"
                  statusAtual={statusManualDaTurma(turma.id)}
                  onEscolher={(s) => escolherStatus(s, turma.id)}
                />
              </div>
            ))}
          </div>
        )}

        {turmasComModalidade.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background-tertiary)", textAlign: "left", borderBottom: "2px solid var(--border-default)" }}>
                <th style={{ padding: "10px 10px", color: "var(--text-primary)", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>Modalidade</th>
                <th style={{ padding: "10px 10px", color: "var(--text-primary)", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>Turma</th>
                <th style={{ padding: "10px 10px", color: "var(--text-primary)", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>Instrutor</th>
                <th style={{ padding: "10px 10px", textAlign: "center", color: "var(--text-primary)", fontWeight: 800, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4 }}>Total alunos</th>
              </tr>
            </thead>
            <tbody>
              {turmasComModalidade.map(({ turma, modalidade }) => {
                const chave = `${turma.id}-${semana}`;
                return (
                  <tr
                    key={turma.id}
                    style={{
                      borderTop: `3px solid ${modalidade!.cor}`,
                      borderLeft: `4px solid ${modalidade!.cor}`,
                      background: "var(--background-primary)",
                    }}
                  >
                    <td style={{ padding: "8px 10px", color: "var(--text-primary)", fontWeight: 700 }}>
                      <span style={{ color: modalidade!.cor }}>{modalidade!.icone}</span> {modalidade!.nome}
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--text-primary)" }}>
                      {DIA_LABEL[turma.dia]} {turma.horario}
                    </td>
                    <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>
                      {instrutorNome(turma.instrutorId)}
                    </td>
                    <td style={{ padding: "6px 10px", textAlign: "center" }}>
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
// Modal de terceirizados
// ------------------------------------------------------
function TerceirizadosModal({
  ano,
  mes,
  semanas,
  turmasComModalidade,
  registros,
  statusSemanas,
  instrutores,
  onFechar,
}: {
  ano: number;
  mes: number;
  semanas: number[];
  turmasComModalidade: { turma: any; modalidade: any }[];
  registros: RegistroPresencaSemanal[];
  statusSemanas: StatusSemanalRegistro[];
  instrutores: any[];
  onFechar: () => void;
}) {
  const instrutoresTerceirizados = instrutores.filter((i) => i.terceirizado);

  type Linha = {
    instrutor: string;
    modalidade: string;
    turma: string;
    semana: number;
    situacao: string;
    motivo: string;
  };

  const linhas: Linha[] = [];
  for (const inst of instrutoresTerceirizados) {
    const turmasDoInstrutor = turmasComModalidade.filter(({ turma }) => turma.instrutorId === inst.id);
    for (const { turma, modalidade } of turmasDoInstrutor) {
      for (const semana of semanas) {
        const statusSemanaGeral = statusSemanas.find((s) => s.semana === semana && !s.turmaId);
        const statusTurma = statusSemanas.find((s) => s.semana === semana && s.turmaId === turma.id);
        const status = statusTurma ?? statusSemanaGeral;
        const registro = registros.find((r) => r.turmaId === turma.id && r.semana === semana);

        let situacao = "Não preenchida";
        let motivo = "";
        if (status) {
          situacao = STATUS_CONFIG[status.status].label;
          motivo = status.motivo ?? "";
        } else if (registro) {
          situacao = "Feita";
        }

        linhas.push({
          instrutor: inst.nome,
          modalidade: modalidade!.nome,
          turma: `${DIA_LABEL[turma.dia]} ${turma.horario}`,
          semana,
          situacao,
          motivo,
        });
      }
    }
  }

  function exportar() {
    const cabecalho = ["Instrutor", "Modalidade", "Turma", "Semana", "Situação", "Motivo"];
    const corpo = linhas.map((l) => [l.instrutor, l.modalidade, l.turma, `${ORDINAL[l.semana - 1]}`, l.situacao, l.motivo]);
    baixarCsv(`terceirizados_${MESES[mes]}_${ano}.csv`, [cabecalho, ...corpo]);
  }

  const corSituacao = (situacao: string) =>
    situacao === "Feita" ? "#22c55e"
    : situacao === "Não preenchida" ? "#ef4444"
    : situacao === "Cancelada" ? "#64748b"
    : situacao === "Férias" ? "#0ea5e9"
    : situacao === "Evento" ? "#a855f7"
    : "var(--text-primary)";

  return (
    <div
      onClick={onFechar}
      style={{
        position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: "var(--z-modal)" as unknown as number, padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apusm-card"
        style={{ width: "100%", maxWidth: 1100, maxHeight: "85vh", overflowY: "auto", padding: "var(--space-6)", position: "relative" }}
      >
        <button
          onClick={onFechar}
          style={{ position: "absolute", top: 14, right: 18, fontSize: 22, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          ×
        </button>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 19, margin: 0, color: "var(--text-primary)" }}>
            Aulas dos Terceirizados — {MESES[mes]}/{ano}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", textAlign: "center" }}>
          Feitas, canceladas e não preenchidas por instrutor terceirizado
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <button
            onClick={exportar}
            style={{
              fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 8,
              border: "1px solid var(--color-primary)", background: "var(--color-primary)",
              color: "#ffffff", cursor: "pointer",
            }}
          >
            ⬇ Exportar CSV (Tesouraria)
          </button>
        </div>

        {instrutoresTerceirizados.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>Nenhum instrutor terceirizado cadastrado.</p>
        ) : linhas.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>Nenhuma turma vinculada a terceirizados neste mês.</p>
        ) : (
          <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--background-tertiary)", textAlign: "left", borderBottom: "2px solid var(--border-default)" }}>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Instrutor</th>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Modalidade</th>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Turma</th>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Semana</th>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Situação</th>
                <th style={{ padding: "10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid var(--border-default)" }}>
                  <td style={{ padding: "6px 10px", color: "var(--text-primary)", fontWeight: 600 }}>{l.instrutor}</td>
                  <td style={{ padding: "6px 10px", color: "var(--text-primary)" }}>{l.modalidade}</td>
                  <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{l.turma}</td>
                  <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{ORDINAL[l.semana - 1]}</td>
                  <td style={{ padding: "6px 10px", fontWeight: 700, color: corSituacao(l.situacao) }}>{l.situacao}</td>
                  <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{l.motivo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Página principal
// ------------------------------------------------------
export default function RelatorioPresencaSemanalPage() {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth());
  const [registros, setRegistros] = useState<RegistroPresencaSemanal[]>([]);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [semanaAberta, setSemanaAberta] = useState<number | null>(null);
  const [terceirizadosAberto, setTerceirizadosAberto] = useState(false);
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

  async function handleDefinirStatus(semana: number, status: StatusSemana | null, turmaId?: string, motivo?: string) {
    await presencaSemanalService.salvarStatus(ano, mes, semana, status, turmaId, motivo);
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

      {/* Abas de mês */}
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

      <div>
        <button
          onClick={() => setTerceirizadosAberto(true)}
          style={{
            fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 8,
            border: "1px solid #a855f7", background: "var(--background-primary)",
            color: "#a855f7", cursor: "pointer",
          }}
        >
          👥 Aulas dos Terceirizados
        </button>
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
            : status === "pendente" ? "#ef4444"
            : STATUS_CONFIG[status as StatusSemana].cor;
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

      {terceirizadosAberto && (
        <TerceirizadosModal
          ano={ano}
          mes={mes}
          semanas={semanas}
          turmasComModalidade={turmasComModalidade}
          registros={registros}
          statusSemanas={statusSemanas}
          instrutores={instrutores}
          onFechar={() => setTerceirizadosAberto(false)}
        />
      )}
    </div>
  );
}