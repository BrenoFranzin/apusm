// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: InstrutoresPage.tsx
// ======================================================

import { useState } from "react";

import { useInstrutores } from "../hooks/useInstrutores";
import { InstrutorCard } from "../components/InstrutorCard";
import InstrutorForm from "../components/InstrutorForm";

export default function InstrutoresPage() {
  const { instrutores, criar, excluir } = useInstrutores();
  const [mostrarForm, setMostrarForm] = useState(false);

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
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Novo instrutor"}
        </button>
      </div>

      {mostrarForm && (
        <InstrutorForm
          onSubmit={async (dados) => {
            await criar(dados);
            setMostrarForm(false);
          }}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {instrutores.map((instrutor) => (
          <InstrutorCard
            key={instrutor.id}
            instrutor={instrutor}
            onExcluir={excluir}
          />
        ))}
      </div>
    </div>
  );
}