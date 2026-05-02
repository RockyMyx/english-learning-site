export default async function handler(req, res) {
  const text = req.query.text;

  if (!text) {
    return res.status(400).json({ error: 'Missing text parameter' });
  }

  try {
    const encodedText = encodeURIComponent(text);
    const audioUrl = `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=2`;

    const response = await fetch(audioUrl);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Youdao API error: ${response.status}` });
    }

    const contentType = response.headers.get('content-type') || 'audio/mpeg';
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Youdao proxy error:', error);
    res.status(500).json({ error: error.message });
  }
}