import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Calendar,
  Check,
  Search,
  ChevronDown,
  Clock,
  X,
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

  // Calculate Duration in Days & Nights (Local Time, Stricter Format)
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return { days: 0, nights: 0, durationText: '', formatted: '' };

    const parseLocalDate = (dateStr: string) => {
      const parts = dateStr.split('-').map(Number);
      if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      return new Date(dateStr);
    };

    const d1 = parseLocalDate(start);
    const d2 = parseLocalDate(end);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.max(1, Math.round(diffTime / (1000 * 3600 * 24)) + 1);
    const nights = Math.max(0, diffDays - 1);

    const formatDateStr = (dateObj: Date) => {
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const durationText = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} • ${nights} ${nights === 1 ? 'night' : 'nights'}`;
    const formatted = `${formatDateStr(d1)} - ${formatDateStr(d2)} (${durationText})`;
    return { days: diffDays, nights, durationText, formatted };
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

  const selectVibe = (vibe: string) => {
    const isSelected = formData.selectedVibes.includes(vibe);
    const selectedVibes = isSelected
      ? formData.selectedVibes.filter((selected) => selected !== vibe)
      : [...formData.selectedVibes, vibe];

    if (selectedVibes.length === 0) return;

    onChange({
      ...formData,
      selectedVibes,
    });
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
    <div className="neobrutal-card p-6 sm:p-8 w-full max-w-4xl mx-auto relative">
      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex bg-[#f5f3ee] p-1.5 gap-2 border-2 border-[#1b1c19] rounded-none">
          <button
            type="button"
            className="px-5 py-2.5 rounded-none font-headline text-xs font-black uppercase tracking-wider transition-all bg-[#00696b] text-white border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]"
          >
            Structured
          </button>
          <button
            type="button"
            onClick={() => onSwitchMode('prompt')}
            className="px-5 py-2.5 rounded-none font-headline text-xs font-black uppercase tracking-wider transition-all text-[#3b4949] hover:text-[#00696b] border-2 border-transparent hover:border-[#1b1c19]"
          >
            AI Prompt Genius
          </button>
        </div>
      </div>

      {/* Destination & Dates Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* DESTINATION FIELD WITH AUTOCOMPLETE SEARCH */}
        <div className="flex flex-col gap-2 relative" ref={destDropdownRef}>
          <label className="text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase ml-1 flex items-center justify-between">
            <span>Destination</span>
            {formData.destination && (
              <span className="text-[10px] text-[#00696b] normal-case font-extrabold">
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
              className="w-full pl-12 pr-10 py-3.5 bg-white border-2 border-[#1b1c19] focus:border-[#00696b] focus:shadow-[3px_3px_0px_0px_#00696b] outline-none font-body text-base text-[#1b1c19] placeholder:text-[#6b7a7a] transition-all rounded-none shadow-[2px_2px_0px_0px_#1b1c19] font-bold"
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

          {/* AUTOCOMPLETE POPUP DROPDOWN (HARD NEOBRUTALISM) */}
          {isDestFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white text-[#1b1c19] rounded-none shadow-[4px_4px_0px_0px_#1b1c19] border-2 border-[#1b1c19] p-3 max-h-80 overflow-y-auto animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-extrabold text-[#00696b] uppercase tracking-wider border-b-2 border-[#1b1c19]/20 mb-2">
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
                      className="p-2.5 rounded-none hover:bg-[#f5f3ee] cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-[#1b1c19] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-[#00696b]/10 border border-[#00696b]/30 flex items-center justify-center rounded-none shrink-0">
                          <MapPin className="w-3.5 h-3.5 text-[#00696b]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#1b1c19] group-hover:text-[#00696b] transition-colors">
                            {dest.name}
                          </h4>
                          <span className="text-[10px] text-[#6b7a7a]">{dest.country}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-headline font-black uppercase text-[#00696b] bg-[#00ced1]/15 px-2.5 py-0.5 rounded-none border border-[#00696b]/30">
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
                    className="px-4 py-1.5 bg-[#00696b] text-white rounded-none text-xs font-bold border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]"
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
          <label className="text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase ml-1 flex items-center justify-between">
            <span>Trip Dates & Duration</span>
            {currentDurationInfo.days > 0 && (
              <span className="text-[10px] font-extrabold text-[#a43c12] bg-[#a43c12]/10 px-2 py-0.5 rounded-none border border-[#a43c12]/30">
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
              className="w-full pl-12 pr-10 py-3 bg-white border-2 border-[#1b1c19] focus:border-[#00696b] focus:outline-none rounded-none font-body text-base text-[#1b1c19] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#1b1c19] font-bold"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7a7a] w-4 h-4 pointer-events-none" />
          </div>

          {/* DURATION & DATE RANGE PICKER OVERLAY (HARD NEOBRUTALISM) */}
          {isDatePickerOpen && (
            <div className="absolute top-full right-0 left-0 sm:left-auto sm:w-[380px] mt-2 z-50 bg-white text-[#1b1c19] rounded-none shadow-[5px_5px_0px_0px_#00696b] border-2 border-[#1b1c19] p-5 space-y-4 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#1b1c19]/20">
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
                <span className="block text-[11px] font-headline font-black text-[#00696b] uppercase tracking-wider mb-2">
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
                      className={`py-2 px-2 text-center rounded-none text-xs font-bold transition-all border-2 border-[#1b1c19] ${activePreset === preset.label
                        ? 'bg-[#00696b] text-white shadow-[2px_2px_0px_0px_#1b1c19]'
                        : 'bg-[#f5f3ee] text-[#3b4949] hover:bg-[#eae8e3]'
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
                    className="w-full px-3 py-2 rounded-none bg-white border-2 border-[#1b1c19] text-xs font-semibold text-[#1b1c19] focus:outline-none"
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
                    className="w-full px-3 py-2 rounded-none bg-white border-2 border-[#1b1c19] text-xs font-semibold text-[#1b1c19] focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated Summary Box */}
              {currentDurationInfo.days > 0 && (
                <div className="p-3 bg-[#00ced1]/15 rounded-none border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-bold text-[#005354] uppercase tracking-wider">
                      Calculated Schedule
                    </span>
                    <span className="text-xs font-bold text-[#1b1c19]">
                      {currentDurationInfo.formatted}
                    </span>
                  </div>
                  <span className="text-xs font-black text-[#00696b] bg-white px-2.5 py-1 rounded-none border border-[#1b1c19]">
                    {currentDurationInfo.nights} Nights
                  </span>
                </div>
              )}

              {/* Apply Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleApplyDates}
                  className="neobrutal-btn-teal w-full py-2.5 text-xs font-headline font-black uppercase tracking-wider rounded-none flex items-center justify-center gap-1.5"
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
        <p className="text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase mb-3 ml-1">
          Select your travel vibes ({formData.selectedVibes.length} selected)
        </p>
        <div className="flex flex-wrap gap-2.5">
          {AVAILABLE_VIBES.slice(0, showMoreVibes ? AVAILABLE_VIBES.length : 5).map((vibe) => {
            const isSelected = formData.selectedVibes.includes(vibe);
            return (
              <button
                key={vibe}
                type="button"
                onClick={() => selectVibe(vibe)}
                className={`px-5 py-2.5 rounded-none border-2 border-[#1b1c19] transition-all font-headline font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isSelected
                  ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                  : 'bg-white text-[#1b1c19] hover:bg-[#f5f3ee]'
                  }`}
              >
                <span>{vibe}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowMoreVibes(!showMoreVibes)}
            className="px-5 py-2.5 rounded-none border-2 border-[#1b1c19] text-[#00696b] font-headline font-black text-xs uppercase tracking-wider hover:bg-[#00ced1]/10 transition-all flex items-center gap-1 bg-white"
          >
            <span>{showMoreVibes ? 'Show Less' : '+ More Vibes'}</span>
          </button>
        </div>
      </div>

      {/* Budget Level & Travel Pace Controls */}
      <div className="space-y-6 mb-8 pt-4 border-t-2 border-[#1b1c19]/20">
        {/* Budget Level */}
        <div>
          <label className="block text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase mb-3 ml-1">
            Budget Tier
          </label>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'Budget', label: 'Budget' },
              { id: 'Mid-range', label: 'Mid-range' },
              { id: 'Luxury', label: 'Luxury' },
            ].map((item) => {
              const active = (formData.budgetLevel || 'Mid-range') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ ...formData, budgetLevel: item.id as any })}
                  className={`px-5 py-2.5 rounded-none border-2 border-[#1b1c19] transition-all font-headline font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${active
                    ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                    : 'bg-white text-[#1b1c19] hover:bg-[#f5f3ee]'
                    }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Pace */}
        <div>
          <label className="block text-xs font-headline font-black tracking-wider text-[#3b4949] uppercase mb-3 ml-1">
            Travel Pace
          </label>
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'Relaxed', label: 'Relaxed' },
              { id: 'Moderate', label: 'Moderate' },
              { id: 'Fast-Paced', label: 'Fast-Paced' },
            ].map((item) => {
              const active = (formData.travelPace || 'Moderate') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange({ ...formData, travelPace: item.id as any })}
                  className={`px-5 py-2.5 rounded-none border-2 border-[#1b1c19] transition-all font-headline font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${active
                    ? 'bg-[#00696b] text-white shadow-[3px_3px_0px_0px_#1b1c19]'
                    : 'bg-white text-[#1b1c19] hover:bg-[#f5f3ee]'
                    }`}
                >
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Action Button */}
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="neobrutal-btn-terracotta w-full md:w-auto px-10 py-4 font-headline font-black text-lg sm:text-xl flex items-center justify-center gap-3 rounded-none uppercase shadow-[4px_4px_0px_0px_#1b1c19] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
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
