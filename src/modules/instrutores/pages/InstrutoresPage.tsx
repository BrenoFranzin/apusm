// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutoresPage.tsx
// ======================================================

import { useState } from "react";

import { useInstrutores } from "../hooks/useInstrutores";
import { InstrutorCard } from "../components/InstrutorCard";
import InstrutorForm from "../components/InstrutorForm";
import type { Instrutor } from "../types/instrutor.types";

export default function InstrutoresPage() {
  const { instrutores, criar, editar, excluir } = useInstrutores();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [instrutorEditando, setInstrutorEditando] = useState<Instrutor | null>(null);

  function iniciarNovo() {
    setInstrutorEditando(null);
    setMostrarForm((v) => !v);
  }

  function iniciarEdicao(instrutor: Instrutor) {
    setInstrutorEditando(instrutor);
    setMostrarForm(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Instrutores</h1>
          <p style={{ color: "var(--page-subheading)" }}>
            {instrutores.length} instrutores cadastrados
          </p>
        </div>

        <button
          onClick={iniciarNovo}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Novo instrutor"}
        </button>
      </div>

      {mostrarForm && (
        <InstrutorForm
          valoresIniciais={instrutorEditando ?? undefined}
          onSubmit={async (dados) => {
            if (instrutorEditando) {
              await editar(instrutorEditando.id, dados);
            } else {
              await criar(dados);
            }
            setMostrarForm(false);
            setInstrutorEditando(null);
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: 12,
        }}
      >
        {instrutores.map((instrutor) => (
          <InstrutorCard
            key={instrutor.id}
            instrutor={instrutor}
            onEditar={iniciarEdicao}
            onExcluir={excluir}
          />
        ))}
      </div>
    </div>
  );
}