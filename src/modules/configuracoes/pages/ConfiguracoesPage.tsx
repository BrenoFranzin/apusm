// ======================================================
// APUSM SaaS â€” MÃ³dulo ConfiguraÃ§Ãµes
// Arquivo: ConfiguracoesPage.tsx
// HistÃ³rico de exportaÃ§Ãµes agora Ã© um modal
// ======================================================

import { useEffect, useRef, useState } from "react";
import { backupService } from "../services/backup.service";
import { historicoService } from "../services/historico.service";
import { pdfService, type RegistroExportacao } from "../services/pdf.service";
import SalasModal from "../../salas/components/SalasModal";
import { useTurmas } from "@/modules/turmas/hooks/useTurmas";
import { useModalidades } from "@/modules/modalidades/hooks/useModalidades";
import seedTeste from "../../../data/seed-teste.json";
import type { BackupData } from "../services/backup.service";

const LABEL_TIPO: Record<RegistroExportacao["tipo"], string> = {
  servico: "Escala de ServiÃ§o",
  turmas: "Escala de Turmas",
  salas: "Escala de Salas",
  presenca: "Folha de PresenÃ§a",
};

export default function ConfiguracoesPage() {
  const inputRestaurarRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historico, setHistorico] = useState<RegistroExportacao[]>([]);
  const [, forcarAtualizacao] = useState(0);
  const [mostrarSalas, setMostrarSalas] = useState(false);

  const { turmas } = useTurmas();
  const { modalidades } = useModalidades();
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState("");
  const [mostrarExportacaoMassa, setMostrarExportacaoMassa] = useState(false);

  async function handleExportarPresenca() {
    if (!turmaSelecionadaId) { avisar("Selecione uma turma."); return; }
    const agora = new Date();
    await pdfService.exportarFolhaPresenca(turmaSelecionadaId, agora.getMonth(), agora.getFullYear());
    avisar("Folha de presenÃ§a exportada.");
  }

  async function handleExportarPresencaMassa(idsSelecionados: string[]) {
    const agora = new Date();
    for (const id of idsSelecionados) {
      await pdfService.exportarFolhaPresenca(id, agora.getMonth(), agora.getFullYear());
    }
    setMostrarExportacaoMassa(false);
    avisar(`${idsSelecionados.length} folha(s) de presenÃ§a exportada(s).`);
  }

  useEffect(() => {
    const atualizar = () => forcarAtualizacao((v) => v + 1);
    window.addEventListener("apusm:historico:mudou", atualizar);
    return () => window.removeEventListener("apusm:historico:mudou", atualizar);
  }, []);

  function avisar(texto: string) {
    setMensagem(texto);
    setTimeout(() => setMensagem(null), 4000);
  }

  function handleBackup() {
    backupService.exportar();
    avisar("Backup baixado com sucesso.");
  }

  function handleSalvarSeedTeste() {
    backupService.exportarSeedTeste();
    avisar("Arquivo seed-teste.json baixado. Mova ele pra src/data e faÃ§a o commit.");
  }

  function handleCarregarSeedTeste() {
    const confirmar = window.confirm(
      "Isso vai substituir todos os dados atuais pelos dados de teste salvos no projeto. Deseja continuar?"
    );

    if (confirmar) {
      backupService.carregarSeedTeste(seedTeste as BackupData);
      avisar("Dados de teste carregados. Recarregando a pÃ¡gina...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  function handleClickRestaurar() {
    inputRestaurarRef.current?.click();
  }

  async function handleArquivoRestaurar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    const confirmar = window.confirm(
      "Isso vai substituir todos os dados atuais pelos dados do arquivo de backup. Deseja continuar?"
    );

    if (confirmar) {
      try {
        await backupService.restaurar(arquivo);
        avisar("Dados restaurados. Recarregando a pÃ¡gina...");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        avisar("Arquivo de backup invÃ¡lido.");
      }
    }

    e.target.value = "";
  }

function handleSalvarDadosNoProjeto() {
    backupService.exportarSeedTeste();
    avisar("Arquivo seed-teste.json baixado. Mova ele pra pasta public/ do projeto e faÃ§a o commit/push.");
  }

  async function handleCarregarDadosDoProjeto() {
    const confirmar = window.confirm(
      "Isso vai substituir todos os dados atuais pelos dados do arquivo seed-teste.json do projeto. Deseja continuar?"
    );
    if (!confirmar) return;

    try {
      await backupService.carregarSeedTesteDoProjeto();
      avisar("Dados carregados do projeto. Recarregando a pÃ¡gina...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      avisar(e instanceof Error ? e.message : "Erro ao carregar dados do projeto.");
    }
  }


  function handleResetarFabrica() {
    const confirmar = window.confirm(
      "Isso vai apagar todos os dados e voltar ao estado inicial do sistema. Essa aÃ§Ã£o nÃ£o pode ser desfeita. Deseja continuar?"
    );

    if (confirmar) {
      backupService.resetarFabrica();
      avisar("Sistema restaurado ao padrÃ£o de fÃ¡brica. Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  function handleApagarTudo() {
    const FRASE = "APUSM ACADEMIA MODALIDADES";

    if (!window.confirm("ATENÃ‡ÃƒO 1/3: isso vai apagar TODOS os associados, turmas, modalidades e instrutores. Deseja continuar?")) return;
    if (!window.confirm("ATENÃ‡ÃƒO 2/3: essa aÃ§Ã£o NÃƒO PODE ser desfeita. Tem certeza absoluta?")) return;
    if (!window.confirm("ATENÃ‡ÃƒO 3/3: Ãºltima chance. Confirmar a exclusÃ£o definitiva de todos os dados?")) return;

    const digitado = window.prompt(`Para confirmar, digite exatamente: ${FRASE}`);
    if (digitado?.trim() !== FRASE) {
      avisar("ConfirmaÃ§Ã£o incorreta. Nenhum dado foi apagado.");
      return;
    }

    backupService.apagarTudo();
    avisar("Todos os dados foram apagados. Recarregando...");
    setTimeout(() => window.location.reload(), 1500);
  }

  async function handleDesfazer() {
    const ok = await historicoService.desfazer();
    if (ok) {
      avisar("Ãšltima alteraÃ§Ã£o desfeita. Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      avisar("NÃ£o hÃ¡ nada para desfazer.");
    }
  }

  async function handleRefazer() {
    const ok = await historicoService.refazer();
    if (ok) {
      avisar("AlteraÃ§Ã£o refeita. Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      avisar("NÃ£o hÃ¡ nada para refazer.");
    }
  }

  async function handleExportarEscalaServico() {
    try {
      await pdfService.exportarEscalaServico();
      avisar("Escala de serviÃ§o exportada.");
    } catch {
      avisar("Erro ao gerar o PDF.");
    }
  }

  async function handleExportarEscalaTurmas() {
    try {
      await pdfService.exportarEscalaTurmas();
      avisar("Escala de turmas exportada.");
    } catch {
      avisar("Erro ao gerar o PDF.");
    }
  }

  async function handleExportarEscalaSalas() {
    try {
      await pdfService.exportarEscalaSalas();
      avisar("Escala de salas exportada.");
    } catch {
      avisar("Erro ao gerar o PDF.");
    }
  }

  function handleAbrirHistorico() {
    setHistorico(pdfService.listarHistorico());
    setMostrarHistorico(true);
  }

  function handleVisualizar(registro: RegistroExportacao) {
    const janela = window.open();
    if (janela) {
      janela.document.write(
        `<iframe src="${registro.dataUri}" style="width:100%;height:100%;border:none"></iframe>`
      );
    }
  }

  function handleBaixarDoHistorico(registro: RegistroExportacao) {
    const link = document.createElement("a");
    link.href = registro.dataUri;
    link.download = registro.nomeArquivo;
    link.click();
  }

  function handleApagarDoHistorico(id: string) {
    pdfService.apagarDoHistorico(id);
    setHistorico(pdfService.listarHistorico());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
          ConfiguraÃ§Ãµes
        </h1>
        <p style={{ color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Ajustes administrativos do sistema APUSM
        </p>
      </div>

      {mensagem && (
        <div
          style={{
            background: "var(--color-success-light)",
            border: "1px solid var(--color-success)",
            color: "var(--color-success)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            fontSize: 14,
          }}
        >
          {mensagem}
        </div>
      )}

      <Section title="Salas" desc="Gerenciar as salas usadas por Modalidades e Turmas">
        <Btn onClick={() => setMostrarSalas(true)}>Gerenciar salas</Btn>
      </Section>

      <Section title="ExportaÃ§Ãµes" desc="Gerar PDFs e consultar exportaÃ§Ãµes anteriores">
        <Btn onClick={handleExportarEscalaServico}>Exportar escala de serviÃ§o</Btn>
        <Btn onClick={handleExportarEscalaTurmas}>Exportar escala de turmas</Btn>
        <Btn onClick={handleExportarEscalaSalas}>Exportar salas</Btn>
        <Btn onClick={handleAbrirHistorico}>HistÃ³rico de exportaÃ§Ãµes</Btn>
      </Section>

      <Section title="Folha de presenÃ§a" desc="Selecione a turma e gere a folha do mÃªs atual">
        <select
          value={turmaSelecionadaId}
          onChange={(e) => setTurmaSelecionadaId(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: "1px solid var(--border-default)", background: "var(--background-primary)", color: "var(--text-primary)" }}
        >
          <option value="">Selecione a turma</option>
          {turmas.map((t) => {
            const mod = modalidades.find((m) => m.id === t.modalidadeId);
            return (
              <option key={t.id} value={t.id}>
                {mod?.nome ?? "-"} â€” {t.dia} {t.horario}
              </option>
            );
          })}
        </select>
        <Btn onClick={handleExportarPresenca}>ðŸ–¨ï¸ Exportar folha de presenÃ§a</Btn>
        <Btn onClick={() => setMostrarExportacaoMassa(true)}>ðŸ“¤ Exportar presenÃ§a em massa</Btn>
      </Section>

      <Section title="Dados de teste (sincronizado via Git)" desc="Salvar ou carregar dados de teste que ficam junto com o cÃ³digo do projeto">
        <Btn onClick={handleSalvarSeedTeste}>Salvar dados atuais como dados de teste</Btn>
        <Btn onClick={handleCarregarSeedTeste}>Carregar dados de teste do projeto</Btn>
      </Section>

      <Section title="Dados do sistema" desc="Backup, restauraÃ§Ã£o e reset. Use com cuidado">
        <Btn onClick={handleBackup}>Fazer backup (baixar .json)</Btn>
        <Btn onClick={handleClickRestaurar}>Restaurar de um backup</Btn>
        <Btn danger onClick={handleResetarFabrica}>Restaurar padrÃ£o de fÃ¡brica</Btn>
        <input
          ref={inputRestaurarRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleArquivoRestaurar}
        />
      </Section>

      <Section title="Sincronizar dados entre PCs (temporÃ¡rio)" desc="Salva os dados de teste como arquivo do projeto, pra levar via Git de um PC pro outro">
        <Btn onClick={handleSalvarDadosNoProjeto}>ðŸ’¾ Salvar dados no projeto</Btn>
        <Btn onClick={handleCarregarDadosDoProjeto}>ðŸ“¥ Carregar dados do projeto</Btn>
      </Section>

      <Section title="Desfazer / Refazer" desc="Reverter as Ãºltimas alteraÃ§Ãµes feitas no sistema">
        <Btn onClick={handleDesfazer} disabled={!historicoService.podeDesfazer()}>
          â†©ï¸ Desfazer Ãºltima aÃ§Ã£o
        </Btn>
        <Btn onClick={handleRefazer} disabled={!historicoService.podeRefazer()}>
          â†ªï¸ Refazer
        </Btn>
      </Section>

      <Section title="PreferÃªncias" desc="AparÃªncia e comportamento do sistema">
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          O tema escuro agora fica disponÃ­vel no botÃ£o ðŸŒ™ no canto superior direito, em qualquer tela.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-primary)" }}>
          <input type="checkbox" defaultChecked /> Pedir confirmaÃ§Ã£o antes de excluir
        </label>
      </Section>

      <Section title="Zona de risco" desc="AÃ§Ãµes que apagam dados permanentemente" perigo>
        <Btn danger onClick={handleApagarTudo}>Apagar tudo e recomeÃ§ar</Btn>
      </Section>

      {mostrarHistorico && (
        <ModalHistorico
          historico={historico}
          onFechar={() => setMostrarHistorico(false)}
          onVisualizar={handleVisualizar}
          onBaixar={handleBaixarDoHistorico}
          onApagar={handleApagarDoHistorico}
        />
      )}

      {mostrarSalas && <SalasModal onFechar={() => setMostrarSalas(false)} />}

      {mostrarExportacaoMassa && (
        <ModalExportacaoMassa
          turmas={turmas}
          modalidades={modalidades}
          onFechar={() => setMostrarExportacaoMassa(false)}
          onConfirmar={handleExportarPresencaMassa}
        />
      )}
    </div>
  );
}

// ==========================
// MODAL DE EXPORTAÃ‡ÃƒO EM MASSA
// ==========================

function ModalExportacaoMassa({
  turmas,
  modalidades,
  onFechar,
  onConfirmar,
}: {
  turmas: { id: string; dia: string; horario: string; modalidadeId: string }[];
  modalidades: { id: string; nome: string }[];
  onFechar: () => void;
  onConfirmar: (idsSelecionados: string[]) => void;
}) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());
  const [exportando, setExportando] = useState(false);

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const nova = new Set(atual);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  function marcarTodas() {
    setSelecionadas(new Set(turmas.map((t) => t.id)));
  }

  function desmarcarTodas() {
    setSelecionadas(new Set());
  }

  async function confirmar() {
    if (selecionadas.size === 0) return;
    setExportando(true);
    await onConfirmar(Array.from(selecionadas));
    setExportando(false);
  }

  return (
    <div
      onClick={onFechar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-modal)" as unknown as number,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apusm-card"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontWeight: 600, fontSize: 17, margin: 0, color: "var(--text-primary)" }}>
            Exportar presenÃ§a em massa
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            Ã—
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button
            onClick={marcarTodas}
            style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--text-primary)" }}
          >
            Marcar todas
          </button>
          <button
            onClick={desmarcarTodas}
            style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--text-primary)" }}
          >
            Desmarcar todas
          </button>
        </div>

        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {turmas.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Nenhuma turma cadastrada.</p>
          ) : (
            turmas.map((t) => {
              const mod = modalidades.find((m) => m.id === t.modalidadeId);
              return (
                <label
                  key={t.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selecionadas.has(t.id)}
                    onChange={() => alternar(t.id)}
                  />
                  {mod?.nome ?? "-"} â€” {t.dia} {t.horario}
                </label>
              );
            })
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onFechar}
            style={{ fontSize: 13, border: "1px solid var(--border-default)", borderRadius: 6, padding: "8px 14px", background: "var(--background-primary)", color: "var(--text-primary)" }}
          >
            Cancelar
          </button>
          <button
            onClick={confirmar}
            disabled={selecionadas.size === 0 || exportando}
            style={{
              fontSize: 13,
              border: "none",
              borderRadius: 6,
              padding: "8px 14px",
              background: "var(--color-primary)",
              color: "#ffffff",
              fontWeight: 600,
              cursor: selecionadas.size === 0 || exportando ? "not-allowed" : "pointer",
              opacity: selecionadas.size === 0 || exportando ? 0.5 : 1,
            }}
          >
            {exportando ? "Exportando..." : `Exportar ${selecionadas.size} folha(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================
// MODAL DE HISTÃ“RICO
// ==========================

function ModalHistorico({
  historico,
  onFechar,
  onVisualizar,
  onBaixar,
  onApagar,
}: {
  historico: RegistroExportacao[];
  onFechar: () => void;
  onVisualizar: (r: RegistroExportacao) => void;
  onBaixar: (r: RegistroExportacao) => void;
  onApagar: (id: string) => void;
}) {
  return (
    <div
      onClick={onFechar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "var(--z-modal)" as unknown as number,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="apusm-card"
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 600, fontSize: 17, margin: 0, color: "var(--text-primary)" }}>
            HistÃ³rico de exportaÃ§Ãµes
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            Ã—
          </button>
        </div>

        {historico.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Nenhuma exportaÃ§Ã£o registrada ainda.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {historico.map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  background: "var(--background-primary)",
                }}
              >
                <div>
                  <p style={{ fontWeight: 500, fontSize: 13, margin: 0, color: "var(--text-primary)" }}>
                    {LABEL_TIPO[r.tipo]}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                    {new Date(r.data).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => onVisualizar(r)}
                    style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--text-primary)" }}
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => onBaixar(r)}
                    style={{ fontSize: 12, border: "1px solid var(--border-default)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--text-primary)" }}
                  >
                    Baixar
                  </button>
                  <button
                    onClick={() => onApagar(r.id)}
                    style={{ fontSize: 12, border: "none", borderRadius: 6, padding: "5px 9px", background: "var(--color-danger)", color: "#ffffff", fontWeight: 600, cursor: "pointer" }}
                  >
                    Apagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================
// SEÃ‡ÃƒO PADRÃƒO
// ==========================

function Section({
  title, desc, children, perigo,
}: { title: string; desc: string; children: React.ReactNode; perigo?: boolean }) {
  return (
    <div
      className="apusm-card"
      style={perigo ? { borderColor: "var(--color-danger)" } : undefined}
    >
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontWeight: 600, fontSize: 16, margin: 0, color: perigo ? "var(--color-danger)" : "var(--text-primary)" }}>
          {title}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, margin: "2px 0 0" }}>
          {desc}
        </p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{children}</div>
    </div>
  );
}

function Btn({
  children,
  danger,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "9px 16px",
        borderRadius: "var(--radius-md)",
        border: `1px solid ${disabled ? "var(--border-default)" : danger ? "var(--color-danger)" : "var(--border-default)"}`,
        background: "var(--background-primary)",
        color: disabled ? "var(--text-disabled)" : danger ? "var(--color-danger)" : "var(--text-primary)",
        fontSize: 13,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}
