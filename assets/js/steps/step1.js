/**
 * assets/js/steps/step1.js
 * Inicializa os "ouvintes" de eventos para a Etapa 1, usando a validação simples.
 */
function initializeStep1() {
    console.log('Etapa 1 (Contato) inicializada com validação simples.');

    // 🔁 Tenta preencher os campos com dados previamente salvos
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const rut = localStorage.getItem('rut');
    const phone = localStorage.getItem('phone');

    if (email) document.getElementById('email').value = email;
    if (name) document.getElementById('name').value = name;
    if (rut) document.getElementById('rut').value = rut;
    if (phone) document.getElementById('phone').value = phone;

    // 📌 Validação contínua
    const fieldsToValidate = ['email', 'name', 'rut', 'phone'];

    fieldsToValidate.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
            input.addEventListener('input', () => {
                validateSimpleField(input);
            });
        }
    });
}

/**
 * Salva os dados de contato preenchidos na Etapa 1 no localStorage.
 * Deve ser chamada somente após validação bem-sucedida dos campos obrigatórios.
 */
function saveClientDataStep1() {
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const rut = document.getElementById('rut')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();

    // Salva como objeto e como campos individuais
    const cliente = { name, email, rut, phone };
    localStorage.setItem('checkout_cliente', JSON.stringify(cliente));
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('rut', rut);
    localStorage.setItem('phone', phone);
}
