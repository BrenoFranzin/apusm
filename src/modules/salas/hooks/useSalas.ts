import { useEffect, useState, useCallback } from "react";
import { salasService } from "../services/salas.service";
import type { Sala, CriarSalaDTO, AtualizarSalaDTO } from "../types/sala.types";

export function useSalas() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const lista = await salasService.listar();
    setSalas(lista);
    setCarregando(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

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

  const editar = useCallback(async (id: string, dados: AtualizarSalaDTO) => {
    setErro(null);
    try {
      const atualizado = await salasService.atualizar(id, dados);
      if (!atualizado) {
        setErro("Sala não encontrada.");
        return false;
      }
      await carregar();
      return true;
    } catch {
      setErro("Não foi possível editar a sala.");
      return false;
    }
  }, [carregar]);

  const excluir = useCallback(async (id: string) => {
    setErro(null);
    try {
      await salasService.excluir(id);
      await carregar();
      return true;
    } catch {
      setErro("Não foi possível excluir a sala.");
      return false;
    }
  }, [carregar]);

  return { salas, carregando, erro, criar, editar, excluir };
}