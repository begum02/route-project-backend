import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Set-Cookie', 'clear=; Max-Age=0');
  try {
    const { lon, lat } = req.query;

    if (!lon || !lat) {
      return res.status(400).json({ error: 'Missing lon or lat parameter' });
    }

    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lon=${lon}&lat=${lat}&zoom=18&addressdetails=1`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).json({ error: 'Nominatim API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}