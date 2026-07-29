// ======================================================
// APUSM SaaS — Módulo Configurações
// Arquivo: ConfiguracoesPage.tsx
// Histórico de exportações agora é um modal
// ======================================================

import { useEffect, useRef, useState } from "react";
import { backupService } from "../services/backup.service";
import { historicoService } from "../services/historico.service";
import { pdfService, type RegistroExportacao } from "../services/pdf.service";
import SalasModal from "../../salas/components/SalasModal";



const LABEL_TIPO: Record<RegistroExportacao["tipo"], string> = {
  servico: "Escala de Serviço",
  turmas: "Escala de Turmas",
  salas: "Escala de Salas",
};

export default function ConfiguracoesPage() {
  const inputRestaurarRef = useRef<HTMLInputElement>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [historico, setHistorico] = useState<RegistroExportacao[]>([]);
  const [, forcarAtualizacao] = useState(0);
  const [mostrarSalas, setMostrarSalas] = useState(false);




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
        avisar("Dados restaurados. Recarregando a página...");
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        avisar("Arquivo de backup inválido.");
      }
    }

    e.target.value = "";
  }

  function handleResetarFabrica() {
    const confirmar = window.confirm(
      "Isso vai apagar todos os dados e voltar ao estado inicial do sistema. Essa ação não pode ser desfeita. Deseja continuar?"
    );

    if (confirmar) {
      backupService.resetarFabrica();
      avisar("Sistema restaurado ao padrão de fábrica. Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  function handleApagarTudo() {
    const confirmar = window.confirm(
      "Isso vai apagar TODOS os associados, turmas, modalidades e instrutores. Essa ação não pode ser desfeita. Deseja continuar?"
    );

    if (confirmar) {
      backupService.apagarTudo();
      avisar("Todos os dados foram apagados. Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    }
  }

  function handleDesfazer() {
    const ok = historicoService.desfazer();
    if (ok) {
      avisar("Última alteração desfeita. Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      avisar("Não há nada para desfazer.");
    }
  }

  function handleRefazer() {
    const ok = historicoService.refazer();
    if (ok) {
      avisar("Alteração refeita. Recarregando...");
      setTimeout(() => window.location.reload(), 1000);
    } else {
      avisar("Não há nada para refazer.");
    }
  }

  async function handleExportarEscalaServico() {
    try {
      await pdfService.exportarEscalaServico();
      avisar("Escala de serviço exportada.");
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
          Configurações
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
        <Btn disabled>+ Nova sala</Btn>
        <Btn disabled>Editar salas</Btn>
        <Btn disabled>Excluir sala</Btn>
      </Section>

      <Section title="Exportações" desc="Gerar PDFs e consultar exportações anteriores">
        <Btn onClick={handleExportarEscalaServico}>Exportar escala de serviço</Btn>
        <Btn onClick={handleExportarEscalaTurmas}>Exportar escala de turmas</Btn>
        <Btn onClick={handleExportarEscalaSalas}>Exportar salas</Btn>
        <Btn onClick={handleAbrirHistorico}>Histórico de exportações</Btn>
      </Section>

      <Section title="Dados do sistema" desc="Backup, restauração e reset. Use com cuidado">
        <Btn onClick={handleBackup}>Fazer backup (baixar .json)</Btn>
        <Btn onClick={handleClickRestaurar}>Restaurar de um backup</Btn>
        <Btn danger onClick={handleResetarFabrica}>Restaurar padrão de fábrica</Btn>
        <input
          ref={inputRestaurarRef}
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleArquivoRestaurar}
        />
      </Section>

      <Section title="Desfazer / Refazer" desc="Reverter as últimas alterações feitas no sistema">
        <Btn onClick={handleDesfazer} disabled={!historicoService.podeDesfazer()}>
          ↩️ Desfazer última ação
        </Btn>
        <Btn onClick={handleRefazer} disabled={!historicoService.podeRefazer()}>
          ↪️ Refazer
        </Btn>
      </Section>

      <Section title="Preferências" desc="Aparência e comportamento do sistema">
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          O tema escuro agora fica disponível no botão 🌙 no canto superior direito, em qualquer tela.
        </p>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--text-primary)" }}>
          <input type="checkbox" defaultChecked /> Pedir confirmação antes de excluir
        </label>
      </Section>

      <Section title="Zona de risco" desc="Ações que apagam dados permanentemente" perigo>
        <Btn danger onClick={handleApagarTudo}>Apagar tudo e recomeçar</Btn>
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
    </div>
  );
}

// ==========================
// MODAL DE HISTÓRICO
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
            Histórico de exportações
          </h2>
          <button
            onClick={onFechar}
            style={{ fontSize: 20, lineHeight: 1, color: "var(--text-muted)", background: "none", border: "none" }}
          >
            ×
          </button>
        </div>

        {historico.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Nenhuma exportação registrada ainda.
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
                    style={{ fontSize: 12, border: "1px solid var(--color-danger)", borderRadius: 6, padding: "5px 9px", background: "var(--background-primary)", color: "var(--color-danger)" }}
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
// SEÇÃO PADRÃO
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