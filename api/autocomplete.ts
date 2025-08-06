import { VercelRequest, VercelResponse } from '@vercel/node';

console.log("Read Happenedd")
export default async function handler(req: VercelRequest, res: VercelResponse) {

  console.log('Autocomplete API çağrıldı');
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  if(req.method=== 'OPTIONS'){
     return res.status(200).end();
  }

  if (req.method!== 'GET'){
    return res.status(405).json({error:'Method Not Allowed'});
  }

  try {
         const text=req.query.query as string;
         const orsKey=process.env.ORS_API_KEY;
         console.log('ORS_API_KEY:', process.env.ORS_API_KEY ? 'Found' : 'Not found');
         console.log('text:', text);
          
        if(!text||text.trim().length===0){
            return res.status(400).json({error:'text boş olamaz'})
        }

     if(!orsKey){
        return res.status(500).json({error:'ORS API key bulunamadı. Lütfen .env dosyasını kontrol edin.'});
     }

        const params= new URLSearchParams({
            text:text.trim(),
            api_key: orsKey,
            size:'10'
        });

        const url=`https://api.openrouteservice.org/geocode/autocomplete?${params.toString()}`;

        const response=await fetch(url);
        if(!response.ok){
            return res.status(500).json({error:'ORS API isteği başarısız oldu.'});
        }
        const json=await response.json();
        console.log('features count:',json.features?.length|| 0)
        
      return res.status(200).json(json.features||[]);
    }
        
    catch(error){
        console.error('autocomplete versini çekerken hata alındı',error);
        return res.status(500).json({error:'autocomplete versini çekerken hata alındı'});
    }
}
