import React, { useState } from 'react';
import { UserProfile, Itinerary } from '../types';
import { User } from '../lib/firebase';
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
  { id: 'foodie', label: 'Foodie', active: false },
  { id: 'chill', label: 'Chill', active: false },
  { id: 'cultural', label: 'Cultural', active: true },
  { id: 'nightlife', label: 'Nightlife', active: false },
  { id: 'budget', label: 'Budget', active: false },
  { id: 'photography', label: 'Photography', active: true },
  { id: 'hidden-gems', label: 'Hidden Gems', active: false },
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
  // User Profile State
  const [profile, setProfile] = useState<UserProfile>({
    displayName: currentUser?.displayName || 'Sarah Jenkins',
    email: currentUser?.email || 'sarah.j@example.com',
    photoURL: currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    bio: 'Chasing sunsets and algorithmic efficiency since 2021.',
    location: 'San Francisco, CA',
    memberSince: '2021',
    preferredVibes: ['Adventure', 'Cultural', 'Photography'],
    travelPace: 'Balanced',
    preferredTransport: ['Walking', 'Public Transit'],
    budgetLevel: 'Mid-range',
    bucketList: ['Santorini, Greece', 'Kyoto, Japan', 'Lisbon, Portugal'],
    calendarAutoSync: true,
  });

  // Notifications toggle state
  const [notifications, setNotifications] = useState({
    tripUpdates: true,
    flightAlerts: true,
    vibeCheckIns: false,
  });

  // Expensify integration state
  const [isExpensifyConnected, setIsExpensifyConnected] = useState(false);

  // Preference tags state
  const [preferenceTags, setPreferenceTags] = useState(DEFAULT_PREFERENCES);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const togglePreference = (id: string) => {
    setPreferenceTags((prev) =>
      prev.map((tag) => (tag.id === id ? { ...tag, active: !tag.active } : tag))
    );
  };

  const sampleHistoryTrips = [
    {
      id: 'santorini-1',
      title: 'Santorini Escape',
      date: 'June 15 - June 22, 2024',
      status: 'UPCOMING',
      badgeClass: 'bg-[#00696b] text-white',
      imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&auto=format&fit=crop&q=80',
      collaborators: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'kyoto-2',
      title: 'Kyoto Zen',
      date: 'Oct 10 - Oct 18, 2023',
      status: 'COMPLETED',
      badgeClass: 'bg-[#e2e8e8] text-[#3b4949]',
      imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80',
      collaborators: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      ],
    },
    {
      id: 'lisbon-3',
      title: 'Lisbon Explorer',
      date: 'TBD 2025',
      status: 'DRAFT',
      badgeClass: 'bg-[#a43c12] text-white',
      pendingText: '3 items pending',
      imageUrl: 'https://images.unsplash.com/photo-1513673054901-2b5f51551112?w=600&auto=format&fit=crop&q=80',
      collaborators: [],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-in fade-in duration-300">
      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none p-6 sm:p-8 max-w-md w-full border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="font-headline font-black text-xl text-[#1b1c19]">Edit User Profile</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-headline font-black text-[#00696b] uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-headline font-black text-[#00696b] uppercase tracking-wider mb-1">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] text-sm font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-headline font-black text-[#00696b] uppercase tracking-wider mb-1">
                  Avatar Image URL
                </label>
                <input
                  type="text"
                  value={profile.photoURL}
                  onChange={(e) => setProfile({ ...profile, photoURL: e.target.value })}
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
                onClick={() => setIsEditingProfile(false)}
                className="neobrutal-btn-teal px-5 py-2 text-xs font-black uppercase rounded-none shadow-[2px_2px_0px_0px_#1b1c19]"
              >
                Save Changes
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
            <div className="w-36 h-36 border-2 border-[#1b1c19] overflow-hidden shadow-[3px_3px_0px_0px_#1b1c19] rounded-none">
              <img
                src={profile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'}
                alt={profile.displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Neobrutalist Orange Badge Pill */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#a43c12] text-white px-3.5 py-1 text-xs font-headline font-black uppercase tracking-wider border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] whitespace-nowrap flex items-center gap-1 rounded-none">
              <span>Level 42 Explorer</span>
            </div>
          </div>

          {/* User Name & Bio */}
          <div className="pt-3 space-y-1.5">
            <h2 className="font-headline font-black text-2xl text-[#1b1c19] flex items-center justify-center gap-2">
              <span>{profile.displayName}</span>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="text-gray-400 hover:text-[#00696b] transition-colors p-1"
                title="Edit profile details"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </h2>
            <p className="text-xs text-[#6b7a7a] max-w-xs mx-auto leading-relaxed">
              {profile.bio}
            </p>
          </div>

          {/* 3 Metric Cards Row */}
          <div className="grid grid-cols-3 gap-2.5 w-full pt-2">
            <div className="bg-[#f5f3ee] p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#1b1c19]">24</span>
              <span className="text-[10px] font-black text-[#6b7a7a] tracking-wider uppercase">
                TRIPS
              </span>
            </div>

            <div className="bg-[#f5f3ee] p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#1b1c19]">12.4k</span>
              <span className="text-[10px] font-black text-[#6b7a7a] tracking-wider uppercase">
                MILES
              </span>
            </div>

            <div className="bg-[#00ced1]/20 p-3 text-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]">
              <span className="block text-xl font-headline font-black text-[#005354]">88%</span>
              <span className="text-[10px] font-extrabold text-[#005354] tracking-wider uppercase">
                VIBE
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (Preferences, Connected, Notification Settings) */}
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
                {preferenceTags.map((tag) => (
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
                  Connected
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
                        <span className="text-[10px] text-[#6b7a7a] font-medium">
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
                    <span className="text-xs font-bold text-[#1b1c19]">Expensify</span>
                  </div>
                  <button
                    onClick={() => setIsExpensifyConnected(!isExpensifyConnected)}
                    className={`px-3 py-1 rounded-none text-[10px] font-extrabold tracking-wider uppercase transition-all border-2 border-[#1b1c19] ${
                      isExpensifyConnected
                        ? 'bg-[#00ced1]/25 text-[#005354]'
                        : 'text-[#00696b] font-bold hover:underline'
                    }`}
                  >
                    {isExpensifyConnected ? 'ACTIVE' : 'Connect'}
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
                    setNotifications((n) => ({ ...n, tripUpdates: !n.tripUpdates }))
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
                    setNotifications((n) => ({ ...n, flightAlerts: !n.flightAlerts }))
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
                    setNotifications((n) => ({ ...n, vibeCheckIns: !n.vibeCheckIns }))
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

      {/* BOTTOM SECTION: TRIP HISTORY */}
      <div className="space-y-6 pt-4">
        {/* Title & View All */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#1b1c19]">
              Trip History
            </h2>
            <p className="text-xs text-[#6b7a7a] mt-0.5">
              Manage your past and future adventures.
            </p>
          </div>

          <button
            onClick={() => onSelectTab('my-trips')}
            className="text-xs font-bold text-[#00696b] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
          </button>
        </div>

        {/* 3 Trip Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleHistoryTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => onSelectTab('my-trips')}
              className="bg-white rounded-none border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Banner Image with Overlay Badge */}
                <div className="h-44 w-full relative overflow-hidden bg-gray-100 border-b-2 border-[#1b1c19]">
                  <img
                    src={trip.imageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-none text-[10px] font-extrabold tracking-wider uppercase border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] ${trip.badgeClass}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-1">
                  <h3 className="font-headline font-black text-xl text-[#1b1c19] group-hover:text-[#00696b] transition-colors">
                    {trip.title}
                  </h3>
                  <p className="text-xs text-[#6b7a7a] font-medium">{trip.date}</p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-5 pb-5 pt-2 flex items-center justify-between">
                {/* Avatar stack or pending text */}
                <div className="flex items-center -space-x-2">
                  {trip.collaborators.map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar}
                      alt="Collaborator"
                      className="w-6 h-6 rounded-none border-2 border-[#1b1c19] object-cover"
                    />
                  ))}
                  {trip.pendingText && (
                    <span className="text-xs font-bold text-[#a43c12]">{trip.pendingText}</span>
                  )}
                </div>

                {/* Action Link */}
                <div className="text-xs font-bold text-[#00696b] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>{trip.status === 'DRAFT' ? 'Edit Draft' : 'View Itinerary'}</span>
                  {trip.status === 'DRAFT' ? <Edit2 className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
