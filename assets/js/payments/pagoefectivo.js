/**
 * assets/js/payments/pagoefectivo.js
 * Responsável por redirecionar o cliente à página de pagamento com código CIP.
 */

/**
 * Redireciona para a página do PagoEfectivo com os parâmetros.
 * @param {string} checkoutId - ID gerado no backend (será usado como CIP).
 * @param {number} amount - Valor total do pedido em soles.
 */
export function handlePagoEfectivo(checkoutId, amount) {
  if (!checkoutId || !amount) {
    console.error('[pagoefectivo.js] Dados inválidos para redirecionamento.');
    alert('No se pudo procesar el pago. Faltan datos.');
    return;
  }

  const cipUrl = `https://iugu-checkout.netlify.app/checkout/pagoefectivo-payment.html?amount=${amount}&cip=${checkoutId}`;
  console.log('[pagoefectivo.js] Redirigiendo a pago efectivo:', cipUrl);
  window.open(cipUrl, '_blank');
}
