  // ======================================================
  // APUSM SaaS â€” MÃ³dulo Turmas
  // Arquivo: useTurmas.ts
  // ======================================================

  import { useEffect, useState, useCallback } from "react";

  import { turmasService } from "../services/turmas.service";
import { buscarComCache } from "../../../lib/cacheOffline";

  import type {
    Turma,
    CriarTurmaDTO,
    AtualizarTurmaDTO,
  } from "../types/turma.types";

  export function useTurmas() {
    const [turmas, setTurmas] = useState<Turma[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const carregar = useCallback(async () => {
      setCarregando(true);
      const lista = await buscarComCache("turmas", () => turmasService.listar(), setTurmas);
      setTurmas(lista);
      setCarregando(false);
    }, []);

    useEffect(() => {
    async function iniciar() {
      await carregar();
    }

    iniciar();
  }, [carregar]);

    const criar = useCallback(
      async (dados: CriarTurmaDTO) => {
        setErro(null);
        try {
          await turmasService.criar(dados);
          await carregar();
          return true;
        } catch (e) {
          setErro(e instanceof Error ? e.message : "Erro ao criar turma");
          return false;
        }
      },
      [carregar]
    );

    const editar = useCallback(
      async (id: string, dados: AtualizarTurmaDTO) => {
        await turmasService.atualizar(id, dados);
        await carregar();
      },
      [carregar]
    );

    const excluir = useCallback(
      async (id: string) => {
        await turmasService.excluir(id);
        await carregar();
      },
      [carregar]
    );

    return {
      turmas,
      carregando,
      erro,
      criar,
      editar,
      excluir,
    };
  }

