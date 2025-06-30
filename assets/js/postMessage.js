// /assets/js/postMessage.js

/**
 * @const {string[]} ALLOWED_PARENT_ORIGINS
 * @description Lista de origens pai (loja Shopify) autorizadas a enviar mensagens para este iframe.
 */
const ALLOWED_PARENT_ORIGINS = [
    'https://sffats-9p.myshopify.com'
    // Adicione aqui a origem do seu ambiente de desenvolvimento da loja, se tiver
];

// O identificador que a loja Shopify espera nas mensagens enviadas pelo iframe.
const MESSAGE_SOURCE_ID = 'pinflag-shopify-pinmap-pro';

/**
 * Inicializa o listener de postMessage para comunicação segura com a janela pai.
 */
function initializePostMessageListener() {
    window.addEventListener('message', (event) => {
        // 🔐 Verificação de Segurança: A mensagem vem de uma origem pai autorizada?
        if (!ALLOWED_PARENT_ORIGINS.includes(event.origin)) {
            console.warn(`🛑 Mensagem rejeitada pelo iframe: origem não confiável -> ${event.origin}`);
            return;
        }

        // Processa apenas mensagens com a estrutura esperada
        if (event.data && event.data.type) {
            handleParentMessage(event.data, event.origin);
        }
    });
}

/**
 * Trata as mensagens recebidas da loja Shopify.
 * @param {object} data - O objeto da mensagem (ex: { type, origin, message }).
 * @param {string} origin - A origem da mensagem, já validada.
 */
function handleParentMessage(data, origin) {
    // Verifica a "senha" secundária que a sua loja envia
    if (data.origin !== MESSAGE_SOURCE_ID) {
        console.warn(`🛑 Mensagem de origem válida, mas com identificador incorreto: ${data.origin}`);
        return;
    }

    switch (data.type) {
        case 'receive-cart-info':
            console.log('[IFRAME] Dados do carrinho recebidos:', data.message);
            
            // Suas funções para popular o checkout
            if (window.populateSummary) {
                populateSummary(data.message);
            }
            localStorage.setItem('checkout_cart', JSON.stringify(data.message));

            // Notifica a loja que os dados foram recebidos e processados
            sendMessageToParent('iframe-loaded', true, origin);
            break;
    }
}

/**
 * Envia uma mensagem de forma segura para a janela pai (loja Shopify).
 * @param {string} type - O tipo de evento (ex: 'redirect-to-checkout').
 * @param {*} message - O conteúdo da mensagem.
 * @param {string} targetOrigin - A origem para a qual a mensagem deve ser enviada.
 */
function sendMessageToParent(type, message, targetOrigin) {
    if (!ALLOWED_PARENT_ORIGINS.includes(targetOrigin)) {
        console.error(`🛑 Tentativa de enviar mensagem para origem não permitida: ${targetOrigin}`);
        return;
    }

    const payload = {
        type: type,
        origin: MESSAGE_SOURCE_ID, // Usa o identificador que a loja espera
        message: message
    };
    
    parent.postMessage(payload, targetOrigin);
}

/**
 * Função para fechar o modal a partir do iframe.
 * Ex: pode ser chamada por um botão "Cancelar" ou "Voltar para a loja".
 */
function closeCheckoutModal() {
    sendMessageToParent('close-iframe', true, ALLOWED_PARENT_ORIGINS[0]);
}

/**
 * Função para redirecionar o usuário para a página de sucesso após o pagamento.
 * @param {string} finalUrl - A URL completa da página de "Obrigado".
 */
function redirectToSuccessPage(finalUrl) {
    // Por padrão, usa a URL da sua loja + a página de obrigado.
    const url = finalUrl || `${ALLOWED_PARENT_ORIGINS[0]}/pages/gracias-por-tu-compra`;
    sendMessageToParent('redirect-to-checkout', url, ALLOWED_PARENT_ORIGINS[0]);
}


// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initializePostMessageListener();
});