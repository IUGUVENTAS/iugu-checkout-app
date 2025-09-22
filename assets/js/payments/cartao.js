/**
 * assets/js/payments/cartao.js
 * Responsável por redirecionar o cliente para o pagamento com tarjeta (SumUp).
 */

/**
 * Redireciona para a página de pagamento com cartão via SumUp.
 * @param {string} checkoutId - ID gerado pelo backend.
 */
export function handleTarjeta(checkoutId) {
  if (!checkoutId) {
    console.error('[cartao.js] checkoutId no definido para redirección.');
    alert('No se pudo procesar el pago con tarjeta.');
    return;
  }

  const paymentUrl = `https://iugu-checkout.netlify.app/checkout/pago-tarjeta.html?id=${checkoutId}`;
  console.log('[cartao.js] Redirigiendo a tarjeta SumUp:', paymentUrl);
  window.open(paymentUrl, '_blank');
}
