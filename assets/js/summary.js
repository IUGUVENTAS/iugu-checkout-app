/**
 * /assets/js/summary.js
 * Gerencia a lógica de exibição e atualização do resumo do pedido.
 */

/**
 * Inicializa o efeito sanfona do resumo do pedido.
 */
function initializeSummary() {
  const summaryHeader = document.getElementById('summaryHeader');
  const summaryCollapsible = document.getElementById('summaryCollapsible');
  const summaryHeaderText = document.getElementById('summaryHeaderText');

  if (!summaryHeader || !summaryCollapsible || !summaryHeaderText) {
    console.warn('[SUMMARY] Elementos do resumo não encontrados para inicialização.');
    return;
  }

  summaryHeader.addEventListener('click', () => {
    const isHidden = summaryCollapsible.style.display === 'none' || summaryCollapsible.style.display === '';
    summaryCollapsible.style.display = isHidden ? 'flex' : 'none';
    summaryHeaderText.textContent = isHidden
      ? 'Ocultar resumen de la compra'
      : 'Mostrar resumen de la compra';
  });
}

/**
 * Preenche o resumo do pedido com os dados do carrinho recebidos via postMessage.
 * @param {object} cartData - Objeto com dados do carrinho (items, total_price).
 */
function populateSummary(cartData) {
  console.log('[SUMMARY] Dados recebidos do carrinho:', cartData);

  const itemsList = document.getElementById('summary-items-list');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const totalPreviewEl = document.querySelector('.total-price-preview');

  if (!itemsList || !subtotalEl || !totalEl) {
    console.error('[SUMMARY] Elementos essenciais do DOM não encontrados.');
    return;
  }

  // Limpa conteúdo anterior
  itemsList.innerHTML = '';

  if (!cartData?.items?.length) {
    itemsList.innerHTML = '<p>No hay artículos en tu carrito.</p>';
    return;
  }

  // Renderiza os itens do carrinho
  cartData.items.forEach(item => {
    const itemPrice = (item.price / 100).toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP'
    });

    itemsList.innerHTML += `
      <div class="summary-item">
        <img src="${item.image || ''}" alt="${item.title || 'Producto'}" class="summary-item-img">
        <div class="summary-item-details">
          <div class="summary-item-name" title="${item.title}">${item.title}</div>
          <div class="summary-item-qty">Cantidad: ${item.quantity || 1}</div>
        </div>
        <div class="summary-item-price">${itemPrice}</div>
      </div>`;
  });

  // Formatação do total
  const rawTotal = cartData.total_price;
  const totalPesos = Math.round(rawTotal / 100);
  const totalFormatted = totalPesos.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP'
  });

  subtotalEl.textContent = totalFormatted;
  totalEl.textContent = totalFormatted;
  if (totalPreviewEl) totalPreviewEl.textContent = totalFormatted;

  // Salva o total (em CLP inteiros) no localStorage para uso posterior
  localStorage.setItem('checkout_total', totalPesos);
  console.log(`[SUMMARY] Valor salvo no localStorage: ${totalPesos} CLP`);
}
