import { Activity } from '../types';

// Curated high-res travel photos for reliable fallback
const FALLBACK_TRAVEL_PHOTOS = [
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-ce74f45814d9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80',
];

export const getPlacePhoto = (act: Partial<Activity>, destination: string): string => {
  if (act.photoUrl && act.photoUrl.trim() !== '') {
    return act.photoUrl;
  }
  const keyStr = (act.title || '') + (destination || '');
  let hash = 0;
  for (let i = 0; i < keyStr.length; i++) {
    hash = (hash << 5) - hash + keyStr.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % FALLBACK_TRAVEL_PHOTOS.length;
  return FALLBACK_TRAVEL_PHOTOS[idx];
};

const DESTINATION_PHOTO_MAP: Record<string, string> = {
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  kansai: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80',
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
  kanto: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  'north america': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  uji: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?auto=format&fit=crop&w=800&q=80',
  'thu duc': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80',
  'southern vietnam': 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80',
  'phù cát': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'miền trung': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
  nara: 'https://images.unsplash.com/photo-1505069190533-da1c9af13346?auto=format&fit=crop&w=800&q=80',
  'quy nhơn': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  'da nang': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
};

export const getTripCoverPhoto = (destination: string): string => {
  if (!destination) return FALLBACK_TRAVEL_PHOTOS[0];
  const destLower = destination.toLowerCase();

  for (const [key, url] of Object.entries(DESTINATION_PHOTO_MAP)) {
    if (destLower.includes(key)) {
      return url;
    }
  }

  let hash = 0;
  for (let i = 0; i < destination.length; i++) {
    hash = (hash << 5) - hash + destination.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % FALLBACK_TRAVEL_PHOTOS.length;
  return FALLBACK_TRAVEL_PHOTOS[idx];
};
