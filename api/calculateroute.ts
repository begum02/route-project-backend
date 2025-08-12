import { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(req:VercelRequest,res:VercelResponse){
 
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');

    if(req.method==='OPTIONS'){
        return res.status(200).end();
    }

    if(req.method='POST'){
      const{start,end,waypoints,profile}=req.body;
        if(!start || !end || !profile){
            return res.status(400).json({error:'Missing required parameters: start, end, or profile'});
    }
      try {
          const res = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}`, {
            method: 'POST',
            headers: {
              


      }
    )
    }


}