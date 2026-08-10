// Guarda uma copia dos dados no navegador.
// Se a internet cair, usa essa copia em vez de travar a tela.
const PREFIXO = "apusm_cache_";

export async function buscarComCache<T>(chave: string, buscarDoBanco: () => Promise<T[]>, aoAtualizar: (dados: T[]) => void): Promise<T[]> {
  const chaveCache = PREFIXO + chave;
  const salvo = localStorage.getItem(chaveCache);
  let dadosCache = [];

  if (salvo) {
    try {
      dadosCache = JSON.parse(salvo);
      aoAtualizar(dadosCache);
    } catch {}
  }

  try {
    const dadosFrescos = await buscarDoBanco();
    localStorage.setItem(chaveCache, JSON.stringify(dadosFrescos));
    return dadosFrescos;
  } catch (erro) {
    if (dadosCache.length > 0) {
      return dadosCache;
    }
    throw erro;
  }
}

