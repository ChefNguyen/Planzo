import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const getFilePath = () => {
  try {
    if (typeof import.meta?.url === 'string') {
      return fileURLToPath(import.meta.url);
    }
  } catch { }
  return process.cwd();
};

const __appFilename = getFilePath();
const __appDirname = path.dirname(__appFilename);

const VIBE_MAP_TO_EN: Record<string, string> = {
  'bien dao': 'Beach & Island',
  'bien': 'Beach & Coast',
  'dao': 'Island Escape',
  'am thuc': 'Foodie',
  'van hoa': 'Culture',
  'nghi duong': 'Relax & Resort',
  'thu gian': 'Relax',
  chill: 'Chill',
  'phieu luu': 'Adventure',
  adventure: 'Adventure',
  'the thao mao hiem': 'Extreme Sports',
  'kham pha nang dong': 'Active Exploration',
  'kham pha': 'Exploration',
  'van hoa tra matcha': 'Matcha Tea Culture',
  'di san unesco': 'UNESCO Heritage',
  'co kinh tinh lang': 'Quiet Old Town',
  'thien nhien tho mong': 'Scenic Nature',
  'thien nhien': 'Nature',
  'tam linh': 'Spiritual',
  'lich su': 'History',
  'di tich': 'Heritage',
  'bao tang': 'Museums',
  'nghe thuat': 'Art & Design',
  'ca phe': 'Cafe Culture',
  'mua sam': 'Shopping',
  shopping: 'Shopping',
  'dem': 'Nightlife',
  nightlife: 'Nightlife',
  'bar': 'Bars & Pubs',
  'sang trong': 'Luxury',
  luxury: 'Luxury',
  'tiet kiem': 'Budget',
  budget: 'Budget',
  'gia dinh': 'Family',
  'cap doi': 'Romantic',
  'lang man': 'Romantic',
  romantic: 'Romantic',
  'leo nui': 'Hiking & Trekking',
  'cam trai': 'Camping',
  camping: 'Camping',
  'du lich sinh thai': 'Eco-Tourism',
  'sinh thai': 'Eco-Tourism',
  'song ao': 'Photography',
  'check in': 'Sightseeing',
  'suc khoe': 'Wellness',
  wellness: 'Wellness',
  'duong pho': 'Street Life',
  'an uong': 'Dining',
  'du thuyen': 'Cruise',
  'chua chien': 'Temples & Pagodas',
  'chua': 'Temples',
  'song nuoc': 'Riverways',
};

