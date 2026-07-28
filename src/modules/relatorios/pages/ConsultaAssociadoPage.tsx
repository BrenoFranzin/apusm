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
        <h1 className="text-2xl font-bold">Consulta de Associado</h1>
        <p className="text-gray-500">Veja as turmas e listas de espera de um associado específico</p>
      </div>

      <div className="relative">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite o nome do associado..."
          className="w-full border p-3 rounded-lg"
        />

        {resultados.length > 0 && (
          <div className="absolute z-10 bg-white border rounded-lg mt-1 w-full shadow-lg max-h-60 overflow-y-auto">
            {resultados.map((a) => (
              <button
                key={a.id}
                onClick={() => selecionar(a)}
                className="block w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                {a.nome} — {a.telefone}
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionado && (
        <div className="border rounded-xl p-5 space-y-4">
          <div>
            <h2 className="font-semibold text-lg">{selecionado.nome}</h2>
            <p className="text-gray-500 text-sm">{selecionado.telefone}</p>
          </div>

          <div>
            <p className="font-medium text-sm text-gray-700 mb-2">Turmas matriculadas</p>
            {selecionado.matriculas.filter((m) => m.status !== "CANCELADA").length === 0 ? (
              <p className="text-sm text-gray-400">Nenhuma turma</p>
            ) : (
              <ul className="space-y-1">
                {selecionado.matriculas
                  .filter((m) => m.status !== "CANCELADA")
                  .map((m) => (
                    <li key={m.id} className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                      {m.modalidadeNome} — {m.turmaNome} (matriculado em {m.dataMatricula})
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div>
            <p className="font-medium text-sm text-gray-700 mb-2">Listas de espera</p>
            {fila.length === 0 ? (
              <p className="text-sm text-gray-400">Não está em nenhuma lista de espera</p>
            ) : (
              <ul className="space-y-1">
                {fila.map((f) => (
                  <li key={f.id} className="text-sm bg-amber-50 text-amber-700 px-3 py-2 rounded-lg">
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