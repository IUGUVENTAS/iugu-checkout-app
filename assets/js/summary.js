/**
 * /assets/js/summary.js
 * Gerencia a lógica de exibição e atualização do resumo do pedido.
 */

/**
 * Inicializa os ouvintes de eventos para o resumo do pedido (efeito sanfona).
 */
function initializeSummary() {
    const summaryHeader = document.getElementById('summaryHeader');
    const summaryCollapsible = document.getElementById('summaryCollapsible');
    const summaryHeaderText = document.getElementById('summaryHeaderText');

    if (summaryHeader && summaryCollapsible && summaryHeaderText) {
        summaryHeader.addEventListener('click', () => {
            const isHidden = summaryCollapsible.style.display === 'none' || summaryCollapsible.style.display === '';
            summaryCollapsible.style.display = isHidden ? 'flex' : 'none';
            summaryHeaderText.textContent = isHidden ? 'Ocultar resumen de la compra' : 'Mostrar resumen de la compra';
        });
    }
}

/**
 * Preenche o resumo do pedido com os dados do carrinho recebidos da loja pai.
 * @param {object} cartData - O objeto do carrinho (items, total_price).
 */
function populateSummary(cartData) {
    console.log('[SUMMARY] Dados recebidos do carrinho:', cartData);
    const itemsList = document.getElementById('summary-items-list');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    const totalPreviewEl = document.querySelector('.total-price-preview');

    if (!itemsList || !subtotalEl || !totalEl) {
        console.error('[SUMMARY] Elementos essenciais do resumo não encontrados no DOM.');
        return;
    }
    
    itemsList.innerHTML = '';
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        itemsList.innerHTML = '<p>No hay artículos en tu carrito.</p>';
        return;
    }

    cartData.items.forEach(item => {
        const itemPrice = (item.price / 100).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
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

    const rawTotal = cartData.total_price;
    const totalFormatted = (rawTotal / 100).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });

    subtotalEl.textContent = totalFormatted;
    totalEl.textContent = totalFormatted;
    if (totalPreviewEl) {
        totalPreviewEl.textContent = totalFormatted;
    }

    // ✅ CORREÇÃO: Salva o total bruto (em "centavos") diretamente.
    // Este valor é o que a API da SumUp espera.
    localStorage.setItem('checkout_total', rawTotal);
    console.log(`[SUMMARY] Valor bruto ${rawTotal} salvo em localStorage.`);
}