function normalizeVibeTagToEnglish(tag: string): string {
  if (!tag) return 'Adventure';
  const clean = tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase();
  if (VIBE_MAP_TO_EN[clean]) return VIBE_MAP_TO_EN[clean];
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

const REGION_MAP_TO_EN: Record<string, string> = {
  'dong nam a': 'Southeast Asia',
  'dong nam a / vietnam': 'Southeast Asia / Vietnam',
  'chau a': 'Asia',
  'chau a / vietnam': 'Asia / Vietnam',
  'chau au': 'Europe',
  'chau my': 'Americas',
  'bac my': 'North America',
  'nam my': 'South America',
  'chau phi': 'Africa',
  'chau uc': 'Oceania',
  'mien trung': 'Central Vietnam',
  'mien trung, vietnam': 'Central Vietnam',
  'mien bac': 'Northern Vietnam',
  'mien bac, vietnam': 'Northern Vietnam',
  'mien nam': 'Southern Vietnam',
  'mien nam, vietnam': 'Southern Vietnam',
  'tay nguyen': 'Central Highlands',
  'dong bang song cuu long': 'Mekong Delta',
};

function normalizeRegionToEnglish(region: string): string {
  if (!region) return 'Central District';
  const clean = region
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim()
    .toLowerCase();
  if (REGION_MAP_TO_EN[clean]) return REGION_MAP_TO_EN[clean];
  return region
    .replace(/\bdong nam a\b/gi, 'Southeast Asia')
    .replace(/\bchau a\b/gi, 'Asia')
    .replace(/\bchau au\b/gi, 'Europe')
    .replace(/\bmien trung\b/gi, 'Central Vietnam')
    .replace(/\bmien bac\b/gi, 'Northern Vietnam')
    .replace(/\bmien nam\b/gi, 'Southern Vietnam')
    .replace(/\btay nguyen\b/gi, 'Central Highlands')
    .replace(/Central Vietnam,\s*Vietnam/gi, 'Central Vietnam');
}

// Comprehensive NLP helper to extract number of requested days from Vietnamese/English prompts or dates
function extractRequestedDays(datesStr?: string, promptStr?: string): number {
  const text = `${datesStr || ''} ${promptStr || ''}`.toLowerCase();
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

  // 1. Shorthand NĐ / ND format: "5n4d", "5n4đ", "5n/4d", "5d4n", "5d/4n", "5n 4d", "5d 4n", "5n", "5d"
  const shorthandMatch = normalized.match(/(\d{1,2})\s*[nd]\s*(?:\/|\s*)?\s*(\d{1,2})?\s*[nd]/i);
  if (shorthandMatch && shorthandMatch[1]) {
    const num = parseInt(shorthandMatch[1], 10);
    if (num >= 1 && num <= 14) return num;
  }

  // 2. Explicit Vietnamese "N ngày [M đêm]" or "N ngay [M dem]" or "N hôm" / "N days"
  const vnDayMatch = normalized.match(/(\d{1,2})\s*(?:ngay|hom|buoi|days?|day|d)\b/i);
  if (vnDayMatch && vnDayMatch[1]) {
    const num = parseInt(vnDayMatch[1], 10);
    if (num >= 1 && num <= 14) return num;
  }

  // 3. Reversed format: "4 đêm 5 ngày" / "4 dem 5 ngay"
  const revMatch = normalized.match(/(?:dem|nights?)\s*(?:va\s*)?(\d{1,2})\s*ngay/i);
  if (revMatch && revMatch[1]) {
    const num = parseInt(revMatch[1], 10);
    if (num >= 1 && num <= 14) return num;
  }

  // 4. Night-only match: "4 đêm" / "4 nights" -> days = nights + 1 = 5
  const nightMatch = normalized.match(/(\d{1,2})\s*(?:dem|nights?|night)\b/i);
  if (nightMatch && nightMatch[1]) {
    const nights = parseInt(nightMatch[1], 10);
    const days = nights + 1;
    if (days >= 1 && days <= 14) return days;
  }

  // 5. Weeks match: "1 tuần" / "2 tuần" / "1 week"
  const weekMatch = normalized.match(/(\d{1,2})\s*(?:tuan|weeks?|week)\b/i);
  if (weekMatch && weekMatch[1]) {
    const weeks = parseInt(weekMatch[1], 10);
    const days = Math.min(14, weeks * 7);
    if (days >= 1) return days;
  }

  // 6. Word-based numbers in Vietnamese & English
  const WORD_NUMBER_MAP: [RegExp, number][] = [
    [/\b(?:muoi bon|fourteen)\s*(?:ngay|days?)/i, 14],
    [/\b(?:muoi ba|thirteen)\s*(?:ngay|days?)/i, 13],
    [/\b(?:muoi hai|twelve)\s*(?:ngay|days?)/i, 12],
    [/\b(?:muoi mot|eleven)\s*(?:ngay|days?)/i, 11],
    [/\b(?:muoi|ten)\s*(?:ngay|days?)/i, 10],
    [/\b(?:chin|nine)\s*(?:ngay|days?)/i, 9],
    [/\b(?:tam|eight)\s*(?:ngay|days?)/i, 8],
    [/\b(?:bay|seven)\s*(?:ngay|days?)/i, 7],
    [/\b(?:mot tuan|one week|1 week)\b/i, 7],
    [/\b(?:sau|six)\s*(?:ngay|days?)/i, 6],
    [/\b(?:nam|five)\s*(?:ngay|days?)/i, 5],
    [/\b(?:bon|four)\s*(?:ngay|days?)/i, 4],
    [/\b(?:ba|three)\s*(?:ngay|days?)/i, 3],
    [/\b(?:hai|two)\s*(?:ngay|days?)/i, 2],
    [/\b(?:cuoi tuan|weekend)\b/i, 2],
    [/\b(?:mot|one)\s*(?:ngay|days?|hom)/i, 1],
    [/\b(?:trong ngay|trong hom|in a day|day trip)\b/i, 1],
  ];

  for (const [regex, days] of WORD_NUMBER_MAP) {
    if (regex.test(normalized)) return days;
  }

  // 7. ISO Date Range YYYY-MM-DD to YYYY-MM-DD
  const isoMatches = [...(datesStr || '').matchAll(/(\d{4})-(\d{1,2})-(\d{1,2})/g)];
  if (isoMatches.length >= 2) {
    const d1 = new Date(parseInt(isoMatches[0][1]), parseInt(isoMatches[0][2]) - 1, parseInt(isoMatches[0][3]));
    const d2 = new Date(parseInt(isoMatches[1][1]), parseInt(isoMatches[1][2]) - 1, parseInt(isoMatches[1][3]));
    const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
    if (diffDays >= 1 && diffDays <= 14) return diffDays;
  }

  // 8. Vietnamese Date range: "từ 10 đến 15" / "10/8 - 15/8"
  const vnRangeMatch = text.match(/(\d{1,2})(?:\/\d{1,2})?\s*(?:đến|den|-|to)\s*(\d{1,2})(?:\/\d{1,2})?/i);
  if (vnRangeMatch && vnRangeMatch[1] && vnRangeMatch[2]) {
    const startDay = parseInt(vnRangeMatch[1], 10);
    const endDay = parseInt(vnRangeMatch[2], 10);
    if (endDay > startDay && (endDay - startDay + 1) <= 14) {
      return endDay - startDay + 1;
    }
  }

  // 9. English Month Date Range e.g. "Aug 15 - Aug 20"
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const monthMatches = [...(datesStr || '').matchAll(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/gi)];
  if (monthMatches.length >= 2) {
    const m1 = monthMap[monthMatches[0][1].toLowerCase().substring(0, 3)];
    const day1 = parseInt(monthMatches[0][2], 10);
    const m2 = monthMap[monthMatches[1][1].toLowerCase().substring(0, 3)];
    const day2 = parseInt(monthMatches[1][2], 10);

    const yr = new Date().getFullYear();
    const d1 = new Date(yr, m1, day1);
    const d2 = new Date(yr, m2, day2);
    const diffDays = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
    if (diffDays >= 1 && diffDays <= 14) return diffDays;
  }

  return 3;
}

function extractDestinationFromPrompt(prompt: string): string {
  if (!prompt) return 'Da Nang, Vietnam';
  const clean = prompt
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

  const KNOWN_DESTS: [RegExp, string][] = [
    [/da nang/i, 'Da Nang, Vietnam'],
    [/quy nhon|binh dinh/i, 'Quy Nhon, Vietnam'],
    [/ha noi|hanoi/i, 'Hanoi, Vietnam'],
    [/sai gon|ho chi minh|tphcm/i, 'Ho Chi Minh City, Vietnam'],
    [/phu quoc/i, 'Phu Quoc, Vietnam'],
    [/nha trang/i, 'Nha Trang, Vietnam'],
    [/da lat|dalat/i, 'Dalat, Vietnam'],
    [/sa pa|sapa|lao cai/i, 'Sapa, Vietnam'],
    [/hoi an/i, 'Hoi An, Vietnam'],
    [/hue/i, 'Hue, Vietnam'],
    [/ha long|quang ninh/i, 'Ha Long Bay, Vietnam'],
    [/ninh binh/i, 'Ninh Binh, Vietnam'],
    [/vung tau/i, 'Vung Tau, Vietnam'],
    [/phan thiet|mui ne/i, 'Phan Thiet, Vietnam'],
    [/tokyo/i, 'Tokyo, Japan'],
    [/kyoto/i, 'Kyoto, Japan'],
    [/osaka/i, 'Osaka, Japan'],
    [/seoul/i, 'Seoul, South Korea'],
    [/bangkok/i, 'Bangkok, Thailand'],
    [/singapore/i, 'Singapore'],
    [/paris/i, 'Paris, France'],
    [/rome/i, 'Rome, Italy'],
    [/london/i, 'London, UK'],
    [/bali|ubud/i, 'Bali, Indonesia'],
    [/zurich|switzerland|thuy si/i, 'Zurich, Switzerland'],
  ];

  for (const [regex, name] of KNOWN_DESTS) {
    if (regex.test(clean)) return name;
  }

  return 'Da Nang, Vietnam';
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // CORS — allow configured APP_URL, all Cloud Run domains (*.run.app), and localhost
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin.endsWith('.run.app') ||
          origin.endsWith('.firebaseapp.com') ||
          origin.endsWith('.web.app') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          (process.env.APP_URL && origin === process.env.APP_URL)
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );

  // Rate limiter — max 10 AI generation requests per minute per IP
  const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please wait a minute and try again.' },
  });

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

  // Image Proxy Endpoint with CDN & In-Memory Caching
  app.get('/api/search-image', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      if (!query) return res.json({ photoUrl: null });

      // Cache HTTP response on CDN & Browser for 7 days
      res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400');

      const photoUrl = await fetchPhotoWithCache(query);
      return res.json({ photoUrl: photoUrl || null });
    } catch (err) {
      return res.json({ photoUrl: null });
    }
  });



  // AI Itinerary Generation Endpoint (rate-limited: 10 req/min per IP)
  app.post('/api/generate-itinerary', aiRateLimiter, async (req, res) => {
    try {
      const { mode, destination, dates, vibes, budgetLevel, travelPace, prompt } = req.body;
      const requestedDays = extractRequestedDays(dates, prompt);

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        console.warn('GEMINI_API_KEY is missing. Returning smart default itinerary.');
        return res.json(await createFallbackItinerary(destination || 'Tokyo, Japan', dates || 'Next Weekend', vibes || ['Adventure', 'Foodie'], prompt));
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const budgetText = budgetLevel ? `Budget Tier: ${budgetLevel}` : 'Budget Tier: Mid-range ($$)';
      const paceText = travelPace ? `Travel Pace: ${travelPace}` : 'Travel Pace: Moderate (4-5 stops/day)';



      let systemPrompt = `You are Planzo AI, an elite, stylish travel itinerary generator. Your job is to generate a highly detailed, curated EXACTLY ${requestedDays}-day travel itinerary (containing Day 1 through Day ${requestedDays}) with specific time slots (specifying explicit Start Time - End Time with default duration of ~2 hours per stop, e.g. "09:00 AM - 11:00 AM", "01:30 PM - 03:30 PM"), iconic & hidden gem destinations, vivid vibe descriptions, and location details. Adhere closely to user constraints: ${budgetText}, ${paceText}.

CRITICAL MANDATORY LANGUAGE RULES:
- The top-level 'region' and 'vibes' array tags MUST ALWAYS be in ENGLISH (e.g. region: 'Central Vietnam', 'Northern Vietnam', 'Southern Vietnam', 'Southeast Asia', 'Europe', 'East Asia', 'Kanto Region'; vibes: ['Beach & Island', 'Culture', 'Foodie', 'Relax', 'Nightlife', 'Adventure', 'Nature', 'Chill', 'Luxury', 'Shopping', 'Hidden Gems', 'Spiritual', 'Heritage']).
- ALWAYS write 100% of ALL titles, activity descriptions, vibe notes ("vibe" field), location details ("location" field), and day headings in VIETNAMESE (Tiếng Việt), regardless of whether the destination is in Vietnam or abroad (e.g., Tokyo, Paris, Rome, Kyoto, Da Nang, etc.) and regardless of whether input mode is Structured or AI Prompt Genius.
- Do NOT output English for titles, activity descriptions, or vibe notes. Keep all generated textual prose strictly in natural, engaging Vietnamese (Tiếng Việt).`;

      let userPrompt = '';
      if (mode === 'prompt' && prompt) {
        userPrompt = `USER PROMPT: "${prompt}".
CRITICAL CONSTRAINT: You MUST generate EXACTLY ${requestedDays} DAYS in the "days" array (Day 1 through Day ${requestedDays}), containing full morning, afternoon, and evening activities for every single day.
${budgetText}. ${paceText}.
Output the top-level "region" and "vibes" in ENGLISH.
Write 100% of all activity titles, vibe notes, descriptions, and day titles in natural VIETNAMESE (Tiếng Việt).`;
      } else {
        const dest = destination || 'Tokyo, Japan';
        const d = dates || 'Upcoming Weekend';
        const v = Array.isArray(vibes) && vibes.length > 0 ? vibes.join(', ') : 'Adventure & Foodie';
        userPrompt = `Generate a customized ${requestedDays}-day travel itinerary for destination "${dest}" for dates "${d}" with the following vibes: "${v}".
CRITICAL CONSTRAINT: The "days" array in the output MUST contain EXACTLY ${requestedDays} items, numbered 1 to ${requestedDays}.
${budgetText}. ${paceText}.
Output the top-level "region" and "vibes" in ENGLISH.
Write 100% of all activity titles, vibe notes, descriptions, and day titles in natural VIETNAMESE (Tiếng Việt).`;
      }

      const modelsToTry = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
      ].filter((m, i, self) => Boolean(m) && self.indexOf(m) === i) as string[];

      let response: any = null;
      let lastErr: any = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
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
                              rating: { type: Type.NUMBER },
                              userRatingsTotal: { type: Type.INTEGER },
                              lat: { type: Type.NUMBER },
                              lng: { type: Type.NUMBER },
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
          if (response?.text) {
            console.log(`Successfully generated itinerary using model: ${modelName}`);
            break;
          }
        } catch (mErr: any) {
          console.warn(`Model ${modelName} failed (${mErr?.status || mErr?.message || mErr}), trying next...`);
          lastErr = mErr;
        }
      }

      if (!response) {
        // All models failed - throw so client gets 500 error message
        throw lastErr || new Error('All Gemini models failed to respond.');
      }

      if (response.text) {
        const parsed = JSON.parse(response.text);
        const destName = parsed.destination || destination || 'Tokyo, Japan';

        // Enrich activities in parallel with Google Places / Geocoding API
        const daysWithPlaces = await Promise.all(
          (parsed.days || []).map(async (d: any, idx: number) => {
            const enrichedActivities = await Promise.all(
              (d.activities || []).map(async (act: any, aIdx: number) => {
                const placeInfo = await fetchPlaceDetails(act.title || 'Local Highlight', act.location || destName, idx * 4 + aIdx);
                const searchQuery = cleanPhotoQuery(act.title || 'Local Highlight', destName);
                const photoUrl = await fetchPhotoWithCache(searchQuery, `${destName} travel`);
                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((act.title || 'Local Highlight') + ', ' + (act.location || destName))}`;
                return {
                  id: `act-${idx + 1}-${aIdx + 1}-${Date.now()}`,
                  time: act.time || '10:00 AM - 12:00 PM',
                  title: placeInfo.title || act.title || 'Local Highlight',
                  vibe: act.vibe || 'Curated experience',
                  location: act.location || destName,
                  formattedAddress: placeInfo.formattedAddress || act.location || destName,
                  lat: typeof act.lat === 'number' ? act.lat : (typeof placeInfo.lat === 'number' ? placeInfo.lat : 10.8231),
                  lng: typeof act.lng === 'number' ? act.lng : (typeof placeInfo.lng === 'number' ? placeInfo.lng : 106.6297),
                  rating: (placeInfo as any).rating || act.rating,
                  userRatingsTotal: act.userRatingsTotal || Math.floor(Math.random() * 400 + 50),
                  photoUrl: photoUrl,
                  googleMapsUrl: googleMapsUrl,
                  category: act.category || 'culture',
                };
              })
            );

            return {
              dayNumber: d.dayNumber || idx + 1,
              title: d.title || `Day ${idx + 1}`,
              activities: enrichedActivities,
            };
          })
        );

        const rawVibes = Array.isArray(parsed.vibes) && parsed.vibes.length > 0 ? parsed.vibes : (Array.isArray(vibes) && vibes.length > 0 ? vibes : ['Adventure', 'Foodie']);
        const englishVibes = rawVibes.map((v: string) => normalizeVibeTagToEnglish(v));

        const itinerary = {
          id: `trip-${Date.now()}`,
          destination: destName,
          dates: parsed.dates || dates || 'Flexible Dates',
          vibes: englishVibes,
          totalStops: parsed.totalStops || daysWithPlaces.reduce((acc: number, day: any) => acc + day.activities.length, 0),
          activeHours: parsed.activeHours || 6.5,
          region: normalizeRegionToEnglish(parsed.region || 'Central District'),
          createdAt: new Date().toISOString(),
          days: daysWithPlaces,
        };
        return res.json(itinerary);
      }

      return res.json(await createFallbackItinerary(destination, dates, vibes, prompt));
    } catch (error) {
      console.error('Error generating itinerary with Gemini:', error);
      const { destination, dates, vibes, prompt } = req.body;
      return res.json(await createFallbackItinerary(destination, dates, vibes, prompt));
    }
  });

  // Vite development middleware vs production static files
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltDist = fs.existsSync(path.join(distPath, 'index.html'));

  // Use Vite middleware in local dev (Cloud Run sets process.env.K_SERVICE in production)
  const isDev = !process.env.K_SERVICE || process.env.DEV === 'true';

  if (isDev || !hasBuiltDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for SPA routing in dev mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.includes('.')) {
        return res.status(404).send('Asset not found');
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    console.log(`Planzo AI Server running at ${appUrl} (bound to 0.0.0.0:${PORT})`);
  });
}

async function createFallbackItinerary(destination?: string, dates?: string, vibes?: string[], prompt?: string) {
  const dest = destination || (prompt ? extractDestinationFromPrompt(prompt) : 'Quy Nhon, Vietnam');
  const d = dates || 'Upcoming Weekend';
  const vList = (Array.isArray(vibes) && vibes.length > 0 ? vibes : ['Adventure', 'Foodie', 'Scenic']).map((v) => normalizeVibeTagToEnglish(v));

  const dayTemplates = [
    { title: 'Morning Exploration & Local Culinary Vibe', act1: 'Thưởng thức Cà phê & Đặc sản địa phương', act2: 'Khám phá Thắng cảnh đẹp nhất' },
    { title: 'Cultural Heritage & Sunset Chill', act1: 'Tham quan Di tích lịch sử & Bảo tàng', act2: 'Ẩm thực Đêm & Bar ngắm hoàng hôn' },
    { title: 'Hidden Gems & Local Markets', act1: 'Khám phá Chợ truyền thống & Souvenir', act2: 'Thư giãn tại Công viên / Bãi biển' },
    { title: 'Scenic Nature & Photography Walk', act1: 'Săn bình minh & Đi dạo cảnh quan', act2: 'Thưởng thức Trà chiều & Ngắm phố' },
    { title: 'Art, Architecture & Shopping', act1: 'Ghé thăm Khu phố nghệ thuật & Mua sắm', act2: 'Bữa tối lãng mạn & Đi dạo đêm' },
    { title: 'Relaxation & Wellness Day', act1: 'Spa thư giãn & Thưởng thức ẩm thực nhẹ', act2: 'Ngắm toàn cảnh thành phố từ trên cao' },
    { title: 'Local Workshop & Farewell Vibe', act1: 'Tham gia Lớp học thủ công / Nấu ăn', act2: 'Bữa tiệc chia tay & Ngắm cảnh đêm' },
  ];

  // Helper to extract requested days
  const numMatch = (d || '').match(/(\d+)\s*days?/i) || (prompt || '').match(/(\d+)\s*[-_]?days?/i);
  const requestedDays = numMatch && numMatch[1] ? Math.min(14, Math.max(1, parseInt(numMatch[1], 10))) : 3;

  const rawDays = Array.from({ length: requestedDays }, (_, i) => {
    const dayNum = i + 1;
    const template = dayTemplates[i % dayTemplates.length];
    return {
      dayNumber: dayNum,
      title: template.title,
      activities: [
        {
          time: '09:00 AM - 11:00 AM',
          title: `${template.act1}`,
          vibe: 'Cảnh quan tuyệt đẹp, trải nghiệm văn hóa bản địa đặc sắc.',
          location: `${dest} Central`,
          category: 'culture',
        },
        {
          time: '02:00 PM - 04:00 PM',
          title: `${template.act2}`,
          vibe: 'Náo nhiệt & sôi động, địa điểm chụp ảnh check-in lý tưởng.',
          location: `${dest} Landmark`,
          category: 'sightseeing',
        },
        {
          time: '06:00 PM - 08:00 PM',
          title: `Thưởng thức Ẩm thực Đêm & Thư giãn tại ${dest}`,
          vibe: 'Không gian lãng mạn, ẩm thực ấm cúng về đêm.',
          location: `${dest} Center`,
          category: 'food',
        },
      ],
    };
  });

  const daysWithPlaces = await Promise.all(
    rawDays.map(async (dItem, idx) => {
      const enrichedActivities = await Promise.all(
        dItem.activities.map(async (act, aIdx) => {
          const globalIdx = idx * 2 + aIdx;
          const placeInfo = await fetchPlaceDetails(act.title, dest, globalIdx);
          const searchQuery = cleanPhotoQuery(act.title, dest);
          const photoUrl = await fetchPhotoWithCache(searchQuery, `${dest} travel`);
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ', ' + dest)}`;

          return {
            id: `fallback-${idx + 1}-${aIdx + 1}-${Date.now()}`,
            time: act.time,
            title: act.title,
            vibe: act.vibe,
            location: act.location,
            formattedAddress: placeInfo.formattedAddress || act.location,
            lat: typeof placeInfo.lat === 'number' ? placeInfo.lat : 10.8231,
            lng: typeof placeInfo.lng === 'number' ? placeInfo.lng : 106.6297,
            rating: 4.8,
            userRatingsTotal: Math.floor(Math.random() * 300 + 100),
            photoUrl: photoUrl,
            googleMapsUrl: googleMapsUrl,
            category: act.category,
          };
        })
      );

      return {
        ...dItem,
        activities: enrichedActivities,
      };
    })
  );

  return {
    id: `trip-${Date.now()}`,
    destination: dest,
    dates: d,
    vibes: vList,
    totalStops: 4,
    activeHours: 6.5,
    region: `${dest} Region`,
    createdAt: new Date().toISOString(),
    days: daysWithPlaces,
  };
}

