const AZURE_TTS_ENDPOINT = process.env.VITE_AZURE_TTS_ENDPOINT || '';
const AZURE_TTS_KEY = process.env.VITE_AZURE_TTS_KEY || '';
const AZURE_TTS_REGION = process.env.VITE_AZURE_TTS_REGION || '';

// Azure TTS 需要 OAuth token，这里使用 API Key 直接获取 token
async function getAzureToken() {
  const tokenUrl = `https://${AZURE_TTS_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': AZURE_TTS_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get Azure token: ${response.status}`);
  }
  
  return await response.text();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!AZURE_TTS_ENDPOINT || !AZURE_TTS_KEY) {
    return res.status(500).json({ error: 'Azure TTS configuration not set' });
  }

  try {
    const { input, voice, response_format, speed } = req.body;

    // 获取 OAuth token
    const token = await getAzureToken();

    // Azure TTS 使用 SSML 格式
    const ssml = `
      <speak version='1.0' xml:lang='en-US'>
        <voice xml:lang='en-US' xml:gender='Female' name='${voice || 'en-US-JennyNeural'}'>
          <prosody rate='${speed || 1.0}'>
            ${input || ''}
          </prosody>
        </voice>
      </speak>
    `;

    const audioFormat = response_format === 'mp3' ? 'audio-16khz-128kbitrate-mono-mp3' : 'audio-16khz-128kbitrate-mono-mp3';

    const response = await fetch(`${AZURE_TTS_ENDPOINT}cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': audioFormat
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Azure TTS error: ${errorText}` });
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Azure TTS proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}
