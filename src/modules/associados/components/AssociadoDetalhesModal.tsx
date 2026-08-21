// ======================================================
// APUSM SaaS — Modal grande de Associado
// Arquivo: AssociadoDetalhesModal.tsx
// Busca, matricula em lote, historico e posicao na fila
// ======================================================

import { useEffect, useRef, useState } from "react";
import { associadosService } from "../services/associados.service";
import { buscaAproximada } from "@/utils/textoBusca";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Associado } from "../types/associado.types";
import type { EntradaListaEspera } from "@/modules/lista-espera/types/listaEspera.types";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import { limitesService } from "@/modules/limites/services/limites.service";
import { buscarComCache } from "@/lib/cacheOffline";
import { associadosService as associadosServiceContagem } from "../services/associados.service";

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
  const [aviso, setAviso] = useState<string[]>([]);
  const [inserindo, setInserindo] = useState(false);
  const [nomeParaCadastrar, setNomeParaCadastrar] = useState("");
  const [telefoneParaCadastrar, setTelefoneParaCadastrar] = useState("");
  const [cadastrando, setCadastrando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState<string | null>(null);
  const [filasContagem, setFilasContagem] = useState<Record<string, number>>({});
  const [matriculasContagem, setMatriculasContagem] = useState<Record<string, number>>({});
  const [limitesPorModalidade, setLimitesPorModalidade] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!aberto) return;
    buscarComCache("turmas", () => turmasService.listar(), setTurmas);
    buscarComCache("modalidades", () => modalidadesService.listar(), setModalidades);
  }, [aberto]);

  useEffect(() => {
    if (modalidades.length === 0) return;
    (async () => {
      const limites: Record<string, number> = {};
      await Promise.all(
        modalidades.map(async (mod) => {
          limites[mod.id] = await limitesService.obterLimiteDaModalidade(mod.id);
        })
      );
      setLimitesPorModalidade(limites);
    })();
  }, [modalidades]);

  function aplicarContagens(todasEntradas: EntradaListaEspera[]) {
    const contagens: Record<string, number> = {};
    turmas.forEach((t) => { contagens[t.id] = todasEntradas.filter((e) => e.turmaId === t.id).length; });
    setFilasContagem(contagens);
  }

  useEffect(() => {
    if (turmas.length === 0) return;
    buscarComCache("lista_espera", () => listaEsperaService.listarTudo(), aplicarContagens).then(aplicarContagens);

    (async () => {
      const contagens: Record<string, number> = {};
      await Promise.all(
        turmas.map(async (t) => {
          contagens[t.id] = await associadosServiceContagem.contarMatriculasPorTurma(t.id);
        })
      );
      setMatriculasContagem(contagens);
    })();
  }, [turmas]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [buscando, setBuscando] = useState(false);
  const todosAssociadosRef = useRef<Associado[] | null>(null);

  function handleBuscar(texto: string) {
    setBusca(texto);
    setNomeParaCadastrar("");
    setErroCadastro(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (texto.trim().length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    debounceRef.current = setTimeout(async () => {
      const lista = await associadosService.pesquisar(texto);
      setResultados(lista);
      setBuscando(false);
      if (lista.length === 0) {
        setNomeParaCadastrar(texto.toUpperCase());
      }
    }, 300);
  }

  async function handleCadastrarRapido() {
    const nome = nomeParaCadastrar.trim();
    if (!nome) return;

    // Exige nome + sobrenome (pelo menos duas palavras)
    const partes = nome.split(/\s+/).filter(Boolean);
    if (partes.length < 2) {
      setErroCadastro("Informe nome e sobrenome pra cadastrar.");
      return;
    }

    setErroCadastro(null);
    setCadastrando(true);
    try {
      const novo = await associadosService.criar({
        nome,
        telefone: telefoneParaCadastrar.trim(),
        status: "ATIVO",
      });
      todosAssociadosRef.current = null; // invalida cache, novo associado precisa aparecer em buscas futuras
      setNomeParaCadastrar("");
      setTelefoneParaCadastrar("");
      await handleSelecionar(novo);
    } catch (e) {
      setAviso([e instanceof Error ? e.message : "Erro ao cadastrar associado"]);
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
    setAviso([]);
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

    function turmasQueVaoParaFila(): { turma: Turma; modalidadeNome: string }[] {
    return turmasEscolhidas
      .map((turmaId) => {
        const turma = turmas.find((t) => t.id === turmaId);
        if (!turma) return null;
        const matriculadas = matriculasContagem[turma.id] ?? 0;
        const limite = turma.limiteVagas ?? 10;
        if (matriculadas >= limite) {
          const modalidade = modalidades.find((m) => m.id === turma.modalidadeId);
          return { turma, modalidadeNome: modalidade?.nome ?? "" };
        }
        return null;
      })
      .filter((x): x is { turma: Turma; modalidadeNome: string } => x !== null);
  }

  async function handleInserirEmLote() {
    if (!selecionado || turmasEscolhidas.length === 0) return;

    const emRisco = turmasQueVaoParaFila();
    if (emRisco.length > 0) {
      const listaTexto = emRisco
        .map((r) => `${r.modalidadeNome} (${DIA_LABEL[r.turma.dia]} ${r.turma.horario})`)
        .join(", ");
      const confirmar = window.confirm(
        `Tem certeza que ${selecionado.nome} ficará na lista de espera para: ${listaTexto}?`
      );
      if (!confirmar) return;
    }

    setInserindo(true);

    let matriculados = 0;
    let naFila = 0;
    const errosDetalhados: string[] = [];

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
      } catch (e) {
        errosDetalhados.push(e instanceof Error ? e.message : "Erro desconhecido");
      }
    }

    const partes: string[] = [];
    if (matriculados > 0) partes.push(`${matriculados} matrícula(s) confirmada(s)`);
    if (naFila > 0) partes.push(`${naFila} na lista de espera`);
    if (errosDetalhados.length > 0) partes.push(...errosDetalhados);

    setAviso(partes);
    setTurmasEscolhidas([]);
    setInserindo(false);
    await recarregarSelecionado();
  }

  async function handleMatricularDaFila(entrada: EntradaListaEspera) {
    try {
      await associadosService.matricular(selecionado!.id, {
        turmaId: entrada.turmaId,
        turmaNome: entrada.turmaNome,
        modalidadeId: entrada.modalidadeId,
        modalidadeNome: entrada.modalidadeNome,
      });
      await listaEsperaService.sairDaFila(entrada.id);
      await recarregarSelecionado();
    } catch (e) {
      setAviso([e instanceof Error ? e.message : "Erro ao matricular"]);
    }
  }

  async function handleCancelar(matriculaId: string) {
    if (!selecionado) return;
    await associadosService.cancelarMatricula(selecionado.id, matriculaId);
    await recarregarSelecionado();
  }

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

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
              placeholder="🔍 Buscar por nome ou telefone..."
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 10,
                border: "2px solid var(--color-primary)",
                fontSize: 16,
                fontWeight: 500,
                background: "var(--background-primary)",
                color: "var(--text-primary)",
                boxShadow: "0 0 0 3px var(--color-primary-light)",
                boxSizing: "border-box",
              }}
            />
            {busca.trim().length >= 2 && resultados.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 8, marginTop: 4, zIndex: 10, maxHeight: 240, overflowY: "auto" }}>
                <p style={{ fontSize: 12, color: "var(--color-success)", padding: "6px 14px", margin: 0 }}>
                  {resultados.length} associado(s) encontrado(s)
                </p>
                {resultados.map((a) => (
                  <div key={a.id} onClick={() => handleSelecionar(a)} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 14, borderBottom: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
                    {a.nome} — {a.telefone}
                  </div>
                ))}
              </div>
            )}
            {busca.trim().length >= 2 && buscando && (
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                Buscando...
              </p>
            )}
          </div>

          {!selecionado && nomeParaCadastrar && (
            <div style={{ border: "2px solid var(--color-primary)", borderRadius: 8, padding: 16, marginBottom: 16, background: "var(--background-secondary)", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 10 }}>
                Nenhum associado encontrado com "{nomeParaCadastrar}". Cadastrar agora?
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  value={nomeParaCadastrar}
                  onChange={(e) => { setNomeParaCadastrar(e.target.value.toUpperCase()); setErroCadastro(null); }}
                  placeholder="NOME E SOBRENOME"
                  style={{ textTransform: "uppercase", flex: "1 1 180px", padding: 8, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)" }}
                />
                <input
                  value={telefoneParaCadastrar}
                  onChange={(e) => setTelefoneParaCadastrar(e.target.value)}
                  placeholder="Telefone (opcional)"
                  style={{ flex: "1 1 140px", padding: 8, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleCadastrarRapido}
                  disabled={cadastrando}
                  style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "var(--color-primary)", color: "#fff", cursor: "pointer", fontWeight: 600 }}
                >
                  {cadastrando ? "Cadastrando..." : "Cadastrar e continuar"}
                </button>
              </div>
              {erroCadastro && (
                <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 8 }}>{erroCadastro}</p>
              )}
            </div>
          )}

          {!selecionado && !nomeParaCadastrar && <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Busque um associado pra ver detalhes.</p>}

          {selecionado && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <p style={{ fontWeight: 700, fontSize: 18, margin: 0, color: "var(--text-primary)" }}>{selecionado.nome}</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 12 }}>
                  {selecionado.telefone || "Sem telefone"} — Status: {selecionado.status}
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
                            {(() => {
                              const limite = limitesPorModalidade[mod.id] ?? 2;
                              const matriculadasNaModalidade = selecionado?.matriculas.filter(
                                (m) => m.modalidadeId === mod.id && m.status !== "CANCELADA"
                              ).length ?? 0;
                              const atingiuLimite = matriculadasNaModalidade >= limite;
                              return (
                                <span
                                  style={{
                                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                                    background: atingiuLimite ? "var(--color-warning-light)" : "var(--color-success-light)",
                                    color: atingiuLimite ? "var(--color-warning)" : "var(--color-success)",
                                  }}
                                >
                                  {matriculadasNaModalidade}/{limite} turmas
                                  {atingiuLimite ? " (só entra na fila)" : " (pode entrar direto)"}
                                </span>
                              );
                            })()}
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
                                                                    <span>
                                    {DIA_LABEL[t.dia]} — {t.horario}
                                    {(() => {
                                      const matriculadas = matriculasContagem[t.id] ?? 0;
                                      const limite = t.limiteVagas ?? 10;
                                      const cheia = matriculadas >= limite;
                                      return (
                                        <span style={{ fontSize: 11, marginLeft: 4, fontWeight: 700, color: cheia ? "#9a3412" : "var(--text-secondary)" }}>
                                          ({matriculadas}/{limite}{cheia ? " — TURMA CHEIA" : ""})
                                        </span>
                                      );
                                    })()}
                                    {(filasContagem[t.id] ?? 0) > 0 && (
                                      <span style={{ fontSize: 11, color: "var(--color-warning)", marginLeft: 4 }}>
                                        ({filasContagem[t.id]} na fila de espera)
                                      </span>
                                    )}
                                  </span>
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

                {aviso.length > 0 && (
  <div style={{ marginTop: 8 }}>
    {aviso.map((linha, i) => (
      <p key={i} style={{ fontSize: 13, color: "var(--color-primary)", margin: "2px 0" }}>{linha}</p>
    ))}
  </div>
)}
              </div>

              <div style={{ border: "1px solid var(--border-default)", borderRadius: 8, padding: 12 }}>
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

              <div style={{ border: "1px solid var(--border-default)", borderRadius: 8, padding: 12 }}>
                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: "var(--text-primary)" }}>
                  Listas de espera ({filas.length})
                </p>
                {filas.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Não está em nenhuma fila.</p>}
                {filas.map((f) => {
                  const turma = turmas.find((t) => t.id === f.turmaId);
                  const limiteVagasTurma = turma?.limiteVagas ?? 10;
                  const vagasOcupadas = matriculasContagem[f.turmaId] ?? 0;
                  const temVagaNaTurma = vagasOcupadas < limiteVagasTurma;

                  const limiteModalidade = limitesPorModalidade[f.modalidadeId] ?? 2;
                  const matriculadasNaModalidade = selecionado?.matriculas.filter(
                    (m) => m.modalidadeId === f.modalidadeId && m.status !== "CANCELADA"
                  ).length ?? 0;
                  const temVagaNaModalidade = matriculadasNaModalidade < limiteModalidade;

                  const podeMatricular = temVagaNaTurma && temVagaNaModalidade;

                  return (
                    <div key={f.id} style={{ fontSize: 13, padding: "8px 0", borderTop: "1px solid var(--border-light)", color: "var(--text-primary)" }}>
                      <div>{f.modalidadeNome} — {f.turmaNome} — <strong>{f.posicao}º lugar</strong></div>
                      {podeMatricular && (
                        <button
                          onClick={() => handleMatricularDaFila(f)}
                          style={{ marginTop: 4, fontSize: 12, fontWeight: 700, border: "none", background: "var(--color-success)", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
                        >
                          Vaga disponível! Matricular
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <button
                  onClick={() => setModalHistoricoAberto(true)}
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--color-primary)", border: "1px solid var(--color-primary)", background: "transparent", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                >
                  📋 Ver histórico de modificações ({historicoOrdenado.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalHistoricoAberto && (
        <div
          onClick={() => setModalHistoricoAberto(false)}
          style={{ fontSize: 13, fontWeight: 700, color: "#fff", border: "none", background: "var(--color-success)", borderRadius: 8, padding: "10px 16px", cursor: "pointer" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--background-primary)", borderRadius: 12, padding: 20,
              width: "90vw", maxWidth: 560, maxHeight: "75vh", overflowY: "auto",
            }}
          >
            <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: "var(--text-primary)" }}>
              Histórico de modificações
            </p>

            {historicoOrdenado.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma modificação registrada.</p>
            )}

            {historicoOrdenado.map((h: any, i: number) => (
              <div key={i} style={{ fontSize: 13, padding: "8px 0", borderTop: i > 0 ? "1px solid var(--border-light)" : "none", color: "var(--text-primary)" }}>
                <p style={{ margin: 0, fontWeight: 500 }}>{h.descricao ?? h.acao ?? "Modificação"}</p>
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
                  {new Date(h.data).toLocaleString("pt-BR")}
                </p>
              </div>
            ))}

            <button
              onClick={() => setModalHistoricoAberto(false)}
              style={{ marginTop: 14, width: "100%", fontSize: 13, border: "1px solid var(--border-default)", borderRadius: 8, padding: "8px 12px", background: "transparent", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}