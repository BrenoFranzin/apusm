import AppRoutes from "./routes";
import { useNotificacaoAulas } from "./hooks/useNotificacaoAulas";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";

export default function App(){
  const { turmas } = useTurmas();
  const { modalidades } = useModalidades();

  useNotificacaoAulas(turmas, modalidades);

  return(
    <AppRoutes/>
  )
}