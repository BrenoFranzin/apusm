// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: ListasEsperaPage.tsx
// ======================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";

export default function ListasEsperaPage() {
  const navigate = useNavigate();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);

  useEffect(() => {
    modalidadesService.listar().then(setModalidades);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--page-heading)" }}>
          Listas de Espera
        </h1>
        <p style={{ color: "var(--page-subheading)" }}>
          {modalidades.length} modalidades
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {[...modalidades]
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((mod) => {
            const cor = mod.cor || "#374151";

            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/lista-espera/${mod.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 10,
                  background: cor + "1a",
                  color: cor,
                  border: `2px solid ${cor}`,
                  borderRadius: 10,
                  padding: "16px 20px",
                  minHeight: 60,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 20 }}>{mod.icone}</span>
                <span>{mod.nome}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}