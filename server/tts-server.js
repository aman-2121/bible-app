/**
 * Standalone Node.js Backend Server for Addis AI Voices 2 TTS Proxy
 *
 * Use this server to host your TTS proxy independently on any Node.js host (Render, Vercel, Railway, VPS, etc.).
 *
 * SECURITY:
 * Store your Addis AI API key in server/.env:
 * ADDIS_AI_API_KEY=your_key_here
 *
 * To run:
 * node server/tts-server.js
 */

const http = require('http');

const PORT = process.env.PORT || 3001;
const ADDIS_AI_API_KEY = process.env.ADDIS_AI_API_KEY || '';

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/tts' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { text, language = 'am', voice = 'am-hamen', model = 'addis-voice-2' } = payload;

        if (!text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Text is required' }));
          return;
        }

        if (!ADDIS_AI_API_KEY) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Amharic audio is temporarily unavailable. Please try again later.'
          }));
          return;
        }

        // Call Addis AI
        const addisResponse = await fetch('https://api.addisassistant.com/api/v2/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ADDIS_AI_API_KEY,
          },
          body: JSON.stringify({
            model,
            voice: {
              language_code: language,
              voice_id: voice,
            },
            input: {
              text: text.trim(),
            },
          }),
        });

        if (!addisResponse.ok) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Amharic audio is temporarily unavailable. Please try again later.'
          }));
          return;
        }

        const contentType = addisResponse.headers.get('content-type') || '';
        if (contentType.includes('audio') || contentType.includes('octet-stream')) {
          const buffer = await addisResponse.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            audioBase64: `data:audio/mp3;base64,${base64}`,
          }));
          return;
        }

        const data = await addisResponse.json().catch(() => null);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          audioUrl: data?.audio_url || data?.audioUrl,
          audioBase64: data?.audio_base64 || data?.audioBase64,
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Amharic audio is temporarily unavailable. Please try again later.'
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Addis AI TTS Proxy server running on port ${PORT}`);
});
