/**
 * /assets/js/steps/step3.js
 * Gerencia a lógica da Etapa 3: Pagamento com SumUp.
 */

let isSumUpMounted = false;

async function initializeStep3() {
    if (isSumUpMounted) {
        console.log('[step3.js] Widget da SumUp já foi montado.');
        return;
    }
    console.log('[step3.js] Etapa 3 (Pagamento) inicializada.');

    const nextButton = document.getElementById('custom-submit-button');
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

        const { checkoutId } = responseData;
        if (!checkoutId) {
            throw new Error('ID de pagamento válido não foi recebido da API.');
        }

        const sumupCard = SumUpCard.mount({
            id: 'sumup-card',
            checkoutId: checkoutId,
            locale: 'es-CL',
            onResponse: function (type, body) {
                console.log('[SumUp Widget Response]', type, body);
                if (type === 'success') {
                    parent.postMessage({
                        type: 'redirect-to-checkout',
                        message: { status: 'ok', orderId: body.id, transaction_code: body.transaction_code }
                    }, 'https://sffats-9p.myshopify.com');
                } else if (type === 'fail') {
                    alert('O pagamento falhou ou foi cancelado. Por favor, tente novamente.');
                    nextButton.disabled = false;
                    nextButton.innerHTML = 'Pagar ahora';
                }
            }
        });
        
        isSumUpMounted = true;

        nextButton.onclick = () => {
            const selectedPayment = document.querySelector('input[name="pago"]:checked');
            if (selectedPayment?.value === 'tarjeta') {
                nextButton.disabled = true;
                nextButton.innerHTML = 'Procesando...';
                sumupCard.submit();
            }
        };

        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.addEventListener('click', () => {
                const selected = card.querySelector('input[type="radio"]');
                if (selected) {
                    selected.checked = true;
                    document.querySelectorAll('.payment-method-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    sumupWrapper.style.display = selected.value === 'tarjeta' ? 'block' : 'none';
                    transferenciaInfo.style.display = selected.value === 'tarjeta' ? 'none' : 'block';
                }
            });
        });

    } catch (err) {
        console.error('[step3.js] Erro crítico ao preparar o pagamento:', err);
        alert(`Ocorreu um erro ao preparar o sistema de pago:\n\n${err.message}`);
    }
}