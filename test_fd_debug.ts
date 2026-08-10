import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'quy nhon': { lat: 13.7820, lng: 109.2194 },
  'saigon': { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
};

function parseGeocodingTerms(placeName: string, locationOrDest: string): { cleanPlace: string; cleanCity: string; fullLocation: string } {
  const cleanPlace = (placeName || '')
    .replace(/^(Breakfast at|Lunch at|Dinner at|Sunset Dinner at|Explore|Visit|Walk along|Unwind at|Relax at|Check-in at|Check-in|Enjoy|Tasting at|Sightseeing at)\s+/i, '')
    .replace(/^(Khám phá|Tắm biển & Check-in|Thưởng thức|Ăn trưa|Tham quan|Ghé thăm|Check-in|Trải nghiệm|Ăn tối|Đi dạo|Vui chơi)\s+/i, '')
    .split(' - ')[0]
    .trim();

  const fullLocation = (locationOrDest || '').trim();

  return { cleanPlace: cleanPlace || placeName, cleanCity: fullLocation, fullLocation };
}

async function fetchPlaceDetails(placeName: string, locationOrDest: string, index: number = 0) {
  const { cleanPlace, fullLocation } = parseGeocodingTerms(placeName, locationOrDest);
  console.log('cleanPlace:', cleanPlace, '| fullLocation:', fullLocation);

  let baseLat = 10.8231;
  let baseLng = 106.6297;
  let foundBase = false;

  try {
    const locRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fullLocation)}&limit=1`);
    console.log('locRes status:', locRes.status);
    if (locRes.ok) {
      const locData = await locRes.json();
      console.log('locData features count:', locData.features?.length);
      if (locData.features && locData.features.length > 0) {
        baseLat = locData.features[0].geometry.coordinates[1];
        baseLng = locData.features[0].geometry.coordinates[0];
        foundBase = true;
        console.log(`[District Base Resolved] "${fullLocation}" -> Lat: ${baseLat}, Lng: ${baseLng}`);
      }
    }
  } catch (e) {
    console.error('locRes error:', e);
  }

  const queriesToTry = [
    `${cleanPlace}, ${fullLocation}`,
    cleanPlace,
  ].filter(Boolean);

  for (const q of queriesToTry) {
    try {
      const pUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lat=${baseLat}&lon=${baseLng}&zoom=14&limit=1`;
      const pRes = await fetch(pUrl);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.features && pData.features.length > 0) {
          const coords = pData.features[0].geometry.coordinates;
          const lat = coords[1];
          const lng = coords[0];
          const props = pData.features[0].properties;

          const distKm = Math.hypot(lat - baseLat, lng - baseLng) * 111;
          console.log(`Query "${q}" dist: ${distKm.toFixed(1)} km`);
          if (distKm <= 25) {
            return {
              title: placeName,
              formattedAddress: props.name || props.street || q,
              lat: lat,
              lng: lng,
            };
          }
        }
      }
    } catch (e) {
      console.error('pRes error:', e);
    }
  }

  const angle = index * 137.5 * (Math.PI / 180);
  const radius = 0.003 + index * 0.0012;
  const fallbackLat = Number((baseLat + Math.sin(angle) * radius).toFixed(5));
  const fallbackLng = Number((baseLng + Math.cos(angle) * radius).toFixed(5));

  return {
    title: placeName,
    formattedAddress: `${cleanPlace}, ${fullLocation}`,
    lat: fallbackLat,
    lng: fallbackLng,
  };
}

async function test() {
  const res = await fetchPlaceDetails('Morning Brew at Dolphy Cafe', 'Thảo Điền, Thủ Đức, TP.HCM', 0);
  console.log('FINAL RESULT:', res);
}

test();
