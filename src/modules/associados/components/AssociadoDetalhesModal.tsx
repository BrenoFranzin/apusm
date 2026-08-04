// ======================================================
// APUSM SaaS — Modal grande de Associado
// Arquivo: AssociadoDetalhesModal.tsx
// Busca, matricula, historico e posicao na fila
// ======================================================

import { useEffect, useState } from "react";
import { associadosService } from "../services/associados.service";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Associado } from "../types/associado.types";
import type { EntradaListaEspera } from "@/modules/lista-espera/types/listaEspera.types";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

const DIA_LABEL: Record<string, string> = {
  seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado",
};

export default function AssociadoDetalhesModal({ aberto, onFechar }: Props) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Associado[]>([]);
  const [selecionado, setSelecionado] = useState<Associado | null>(null);
  const [filas, setFilas] = useState<EntradaListaEspera[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [turmaEscolhida, setTurmaEscolhida] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    turmasService.listar().then(setTurmas);
    modalidadesService.listar().then(setModalidades);
  }, [aberto]);

  async function handleBuscar(texto: string) {
    setBusca(texto);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const lista = await associadosService.pesquisar(texto);
    setResultados(lista);
  }

  async function handleSelecionar(associado: Associado) {
    setSelecionado(associado);
    setResultados([]);
    setBusca(associado.nome);
    const entradas = await listaEsperaService.listarPorAssociado(associado.id);
    setFilas(entradas);
    setAviso(null);
  }

  async function recarregarSelecionado() {
    if (!selecionado) return;
    const atualizado = await associadosService.buscarPorId(selecionado.id);
    if (atualizado) setSelecionado(atualizado);
    const entradas = await listaEsperaService.listarPorAssociado(selecionado.id);
    setFilas(entradas);
  }

  async function handleInserirNaTurma() {
    if (!selecionado || !turmaEscolhida) return;
    const turma = turmas.find((t) => t.id === turmaEscolhida);
    if (!turma) return;
    const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);

    try {
      const resultado = await associadosService.matricular(selecionado.id, {
        turmaId: turma.id,
        turmaNome: `${DIA_LABEL[turma.dia]} ${turma.horario}`,
        modalidadeId: turma.modalidadeId,
        modalidadeNome: modalidade?.nome ?? "",
      });

      if (resultado.status === "LISTA_ESPERA") {
        setAviso(`Turma cheia. Entrou na lista de espera na posição ${resultado.posicaoFila}.`);
      } else {
        setAviso("Matriculado com sucesso.");
      }
      setTurmaEscolhida("");
      await recarregarSelecionado();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Erro ao matricular");
    }
  }

  async function handleCancelar(matriculaId: string) {
    if (!selecionado) return;
    await associadosService.cancelarMatricula(selecionado.id, matriculaId);
    await recarregarSelecionado();
  }

  if (!aberto) return null;

  const matriculasAtivas = selecionado?.matriculas.filter((m) => m.status !== "CANCELADA") ?? [];
  const historicoOrdenado = [...(selecionado?.historico ?? [])].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
      onClick={onFechar}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--background-primary)", borderRadius: 16,
          width: "95vw", maxWidth: 1100, height: "90vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
            Buscar e gerenciar associado
          </h2>
          <button onClick={onFechar} style={{ fontSize: 18, border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
            ✕
          </button>
        </div>

        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              value={busca}
              onChange={(e) => handleBuscar(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-default)", fontSize: 14 }}
            />
            {resultados.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 240, overflowY: "auto" }}>
                {resultados.map((a) => (
                  <div key={a.id} onClick={() => handleSelecionar(a)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid var(--border-light)" }}>
                    {a.nome} — {a.telefone}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!selecionado && <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Busque um associado pra ver detalhes.</p>}

          {selecionado && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{selecionado.nome}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selecionado.telefone} — Status: {selecionado.status}
                </p>

                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <select
                    value={turmaEscolhida}
                    onChange={(e) => setTurmaEscolhida(e.target.value)}
                    style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--border-default)" }}
                  >
                    <option value="">Selecione uma turma para inserir...</option>
                    {turmas.map((t) => {
                      const mod = modalidades.find((m) => m.id === t.modalidadeId);
                      return (
                        <option key={t.id} value={t.id}>
                          {mod?.nome ?? "Modalidade"} — {DIA_LABEL[t.dia]} {t.horario}
                        </option>
                      );
                    })}
                  </select>
                  <button
                    onClick={handleInserirNaTurma}
                    disabled={!turmaEscolhida}
                    style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-primary)", color: "#fff", cursor: "pointer" }}
                  >
                    Inserir
                  </button>
                </div>
                {aviso && <p style={{ fontSize: 13, color: "var(--color-primary)" }}>{aviso}</p>}
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  Turmas matriculadas ({matriculasAtivas.length})
                </p>
                {matriculasAtivas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma turma ativa.</p>}
                {matriculasAtivas.map((m) => (
                  <div key={m.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{m.modalidadeNome} — {m.turmaNome}</span>
                    <button onClick={() => handleCancelar(m.id)} style={{ fontSize: 12, border: "none", background: "var(--color-danger)", color: "#fff", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  Listas de espera ({filas.length})
                </p>
                {filas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Não está em nenhuma fila.</p>}
                {filas.map((f) => (
                  <div key={f.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)" }}>
                    {f.modalidadeNome} — {f.turmaNome} — <strong>{f.posicao}º lugar</strong>
                  </div>
                ))}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  Histórico de modificações ({historicoOrdenado.length})
                </p>
                {historicoOrdenado.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma modificação registrada ainda.</p>}
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {historicoOrdenado.map((h) => (
                    <div key={h.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>
                        {new Date(h.data).toLocaleString("pt-BR")}
                      </span>
                      {" — "}{h.descricao}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}