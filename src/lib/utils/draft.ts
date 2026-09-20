/**
 * Rascunhos de prontuário no navegador. Protegem o texto digitado contra
 * fechamento acidental do modal, recarga da página e falha ao gravar no banco.
 * Nada é removido daqui até o registro ter sido confirmado pelo banco.
 */
interface StoredDraft<T> {
  savedAt: string;
  data: T;
}

export function loadDraft<T>(key: string): StoredDraft<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredDraft<T>) : null;
  } catch {
    return null;
  }
}

export function saveDraft<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: new Date().toISOString(), data }));
  } catch (e) {
    console.warn('Não foi possível salvar o rascunho local:', e);
  }
}

export function clearDraft(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignorar
  }
}
