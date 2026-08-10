import { Itinerary } from '../types';

export const KYOTO_DEFAULT_ITINERARY: Itinerary = {
  id: 'kyoto-escape-1',
  destination: 'Kyoto, Japan',
  startDate: '2026-10-12',
  endDate: '2026-10-16',
  duration: {
    days: 5,
    nights: 4,
    formatted: '5 days • 4 nights'
  },
  dates: 'Oct 12 - Oct 16, 2026 (5 days • 4 nights)',
  vibes: ['Cultural Immersion', 'Spiritual', 'Foodie', 'Scenic'],
  totalStops: 3,
  activeHours: 5.5,
  region: 'Kyoto Central Area',
  createdAt: new Date().toISOString(),
  days: [
    {
      dayNumber: 1,
      title: 'Cultural Immersion',
      activities: [
        {
          id: 'act-1',
          time: '09:00 AM - 11:30 AM',
          title: 'Kiyomizu-dera Temple',
          vibe: 'Spiritual & Scenic. Best for morning photos.',
          location: 'Otowa-san, Higashiyama-ku, Kyoto',
          category: 'culture'
        },
        {
          id: 'act-2',
          time: '12:00 PM - 01:30 PM',
          title: 'Nishiki Market Lunch',
          vibe: 'Bustling & Delicious. Try the soy donuts!',
          location: 'Nakagyo Ward, Kyoto',
          category: 'food'
        }
      ]
    },
    {
      dayNumber: 2,
      title: 'Iconic Landmarks',
      activities: [
        {
          id: 'act-3',
          time: '09:00 AM - 11:30 AM',
          title: 'Fushimi Inari Shrine',
          vibe: 'Iconic & Energetic. Hike through the torii gates.',
          location: 'Fushimi Ward, Kyoto',
          category: 'sightseeing'
        },
        {
          id: 'act-4',
          time: '02:00 PM - 04:30 PM',
          title: 'Arashiyama Bamboo Grove & Tenryu-ji',
          vibe: 'Serene & Nature filled. Quiet path through towering bamboo.',
          location: 'Ukyo Ward, Kyoto',
          category: 'nature'
        }
      ]
    },
    {
      dayNumber: 3,
      title: 'Traditional Aesthetics & Tea Culture',
      activities: [
        {
          id: 'act-5',
          time: '10:00 AM - 11:30 AM',
          title: 'Gion Matcha & Tea Ceremony',
          vibe: 'Refined & Peaceful. Traditional Uji matcha tasting.',
          location: 'Gion District, Kyoto',
          category: 'relaxation'
        }
      ]
    }
  ]
};

export const INITIAL_VIBES = [
  'Adventure',
  'Foodie',
  'Relax',
  'Nightlife',
  'Budget',
  'Art & Design',
  'Hidden Gems',
  'Luxury'
];

export const SAMPLE_COMMUNITY_TRIPS: Itinerary[] = [
  KYOTO_DEFAULT_ITINERARY,
  {
    id: 'tokyo-neon-1',
    destination: 'Tokyo, Japan',
    startDate: '2026-11-02',
    endDate: '2026-11-07',
    duration: {
      days: 6,
      nights: 5,
      formatted: '6 days • 5 nights'
    },
    dates: 'Nov 2 - Nov 7, 2026 (6 days • 5 nights)',
    vibes: ['Nightlife', 'Foodie', 'Cyberpunk Aesthetics'],
    totalStops: 8,
    activeHours: 14.0,
    region: 'Shinjuku & Shibuya',
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNumber: 1,
        title: 'Neon Nights & Alley Dining',
        activities: [
          {
            id: 'tok-1',
            time: '06:00 PM - 08:30 PM',
            title: 'Omoide Yokocho Yakitori',
            vibe: 'Atmospheric & Nostalgic alleyway dining',
            location: 'Shinjuku'
          },
          {
            id: 'tok-2',
            time: '09:00 PM - 11:30 PM',
            title: 'Golden Gai Bar Hopping',
            vibe: 'Intimate, retro micro-bars',
            location: 'Shinjuku'
          }
        ]
      }
    ]
  },
  {
    id: 'bali-relax-1',
    destination: 'Ubud, Bali',
    dates: 'Dec 1 - Dec 6, 2026',
    vibes: ['Relax', 'Tropical', 'Wellness'],
    totalStops: 5,
    activeHours: 8.5,
    region: 'Ubud Rainforest',
    createdAt: new Date().toISOString(),
    days: [
      {
        dayNumber: 1,
        title: 'Jungle Haven & Sound Healing',
        activities: [
          {
            id: 'bali-1',
            time: '08:00 AM - 10:30 AM',
            title: 'Pyramids of Chi Sound Bath',
            vibe: 'Deep Relaxation & Vibrational Healing',
            location: 'Ubud'
          }
        ]
      }
    ]
  }
];
