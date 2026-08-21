// ======================================================
// APUSM SaaS - Modulo Relatorios
// Arquivo: RelatorioPresencaSemanalPage.tsx
// ======================================================

import { useMemo, useEffect, useState } from "react";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { presencaSemanalService } from "../services/presencaSemanal.service";
import type { RegistroPresencaSemanal, StatusSemana, StatusSemanalRegistro } from "../types/presencaSemanal.types";

const MESES = [
  "Janeiro","Fevereiro","Marco","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];

const DIA_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sab",
};

const STATUS_CONFIG: Record<StatusSemana, { label: string; cor: string }> = {
  cancelada: { label: "Cancelada", cor: "#dc2626" },
  ferias: { label: "Ferias", cor: "#0ea5e9" },
  evento: { label: "Evento", cor: "#a855f7" },
};
const ORDEM_STATUS: StatusSemana[] = ["cancelada", "ferias", "evento"];
const COR_AMARELO_QUEIMADO = "#b45309";

// Paleta suavizada usada so na legenda externa (fora do modal)
const COR_LEGENDA = {
  futura: "#60a5fa",
  atualCompleta: "#4ade80",
  pendente: "#f87171",
  cancelada: "#f87171",
  ferias: "#38bdf8",
  evento: "#c084fc",
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
const ORDINAL = ["1a", "2a", "3a", "4a", "5a", "6a"];

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

  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { inicio, fim, label: `${fmt(inicio)} a ${fmt(fim)}` };
}

function statusSemana(
  ano: number,
  mes: number,
  semana: number,
  turmasComModalidade: { turma: any; modalidade: any }[],
  registros: RegistroPresencaSemanal[],
  statusManual?: StatusSemana
): "atual" | "completa" | "pendente" | "futura" | StatusSemana {
  if (statusManual) return statusManual;

  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const hoje = new Date();
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  if (hojeSemHora >= inicio && hojeSemHora <= fim) return "atual";
  if (hojeSemHora < inicio) return "futura";

  const todasPreenchidas =
    turmasComModalidade.length > 0 &&
    turmasComModalidade.every(({ turma }) =>
      registros.some((r) => r.turmaId === turma.id && r.semana === semana)
    );

  return todasPreenchidas ? "completa" : "pendente";
}

