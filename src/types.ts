export interface Activity {
  id: string;
  time: string;
  title: string;
  vibe: string;
  location?: string;
  notes?: string;
  cost?: string;
  category?: 'culture' | 'food' | 'nature' | 'nightlife' | 'sightseeing' | 'relaxation';
  lat?: number;
  lng?: number;
  rating?: number;
  userRatingsTotal?: number;
  photoUrl?: string;
  googleMapsUrl?: string;
  formattedAddress?: string;
}

export interface DaySchedule {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

export interface TripDuration {
  days: number;
  nights: number;
  formatted: string; // e.g. "5 days • 4 nights"
}

export interface Itinerary {
  id: string;
  destination: string;
  startDate?: string; // ISO YYYY-MM-DD
  endDate?: string;   // ISO YYYY-MM-DD
  duration?: TripDuration;
  budgetLevel?: 'Budget' | 'Mid-range' | 'Luxury';
  travelPace?: 'Relaxed' | 'Moderate' | 'Fast-Paced';
  dates: string;      // Formatted date & duration string e.g. "Oct 12 - Oct 16, 2026 • 5 days • 4 nights"
  vibes: string[];
  totalStops: number;
  activeHours: number;
  region: string;
  days: DaySchedule[];
  createdAt: string;
  userId?: string;
  isPublic?: boolean;
}

export type InputMode = 'structured' | 'prompt';

export interface StructuredFormData {
  destination: string;
  dates: string;
  selectedVibes: string[];
  budgetLevel?: 'Budget' | 'Mid-range' | 'Luxury';
  travelPace?: 'Relaxed' | 'Moderate' | 'Fast-Paced';
}

export interface PromptFormData {
  prompt: string;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  bio: string;
  location: string;
  memberSince: string;
  preferredVibes: string[];
  travelPace: 'Relaxed' | 'Balanced' | 'Fast-Paced';
  preferredTransport: string[];
  budgetLevel: 'Budget' | 'Mid-range' | 'Luxury';
  bucketList: string[];
  calendarAutoSync: boolean;
  tripsCount?: number;
}
