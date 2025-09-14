// Vite plugin to handle Telegram API server-side
export function telegramPlugin() {
  return {
    name: 'telegram-api',
    configureServer(server) {
      server.middlewares.use('/api/telegram-send', async (req, res, next) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
              const { text } = JSON.parse(body);

              if (!text) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Text is required' }));
                return;
              }

              // Server-side environment variables
              const token = process.env.TG_BOT_TOKEN || '8222155579:AAFV4QqTUm0AQmHnD0O41R2lrO3sfVLU2WM';
              const chatId = process.env.TG_CHANNEL_ID || '@vgu_blood_finder_ai';

              if (!token) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Telegram bot not configured' }));
                return;
              }

              // Send message to Telegram
              const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

              if (!response.ok) {
                const errorText = await response.text();
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                  error: 'Failed to send Telegram message',
                  details: errorText
                }));
                return;
              }

              const result = await response.json();

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                ok: true, 
                messageId: result.result?.message_id 
              }));

            } catch (error) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ 
                error: 'Internal server error',
                details: error.message 
              }));
            }
          });

        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    }
  };
}
