import React, { useState } from 'react';
import { Sparkles, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

interface VibeCheckViewProps {
  onApplyVibe: (vibes: string[], destination: string) => void;
}

interface MoodOption {
  label: string;
  vibes: string[];
  suggestedDest: string;
}

interface PaceOption {
  label: string;
  pace: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { label: "🧘 Deep Serenity & Tea Rituals", vibes: ["Relax", "Spiritual", "Wellness"], suggestedDest: "Kyoto, Japan" },
  { label: "🍜 Midnight Alleyways & Street Food", vibes: ["Foodie", "Nightlife"], suggestedDest: "Tokyo, Japan" },
  { label: "🌋 Coastal Hikes & Waterfall Drops", vibes: ["Adventure", "Nature"], suggestedDest: "Ubud, Bali" },
  { label: "🎨 Vintage Boutiques & Art Cafes", vibes: ["Art & Design", "Culture"], suggestedDest: "Paris, France" },
];

const PACE_OPTIONS: PaceOption[] = [
  { label: "⚡ High Energy (Pack every hour!)", pace: "Packed" },
  { label: "🍃 Balanced Flow (2-3 stops a day)", pace: "Balanced" },
  { label: "☕ Slow & Unhurried (Lots of lounge time)", pace: "Chill" },
];

export const VibeCheckView: React.FC<VibeCheckViewProps> = ({ onApplyVibe }) => {
  const [q1Selected, setQ1Selected] = useState<number | null>(null);
  const [q2Selected, setQ2Selected] = useState<number | null>(null);

  const handleGenerateFromQuiz = () => {
    if (q1Selected === null) return;
    const choice = MOOD_OPTIONS[q1Selected];
    onApplyVibe(choice.vibes, choice.suggestedDest);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 min-h-[70vh]">
      <div className="text-center mb-10">
        <span className="text-xs font-bold text-[#00696b] bg-[#00ced1]/20 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
          AI Vibe Matcher
        </span>
        <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-[#00696b]">
          Find Your Travel Vibe
        </h2>
        <p className="text-sm text-[#3b4949] mt-2 max-w-lg mx-auto">
          Answer 2 quick mood questions to let Planzo AI diagnose your perfect escape profile.
        </p>
      </div>

      <div className="space-y-8">
        {/* Question 1 */}
        <div className="glass-card rounded-2xl p-6 border border-[#bac9c9]/30">
          <h3 className="font-headline font-bold text-lg text-[#1b1c19] mb-4">
            1. What's your current ideal travel mood?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MOOD_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setQ1Selected(idx)}
                className={`p-4 rounded-xl text-left text-sm font-semibold transition-all border ${
                  q1Selected === idx
                    ? 'bg-[#00696b] text-white border-[#00696b] shadow-sm'
                    : 'bg-white/80 text-[#3b4949] border-[#bac9c9]/40 hover:border-[#00696b]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="glass-card rounded-2xl p-6 border border-[#bac9c9]/30">
          <h3 className="font-headline font-bold text-lg text-[#1b1c19] mb-4">
            2. How active do you want your schedule to be?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PACE_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setQ2Selected(idx)}
                className={`p-4 rounded-xl text-center text-sm font-semibold transition-all border ${
                  q2Selected === idx
                    ? 'bg-[#00696b] text-white border-[#00696b] shadow-sm'
                    : 'bg-white/80 text-[#3b4949] border-[#bac9c9]/40 hover:border-[#00696b]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="text-center pt-4">
          <button
            onClick={handleGenerateFromQuiz}
            disabled={q1Selected === null}
            className="bg-[#fe7e4f] hover:bg-[#a43c12] disabled:opacity-50 text-white px-8 py-4 rounded-2xl font-headline font-bold text-lg shadow-lg hover:scale-102 active:scale-98 transition-all inline-flex items-center gap-2"
          >
            <span>Diagnose My Vibe & Generate</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
