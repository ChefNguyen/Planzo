import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Check,
  Search,
  ChevronDown,
  Clock,
  X,
  Globe,
  Sparkles,
  ArrowRight,
  Sun,
  Compass,
} from 'lucide-react';
import { StructuredFormData } from '../types';

interface StructuredInputProps {
  formData: StructuredFormData;
  onChange: (data: StructuredFormData) => void;
  onSwitchMode: (mode: 'structured' | 'prompt') => void;
  onSubmit: () => void;
  isLoading: boolean;
}

interface DestinationItem {
  name: string;
  country: string;
  vibeTag: string;
  flag: string;
}

const POPULAR_DESTINATIONS: DestinationItem[] = [
  { name: 'Tokyo, Japan', country: 'Japan', vibeTag: 'Culture & Ramen', flag: '🇯🇵' },
  { name: 'Kyoto, Japan', country: 'Japan', vibeTag: 'Zen & Temples', flag: '🇯🇵' },
  { name: 'Da Nang, Vietnam', country: 'Vietnam', vibeTag: 'Beaches & Street Food', flag: '🇻🇳' },
  { name: 'Paris, France', country: 'France', vibeTag: 'Art & Gastronomy', flag: '🇫🇷' },
  { name: 'Rome, Italy', country: 'Italy', vibeTag: 'History & Pasta', flag: '🇮🇹' },
  { name: 'Bali, Indonesia', country: 'Indonesia', vibeTag: 'Tropical & Wellness', flag: '🇮🇩' },
  { name: 'New York, USA', country: 'USA', vibeTag: 'Skyscrapers & Shows', flag: '🇺🇸' },
  { name: 'Santorini, Greece', country: 'Greece', vibeTag: 'Island Sunsets', flag: '🇬🇷' },
  { name: 'London, UK', country: 'UK', vibeTag: 'Museums & Heritage', flag: '🇬🇧' },
  { name: 'Seoul, South Korea', country: 'South Korea', vibeTag: 'K-Culture & Shopping', flag: '🇰🇷' },
  { name: 'Bangkok, Thailand', country: 'Thailand', vibeTag: 'Night Markets & Temples', flag: '🇹🇭' },
  { name: 'Barcelona, Spain', country: 'Spain', vibeTag: 'Architecture & Tapas', flag: '🇪🇸' },
  { name: 'Reykjavik, Iceland', country: 'Iceland', vibeTag: 'Northern Lights & Glaciers', flag: '🇮🇸' },
  { name: 'Oaxaca, Mexico', country: 'Mexico', vibeTag: 'Art, Food & Culture', flag: '🇲🇽' },
  { name: 'Sydney, Australia', country: 'Australia', vibeTag: 'Harbor & Beaches', flag: '🇦🇺' },
  { name: 'Cairo, Egypt', country: 'Egypt', vibeTag: 'Pyramids & History', flag: '🇪🇬' },
  { name: 'Singapore', country: 'Singapore', vibeTag: 'Futuristic Gardens & Food', flag: '🇸🇬' },
  { name: 'Amsterdam, Netherlands', country: 'Netherlands', vibeTag: 'Canals & Museums', flag: '🇳🇱' },
];

const AVAILABLE_VIBES = [
  'Adventure',
  'Foodie',
  'Relax',
  'Nightlife',
  'Budget',
  'Art & Design',
  'Hidden Gems',
  'Wellness',
  'Luxury',
  'Culture & History',
  'Romantic',
];

