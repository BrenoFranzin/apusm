// ======================================================
// APUSM SaaS — Módulo Instrutores
// Arquivo: useInstrutores.ts
// ======================================================

import { useEffect, useState, useCallback } from "react";

import { instrutoresService } from "../services/instrutores.service";

import type {
  Instrutor,
  CriarInstrutorDTO,
} from "../types/instrutor.types";

export function useInstrutores() {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await instrutoresService.listar();
    setInstrutores(lista);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(
    async (dados: CriarInstrutorDTO) => {
      await instrutoresService.criar(dados);
      await carregar();
    },
    [carregar]
  );

  const excluir = useCallback(
    async (id: string) => {
      await instrutoresService.excluir(id);
      await carregar();
    },
    [carregar]
  );

  return {
    instrutores,
    carregando,
    criar,
    excluir,
  };
}