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

    // Ignora mensagens sem dados ou sem type (extensões do navegador, etc)
    if (!event.data || !event.data.type) {
      return;
    }

    // Lista dinâmica de domínios autorizados
    const isTrustedOrigin =
      origin === 'https://topitop-pe.sbs' ||
      origin === 'https://tienda-block.store' ||
      origin === 'https://iugu-checkout.netlify.app' ||
      /\.myshopify\.com$/.test(new URL(origin).hostname);

    if (!isTrustedOrigin) {
      // Só log para origens com dados estruturados
      console.warn(`🛑 Mensagem rejeitada pelo iframe: origem não confiável -> ${origin}`, event.data);
      return;
    }

    currentTrustedOrigin = origin; // ⚠️ Captura origem confiável válida
    handleParentMessage(event.data, origin);
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

    case 'redirect-to-checkout':
      // Pode ser string (URL final) ou objeto completo do pedido
      if (typeof data.message === 'string') {
        window.location.href = data.message;
      } else if (typeof data.message === 'object') {
        console.log('[IFRAME] Redirecionamento solicitado com dados do pedido:', data.message);
        // Você pode armazenar os dados no localStorage para usar no success.html
        localStorage.setItem('checkout_result', JSON.stringify(data.message));
        window.location.href = '/checkout/success.html';
      } else {
        console.warn('[IFRAME] redirect-to-checkout: formato de mensagem desconhecido:', data.message);
      }
      break;

    // Outros eventos futuros aqui...
  }
}

/**
 * Envia mensagem segura para a loja (janela pai).
 * @param {string} type - Tipo do evento (ex: 'iframe-loaded').
 * @param {*} message - Dados a serem enviados.
 * @param {string} targetOrigin - Origem de destino permitida.
 */
function sendMessageToParent(type, message, targetOrigin) {
  // Validação de entrada
  if (!targetOrigin || targetOrigin === 'null' || targetOrigin === 'undefined') {
    console.warn(`🛑 Target origin inválido para postMessage: ${targetOrigin}`);
    return;
  }

  let hostname;
  try {
    hostname = new URL(targetOrigin).hostname;
  } catch (error) {
    console.warn(`🛑 Target origin malformado: ${targetOrigin}`);
    return;
  }

  const isTrustedTarget =
    targetOrigin === 'https://topitop-pe.sbs/' ||
    targetOrigin === 'https://tienda-block.store' ||
    targetOrigin === 'https://iugu-checkout.netlify.app' ||
    /\.myshopify\.com$/.test(hostname);

  if (!isTrustedTarget) {
    console.warn(`🛑 Tentativa de enviar mensagem para origem não permitida: ${targetOrigin}`);
    return;
  }

  const payload = {
    type,
    origin: MESSAGE_SOURCE_ID,
    message
  };

  try {
    parent.postMessage(payload, targetOrigin);
  } catch (error) {
    console.warn(`🛑 Erro ao enviar postMessage para ${targetOrigin}:`, error.message);
  }
}

/**
 * Fecha o modal externo da loja.
 */
function closeCheckoutModal() {
  if (currentTrustedOrigin && currentTrustedOrigin !== 'null') {
    sendMessageToParent('close-iframe', true, currentTrustedOrigin);
  } else {
    console.warn('🛑 Tentativa de fechar modal sem origem confiável definida');
  }
}

/**
 * Redireciona o usuário para a página de sucesso da loja.
 * @param {string} [finalUrl] - URL customizada de sucesso.
 */
function redirectToSuccessPage(finalUrl) {
  if (currentTrustedOrigin && currentTrustedOrigin !== 'null') {
    const url = finalUrl || `${currentTrustedOrigin}/pages/gracias-por-tu-compra`;
    sendMessageToParent('redirect-to-checkout', url, currentTrustedOrigin);
  } else {
    console.warn('🛑 Tentativa de redirect sem origem confiável definida');
    // Fallback: tentar redirect direto
    if (finalUrl) {
      window.top.location.href = finalUrl;
    }
  }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  initializePostMessageListener();
});
