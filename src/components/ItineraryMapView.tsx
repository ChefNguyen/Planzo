import React, { useState } from 'react';
import { Itinerary, Activity } from '../types';
import { MapPin, Calendar, Clock, Plus, Share2, Edit3, Trash2, ArrowLeft, ExternalLink, Check, Sparkles, Download } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';
import { createGoogleCalendarUrl, downloadItineraryIcs } from '../lib/googleCalendar';

interface ItineraryMapViewProps {
  itinerary: Itinerary;
  onOpenReviewModal: () => void;
  onBackToInput: () => void;
  onUpdateItinerary: (updated: Itinerary) => void;
}

export const ItineraryMapView: React.FC<ItineraryMapViewProps> = ({
  itinerary,
  onOpenReviewModal,
  onBackToInput,
  onUpdateItinerary,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    itinerary.days[0]?.activities[0]?.id || null
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('02:00 PM - 03:30 PM');
  const [newVibe, setNewVibe] = useState('Relaxed & Scenic');
  const [newLocation, setNewLocation] = useState(itinerary.destination);

  const currentDay = itinerary.days[selectedDayIndex] || itinerary.days[0];

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAct: Activity = {
      id: `act-new-${Date.now()}`,
      title: newTitle,
      time: newTime,
      vibe: newVibe,
      location: newLocation,
      category: 'culture'
    };

    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === selectedDayIndex) {
        return {
          ...day,
          activities: [...day.activities, newAct]
        };
      }
      return day;
    });

    const totalStops = updatedDays.reduce((acc, d) => acc + d.activities.length, 0);

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
      totalStops
    });

    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#fbf9f4] flex flex-col pt-20">
      {/* Top Banner Control */}
      <div className="bg-white/80 backdrop-blur-md border-b border-[#bac9c9]/30 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToInput}
            className="p-2 rounded-full hover:bg-black/5 text-[#3b4949] transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>New Vibe Search</span>
          </button>
          <div className="h-5 w-px bg-[#bac9c9]/50" />
          <div>
            <h2 className="font-headline font-extrabold text-lg sm:text-xl text-[#00696b]">
              {itinerary.destination}
            </h2>
            <p className="text-xs text-[#6b7a7a]">
              {itinerary.dates} • {itinerary.totalStops} Stops ({itinerary.activeHours} hrs)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadItineraryIcs(itinerary)}
            className="bg-white hover:bg-gray-50 text-[#00696b] border border-[#00696b]/30 px-3.5 py-2.5 rounded-full font-headline font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:scale-102 transition-all"
            title="Download .ics calendar file"
          >
            <Download className="w-4 h-4 text-[#00696b]" />
            <span className="hidden sm:inline">Export Calendar (.ics)</span>
          </button>

          <button
            onClick={onOpenReviewModal}
            className="bg-[#a43c12] hover:bg-[#fe7e4f] text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-102 active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
            <span>Review & Sync Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar & Interactive Map */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-140px)]">
        {/* Left Sidebar - Days & Activity List */}
        <div className="w-full lg:w-[42%] bg-white/60 p-4 sm:p-6 border-r border-[#bac9c9]/30 flex flex-col overflow-y-auto space-y-6">
          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {itinerary.days.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  if (day.activities[0]) setSelectedActivityId(day.activities[0].id);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedDayIndex === idx
                    ? 'bg-[#00696b] text-white border-[#00696b] shadow-xs'
                    : 'bg-white/80 text-[#3b4949] border-[#bac9c9]/40 hover:bg-white'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[10px] opacity-80">({day.activities.length})</span>
              </button>
            ))}
          </div>

          {/* Current Day Header */}
          <div className="flex items-center justify-between bg-[#f5f3ee] p-4 rounded-2xl border border-[#bac9c9]/20">
            <div>
              <span className="text-xs font-bold text-[#00696b] uppercase tracking-wider">
                Day {currentDay.dayNumber} Focus
              </span>
              <h3 className="font-headline font-bold text-lg text-[#1b1c19]">
                {currentDay.title}
              </h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-[#00ced1]/20 hover:bg-[#00ced1]/30 text-[#005354] rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stop</span>
            </button>
          </div>

          {/* Activities Timeline */}
          <div className="space-y-4">
            {currentDay.activities.map((act, idx) => {
              const isSelected = selectedActivityId === act.id;
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedActivityId(act.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white border-[#00696b] shadow-md ring-2 ring-[#00ced1]/30'
                      : 'bg-white/70 border-[#bac9c9]/30 hover:bg-white hover:border-[#00696b]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#00ced1]/20 text-[#00696b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#00696b] uppercase tracking-wider">
                          {act.time}
                        </span>
                        <a
                          href={createGoogleCalendarUrl(itinerary.destination, act, currentDay.dayNumber)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 text-[#6b7a7a] hover:text-[#00696b] transition-colors rounded hover:bg-black/5 flex items-center gap-1 text-[11px] font-medium"
                          title="Add to Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#00696b]" />
                          <span className="hidden sm:inline">Add to Cal</span>
                        </a>
                      </div>
                      <h4 className="font-bold text-base text-[#1b1c19] mt-0.5">
                        {act.title}
                      </h4>
                      <p className="text-xs text-[#3b4949] italic mt-1">
                        "{act.vibe}"
                      </p>
                      {act.location && (
                        <div className="flex items-center gap-1 text-[11px] text-[#6b7a7a] mt-2">
                          <MapPin className="w-3 h-3 text-[#00696b]" />
                          <span>{act.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Canvas - Interactive Google Map Visualizer */}
        <div className="w-full lg:w-[58%] relative p-4 lg:p-6 bg-[#f5f3ee] flex flex-col">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-extrabold text-[#00696b] uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#a43c12]" />
              <span>Google Maps • {itinerary.destination} (Day {currentDay.dayNumber})</span>
            </span>
            <span className="text-[11px] text-[#6b7a7a] font-medium">
              Click pins to inspect vibes & locations
            </span>
          </div>

          <div className="flex-1 min-h-[450px] w-full">
            <GoogleMapView
              destination={itinerary.destination}
              activities={currentDay.activities}
              selectedActivityId={selectedActivityId}
              onSelectActivity={(id) => setSelectedActivityId(id)}
            />
          </div>
        </div>
      </div>

      {/* Modal for Adding New Activity */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-headline font-bold text-lg text-[#00696b]">
              Add Stop to Day {currentDay.dayNumber}
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#3b4949]">Stop Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Gion Teahouse Experience"
                  required
                  className="w-full p-2.5 border rounded-xl text-sm focus:border-[#00696b] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#3b4949]">Time Slot</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 02:00 PM - 03:30 PM"
                  className="w-full p-2.5 border rounded-xl text-sm focus:border-[#00696b] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#3b4949]">Vibe Note</label>
                <input
                  type="text"
                  value={newVibe}
                  onChange={(e) => setNewVibe(e.target.value)}
                  placeholder="e.g. Relaxing & Traditional tea ceremony"
                  className="w-full p-2.5 border rounded-xl text-sm focus:border-[#00696b] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-[#3b4949]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00696b] text-white rounded-xl text-xs font-bold hover:bg-[#005354]"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
