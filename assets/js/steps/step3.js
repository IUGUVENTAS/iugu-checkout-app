let cipCache = null;
let isProcessingPayment = false;

async function initializeStep3() {
  console.log('[step3.js] Etapa 3 (Pagamento) inicializada.');

  // 🎯 TRACKING: Início do Step 3
  if (window.checkoutTracker) {
    window.checkoutTracker.startStep(3);
  }

  const nextButton = document.getElementById('nextButton');
  const pagoefectivoInfo = document.getElementById('pagoefectivo-info');

  if (!nextButton) {
    console.error('[step3.js] Botão "nextButton" não encontrado.');
    return;
  }

  nextButton.style.display = 'inline-flex';
  nextButton.innerHTML = 'Pagar ahora';

  // 🎯 TRACKING: Método de pagamento selecionado (PagoEfectivo é o único)
  if (window.checkoutTracker) {
    window.checkoutTracker.trackPaymentMethodSelect('pagoefectivo');
  }

  // ⚡ Evento otimizado ao clicar em "Pagar ahora" - CIP é obtido apenas quando necessário
  nextButton.onclick = async () => {
    const selectedPayment = document.querySelector('input[name="pago"]:checked');
    if (!selectedPayment) return;

    // Evita múltiplos cliques durante o processamento
    if (isProcessingPayment) return;
    isProcessingPayment = true;

    const method = selectedPayment.value;

    if (method === 'pagoefectivo') {
      try {
        // Atualiza o botão para mostrar progresso
        nextButton.disabled = true;
        nextButton.innerHTML = '⏳ Obteniendo CIP...';

        // 🚀 Verifica cache primeiro para evitar requisições desnecessárias
        let cip, amount;
        if (cipCache) {
          console.log('[step3.js] Usando CIP do cache');
          cip = cipCache.cip;
          amount = cipCache.amount;
        } else {
          console.log('[step3.js] Consultando CIP...');
          
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
            throw new Error('Respuesta inválida del servidor');
          }

          if (!response.ok) {
            throw new Error(`Error al obtener CIP (${response.status}): ${responseData.error}`);
          }

          cip = responseData.cip;
          amount = responseData.amount;

          if (!cip || !amount) {
            throw new Error('Datos incompletos: CIP o monto faltante.');
          }

          // 💾 Guarda no cache para próximos usos
          cipCache = { cip, amount };
        }

        // 🎯 TRACKING: Início do processo de pagamento
        if (window.checkoutTracker) {
          window.checkoutTracker.trackGA4('add_payment_info', {
            payment_type: method,
            currency: 'PEN',
            value: amount
          });
          
          window.checkoutTracker.trackFB('AddPaymentInfo', {
            content_type: 'product',
            currency: 'PEN',
            value: amount
          });
        }

        // Atualiza botão antes do redirecionamento
        nextButton.innerHTML = '🚀 Redirigiendo...';
        
        // 🎯 TRACKING: Redirecionamento para pagamento
        if (window.checkoutTracker) {
          window.checkoutTracker.trackGA4('begin_payment', {
            payment_method: 'pagoefectivo',
            currency: 'PEN',
            value: amount,
            cip: cip
          });
          
          window.checkoutTracker.trackFB('Custom', {
            event_name: 'PaymentRedirect',
            payment_method: 'pagoefectivo',
            cip: cip
          });
        }

        // ⚡ Redirecionamento imediato
        const cipUrl = `https://iugu-checkout.netlify.app/checkout/pagoefectivo-payment.html?amount=${amount}&cip=${cip}`;
        window.open(cipUrl, '_blank');

        // Reset do botão após sucesso
        setTimeout(() => {
          nextButton.disabled = false;
          nextButton.innerHTML = 'Pagar ahora';
          isProcessingPayment = false;
        }, 2000);

      } catch (err) {
        console.error('[step3.js] Error al procesar el pago:', err);
        
        // Reset do botão em caso de erro
        nextButton.disabled = false;
        nextButton.innerHTML = 'Pagar ahora';
        isProcessingPayment = false;
        
        alert(`Error al procesar el pago:\n\n${err.message}`);
      }
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
}
