/**
 * /assets/js/steps.js
 * Gerencia a navegação entre as etapas do checkout.
 */

let currentStep = 1;
const totalSteps = 3;
let step3Initialized = false;

function initializeCheckout() {
  const nextButton = document.getElementById('nextButton');
  const backButton = document.getElementById('backButton');

  if (nextButton) nextButton.addEventListener('click', handleNextStep);
  if (backButton) backButton.addEventListener('click', handlePreviousStep);

  showStep(currentStep);
}

function showStep(stepNumber) {
  document.querySelectorAll('.checkout-step').forEach(step => {
    step.style.display = 'none';
  });

  const stepToShow = document.getElementById(`step${stepNumber}-content`);
  if (stepToShow) {
    stepToShow.style.display = 'block';
  } else {
    console.warn(`[steps.js] Etapa ${stepNumber} não encontrada no DOM.`);
  }

  updateButtonVisibility();

  if (stepNumber === 3 && !step3Initialized) {
    if (typeof initializeStep3 === 'function') {
      initializeStep3();
      step3Initialized = true;
    } else {
      console.error('[steps.js] Função initializeStep3() não está definida.');
    }
  }
}

function handleNextStep() {
  if (!validateCurrentStep()) {
    alert('Por favor, completa todos los campos obligatorios para continuar.');
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
    if (!input.value.trim()) return false;
  }
  return true;
}

function saveCurrentStepData() {
  switch (currentStep) {
    case 1:
      if (typeof saveClientDataStep1 === 'function') saveClientDataStep1();
      break;
    case 2:
      if (typeof saveClientDataStep2 === 'function') saveClientDataStep2();
      break;
  }
}

function updateButtonVisibility() {
  const nextButton = document.getElementById('nextButton');
  const backButton = document.getElementById('backButton');
  const sumupWrapper = document.getElementById('sumup-wrapper');

  if (!nextButton || !backButton || !sumupWrapper) {
    console.warn('[steps.js] Botões ou sumupWrapper não encontrados.');
    return;
  }

  const sumupCardContainer = sumupWrapper.parentElement;

  switch (currentStep) {
    case 1:
      backButton.style.display = 'none';
      nextButton.style.display = 'inline-block';
      if (sumupCardContainer) sumupCardContainer.style.display = 'none';
      break;

    case 2:
      backButton.style.display = 'inline-block';
      nextButton.style.display = 'inline-block';
      if (sumupCardContainer) sumupCardContainer.style.display = 'none';
      break;

    case 3:
      backButton.style.display = 'inline-block';
      nextButton.style.display = 'none'; // Esconde botão "Continuar"
      if (sumupCardContainer) sumupCardContainer.style.display = 'block'; // Mostra card de pagamento
      break;
  }
}
