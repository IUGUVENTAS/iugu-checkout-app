/**
 * /assets/js/steps.js
 * Gerencia a navegação entre as etapas do checkout.
 */

let currentStep = 1;
const totalSteps = 3;

// Flag para garantir que a etapa 3 seja inicializada apenas uma vez.
let step3Initialized = false;

function initializeCheckout() {
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');

    if (nextButton) {
        nextButton.addEventListener('click', handleNextStep);
    }
    if (backButton) {
        backButton.addEventListener('click', handlePreviousStep);
    }
    
    showStep(currentStep);
}

function showStep(stepNumber) {
    document.querySelectorAll('.checkout-step').forEach(step => {
        step.style.display = 'none';
    });

    const stepToShow = document.getElementById(`step${stepNumber}-content`);
    if (stepToShow) {
        stepToShow.style.display = 'block';
    }

    updateButtonVisibility();

    // ✅ CORREÇÃO: Inicializa a Etapa 3 apenas quando ela for exibida pela primeira vez.
    if (stepNumber === 3 && !step3Initialized) {
        initializeStep3();
        step3Initialized = true;
    }
}

function handleNextStep() {
    if (!validateCurrentStep()) {
        alert('Por favor, complete todos los campos obligatorios para continuar.');
        return;
    }

    saveCurrentStepData();

    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
    }
}

function handlePreviousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function validateCurrentStep() {
    const currentStepContent = document.getElementById(`step${currentStep}-content`);
    if (!currentStepContent) return false;

    const requiredInputs = currentStepContent.querySelectorAll('input[required], select[required]');
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            return false;
        }
    }
    return true;
}

function saveCurrentStepData() {
    if (currentStep === 1) {
        saveClientDataStep1();
    } else if (currentStep === 2) {
        saveClientDataStep2();
    }
}

function updateButtonVisibility() {
    const nextButton = document.getElementById('nextButton');
    const backButton = document.getElementById('backButton');
    const paymentButton = document.getElementById('custom-submit-button');
    const sumupWrapper = document.getElementById('sumup-wrapper');


    if (!nextButton || !backButton || !paymentButton || !sumupWrapper) return;

    if (currentStep === 1) {
        backButton.style.display = 'none';
        nextButton.style.display = 'inline-block';
        sumupWrapper.parentElement.style.display = 'none';
    } else if (currentStep > 1 && currentStep < totalSteps) {
        backButton.style.display = 'inline-block';
        nextButton.style.display = 'inline-block';
        sumupWrapper.parentElement.style.display = 'none';
    } else if (currentStep === totalSteps) {
        backButton.style.display = 'inline-block';
        nextButton.style.display = 'none'; // Esconde o botão "Continuar"
        sumupWrapper.parentElement.style.display = 'block'; // Mostra o card de pagamento
    }
}