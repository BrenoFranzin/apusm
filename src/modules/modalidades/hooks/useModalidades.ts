// ======================================================
// APUSM SaaS — Módulo Modalidades
// Arquivo: useModalidades.ts
// ======================================================

import { useEffect, useState, useCallback } from "react";

import { modalidadesService } from "../services/modalidades.service";
import { buscarComCache } from "../../../lib/cacheOffline";

import type {
  Modalidade,
  CriarModalidadeDTO,
  AtualizarModalidadeDTO,
} from "../types/modalidade.types";

export function useModalidades() {
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await buscarComCache("modalidades", () => modalidadesService.listar(), setModalidades);
    setModalidades(lista);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(
    async (dados: CriarModalidadeDTO) => {
      await modalidadesService.criar(dados);
      await carregar();
    },
    [carregar]
  );

  const editar = useCallback(
    async (id: string, dados: AtualizarModalidadeDTO) => {
      await modalidadesService.atualizar(id, dados);
      await carregar();
    },
    [carregar]
  );

  const excluir = useCallback(
    async (id: string) => {
      await modalidadesService.excluir(id);
      await carregar();
    },
    [carregar]
  );

  return {
    modalidades,
    carregando,
    criar,
    editar,
    excluir,
  };
}


