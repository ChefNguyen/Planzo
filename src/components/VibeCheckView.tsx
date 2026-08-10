import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  MapPin,
  Zap,
  Flame,
  Heart,
  Users,
  DollarSign,
  Award,
  Feather,
  UtensilsCrossed,
  Palette,
  Waves,
  Landmark,
  Wind,
  Coffee,
  Wallet,
  CreditCard,
  Crown,
  User,
  Home,
} from 'lucide-react';

interface VibeCheckViewProps {
  onApplyVibe: (vibes: string[], destination: string, pace?: string, budget?: string) => void;
}

interface MoodOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  vibes: string[];
  suggestedDest: string;
  altDest: string;
  personaTitle: string;
  description: string;
}

interface PaceOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  pace: string;
  desc: string;
}

interface BudgetOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  budget: string;
}

interface CompanionOption {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'zen',
    label: 'Zen & Spiritual Rituals',
    icon: Feather,
    vibes: ['Relax', 'Spiritual', 'Wellness', 'Nature'],
    suggestedDest: 'Kyoto, Japan',
    altDest: 'Ubud, Bali',
    personaTitle: 'The Mindful Serenity Seeker',
    description: 'Tranquil bamboo groves, traditional tea rituals, and peaceful morning temples.',
  },
  {
    id: 'foodie',
    label: 'Midnight Alleyways & Street Eats',
    icon: UtensilsCrossed,
    vibes: ['Foodie', 'Nightlife', 'Culture', 'Local Eats'],
    suggestedDest: 'Tokyo, Japan',
    altDest: 'Seoul, South Korea',
    personaTitle: 'The Culinary Nocturne Adventurer',
    description: 'Sizzling food stalls, hidden alleyways, authentic izakayas, and vibrant nightlife.',
  },
  {
    id: 'adventure',
    label: 'Coastal Hikes & Mountain Trails',
    icon: Compass,
    vibes: ['Adventure', 'Nature', 'Hiking', 'Ocean'],
    suggestedDest: 'Da Nang, Vietnam',
    altDest: 'Queenstown, New Zealand',
    personaTitle: 'The High-Octane Thrillseeker',
    description: 'Panoramic mountain peaks, coastal trails, ocean waves, and outdoor adrenaline.',
  },
  {
    id: 'art',
    label: 'Vintage Boutiques & Art Cafes',
    icon: Palette,
    vibes: ['Art & Design', 'Culture', 'Architecture', 'Cafes'],
    suggestedDest: 'Paris, France',
    altDest: 'Florence, Italy',
    personaTitle: 'The Bohemian Cultural Aficionado',
    description: 'Cobblestone streets, art galleries, vintage boutiques, and espresso lounging.',
  },
  {
    id: 'beach',
    label: 'Golden Sunset & Coastal Lounge',
    icon: Waves,
    vibes: ['Relax', 'Coastal', 'Sunset', 'Luxury'],
    suggestedDest: 'Phuket, Thailand',
    altDest: 'Santorini, Greece',
    personaTitle: 'The Tropical Sunset Hedonist',
    description: 'Turquoise waters, beachside cabanas, fresh seafood, and golden hour views.',
  },
  {
    id: 'history',
    label: 'Historic Castles & Ancient Ruins',
    icon: Landmark,
    vibes: ['History', 'Architecture', 'Culture', 'Hidden Gems'],
    suggestedDest: 'Prague, Czechia',
    altDest: 'Rome, Italy',
    personaTitle: 'The Time-Traveling Historian',
    description: 'Ancient fortresses, medieval architecture, mythic folklore, and timeless heritage.',
  },
];

const PACE_OPTIONS: PaceOption[] = [
  { id: 'fast', label: 'High Energy', icon: Zap, pace: 'Packed', desc: 'Pack every hour with activities' },
  { id: 'moderate', label: 'Balanced Flow', icon: Wind, pace: 'Moderate', desc: '2-3 stops per day + free time' },
  { id: 'slow', label: 'Slow & Unhurried', icon: Coffee, pace: 'Relaxed', desc: 'Zero rush & lots of lounge time' },
];

