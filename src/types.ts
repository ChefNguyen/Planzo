export interface Activity {
  id: string;
  time: string;
  title: string;
  vibe: string;
  location?: string;
  notes?: string;
  cost?: string;
  category?: 'culture' | 'food' | 'nature' | 'nightlife' | 'sightseeing' | 'relaxation';
}

export interface DaySchedule {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

export interface Itinerary {
  id: string;
  destination: string;
  dates: string;
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
