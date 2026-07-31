// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: PlantaoPage.tsx
// ======================================================

import { useMemo, useState } from "react";
import { usePlantao } from "../hooks/usePlantao";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { DiaSemanaPlantao } from "../types/plantao.types";

const NOME_DIA: Record<string, string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta",
};

const ORDEM_DIAS: DiaSemanaPlantao[] = [
  DiaSemanaPlantao.SEG, DiaSemanaPlantao.TER, DiaSemanaPlantao.QUA, DiaSemanaPlantao.QUI, DiaSemanaPlantao.SEX,
];

function gerarHorarios(): string[] {
  const lista: string[] = [];
  for (let h = 6; h <= 21; h++) lista.push(String(h).padStart(2, "0") + ":00");
  return lista;
}

const HORARIOS = gerarHorarios();
const BORDA_GRADE = "2px solid #94a3b8";

export default function PlantaoPage() {
  const { entradas, adicionar, remover, definirEmMassa } = usePlantao();
  const { instrutores } = useInstrutores();
  const { turmas } = useTurmas();
  const [instrutorFiltro, setInstrutorFiltro] = useState("TODOS");
  const [modalAberto, setModalAberto] = useState(false);
  const [instrutorMassa, setInstrutorMassa] = useState("");
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [celulaRapida, setCelulaRapida] = useState<{ dia: string; horario: string } | null>(null);
  const [instrutorRapido, setInstrutorRapido] = useState("");

  const entradasFiltradas = useMemo(() => {
    if (instrutorFiltro === "TODOS") return entradas;
    return entradas.filter((e) => e.instrutorId === instrutorFiltro);
  }, [entradas, instrutorFiltro]);

  function nomeInstrutor(id: string) {
    return instrutores.find((i) => i.id === id)?.nome ?? "-";
  }

  function corInstrutor(id: string) {
    return instrutores.find((i) => i.id === id)?.cor ?? "#888";
  }

  function tambemDandoAula(instrutorId: string, dia: string, horario: string) {
    return turmas.some(
      (t) => t.instrutorId === instrutorId && t.dia === dia && t.horario === horario
    );
  }

  function abrirMassa() {
    const primeiro = instrutores[0]?.id ?? "";
    setInstrutorMassa(primeiro);
    const jaMarcados = new Set(
      entradas.filter((e) => e.instrutorId === primeiro).map((e) => `${e.dia}|${e.horario}`)
    );
    setMarcados(jaMarcados);
    setModalAberto(true);
  }

  function trocarInstrutorMassa(id: string) {
    setInstrutorMassa(id);
    const jaMarcados = new Set(
      entradas.filter((e) => e.instrutorId === id).map((e) => `${e.dia}|${e.horario}`)
    );
    setMarcados(jaMarcados);
  }

  function toggleCelula(dia: string, horario: string) {
    const chave = `${dia}|${horario}`;
    setMarcados((prev) => {
      const novo = new Set(prev);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function abrirAdicaoRapida(dia: string, horario: string) {
    setCelulaRapida({ dia, horario });
    setInstrutorRapido(instrutores[0]?.id ?? "");
  }

  async function confirmarAdicaoRapida() {
    if (!celulaRapida || !instrutorRapido) return;
    await adicionar(instrutorRapido, celulaRapida.dia as DiaSemanaPlantao, celulaRapida.horario);
    setCelulaRapida(null);
  }

  async function salvarMassa() {
    const novasEntradas = Array.from(marcados).map((chave) => {
      const [dia, horario] = chave.split("|");
      return { dia: dia as DiaSemanaPlantao, horario };
    });
    await definirEmMassa(instrutorMassa, novasEntradas);
    setModalAberto(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)" }}>Plantão de Serviço</h1>
          <p style={{ color: "var(--page-subheading)" }}>Horário de trabalho dos instrutores (separado das turmas)</p>
        </div>
        <button
          onClick={abrirMassa}
          style={{ background: "var(--color-primary)", color: "#fff", padding: "10px 18px", borderRadius: 8, border: "none", fontWeight: 600 }}
        >
          🗓️ Inserir em massa
        </button>
      </div>

      <div className="apusm-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
            Filtrar por instrutor
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              onClick={() => setInstrutorFiltro("TODOS")}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: instrutorFiltro === "TODOS" ? "2px solid var(--color-primary)" : "1px solid var(--border-default)",
                background: instrutorFiltro === "TODOS" ? "var(--color-primary)" : "var(--background-primary)",
                color: instrutorFiltro === "TODOS" ? "#fff" : "var(--text-primary)",
                transition: "all 0.15s ease",
              }}
            >
              Todos
            </button>
            {instrutores.map((i) => {
              const ativo = instrutorFiltro === i.id;
              return (
                <button
                  key={i.id}
                  onClick={() => setInstrutorFiltro(i.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: ativo ? `2px solid ${i.cor}` : "1px solid var(--border-default)",
                    background: ativo ? i.cor : "var(--background-primary)",
                    color: ativo ? "#fff" : "var(--text-primary)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {i.nome}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "1.5px solid var(--text-secondary)",
              background: "#fff",
              fontSize: 9,
            }}
          >
            •
          </span>
          Também está dando aula neste horário
        </div>
      </div>

      <div className="apusm-card overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", minWidth: 760 }}>
          <colgroup>
            <col style={{ width: 80 }} />
            {ORDEM_DIAS.map((d) => <col key={d} style={{ width: 130 }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ border: BORDA_GRADE, padding: 10, background: "var(--color-primary)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#fff", letterSpacing: 0.5 }}>
                Horário
              </th>
              {ORDEM_DIAS.map((dia) => (
                <th key={dia} style={{ border: BORDA_GRADE, padding: 10, background: "var(--color-primary)", fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: "#fff", letterSpacing: 0.5 }}>
                  {NOME_DIA[dia]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS.map((horario) => (
              <tr key={horario}>
                <td style={{ border: BORDA_GRADE, padding: 8, textAlign: "center", fontWeight: 700, background: "var(--color-primary-hover)", color: "#fff" }}>
                  {horario}
                </td>
                {ORDEM_DIAS.map((dia) => {
                  const doDiaHora = entradasFiltradas.filter((e) => e.dia === dia && e.horario === horario);
                  const duasColunas = doDiaHora.length > 4;
                  return (
                    <td key={dia} style={{ border: BORDA_GRADE, padding: 4, verticalAlign: "middle" }}>
                      <div
                        style={{
                          display: duasColunas ? "grid" : "flex",
                          gridTemplateColumns: duasColunas ? "1fr 1fr" : undefined,
                          flexDirection: duasColunas ? undefined : "column",
                          gap: 3,
                          minHeight: 30,
                          justifyItems: "center",
                          alignItems: "center",
                        }}
                      >
                        {doDiaHora.map((e) => {
                          const emAula = tambemDandoAula(e.instrutorId, e.dia, e.horario);
                          return (
                            <span
                              key={e.id}
                              onClick={() => {
                                if (window.confirm(`Remover ${nomeInstrutor(e.instrutorId)} do plantão de ${NOME_DIA[e.dia]} às ${e.horario}?`)) {
                                  remover(e.instrutorId, e.dia, e.horario);
                                }
                              }}
                              title={emAula ? "Também está dando aula neste horário. Clique para remover do plantão." : "Clique para remover"}
                              style={{
                                position: "relative",
                                display: "inline-block",
                                width: "fit-content",
                                background: corInstrutor(e.instrutorId),
                                color: "#fff",
                                borderRadius: 999,
                                padding: emAula ? "2px 16px 2px 8px" : "2px 8px",
                                fontSize: 11,
                                whiteSpace: "nowrap",
                                textAlign: "center",
                                cursor: "pointer",
                                border: "1px solid rgba(255,255,255,0.35)",
                                boxShadow: emAula
                                  ? "0 0 0 2px #fff, 0 0 0 3.5px " + corInstrutor(e.instrutorId)
                                  : "0 0 0 1px rgba(0,0,0,0.2)",
                              }}
                            >
                              {nomeInstrutor(e.instrutorId)}
                              {emAula && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 2,
                                    right: 3,
                                    width: 7,
                                    height: 7,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    border: "1px solid #000",
                                  }}
                                />
                              )}
                            </span>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => abrirAdicaoRapida(dia, horario)}
                        title="Adicionar instrutor"
                        style={{
                          width: "100%",
                          marginTop: 4,
                          border: "1px dashed var(--border-default)",
                          borderRadius: 6,
                          background: "none",
                          color: "var(--text-secondary)",
                          cursor: "pointer",
                          fontSize: 13,
                          padding: "2px 0",
                        }}
                      >
                        +
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div className="apusm-card" style={{ maxWidth: 640, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 12, color: "var(--text-primary)" }}>Inserir plantão em massa</h2>

            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Instrutor</label>
            <select
              value={instrutorMassa}
              onChange={(e) => trocarInstrutorMassa(e.target.value)}
              style={{ width: "100%", border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", borderRadius: 6, padding: 8, margin: "4px 0 14px" }}
            >
              {instrutores.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
              Marque todos os dias/horários em que ele deve entrar no plantão.
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", minWidth: 520 }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid var(--border-default)", padding: 6, fontSize: 11, color: "var(--text-secondary)" }}>Horário</th>
                    {ORDEM_DIAS.map((d) => (
                      <th key={d} style={{ border: "1px solid var(--border-default)", padding: 6, fontSize: 11, color: "var(--text-secondary)" }}>{NOME_DIA[d]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map((horario) => (
                    <tr key={horario}>
                      <td style={{ border: "1px solid var(--border-default)", padding: 6, fontWeight: 600, textAlign: "center", color: "var(--text-primary)" }}>{horario}</td>
                      {ORDEM_DIAS.map((dia) => {
                        const chave = `${dia}|${horario}`;
                        const marcado = marcados.has(chave);
                        return (
                          <td
                            key={dia}
                            onClick={() => toggleCelula(dia, horario)}
                            style={{
                              border: "1px solid var(--border-default)",
                              padding: 6,
                              textAlign: "center",
                              cursor: "pointer",
                              background: marcado ? "var(--color-primary)" : "var(--background-primary)",
                            }}
                          >
                            {marcado ? "✓" : ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button onClick={() => setModalAberto(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)" }}>
                Cancelar
              </button>
              <button onClick={salvarMassa} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-primary)", color: "#fff", fontWeight: 600 }}>
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {celulaRapida && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}>
          <div className="apusm-card" style={{ maxWidth: 360, width: "100%" }}>
            <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: "var(--text-primary)" }}>
              Adicionar ao plantão
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
              {NOME_DIA[celulaRapida.dia]} às {celulaRapida.horario}
            </p>

            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Instrutor</label>
            <select
              value={instrutorRapido}
              onChange={(e) => setInstrutorRapido(e.target.value)}
              style={{ width: "100%", border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", borderRadius: 6, padding: 8, margin: "4px 0 16px" }}
            >
              {instrutores.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setCelulaRapida(null)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)" }}>
                Cancelar
              </button>
              <button onClick={confirmarAdicaoRapida} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-primary)", color: "#fff", fontWeight: 600 }}>
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}