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
