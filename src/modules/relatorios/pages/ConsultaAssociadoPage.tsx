import { useEffect, useState } from "react";
import { associadosService } from "@/modules/associados/services/associados.service";
import { listaEsperaService } from "@/modules/lista-espera/services/listaEspera.service";
import type { Associado } from "@/modules/associados/types/associado.types";
import type { EntradaListaEspera } from "@/modules/lista-espera/types/listaEspera.types";

export default function ConsultaAssociadoPage() {
  const [busca, setBusca] = useState("");
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [selecionado, setSelecionado] = useState<Associado | null>(null);
  const [fila, setFila] = useState<EntradaListaEspera[]>([]);

  useEffect(() => {
    associadosService.listar().then(setAssociados);
  }, []);

  const resultados = busca.length > 0
    ? associados.filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
    : [];

  async function selecionar(associado: Associado) {
    setSelecionado(associado);
    setBusca("");
    const filaDele = await listaEsperaService.listarPorAssociado(associado.id);
    setFila(filaDele);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--page-heading)" }}>Consulta de Associado</h1>
        <p style={{ color: "var(--page-subheading)" }}>Veja as turmas e listas de espera de um associado específico</p>
      </div>

      <div style={{ position: "relative" }}>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome do associado..."
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--background-primary)",
            color: "var(--text-primary)",
            boxSizing: "border-box",
          }}
        />

        {resultados.length > 0 && (
          <div
            style={{
              position: "absolute",
              zIndex: 10,
              background: "var(--background-primary)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              marginTop: 4,
              width: "100%",
              boxShadow: "var(--shadow-lg)",
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {resultados.map((a) => (
              <button
                key={a.id}
                onClick={() => selecionar(a)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                {a.nome} — {a.telefone}
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <div style={{ border: "1px solid var(--border-default)", borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: 18, color: "var(--text-primary)" }}>{selecionado.nome}</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selecionado.telefone}</p>
          </div>

          <div>
            <p style={{ fontWeight: 500, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Turmas matriculadas</p>
            {selecionado.matriculas.filter((m) => m.status !== "CANCELADA").length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Nenhuma turma</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
                {selecionado.matriculas
                  .filter((m) => m.status !== "CANCELADA")
                  .map((m) => (
                    <li key={m.id} style={{ fontSize: 13, background: "var(--color-success-light)", color: "var(--color-success)", padding: "8px 12px", borderRadius: 8 }}>
                      {m.modalidadeNome} — {m.turmaNome} (matriculado em {m.dataMatricula})
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div>
            <p style={{ fontWeight: 500, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Listas de espera</p>
            {fila.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Não está em nenhuma lista de espera</p>
            ) : (
              <ul style={{ display: "flex", flexDirection: "column", gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
                {fila.map((f) => (
                  <li key={f.id} style={{ fontSize: 13, background: "var(--color-warning-light)", color: "var(--color-warning)", padding: "8px 12px", borderRadius: 8 }}>
                    {f.modalidadeNome} — {f.turmaNome}: posição {f.posicao} (entrou em{" "}
                    {new Date(f.dataEntrada).toLocaleDateString("pt-BR")})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}