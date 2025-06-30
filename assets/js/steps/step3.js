let isRedirectPrepared = false;

async function initializeStep3() {
  if (isRedirectPrepared) {
    console.log('[step3.js] Redirecionamento externo já configurado.');
    return;
  }

  console.log('[step3.js] Etapa 3 (Pagamento) inicializada.');

  const nextButton = document.getElementById('nextButton');
  const sumupWrapper = document.getElementById('sumup-wrapper');
  const transferenciaInfo = document.getElementById('transferencia-info');

  if (!nextButton || !sumupWrapper || !transferenciaInfo) {
    console.error('[step3.js] Elementos da Etapa 3 não encontrados no DOM.');
    return;
  }

  try {
    const rawAmount = localStorage.getItem('checkout_total');
    const email = localStorage.getItem('email');
    const amount = parseInt(rawAmount, 10);
    const pedidoId = 'CORDIA-' + Date.now();

    if (isNaN(amount) || !email) {
      alert('Faltam dados do pedido para processar o pago. Por favor, recarregue a página.');
      return;
    }

    let checkoutId = null;

    // Gera checkout antecipadamente para evitar delay no clique
    const response = await fetch('/.netlify/functions/generateCheckout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total: amount, email, pedidoId })
    });

    const rawResponse = await response.text();
    console.log('[step3.js] Resposta bruta do backend:', rawResponse);

    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      throw new Error('Resposta inválida recebida do backend. Conteúdo:\n\n' + rawResponse);
    }

    if (!response.ok) {
      throw new Error(`Erro da API (${response.status}): ${responseData.error} | Detalhes: ${responseData.details}`);
    }

    checkoutId = responseData.checkoutId;
    if (!checkoutId) {
      throw new Error('ID de pagamento válido não foi recebido da API.');
    }

    console.log('[step3.js] checkoutId recebido:', checkoutId);

    isRedirectPrepared = true;

    // Evento ao clicar no botão "Pagar ahora"
    nextButton.onclick = () => {
      const selectedPayment = document.querySelector('input[name="pago"]:checked');
      if (!selectedPayment) return;

      if (selectedPayment.value === 'tarjeta') {
        nextButton.disabled = true;
        nextButton.innerHTML = 'Redirigiendo...';
        window.location.href = `https://iugu-checkout.netlify.app/checkout/iugusumup-payment.html?id=${checkoutId}`;
      } else {
        transferenciaInfo.scrollIntoView({ behavior: 'smooth' });
        alert('Método de transferencia bancaria aún no está habilitado.');
      }
    };

    // Controle de seleção visual entre cartão e transferência
    document.querySelectorAll('.payment-method-card').forEach(card => {
      card.addEventListener('click', () => {
        const selected = card.querySelector('input[type="radio"]');
        if (selected) {
          selected.checked = true;

          document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');

          const isCard = selected.value === 'tarjeta';
          sumupWrapper.style.display = 'none'; // não usado mais no fluxo externo
          transferenciaInfo.style.display = isCard ? 'none' : 'block';
        }
      });
    });

  } catch (err) {
    console.error('[step3.js] Erro crítico ao preparar o pagamento:', err);
    alert(`Ocorreu um erro ao preparar o sistema de pago:\n\n${err.message}`);
  }
}
