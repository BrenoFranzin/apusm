import { useState } from "react";
import { useSalas } from "../hooks/useSalas";

export default function SalasPage() {
  const { salas, criar, excluir } = useSalas();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nome, setNome] = useState("");

  async function handleCriar() {
    const nomeTrim = nome.trim();
    if (!nomeTrim) return;
    await criar({ nome: nomeTrim });
    setNome("");
    setMostrarForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>Salas</h1>
          <p style={{ color: "var(--page-subheading)" }}>{salas.length} salas cadastradas</p>
        </div>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-green-900 text-white px-5 py-3 rounded-lg"
        >
          {mostrarForm ? "Fechar" : "+ Nova sala"}
        </button>
      </div>

      {mostrarForm && (
        <div style={{ background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 12, padding: "1rem 1.25rem", maxWidth: 360 }}>
          <p style={{ fontWeight: 500, fontSize: 14, margin: "0 0 12px", color: "var(--text-primary)" }}>Nova sala</p>
          <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Sala 6"
            onKeyDown={(e) => { if (e.key === "Enter") handleCriar(); }}
            style={{ width: "100%", margin: "4px 0 12px", padding: 8, background: "var(--background-primary)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: 6, boxSizing: "border-box" }}
          />
          <button
            onClick={handleCriar}
            style={{ width: "100%", background: "var(--color-primary)", color: "#fff", padding: 10, borderRadius: 8, border: "none", cursor: "pointer" }}
          >
            Salvar sala
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {salas.map((sala) => (
          <div key={sala.id} style={{ background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: 12, padding: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)" }}>🚪 {sala.nome}</p>
            <button
              onClick={() => { if (window.confirm(`Excluir "${sala.nome}"?`)) excluir(sala.id); }}
              style={{ fontSize: 12, color: "var(--color-danger)", border: "1px solid var(--color-danger)", borderRadius: 6, padding: "5px 10px", background: "var(--background-primary)", cursor: "pointer" }}
            >
              🗑️ Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}