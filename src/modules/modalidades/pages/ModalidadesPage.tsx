// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: ModalidadesPage.tsx
// ======================================================

import { useState } from "react";

import { useModalidades } from "../hooks/useModalidades";
import { ModalidadeCard } from "../components/ModalidadeCard";
import ModalidadeForm from "../components/ModalidadeForm";
import type { Modalidade } from "../types/modalidade.types";
import { useInstrutores } from "../../instrutores/hooks/useInstrutores";


export default function ModalidadesPage() {
  const { modalidades, criar, editar, excluir } = useModalidades();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [modalidadeEditando, setModalidadeEditando] = useState<Modalidade | null>(null);
  const { instrutores } = useInstrutores();

  function iniciarNova() {
    setModalidadeEditando(null);
    setMostrarForm((v) => !v);
  }

  function iniciarEdicao(modalidade: Modalidade) {
    setModalidadeEditando(modalidade);
    setMostrarForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Modalidades</h1>
          <p style={{ color: "var(--page-subheading)" }}>
            {modalidades.length} modalidades cadastradas
          </p>
        </div>

        <button
          onClick={iniciarNova}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Nova modalidade"}
        </button>
      </div>

      {mostrarForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "6vh", zIndex: 1000, overflowY: "auto" }}
          onClick={() => { setMostrarForm(false); setModalidadeEditando(null); }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560 }}>
            <ModalidadeForm
              valoresIniciais={modalidadeEditando ?? undefined}
              instrutores={instrutores}
              onSubmit={async (dados) => {
                if (modalidadeEditando) {
                  await editar(modalidadeEditando.id, dados);
                } else {
                  await criar(dados);
                }
                setMostrarForm(false);
                setModalidadeEditando(null);
              }}
            />
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {modalidades.map((modalidade) => (
          <ModalidadeCard
  key={modalidade.id}
  modalidade={modalidade}
  instrutores={instrutores}
  onEditar={iniciarEdicao}
  onExcluir={excluir}
/>
        ))}
      </div>
    </div>
  );
}