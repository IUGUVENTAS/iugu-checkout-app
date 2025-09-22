/**
 * assets/js/steps/step2.js
 * Inicializa os ouvintes da Etapa 2 (Entrega) com campos e lógica padrão do Peru.
 */
function initializeStep2() {
    console.log('Etapa 2 (Entrega Perú) inicializada.');

    const fieldsToValidate = ['departamento', 'provincia', 'distrito', 'direccion'];

    // 🔁 Preenche campos com valores salvos
    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const savedValue = localStorage.getItem(fieldId);

        if (input && savedValue) {
            input.value = savedValue;
        }
    });

    // 📌 Validação contínua
    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, () => {
                validateSimpleField(input);
            });
        }
    });

    // 🚚 Inicializa funcionalidade de seleção das shipping-cards
    initializeShippingSelection();
}

/**
 * Inicializa a seleção de métodos de entrega
 */
function initializeShippingSelection() {
    const shippingCards = document.querySelectorAll('.shipping-card');
    
    // Seleciona o primeiro método por padrão (Express)
    if (shippingCards.length > 0) {
        shippingCards[0].classList.add('active');
        localStorage.setItem('selectedShippingMethod', shippingCards[0].getAttribute('data-method') || 'express');
    }

    // Adiciona event listeners para seleção
    shippingCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active de todos os cards
            shippingCards.forEach(c => c.classList.remove('active'));
            
            // Adiciona active ao card clicado
            card.classList.add('active');
            
            // Salva a seleção
            const method = card.getAttribute('data-method') || 'express';
            localStorage.setItem('selectedShippingMethod', method);
            
            console.log(`[STEP2] Método de entrega selecionado: ${method}`);
        });
        
        // Adiciona suporte a teclado
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
        
        // Torna focusável
        card.setAttribute('tabindex', '0');
    });
}

/**
 * Salva os dados de entrega da Etapa 2 no localStorage.
 */
function saveClientDataStep2() {
    const departamento = document.getElementById('departamento')?.value.trim();
    const provincia = document.getElementById('provincia')?.value.trim();
    const distrito = document.getElementById('distrito')?.value.trim();
    const direccion = document.getElementById('direccion')?.value.trim();

    localStorage.setItem('departamento', departamento);
    localStorage.setItem('provincia', provincia);
    localStorage.setItem('distrito', distrito);
    localStorage.setItem('direccion', direccion);

    const envio = { departamento, provincia, distrito, direccion };
    localStorage.setItem('checkout_direccion', JSON.stringify(envio));
}
