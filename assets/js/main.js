/**
 * /assets/js/main.js
 * Ponto de entrada principal da aplicação. Orquestra a inicialização dos módulos.
 */

document.addEventListener('DOMContentLoaded', async function() {
    // 1. Injeta o HTML de todas as etapas no DOM.
    await injectStepsHTML();

    // 2. Inicializa os manipuladores de eventos globais (botões, resumo).
    initializeCheckout(); 
    initializeSummary();
    
    // 3. Inicializa o listener para comunicação com a loja pai (Shopify).
    initializePostMessageListener();

    // 4. Inicializa a lógica das etapas que não dependem de ações assíncronas (Etapa 1 e 2).
    // ✅ CORREÇÃO: A chamada a initializeStep3() foi removida daqui.
    // Ela agora é chamada em `steps.js` apenas quando o usuário chega na Etapa 3.
    initializeStep1();
    initializeStep2();
});