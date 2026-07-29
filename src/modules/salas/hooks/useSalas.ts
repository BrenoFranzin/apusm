// ======================================================
// APUSM SaaS
// Módulo: Salas
// Arquivo: useSalas.ts
// ======================================================

import { useState, useEffect, useCallback } from "react";

import { salasService } from "../services/salas.service";
import type { Sala, CriarSalaDTO } from "../types/sala.types";

export function useSalas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const lista = await salasService.listar();
      setSalas(lista);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = useCallback(async (dados: CriarSalaDTO) => {
    setErro(null);
    try {
      await salasService.criar(dados);
      await carregar();
      return true;
    } catch {
      setErro("Não foi possível criar a sala.");
      return false;
    }
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    await salasService.excluir(id);
    await carregar();
  }, [carregar]);

  return { salas, carregando, erro, criar, excluir };
}