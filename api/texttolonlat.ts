import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req:VercelRequest,res:VercelResponse) {
    console.log('Text to LonLat API çağrıldı');
    res.setHeader('Access-Control-Allow-Origin', 'https://route-project-backend-jfiml74lr-begum02s-projects.vercel.app/api/texttolonlat');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Set-Cookie', 'clear=; Max-Age=0');


if(req.method=== 'OPTIONS'){
    return res.status(200).end();
    
}

    if (req.method!== 'POST'){
        return res.status(405).json({error:'Method Not Allowed'});
    }

    try{
        const orsKey=process.env.ORS_API_KEY;
        console.log('ORS_API_KEY:', orsKey ? 'Found' : 'Not found');
        if(!orsKey){
            return res.status(500).json({error:'ORS API key bulunamadı. Lütfen .env dosyasını kontrol edin.'});
    }
        const { text } = req.body;
        console.log('text:', text);
        if(!text || text.trim().length===0){
            return res.status(400).json({error:'text boş olamaz'});
        }

        const params= new URLSearchParams({
            text: text.trim(),
            api_key: orsKey,
            size: '1'
        });
        const url=`https://api.openrouteservice.org/geocode/search?${params.toString()}`;
        const response=await fetch(url);
        if(!response.ok){
            return res.status(500).json({error:'ORS API isteği başarısız oldu.'});
        }

        const data=await response.json();
        if(data.features.length===0){
            return res.status(404).json({error:'Adres bulunamadı.'});
        }

        const lon=data.features[0].geometry.coordinates[0];
        const lat=data.features[0].geometry.coordinates[1];
        return res.status(200).json({lon, lat});
    }

catch(error){
    console.error('Text to LonLat API hatası:', error);
    return res.status(500).json({error:'Text to LonLat API hatası'});
}
}
