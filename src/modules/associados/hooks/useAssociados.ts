import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Associado,
  CriarAssociadoDTO,
  AtualizarAssociadoDTO,
} from "../types/associado.types";

import {
  associadosService,
} from "../services/associados.service";

import { buscarComCache } from "../../../lib/cacheOffline";

export function useAssociados() {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      const dados = await buscarComCache("associados", () => associadosService.listar(), setAssociados);
      setAssociados(dados);
    } catch {
      setErro("Erro ao carregar associados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const listaFiltrada = useMemo(() => {
    return associados.filter((associado) => {
      const texto = busca.toLowerCase();
      const encontrouBusca =
        associado.nome.toLowerCase().includes(texto) ||
        associado.telefone.includes(texto);
      const encontrouStatus =
        statusFiltro === "TODOS" || associado.status === statusFiltro;
      return encontrouBusca && encontrouStatus;
    });
  }, [associados, busca, statusFiltro]);

  const criar = useCallback(async (dados: CriarAssociadoDTO) => {
    try {
      const novo = await associadosService.criar(dados);
      setAssociados((prev) => [...prev, novo]);
      return novo;
    } catch (e) {
      const mensagem =
        e instanceof Error ? e.message : "Erro ao criar associado";
      setErro(mensagem);
      throw e;
    }
  }, []);

  const atualizar = useCallback(
    async (id: string, dados: AtualizarAssociadoDTO) => {
      try {
        const atualizado = await associadosService.atualizar(id, dados);
        if (!atualizado) return;
        setAssociados((prev) =>
          prev.map((item) => (item.id === id ? atualizado : item))
        );
        return atualizado;
      } catch {
        setErro("Erro ao atualizar associado");
      }
    },
    []
  );

  const excluir = useCallback(async (id: string) => {
    try {
      await associadosService.excluir(id);
      setAssociados((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setErro("Erro ao excluir associado");
    }
  }, []);

  const buscarPorId = useCallback(
    async (id: string): Promise<Associado | undefined> => {
      return associadosService.buscarPorId(id);
    },
    []
  );

  return {
    associados: listaFiltrada,
    todos: associados,
    loading,
    erro,
    busca,
    setBusca,
    statusFiltro,
    setStatusFiltro,
    carregar,
    criar,
    atualizar,
    excluir,
    buscarPorId,
  };
}