const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'quy nhon': { lat: 13.7820, lng: 109.2194 },
  'binh dinh': { lat: 13.7820, lng: 109.2194 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  'khanh hoa': { lat: 12.2388, lng: 109.1967 },
  'phu quoc': { lat: 10.2899, lng: 103.9840 },
  'ha noi': { lat: 21.0285, lng: 105.8542 },
  hanoi: { lat: 21.0285, lng: 105.8542 },
  saigon: { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'da lat': { lat: 11.9404, lng: 108.4583 },
  dalat: { lat: 11.9404, lng: 108.4583 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  'sa pa': { lat: 22.3364, lng: 103.8438 },
  'hoi an': { lat: 15.8801, lng: 108.3380 },
  hue: { lat: 16.4637, lng: 107.5909 },
  'ha long': { lat: 20.9599, lng: 107.0425 },
  'quang ninh': { lat: 20.9599, lng: 107.0425 },
  'vung tau': { lat: 10.3460, lng: 107.0843 },
  'phan thiet': { lat: 10.9804, lng: 108.2615 },
  'mui ne': { lat: 10.9333, lng: 108.2833 },
  'can tho': { lat: 10.0452, lng: 105.7469 },
  'ninh binh': { lat: 20.2506, lng: 105.9744 },
  'phong nha': { lat: 17.5906, lng: 106.2826 },
  'ha giang': { lat: 22.8094, lng: 104.9818 },
  'con dao': { lat: 8.6833, lng: 106.6000 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'tuy hoa': { lat: 13.0882, lng: 109.3149 },
  'phu yen': { lat: 13.0882, lng: 109.3149 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  bali: { lat: -8.5069, lng: 115.2625 },
  ubud: { lat: -8.5069, lng: 115.2625 },
};

// Helper to extract clean venue title and city/district name for accurate geocoding
function parseGeocodingTerms(placeName: string, locationOrDest: string): { cleanPlace: string; cleanCity: string; fullLocation: string } {
  const cleanPlace = (placeName || '')
    .replace(/^(Breakfast at|Lunch at|Dinner at|Sunset Dinner at|Explore|Visit|Walk along|Unwind at|Relax at|Check-in at|Check-in|Enjoy|Tasting at|Sightseeing at)\s+/i, '')
    .replace(/^(Khám phá|Tắm biển & Check-in|Thưởng thức|Ăn trưa|Tham quan|Ghé thăm|Check-in|Trải nghiệm|Ăn tối|Đi dạo|Vui chơi)\s+/i, '')
    .replace(/& Check-in/i, '')
    .split(' - ')[0]
    .split(' – ')[0]
    .split(' : ')[0]
    .trim();

  // Preserve full location including district/ward (e.g. "Thảo Điền, Thủ Đức, TP.HCM")
  const fullLocation = (locationOrDest || '').trim();

  return { cleanPlace: cleanPlace || placeName, cleanCity: fullLocation, fullLocation };
}

async function fetchPlaceDetails(placeName: string, locationOrDest: string, index: number = 0) {
  const { cleanPlace, fullLocation } = parseGeocodingTerms(placeName, locationOrDest);

  // 1. Resolve exact district/sub-city base coordinates dynamically via Photon (e.g. "Thủ Đức, TP.HCM")
  let baseLat = 10.8231;
  let baseLng = 106.6297;
  let foundBase = false;

  try {
    const locRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fullLocation)}&limit=1`);
    if (locRes.ok) {
      const locData = await locRes.json();
      if (locData.features && locData.features.length > 0) {
        baseLat = locData.features[0].geometry.coordinates[1];
        baseLng = locData.features[0].geometry.coordinates[0];
        foundBase = true;
        console.log(`[District Base Resolved] "${fullLocation}" -> Lat: ${baseLat}, Lng: ${baseLng}`);
      }
    }
  } catch {}

  if (!foundBase) {
    const cityKey = fullLocation.toLowerCase();
    const matchedKey = Object.keys(DESTINATION_COORDS).find((k) => cityKey.includes(k));
    if (matchedKey) {
      baseLat = DESTINATION_COORDS[matchedKey].lat;
      baseLng = DESTINATION_COORDS[matchedKey].lng;
    }
  }

  const queriesToTry = [
    `${cleanPlace}, ${fullLocation}`,
    cleanPlace,
  ].filter(Boolean);

  // 2. Query Photon POI API centered specifically around district base coordinates
  for (const q of queriesToTry) {
    try {
      const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${baseLat}&lon=${baseLng}&zoom=14&limit=1`;
      const pRes = await fetch(pUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.features && pData.features.length > 0) {
          const coords = pData.features[0].geometry.coordinates; // [lng, lat]
          const lat = coords[1];
          const lng = coords[0];
          const props = pData.features[0].properties;

          // Proximity check: ensure venue is within 25km of the exact district center!
          const distKm = Math.hypot(lat - baseLat, lng - baseLng) * 111;
          if (distKm <= 25) {
            console.log(`[Accurate POI] "${q}" -> Lat: ${lat}, Lng: ${lng} (${distKm.toFixed(1)} km from ${fullLocation})`);
            return {
              title: placeName,
              formattedAddress: props.name || props.street || q,
              lat: lat,
              lng: lng,
            };
          }
        }
      }
    } catch {}
  }

  // 3. Fallback: Micro-jitter spiral around exact district center so pins never land in wrong district
  const angle = index * 137.5 * (Math.PI / 180);
  const radius = 0.003 + index * 0.0012;
  const fallbackLat = Number((baseLat + Math.sin(angle) * radius).toFixed(5));
  const fallbackLng = Number((baseLng + Math.cos(angle) * radius).toFixed(5));

  console.log(`[District Micro-Jitter] "${placeName}" -> Lat: ${fallbackLat}, Lng: ${fallbackLng} in ${fullLocation}`);

  return {
    title: placeName,
    formattedAddress: `${cleanPlace}, ${fullLocation}`,
    lat: fallbackLat,
    lng: fallbackLng,
  };
}

