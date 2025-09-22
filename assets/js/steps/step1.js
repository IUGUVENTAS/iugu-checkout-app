/**
 * assets/js/steps/step1.js
 * Inicializa os ouvintes e validação para Etapa 1 (Contato) — versão Perú.
 */
function initializeStep1() {
    console.log('Etapa 1 (Contacto Perú) inicializada.');

    // 🎯 Inicializa floating labels
    initializeFloatingLabels();

    // 🔁 Tenta preencher os campos com dados previamente salvos
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const documentNumber = localStorage.getItem('document');
    const phone = localStorage.getItem('phone');

    if (email) {
        const emailInput = document.getElementById('email');
        emailInput.value = email;
        updateFloatingLabel(emailInput);
    }
    if (name) {
        const nameInput = document.getElementById('name');
        nameInput.value = name;
        updateFloatingLabel(nameInput);
    }
    if (documentNumber) {
        const docInput = document.getElementById('document');
        docInput.value = documentNumber;
        updateFloatingLabel(docInput);
    }
    if (phone) {
        const phoneInput = document.getElementById('phone');
        phoneInput.value = phone;
        updateFloatingLabel(phoneInput);
    }

    // 📌 Validação contínua
    const fieldsToValidate = ['email', 'name', 'document', 'phone'];

    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                validatePeruField(input);
                updateFloatingLabel(input);
            });
            
            input.addEventListener('focus', () => {
                updateFloatingLabel(input);
            });
            
            input.addEventListener('blur', () => {
                updateFloatingLabel(input);
            });
        }
    });
}

/**
 * Inicializa os floating labels para todos os inputs
 */
function initializeFloatingLabels() {
    const inputs = document.querySelectorAll('.checkout-input');
    
    inputs.forEach(input => {
        // Atualiza o estado inicial
        updateFloatingLabel(input);
        
        // Listeners para mudanças
        input.addEventListener('input', () => updateFloatingLabel(input));
        input.addEventListener('focus', () => updateFloatingLabel(input));
        input.addEventListener('blur', () => updateFloatingLabel(input));
    });
}

/**
 * Atualiza o estado do floating label baseado no valor do input
 */
function updateFloatingLabel(input) {
    const wrapper = input.closest('.input-wrapper') || input.closest('.input-group');
    if (!wrapper) return;
    
    const hasValue = input.value.trim().length > 0;
    const isFocused = document.activeElement === input;
    
    // Adiciona/remove classe baseado no estado
    if (hasValue || isFocused) {
        wrapper.classList.add('has-value');
        input.classList.add('has-value');
    } else {
        wrapper.classList.remove('has-value');
        input.classList.remove('has-value');
    }
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
