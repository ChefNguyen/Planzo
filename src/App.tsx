import React, { useState, useEffect, useCallback, startTransition, useMemo } from 'react';
import { Sparkles, Compass, AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { StructuredInput } from './components/StructuredInput';
import { PromptGeniusInput } from './components/PromptGeniusInput';
import { ScheduleReviewModal } from './components/ScheduleReviewModal';
import { ItineraryMapView } from './components/ItineraryMapView';
import { MyTripsView } from './components/MyTripsView';
import { CommunityView } from './components/CommunityView';
import { VibeCheckView } from './components/VibeCheckView';
import { ProfileView } from './components/ProfileView';
import { AIProcessingModal } from './components/AIProcessingModal';
import { Footer } from './components/Footer';
import { Itinerary, InputMode, StructuredFormData, PromptFormData } from './types';
import { getInitialTheme, applyTheme, ThemeMode } from './lib/theme';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  connectGoogleCalendarAccount,
  logoutUser,
  saveItineraryToFirestore,
  deleteItineraryFromFirestore,
  subscribeUserTrips,
  subscribeCommunityTrips,
  User,
} from './lib/firebase';

// Screen states for the Explore tab
type ExploreScreen = 'home' | 'processing' | 'itinerary';
type ItineraryReturnTab = 'explore' | 'my-trips' | 'community' | 'profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('explore');

  // Enforce light theme on DOM
  useEffect(() => {
    applyTheme('light');
  }, []);
  const [inputMode, setInputMode] = useState<InputMode>('structured');
  const [structuredForm, setStructuredForm] = useState<StructuredFormData>({
    destination: '',
    dates: '',
    selectedVibes: ['Adventure', 'Foodie'],
    budgetLevel: 'Mid-range',
    travelPace: 'Moderate',
  });
  const [promptForm, setPromptForm] = useState<PromptFormData>({ prompt: '' });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [communityTrips, setCommunityTrips] = useState<Itinerary[]>([]);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);

  // Single source of truth for Explore tab screen
  const [exploreScreen, setExploreScreen] = useState<ExploreScreen>('home');
  const [itineraryReturnTab, setItineraryReturnTab] = useState<ItineraryReturnTab>('explore');

  // Review modal — only opened manually via "Review & Sync Schedule" button
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);

  // Calendar connection state persisted in localStorage
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(() => {
    return localStorage.getItem('planzo_calendar_connected') !== 'false';
  });
  const [calendarToast, setCalendarToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Auto-clear calendar toast
  useEffect(() => {
    if (calendarToast) {
      const timer = setTimeout(() => setCalendarToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [calendarToast]);

  const handleToggleCalendar = async () => {
    if (!isCalendarConnected) {
      // 1. If not logged into web app, user MUST login first!
      let activeUser = currentUser;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
        if (!activeUser) {
          // Login cancelled by user
          return;
        }
      }

      // 2. User is logged in. Now open Google OAuth (prompt: select_account) to pick same or different GCal account
      const res = await connectGoogleCalendarAccount();

      if (res?.error === 'cancelled') {
        return;
      }

      const connectedEmail = res?.email || sessionStorage.getItem('gcal_account_email') || activeUser?.email || '';

      setIsCalendarConnected(true);
      localStorage.setItem('planzo_calendar_connected', 'true');

      if (res?.error === 'access_denied') {
        setCalendarToast({
          message: 'Calendar Connected via .ICS Sync Mode! (GCP Unverified App Fallback)',
          type: 'info',
        });
      } else {
        setCalendarToast({
          message: connectedEmail
            ? `Google Calendar (${connectedEmail}) Connected! Auto-sync active.`
            : 'Google Calendar Connected! Auto-sync active.',
          type: 'success',
        });
      }
    } else {
      setIsCalendarConnected(false);
      localStorage.setItem('planzo_calendar_connected', 'false');
      sessionStorage.removeItem('gcal_access_token');
      sessionStorage.removeItem('gcal_account_email');
      setCalendarToast({
        message: 'Google Calendar Disconnected.',
        type: 'info',
      });
    }
  };

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore User Trips & Community Trips listener + Guest LocalStorage Persistence
  useEffect(() => {
    let unsubUserTrips: (() => void) | undefined;
    if (currentUser) {
      // Sync any guest trips generated before logging in to the user's account
      const guestTripsRaw = localStorage.getItem('planzo_guest_saved_trips');
      if (guestTripsRaw) {
        try {
          const guestTrips: Itinerary[] = JSON.parse(guestTripsRaw);
          guestTrips.forEach((trip) => saveItineraryToFirestore(trip, currentUser.uid));
          localStorage.removeItem('planzo_guest_saved_trips');
        } catch (err) {
          console.warn('Error syncing guest trips to user account:', err);
        }
      }

      unsubUserTrips = subscribeUserTrips(currentUser.uid, (trips) => {
        startTransition(() => setSavedTrips(trips));
      });
    } else {
      // Load saved guest trips from localStorage for Guest users
      const guestTripsRaw = localStorage.getItem('planzo_guest_saved_trips');
      if (guestTripsRaw) {
        try {
          const guestTrips: Itinerary[] = JSON.parse(guestTripsRaw);
          startTransition(() => setSavedTrips(guestTrips));
        } catch {
          setSavedTrips([]);
        }
      } else {
        setSavedTrips([]);
      }
    }

    const unsubCommunity = subscribeCommunityTrips((trips) => {
      startTransition(() => setCommunityTrips(trips));
    });

    return () => {
      if (unsubUserTrips) unsubUserTrips();
      unsubCommunity();
    };
  }, [currentUser]);

  // Memoize the sliced community trips so CommunityView's React.memo never breaks
  // due to a new array reference every time Firestore streams a snapshot
  const displayCommunityTrips = useMemo(() => communityTrips.slice(0, 9), [communityTrips]);

  // ─────────────────────────────────────────────────────────────────────────
  // CORE FLOW:
  //   home ──[click Generate]──► processing ──[done]──► itinerary
  //                                                         ▲
  //   (My Trips / Community select trip) ──────────────────┘
  // ─────────────────────────────────────────────────────────────────────────
  const handleGenerateItinerary = async () => {
    setExploreScreen('processing');
    setGenerateError(null);

    const startTime = Date.now();
    const MIN_DISPLAY_MS = 3800; // minimum display duration for processing modal animation

    try {
      const payload =
        inputMode === 'structured'
          ? {
            mode: 'structured',
            destination: structuredForm.destination || 'Tokyo, Japan',
            dates: structuredForm.dates || 'Next Month',
            vibes: structuredForm.selectedVibes,
            budgetLevel: structuredForm.budgetLevel || 'Mid-range',
            travelPace: structuredForm.travelPace || 'Moderate',
          }
          : {
            mode: 'prompt',
            prompt: promptForm.prompt || 'A 5-day foodie adventure in Tokyo',
          };

      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Server error ${res.status}`);
      }

      const data: Itinerary = await res.json();
      if (currentUser) data.userId = currentUser.uid;

      setActiveItinerary(data);

      // Always save to savedTrips state & guest localStorage if not logged in
      setSavedTrips((prev) => {
        const updated = [data, ...prev.filter((t) => t.id !== data.id)];
        if (!currentUser) {
          localStorage.setItem('planzo_guest_saved_trips', JSON.stringify(updated));
        }
        return updated;
      });

      try {
        await saveItineraryToFirestore(data, currentUser?.uid);
      } catch (fsErr) {
        console.warn('Firestore save fallback:', fsErr);
      }

      // Keep processing screen visible for at least MIN_DISPLAY_MS so animation can complete
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_DISPLAY_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_DISPLAY_MS - elapsed));
      }

      setExploreScreen('itinerary'); // ← Go directly to map view, NO review modal
    } catch (err: any) {
      console.error('Generate error:', err);
      setGenerateError(err?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      setExploreScreen('home'); // ← Return to home on error
    }
  };

  const handleSelectTrip = (trip: Itinerary, returnTab: ItineraryReturnTab = 'explore') => {
    setActiveItinerary(trip);
    setShowReviewModal(false);
    setItineraryReturnTab(returnTab);
    setExploreScreen('itinerary');
  };

  const handleDeleteTrip = async (tripId: string) => {
    setSavedTrips((prev) => {
      const updated = prev.filter((t) => t.id !== tripId);
      if (!currentUser) {
        localStorage.setItem('planzo_guest_saved_trips', JSON.stringify(updated));
      }
      return updated;
    });

    if (activeItinerary?.id === tripId) {
      setActiveItinerary(null);
      setExploreScreen('home');
    }
    try {
      await deleteItineraryFromFirestore(tripId);
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  };

  const handleUpdateItinerary = async (updated: Itinerary) => {
    setActiveItinerary(updated);
    setSavedTrips((prev) => {
      const updatedList = prev.map((t) => (t.id === updated.id ? updated : t));
      if (!currentUser) {
        localStorage.setItem('planzo_guest_saved_trips', JSON.stringify(updatedList));
      }
      return updatedList;
    });

    try {
      await saveItineraryToFirestore(updated, currentUser?.uid);
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  };

  const handleApplyVibeFromCheck = (
    vibes: string[],
    destination: string,
    pace?: string,
    budget?: string
  ) => {
    setStructuredForm({
      destination: destination || 'Kyoto, Japan',
      dates: 'Oct 12 - Oct 16, 2026',
      selectedVibes: vibes.length > 0 ? vibes : ['Relax', 'Spiritual'],
      budgetLevel: budget || 'Mid-range',
      travelPace: pace || 'Moderate',
    });
    setCurrentTab('explore');
    setInputMode('structured');
    setExploreScreen('home');
  };

  const handleSelectTab = useCallback((tab: string) => {
    // Wrap ALL state updates in startTransition:
    // → The header button click registers instantly (urgent, outside transition)
    // → Tab content renders asynchronously in the background (non-urgent)
    // This is the correct React 18 pattern for instant-feeling tab switches.
    startTransition(() => {
      setCurrentTab(tab);
      setShowReviewModal(false);
      setItineraryReturnTab('explore');
      setExploreScreen((prev) => (tab === 'explore' || prev === 'itinerary' ? 'home' : prev));
    });
  }, []);

  const handleSelectTripFromMyTrips = useCallback((trip: Itinerary) => {
    handleSelectTrip(trip, 'my-trips');
  }, []);

  const handleSelectTripFromCommunity = useCallback((trip: Itinerary) => {
    handleSelectTrip(trip, 'community');
  }, []);

  const handleSelectTripFromProfile = useCallback((trip: Itinerary) => {
    handleSelectTrip(trip, 'profile');
  }, []);

  const handleCreateNewTrip = useCallback(() => {
    setCurrentTab('explore');
    setExploreScreen('home');
  }, []);

  // Derive destination/vibes for processing modal from whichever mode is active
  const processingDest = inputMode === 'structured' ? structuredForm.destination : promptForm.prompt;
  const processingVibes = inputMode === 'structured' ? structuredForm.selectedVibes : ['Custom AI Vibe'];
  const isViewingItinerary = exploreScreen === 'itinerary' && !!activeItinerary;

  return (
    <div className="min-h-screen bg-[#fbf9f4] font-body text-[#1b1c19] flex flex-col transition-colors duration-300 selection:bg-[#00ced1] selection:text-[#005354]">
      {/* Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isCalendarConnected={isCalendarConnected}
        onToggleCalendar={handleToggleCalendar}
        currentUser={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logoutUser}
      />

      {/* Neobrutalist Calendar Toast Banner */}
      {calendarToast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="bg-white p-3.5 px-5 border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] flex items-center gap-3 rounded-none">
            <span className="material-symbols-outlined text-[#00696b] text-xl font-bold">
              {calendarToast.type === 'success' ? 'event_available' : 'event_busy'}
            </span>
            <span className="font-headline font-black text-xs uppercase tracking-wider text-[#1b1c19]">
              {calendarToast.message}
            </span>
            <button
              onClick={() => setCalendarToast(null)}
              className="ml-2 text-[#6b7a7a] hover:text-[#1b1c19] font-bold text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pt-24 pb-12">

        {/* ── Screen 1 (processing): AI Reasoning overlay ── */}
        {exploreScreen === 'processing' && currentTab === 'explore' && (
          <AIProcessingModal destination={processingDest} vibes={processingVibes} />
        )}

        {isViewingItinerary && activeItinerary && (
          <ItineraryMapView
            itinerary={activeItinerary}
            onOpenReviewModal={() => setShowReviewModal(true)}
            onBackToInput={() => {
              setExploreScreen('home');
              setShowReviewModal(false);
              setCurrentTab(itineraryReturnTab);
            }}
            onUpdateItinerary={handleUpdateItinerary}
          />
        )}

        {/* ── Explore tab ── */}
        <div className={!isViewingItinerary && currentTab === 'explore' && exploreScreen !== 'processing' ? 'block' : 'hidden'}>
          {/* Screen: Home input form */}
          {exploreScreen === 'home' && (
            <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-0 pt-4">
              <div className="mb-8 text-left space-y-3">
                <div className="inline-flex items-center gap-3 p-1.5 pr-4 bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] rounded-none transition-transform hover:-translate-y-0.5 hover:-translate-x-0.5">
                  <div className="px-3 py-1 rounded-none bg-[#a43c12] text-white flex items-center gap-1.5 font-headline font-black text-[10px] sm:text-[11px] tracking-wider uppercase border border-[#1b1c19]">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>PLANZO AI</span>
                  </div>
                  <span className="text-xs font-headline font-black tracking-widest uppercase text-[#00696b]">
                    Travel Discovery
                  </span>
                </div>

                <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#00696b] max-w-3xl leading-[1.1] tracking-tight">
                  Find the place your{' '}
                  <span className="text-[#a43c12] italic font-serif">
                    vibe
                  </span>{' '}
                  belongs.
                </h1>

                <p className="text-base sm:text-lg text-[#3b4949] max-w-2xl leading-relaxed">
                  Tell Planzo your dream mood, obscure interests, or aesthetic goals. We'll handle the logistics of your next escape.
                </p>
              </div>

              {inputMode === 'structured' ? (
                <StructuredInput
                  formData={structuredForm}
                  onChange={setStructuredForm}
                  onSwitchMode={setInputMode}
                  onSubmit={handleGenerateItinerary}
                  isLoading={false}
                />
              ) : (
                <PromptGeniusInput
                  formData={promptForm}
                  onChange={setPromptForm}
                  onSwitchMode={setInputMode}
                  onSubmit={handleGenerateItinerary}
                  isLoading={false}
                />
              )}

              {generateError && (
                <div className="mt-4 flex items-start gap-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-none p-4 text-sm shadow-[3px_3px_0px_0px_#ba1a1a]">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Không thể tạo lịch trình</p>
                    <p className="mt-0.5 opacity-80">{generateError}</p>
                  </div>
                  <button
                    onClick={() => setGenerateError(null)}
                    className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* ── My Trips tab — CSS visibility toggled to preserve DOM & avoid remount jank ── */}
        <div className={!isViewingItinerary && currentTab === 'my-trips' ? 'block' : 'hidden'}>
          <MyTripsView
            savedTrips={savedTrips}
            onSelectTrip={handleSelectTripFromMyTrips}
            onDeleteTrip={handleDeleteTrip}
            onCreateNewTrip={handleCreateNewTrip}
          />
        </div>

        {/* ── Community tab — CSS visibility toggled to preserve DOM & avoid remount jank ── */}
        <div className={!isViewingItinerary && currentTab === 'community' ? 'block' : 'hidden'}>
          <CommunityView
            trips={displayCommunityTrips}
            onSelectTrip={handleSelectTripFromCommunity}
            isVisible={!isViewingItinerary && currentTab === 'community'}
          />
        </div>

        {/* ── Vibe Check tab ── */}
        <div className={!isViewingItinerary && currentTab === 'vibe-check' ? 'block' : 'hidden'}>
          <VibeCheckView onApplyVibe={handleApplyVibeFromCheck} />
        </div>

        {/* ── Profile tab ── */}
        <div className={!isViewingItinerary && currentTab === 'profile' ? 'block' : 'hidden'}>
          <ProfileView
            currentUser={currentUser}
            savedTrips={savedTrips}
            isCalendarConnected={isCalendarConnected}
            onToggleCalendar={() => setIsCalendarConnected(!isCalendarConnected)}
            onSelectTab={(tab) => {
              handleSelectTab(tab);
            }}
            onSelectTrip={handleSelectTripFromProfile}
            onSignOut={logoutUser}
            onSignIn={signInWithGoogle}
          />
        </div>
      </main>

      {/* ── Schedule Review Modal (only opened by user clicking "Review & Sync Schedule") ── */}
      {showReviewModal && activeItinerary && (
        <ScheduleReviewModal
          itinerary={activeItinerary}
          onClose={() => setShowReviewModal(false)}
          onConfirmSync={() => setIsCalendarConnected(true)}
          onUpdateItinerary={handleUpdateItinerary}
        />
      )}

      <Footer />
    </div>
  );
}
