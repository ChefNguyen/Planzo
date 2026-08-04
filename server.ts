import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Google Places / Geocoding Server Proxy Endpoint
  app.get('/api/places/search', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query || query.trim().length < 2) {
        return res.json({ results: [] });
      }

      const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY;

      if (apiKey) {
        // Use Google Places API (New) - Search Text
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.addressComponents',
          },
          body: JSON.stringify({
            textQuery: query,
            maxResultCount: 8,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.places && Array.isArray(data.places)) {
            const mapped = data.places.map((place: any) => ({
              name: place.displayName?.text || place.formattedAddress || query,
              formattedAddress: place.formattedAddress || '',
              lat: place.location?.latitude,
              lng: place.location?.longitude,
              source: 'google',
            }));
            return res.json({ results: mapped });
          }
        }
      }

      // Fallback to Geocoding search if no key or error
      const geoResp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
      );
      if (geoResp.ok) {
        const geoData = await geoResp.json();
        if (geoData.results && Array.isArray(geoData.results)) {
          const mapped = geoData.results.map((item: any) => ({
            name: item.country ? `${item.name}, ${item.country}` : item.name,
            formattedAddress: item.admin1 ? `${item.admin1}, ${item.country || ''}` : item.country || '',
            lat: item.latitude,
            lng: item.longitude,
            source: 'geocoding',
          }));
          return res.json({ results: mapped });
        }
      }

      return res.json({ results: [] });
    } catch (err) {
      console.error('Error in /api/places/search:', err);
      return res.status(500).json({ error: 'Failed to search places' });
    }
  });

  // AI Itinerary Generation Endpoint
  app.post('/api/generate-itinerary', async (req, res) => {
    try {
      const { mode, destination, dates, vibes, prompt } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing. Returning smart default itinerary.');
        return res.json(createFallbackItinerary(destination || 'Tokyo, Japan', dates || 'Next Weekend', vibes || ['Adventure', 'Foodie'], prompt));
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      let systemPrompt = `You are Planzo AI, an elite, stylish travel itinerary generator. Your job is to generate a highly detailed, curated 2-day or 3-day travel itinerary with specific time slots, iconic & hidden gem destinations, vivid vibe descriptions, and location details.`;

      let userPrompt = '';
      if (mode === 'prompt' && prompt) {
        userPrompt = `Generate a customized travel itinerary based on this prompt: "${prompt}".`;
      } else {
        const dest = destination || 'Tokyo, Japan';
        const d = dates || 'Upcoming Weekend';
        const v = Array.isArray(vibes) && vibes.length > 0 ? vibes.join(', ') : 'Adventure & Foodie';
        userPrompt = `Generate a customized travel itinerary for destination "${dest}" for dates "${d}" with the following vibes: "${v}".`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              destination: { type: Type.STRING },
              dates: { type: Type.STRING },
              region: { type: Type.STRING },
              totalStops: { type: Type.INTEGER },
              activeHours: { type: Type.NUMBER },
              vibes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    activities: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          time: { type: Type.STRING },
                          title: { type: Type.STRING },
                          vibe: { type: Type.STRING },
                          location: { type: Type.STRING },
                          category: { type: Type.STRING },
                        },
                        required: ['time', 'title', 'vibe'],
                      },
                    },
                  },
                  required: ['dayNumber', 'title', 'activities'],
                },
              },
            },
            required: ['destination', 'dates', 'region', 'days'],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const itinerary = {
          id: `trip-${Date.now()}`,
          destination: parsed.destination || destination || 'Custom Escapes',
          dates: parsed.dates || dates || 'Flexible Dates',
          vibes: parsed.vibes || vibes || ['Bespoke'],
          totalStops: parsed.totalStops || (parsed.days ? parsed.days.reduce((acc: number, day: any) => acc + (day.activities ? day.activities.length : 0), 0) : 4),
          activeHours: parsed.activeHours || 6.5,
          region: parsed.region || 'Central District',
          createdAt: new Date().toISOString(),
          days: (parsed.days || []).map((d: any, idx: number) => ({
            dayNumber: d.dayNumber || idx + 1,
            title: d.title || `Day ${idx + 1}`,
            activities: (d.activities || []).map((act: any, aIdx: number) => ({
              id: `act-${idx + 1}-${aIdx + 1}-${Date.now()}`,
              time: act.time || '10:00 AM - 12:00 PM',
              title: act.title || 'Local Highlight',
              vibe: act.vibe || 'Curated experience',
              location: act.location || parsed.destination,
              category: act.category || 'culture',
            })),
          })),
        };
        return res.json(itinerary);
      }

      return res.json(createFallbackItinerary(destination, dates, vibes, prompt));
    } catch (error) {
      console.error('Error generating itinerary with Gemini:', error);
      const { destination, dates, vibes, prompt } = req.body;
      return res.json(createFallbackItinerary(destination, dates, vibes, prompt));
    }
  });

  // Vite development middleware vs production static files
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (!hasBuiltDist || process.env.DEV === 'true') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Planzo AI Server running on http://0.0.0.0:${PORT}`);
  });
}

