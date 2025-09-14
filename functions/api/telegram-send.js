// Cloudflare Pages Function for Telegram API
export async function onRequestPost({ request, env }) {
  try {
    const { text, chat_id, parse_mode, disable_web_page_preview } = await request.json();

    const botToken  = env.TG_BOT_TOKEN;
    const channelId = chat_id || env.TG_CHANNEL_ID;

    if (!botToken || !channelId) {
      return new Response(JSON.stringify({ error: "Missing TG_BOT_TOKEN or TG_CHANNEL_ID" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }
    if (!text) {
      return new Response(JSON.stringify({ error: "Missing 'text'" }), {
        status: 400, headers: { "Content-Type": "application/json" }
      });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text,
        parse_mode: parse_mode || "HTML",
        disable_web_page_preview: disable_web_page_preview ?? true,
      }),
    });

    const payload = await tgRes.json();
    return new Response(JSON.stringify(payload), {
      status: tgRes.ok ? 200 : tgRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }
}
