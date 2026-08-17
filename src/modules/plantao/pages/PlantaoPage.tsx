// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: PlantaoPage.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
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
const BORDA_GRADE = "2px solid #1e293b";

function ehModoEscuro() {
  return document.documentElement.classList.contains("dark");
}

function ajustarCorParaTema(cor: string, escuro: boolean) {
  if (!escuro) return cor;
  const r = parseInt(cor.slice(1, 3), 16);
  const g = parseInt(cor.slice(3, 5), 16);
  const b = parseInt(cor.slice(5, 7), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminancia >= 0.45) return cor;
  const clarear = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.8));
  const hex = (v: number) => clarear(v).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}


export default function PlantaoPage() {
  const { entradas, adicionar, remover, definirEmMassa } = usePlantao();
  const { instrutores } = useInstrutores();
  const { turmas } = useTurmas();
  const [instrutoresFiltro, setInstrutoresFiltro] = useState<Set<string>>(new Set());
  const [modalAberto, setModalAberto] = useState(false);
  const [instrutorMassa, setInstrutorMassa] = useState("");
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [celulaRapida, setCelulaRapida] = useState<{ dia: string; horario: string } | null>(null);
  const [instrutorRapido, setInstrutorRapido] = useState("");

  const [escuro, setEscuro] = useState(ehModoEscuro());

useEffect(() => {
  const obs = new MutationObserver(() => setEscuro(ehModoEscuro()));
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}, []);

  const entradasFiltradas = useMemo(() => {
    if (instrutoresFiltro.size === 0) return entradas;
    return entradas.filter((e) => instrutoresFiltro.has(e.instrutorId));
  }, [entradas, instrutoresFiltro]);

  function toggleInstrutorFiltro(id: string) {
    setInstrutoresFiltro((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

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
    const jaExiste = entradas.some(
      (e) => e.instrutorId === instrutorRapido && e.dia === celulaRapida.dia && e.horario === celulaRapida.horario
    );
    if (jaExiste) {
      window.alert(`${nomeInstrutor(instrutorRapido)} ja esta no plantao de ${NOME_DIA[celulaRapida.dia]} as ${celulaRapida.horario}.`);
      return;
    }
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => setInstrutoresFiltro(new Set())}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: instrutoresFiltro.size === 0 ? "2px solid var(--color-primary)" : "1px solid var(--border-default)",
                background: instrutoresFiltro.size === 0 ? "var(--color-primary)" : "var(--background-primary)",
                color: instrutoresFiltro.size === 0 ? "#fff" : "var(--text-primary)",
                transition: "all 0.15s ease",
              }}
            >
              Todos
            </button>
            {instrutores.filter((i) => !i.terceirizado).map((i) => {
              const ativo = instrutoresFiltro.has(i.id);
              const corAjustada = ajustarCorParaTema(i.cor, escuro);
              return (
                <button
                  key={i.id}
                  onClick={() => toggleInstrutorFiltro(i.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    border: `2px solid ${corAjustada}`,
                    background: ativo ? corAjustada : "var(--background-primary)",
                    color: ativo ? "#fff" : corAjustada,
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
                                background: emAula ? "#F97316" : corInstrutor(e.instrutorId),
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
        <div
          onClick={() => setModalAberto(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 16 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="apusm-card"
            style={{ maxWidth: 820, width: "100%", background: "var(--background-tertiary)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
          >
            <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 12, color: "var(--text-primary)" }}>Inserir plantão em massa</h2>

            <label style={{ fontSize: 13, color: "var(--text-secondary)" }}>Instrutor</label>
            <select
              value={instrutorMassa}
              onChange={(e) => trocarInstrutorMassa(e.target.value)}
              style={{ width: "100%", maxWidth: 400, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)", borderRadius: 6, padding: 8, margin: "4px 0 14px" }}
            >
              {instrutores.filter((i) => !i.terceirizado).map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>

            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
              Marque todos os dias/horários em que ele deve entrar no plantão.
            </p>

            <div style={{ overflowX: "auto", width: "100%", display: "flex", justifyContent: "center" }}>
              <table style={{ borderCollapse: "collapse", tableLayout: "fixed", minWidth: 520 }}>
                <colgroup>
                  <col style={{ width: 70 }} />
                  {ORDEM_DIAS.map((d) => <col key={d} style={{ width: 90 }} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ border: "2px solid #1e293b", padding: 8, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#fff", background: "var(--color-primary)" }}>Horário</th>
                    {ORDEM_DIAS.map((d) => (
                      <th key={d} style={{ border: "2px solid #1e293b", padding: 8, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#fff", background: "var(--color-primary)" }}>{NOME_DIA[d]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map((horario) => (
                    <tr key={horario}>
                      <td style={{ border: "2px solid #1e293b", padding: 8, fontWeight: 700, fontSize: 13, textAlign: "center", color: "#fff", background: "var(--color-primary-hover)" }}>{horario}</td>
                      {ORDEM_DIAS.map((dia) => {
                        const chave = `${dia}|${horario}`;
                        const marcado = marcados.has(chave);
                        const emAula = instrutorMassa ? tambemDandoAula(instrutorMassa, dia, horario) : false;
                        const corFundo = marcado
                          ? (emAula ? "#F97316" : "var(--color-primary)")
                          : (emAula ? "#B45309" : "var(--background-primary)");
                        return (
                          <td
                            key={dia}
                            onClick={() => toggleCelula(dia, horario)}
                            title={emAula ? "Instrutor já dá aula neste horário" : undefined}
                            style={{
                              border: "2px solid #1e293b",
                              padding: 0,
                              height: 34,
                              width: 90,
                              textAlign: "center",
                              cursor: "pointer",
                              background: corFundo,
                              color: marcado || emAula ? "#fff" : "var(--text-primary)",
                              fontSize: 15,
                              fontWeight: 700,
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

            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
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