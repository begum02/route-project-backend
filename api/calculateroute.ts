import { VercelRequest, VercelResponse } from '@vercel/node';

interface Step {
  instruction: string;
  type: number;
  distance: number;
  duration: number;
}
interface Coordinate {
  lat: number;
  lng: number;
}

async function calculateRoute(start: any, end: any, waypoints: any, profile: string) {
  const coordinates = [start, ...(waypoints || []), end];
  const apiResponse = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}`, {
    method: 'POST',
    headers: {
      'Authorization': process.env.ORS_API_KEY || '',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ coordinates })
  });

  if (!apiResponse.ok) {
    throw new Error('Route calculation failed');
  }

  const data = await apiResponse.json();
  const route = data.routes[0];
  if (!route) {
    throw new Error('Route not found');
  }

  const durationHour = Math.floor(route.summary.duration / 3600);
  const remainingMinute = Math.round((route.summary.duration % 3600) / 60);

  let durationText = '';
  if (durationHour > 0 && remainingMinute > 0) {
    durationText = `${durationHour} saat ${remainingMinute} dakika`;
  } else if (durationHour > 0) {
    durationText = `${durationHour} saat`;
  } else if (remainingMinute > 0) {
    durationText = `${remainingMinute} dakika`;
  }

  const distanceKm = (route.summary.distance / 1000).toFixed(1);
  const steps = route.segments[0].steps.map((step: Step) => ({
    instruction: step.instruction,
    iconType: step.type,
    distance: step.distance,
    duration: step.duration,
  }));

  const geometry = route.geometry.coordinates.map((coordinate: [number, number]) => ({
    lat: coordinate[1],
    lon: coordinate[0]
  }));

  return {
    duration: durationText,
    distance: `${distanceKm} km`,
    steps,
    geometry
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { start, end, waypoints, profile } = req.body;
      if (!start || !end || !profile) {
        return res.status(400).json({ error: 'Missing required parameters: start, end, or profile' });
      }
      const result = await calculateRoute(start, end, waypoints, profile);
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred' });
  }
}