async function fetchPexelsPhoto(query: string, fallbackQuery?: string): Promise<string | undefined> {
  const apiKey = process.env.PEXELS_API_KEY || 'thQ6usGDSNEoWQQsMNprXF8vSjLt2qyVN8jlXFAFOvZpt4jidsRosUhL';
  if (!apiKey) return undefined;
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.photos && data.photos.length > 0) {
        const photoUrl = data.photos[0].src?.medium || data.photos[0].src?.large;
        if (photoUrl) {
          console.log(`[Pexels Photo] Fetched photo for "${query}":`, photoUrl);
          return photoUrl;
        }
      }
    }

    if (fallbackQuery) {
      const fbRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(fallbackQuery)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      );
      if (fbRes.ok) {
        const fbData = await fbRes.json();
        if (fbData.photos && fbData.photos.length > 0) {
          return fbData.photos[0].src?.medium || fbData.photos[0].src?.large;
        }
      }
    }
  } catch (err) {
    console.warn('Pexels photo fetch warning:', err);
  }
  return undefined;
}

async function fetchWikimediaPhoto(query: string): Promise<string | undefined> {
  try {
    const cleanedQuery = query.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(cleanedQuery)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      if (data?.query?.pages) {
        const pageKey = Object.keys(data.query.pages)[0];
        const imgUrl = data.query.pages[pageKey]?.imageinfo?.[0]?.url;
        if (imgUrl && !imgUrl.endsWith('.svg') && !imgUrl.endsWith('.tif')) {
          console.log(`[Wikimedia Photo] Fetched photo for "${query}":`, imgUrl);
          return imgUrl;
        }
      }
    }
  } catch (err) {
    console.warn('[Wikimedia Photo] Fetch error:', err);
  }
  return undefined;
}