function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const StructuredInput: React.FC<StructuredInputProps> = ({
  formData,
  onChange,
  onSwitchMode,
  onSubmit,
  isLoading,
}) => {
  const [showMoreVibes, setShowMoreVibes] = useState(false);
  const [customVibeInput, setCustomVibeInput] = useState('');

  // Destination Search Overlay State & Live API Results
  const [isDestFocused, setIsDestFocused] = useState(false);
  const [apiSearchResults, setApiSearchResults] = useState<DestinationItem[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const destDropdownRef = useRef<HTMLDivElement>(null);

  // Live Geocoding Search Effect
  useEffect(() => {
    const query = formData.destination.trim();
    if (query.length < 2) {
      setApiSearchResults([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/places/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            const mapped: DestinationItem[] = data.results.map((item: any) => {
              return {
                name: item.name,
                country: item.formattedAddress || 'Worldwide',
                vibeTag: item.source === 'google' ? 'Google Place' : 'City',
                flag: '📍',
              };
            });
            setApiSearchResults(mapped);
          } else {
            setApiSearchResults([]);
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Destination API search notice:', err);
        }
      } finally {
        setIsSearchingApi(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [formData.destination]);

  // Date Range & Duration Picker Overlay State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Default dates for From-To calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultToDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(defaultToDate);
  const [activePreset, setActivePreset] = useState<string | null>('5 Days');

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        destDropdownRef.current &&
        !destDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDestFocused(false);
      }
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Destination Search filtering
  const filteredDestinations = POPULAR_DESTINATIONS.filter((item) => {
    const query = formData.destination.trim().toLowerCase();
    if (!query) return true;
    return (
      item.name.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query) ||
      item.vibeTag.toLowerCase().includes(query)
    );
  });

  const handleSelectDestination = (destName: string) => {
    onChange({ ...formData, destination: destName });
    setIsDestFocused(false);
  };

  // Calculate Duration in Days & Nights
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return { days: 0, nights: 0, formatted: '' };
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) + 1);
    const nights = Math.max(0, diffDays - 1);

    const formatDateStr = (dateObj: Date) => {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatted = `${formatDateStr(d1)} - ${formatDateStr(d2)} (${diffDays} Days)`;
    return { days: diffDays, nights, formatted };
  };

  // Sync date inputs to formData.dates
  const handleApplyDates = () => {
    const { formatted } = calculateDuration(fromDate, toDate);
    onChange({ ...formData, dates: formatted || `${fromDate} to ${toDate}` });
    setIsDatePickerOpen(false);
  };

  // Preset quick selections
  const handleSelectPreset = (daysCount: number, label: string) => {
    const start = new Date();
    const end = new Date(start.getTime() + (daysCount - 1) * 24 * 60 * 60 * 1000);
    const sStr = start.toISOString().split('T')[0];
    const eStr = end.toISOString().split('T')[0];

    setFromDate(sStr);
    setToDate(eStr);
    setActivePreset(label);

    const { formatted } = calculateDuration(sStr, eStr);
    onChange({ ...formData, dates: formatted });
  };

  const handleCustomDateChange = (type: 'from' | 'to', value: string) => {
    setActivePreset(null);
    if (type === 'from') {
      setFromDate(value);
      if (new Date(value) > new Date(toDate)) {
        // Auto bump To date if earlier than From date
        const bump = new Date(new Date(value).getTime() + 2 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        setToDate(bump);
      }
    } else {
      setToDate(value);
    }
  };

  const toggleVibe = (vibe: string) => {
    const exists = formData.selectedVibes.includes(vibe);
    if (exists) {
      onChange({
        ...formData,
        selectedVibes: formData.selectedVibes.filter((v) => v !== vibe),
      });
    } else {
      onChange({
        ...formData,
        selectedVibes: [...formData.selectedVibes, vibe],
      });
    }
  };

  const handleAddCustomVibe = (e: React.FormEvent) => {
    e.preventDefault();
    if (customVibeInput.trim() && !formData.selectedVibes.includes(customVibeInput.trim())) {
      onChange({
        ...formData,
        selectedVibes: [...formData.selectedVibes, customVibeInput.trim()],
      });
      setCustomVibeInput('');
    }
  };

  const currentDurationInfo = calculateDuration(fromDate, toDate);

  return (
    <div className="glass-card rounded-[24px] p-6 sm:p-8 w-full max-w-4xl mx-auto transition-all shadow-xl relative">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex bg-[#f5f3ee] p-1 rounded-xl gap-1 border border-[#bac9c9]/30">
          <button
            type="button"
            className="px-5 py-2 rounded-lg font-headline text-sm font-semibold transition-all bg-white shadow-xs text-[#00696b]"
          >
            Structured
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('prompt')}
            className="px-5 py-2 rounded-lg font-headline text-sm font-semibold transition-all text-[#3b4949] hover:text-[#00696b]"
          >
            AI Prompt Genius
          </button>
        </div>
      </div>

      {/* Destination & Dates Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* DESTINATION FIELD WITH AUTOCOMPLETE SEARCH */}
        <div className="flex flex-col gap-2 relative" ref={destDropdownRef}>
          <label className="text-xs font-bold tracking-wider text-[#3b4949] uppercase ml-1 flex items-center justify-between">
            <span>Destination</span>
            {formData.destination && (
              <span className="text-[10px] text-[#00696b] normal-case font-semibold">
                ✓ Ready to search
              </span>
            )}
          </label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00696b] w-5 h-5" />
            <input
              type="text"
              value={formData.destination}
              onFocus={() => setIsDestFocused(true)}
              onChange={(e) => {
                onChange({ ...formData, destination: e.target.value });
                setIsDestFocused(true);
              }}
              placeholder="Search city, e.g. Tokyo, Kyoto, Da Nang..."
              className="w-full pl-12 pr-10 py-3 bg-white/80 border-2 border-[#bac9c9] focus:border-[#00ced1] focus:bg-white focus:outline-none rounded-xl font-body text-base text-[#1b1c19] placeholder:text-[#6b7a7a] transition-all shadow-2xs font-medium"
            />
            {formData.destination ? (
              <button
                type="button"
                onClick={() => onChange({ ...formData, destination: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a7a] w-4 h-4 pointer-events-none" />
            )}
          </div>

          {/* AUTOCOMPLETE POPUP DROPDOWN */}
          {isDestFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-[#bac9c9]/40 p-3 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-extrabold text-[#00696b] uppercase tracking-wider border-b border-[#bac9c9]/20 mb-2">
                <span>
                  {formData.destination.trim().length >= 2
                    ? 'Global Search Results (Live API)'
                    : 'Popular Destinations'}
                </span>
                <span className="text-gray-400 font-normal">
                  {formData.destination.trim().length >= 2
                    ? `${apiSearchResults.length || filteredDestinations.length} Places`
                    : `${POPULAR_DESTINATIONS.length} Places`}
                </span>
              </div>

              {isSearchingApi ? (
                <div className="p-6 text-center text-xs text-[#6b7a7a] flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[#00696b] text-xl">
                    sync
                  </span>
                  <span>Searching global cities & regions...</span>
                </div>
              ) : (formData.destination.trim().length >= 2 ? apiSearchResults : filteredDestinations).length > 0 ? (
                <div className="space-y-1">
                  {(formData.destination.trim().length >= 2 && apiSearchResults.length > 0
                    ? apiSearchResults
                    : filteredDestinations
                  ).map((dest, idx) => (
                    <div
                      key={dest.name + idx}
                      onClick={() => handleSelectDestination(dest.name)}
                      className="p-2.5 rounded-xl hover:bg-[#f5f3ee] cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">{dest.flag}</span>
                        <div>
                          <h4 className="text-xs font-bold text-[#1b1c19] group-hover:text-[#00696b] transition-colors">
                            {dest.name}
                          </h4>
                          <span className="text-[10px] text-[#6b7a7a]">{dest.country}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#00696b] bg-[#00ced1]/15 px-2.5 py-0.5 rounded-full">
                        {dest.vibeTag}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-[#6b7a7a] space-y-2">
                  <p>No matching global city found. Use custom input:</p>
                  <button
                    type="button"
                    onClick={() => setIsDestFocused(false)}
                    className="px-4 py-1.5 bg-[#00696b] text-white rounded-lg text-xs font-bold shadow-2xs"
                  >
                    Use "{formData.destination}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DATES FIELD WITH DURATION & RANGE POPUP */}
        <div className="flex flex-col gap-2 relative" ref={datePickerRef}>
          <label className="text-xs font-bold tracking-wider text-[#3b4949] uppercase ml-1 flex items-center justify-between">
            <span>Trip Dates & Duration</span>
            {currentDurationInfo.days > 0 && (
              <span className="text-[10px] font-extrabold text-[#a43c12] bg-[#a43c12]/10 px-2 py-0.5 rounded-full">
                {currentDurationInfo.days} Days / {currentDurationInfo.nights} Nights
              </span>
            )}
          </label>

          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00696b] w-5 h-5 pointer-events-none" />
            <input
              type="text"
              readOnly
              value={formData.dates || 'Select Dates & Duration'}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="w-full pl-12 pr-10 py-3 bg-white/80 border-2 border-[#bac9c9] focus:border-[#00ced1] focus:bg-white focus:outline-none rounded-xl font-body text-base text-[#1b1c19] cursor-pointer transition-all shadow-2xs font-medium"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a7a] w-4 h-4 pointer-events-none" />
          </div>

          {/* DURATION & DATE RANGE PICKER OVERLAY */}
          {isDatePickerOpen && (
            <div className="absolute top-full right-0 left-0 sm:left-auto sm:w-[380px] mt-2 z-50 bg-white rounded-3xl shadow-2xl border border-[#bac9c9]/40 p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#bac9c9]/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#00696b]" />
                  <h3 className="font-headline font-bold text-sm text-[#1b1c19]">
                    Select Travel Duration
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Duration Presets */}
              <div>
                <span className="block text-[11px] font-bold text-[#00696b] uppercase tracking-wider mb-2">
                  Quick Duration Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '3 Days', count: 3 },
                    { label: '5 Days', count: 5 },
                    { label: '7 Days', count: 7 },
                    { label: '10 Days', count: 10 },
                    { label: '14 Days', count: 14 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset.count, preset.label)}
                      className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                        activePreset === preset.label
                          ? 'bg-[#00696b] text-white border-[#00696b] shadow-xs'
                          : 'bg-[#f5f3ee] text-[#3b4949] border-[#bac9c9]/30 hover:bg-[#eae8e3]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* From Date and To Date Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#3b4949] uppercase mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => handleCustomDateChange('from', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f3ee] border border-[#bac9c9]/40 text-xs font-semibold text-[#1b1c19] focus:outline-none focus:ring-2 focus:ring-[#00696b]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#3b4949] uppercase mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => handleCustomDateChange('to', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#f5f3ee] border border-[#bac9c9]/40 text-xs font-semibold text-[#1b1c19] focus:outline-none focus:ring-2 focus:ring-[#00696b]"
                  />
                </div>
              </div>

              {/* Calculated Summary Box */}
              {currentDurationInfo.days > 0 && (
                <div className="p-3 bg-[#00ced1]/15 rounded-2xl border border-[#00ced1]/30 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-[#005354] uppercase tracking-wider">
                      Calculated Schedule
                    </span>
                    <span className="text-xs font-bold text-[#1b1c19]">
                      {currentDurationInfo.formatted}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#00696b] bg-white px-2.5 py-1 rounded-full shadow-2xs">
                    {currentDurationInfo.nights} Nights
                  </span>
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyDates}
                  className="w-full py-2.5 bg-[#00696b] hover:bg-[#005354] text-white font-headline font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Travel Dates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Select Your Vibe */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-wider text-[#3b4949] uppercase mb-3 ml-1">
          Select your travel vibes ({formData.selectedVibes.length} selected)
        </p>
        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_VIBES.slice(0, showMoreVibes ? AVAILABLE_VIBES.length : 5).map((vibe) => {
            const isSelected = formData.selectedVibes.includes(vibe);
            return (
              <button
                key={vibe}
                type="button"
                onClick={() => toggleVibe(vibe)}
                className={`px-5 py-2.5 rounded-full border transition-all font-body text-base flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#00696b] bg-[#00696b] text-white font-medium shadow-xs scale-102'
                    : 'border-[#bac9c9] bg-white/50 text-[#1b1c19] hover:border-[#00696b] hover:text-[#00696b]'
                }`}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
                <span>{vibe}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowMoreVibes(!showMoreVibes)}
            className="px-5 py-2.5 rounded-full border border-[#bac9c9] text-[#00696b] font-bold text-base hover:bg-[#00ced1]/10 transition-all flex items-center gap-1"
          >
            <span>{showMoreVibes ? 'Show Less' : '+ More Vibes'}</span>
          </button>
        </div>

        {/* Custom vibe input form */}
        {showMoreVibes && (
          <form onSubmit={handleAddCustomVibe} className="mt-4 flex gap-2 max-w-md">
            <input
              type="text"
              value={customVibeInput}
              onChange={(e) => setCustomVibeInput(e.target.value)}
              placeholder="Add custom vibe (e.g. Anime, Vintage Shops)"
              className="flex-1 px-4 py-2 bg-white/80 border border-[#bac9c9] rounded-xl text-sm focus:outline-none focus:border-[#00696b]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#00696b] text-white rounded-xl text-xs font-bold hover:bg-[#005354]"
            >
              Add
            </button>
          </form>
        )}
      </div>

      {/* Generate Action Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full md:w-auto bg-[#fe7e4f] hover:bg-[#a43c12] text-white px-10 py-4 rounded-2xl font-headline font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-2xl">sync</span>
              <span>Crafting Your Escape...</span>
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
