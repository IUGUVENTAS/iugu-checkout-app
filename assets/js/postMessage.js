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
      
      // Limpa dados anteriores sempre que receber novos dados do carrinho
      // Isso garante que não haja conflito entre sessões diferentes
      clearCheckoutData();
      
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
  console.log('[IFRAME] 🚪 Fechando modal do checkout...');
  
  // Limpa os dados antes de fechar
  clearCheckoutData();
  
  if (currentTrustedOrigin && currentTrustedOrigin !== 'null') {
    sendMessageToParent('close-iframe', true, currentTrustedOrigin);
  } else {
    console.warn('🛑 Tentativa de fechar modal sem origem confiável definida');
  }
}

/**
 * Limpa todos os dados do checkout armazenados localmente.
 * Impede que o cliente reutilize dados de sessões anteriores.
 */
function clearCheckoutData() {
  console.log('[IFRAME] 🧹 Limpando dados do checkout...');
  
  // Lista completa de chaves relacionadas ao checkout
  const checkoutKeys = [
    'checkout_cart',
    'checkout_direccion', 
    'checkout_total',
    'checkout_result',
    'selectedShippingMethod',
    'departamento',
    'provincia', 
    'distrito',
    'direccion'
  ];
  
  // Remove cada chave do localStorage
  checkoutKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`[IFRAME] ✅ Removido: ${key}`);
    }
  });
  
  console.log('[IFRAME] 🎯 Todos os dados do checkout foram limpos!');
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

/**
 * Configura listeners para detectar quando o usuário sai do checkout.
 * Limpa os dados automaticamente para forçar nova adição do produto.
 */
function setupExitDetection() {
  // Detecta quando a janela perde o foco (usuário muda de aba/janela)
  window.addEventListener('blur', () => {
    console.log('[IFRAME] 👁️ Janela perdeu foco - limpando dados...');
    clearCheckoutData();
  });
  
  // Detecta quando a página fica escondida (aba inativa)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('[IFRAME] 🙈 Página ficou oculta - limpando dados...');
      clearCheckoutData();
    }
  });
  
  // Detecta tentativas de sair da página (voltar, fechar, navegar)
  window.addEventListener('beforeunload', (event) => {
    console.log('[IFRAME] 🚪 Usuário saindo da página - limpando dados...');
    clearCheckoutData();
    
    // Não mostra confirmação, apenas limpa os dados
    // event.preventDefault(); // Removido para não interferir na UX
  });
  
  // Detecta quando o iframe perde foco (clique fora do iframe)
  window.addEventListener('pagehide', () => {
    console.log('[IFRAME] 📄 Página sendo escondida - limpando dados...');
    clearCheckoutData();
  });
  
  // Listener adicional para mudanças de hash/estado
  window.addEventListener('popstate', () => {
    console.log('[IFRAME] ⬅️ Navegação detectada - limpando dados...');
    clearCheckoutData();
  });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  console.log('[IFRAME] 🚀 Inicializando checkout...');
  
  // Limpa dados residuais ao carregar a página
  // Isso garante um estado limpo para cada nova sessão
  clearCheckoutData();
  
  initializePostMessageListener();
  setupExitDetection();
  
  console.log('[IFRAME] ✅ Sistema de limpeza automática ativado!');
});

// --- EXPOSIÇÃO GLOBAL ---
// Torna a função de limpeza disponível globalmente
window.clearCheckoutData = clearCheckoutData;
window.closeCheckoutModal = closeCheckoutModal;
