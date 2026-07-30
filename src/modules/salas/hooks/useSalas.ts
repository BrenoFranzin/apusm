import { useEffect, useState, useCallback } from "react";
import { salasService } from "../services/salas.service";
import type { Sala, CriarSalaDTO } from "../types/sala.types";

export function useSalas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await salasService.listar();
    setSalas(lista);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const criar = useCallback(async (dados: CriarSalaDTO) => {
    await salasService.criar(dados);
    await carregar();
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    await salasService.excluir(id);
    await carregar();
  }, [carregar]);

  return { salas, carregando, criar, excluir };
}