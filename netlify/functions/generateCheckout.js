exports.handler = async (event) => {
  console.log('[generateCheckout] Função simulada iniciada.');

  try {
    // 1. Apenas POST é permitido
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Allow': 'POST' },
        body: JSON.stringify({ error: 'Método não permitido. Utilize POST.' })
      };
    }

    // 2. Tenta fazer parse do body recebido
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Corpo da requisição inválido (JSON esperado).' })
      };
    }

    const { email, total, pedidoId } = body;

    // 3. Validação básica dos campos obrigatórios
    if (!email || !total || !pedidoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Campos obrigatórios ausentes: email, total ou pedidoId.'
        })
      };
    }

    // 4. Simulação da geração de um ID de checkout
    const fakeCheckoutId = `pgo-${pedidoId}-${Date.now()}`;
    console.log('[generateCheckout] Retornando checkout simulado:', fakeCheckoutId);

    // 5. Retorno de sucesso
    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutId: fakeCheckoutId })
    };

  } catch (err) {
    console.error('[generateCheckout] Erro inesperado:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro interno ao gerar o checkout.',
        details: err.message
      })
    };
  }
};