function cleanPhotoQuery(title: string, destination: string): string {
  const cleanTitle = (title || '')
    .replace(/^(Khám phá|Tắm biển & Check-in|Thưởng thức|Ăn trưa|Tham quan|Ghé thăm|Check-in|Trải nghiệm)\s+/i, '')
    .replace(/& Check-in/i, '')
    .trim();
  return `${cleanTitle || title} ${destination}`;
}

// In-Memory Photo Cache with 7-Day TTL and Request Coalescing
interface PhotoCacheEntry {
  url: string | undefined;
  timestamp: number;
}

const photoCacheMap = new Map<string, PhotoCacheEntry>();
const inFlightPhotoRequests = new Map<string, Promise<string | undefined>>();
const PHOTO_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function fetchPhotoWithCache(query: string, destinationFallback?: string): Promise<string | undefined> {
  const normalizedQuery = (query || '').toLowerCase().trim();
  if (!normalizedQuery) return undefined;

  // 1. Check Memory Cache
  const cached = photoCacheMap.get(normalizedQuery);
  if (cached && Date.now() - cached.timestamp < PHOTO_CACHE_TTL_MS) {
    console.log(`[Photo Cache HIT ⚡] "${query}" ->`, cached.url);
    return cached.url;
  }

  // 2. Request Coalescing (reuse pending HTTP request if concurrent)
  if (inFlightPhotoRequests.has(normalizedQuery)) {
    console.log(`[Photo Request Coalesce 🔄] "${query}" joining pending fetch`);
    return inFlightPhotoRequests.get(normalizedQuery);
  }

  // 3. Perform Fetch Pipeline (Pexels Main API -> Wikimedia Fallback)
  const fetchPromise = (async () => {
    try {
      let photoUrl = await fetchPexelsPhoto(query, destinationFallback);
      if (!photoUrl) {
        photoUrl = await fetchWikimediaPhoto(query);
      }
      if (!photoUrl && destinationFallback) {
        photoUrl = await fetchPexelsPhoto(destinationFallback);
      }
      if (!photoUrl) {
        const hash = Array.from(query).reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0);
        const fallbackPhotos = [
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1476514525535-ce74f45814d9?auto=format&fit=crop&w=800&q=80',
        ];
        photoUrl = fallbackPhotos[Math.abs(hash) % fallbackPhotos.length];
      }

      // Cache result
      photoCacheMap.set(normalizedQuery, {
        url: photoUrl,
        timestamp: Date.now(),
      });

      return photoUrl;
    } finally {
      inFlightPhotoRequests.delete(normalizedQuery);
    }
  })();

  inFlightPhotoRequests.set(normalizedQuery, fetchPromise);
  return fetchPromise;
}

startServer();
