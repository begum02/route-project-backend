import { VercelRequest, VercelResponse } from '@vercel/node';
import polyline from '@mapbox/polyline';

interface Step {
  instruction: string;
  type: number;
  distance:string;
  duration: number;
  name?: string;
}

type Coordinate = [number, number]; // [longitude, latitude]


async function calculateRoute(start: Coordinate, end: Coordinate, waypoints: Coordinate[], profile: string) {
  const coordinates = [start, ...(waypoints || []),end];
let data;

  try {
    const apiResponse = await fetch(
      `https://api.openrouteservice.org/v2/directions/${profile}?format=json&instructions=true`,
      {
        method: 'POST',
        headers: {
          'Authorization': process.env.ORS_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coordinates,language: 'tr' }),
      }
    );

  data = await apiResponse.json();
    console.log('ORS data', data);
  } catch (err) {
    return { error: 'ORS yanıtı alınamadı veya parse edilemedi', status: 500 };
  }

  let steps, geometry, summary;


   if (data.features && data.features[0]) {
     const feature = data.features[0];
     steps = feature.properties.segments[0].steps;
     geometry = feature.geometry;
     summary = feature.properties.summary;
   } else if (data.routes && data.routes[0]) {
     const route = data.routes[0];
     steps = route.segments[0].steps;
     summary = route.summary;
     geometry = typeof route.geometry === 'string'
    ? polyline.decode(route.geometry)
    : route.geometry;
    console.log('route.geometry', route.geometry);
   } else {
     return { error: 'Route or steps not found', status: 404 };
   }

  const durationHour = Math.floor(summary.duration / 3600);
  const remainingMinute = Math.round((summary.duration % 3600) / 60);

  let durationText = '';
  if (durationHour > 0 && remainingMinute > 0) {
    durationText = `${durationHour} saat ${remainingMinute} dakika`;
  } else if (durationHour > 0) {
    durationText = `${durationHour} saat`;
  } else if (remainingMinute > 0) {
    durationText = `${remainingMinute} dakika`;
  }

  const distanceKm = (summary.distance / 1000).toFixed(1);

  const parsedSteps: Step[] = steps.map((step: any) => {
    const hour = Math.floor(step.duration / 3600);
    const minute = Math.floor((step.duration % 3600) / 60);
    const second = Math.round(step.duration % 60);
   const distance = (step.distance / 1000).toFixed(1);
    let durationText = '';
    if (hour > 0 && minute > 0) {
      durationText = `${hour} saat ${minute} dakika`;
    } else if (hour > 0) {
      durationText = `${hour} saat`;
    } else if (minute > 0) {
      durationText = `${minute} dakika`;
    } else {
      durationText = `${second} saniye`;
    }
  

    return {
      instruction: step.instruction,
      type: step.type,
      distance: `${distance} km`,
      duration:durationText
     
    };
  });

  if (!steps) {
    return { error: 'Route or steps not found', status: 404 };
  }

  return {
    duration: durationText,
    distance: `${distanceKm} km`,
    steps: parsedSteps,
    geometry

    
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { start, end, waypoints = [], profile } = req.body;
      if (!start || !end || !profile) {
        return res.status(400).json({ error: 'Missing required parameters: start, end, or profile' });
      }
      const result = await calculateRoute(start, end, waypoints, profile);
      if (result && (result as any).error) {
        return res.status((result as any).status || 404).json({ error: (result as any).error });
      }
      console.log(result);
      return res.status(200).json(result);
    }

    if (req.method === 'GET') {
      const start = req.query.start ? JSON.parse(req.query.start as string) : undefined;
      const end = req.query.end ? JSON.parse(req.query.end as string) : undefined;
      const waypoints = req.query.waypoints ? JSON.parse(req.query.waypoints as string) : [];
      const profile = req.query.profile as string;

      if (!start || !end || !profile) {
        return res.status(400).json({ error: 'Missing required parameters: start, end, or profile' });
      }
      const result = await calculateRoute(start, end, waypoints, profile);
      return res.status(200).json(result);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'An error occurred' });
  }
}

// ← Burada dosya bitmeli, fazladan } olmamalı!
// --- IGNORE ---