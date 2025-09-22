// getCIP.js
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido. Use POST.' }),
    };
  }

  try {
    const webhookUrl = 'https://script.google.com/macros/s/AKfycbyRJOof4vkPvZ6srV9m7z7M3ub_d4s34wGuRYJd4U8dBuYKYEm4eYHVtRz7aWOKRGg5/exec';

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Nenhum dado é necessário agora
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: data.error || 'Erro ao recuperar CIP.',
        }),
      };
    }

    const { cip, amount } = data;

    if (!cip || !amount) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Resposta incompleta: CIP ou Monto ausente.' }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ cip, amount }),
    };

  } catch (err) {
    console.error('[getCIP] Erro:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro interno: ' + err.message }),
    };
  }
};
