const AZURE_TTS_KEY = process.env.VITE_AZURE_TTS_KEY || '';
const AZURE_TTS_REGION = process.env.VITE_AZURE_TTS_REGION || '';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!AZURE_TTS_KEY || !AZURE_TTS_REGION) {
    return res.status(500).json({ error: 'Azure TTS configuration not set' });
  }

  try {
    const { input, voice, speed } = req.body;

    // 获取 OAuth token
    const tokenUrl = `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY
      }
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.status(500).json({ error: `Failed to get Azure token: ${tokenRes.status} ${errText}` });
    }

    const token = await tokenRes.text();

    // 将 speed（如 0.7, 1.0）转换为百分比格式（如 70%, 100%）
    const speedPercent = Math.round((speed || 1.0) * 100) + '%';

    // SSML 中需要转义特殊字符
    const escapedInput = (input || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const ssml = `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='${voice || 'en-US-JennyNeural'}'><prosody rate='${speedPercent}'>${escapedInput}</prosody></voice></speak>`;

    const ttsUrl = `https://${AZURE_TTS_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const ttsRes = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
      },
      body: ssml
    });

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      return res.status(ttsRes.status).json({ error: `Azure TTS error: ${errorText}` });
    }

    const buffer = await ttsRes.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Azure TTS proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
