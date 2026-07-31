// ======================================================
// APUSM SaaS — Módulo Associados
// Arquivo: AssociadoSituacaoPage.tsx
// ======================================================

import { useState } from "react";
import { associadosService } from "../services/associados.service";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import type { Associado } from "../types/associado.types";
import type { EntradaListaEspera } from "@/modules/lista-espera/types/listaEspera.types";

export default function AssociadoSituacaoPage() {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Associado[]>([]);
  const [selecionado, setSelecionado] = useState<Associado | null>(null);
  const [filas, setFilas] = useState<EntradaListaEspera[]>([]);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  async function handleBuscar(texto: string) {
    setBusca(texto);
    setNaoEncontrado(false);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const lista = await associadosService.pesquisar(texto);
    setResultados(lista);
    if (lista.length === 0) setNaoEncontrado(true);
  }

  async function handleSelecionar(associado: Associado) {
    setSelecionado(associado);
    setResultados([]);
    setBusca(associado.nome);
    const entradas = await listaEsperaService.listarPorAssociado(associado.id);
    setFilas(entradas);
  }

  const matriculasAtivas = selecionado?.matriculas.filter((m) => m.status !== "CANCELADA") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>
          Situação do Associado
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>
          Busque por nome ou telefone
        </p>
      </div>

      <div style={{ position: "relative", maxWidth: 400 }}>
        <input
          value={busca}
          onChange={(e) => handleBuscar(e.target.value)}
          placeholder="Nome ou telefone..."
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            fontSize: 14,
          }}
        />
        {resultados.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--background-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              marginTop: 4,
              zIndex: 10,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {resultados.map((a) => (
              <div
                key={a.id}
                onClick={() => handleSelecionar(a)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: 14,
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                {a.nome} — {a.telefone}
              </div>
            ))}
          </div>
        )}
      </div>

      {naoEncontrado && (
        <p style={{ color: "var(--color-danger)", fontSize: 14 }}>
          Associado não encontrado no cadastro.
        </p>
      )}

      {selecionado && (
        <div
          style={{
            border: "1px solid var(--border-default)",
            borderRadius: 12,
            padding: "1.25rem",
            background: "var(--background-primary)",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{selecionado.nome}</p>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            {selecionado.telefone} — Status: {selecionado.status} — Cadastrado em {selecionado.dataCadastro}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Turmas matriculadas ({matriculasAtivas.length})
              </p>
              {matriculasAtivas.length === 0 && (
                <p style={{ fontSize: 13, color: "#6b7280" }}>Nenhuma turma ativa.</p>
              )}
              {matriculasAtivas.map((m) => (
                <div key={m.id} style={{ fontSize: 13, padding: "6px 0", borderTop: "1px solid var(--border-light)" }}>
                  {m.modalidadeNome} — {m.turmaNome}
                </div>
              ))}
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                Listas de espera ({filas.length})
              </p>
              {filas.length === 0 && (
                <p style={{ fontSize: 13, color: "#6b7280" }}>Não está em nenhuma fila.</p>
              )}
              {filas.map((f) => (
                <div key={f.id} style={{ fontSize: 13, padding: "6px 0", borderTop: "1px solid var(--border-light)" }}>
                  {f.modalidadeNome} — {f.turmaNome} — <strong>{f.posicao}º lugar</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}