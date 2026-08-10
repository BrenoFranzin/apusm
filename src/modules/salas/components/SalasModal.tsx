// ======================================================
// APUSM SaaS
// Módulo: Salas
// Arquivo: SalasModal.tsx
// ======================================================

import { useEffect, useState } from "react";
import { salasService } from "../services/salas.service";
import type { Sala } from "../types/sala.types";

export default function SalasModal({ onFechar }: { onFechar: () => void }) {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const lista = await salasService.listar();
    setSalas(lista);
  }

  async function handleSalvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) return;

    if (editandoId) {
      await salasService.atualizar(editandoId, { nome: nomeLimpo });
    } else {
      await salasService.criar({ nome: nomeLimpo });
    }

    setNome("");
    setEditandoId(null);
    carregar();
  }

  function handleEditar(sala: Sala) {
    setEditandoId(sala.id);
    setNome(sala.nome);
  }

  function handleCancelarEdicao() {
    setEditandoId(null);
    setNome("");
  }

  async function handleExcluir(id: string) {
    const confirmar = window.confirm("Excluir esta sala? Essa ação não pode ser desfeita.");
    if (!confirmar) return;

    await salasService.excluir(id);
    if (editandoId === id) handleCancelarEdicao();
    carregar();
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
          maxWidth: 480,
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 17, margin: 0, color: "var(--text-primary)" }}>
            Salas
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da sala"
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "var(--background-primary)",
              color: "var(--text-primary)",
              fontSize: 13,
            }}
          />
          <button
            onClick={handleSalvar}
            style={{
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "var(--background-primary)",
              color: "var(--text-primary)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {editandoId ? "Salvar" : "+ Nova sala"}
          </button>
          {editandoId && (
            <button
              onClick={handleCancelarEdicao}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-default)",
                background: "var(--background-primary)",
                color: "var(--text-muted)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          )}
        </div>

        {salas.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma sala cadastrada.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {salas.map((sala) => (
              <div
                key={sala.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  background: "var(--background-primary)",
                }}
              >
                <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "var(--text-primary)" }}>
                  {sala.nome}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleEditar(sala)}
                    style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--text-primary)" }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(sala.id)}
                    style={{ fontSize: 12, border: "none", borderRadius: 6, padding: "5px 9px", background: "var(--color-danger)", color: "#ffffff", fontWeight: 600, cursor: "pointer" }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


