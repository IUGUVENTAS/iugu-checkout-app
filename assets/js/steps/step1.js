/**
 * assets/js/steps/step1.js
 * Inicializa os ouvintes e validação para Etapa 1 (Contato) — versão Perú.
 */
function initializeStep1() {
    console.log('Etapa 1 (Contacto Perú) inicializada.');

    // 🔁 Tenta preencher os campos com dados previamente salvos
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const documentNumber = localStorage.getItem('document');
    const phone = localStorage.getItem('phone');

    if (email) document.getElementById('email').value = email;
    if (name) document.getElementById('name').value = name;
    if (documentNumber) document.getElementById('document').value = documentNumber;
    if (phone) document.getElementById('phone').value = phone;

    // 📌 Validação contínua
    const fieldsToValidate = ['email', 'name', 'document', 'phone'];

    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                validatePeruField(input);
            });
        }
    });
}

/**
 * Valida campos da Etapa 1 com base no padrão Peruano (DNI, RUC, etc).
 */
function validatePeruField(input) {
    const value = input.value.trim();
    const errorMessage = input.parentElement.querySelector('.error-message');
    const icon = input.parentElement.querySelector('.validation-icon');

    let isValid = true;

    switch (input.id) {
        case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;

        case 'name':
            isValid = value.length >= 3;
            break;

        case 'document':
            // Aceita DNI (8 dígitos) ou RUC (11 dígitos)
            isValid = /^\d{8}$/.test(value) || /^\d{11}$/.test(value);
            break;

        case 'phone':
            // Aceita número peruano com 9 dígitos começando com 9
            isValid = /^9\d{8}$/.test(value);
            break;
    }

    if (isValid) {
        errorMessage.style.display = 'none';
        icon.style.display = 'inline-block';
        input.classList.remove('input-error');
    } else {
        errorMessage.style.display = 'block';
        icon.style.display = 'none';
        input.classList.add('input-error');
    }

    return isValid;
}

/**
 * Salva os dados preenchidos da Etapa 1 no localStorage.
 */
function saveClientDataStep1() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const documentNumber = document.getElementById('document')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();

    const cliente = { name, email, document: documentNumber, phone };
    localStorage.setItem('checkout_cliente', JSON.stringify(cliente));
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('document', documentNumber);
    localStorage.setItem('phone', phone);
}
