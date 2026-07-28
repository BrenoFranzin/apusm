import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { associadosService } from "@/modules/associados/services/associados.service";
import { modalidadesService } from "@/modules/modalidades/services/modalidades.service";
import { turmasService } from "@/modules/turmas/services/turmas.service";
import { instrutoresService } from "@/modules/instrutores/services/instrutores.service";

interface Estatisticas {
  totalAssociados: number;
  associadosAtivos: number;
  totalModalidades: number;
  totalTurmas: number;
  totalInstrutores: number;
}

const modulos = [
  { nome: "Associados", rota: "/associados", icone: "👥" },
  { nome: "Modalidades", rota: "/modalidades", icone: "🏷️" },
  { nome: "Turmas", rota: "/turmas", icone: "📅" },
  { nome: "Instrutores", rota: "/instrutores", icone: "🧑‍🏫" },
  { nome: "Relatórios", rota: "/relatorios/matriculas", icone: "📊" },
  { nome: "Configurações", rota: "/configuracoes", icone: "⚙️" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Estatisticas | null>(null);

  useEffect(() => {
    async function carregar() {
      const [associados, modalidades, turmas, instrutores] = await Promise.all([
        associadosService.listar(),
        modalidadesService.listar(),
        turmasService.listar(),
        instrutoresService.listar(),
      ]);

      setStats({
        totalAssociados: associados.length,
        associadosAtivos: associados.filter((a) => a.status === "ATIVO").length,
        totalModalidades: modalidades.length,
        totalTurmas: turmas.length,
        totalInstrutores: instrutores.length,
      });
    }

    carregar();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">APUSM Modalidades</h1>
        <p className="text-gray-500 mt-1">Painel administrativo do sistema</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CardEstatistica titulo="Associados" valor={stats?.totalAssociados} cor="bg-blue-50 text-blue-700" />
        <CardEstatistica titulo="Ativos" valor={stats?.associadosAtivos} cor="bg-green-50 text-green-700" />
        <CardEstatistica titulo="Modalidades" valor={stats?.totalModalidades} cor="bg-purple-50 text-purple-700" />
        <CardEstatistica titulo="Turmas" valor={stats?.totalTurmas} cor="bg-amber-50 text-amber-700" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Módulos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modulos.map((mod) => (
            <Link
              key={mod.rota}
              to={mod.rota}
              className="flex items-center gap-3 border rounded-xl p-5 bg-white hover:shadow-md hover:border-gray-300 transition"
            >
              <span className="text-2xl">{mod.icone}</span>
              <span className="font-medium text-gray-800">{mod.nome}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardEstatistica({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor?: number;
  cor: string;
}) {
  return (
    <div className={`rounded-xl p-5 ${cor}`}>
      <p className="text-sm font-medium opacity-80">{titulo}</p>
      <p className="text-3xl font-bold mt-1">{valor ?? "..."}</p>
    </div>
  );
}