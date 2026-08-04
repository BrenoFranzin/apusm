// ======================================================
// APUSM SaaS — Módulo Lista de Espera
// Arquivo: ListasEsperaPage.tsx
// ======================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
import AssociadoDetalhesModal from "@/modules/associados/components/AssociadoDetalhesModal";
import AssociadoDetalhesModal from "@/modules/associados/components/AssociadoDetalhesModal";

function ehModoEscuro() {
  return document.documentElement.classList.contains("dark");
}

function ajustarCorParaTema(cor: string, escuro: boolean) {
  if (!escuro) return cor;
  const r = parseInt(cor.slice(1, 3), 16);
  const g = parseInt(cor.slice(3, 5), 16);
  const b = parseInt(cor.slice(5, 7), 16);
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminancia >= 0.35) return cor;
  const clarear = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.6));
  const hex = (v: number) => clarear(v).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

export default function ListasEsperaPage() {
  const navigate = useNavigate();
  <p style={{ color: "var(--page-subheading)" }}>
          {modalidades.length} modalidades
        </p>
      </div>

  useEffect(() => {
    modalidadesService.listar().then(setModalidades);
  }, []);

  useEffect(() => {
    const obs = new MutationObserver(() => setEscuro(ehModoEscuro()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
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
            const cor = ajustarCorParaTema(mod.cor || "#374151", escuro);

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