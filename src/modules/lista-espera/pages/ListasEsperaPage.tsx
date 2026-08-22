// ======================================================
// APUSM SaaS - Modulo Lista de Espera
// Arquivo: ListasEsperaPage.tsx
// ======================================================

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";

import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { listaEsperaService } from "../services/listaEspera.service";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";
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
  const location = useLocation();
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [contagemPorModalidade, setContagemPorModalidade] = useState<Record<string, number>>({});
  const [escuro, setEscuro] = useState(ehModoEscuro());
  const [modalAssociadoAberto, setModalAssociadoAberto] = useState(false);

  useEffect(() => {
    async function carregar() {
      const mods = await modalidadesService.listar();
      setModalidades(mods);

      const turmas = await turmasService.listar();
      const todasFilas = await listaEsperaService.listarTudo();
      const contagens: Record<string, number> = {};

      const modalidadePorTurma: Record<string, string> = {};
      turmas.forEach((t) => { modalidadePorTurma[t.id] = t.modalidadeId; });

      todasFilas.forEach((entrada) => {
        const modalidadeId = modalidadePorTurma[entrada.turmaId];
        if (!modalidadeId) return;
        contagens[modalidadeId] = (contagens[modalidadeId] ?? 0) + 1;
      });

      setContagemPorModalidade(contagens);
    }
    carregar();

    // recarrega toda vez que o usuario volta pra essa aba/pagina
    window.addEventListener("focus", carregar);
    document.addEventListener("visibilitychange", carregar);
    return () => {
      window.removeEventListener("focus", carregar);
      document.removeEventListener("visibilitychange", carregar);
    };
  }, [location.key]);

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

      <button
        onClick={() => setModalAssociadoAberto(true)}
        className="bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
      >
        <Search size={18} />
        Buscar / inserir associado
      </button>

      <AssociadoDetalhesModal
        aberto={modalAssociadoAberto}
        onFechar={() => setModalAssociadoAberto(false)}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 18,
        }}
      >
        {[...modalidades]
          .sort((a, b) => a.nome.localeCompare(b.nome))
          .map((mod) => {
            const cor = ajustarCorParaTema(mod.cor || "#374151", escuro);
            const qtdFila = contagemPorModalidade[mod.id] ?? 0;

            return (
              <button
                key={mod.id}
                onClick={() => navigate(`/lista-espera/${mod.id}`)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  gap: 6,
                  background: cor + "33",
                  color: cor,
                  border: `2px solid ${cor}`,
                  borderRadius: 12,
                  padding: "22px 24px",
                  minHeight: 80,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{mod.icone}</span>
                  <span>{mod.nome}</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>
                  {qtdFila} na fila de espera
                </span>
                {mod.descricao && (
                  <span style={{ fontSize: 12, fontStyle: "italic", opacity: 0.85 }}>
                    {mod.descricao}
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
