// ======================================================
// APUSM SaaS — Módulo Plantão de Serviço
// Arquivo: usePlantao.ts
// ======================================================

import { useCallback, useEffect, useState } from "react";
import { plantaoService } from "../services/plantao.service";
import type { EntradaPlantao, DiaSemanaPlantao } from "../types/plantao.types";

export function usePlantao() {
  const [entradas, setEntradas] = useState<EntradaPlantao[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const dados = await plantaoService.listar();
    setEntradas(dados);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionar(instrutorId: string, dia: DiaSemanaPlantao, horario: string) {
    await plantaoService.adicionar(instrutorId, dia, horario);
    await carregar();
  }

  async function remover(instrutorId: string, dia: DiaSemanaPlantao, horario: string) {
    await plantaoService.remover(instrutorId, dia, horario);
    await carregar();
  }

  async function definirEmMassa(instrutorId: string, novasEntradas: { dia: DiaSemanaPlantao; horario: string }[]) {
    await plantaoService.definirEmMassa(instrutorId, novasEntradas);
    await carregar();
  }

  return { entradas, loading, adicionar, remover, definirEmMassa, carregar };
}