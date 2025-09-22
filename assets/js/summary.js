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
  const summaryCloseBtn = document.getElementById('summaryCloseBtn');

  if (!summaryHeader || !summaryCollapsible) {
    console.warn('[SUMMARY] Elementos do resumo não encontrados para inicialização.');
    return;
  }

  // Função para abrir/fechar o resumo
  function toggleSummary() {
    const isHidden = summaryCollapsible.style.display === 'none' || summaryCollapsible.style.display === '';
    
    if (isHidden) {
      // Abrir resumo
      summaryCollapsible.style.display = 'flex';
      summaryCollapsible.classList.add('open');
      
      // 🎯 Garantir que o botão de fechar esteja visível no mobile
      if (window.innerWidth <= 767) {
        const closeBtn = summaryCollapsible.querySelector('.summary-close-btn');
        if (closeBtn) {
          closeBtn.style.display = 'block';
        }
      }
    } else {
      // Fechar resumo
      summaryCollapsible.style.display = 'none';
      summaryCollapsible.classList.remove('open');
    }
  }

  // Event listener para o header
  summaryHeader.addEventListener('click', toggleSummary);

  // Event listener para o botão de fechar (mobile)
  if (summaryCloseBtn) {
    summaryCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Previne que o clique propague para o header
      summaryCollapsible.style.display = 'none';
      summaryCollapsible.classList.remove('open');
    });
  }
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

  // 🎯 VALOR FIXO: Sempre exibir S/ 97.90 independente do produto
  const fixedTotal = 'S/\u00A097.90';
  
  subtotalEl.textContent = fixedTotal;
  totalEl.textContent = fixedTotal;
  if (totalPreviewEl) totalPreviewEl.textContent = fixedTotal;

  // Salva o total fixo no localStorage
  localStorage.setItem('checkout_total', '9790'); // 97.90 em centavos
  console.log(`[SUMMARY] Total fixo configurado: S/ 97.90`);
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
