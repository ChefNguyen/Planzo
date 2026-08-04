import React from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { PromptFormData } from '../types';

interface PromptGeniusInputProps {
  formData: PromptFormData;
  onChange: (data: PromptFormData) => void;
  onSwitchMode: (mode: 'structured' | 'prompt') => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const PROMPT_STARTERS = [
  "⛩️ A 5-day foodie adventure in Tokyo with a focus on hidden ramen shops",
  "🌸 Kyoto spiritual escape visiting quiet gardens and tea houses",
  "🏖️ Bali relaxing 4-day wellness itinerary with yoga and sound baths",
  "🍷 Paris artistic weekend exploring secret vintage boutiques and wine bars"
];

export const PromptGeniusInput: React.FC<PromptGeniusInputProps> = ({
  formData,
  onChange,
  onSwitchMode,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="glass-card rounded-[24px] p-6 sm:p-8 w-full max-w-4xl mx-auto transition-all shadow-xl">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex bg-[#f5f3ee] p-1 rounded-xl gap-1 border border-[#bac9c9]/30">
          <button
            type="button"
            onClick={() => onSwitchMode('structured')}
            className="px-5 py-2 rounded-lg font-headline text-sm font-semibold transition-all text-[#3b4949] hover:text-[#00696b]"
          >
            Structured
          </button>
          <button
            type="button"
            className="px-5 py-2 rounded-lg font-headline text-sm font-semibold transition-all bg-white shadow-xs text-[#00696b]"
          >
            AI Prompt Genius
          </button>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-xs font-semibold tracking-wider text-[#3b4949] uppercase ml-1">
          Your Dream Trip Prompt
        </label>
        <div className="relative">
          <textarea
            value={formData.prompt}
            onChange={(e) => onChange({ ...formData, prompt: e.target.value })}
            placeholder="e.g., A 5-day foodie adventure in Tokyo with a focus on hidden ramen shops..."
            className="w-full p-4 sm:p-5 bg-white/60 border-2 border-[#bac9c9] focus:border-[#00ced1] focus:bg-white focus:outline-none rounded-xl font-body text-base sm:text-lg text-[#1b1c19] placeholder:text-[#6b7a7a] transition-all min-h-[190px] resize-none shadow-2xs"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-medium text-[#6b7a7a] bg-white/80 px-2.5 py-1 rounded-full border border-[#bac9c9]/40 pointer-events-none">
            <span className="material-symbols-outlined text-base text-[#00696b]">
              auto_awesome
            </span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Starters */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-[#6b7a7a] uppercase mb-2 ml-1">
          Inspiration Starters
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_STARTERS.map((starter, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange({ ...formData, prompt: starter.replace(/^[^\s]+\s/, '') })}
              className="text-xs sm:text-sm bg-[#f5f3ee] hover:bg-[#eae8e3] text-[#3b4949] hover:text-[#00696b] px-3.5 py-2 rounded-xl transition-all border border-[#bac9c9]/30 text-left"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Generate Action Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !formData.prompt.trim()}
          className="w-full md:w-auto bg-[#fe7e4f] hover:bg-[#a43c12] text-white px-10 py-4 rounded-2xl font-headline font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
              <span>Synthesizing Vibe...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-2xl">bolt</span>
              <span>Generate My Itinerary</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
