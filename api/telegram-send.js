// Cloudflare Pages Function for Telegram API
export async function onRequest(context) {
  const { request, env } = context;

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const token = env.TG_BOT_TOKEN;
    const chatId = env.TG_CHANNEL_ID;

    if (!token || !chatId) {
      return new Response(
        JSON.stringify({ error: 'Telegram bot not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send message to Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send Telegram message',
          details: errorText
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const result = await telegramResponse.json();

    return new Response(
      JSON.stringify({ 
        ok: true, 
        messageId: result.result?.message_id 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
