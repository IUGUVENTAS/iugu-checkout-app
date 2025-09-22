/**
 * /assets/js/summary.js
 * Gerencia a lógica de exibição e atualização do resumo do pedido (versão Perú).
 */

/**
 * Inicializa o efeito sanfona do resumo do pedido (modo mobile).
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
  console.log('[SUMMARY] Datos recibidos del carrito:', cartData);

  const itemsList = document.getElementById('summary-items-list');
  const subtotalEl = document.getElementById('summary-subtotal');
  const totalEl = document.getElementById('summary-total');
  const totalPreviewEl = document.querySelector('.total-price-preview');

  if (!itemsList || !subtotalEl || !totalEl) {
    console.error('[SUMMARY] Elementos esenciales del DOM no encontrados.');
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
    const itemPrice = formatToSoles(item.price);

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
  const totalFormatted = formatToSoles(cartData.total_price);

  subtotalEl.textContent = totalFormatted;
  totalEl.textContent = totalFormatted;
  if (totalPreviewEl) totalPreviewEl.textContent = totalFormatted;

  // Salva o total no localStorage (em centavos)
  localStorage.setItem('checkout_total', cartData.total_price);
  console.log(`[SUMMARY] Total guardado en localStorage: ${cartData.total_price} centavos`);
}

/**
 * Formata um valor (em centavos) para Soles peruanos (S/ 1.234,56).
 * @param {number} cents - Valor em centavos.
 * @returns {string} - Valor formatado em S/.
 */
function formatToSoles(cents) {
  if (typeof cents !== 'number') return 'S/ 0,00';

  const value = cents / 100;
  return value.toLocaleString('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