function createFallbackItinerary(destination?: string, dates?: string, vibes?: string[], prompt?: string) {
  const dest = destination || (prompt ? extractDestinationFromPrompt(prompt) : 'Tokyo, Japan');
  const d = dates || 'Upcoming Weekend';
  const vList = Array.isArray(vibes) && vibes.length > 0 ? vibes : ['Adventure', 'Foodie', 'Scenic'];

  return {
    id: `trip-${Date.now()}`,
    destination: dest,
    dates: d,
    vibes: vList,
    totalStops: 4,
    activeHours: 6.5,
    region: `${dest} Central`,
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNumber: 1,
        title: 'Morning Exploration & Local Culinary Vibe',
        activities: [
          {
            id: `fallback-1-1`,
            time: '09:00 AM - 11:30 AM',
            title: `${dest} Historic Center & Heritage Walk`,
            vibe: 'Scenic & Atmospheric. Perfect for photos and architecture.',
            location: `${dest} Old Town`,
            category: 'culture'
          },
          {
            id: `fallback-1-2`,
            time: '12:00 PM - 02:00 PM',
            title: `Artisanal Food Market & Hidden Bistro`,
            vibe: 'Bustling & Delicious. Local seasonal specialties.',
            location: `${dest} Central Market`,
            category: 'food'
          }
        ]
      },
      {
        dayNumber: 2,
        title: 'Sensory Overload & Sundown Vibe',
        activities: [
          {
            id: `fallback-2-1`,
            time: '10:00 AM - 01:00 PM',
            title: 'Panoramic Viewpoint & Secret Garden',
            vibe: 'Serene & Inspiring. Breathtaking views over the skyline.',
            location: `${dest} Gardens`,
            category: 'nature'
          },
          {
            id: `fallback-2-2`,
            time: '05:30 PM - 08:00 PM',
            title: 'Rooftop Lounge & Sunset Cocktails',
            vibe: 'Chic & Relaxing. Ambient lighting and acoustic beats.',
            location: `${dest} Skyline Tower`,
            category: 'nightlife'
          }
        ]
      }
    ]
  };
}

function extractDestinationFromPrompt(prompt: string): string {
  if (prompt.toLowerCase().includes('tokyo')) return 'Tokyo, Japan';
  if (prompt.toLowerCase().includes('kyoto')) return 'Kyoto, Japan';
  if (prompt.toLowerCase().includes('paris')) return 'Paris, France';
  if (prompt.toLowerCase().includes('bali')) return 'Ubud, Bali';
  if (prompt.toLowerCase().includes('vietnam') || prompt.toLowerCase().includes('hanoi') || prompt.toLowerCase().includes('da nang')) return 'Da Nang, Vietnam';
  return 'Kyoto, Japan';
}

startServer();
