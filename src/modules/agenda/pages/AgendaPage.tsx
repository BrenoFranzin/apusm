import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import { useInstrutores } from "@/modules/instrutores/hooks/useInstrutores";
import { useSalas } from "@/modules/salas/hooks/useSalas";
import { DiaSemana } from "@/modules/turmas/types/turma.types";
import TurmaForm from "@/modules/turmas/components/TurmaForm";

const NOME_DIA: Record<string, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
};

const ORDEM_DIAS: DiaSemana[] = [
  DiaSemana.SEG,
  DiaSemana.TER,
  DiaSemana.QUA,
  DiaSemana.QUI,
  DiaSemana.SEX,
  DiaSemana.SAB,
];

const inputStyle: CSSProperties = {
  border: "1px solid var(--border-default)",
  background: "var(--background-primary)",
  color: "var(--text-primary)",
  borderRadius: 6,
  padding: 8,
};

export default function AgendaPage() {
  const navigate = useNavigate();
  const { turmas, criar: criarTurma } = useTurmas();
  const { modalidades } = useModalidades();
  const { instrutores } = useInstrutores();
  const { salas: listaSalas } = useSalas();

  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<Set<string> | null>(null);
  const [salaFiltro, setSalaFiltro] = useState("TODAS");
  const [instrutorFiltro, setInstrutorFiltro] = useState("TODOS");
  const [mostrarFormTurma, setMostrarFormTurma] = useState(false);

  const salas = useMemo(
    () => Array.from(new Set(turmas.map((t) => t.sala))).sort(),
    [turmas]
  );

  const horarios = useMemo(() => {
    const set = new Set(turmas.map((t) => t.horario));
    return Array.from(set).sort();
  }, [turmas]);

  function passaFiltroModalidade(modalidadeId: string) {
    if (modalidadesSelecionadas === null) return true;
    return modalidadesSelecionadas.has(modalidadeId);
  }

  const turmasFiltradas = useMemo(() => {
    return turmas.filter((t) => {
      const okModalidade = passaFiltroModalidade(t.modalidadeId);
      const okSala = salaFiltro === "TODAS" || t.sala === salaFiltro;
      const okInstrutor = instrutorFiltro === "TODOS" || t.instrutorId === instrutorFiltro;
      return okModalidade && okSala && okInstrutor;
    });
  }, [turmas, modalidadesSelecionadas, salaFiltro, instrutorFiltro, passaFiltroModalidade]);

  function toggleModalidade(id: string) {
    setModalidadesSelecionadas((prev) => {
      const todasIds = modalidades.map((m) => m.id);
      const atual = prev === null ? new Set(todasIds) : new Set(prev);

      if (atual.has(id)) {
        atual.delete(id);
      } else {
        atual.add(id);
      }

      if (atual.size === todasIds.length) return null;
      return atual;
    });
  }

  function marcarTodas() {
    setModalidadesSelecionadas(null);
  }

  function desmarcarTodas() {
    setModalidadesSelecionadas(new Set());
  }

  return (
    <div className="space-y-6">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--page-heading)" }}>Agenda</h1>
          <p style={{ color: "var(--page-subheading)" }}>Grade semanal de turmas</p>
        </div>
        <button
          onClick={() => setMostrarFormTurma((v) => !v)}
          style={{ background: "var(--color-primary)", color: "#fff", padding: "10px 18px", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}
        >
          {mostrarFormTurma ? "Fechar" : "+ Nova aula"}
        </button>
      </div>

      {mostrarFormTurma && (
        <div className="apusm-card">
          <TurmaForm
            modalidades={modalidades}
            instrutores={instrutores}
            salas={listaSalas}
            onSubmit={async (dados) => {
              const ok = await criarTurma(dados);
              if (ok) setMostrarFormTurma(false);
            }}
          />
        </div>
      )}

      <div className="apusm-card space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-sm mr-2" style={{ color: "var(--text-secondary)" }}>Sala</label>
            <select value={salaFiltro} onChange={(e) => setSalaFiltro(e.target.value)} style={inputStyle}>
              <option value="TODAS">Todas</option>
              {salas.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm mr-2" style={{ color: "var(--text-secondary)" }}>Instrutor</label>
            <select value={instrutorFiltro} onChange={(e) => setInstrutorFiltro(e.target.value)} style={inputStyle}>
              <option value="TODOS">Todos</option>
              {instrutores.map((i) => (
                <option key={i.id} value={i.id}>{i.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Filtrar modalidades</span>
            <div className="flex gap-2">
              <button onClick={marcarTodas} className="text-xs rounded px-2 py-1" style={inputStyle}>Marcar todas</button>
              <button onClick={desmarcarTodas} className="text-xs rounded px-2 py-1" style={inputStyle}>Desmarcar todas</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {modalidades.map((m) => {
              const marcada = passaFiltroModalidade(m.id);
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer"
                  style={{
                    border: "1px solid " + (marcada ? m.cor : "var(--border-default)"),
                    background: "var(--background-primary)",
                  }}
                >
                  <input type="checkbox" checked={marcada} onChange={() => toggleModalidade(m.id)} />
                  <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: m.cor }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{m.nome}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="apusm-card agenda-grid-wrapper">
        <div className="agenda-grid">
          <div className="agenda-head-cell">Horário</div>
          {ORDEM_DIAS.map((dia) => (
            <div key={dia} className="agenda-head-cell">
              {NOME_DIA[dia]}
            </div>
          ))}

          {horarios.map((horario) => (
            <div key={horario} style={{ display: "contents" }}>
              <div className="agenda-time-cell">{horario}</div>

              {ORDEM_DIAS.map((dia) => {
                const turmasDaCelula = turmasFiltradas.filter(
                  (t) => t.dia === dia && t.horario === horario
                );

                return (
                  <div key={dia} className="agenda-day-cell">
                    {turmasDaCelula.map((t) => {
                      const modalidade = modalidades.find((m) => m.id === t.modalidadeId);
                      const instrutor = instrutores.find((i) => i.id === t.instrutorId);
                      return (
                        <div
                          key={t.id}
                          className="agenda-turma-card"
                          style={{
                            backgroundColor: modalidade ? modalidade.cor : "var(--text-disabled)",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                            border: "1px solid rgba(0,0,0,0.15)",
                          }}
                          title={t.sala}
                        >
                          <div className="agenda-turma-nome" style={{ fontWeight: 700 }}>{modalidade ? modalidade.nome : "-"}</div>
                          <div className="agenda-turma-info">{instrutor ? instrutor.nome : "-"}</div>
                          <div className="agenda-turma-info">{t.sala}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}