// ======================================================
// APUSM SaaS — Módulo Associados
// Arquivo: telefone.ts
// Máscara (00) 00000-0000 / (00) 0000-0000
// ======================================================

export function formatarTelefone(valor: string | undefined | null): string {
  const numeros = (valor ?? "").replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    return numeros.replace(/^(\d*)/, "($1");
  }

  if (numeros.length <= 6) {
    return numeros.replace(/^(\d{2})(\d*)/, "($1) $2");
  }

  if (numeros.length <= 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d*)/, "($1) $2-$3");
  }

  return numeros.replace(/^(\d{2})(\d{5})(\d*)/, "($1) $2-$3");
}