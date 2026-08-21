// ======================================================
// APUSM SaaS
// Módulo: Salas
// Arquivo: SalasPage.tsx
// ======================================================
import { useState } from "react";
import { Plus, DoorOpen, Trash2 } from "lucide-react";
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
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--color-primary)", color: "#fff", border: "none",
            padding: "11px 20px", borderRadius: "var(--radius-md)",
            fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-sm)",
          }}
        >
          <Plus size={17} />
          {mostrarForm ? "Fechar" : "Nova sala"}
        </button>
      </div>

      {mostrarForm && (
        <div style={{ background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: "1.25rem", maxWidth: 360, boxShadow: "var(--shadow-sm)" }}>
          <p style={{ fontWeight: 700, fontSize: 14, margin: "0 0 12px", color: "var(--page-heading)" }}>Nova sala</p>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>Nome</label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Sala 6"
            onKeyDown={(e) => { if (e.key === "Enter") handleCriar(); }}
            style={{ width: "100%", margin: "4px 0 12px", padding: 9, background: "var(--background-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-sm)", boxSizing: "border-box", fontSize: 14 }}
          />
          <button
            onClick={handleCriar}
            style={{ width: "100%", background: "var(--color-primary)", color: "#fff", padding: 11, borderRadius: "var(--radius-md)", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
          >
            Salvar sala
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {salas.map((sala) => (
          <div key={sala.id} style={{ background: "var(--background-primary)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontWeight: 700, fontSize: 15, margin: "0 0 12px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
              <DoorOpen size={16} color="var(--color-primary)" />
              {sala.nome}
            </p>
            <button
              onClick={() => { if (window.confirm(`Excluir "${sala.nome}"?`)) excluir(sala.id); }}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#ffffff", border: "none", borderRadius: "var(--radius-sm)", padding: "6px 11px", background: "var(--color-danger)", fontWeight: 600, cursor: "pointer" }}
            >
              <Trash2 size={13} />
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}