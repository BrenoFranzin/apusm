// ======================================================
// APUSM SaaS — Módulo Turmas
// Arquivo: TurmasPage.tsx
// Gerenciamento de Salas movido para Configurações
// Somente visualização (excluir fica em Modalidades)
// ======================================================

import { useEffect, useState } from "react";

import { useTurmas } from "../hooks/useTurmas";
import TurmaForm from "../components/TurmaForm";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useSalas } from "@/modules/salas/hooks/useSalas";
import { useAssociados } from "@/modules/associados/hooks/useAssociados";
import { associadosService } from "@/modules/associados/services/associados.service";
import type { Turma } from "../types/turma.types";
import { pdfService } from "@/modules/configuracoes/services/pdf.service";

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
  const { turmas, criar, editar, excluir, erro } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { salas } = useSalas();
  const { todos: associados, carregar: recarregarAssociados } = useAssociados();

  const [modalLimite, setModalLimite] = useState<{
    turma: Turma;
    novoLimite: number;
    matriculados: { id: string; nome: string; matriculaId: string }[];
  } | null>(null);

  const [agora, setAgora] = useState<{ dia: string; hhmm: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [avisadas, setAvisadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    function atualizarHoraLocal() {
      const dt = new Date();
      const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
      const dia = diasSemana[dt.getDay()];
      const hhmm = `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
      setAgora({ dia, hhmm });
    }
    atualizarHoraLocal();
    const intervalo = setInterval(atualizarHoraLocal, 30000);
    return () => clearInterval(intervalo);
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

  function minutosAte(dia: string, horario: string) {
    if (!agora || agora.dia !== dia) return null;
    const [hAtual, mAtual] = agora.hhmm.split(":").map(Number);
    const [hAlvo, mAlvo] = horario.split(":").map(Number);
    return (hAlvo * 60 + mAlvo) - (hAtual * 60 + mAtual);
  }

  useEffect(() => {
    if (!agora) return;
    const proximas = turmas.filter((t) => {
      const min = minutosAte(t.dia, t.horario);
      return min !== null && min >= 0 && min <= 10;
    });

    const chaveMinuto = `${agora.dia}|${agora.hhmm}`;
    if (proximas.length > 0 && !avisadas.has(chaveMinuto)) {
      const nomes = proximas
        .map((t) => modalidades.find((m) => m.id === t.modalidadeId)?.nome)
        .filter(Boolean)
        .join(" e ");
      if (nomes) {
        setToast(`Daqui 10 min começará a(s) modalidade(s) ${nomes}`);
        setAvisadas((prev) => new Set(prev).add(chaveMinuto));
        setTimeout(() => setToast(null), 15000);
      }
    }
  }, [agora, turmas, modalidades, avisadas]);

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
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#1d4ed8",
            color: "#000",
            fontFamily: "Calibri, sans-serif",
            padding: "14px 20px",
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 2000,
            maxWidth: 360,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {toast}
        </div>
      )}

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
          <div
            onClick={() => setMostrarForm(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
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
            </div>
          </div>
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
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Limite vagas</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Linhas extras</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-secondary)" }}>Ações</th>
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
                        background: emAndamento ? "rgba(34,197,94,0.12)" : "transparent",
                        boxShadow: emAndamento ? "inset 5px 0 0 #22c55e" : "none",
                      }}
                    >
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{turma.horario}</span>
                        {emAndamento && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: "#fff", fontWeight: 700, background: "#22c55e", padding: "2px 8px", borderRadius: 999 }}>● Agora</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: cor, display: "inline-block", flexShrink: 0 }} />
                          {modalidade ? `${modalidade.icone} ${modalidade.nome}` : "Modalidade removida"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <select
                          value={turma.instrutorId ?? ""}
                          onChange={(e) => editar(turma.id, { instrutorId: e.target.value })}
                          style={{
                            padding: "4px 6px",
                            borderRadius: 6,
                            border: "1px solid var(--border-default)",
                            background: "var(--background-secondary)",
                            color: "var(--text-primary)",
                            fontSize: 13,
                          }}
                        >
                          <option value="">Sem instrutor</option>
                          {instrutores.map((i) => (
                            <option key={i.id} value={i.id}>{i.nome}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 8px", color: "var(--text-primary)" }}>
                        {turma.sala}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <input
                          type="number"
                          min={1}
                          defaultValue={turma.limiteVagas}
                          onBlur={(e) => {
                            const valor = Number(e.target.value);
                            if (valor <= 0 || valor === turma.limiteVagas) return;

                            const nomeModalidade = modalidades.find((m) => m.id === turma.modalidadeId)?.nome ?? "";
                            const infantil = /infantil|musicaliza/i.test(nomeModalidade);
                            const temObs = Boolean(modalidades.find((m) => m.id === turma.modalidadeId)?.descricao);
                            const capacidade = pdfService.calcularCapacidadeTurma(turma.dia, infantil, temObs, valor, turma.limiteNovosAlunos ?? 0);

                            if (!capacidade.cabe) {
                              window.alert(
                                `Limite da folha: ${capacidade.maxLinhas} linhas.\n` +
                                `Você configurou ${capacidade.linhasConfiguradas} (${valor} vagas + ${turma.limiteNovosAlunos ?? 0} extras).\n` +
                                `Reduza ${capacidade.excedente} para caber.`
                              );
                              e.target.value = String(turma.limiteVagas ?? "");
                              return;
                            }

                            const matriculadosDaTurma = associados
                              .map((a) => ({
                                associado: a,
                                matricula: a.matriculas.find((m) => m.turmaId === turma.id && m.status !== "CANCELADA"),
                              }))
                              .filter((x) => x.matricula);

                            if (valor < matriculadosDaTurma.length) {
                              setModalLimite({
                                turma,
                                novoLimite: valor,
                                matriculados: matriculadosDaTurma.map((x) => ({
                                  id: x.associado.id,
                                  nome: x.associado.nome,
                                  matriculaId: x.matricula!.id,
                                })),
                              });
                              e.target.value = String(turma.limiteVagas ?? "");
                            } else {
                              editar(turma.id, { limiteVagas: valor });
                            }
                          }}
                          style={{ width: 60, padding: 4, textAlign: "center", background: "var(--background-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <input
                          type="number"
                          min={0}
                          defaultValue={turma.limiteNovosAlunos ?? 0}
                          onBlur={(e) => {
                            const valor = Number(e.target.value);
                            if (valor < 0 || valor === (turma.limiteNovosAlunos ?? 0)) return;

                            const nomeModalidade = modalidades.find((m) => m.id === turma.modalidadeId)?.nome ?? "";
                            const infantil = /infantil|musicaliza/i.test(nomeModalidade);
                            const temObs = Boolean(modalidades.find((m) => m.id === turma.modalidadeId)?.descricao);
                            const capacidade = pdfService.calcularCapacidadeTurma(turma.dia, infantil, temObs, turma.limiteVagas ?? 10, valor);

                            if (!capacidade.cabe) {
                              window.alert(
                                `Limite da folha: ${capacidade.maxLinhas} linhas.\n` +
                                `Você configurou ${capacidade.linhasConfiguradas} (${turma.limiteVagas} vagas + ${valor} extras).\n` +
                                `Reduza ${capacidade.excedente} para caber.`
                              );
                              e.target.value = String(turma.limiteNovosAlunos ?? 0);
                              return;
                            }

                            editar(turma.id, { limiteNovosAlunos: valor });
                          }}
                          style={{ width: 60, padding: 4, textAlign: "center", background: "var(--background-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: 6 }}
                        />
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <button
                          onClick={() => {
                            const confirmar = window.confirm(
                              `Excluir esta turma (${DIA_LABEL[turma.dia]} ${turma.horario})? Essa acao nao pode ser desfeita.`
                            );
                            if (confirmar) excluir(turma.id);
                          }}
                          style={{ fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, padding: "6px 12px", background: "var(--color-danger)", color: "#fff", cursor: "pointer" }}
                        >
                          Excluir
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

      {modalLimite && (
        <div
          onClick={() => setModalLimite(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--background-primary)", borderRadius: 12, padding: 20, width: "90vw", maxWidth: 480 }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "var(--text-primary)" }}>
              ⚠ Turma com mais alunos que o novo limite
            </p>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
              Essa turma tem {modalLimite.matriculados.length} matriculado(s), mas o novo limite é {modalLimite.novoLimite}.
              Escolha quem deve sair pra aplicar a mudança:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, maxHeight: "40vh", overflowY: "auto" }}>
              {modalLimite.matriculados.map((m) => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", border: "1px solid var(--border-default)", borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{m.nome}</span>
                  <button
                    onClick={async () => {
                      await associadosService.cancelarMatricula(m.id, m.matriculaId);
                      window.alert(`${m.nome} foi removido(a) da turma com sucesso.`);
                      const restantes = modalLimite.matriculados.filter((x) => x.id !== m.id);
                      if (restantes.length <= modalLimite.novoLimite) {
                        await editar(modalLimite.turma.id, { limiteVagas: modalLimite.novoLimite });
                        setModalLimite(null);
                      } else {
                        setModalLimite({ ...modalLimite, matriculados: restantes });
                      }
                    }}
                    style={{ fontSize: 12, fontWeight: 600, border: "none", borderRadius: 6, padding: "6px 12px", background: "var(--color-danger)", color: "#fff", cursor: "pointer" }}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModalLimite(null)}
              style={{ width: "100%", fontSize: 14, fontWeight: 600, border: "1px solid var(--border-default)", borderRadius: 8, padding: "10px 12px", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
            >
              Cancelar (não mudar o limite)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

