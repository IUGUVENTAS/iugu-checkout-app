async function injectStepsHTML() {
  const formContainer = document.getElementById('checkoutForm');
  if (!formContainer) return;

  try {
    const [step1, step2, step3] = await Promise.all([
      fetch('steps/step1.html').then(response => response.text()),
      fetch('steps/step2.html').then(response => response.text()),
      fetch('steps/step3.html').then(response => response.text())
    ]);

    // A única responsabilidade desta função é injetar o HTML.
    formContainer.innerHTML = step1 + step2 + step3;

  } catch (error) {
    console.error("Error al cargar los pasos del checkout:", error);
    formContainer.innerHTML = "<p>Hubo un error al cargar el formulario. Por favor, intente de nuevo.</p>";
  }
}