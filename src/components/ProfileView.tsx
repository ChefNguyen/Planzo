import React, { useState, useEffect } from 'react';
import { UserProfile, Itinerary } from '../types';
import { User } from '../lib/firebase';
import { CustomSearchImage } from './CustomSearchImage';
import {
  User as UserIcon,
  Calendar,
  Compass,
  Check,
  Edit2,
  Bell,
  RefreshCw,
  ArrowRight,
  Sliders,
  Sparkles,
  CreditCard,
  Pencil,
  Plus,
  MapPin,
  Clock,
  Ticket,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User | null;
  savedTrips: Itinerary[];
  isCalendarConnected: boolean;
  onToggleCalendar: () => void;
  onSelectTab: (tab: string) => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

const DEFAULT_PREFERENCES = [
  { id: 'adventure', label: 'Adventure', active: true },
  { id: 'foodie', label: 'Foodie', active: true },
  { id: 'relax', label: 'Relax', active: false },
  { id: 'cultural', label: 'Cultural', active: true },
  { id: 'nightlife', label: 'Nightlife', active: false },
  { id: 'budget', label: 'Budget', active: false },
  { id: 'photography', label: 'Photography', active: true },
  { id: 'hidden-gems', label: 'Hidden Gems', active: true },
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  savedTrips,
  isCalendarConnected,
  onToggleCalendar,
  onSelectTab,
  onSignOut,
  onSignIn,
}) => {
  // Real User Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedBio = localStorage.getItem('planzo_user_bio');
    return {
      displayName: currentUser?.displayName || 'Travel Explorer',
      email: currentUser?.email || 'guest@planzo.ai',
      photoURL: currentUser?.photoURL || '',
      bio: savedBio || 'Exploring the world with Planzo AI-curated vibe itineraries.',
      location: 'Global Traveler',
      memberSince: '2026',
      preferredVibes: ['Adventure', 'Cultural', 'Foodie'],
      travelPace: 'Moderate',
      preferredTransport: ['Walking', 'Public Transit'],
      budgetLevel: 'Mid-range',
      bucketList: [],
      calendarAutoSync: true,
    };
  });

  // Sync profile when currentUser changes
  useEffect(() => {
    setProfile((prev) => ({
      ...prev,
      displayName: currentUser?.displayName || 'Travel Explorer',
      email: currentUser?.email || 'guest@planzo.ai',
      photoURL: currentUser?.photoURL || prev.photoURL,
    }));
  }, [currentUser]);

  // Notifications toggle state persisted in localStorage
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('planzo_notifications');
    return saved
      ? JSON.parse(saved)
      : { tripUpdates: true, flightAlerts: true, vibeCheckIns: false };
  });

  useEffect(() => {
    localStorage.setItem('planzo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Expensify integration state persisted in localStorage
  const [isExpensifyConnected, setIsExpensifyConnected] = useState(() => {
    return localStorage.getItem('planzo_expensify_connected') === 'true';
  });

  const toggleExpensify = () => {
    const nextState = !isExpensifyConnected;
    setIsExpensifyConnected(nextState);
    localStorage.setItem('planzo_expensify_connected', String(nextState));
  };

  // Preference tags state persisted in localStorage
  const [preferenceTags, setPreferenceTags] = useState(() => {
    const saved = localStorage.getItem('planzo_user_preferences');
    return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
  });

  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const togglePreference = (id: string) => {
    setPreferenceTags((prev: typeof DEFAULT_PREFERENCES) => {
      const updated = prev.map((tag) => (tag.id === id ? { ...tag, active: !tag.active } : tag));
      localStorage.setItem('planzo_user_preferences', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveProfileBio = (newBio: string) => {
    setProfile((prev) => ({ ...prev, bio: newBio }));
    localStorage.setItem('planzo_user_bio', newBio);
    setIsEditingProfile(false);
  };

  // Real statistics derived from savedTrips
  const totalStopsCount = savedTrips.reduce((acc, t) => acc + (t.totalStops || 0), 0);
  const userInitial = (currentUser?.displayName || 'T').charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none p-6 sm:p-8 max-w-md w-full border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline font-black text-xl text-[#1b1c19]">Edit Profile Bio</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-headline font-black text-[#00696b] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.displayName}
                  className="w-full px-4 py-2.5 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] text-sm font-bold opacity-75 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-headline font-black text-[#00696b] uppercase tracking-wider mb-1">
                  Traveler Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 rounded-none text-xs font-bold text-[#6b7a7a] border-2 border-[#1b1c19] bg-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveProfileBio(profile.bio)}
                className="neobrutal-btn-teal px-5 py-2 text-xs font-black uppercase rounded-none shadow-[2px_2px_0px_0px_#1b1c19]"
              >
                Save Bio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP SECTION: User Profile Left Card + 3 Right Setting Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (User Profile Card) */}
        <div className="lg:col-span-4 bg-white p-6 border-2 border-[#1b1c19] rounded-none shadow-[5px_5px_0px_0px_#00696b] flex flex-col items-center text-center relative space-y-4">
          {/* Avatar Container with Badge */}
          <div className="relative group cursor-pointer" onClick={() => setIsEditingProfile(true)}>
            <div className="w-32 h-32 border-2 border-[#1b1c19] overflow-hidden shadow-[3px_3px_0px_0px_#1b1c19] rounded-none bg-[#00696b] flex items-center justify-center text-white">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={profile.displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-headline font-black text-4xl">{userInitial}</span>
              )}
            </div>

            {/* Neobrutalist Orange Badge Pill */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#a43c12] text-white px-3 py-0.5 text-[10px] font-headline font-black uppercase tracking-wider border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] whitespace-nowrap rounded-none">
              <span>{currentUser ? 'Gold Explorer' : 'Guest Explorer'}</span>
            </div>
          </div>

          {/* User Name & Bio */}
          <div className="pt-3 space-y-1.5 w-full">
            <h2 className="font-headline font-black text-xl text-[#1b1c19] flex items-center justify-center gap-1.5 truncate">
              <span>{profile.displayName}</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-gray-400 hover:text-[#00696b] transition-colors p-1"
                title="Edit traveler bio"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </h2>
            <p className="text-xs text-[#6b7a7a] max-w-xs mx-auto leading-relaxed">
              {profile.bio}
            </p>
            <p className="text-[11px] font-bold text-[#00696b] truncate">
              {profile.email}
            </p>
          </div>

          {/* Real Statistics Metric Cards Row */}
          <div className="grid grid-cols-3 gap-2 w-full pt-2">
            <div className="bg-[#f5f3ee] p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#1b1c19]">
                {savedTrips.length}
              </span>
              <span className="text-[10px] font-black text-[#6b7a7a] tracking-wider uppercase">
                SAVED
              </span>
            </div>

            <div className="bg-[#f5f3ee] p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#1b1c19]">
                {totalStopsCount}
              </span>
              <span className="text-[10px] font-black text-[#6b7a7a] tracking-wider uppercase">
                STOPS
              </span>
            </div>

            <div className="bg-[#00ced1]/20 p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#005354]">
                {savedTrips.length > 0 ? '100%' : '0%'}
              </span>
              <span className="text-[10px] font-extrabold text-[#005354] tracking-wider uppercase">
                VIBE
              </span>
            </div>
          </div>

          {!currentUser && (
            <button
              onClick={onSignIn}
              className="w-full neobrutal-btn-teal py-2.5 font-headline font-black text-xs uppercase tracking-wider rounded-none shadow-[2px_2px_0px_0px_#1b1c19]"
            >
              Sign In to Cloud Sync
            </button>
          )}
        </div>

        {/* Right Column (Preferences, Connected Apps, Notification Settings) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Top Row: Preferences Card + Connected Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Preferences Card */}
            <div className="bg-white rounded-none p-6 border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00696b]" />
                  <h3 className="font-headline font-extrabold text-lg text-[#1b1c19]">
                    Preferences
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditingPreferences(!isEditingPreferences)}
                  className="text-xs font-bold text-[#00696b] hover:underline"
                >
                  {isEditingPreferences ? 'Done' : 'Edit'}
                </button>
              </div>

              {/* Tags Pill Array */}
              <div className="flex flex-wrap gap-2">
                {preferenceTags.map((tag: any) => (
                  <button
                    key={tag.id}
                    disabled={!isEditingPreferences}
                    onClick={() => togglePreference(tag.id)}
                    className={`px-3.5 py-1.5 rounded-none text-xs font-bold transition-all border-2 border-[#1b1c19] ${
                      tag.active
                        ? 'bg-[#00696b] text-white shadow-[2px_2px_0px_0px_#1b1c19]'
                        : 'bg-[#f5f3ee] text-[#6b7a7a]'
                    } ${isEditingPreferences ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Connected Apps Card */}
            <div className="bg-white rounded-none p-6 border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[#00696b]" />
                <h3 className="font-headline font-extrabold text-lg text-[#1b1c19]">
                  Connected Apps
                </h3>
              </div>

              <div className="space-y-3">
                {/* Google Calendar Row */}
                <div className="p-3.5 bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#00696b]" />
                      <div>
                        <span className="text-xs font-bold text-[#1b1c19] block">Google Calendar</span>
                        <span className="text-[10px] text-[#6b7a7a] font-medium truncate max-w-[130px] block">
                          {isCalendarConnected
                            ? (sessionStorage.getItem('gcal_account_email') || currentUser?.email || 'Auto-Sync Active')
                            : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={onToggleCalendar}
                      className={`px-3 py-1 rounded-none text-[10px] font-headline font-black tracking-wider uppercase transition-all border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] ${
                        isCalendarConnected
                          ? 'bg-[#00ced1]/25 text-[#005354] hover:bg-red-100 hover:text-red-700'
                          : 'bg-[#00696b] text-white hover:-translate-y-0.5'
                      }`}
                    >
                      {isCalendarConnected ? 'ACTIVE ✓' : 'Connect'}
                    </button>
                  </div>

                  {isCalendarConnected && (
                    <div className="pt-2 border-t border-[#1b1c19]/20 flex items-center justify-between text-[11px]">
                      <span className="text-[#3b4949] font-medium">Auto-sync itinerary stops</span>
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00696b] font-bold hover:underline"
                      >
                        Open Calendar ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Expensify Row */}
                <div className="p-3 bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#a43c12]" />
                    <span className="text-xs font-bold text-[#1b1c19]">Expensify Sync</span>
                  </div>
                  <button
                    onClick={toggleExpensify}
                    className={`px-3 py-1 rounded-none text-[10px] font-headline font-black tracking-wider uppercase transition-all border-2 border-[#1b1c19] ${
                      isExpensifyConnected
                        ? 'bg-[#00ced1]/25 text-[#005354]'
                        : 'text-[#00696b] font-bold hover:underline'
                    }`}
                  >
                    {isExpensifyConnected ? 'ACTIVE ✓' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Notification Settings Card */}
          <div className="bg-white rounded-none p-6 border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#00696b]" />
              <h3 className="font-headline font-extrabold text-lg text-[#1b1c19]">
                Notification Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Trip Updates */}
              <div className="p-3.5 bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b1c19]">Trip Updates</span>
                <button
                  onClick={() =>
                    setNotifications((n: any) => ({ ...n, tripUpdates: !n.tripUpdates }))
                  }
                  className={`w-10 h-6 flex items-center rounded-none p-0.5 border-2 border-[#1b1c19] transition-colors duration-200 ${
                    notifications.tripUpdates ? 'bg-[#00696b]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-none border border-[#1b1c19] shadow-xs transform transition-transform duration-200 ${
                      notifications.tripUpdates ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Flight Alerts */}
              <div className="p-3.5 bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b1c19]">Flight Alerts</span>
                <button
                  onClick={() =>
                    setNotifications((n: any) => ({ ...n, flightAlerts: !n.flightAlerts }))
                  }
                  className={`w-10 h-6 flex items-center rounded-none p-0.5 border-2 border-[#1b1c19] transition-colors duration-200 ${
                    notifications.flightAlerts ? 'bg-[#00696b]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-none border border-[#1b1c19] shadow-xs transform transition-transform duration-200 ${
                      notifications.flightAlerts ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Vibe Check-ins */}
              <div className="p-3.5 bg-[#f5f3ee] rounded-none border-2 border-[#1b1c19] flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b1c19]">Vibe Check-ins</span>
                <button
                  onClick={() =>
                    setNotifications((n: any) => ({ ...n, vibeCheckIns: !n.vibeCheckIns }))
                  }
                  className={`w-10 h-6 flex items-center rounded-none p-0.5 border-2 border-[#1b1c19] transition-colors duration-200 ${
                    notifications.vibeCheckIns ? 'bg-[#00696b]' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-none border border-[#1b1c19] shadow-xs transform transition-transform duration-200 ${
                      notifications.vibeCheckIns ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: REAL TRIP HISTORY FETCHED FROM MY TRIPS */}
      <div className="space-y-6 pt-4 border-t-2 border-[#1b1c19]/20">
        {/* Title & View All */}
        <div className="flex items-end justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a43c12]/10 text-[#a43c12] text-xs font-headline font-black uppercase tracking-wider mb-2 border border-[#a43c12]/30 rounded-none">
              <Ticket className="w-3.5 h-3.5" />
              <span>{savedTrips.length} Passport History</span>
            </div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#1b1c19]">
              Trip History & Passports
            </h2>
            <p className="text-xs text-[#6b7a7a] mt-0.5">
              Manage your AI-generated travel itineraries synchronized with your account.
            </p>
          </div>

          {savedTrips.length > 0 && (
            <button
              onClick={() => onSelectTab('my-trips')}
              className="neobrutal-btn-teal px-4 py-2 text-xs font-headline font-black uppercase flex items-center gap-1.5 rounded-none shadow-[2px_2px_0px_0px_#1b1c19]"
            >
              <span>View All Saved Trips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 100% Real Trip Cards Grid (Fetched from savedTrips) */}
        {savedTrips.length === 0 ? (
          <div className="bg-white border-2 border-[#1b1c19] rounded-none p-8 text-center space-y-3 shadow-[4px_4px_0px_0px_#00696b]">
            <Compass className="w-10 h-10 text-[#00696b] mx-auto opacity-80" />
            <h3 className="font-headline font-bold text-lg text-[#1b1c19]">No Saved Trips Found</h3>
            <p className="text-xs text-[#6b7a7a] max-w-sm mx-auto">
              You haven't saved any travel itineraries yet. Generate your first vibe-based escape now!
            </p>
            <button
              onClick={() => onSelectTab('explore')}
              className="neobrutal-btn-terracotta px-5 py-2.5 rounded-none font-headline font-black text-xs uppercase shadow-[2px_2px_0px_0px_#1b1c19]"
            >
              + Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savedTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTab('my-trips')}
                className="bg-white rounded-none border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Banner Image with Overlay Badge */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#f0eee6] border-b-2 border-[#1b1c19]">
                    <CustomSearchImage
                      query={trip.destination || trip.region || ''}
                      alt={trip.destination || ''}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 rounded-none text-[10px] font-headline font-black tracking-wider uppercase border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] bg-[#00696b] text-white">
                        SAVED PASSPORT
                      </span>
                    </div>

                    <div className="absolute top-3 left-3 z-10">
                      <span className="px-2.5 py-0.5 text-[10px] font-headline font-black uppercase border-2 border-[#1b1c19] bg-white text-[#1b1c19]">
                        {trip.region || trip.destination}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-5 space-y-2">
                    <h3 className="font-headline font-black text-xl text-[#1b1c19] group-hover:text-[#00696b] transition-colors truncate">
                      {trip.destination}
                    </h3>

                    <p className="text-xs text-[#6b7a7a] font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#a43c12]" />
                      <span>{trip.dates}</span>
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#3b4949] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00696b]" />
                        <span>{trip.totalStops} Stops</span>
                      </span>
                      <span>•</span>
                      <span>{trip.duration?.formatted || 'Multi-day'}</span>
                    </div>

                    {/* Vibes preview tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {trip.vibes?.slice(0, 3).map((v, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-[#f5f3ee] border border-[#1b1c19]/30 text-[#3b4949] font-bold px-2 py-0.5 rounded-none"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Action */}
                <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-[#1b1c19]/10 mt-2">
                  <span className="text-[11px] font-bold text-[#6b7a7a]">
                    ID: {trip.id.substring(0, 8)}...
                  </span>

                  <div className="text-xs font-headline font-black text-[#00696b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Itinerary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
