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
  "A 5-day foodie adventure in Tokyo with a focus on hidden ramen shops",
  "Kyoto spiritual escape visiting quiet gardens and tea houses",
  "Bali relaxing 4-day wellness itinerary with yoga and sound baths",
  "Paris artistic weekend exploring secret vintage boutiques and wine bars"
];

export const PromptGeniusInput: React.FC<PromptGeniusInputProps> = ({
  formData,
  onChange,
  onSwitchMode,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="neobrutal-card p-6 sm:p-8 w-full max-w-4xl mx-auto relative">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex bg-[#f5f3ee] p-1.5 gap-2 border-2 border-[#1b1c19] rounded-none">
          <button
            type="button"
            onClick={() => onSwitchMode('structured')}
            className="px-5 py-2.5 rounded-none font-headline text-xs font-black uppercase tracking-wider transition-all text-[#3b4949] hover:text-[#00696b] border-2 border-transparent hover:border-[#1b1c19]"
          >
            Structured
          </button>
          <button
            type="button"
            className="px-5 py-2.5 rounded-none font-headline text-xs font-black uppercase tracking-wider transition-all bg-[#00696b] text-white border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]"
          >
            AI Prompt Genius
          </button>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="flex flex-col gap-2 mb-6">
        <label className="text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase ml-1">
          Your Dream Trip Prompt
        </label>
        <div className="relative">
          <textarea
            value={formData.prompt}
            onChange={(e) => onChange({ ...formData, prompt: e.target.value })}
            placeholder="e.g., A 5-day foodie adventure in Tokyo with a focus on hidden ramen shops..."
            className="w-full p-4 sm:p-5 bg-white border-2 border-[#1b1c19] focus:border-[#00696b] focus:shadow-[3px_3px_0px_0px_#00696b] outline-none font-body text-base sm:text-lg text-[#1b1c19] placeholder:text-[#6b7a7a] transition-all min-h-[190px] resize-none rounded-none shadow-[2px_2px_0px_0px_#1b1c19] font-bold"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 text-xs font-headline font-black uppercase tracking-wider text-[#00696b] bg-white px-3 py-1 border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] rounded-none pointer-events-none">
            <span className="material-symbols-outlined text-base text-[#00696b]">
              auto_awesome
            </span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Quick Prompt Starters */}
      <div className="mb-8">
        <p className="text-xs font-headline font-black text-[#6b7a7a] uppercase tracking-wider mb-2 ml-1">
          Inspiration Starters
        </p>
        <div className="flex flex-wrap gap-2">
          {PROMPT_STARTERS.map((starter, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChange({ ...formData, prompt: starter.replace(/^[^\s]+\s/, '') })}
              className="text-xs sm:text-sm bg-white hover:bg-[#00ced1]/15 text-[#3b4949] hover:text-[#00696b] px-3.5 py-2 transition-all border-2 border-[#1b1c19] font-bold rounded-none shadow-[2px_2px_0px_0px_#1b1c19] hover:-translate-y-0.5 active:translate-y-0 text-left"
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
          disabled={isLoading}
          className="w-full md:w-auto neobrutal-btn-terracotta px-10 py-4 font-headline font-black text-lg sm:text-xl flex items-center justify-center gap-3 rounded-none uppercase shadow-[4px_4px_0px_0px_#1b1c19] disabled:opacity-75 disabled:cursor-not-allowed"
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