// ------------------------------------------------------
// Botao "OBS" + sub-modal com Cancelada / Ferias / Evento + motivo
// ------------------------------------------------------
function StatusPicker({
  tamanho,
  statusAtual,
  motivoAtual,
  onSalvar,
}: {
  tamanho: "grande" | "pequeno";
  statusAtual?: StatusSemana;
  motivoAtual?: string;
  onSalvar: (status: StatusSemana | null, motivo?: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [statusSel, setStatusSel] = useState<StatusSemana | null>(statusAtual ?? null);
  const [motivo, setMotivo] = useState(motivoAtual ?? "");
  const isPequeno = tamanho === "pequeno";
  const cfgAtual = statusAtual ? STATUS_CONFIG[statusAtual] : null;

  function abrir() {
    setStatusSel(statusAtual ?? null);
    setMotivo(motivoAtual ?? "");
    setAberto(true);
  }

  return (
    <>
      <button
        onClick={abrir}
        style={{
          flexShrink: 0,
          whiteSpace: "nowrap",
          fontSize: isPequeno ? 11 : 12,
          fontWeight: 700,
          padding: isPequeno ? "3px 10px" : "6px 14px",
          borderRadius: isPequeno ? 6 : 8,
          border: `1px solid ${cfgAtual ? cfgAtual.cor : "var(--border-default)"}`,
          background: cfgAtual ? cfgAtual.cor : "var(--background-primary)",
          color: cfgAtual ? "#ffffff" : "var(--text-primary)",
          cursor: "pointer",
        }}
      >
        {cfgAtual ? `${"\u2713"} ${cfgAtual.label}` : "OBS"}
      </button>

      {aberto && (
        <div
          onClick={() => setAberto(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10000, padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="apusm-card"
            style={{ width: "100%", maxWidth: 340, padding: 20, borderRadius: 14 }}
          >
            <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px", textAlign: "center", color: "var(--text-primary)" }}>
              Definir situacao
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", justifyContent: "center" }}>
              {ORDEM_STATUS.map((st) => {
                const ativo = statusSel === st;
                const cfg = STATUS_CONFIG[st];
                return (
                  <button
                    key={st}
                    onClick={() => setStatusSel(ativo ? null : st)}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                      border: `1px solid ${ativo ? cfg.cor : "var(--border-default)"}`,
                      background: ativo ? cfg.cor : "var(--background-primary)",
                      color: ativo ? "#ffffff" : "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo/justificativa (opcional)"
              style={{
                width: "100%", minHeight: 64, borderRadius: 8, border: "1px solid var(--border-default)",
                padding: 8, fontSize: 12, background: "var(--background-primary)", color: "var(--text-primary)",
                resize: "vertical", marginBottom: 12, boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => { onSalvar(statusSel, motivo || undefined); setAberto(false); }}
                style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--color-primary)", background: "var(--color-primary)", color: "#fff", cursor: "pointer" }}
              >
                Salvar
              </button>
              {statusAtual && (
                <button
                  onClick={() => { onSalvar(null); setAberto(false); }}
                  style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", cursor: "pointer" }}
                >
                  Remover
                </button>
              )}
              <button
                onClick={() => setAberto(false)}
                style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-secondary)", cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
  registroSemana,
  onDefinirStatus,
  turmasNaoPreenchidas,
  registroDaTurma,
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
  registroSemana?: StatusSemanalRegistro;
  onDefinirStatus: (semana: number, status: StatusSemana | null, turmaId?: string, motivo?: string) => void;
  turmasNaoPreenchidas: { turma: any; modalidade: any }[];
  registroDaTurma: (turmaId: string) => StatusSemanalRegistro | undefined;
}) {
  const { inicio, fim } = calcularFaixaSemana(ano, mes, semana);
  const fmtCompleto = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  const hojeSemHora = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const semanaJaPassou = fim < hojeSemHora;

  function valorAtual(turmaId: string): number {
    const r = registros.find((r) => r.turmaId === turmaId && r.semana === semana);
    return r?.totalAlunos ?? 0;
  }

  function temRegistro(turmaId: string): boolean {
    return registros.some((r) => r.turmaId === turmaId && r.semana === semana);
  }

  const gruposPorModalidade = turmasComModalidade.reduce((acc, item) => {
    const nome = item.modalidade!.nome;
    if (!acc[nome]) acc[nome] = [];
    acc[nome].push(item);
    return acc;
  }, {} as Record<string, { turma: any; modalidade: any }[]>);

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
        style={{ width: "100%", maxWidth: 1216, maxHeight: "85vh", overflowY: "auto", padding: "var(--space-6)", position: "relative" }}
      >
        <button
          onClick={onFechar}
          style={{ position: "absolute", top: 14, right: 18, fontSize: 22, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
        >
          {"\u00d7"}
        </button>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 19, margin: 0, color: "var(--text-primary)" }}>
            {ORDINAL[semana - 1]} Semana - {MESES[mes]}/{ano}
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", textAlign: "center" }}>
          {fmtCompleto(inicio)} ate {fmtCompleto(fim)}
        </p>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
          <StatusPicker
            tamanho="grande"
            statusAtual={registroSemana?.status}
            motivoAtual={registroSemana?.motivo}
            onSalvar={(status, motivo) => onDefinirStatus(semana, status, undefined, motivo)}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 14, fontSize: 11, fontWeight: 700, flexWrap: "wrap", marginBottom: 16 }}>
          <span style={{ color: STATUS_CONFIG.cancelada.cor }}>Cancelada</span>
          <span style={{ color: STATUS_CONFIG.ferias.cor }}>Ferias</span>
          <span style={{ color: STATUS_CONFIG.evento.cor }}>Evento</span>
        </div>


        {turmasComModalidade.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
        ) : (
          Object.entries(gruposPorModalidade).map(([nomeModalidade, itens]) => {
            const corMod = itens[0].modalidade!.cor;
            const icone = itens[0].modalidade!.icone;
            return (
              <details
                key={nomeModalidade}
                open
                style={{ border: `2px solid ${corMod}`, borderRadius: 14, marginBottom: 12, overflow: "hidden", background: "var(--background-primary)" }}
              >
                <summary style={{ cursor: "pointer", listStyle: "none", padding: "10px 14px", background: `${corMod}14`, fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}>
                  <span style={{ color: corMod }}>{icone}</span> {nomeModalidade}
                </summary>
                <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
                      <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Turma</th>
                      <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Instrutor</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Total alunos</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, fontSize: 11, textTransform: "uppercase", color: "var(--text-primary)" }}>Obs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itens.map(({ turma }) => {
                      const chave = `${turma.id}-${semana}`;
                      return (
                        <tr key={turma.id} style={{ borderTop: "1px solid var(--border-default)" }}>
                          <td style={{ padding: "8px 10px", color: "var(--text-primary)" }}>{DIA_LABEL[turma.dia]} {turma.horario}</td>
                          <td style={{ padding: "8px 10px", color: "var(--text-secondary)" }}>{instrutorNome(turma.instrutorId)}</td>
                          <td style={{ padding: "6px 10px", textAlign: "center" }}>
                            <input
                              type="number"
                              min={0}
                              defaultValue={valorAtual(turma.id)}
                              key={`${chave}-${valorAtual(turma.id)}`}
                              onBlur={(e) => onAlterar(turma.id, semana, e.target.value)}
                              style={{
                                width: 65, padding: "6px 3px", textAlign: "center",
                                border: `1px solid ${semanaJaPassou && !temRegistro(turma.id) && !registroDaTurma(turma.id) ? "#dc2626" : "var(--border-default)"}`, borderRadius: 5,
                                background: salvando === chave ? "var(--color-primary-light)" : "var(--background-primary)",
                                color: "var(--text-primary)", fontSize: 15, fontWeight: 700,
                              }}
                            />
                          </td>
                          <td style={{ padding: "6px 10px", textAlign: "center" }}>
                            <StatusPicker
                              tamanho="pequeno"
                              statusAtual={registroDaTurma(turma.id)?.status}
                              motivoAtual={registroDaTurma(turma.id)?.motivo}
                              onSalvar={(status, motivo) => onDefinirStatus(semana, status, turma.id, motivo)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </details>
            );
          })
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Modal de terceirizados - cards coloridos por instrutor + export PDF
// ------------------------------------------------------
type LinhaTerceirizado = { modalidade: string; turma: string; semana: number; situacao: string; motivo: string };

function corSituacao(situacao: string): string {
  if (situacao === "Feita") return "#4ade80";
  if (situacao === "Nao preenchida") return "#f87171";
  if (situacao === "Cancelada") return "#94a3b8";
  if (situacao === "Ferias") return "#38bdf8";
  if (situacao === "Evento") return "#c084fc";
  return "var(--text-primary)";
}

const CIRCULOS_MODALIDADE = ["\u{1F535}", "\u{1F7E2}", "\u{1F7E3}", "\u{1F7E0}", "\u{1F7E1}", "\u{1F534}"];

function CardInstrutor({ inst, linhas }: { inst: any; linhas: LinhaTerceirizado[] }) {
  const feitas = linhas.filter((l) => l.situacao === "Feita").length;
  const canceladas = linhas.filter((l) => l.situacao === "Cancelada").length;
  const naoPreenchidas = linhas.filter((l) => l.situacao === "Nao preenchida").length;
  const outras = linhas.length - feitas - canceladas - naoPreenchidas;

  const modalidadesUnicas = Array.from(new Set(linhas.map((l) => l.modalidade)));
  const circuloPorModalidade: Record<string, string> = {};
  function ehModoEscuro() {
  return document.documentElement.classList.contains("dark");
}

  modalidadesUnicas.forEach((m, i) => { circuloPorModalidade[m] = CIRCULOS_MODALIDADE[i % CIRCULOS_MODALIDADE.length]; });

  return (
    <details
      open
      style={{ border: `2px solid ${inst.cor}`, borderRadius: 14, marginBottom: 14, overflow: "hidden", background: "var(--background-primary)" }}
    >
      <summary
        style={{
          cursor: "pointer", listStyle: "none", padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
          background: `${inst.cor}14`,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 14, color: "var(--text-primary)" }}><span style={{ color: inst.cor }}>{"\u25CF"}</span> {inst.nome}</span>
        <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(22,163,74,0.35)", color: "#4ade80" }}>{feitas} feitas</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(100,116,139,0.35)", color: "#cbd5e1" }}>{canceladas} canceladas</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(220,38,38,0.35)", color: "#f87171" }}>{naoPreenchidas} nao preenchidas</span>
          {outras > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(168,85,247,0.35)", color: "#c084fc" }}>{outras} outras</span>}
          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(255,255,255,0.15)", color: "var(--text-primary)" }}>{linhas.length} no total</span>
        </span>
      </summary>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--background-tertiary)", textAlign: "left" }}>
            <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--text-primary)" }}>Modalidade</th>
            <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--text-primary)" }}>Turma</th>
            <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--text-primary)" }}>Semana</th>
            <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--text-primary)" }}>Situacao</th>
            <th style={{ padding: "8px 10px", fontWeight: 800, fontSize: 12, textTransform: "uppercase", color: "var(--text-primary)" }}>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, idx) => (
            <tr key={idx} style={{ borderTop: "1px solid var(--border-default)" }}>
              <td style={{ padding: "6px 10px", color: "var(--text-primary)" }}>{circuloPorModalidade[l.modalidade]} {l.modalidade}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{l.turma}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{ORDINAL[l.semana - 1]}</td>
              <td style={{ padding: "6px 10px", fontWeight: 700, color: corSituacao(l.situacao) }}>{l.situacao}</td>
              <td style={{ padding: "6px 10px", color: "var(--text-secondary)" }}>{l.motivo || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function TerceirizadosModal({
  ano, mes, semanas, turmasComModalidade, registros, statusSemanas, instrutores, onFechar,
}: {
  ano: number; mes: number; semanas: number[];
  turmasComModalidade: { turma: any; modalidade: any }[];
  registros: RegistroPresencaSemanal[];
  statusSemanas: StatusSemanalRegistro[];
  instrutores: any[];
  onFechar: () => void;
}) {
  const instrutoresTerceirizados = instrutores.filter((i) => i.terceirizado);

  const grupos = instrutoresTerceirizados.map((inst) => {
    const linhas: LinhaTerceirizado[] = [];
    const turmasDoInstrutor = turmasComModalidade.filter(({ turma }) => turma.instrutorId === inst.id);
    for (const { turma, modalidade } of turmasDoInstrutor) {
      for (const semana of semanas) {
        const statusSemanaGeral = statusSemanas.find((s) => s.semana === semana && !s.turmaId);
        const statusTurma = statusSemanas.find((s) => s.semana === semana && s.turmaId === turma.id);
        const status = statusTurma ?? statusSemanaGeral;
        const registro = registros.find((r) => r.turmaId === turma.id && r.semana === semana);
        let situacao = "Nao preenchida";
        let motivo = "";
        if (status) { situacao = STATUS_CONFIG[status.status].label; motivo = status.motivo ?? ""; }
        else if (registro) { situacao = "Feita"; }
        linhas.push({ modalidade: modalidade!.nome, turma: `${DIA_LABEL[turma.dia]} ${turma.horario}`, semana, situacao, motivo });
      }
    }
    linhas.sort((a, b) => a.semana - b.semana);
    return { inst, linhas };
  }).filter((g) => g.linhas.length > 0);

  // separa por instrutor + modalidade, cada combinacao e uma "folha"
  const folhas = grupos.flatMap(({ inst, linhas }) => {
    const modalidadesDoInst = Array.from(new Set(linhas.map((l) => l.modalidade)));
    return modalidadesDoInst.map((modNome) => ({
      inst,
      modalidade: modNome,
      linhas: linhas.filter((l) => l.modalidade === modNome),
    }));
  });

  function exportarPdf() {
    const janela = window.open("", "_blank");
    if (!janela) return;
    const paginas = folhas.map(({ inst, modalidade, linhas }) => {
      const feitas = linhas.filter((l) => l.situacao === "Feita").length;
      const naoFeitas = linhas.length - feitas;
      return `
      <section style="page-break-after: always; padding: 12px 0;">
        <div style="border:2px solid ${inst.cor}; border-radius:14px; padding:16px 18px;">
          <h2 style="margin:0 0 4px; color:${inst.cor}; font-size:18px;">${inst.nome}</h2>
          <p style="margin:0 0 14px; font-size:13px; color:#475569;">Modalidade: ${modalidade}</p>
          <div style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
            <span style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; background:#f1f5f9;">${linhas.length} aulas no total (no mes)</span>
            <span style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; background:#dcfce7; color:#16a34a;">${feitas} realizadas</span>
            <span style="font-size:12px; font-weight:700; padding:4px 10px; border-radius:999px; background:#fee2e2; color:#dc2626;">${naoFeitas} nao realizadas</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#f1f5f9; text-align:left;">
                <th style="padding:7px 8px;">Semana</th><th style="padding:7px 8px;">Turma</th>
                <th style="padding:7px 8px;">Situacao</th><th style="padding:7px 8px;">Motivo</th>
              </tr>
            </thead>
            <tbody>
              ${linhas.map((l) => `
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:6px 8px;">${ORDINAL[l.semana - 1]} semana</td>
                  <td style="padding:6px 8px;">${l.turma}</td>
                  <td style="padding:6px 8px; font-weight:700; color:${corSituacao(l.situacao)};">${l.situacao}</td>
                  <td style="padding:6px 8px; color:#475569;">${l.motivo || "-"}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
    }).join("");
    janela.document.write(`
      <html><head><meta charset="utf-8" /><title>Terceirizados - ${MESES[mes]}/${ano}</title>
      <style>@page { size: A4 portrait; margin: 16mm; } section:last-child { page-break-after: auto; }</style>
      </head>
      <body style="font-family: Arial, sans-serif; color:#0f172a;">
        <h1 style="font-size:20px; margin:0 0 16px;">Aulas dos Terceirizados - ${MESES[mes]}/${ano}</h1>
        ${paginas || "<p>Nenhuma turma vinculada a terceirizados neste mes.</p>"}
      </body></html>`);
    janela.document.close();
    janela.focus();
    setTimeout(() => janela.print(), 300);
  }

  return (
    <div onClick={onFechar} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "var(--z-modal)" as unknown as number, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="apusm-card" style={{ width: "100%", maxWidth: 1305, maxHeight: "85vh", overflowY: "auto", padding: "var(--space-6)", position: "relative", borderRadius: 20 }}>
        <button onClick={onFechar} style={{ position: "absolute", top: 14, right: 18, fontSize: 22, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>{"\u00d7"}</button>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 19, margin: 0, color: "var(--text-primary)" }}>Aulas dos Terceirizados - {MESES[mes]}/{ano}</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 14px", textAlign: "center" }}>
          Feitas, canceladas e nao preenchidas por instrutor terceirizado
        </p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <button onClick={exportarPdf} style={{ fontSize: 13, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-primary)", background: "var(--color-primary)", color: "#fff", cursor: "pointer" }}>
            {"\u{1F5A8}"} Exportar PDF (Tesouraria)
          </button>
        </div>

        {instrutoresTerceirizados.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>Nenhum instrutor terceirizado cadastrado.</p>
        ) : grupos.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14, textAlign: "center" }}>Nenhuma turma vinculada a terceirizados neste mes.</p>
        ) : (
          grupos.map(({ inst, linhas }) => <CardInstrutor key={inst.id} inst={inst} linhas={linhas} />)
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Pagina principal
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

  function registroStatusDaSemana(semana: number): StatusSemanalRegistro | undefined {
    return statusSemanas.find((s) => s.semana === semana && !s.turmaId);
  }

  function registroStatusDaTurma(semana: number, turmaId: string): StatusSemanalRegistro | undefined {
    return statusSemanas.find((s) => s.semana === semana && s.turmaId === turmaId);
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
      ({ turma }) => !registros.some((r) => r.turmaId === turma.id && r.semana === semana) && !registroStatusDaTurma(semana, turma.id)
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
    return instrutores.find((i) => i.id === id)?.nome ?? "-";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          Presenca Semanal por Modalidade - {MESES[mes]}/{ano}
          <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setAno((a) => a - 1)} style={{ padding: "2px 8px", fontSize: 14, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", cursor: "pointer" }}>{"\u25C0"}</button>
            <button onClick={() => setAno((a) => a + 1)} style={{ padding: "2px 8px", fontSize: 14, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", cursor: "pointer" }}>{"\u25B6"}</button>
          </span>
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>Registro manual do total de alunos por turma, semana a semana</p>
      </div>

      {/* Abas de mes + botao de terceirizados */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {MESES.map((nome, i) => (
            <button
              key={nome}
              onClick={() => setMes(i)}
              style={{
                fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 8,
                border: `1px solid ${mes === i ? "var(--color-primary)" : "var(--border-default)"}`,
                background: mes === i ? "var(--color-primary)" : "var(--background-primary)",
                color: mes === i ? "#ffffff" : "var(--text-primary)", cursor: "pointer",
              }}
            >
              {nome}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          <button
            onClick={() => setTerceirizadosAberto(true)}
            style={{
              fontSize: 13, fontWeight: 700, padding: "9px 16px", borderRadius: 8,
              border: `1px solid ${COR_AMARELO_QUEIMADO}`, background: COR_AMARELO_QUEIMADO,
              color: "#ffffff", cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            {"\u{1F465}"} Aulas dos Terceirizados
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, fontSize: 11, fontWeight: 700, flexWrap: "wrap" }}>
        <span style={{ color: COR_LEGENDA.futura }}>Futura</span>
        <span style={{ color: COR_LEGENDA.atualCompleta }}>Atual/Completa</span>
        <span style={{ color: COR_LEGENDA.pendente }}>Pendente (semana passada)</span>
      </div>

      {turmasComModalidade.length === 0 && (
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
      )}

      {/* Botoes de semana */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {semanas.map((semana) => {
          const { label } = calcularFaixaSemana(ano, mes, semana);
          const status = statusSemana(ano, mes, semana, turmasComModalidade, registros, registroStatusDaSemana(semana)?.status);
          const corBorda =
    status === "atual" ? "#22c55e"
  : status === "completa" ? "#22c55e"
  : status === "futura" ? "#3b82f6"
  : status === "pendente" ? "#dc2626"
  : STATUS_CONFIG[status as StatusSemana].cor;
          return (
            <button
              key={semana}
              onClick={() => setSemanaAberta(semana)}
              className="apusm-card"
              style={{ padding: "14px 18px", borderRadius: 12, border: `2px solid ${corBorda}`, background: "var(--background-primary)", cursor: "pointer", textAlign: "left", minWidth: 160 }}
            >
              <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 2px", color: "var(--text-primary)" }}>{ORDINAL[semana - 1]} SEMANA</p>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{label}</p>
              {(() => {
                const pendentes = turmasNaoPreenchidas(semana);
                if (pendentes.length === 0) return null;
                return (
                  <p style={{ fontSize: 11, fontWeight: 700, color: COR_LEGENDA.pendente, margin: "4px 0 0" }} title={pendentes.map(({ turma }) => `${DIA_LABEL[turma.dia]} ${turma.horario}`).join(", ")}>
                    {pendentes.length} turma(s) pendente(s)
                  </p>
                );
              })()}
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
          registroSemana={registroStatusDaSemana(semanaAberta)}
          onDefinirStatus={handleDefinirStatus}
          turmasNaoPreenchidas={turmasNaoPreenchidas(semanaAberta)}
          registroDaTurma={(turmaId) => registroStatusDaTurma(semanaAberta, turmaId)}
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
