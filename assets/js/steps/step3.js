let isRedirectPrepared = false;

async function initializeStep3() {
  if (isRedirectPrepared) {
    console.log('[step3.js] Redirecionamento externo já configurado.');
    return;
  }

  console.log('[step3.js] Etapa 3 (Pagamento) inicializada.');

  const nextButton = document.getElementById('nextButton');
  const pagoefectivoInfo = document.getElementById('pagoefectivo-info');

  if (!nextButton) {
    console.error('[step3.js] Botão "nextButton" não encontrado.');
    return;
  }

  nextButton.style.display = 'inline-flex';
  nextButton.innerHTML = 'Pagar ahora';

  try {
    // 🔄 Consulta para obter CIP e valor do Google Sheets
    const response = await fetch('/.netlify/functions/getCIP', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const rawResponse = await response.text();
    console.log('[step3.js] Respuesta cruda del backend:', rawResponse);

    let responseData;
    try {
      responseData = JSON.parse(rawResponse);
    } catch (e) {
      throw new Error('Respuesta inválida:\n\n' + rawResponse);
    }

    if (!response.ok) {
      throw new Error(`Error al obtener CIP (${response.status}): ${responseData.error}`);
    }

    const cip = responseData.cip;
    const amount = responseData.amount;

    if (!cip || !amount) throw new Error('Datos incompletos: CIP o monto faltante.');

    isRedirectPrepared = true;

    // Evento ao clicar em "Pagar ahora"
    nextButton.onclick = () => {
      const selectedPayment = document.querySelector('input[name="pago"]:checked');
      if (!selectedPayment) return;

      const method = selectedPayment.value;

      if (method === 'tarjeta') {
        nextButton.disabled = true;
        nextButton.innerHTML = 'Redirigiendo...';
        const paymentUrl = `https://iugu-checkout.netlify.app/checkout/pago-tarjeta.html?id=${cip}`;
        window.open(paymentUrl, '_blank');
      }

      if (method === 'pagoefectivo') {
        nextButton.disabled = true;
        nextButton.innerHTML = 'Generando CIP...';
        const cipUrl = `https://iugu-checkout.netlify.app/checkout/pagoefectivo-payment.html?amount=${amount}&cip=${cip}`;
        window.open(cipUrl, '_blank');
      }
    };

    // Controle visual da seleção de método de pagamento
    document.querySelectorAll('.payment-option').forEach(card => {
      card.addEventListener('click', () => {
        const selected = card.querySelector('input[type="radio"]');
        if (selected && !selected.checked) {
          selected.checked = true;
        }

        document.querySelectorAll('.payment-option').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        const selectedMethod = selected.value;
        if (pagoefectivoInfo) {
          pagoefectivoInfo.style.display = selectedMethod === 'pagoefectivo' ? 'block' : 'none';
        }
      });
    });

  } catch (err) {
    console.error('[step3.js] Error al preparar el pago:', err);
    alert(`Error al preparar el sistema de pago:\n\n${err.message}`);
  }
}
