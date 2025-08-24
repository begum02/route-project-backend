import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  
    res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Set-Cookie', 'clear=; Max-Age=0');
    
        if(req.method=== 'OPTIONS'){
         return res.status(200).end();
        }
    
        if (req.method!== 'GET'){
        return res.status(405).json({error:'Method Not Allowed'});
        }
    
        try {
        const {text } = req.query;
    
        if (!text || (typeof text === 'string' && text.trim().length === 0)) {
            return res.status(400).json({ error: 'Missing text parameter' });
        }
    
        const apiKey = process.env.ORS_API_KEY || '';
        const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(text as string)}`;
    
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(500).json({ error: 'ORS geocode API error' });
        }
    
        const data = await response.json();
        return res.status(200).json(data);
        } catch (error) {
        console.error('Reverse geocode API error:', error);
        return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
        }












}