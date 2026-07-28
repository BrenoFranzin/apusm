// ======================================================
// APUSM SaaS
// Módulo: Associados
// Arquivo: ModalSelecionarTurmas.tsx
// ======================================================

import { useEffect, useMemo, useState } from "react";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import type { Turma } from "@/modules/turmas/types/turma.types";
import type { Modalidade } from "@/modules/modalidades/types/modalidade.types";

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: (turmaIds: string[]) => void;
}

const DIA_LABEL: Record<string, string> = {
  seg: "Seg", ter: "Ter", qua: "Qua", qui: "Qui", sex: "Sex", sab: "Sáb",
};

export default function ModalSelecionarTurmas({ aberto, onFechar, onConfirmar }: Props) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  useEffect(() => {
    if (!aberto) return;
    turmasService.listar().then(setTurmas);
    modalidadesService.listar().then(setModalidades);
    setSelecionadas([]);
    setGrupoAberto(null);
  }, [aberto]);

  const turmasPorModalidade = useMemo(() => {
    const grupos: Record<string, Turma[]> = {};
    for (const turma of turmas) {
      if (!grupos[turma.modalidadeId]) grupos[turma.modalidadeId] = [];
      grupos[turma.modalidadeId].push(turma);
    }
    for (const modId in grupos) {
      grupos[modId].sort((a, b) => {
        const diaCmp = a.dia.localeCompare(b.dia);
        return diaCmp !== 0 ? diaCmp : a.horario.localeCompare(b.horario);
      });
    }
    return grupos;
  }, [turmas]);

  function toggleTurma(turmaId: string) {
    setSelecionadas((prev) =>
      prev.includes(turmaId) ? prev.filter((id) => id !== turmaId) : [...prev, turmaId]
    );
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">Selecionar turmas</h2>
            <p className="text-sm text-gray-500">Opcional. Pode pular e matricular depois.</p>
          </div>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y">
          {modalidades.map((mod) => {
            const turmasDoGrupo = turmasPorModalidade[mod.id] || [];
            const qtdSelecionadasNoGrupo = turmasDoGrupo.filter((t) => selecionadas.includes(t.id)).length;
            const estaAberta = grupoAberto === mod.id;

            return (
              <div key={mod.id}>
                <button
                  type="button"
                  onClick={() => setGrupoAberto(estaAberta ? null : mod.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                >
                  <span className="flex items-center gap-2">
                    <span>{mod.icone}</span>
                    <span className="font-medium">{mod.nome}</span>
                    <span className="text-xs text-gray-400">({turmasDoGrupo.length})</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {qtdSelecionadasNoGrupo > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {qtdSelecionadasNoGrupo}
                      </span>
                    )}
                    <span className="text-gray-400">{estaAberta ? "▲" : "▼"}</span>
                  </span>
                </button>

                {estaAberta && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-gray-50">
                    {turmasDoGrupo.map((turma) => (
                      <label
                        key={turma.id}
                        className={`flex items-center gap-2 text-sm border rounded-lg px-2 py-1.5 cursor-pointer ${
                          selecionadas.includes(turma.id) ? "bg-green-50 border-green-400" : "bg-white"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selecionadas.includes(turma.id)}
                          onChange={() => toggleTurma(turma.id)}
                        />
                        <span>{DIA_LABEL[turma.dia] ?? turma.dia} {turma.horario}</span>
                      </label>
                    ))}
                    {turmasDoGrupo.length === 0 && (
                      <p className="text-sm text-gray-400 col-span-full">Nenhuma turma cadastrada</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onFechar} className="px-4 py-2 rounded-lg border hover:bg-gray-50">
            Pular
          </button>
          <button
            onClick={() => onConfirmar(selecionadas)}
            className="px-4 py-2 rounded-lg bg-green-900 text-white"
          >
            Confirmar {selecionadas.length > 0 ? `(${selecionadas.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}