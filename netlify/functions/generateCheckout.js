const axios = require('axios');

exports.handler = async (event) => {
  console.log('[generateCheckout] Função iniciada.');

  try {
    // 1. Validação do método HTTP
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Allow': 'POST' },
        body: JSON.stringify({ error: 'Método não permitido. Utilize POST.' })
      };
    }

    // 2. Validação e parse do corpo da requisição
    const body = JSON.parse(event.body);
    const { email, total, pedidoId } = body;

    console.log('[generateCheckout] Payload recebido:', body);

    if (!email || !total || !pedidoId) {
      console.error('[generateCheckout] Validação falhou: Dados obrigatórios ausentes.');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Dados insuficientes. Os campos email, total e pedidoId são obrigatórios.' })
      };
    }

    // 3. --- INÍCIO DA MODIFICAÇÃO PARA TESTE ---
    // Token de acesso real para teste controlado.
    // Lembre-se de reverter para process.env.SUMUP_ACCESS_TOKEN antes do deploy final em produção.
    const accessToken = process.env.SUMUP_ACCESS_TOKEN;

    // 4. Endpoint correto da API SumUp
    const sumupApiUrl = 'https://api.sumup.com/v0.1/checkouts';
    
    console.log(`[generateCheckout] Enviando requisição para SumUp: ${sumupApiUrl}`);

    const response = await axios.post(sumupApiUrl, {
      checkout_reference: pedidoId,
      amount: total,
      currency: 'CLP',
      pay_to_email: 'contacto@cordia.cl',
      description: `Compra em Cordia.cl - Pedido ${pedidoId}`,
      return_url: 'https://cordia.cl/gracias'
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[generateCheckout] Sucesso! Checkout ID gerado:', response.data.id);
    
    // 5. Retorno de sucesso com o checkoutId
    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutId: response.data.id })
    };

  } catch (err) {
    // 6. Bloco CATCH robusto: Garante uma resposta JSON válida em QUALQUER erro
    console.error('[generateCheckout] ERRO CRÍTICO CAPTURADO:', err);
    
    const statusCode = err.response?.status || 500;
    const errorMessage = err.response?.data?.error_message || err.message || 'Ocorreu um erro desconhecido na função.';
    
    return {
      statusCode: statusCode,
      body: JSON.stringify({ 
        error: 'Falha ao criar o checkout na SumUp.',
        details: errorMessage
      })
    };
  }
};