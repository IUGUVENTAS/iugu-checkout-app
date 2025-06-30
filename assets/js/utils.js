// assets/js/utils.js

/**
 * A NOSSA ÚNICA FUNÇÃO DE VALIDAÇÃO
 * Valida qualquer campo, verificando apenas se não está vazio,
 * e atualiza a UI com um ícone de sucesso.
 * @param {HTMLInputElement} input - O campo a ser validado.
 */
function validateSimpleField(input) {
    const wrapper = input.closest('.input-wrapper, .input-group');
    if (!wrapper) return;

    const iconContainer = wrapper.querySelector('.validation-icon');
    const isValid = input.value.trim().length > 0;

    wrapper.classList.toggle('valid', isValid);
    wrapper.classList.remove('error'); // Nunca mostraremos erro, apenas sucesso.

    if (iconContainer) {
        if (isValid) {
            const successIconSVG = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>`;
            iconContainer.innerHTML = successIconSVG;
        } else {
            iconContainer.innerHTML = '';
        }
    }
    
    input.setAttribute('aria-invalid', !isValid);
}