const BUDGET_OPTIONS: BudgetOption[] = [
  { id: 'budget', label: 'Smart Explorer', icon: Wallet, budget: 'Budget-friendly' },
  { id: 'mid', label: 'Boutique Comfort', icon: CreditCard, budget: 'Mid-range' },
  { id: 'luxury', label: 'Luxury Indulgence', icon: Crown, budget: 'Luxury' },
];

const COMPANION_OPTIONS: CompanionOption[] = [
  { id: 'solo', label: 'Solo Voyager', icon: User },
  { id: 'couple', label: 'Romantic Duo', icon: Heart },
  { id: 'friends', label: 'Friends Squad', icon: Users },
  { id: 'family', label: 'Family Trip', icon: Home },
];

export const VibeCheckView: React.FC<VibeCheckViewProps> = ({ onApplyVibe }) => {
  const [q1Selected, setQ1Selected] = useState<string>('zen');
  const [q2Selected, setQ2Selected] = useState<string>('moderate');
  const [q3Selected, setQ3Selected] = useState<string>('mid');
  const [q4Selected, setQ4Selected] = useState<string>('solo');
  const [diagnosedResult, setDiagnosedResult] = useState<MoodOption | null>(null);

  const selectedMoodObj = MOOD_OPTIONS.find((m) => m.id === q1Selected) || MOOD_OPTIONS[0];
  const selectedPaceObj = PACE_OPTIONS.find((p) => p.id === q2Selected) || PACE_OPTIONS[1];
  const selectedBudgetObj = BUDGET_OPTIONS.find((b) => b.id === q3Selected) || BUDGET_OPTIONS[1];

  const handleDiagnose = () => {
    setDiagnosedResult(selectedMoodObj);
  };

  const handleApplyAndGenerate = (dest: string, vibes: string[]) => {
    onApplyVibe(vibes, dest, selectedPaceObj.pace, selectedBudgetObj.budget);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#a43c12] text-white border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] font-headline font-black text-xs uppercase tracking-wider rounded-none">
          <Sparkles className="w-4 h-4 fill-current text-amber-300" />
          <span>Planzo AI Vibe Matcher</span>
        </div>
        <h1 className="font-headline font-extrabold text-3xl sm:text-5xl text-[#00696b] tracking-tight leading-tight">
          Discover Your True Travel Persona
        </h1>
        <p className="text-sm sm:text-base text-[#3b4949] max-w-xl mx-auto leading-relaxed font-medium">
          Answer 4 quick mood prompts to let Planzo AI diagnose your ideal escape profile and recommend tailored destinations.
        </p>
      </div>

      {/* Quiz or Diagnosis Result */}
      {!diagnosedResult ? (
        <div className="space-y-8">
          {/* Question 1: Mood */}
          <div className="bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] p-6 sm:p-8 rounded-none space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-[#00696b] text-white font-headline font-black text-xs flex items-center justify-center border border-[#1b1c19]">
                1
              </span>
              <h2 className="font-headline font-extrabold text-lg sm:text-xl text-[#1b1c19]">
                What is your ideal travel atmosphere & energy?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {MOOD_OPTIONS.map((opt) => {
                const isSel = q1Selected === opt.id;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setQ1Selected(opt.id)}
                    className={`p-4 text-left border-2 border-[#1b1c19] transition-all flex flex-col justify-between rounded-none ${
                      isSel
                        ? 'bg-[#00696b] text-white shadow-[4px_4px_0px_0px_#1b1c19] -translate-y-0.5'
                        : 'bg-[#f5f3ee] text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-white hover:-translate-y-0.5'
                    }`}
                  >
                    <div>
                      <div className="font-headline font-bold text-sm sm:text-base flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <IconComp className={`w-4 h-4 ${isSel ? 'text-amber-300' : 'text-[#00696b]'}`} />
                          <span>{opt.label}</span>
                        </div>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-2" />}
                      </div>
                      <p className={`text-xs mt-2 leading-relaxed font-medium ${isSel ? 'text-teal-100' : 'text-[#6b7a7a]'}`}>
                        {opt.description}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[#1b1c19]/20 flex items-center justify-between text-[11px]">
                      <span className={`font-bold ${isSel ? 'text-amber-200' : 'text-[#00696b]'}`}>
                        Suggested: {opt.suggestedDest}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Pace */}
          <div className="bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] p-6 sm:p-8 rounded-none space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 bg-[#00696b] text-white font-headline font-black text-xs flex items-center justify-center border border-[#1b1c19]">
                2
              </span>
              <h2 className="font-headline font-extrabold text-lg sm:text-xl text-[#1b1c19]">
                How active do you want your schedule pace to be?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PACE_OPTIONS.map((opt) => {
                const isSel = q2Selected === opt.id;
                const IconComp = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setQ2Selected(opt.id)}
                    className={`p-4 text-left border-2 border-[#1b1c19] transition-all rounded-none ${
                      isSel
                        ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                        : 'bg-[#f5f3ee] text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-white'
                    }`}
                  >
                    <div className="font-headline font-bold text-sm flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComp className={`w-4 h-4 ${isSel ? 'text-amber-300' : 'text-[#00696b]'}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${isSel ? 'text-teal-100' : 'text-[#6b7a7a]'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3 & 4 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Question 3: Budget */}
            <div className="bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] p-6 rounded-none space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#00696b] text-white font-headline font-black text-xs flex items-center justify-center border border-[#1b1c19]">
                  3
                </span>
                <h2 className="font-headline font-bold text-base text-[#1b1c19]">
                  Select Budget Comfort Level
                </h2>
              </div>
              <div className="space-y-2">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSel = q3Selected === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setQ3Selected(opt.id)}
                      className={`w-full p-3 text-left border-2 border-[#1b1c19] font-bold text-xs flex items-center justify-between transition-all rounded-none ${
                        isSel
                          ? 'bg-[#00696b] text-white shadow-[2px_2px_0px_0px_#1b1c19]'
                          : 'bg-[#f5f3ee] text-[#1b1c19] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <IconComp className={`w-4 h-4 ${isSel ? 'text-amber-300' : 'text-[#00696b]'}`} />
                        <span>{opt.label}</span>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question 4: Companion */}
            <div className="bg-white border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] p-6 rounded-none space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-[#00696b] text-white font-headline font-black text-xs flex items-center justify-center border border-[#1b1c19]">
                  4
                </span>
                <h2 className="font-headline font-bold text-base text-[#1b1c19]">
                  Who is traveling with you?
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {COMPANION_OPTIONS.map((opt) => {
                  const isSel = q4Selected === opt.id;
                  const IconComp = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setQ4Selected(opt.id)}
                      className={`p-3 text-left border-2 border-[#1b1c19] font-bold text-xs flex items-center justify-between transition-all rounded-none ${
                        isSel
                          ? 'bg-[#00696b] text-white shadow-[2px_2px_0px_0px_#1b1c19]'
                          : 'bg-[#f5f3ee] text-[#1b1c19] hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <IconComp className={`w-3.5 h-3.5 shrink-0 ${isSel ? 'text-amber-300' : 'text-[#00696b]'}`} />
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="text-center pt-4">
            <button
              onClick={handleDiagnose}
              className="bg-[#a43c12] text-white hover:bg-[#8e330f] px-10 py-4 font-headline font-black text-lg uppercase tracking-wider border-2 border-[#1b1c19] shadow-[5px_5px_0px_0px_#1b1c19] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0 transition-all inline-flex items-center gap-3 rounded-none"
            >
              <Sparkles className="w-5 h-5 fill-current text-amber-300" />
              <span>Diagnose My Vibe Profile</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Diagnosis Result Screen */
        <div className="bg-white border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] p-6 sm:p-10 rounded-none space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#1b1c19] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00ced1]/20 border border-[#00696b] text-[#00696b] font-headline font-black text-xs uppercase tracking-wider mb-2 rounded-none">
                <Award className="w-3.5 h-3.5" />
                <span>98% Vibe Match Match</span>
              </div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#1b1c19]">
                {diagnosedResult.personaTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#3b4949] mt-1 font-medium">
                {diagnosedResult.description}
              </p>
            </div>

            <button
              onClick={() => setDiagnosedResult(null)}
              className="px-4 py-2 bg-[#f5f3ee] text-[#1b1c19] font-headline font-black text-xs uppercase border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:bg-gray-100 flex items-center gap-2 shrink-0 rounded-none"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>
          </div>

          {/* Recommended Destinations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Primary Recommendation */}
            <div className="bg-[#fbf9f4] border-2 border-[#1b1c19] p-5 shadow-[4px_4px_0px_0px_#00696b] rounded-none space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-headline font-black uppercase tracking-wider text-white bg-[#00696b] px-2.5 py-1 border border-[#1b1c19]">
                  Top Match #1
                </span>
                <span className="text-xs font-bold text-[#00696b] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Primary
                </span>
              </div>

              <div>
                <h3 className="font-headline font-black text-xl text-[#1b1c19]">
                  {diagnosedResult.suggestedDest}
                </h3>
                <p className="text-xs text-[#6b7a7a] mt-1 font-medium">
                  Matches your preference for {selectedPaceObj.label} pace & {selectedBudgetObj.label}.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {diagnosedResult.vibes.map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white border border-[#1b1c19] text-[#1b1c19] text-[10px] font-extrabold uppercase rounded-none"
                  >
                    #{v}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleApplyAndGenerate(diagnosedResult.suggestedDest, diagnosedResult.vibes)}
                className="w-full py-3 bg-[#00696b] text-white font-headline font-black text-xs uppercase tracking-wider border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 rounded-none"
              >
                <span>Generate {diagnosedResult.suggestedDest} Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Alternative Recommendation */}
            <div className="bg-[#fbf9f4] border-2 border-[#1b1c19] p-5 shadow-[4px_4px_0px_0px_#a43c12] rounded-none space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-headline font-black uppercase tracking-wider text-white bg-[#a43c12] px-2.5 py-1 border border-[#1b1c19]">
                  Alternative Match #2
                </span>
                <span className="text-xs font-bold text-[#a43c12] flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Secondary
                </span>
              </div>

              <div>
                <h3 className="font-headline font-black text-xl text-[#1b1c19]">
                  {diagnosedResult.altDest}
                </h3>
                <p className="text-xs text-[#6b7a7a] mt-1 font-medium">
                  An incredible alternative with rich vibe alignment for your travel crew.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {diagnosedResult.vibes.map((v, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-white border border-[#1b1c19] text-[#1b1c19] text-[10px] font-extrabold uppercase rounded-none"
                  >
                    #{v}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleApplyAndGenerate(diagnosedResult.altDest, diagnosedResult.vibes)}
                className="w-full py-3 bg-[#a43c12] text-white font-headline font-black text-xs uppercase tracking-wider border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 rounded-none"
              >
                <span>Generate {diagnosedResult.altDest} Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Archetypes Gallery */}
      <div className="pt-6 border-t-2 border-[#1b1c19]/20 space-y-4">
        <h3 className="font-headline font-black text-xl text-[#1b1c19] flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#00696b]" />
          <span>Or Quick-Apply Popular Travel Vibe Archetypes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOOD_OPTIONS.slice(0, 4).map((archetype) => {
            const IconComp = archetype.icon;
            return (
              <div
                key={archetype.id}
                className="bg-white border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] p-4 flex flex-col justify-between space-y-3 rounded-none hover:-translate-y-0.5 transition-all"
              >
                <div>
                  <div className="w-8 h-8 bg-[#00696b]/10 border border-[#00696b] flex items-center justify-center rounded-none text-[#00696b]">
                    <IconComp className="w-4 h-4 text-[#00696b]" />
                  </div>
                  <h4 className="font-headline font-extrabold text-sm text-[#1b1c19] mt-3">
                    {archetype.suggestedDest}
                  </h4>
                  <p className="text-[11px] text-[#6b7a7a] mt-1 line-clamp-2 font-medium">
                    {archetype.description}
                  </p>
                </div>

                <button
                  onClick={() => handleApplyAndGenerate(archetype.suggestedDest, archetype.vibes)}
                  className="w-full py-2 bg-[#f5f3ee] hover:bg-[#00696b] text-[#1b1c19] hover:text-white font-headline font-black text-[10px] uppercase border-2 border-[#1b1c19] transition-colors rounded-none flex items-center justify-center gap-1.5"
                >
                  <span>Apply Vibe</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
