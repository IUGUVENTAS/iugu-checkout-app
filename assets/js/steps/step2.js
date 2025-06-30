/**
 * assets/js/steps/step2.js
 * Inicializa os "ouvintes" de eventos para a Etapa 2, usando a validação simples e preenchimento automático.
 */
function initializeStep2() {
    console.log('Etapa 2 (Entrega) inicializada com validação simples.');

    const fieldsToValidate = ['region', 'comuna', 'calle', 'numero'];

    // 🔁 Preenche campos se valores já estiverem salvos no localStorage
    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const savedValue = localStorage.getItem(fieldId);

        if (input && savedValue) {
            input.value = savedValue;
        }
    });

    // 📌 Ativa validação contínua
    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            const eventType = input.tagName.toLowerCase() === 'select' ? 'change' : 'input';
            input.addEventListener(eventType, () => {
                validateSimpleField(input);
            });
        }
    });
}

/**
 * Salva os dados de entrega da Etapa 2 no localStorage.
 * Deve ser chamada após validação.
 */
function saveClientDataStep2() {
    const region = document.getElementById('region')?.value.trim();
    const comuna = document.getElementById('comuna')?.value.trim();
    const calle = document.getElementById('calle')?.value.trim();
    const numero = document.getElementById('numero')?.value.trim();

    localStorage.setItem('region', region);
    localStorage.setItem('comuna', comuna);
    localStorage.setItem('calle', calle);
    localStorage.setItem('numero', numero);

    const direccion = { region, comuna, calle, numero };
    localStorage.setItem('checkout_direccion', JSON.stringify(direccion));
}
