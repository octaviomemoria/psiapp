/**
 * Imprime um documento HTML sem abrir janela nova (evita bloqueio de pop-up) e sem imprimir o restante do app:
 * o conteúdo vai para um iframe invisível e só ele é enviado à impressora.
 */
export function printHtml(html: string): void {
  if (typeof document === 'undefined') return;

  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);

  const cleanup = () => setTimeout(() => frame.remove(), 1000);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  win.addEventListener('afterprint', cleanup);
  // Dá tempo de o iframe aplicar o estilo antes de abrir a caixa de impressão.
  setTimeout(() => {
    win.focus();
    win.print();
    cleanup();
  }, 250);
}
