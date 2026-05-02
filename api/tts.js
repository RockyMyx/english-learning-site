const KOKORO_API_URL = process.env.VITE_KOKORO_API_URL || '';
const KOKORO_API_KEY = process.env.VITE_KOKORO_API_KEY || 'not-needed';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!KOKORO_API_URL) {
    return res.status(500).json({ error: 'Kokoro API URL not configured' });
  }

  try {
    const { input, voice, response_format, speed } = req.body;

    const response = await fetch(KOKORO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KOKORO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kokoro',
        input: input || '',
        voice: voice || 'af_bella',
        response_format: response_format || 'mp3',
        speed: speed || 1.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Kokoro API error: ${errorText}` });
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Kokoro proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}