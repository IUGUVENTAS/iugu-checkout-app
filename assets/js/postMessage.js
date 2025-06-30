// /assets/js/postMessage.js

/**
 * @const {string} MESSAGE_SOURCE_ID
 * Identificador esperado nas mensagens para validar comunicação legítima com a loja.
 */
const MESSAGE_SOURCE_ID = 'pinflag-shopify-pinmap-pro';

/** @type {string|null} */
let currentTrustedOrigin = null;

/**
 * Inicializa o listener de postMessage para comunicação segura com a janela pai.
 */
function initializePostMessageListener() {
  window.addEventListener('message', (event) => {
    const origin = event.origin;

    // Lista dinâmica de domínios autorizados
    const isTrustedOrigin =
      origin === 'https://cordia.cl' ||
      origin === 'https://tienda-block.store' ||
      origin === 'https://gateway.sumup.com' ||
      /\.myshopify\.com$/.test(new URL(origin).hostname);

    if (!isTrustedOrigin) {
      console.warn(`🛑 Mensagem rejeitada pelo iframe: origem não confiável -> ${origin}`);
      return;
    }

    if (event.data && event.data.type) {
      currentTrustedOrigin = origin; // ⚠️ Captura origem confiável válida
      handleParentMessage(event.data, origin);
    }
  });
}

/**
 * Trata mensagens recebidas da loja (janela pai).
 * @param {object} data - Objeto da mensagem (type, origin, message).
 * @param {string} origin - Origem da mensagem.
 */
function handleParentMessage(data, origin) {
  if (data.origin !== MESSAGE_SOURCE_ID) {
    console.warn(`🛑 Mensagem com origem válida, mas identificador incorreto: ${data.origin}`);
    return;
  }

  switch (data.type) {
    case 'receive-cart-info':
      console.log('[IFRAME] Dados do carrinho recebidos:', data.message);

      if (typeof populateSummary === 'function') {
        populateSummary(data.message);
      }

      localStorage.setItem('checkout_cart', JSON.stringify(data.message));

      sendMessageToParent('iframe-loaded', true, origin);
      break;

    // Outros tipos podem ser tratados aqui no futuro
  }
}

/**
 * Envia mensagem segura para a loja (janela pai).
 * @param {string} type - Tipo do evento (ex: 'iframe-loaded').
 * @param {*} message - Dados a serem enviados.
 * @param {string} targetOrigin - Origem de destino permitida.
 */
function sendMessageToParent(type, message, targetOrigin) {
  const isTrustedTarget =
    targetOrigin === 'https://cordia.cl' ||
    targetOrigin === 'https://tienda-block.store' ||
    targetOrigin === 'https://gateway.sumup.com' ||
    /\.myshopify\.com$/.test(new URL(targetOrigin).hostname);

  if (!isTrustedTarget) {
    console.error(`🛑 Tentativa de enviar mensagem para origem não permitida: ${targetOrigin}`);
    return;
  }

  const payload = {
    type,
    origin: MESSAGE_SOURCE_ID,
    message
  };

  parent.postMessage(payload, targetOrigin);
}

/**
 * Fecha o modal externo da loja.
 */
function closeCheckoutModal() {
  if (currentTrustedOrigin) {
    sendMessageToParent('close-iframe', true, currentTrustedOrigin);
  }
}

/**
 * Redireciona o usuário para a página de sucesso da loja.
 * @param {string} [finalUrl] - URL customizada de sucesso.
 */
function redirectToSuccessPage(finalUrl) {
  if (currentTrustedOrigin) {
    const url = finalUrl || `${currentTrustedOrigin}/pages/gracias-por-tu-compra`;
    sendMessageToParent('redirect-to-checkout', url, currentTrustedOrigin);
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  initializePostMessageListener();
});
