import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StructuredInput } from './components/StructuredInput';
import { PromptGeniusInput } from './components/PromptGeniusInput';
import { ScheduleReviewModal } from './components/ScheduleReviewModal';
import { ItineraryMapView } from './components/ItineraryMapView';
import { MyTripsView } from './components/MyTripsView';
import { CommunityView } from './components/CommunityView';
import { VibeCheckView } from './components/VibeCheckView';
import { ProfileView } from './components/ProfileView';
import { Footer } from './components/Footer';
import { KYOTO_DEFAULT_ITINERARY, SAMPLE_COMMUNITY_TRIPS } from './data/mockData';
import { Itinerary, InputMode, StructuredFormData, PromptFormData } from './types';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  logoutUser,
  saveItineraryToFirestore,
  deleteItineraryFromFirestore,
  subscribeUserTrips,
  subscribeCommunityTrips,
  User,
} from './lib/firebase';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('explore');
  const [inputMode, setInputMode] = useState<InputMode>('structured');
  const [structuredForm, setStructuredForm] = useState<StructuredFormData>({
    destination: '',
    dates: '',
    selectedVibes: ['Adventure', 'Foodie'],
  });

  const [promptForm, setPromptForm] = useState<PromptFormData>({
    prompt: '',
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>(SAMPLE_COMMUNITY_TRIPS);
  const [activeItinerary, setActiveItinerary] = useState<Itinerary | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewState, setViewState] = useState<'home' | 'itinerary'>('home');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore User Trips & Community Trips listener
  useEffect(() => {
    let unsubUserTrips: (() => void) | undefined;
    if (currentUser) {
      unsubUserTrips = subscribeUserTrips(currentUser.uid, (trips) => {
        if (trips.length > 0) {
          setSavedTrips(trips);
        }
      });
    }

    const unsubCommunity = subscribeCommunityTrips((trips) => {
      if (!currentUser && trips.length > 0) {
        setSavedTrips(trips);
      }
    });

    return () => {
      if (unsubUserTrips) unsubUserTrips();
      unsubCommunity();
    };
  }, [currentUser]);

  // Handle Generating Itinerary via API call & saving to Firestore
  const handleGenerateItinerary = async () => {
    setIsLoading(true);
    try {
      const payload =
        inputMode === 'structured'
          ? {
              mode: 'structured',
              destination: structuredForm.destination || 'Tokyo, Japan',
              dates: structuredForm.dates || 'Next Month',
              vibes: structuredForm.selectedVibes,
            }
          : {
              mode: 'prompt',
              prompt: promptForm.prompt || 'A 5-day foodie adventure in Tokyo with a focus on hidden ramen shops...',
            };

      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: Itinerary;
      if (res.ok) {
        data = await res.json();
      } else {
        data = { ...KYOTO_DEFAULT_ITINERARY, id: `kyoto-${Date.now()}` };
      }

      if (currentUser) {
        data.userId = currentUser.uid;
      }

      setActiveItinerary(data);
      setSavedTrips((prev) => [data, ...prev.filter((t) => t.id !== data.id)]);

      // Save to Firestore
      try {
        await saveItineraryToFirestore(data, currentUser?.uid);
      } catch (fsErr) {
        console.warn('Firestore save fallback to local state:', fsErr);
      }
    } catch (err) {
      console.error('Error calling generate-itinerary:', err);
      const fallback = { ...KYOTO_DEFAULT_ITINERARY, id: `kyoto-${Date.now()}` };
      setActiveItinerary(fallback);
    } finally {
      setIsLoading(false);
      setViewState('itinerary');
      setShowReviewModal(true);
    }
  };

  const handleSelectTrip = (trip: Itinerary) => {
    setActiveItinerary(trip);
    setViewState('itinerary');
    setShowReviewModal(true);
  };

  const handleDeleteTrip = async (tripId: string) => {
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
    if (activeItinerary?.id === tripId) {
      setActiveItinerary(null);
      setViewState('home');
    }
    try {
      await deleteItineraryFromFirestore(tripId);
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  };

  const handleUpdateItinerary = async (updated: Itinerary) => {
    setActiveItinerary(updated);
    setSavedTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    try {
      await saveItineraryToFirestore(updated, currentUser?.uid);
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  };

  const handleApplyVibeFromCheck = (vibes: string[], destination: string) => {
    setStructuredForm({
      destination,
      dates: 'Oct 12 - Oct 16, 2026',
      selectedVibes: vibes,
    });
    setCurrentTab('explore');
    setInputMode('structured');
  };

  return (
    <div className="min-[#100vh] bg-[#fbf9f4] font-body text-[#1b1c19] flex flex-col justify-between selection:bg-[#00ced1] selection:text-[#005354] relative">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'explore' && !activeItinerary) {
            setViewState('home');
          }
        }}
        isCalendarConnected={isCalendarConnected}
        onToggleCalendar={() => setIsCalendarConnected(!isCalendarConnected)}
        currentUser={currentUser}
        onSignIn={signInWithGoogle}
        onSignOut={logoutUser}
      />

      {/* Main Tab Content */}
      <main className="flex-1 pt-24 pb-12 relative overflow-hidden">
        {/* Tab 1: Explore (Home Generator or Itinerary Map View) */}
        {currentTab === 'explore' && (
          <>
            {viewState === 'home' || !activeItinerary ? (
              <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-0 pt-6">
                {/* Hero Header */}
                <div className="mb-10 text-left">
                  <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#00696b] max-w-3xl leading-[1.1] tracking-tight">
                    Where does your{' '}
                    <span className="text-[#a43c12] italic font-serif">vibe</span> want to go?
                  </h1>
                  <p className="text-base sm:text-lg text-[#3b4949] mt-3 max-w-2xl leading-relaxed">
                    Tell Planzo your dream mood, obscure interests, or aesthetic goals. We'll handle the logistics of your next escape.
                  </p>
                </div>

                {/* AI Input Card Switcher */}
                {inputMode === 'structured' ? (
                  <StructuredInput
                    formData={structuredForm}
                    onChange={setStructuredForm}
                    onSwitchMode={setInputMode}
                    onSubmit={handleGenerateItinerary}
                    isLoading={isLoading}
                  />
                ) : (
                  <PromptGeniusInput
                    formData={promptForm}
                    onChange={setPromptForm}
                    onSwitchMode={setInputMode}
                    onSubmit={handleGenerateItinerary}
                    isLoading={isLoading}
                  />
                )}
              </section>
            ) : (
              /* Itinerary Map Background View */
              <ItineraryMapView
                itinerary={activeItinerary}
                onOpenReviewModal={() => setShowReviewModal(true)}
                onBackToInput={() => {
                  setViewState('home');
                  setShowReviewModal(false);
                }}
                onUpdateItinerary={handleUpdateItinerary}
              />
            )}
          </>
        )}

        {/* Tab 2: My Trips */}
        {currentTab === 'my-trips' && (
          <MyTripsView
            savedTrips={savedTrips}
            onSelectTrip={handleSelectTrip}
            onDeleteTrip={handleDeleteTrip}
            onCreateNewTrip={() => {
              setCurrentTab('explore');
              setViewState('home');
            }}
          />
        )}

        {/* Tab 3: Community */}
        {currentTab === 'community' && (
          <CommunityView onSelectTrip={handleSelectTrip} />
        )}

        {/* Tab 4: Vibe Check */}
        {currentTab === 'vibe-check' && (
          <VibeCheckView onApplyVibe={handleApplyVibeFromCheck} />
        )}

        {/* Tab 5: Profile */}
        {currentTab === 'profile' && (
          <ProfileView
            currentUser={currentUser}
            savedTrips={savedTrips}
            isCalendarConnected={isCalendarConnected}
            onToggleCalendar={() => setIsCalendarConnected(!isCalendarConnected)}
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              if (tab === 'explore' && !activeItinerary) {
                setViewState('home');
              }
            }}
            onSignOut={logoutUser}
            onSignIn={signInWithGoogle}
          />
        )}
      </main>

      {/* Screen 3: Schedule Review Modal */}
      {showReviewModal && activeItinerary && (
        <ScheduleReviewModal
          itinerary={activeItinerary}
          onClose={() => setShowReviewModal(false)}
          onConfirmSync={() => {
            setIsCalendarConnected(true);
          }}
          onUpdateItinerary={handleUpdateItinerary}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
