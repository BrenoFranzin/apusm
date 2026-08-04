// ======================================================
// APUSM SaaS — Modal grande de Associado
// Arquivo: AssociadoDetalhesModal.tsx
// Busca, matricula em lote, historico e posicao na fila
// ======================================================

import { useEffect, useState } from "react";
import { associadosService } from "../services/associados.service";
import { buscaAproximada } from "@/utils/textoBusca";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Associado } from "../types/associado.types";
import type { EntradaListaEspera } from "@/modules/lista-espera/types/listaEspera.types";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";

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
  const [turmasEscolhidas, setTurmasEscolhidas] = useState<string[]>([]);
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [inserindo, setInserindo] = useState(false);
  const [nomeParaCadastrar, setNomeParaCadastrar] = useState("");
  const [telefoneParaCadastrar, setTelefoneParaCadastrar] = useState("");
  const [cadastrando, setCadastrando] = useState(false);
  const [filasContagem, setFilasContagem] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!aberto) return;
    turmasService.listar().then(setTurmas);
    modalidadesService.listar().then(setModalidades);
  }, [aberto]);

  useEffect(() => {
    async function carregarContagens() {
      if (turmas.length === 0) return;
      const contagens: Record<string, number> = {};
      for (const t of turmas) {
        const fila = await listaEsperaService.listarPorTurma(t.id);
        contagens[t.id] = fila.length;
      }
      setFilasContagem(contagens);
    }
    carregarContagens();
  }, [turmas]);

  async function handleBuscar(texto: string) {
    setBusca(texto);
    setNomeParaCadastrar("");
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const todos = await associadosService.listar();
    const lista = todos.filter(
      (a) => buscaAproximada(texto, a.nome) || a.telefone.includes(texto)
    );
    setResultados(lista);
    if (lista.length === 0) {
      setNomeParaCadastrar(texto);
    }
  }

  async function handleCadastrarRapido() {
    if (!nomeParaCadastrar.trim()) return;
    setCadastrando(true);
    try {
      const novo = await associadosService.criar({
        nome: nomeParaCadastrar.trim(),
        telefone: telefoneParaCadastrar.trim(),
        status: "ATIVO",
      });
      setNomeParaCadastrar("");
      setTelefoneParaCadastrar("");
      await handleSelecionar(novo);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Erro ao cadastrar associado");
    } finally {
      setCadastrando(false);
    }
  }

  async function handleSelecionar(associado: Associado) {
    setSelecionado(associado);
    setResultados([]);
    setBusca(associado.nome);
    const entradas = await listaEsperaService.listarPorAssociado(associado.id);
    setFilas(entradas);
    setAviso(null);
    setTurmasEscolhidas([]);
  }

  async function recarregarSelecionado() {
    if (!selecionado) return;
    const atualizado = await associadosService.buscarPorId(selecionado.id);
    if (atualizado) setSelecionado(atualizado);
    const entradas = await listaEsperaService.listarPorAssociado(selecionado.id);
    setFilas(entradas);
  }

  function toggleTurmaEscolhida(turmaId: string) {
    setTurmasEscolhidas((prev) =>
      prev.includes(turmaId) ? prev.filter((id) => id !== turmaId) : [...prev, turmaId]
    );
  }

  async function handleInserirEmLote() {
    if (!selecionado || turmasEscolhidas.length === 0) return;
    setInserindo(true);

    let matriculados = 0;
    let naFila = 0;
    let erros = 0;

    for (const turmaId of turmasEscolhidas) {
      const turma = turmas.find((t) => t.id === turmaId);
      if (!turma) continue;
      const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);

      try {
        const resultado = await associadosService.matricular(selecionado.id, {
          turmaId: turma.id,
          turmaNome: `${DIA_LABEL[turma.dia]} ${turma.horario}`,
          modalidadeId: turma.modalidadeId,
          modalidadeNome: modalidade?.nome ?? "",
        });

        if (resultado.status === "LISTA_ESPERA") {
          naFila++;
        } else {
          matriculados++;
        }
      } catch {
        erros++;
      }
    }

    const partes: string[] = [];
    if (matriculados > 0) partes.push(`${matriculados} matrícula(s) confirmada(s)`);
    if (naFila > 0) partes.push(`${naFila} na lista de espera`);
    if (erros > 0) partes.push(`${erros} não puderam ser inseridas (limite atingido)`);

    setAviso(partes.join(" · "));
    setTurmasEscolhidas([]);
    setInserindo(false);
    await recarregarSelecionado();
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
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-default)", fontSize: 14, background: "var(--background-primary)", color: "var(--text-primary)" }}
            />
            {resultados.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 240, overflowY: "auto" }}>
                {resultados.map((a) => (
                  <div key={a.id} onClick={() => handleSelecionar(a)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
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
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "var(--text-primary)" }}>{selecionado.nome}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selecionado.telefone} — Status: {selecionado.status}
                </p>

                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
                  Inserir em várias turmas de uma vez
                </p>

                <div style={{ border: "1px solid var(--border-default)", borderRadius: 8, maxHeight: 260, overflowY: "auto", marginBottom: 8 }}>
                  {[...modalidades].sort((a, b) => a.nome.localeCompare(b.nome)).map((mod) => {
                    const turmasDaModalidade = turmas
                      .filter((t) => t.modalidadeId === mod.id)
                      .slice()
                      .sort((a, b) => a.dia.localeCompare(b.dia) || a.horario.localeCompare(b.horario));

                    if (turmasDaModalidade.length === 0) return null;

                    const qtdEscolhidas = turmasDaModalidade.filter((t) => turmasEscolhidas.includes(t.id)).length;
                    const estaAberto = grupoAberto === mod.id;

                    return (
                      <div key={mod.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <button
                          type="button"
                          onClick={() => setGrupoAberto(estaAberto ? null : mod.id)}
                          style={{
                            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "10px 12px", background: "none", border: "none", cursor: "pointer", textAlign: "left",
                          }}
                        >
                          <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                            <span>{mod.icone}</span>
                            <span style={{ fontWeight: 500 }}>{mod.nome}</span>
                            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>({turmasDaModalidade.length})</span>
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {qtdEscolhidas > 0 && (
                              <span style={{ fontSize: 11, background: "var(--color-success-light)", color: "var(--color-success)", padding: "3px 8px", borderRadius: 999 }}>
                                {qtdEscolhidas}
                              </span>
                            )}
                            <span style={{ color: "var(--text-secondary)" }}>{estaAberto ? "▲" : "▼"}</span>
                          </span>
                        </button>

                        {estaAberto && (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, padding: "8px 12px 12px", background: "var(--background-tertiary)" }}>
                            {turmasDaModalidade.map((t) => {
                              const marcada = turmasEscolhidas.includes(t.id);
                              return (
                                <label
                                  key={t.id}
                                  style={{
                                    display: "flex", alignItems: "center", gap: 6, fontSize: 13,
                                    border: `1px solid ${marcada ? "var(--color-success)" : "var(--border-default)"}`,
                                    borderRadius: 6, padding: "6px 8px", cursor: "pointer",
                                    background: marcada ? "var(--color-success-light)" : "var(--background-primary)",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  <input type="checkbox" checked={marcada} onChange={() => toggleTurmaEscolhida(t.id)} />
                                  {DIA_LABEL[t.dia]} — {t.horario}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleInserirEmLote}
                  disabled={turmasEscolhidas.length === 0 || inserindo}
                  style={{
                    padding: "10px 18px", borderRadius: 8, border: "none",
                    background: turmasEscolhidas.length === 0 ? "var(--text-disabled)" : "var(--color-primary)",
                    color: "#fff", cursor: turmasEscolhidas.length === 0 ? "not-allowed" : "pointer", fontWeight: 600,
                  }}
                >
                  {inserindo ? "Inserindo..." : `Inserir em ${turmasEscolhidas.length} turma(s)`}
                </button>

                {aviso && <p style={{ fontSize: 13, color: "var(--color-primary)", marginTop: 8 }}>{aviso}</p>}
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "var(--text-primary)" }}>
                  Turmas matriculadas ({matriculasAtivas.length})
                </p>
                {matriculasAtivas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma turma ativa.</p>}
                {matriculasAtivas.map((m) => (
                  <div key={m.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)" }}>
                    <span>{m.modalidadeNome} — {m.turmaNome}</span>
                    <button onClick={() => handleCancelar(m.id)} style={{ fontSize: 12, border: "none", background: "var(--color-danger)", color: "#fff", borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "var(--text-primary)" }}>
                  Listas de espera ({filas.length})
                </p>
                {filas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Não está em nenhuma fila.</p>}
                {filas.map((f) => (
                  <div key={f.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
                    {f.modalidadeNome} — {f.turmaNome} — <strong>{f.posicao}º lugar</strong>
                  </div>
                ))}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "var(--text-primary)" }}>
                  Histórico de modificações ({historicoOrdenado.length})
                </p>
                {historicoOrdenado.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma modificação registrada ainda.</p>}
                <div style={{ maxHeight: 220, overflowY: "auto" }}>
                  {historicoOrdenado.map((h) => (
                    <div key={h.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
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