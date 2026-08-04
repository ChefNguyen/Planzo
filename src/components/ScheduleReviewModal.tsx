import React, { useState } from 'react';
import { Itinerary, Activity } from '../types';
import { MapPin, Clock, Map, Edit2, Trash2, CheckCircle, Plus, X, Calendar, Download, ExternalLink } from 'lucide-react';
import { downloadItineraryIcs, createGoogleCalendarUrl } from '../lib/googleCalendar';

interface ScheduleReviewModalProps {
  itinerary: Itinerary;
  onClose: () => void;
  onConfirmSync: () => void;
  onUpdateItinerary: (updated: Itinerary) => void;
}

export const ScheduleReviewModal: React.FC<ScheduleReviewModalProps> = ({
  itinerary,
  onClose,
  onConfirmSync,
  onUpdateItinerary,
}) => {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVibe, setEditVibe] = useState('');

  const handleSyncClick = () => {
    setSyncState('syncing');
    // Download .ics file
    downloadItineraryIcs(itinerary);
    setTimeout(() => {
      setSyncState('synced');
      onConfirmSync();
    }, 1000);
  };

  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: day.activities.filter((act) => act.id !== activityId),
        };
      }
      return day;
    });

    const totalStops = updatedDays.reduce((acc, d) => acc + d.activities.length, 0);

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
      totalStops,
    });
  };

  const handleStartEdit = (act: Activity) => {
    setEditingActivity(act);
    setEditTitle(act.title);
    setEditTime(act.time);
    setEditVibe(act.vibe);
  };

  const handleSaveEdit = (dayIndex: number) => {
    if (!editingActivity) return;

    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === editingActivity.id
              ? { ...act, title: editTitle, time: editTime, vibe: editVibe }
              : act
          ),
        };
      }
      return day;
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
    });
    setEditingActivity(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-[6px] animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-5xl max-h-[90vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/60 hover:bg-white text-[#3b4949] transition-all z-10"
          title="Close review"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Visual Header */}
        <div className="relative pt-8 pb-4 px-6 flex flex-col items-center border-b border-[#bac9c9]/20">
          {/* Centered Schedule Icon Card */}
          <div className="relative w-20 h-24 bg-white rounded-xl shadow-md border border-[#bac9c9]/30 flex flex-col items-center overflow-hidden mb-3">
            <div className="w-full h-6 bg-[#00ced1]/40" />
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="w-8 h-1 bg-[#bac9c9]/50 rounded-full" />
              <div className="w-10 h-1 bg-[#bac9c9]/50 rounded-full" />
              <div className="w-6 h-1 bg-[#bac9c9]/50 rounded-full" />
            </div>
            <span
              className="material-symbols-outlined text-[#00696b] mt-2 text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_today
            </span>
          </div>

          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#1b1c19] text-center">
            Review Your Schedule
          </h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Destinations List */}
            <div className="lg:col-span-8 space-y-8">
              {itinerary.days.map((day, dayIdx) => (
                <div key={day.dayNumber}>
                  <h4 className="font-headline text-xl font-bold text-[#00696b] mb-4 flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#00ced1] text-[#005354] flex items-center justify-center font-bold text-sm">
                      {String(day.dayNumber).padStart(2, '0')}
                    </span>
                    <span>
                      Day {day.dayNumber}: {day.title}
                    </span>
                  </h4>

                  <div className="space-y-3.5">
                    {day.activities.map((act) => {
                      const isEditing = editingActivity?.id === act.id;

                      if (isEditing) {
                        return (
                          <div
                            key={act.id}
                            className="bg-white p-4 rounded-xl border-2 border-[#00ced1] space-y-3 shadow-md"
                          >
                            <input
                              type="text"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              placeholder="Time (e.g. 09:00 AM - 11:30 AM)"
                              className="w-full text-xs font-bold text-[#00696b] border border-[#bac9c9] rounded p-1.5"
                            />
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Activity Title"
                              className="w-full font-bold text-base text-[#1b1c19] border border-[#bac9c9] rounded p-1.5"
                            />
                            <input
                              type="text"
                              value={editVibe}
                              onChange={(e) => setEditVibe(e.target.value)}
                              placeholder="Vibe note..."
                              className="w-full text-xs italic text-[#3b4949] border border-[#bac9c9] rounded p-1.5"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-3 py-1 text-xs text-[#6b7a7a] border rounded hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(dayIdx)}
                                className="px-3 py-1 text-xs bg-[#00696b] text-white rounded font-bold"
                              >
                                Save Changes
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={act.id}
                          className="bg-white/70 p-4 rounded-xl border border-[#bac9c9]/30 flex justify-between items-center shadow-2xs lift-hover"
                        >
                          <div className="flex flex-col gap-1 pr-2">
                            <span className="text-[11px] font-bold text-[#00696b] uppercase tracking-wider">
                              {act.time}
                            </span>
                            <h3 className="font-bold text-base sm:text-lg text-[#1b1c19]">
                              {act.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#3b4949] italic">
                              "{act.vibe}"
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleStartEdit(act)}
                              className="p-2 text-[#6b7a7a] hover:text-[#00696b] transition-colors rounded-lg hover:bg-black/5"
                              title="Edit stop"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(dayIdx, act.id)}
                              className="p-2 text-[#6b7a7a] hover:text-[#ba1a1a] transition-colors rounded-lg hover:bg-black/5"
                              title="Delete stop"
                            >
                              <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {day.activities.length === 0 && (
                      <div className="text-center py-4 text-xs text-[#6b7a7a] italic bg-white/40 rounded-xl">
                        No activities scheduled for this day yet.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Trip Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-[#f5f3ee]/80 p-5 rounded-2xl border border-[#bac9c9]/30 shadow-xs space-y-4">
                <h5 className="font-bold text-[#1b1c19] text-xs uppercase tracking-wider">
                  Trip Summary
                </h5>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00696b]">
                      location_on
                    </span>
                    <span className="text-sm font-medium text-[#3b4949]">
                      {itinerary.totalStops} Stops
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00696b]">
                      schedule
                    </span>
                    <span className="text-sm font-medium text-[#3b4949]">
                      {itinerary.activeHours} Hours Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00696b]">
                      map
                    </span>
                    <span className="text-sm font-medium text-[#3b4949]">
                      {itinerary.region}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#bac9c9]/30">
                  <p className="text-xs text-[#6b7a7a] mb-2 font-medium">Vibes Included:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {itinerary.vibes.map((v, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-[#00ced1]/20 text-[#005354] px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 sm:px-10 py-5 border-t border-[#bac9c9]/20 bg-white/50">
          <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <button
                onClick={handleSyncClick}
                disabled={syncState === 'syncing'}
                className={`px-5 py-3 text-white font-headline font-bold text-sm sm:text-base rounded-full shadow-lg lift-hover transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  syncState === 'synced'
                    ? 'bg-[#00696b]'
                    : 'bg-[#a43c12] hover:bg-[#fe7e4f] shadow-[#a43c12]/20'
                }`}
              >
                {syncState === 'syncing' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    <span>Syncing...</span>
                  </>
                ) : syncState === 'synced' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Synced & Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Export Calendar (.ics)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (itinerary.days[0]?.activities[0]) {
                    const firstAct = itinerary.days[0].activities[0];
                    const url = createGoogleCalendarUrl(itinerary.destination, firstAct, 1);
                    window.open(url, '_blank');
                  }
                }}
                className="px-5 py-3 bg-white hover:bg-gray-50 text-[#00696b] border border-[#00696b]/30 font-headline font-bold text-sm sm:text-base rounded-full shadow-md lift-hover transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[#00696b]" />
                <span>Open in Google Calendar</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-[#3b4949] hover:text-[#00696b] transition-colors py-1"
            >
              Maybe Later
            </button>
          </div>

          {/* Progress Footnote */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-[2px] w-full max-w-xs bg-[#00696b]/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#00696b]" style={{ width: '100%' }} />
            </div>
            <span className="material-symbols-outlined text-[#00696b] text-lg">
              check_circle
            </span>
          </div>
          <p className="text-[10px] text-[#6b7a7a] text-center mt-1 uppercase tracking-wider font-semibold">
            Step 4 of 4: Final Confirmation
          </p>
        </div>
      </div>
    </div>
  );
};
