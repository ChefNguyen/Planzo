import React, { useState } from 'react';
import { Itinerary, Activity } from '../types';
import { MapPin, Clock, Map, Edit2, Trash2, CheckCircle, Plus, X, Calendar, Download, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { downloadItineraryIcs, createGoogleCalendarUrl, syncAllToGoogleCalendar, syncItineraryToGoogleCalendarApi, getGoogleCalendarUrl } from '../lib/googleCalendar';
import { exportItineraryToPdf } from '../lib/exportPdf';
import { auth, signInWithGoogle, connectGoogleCalendarAccount } from '../lib/firebase';
import { parseActivityTimeRange, formatActivityTimeRange, timeStringToHHMM, hhmmToTimeString } from '../lib/timeUtils';

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
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00 AM');
  const [editEndTime, setEditEndTime] = useState('11:00 AM');
  const [editVibe, setEditVibe] = useState('');

  const handleSyncClick = () => {
    setSyncState('syncing');
    setSyncNotice(null);
    downloadItineraryIcs(itinerary);
    setTimeout(() => {
      setSyncState('synced');
      setSyncNotice(`Downloaded .ics file containing all ${itinerary.totalStops} itinerary stops!`);
      onConfirmSync();
    }, 800);
  };

  const handleGoogleCalendarSync = async () => {
    setSyncState('syncing');
    setSyncNotice(null);

    let token = sessionStorage.getItem('gcal_access_token');
    let gcalEmail = sessionStorage.getItem('gcal_account_email');

    if (!token) {
      if (!auth.currentUser) {
        const user = await signInWithGoogle();
        if (!user) {
          setSyncState('idle');
          return;
        }
      }

      const res = await connectGoogleCalendarAccount();
      token = res?.accessToken || sessionStorage.getItem('gcal_access_token');
      gcalEmail = res?.email || sessionStorage.getItem('gcal_account_email') || '';
    }

    if (token) {
      const apiResult = await syncItineraryToGoogleCalendarApi(itinerary, token);
      if (apiResult.success && (apiResult.count > 0 || apiResult.skippedCount > 0)) {
        setSyncState('synced');
        setSyncNotice(
          apiResult.count > 0
            ? `Successfully synced ${apiResult.count} events directly to Google Calendar (${gcalEmail || 'Selected Account'})!${apiResult.skippedCount > 0 ? ` Skipped ${apiResult.skippedCount} existing events.` : ''}`
            : `All events already exist in Google Calendar (${gcalEmail || 'Selected Account'}), no duplicates created.`
        );
        window.open(getGoogleCalendarUrl(gcalEmail), '_blank');
        onConfirmSync();
        return;
      }
    }

    // Fallback if API token is missing or denied
    syncAllToGoogleCalendar(itinerary);
    setTimeout(() => {
      setSyncState('synced');
      setSyncNotice(`Created .ics file & opened Google Calendar Import page. Drag and drop file to sync!`);
      onConfirmSync();
    }, 800);
  };

  const handleStartEdit = (act: Activity) => {
    const { startTime, endTime } = parseActivityTimeRange(act.time);
    setEditingActivity(act);
    setEditTitle(act.title);
    setEditStartTime(startTime);
    setEditEndTime(endTime);
    setEditVibe(act.vibe);
  };

  const handleSaveEdit = (dayIndex: number) => {
    if (!editingActivity) return;

    const formattedTime = formatActivityTimeRange(editStartTime, editEndTime);

    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === editingActivity.id
              ? { ...act, title: editTitle, time: formattedTime, vibe: editVibe }
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

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-none max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden relative border-2 border-[#1b1c19] shadow-[6px_6px_0px_0px_#00696b] animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2 rounded-none bg-white border-2 border-[#1b1c19] text-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] hover:-translate-y-0.5 transition-all z-20"
          title="Close review"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="relative pt-7 pb-4 px-6 sm:px-10 flex flex-col items-center border-b-2 border-[#1b1c19] bg-[#fbf9f4]">
          {/* Neobrutalist Hero Icon Card */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#00696b] border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] rounded-none flex items-center justify-center mb-3 text-white">
            <span className="material-symbols-outlined text-3xl sm:text-4xl">
              event_available
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-none bg-[#00ced1]/15 text-[#00696b] font-headline font-black text-[11px] uppercase tracking-wider flex items-center gap-1 border border-[#00696b]/30">
              <Sparkles className="w-3 h-3" /> Ready to Sync
            </span>
          </div>

          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#1b1c19] text-center tracking-tight">
            Review Your Schedule
          </h2>
          <p className="text-xs sm:text-sm text-[#5f6e6e] mt-1 text-center font-medium flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00696b]" />
            <span className="font-bold text-[#00696b]">{itinerary.destination}</span> • {itinerary.days.length} Days • {itinerary.totalStops} Stops
          </p>

          {/* Sync Notice Alert Banner */}
          {syncNotice && (
            <div className="mt-3 px-4 py-2.5 bg-[#00696b]/10 border-2 border-[#1b1c19] rounded-none text-xs text-[#00696b] text-center font-semibold max-w-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#00696b]" />
              <span>{syncNotice}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-10 py-6 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Days Timeline */}
            <div className="lg:col-span-8 space-y-7">
              {itinerary.days.map((day, dayIdx) => (
                <div key={day.dayNumber} className="relative">
                  {/* Day Header Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-none bg-[#00696b] text-white border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] flex items-center justify-center font-headline font-black text-sm">
                        {String(day.dayNumber).padStart(2, '0')}
                      </div>
                      <div>
                        <h4 className="font-headline text-lg sm:text-xl font-bold text-[#1b1c19] leading-snug">
                          Day {day.dayNumber}: {day.title}
                        </h4>
                        <span className="text-[11px] text-[#6b7a7a] font-medium">
                          {day.activities.length} stops planned
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Day Activities List */}
                  <div className="space-y-3.5 pl-3 sm:pl-4 border-l-2 border-dashed border-[#1b1c19]/30 ml-4">
                    {day.activities.map((act) => {
                      const isEditing = editingActivity?.id === act.id;

                      if (isEditing) {
                        return (
                          <div
                            key={act.id}
                            className="bg-white p-4.5 rounded-none border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#00ced1] space-y-3 animate-in fade-in"
                          >
                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                              <label className="text-[11px] font-headline font-black uppercase text-[#00696b] tracking-wider flex items-center gap-1.5 shrink-0">
                                <Clock className="w-3.5 h-3.5 text-[#00696b]" /> Time:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="time"
                                  value={timeStringToHHMM(editStartTime)}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setEditStartTime(hhmmToTimeString(e.target.value));
                                    }
                                  }}
                                  className="text-xs font-bold text-[#00696b] bg-[#00ced1]/15 border-2 border-[#1b1c19] px-2 py-1 rounded-none text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                  title="Chọn Giờ Bắt Đầu"
                                />
                                <span className="text-xs font-black text-[#1b1c19]">-</span>
                                <input
                                  type="time"
                                  value={timeStringToHHMM(editEndTime)}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setEditEndTime(hhmmToTimeString(e.target.value));
                                    }
                                  }}
                                  className="text-xs font-black text-[#00696b] bg-[#00ced1]/30 border-2 border-[#1b1c19] px-2 py-1 rounded-none text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                  title="Chọn Giờ Kết Thúc"
                                />
                              </div>
                            </div>

                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Activity Title"
                              className="w-full font-bold text-base text-[#1b1c19] border-2 border-[#1b1c19] bg-white rounded-none p-2 focus:outline-none"
                            />

                            <input
                              type="text"
                              value={editVibe}
                              onChange={(e) => setEditVibe(e.target.value)}
                              placeholder="Vibe note..."
                              className="w-full text-xs italic text-[#3b4949] border-2 border-[#1b1c19] bg-white rounded-none p-2 focus:outline-none"
                            />

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-3.5 py-1.5 text-xs text-[#6b7a7a] border-2 border-[#1b1c19] rounded-none bg-white font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEdit(dayIdx)}
                                className="neobrutal-btn-teal px-4 py-1.5 text-xs rounded-none font-bold shadow-[2px_2px_0px_0px_#1b1c19]"
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
                          className="group relative bg-white p-4 rounded-none border-2 border-[#1b1c19] flex justify-between items-center shadow-[2px_2px_0px_0px_#1b1c19] transition-all duration-200"
                        >
                          <div className="flex flex-col gap-1 pr-3">
                            {(() => {
                              const { startTime, endTime } = parseActivityTimeRange(act.time);
                              return (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#00696b] shrink-0" />
                                  <span className="px-2 py-0.5 rounded-none bg-[#00ced1]/15 border border-[#00696b]/30 text-[#00696b] text-[11px] font-headline font-black uppercase tracking-wide">
                                    {startTime}
                                  </span>
                                  <span className="text-xs font-black text-[#1b1c19]">-</span>
                                  <span className="px-2 py-0.5 rounded-none bg-[#00ced1]/25 border border-[#00696b]/30 text-[#00696b] text-[11px] font-headline font-black uppercase tracking-wide">
                                    {endTime}
                                  </span>
                                </div>
                              );
                            })()}

                            <h3 className="font-bold text-base sm:text-lg text-[#1b1c19] leading-snug mt-0.5">
                              {act.title}
                            </h3>

                            {act.vibe && (
                              <p className="text-xs text-[#5f6e6e] italic">
                                "{act.vibe}"
                              </p>
                            )}
                          </div>

                          {/* Item Quick Action Icons */}
                          <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                            <a
                              href={createGoogleCalendarUrl(itinerary, act, day.dayNumber)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 text-[#6b7a7a] hover:text-[#00696b] transition-all rounded-none hover:bg-[#00ced1]/10 border border-transparent hover:border-[#1b1c19]"
                              title="Add to Google Calendar"
                            >
                              <Calendar className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleStartEdit(act)}
                              className="p-2 text-[#6b7a7a] hover:text-[#00696b] transition-all rounded-none hover:bg-black/5 border border-transparent hover:border-[#1b1c19]"
                              title="Edit stop"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteActivity(dayIdx, act.id)}
                              className="p-2 text-[#6b7a7a] hover:text-[#ba1a1a] transition-all rounded-none hover:bg-red-500/10 border border-transparent hover:border-[#1b1c19]"
                              title="Delete stop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {day.activities.length === 0 && (
                      <div className="text-center py-4 text-xs text-[#6b7a7a] italic bg-white/40 rounded-none border-2 border-dashed border-[#1b1c19]/30">
                        No activities scheduled for this day yet.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Trip Summary Card Widget */}
            <div className="lg:col-span-4 lg:sticky lg:top-0">
              <div className="bg-white p-5 sm:p-6 rounded-none border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] space-y-4 max-h-[calc(80vh-100px)] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b-2 border-[#1b1c19]/20 pb-3 shrink-0">
                  <h5 className="font-headline font-black text-[#1b1c19] text-xs uppercase tracking-wider flex items-center gap-2">
                    <Map className="w-4 h-4 text-[#00696b]" /> Trip Summary
                  </h5>
                  <span className="px-2.5 py-0.5 rounded-none bg-[#00696b]/10 text-[#00696b] text-[10px] font-headline font-black uppercase border border-[#00696b]/30">
                    Overview
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19]">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-1.5 rounded-none bg-[#00ced1]/15 text-[#00696b] border border-[#1b1c19] shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e] truncate">Total Stops</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#1b1c19] shrink-0">{itinerary.totalStops}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19]">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-1.5 rounded-none bg-[#fe7e4f]/15 text-[#d9531e] border border-[#1b1c19] shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e] truncate">Active Hours</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#1b1c19] shrink-0">{itinerary.activeHours} Hrs</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19]">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-1.5 rounded-none bg-[#00696b]/15 text-[#00696b] border border-[#1b1c19] shrink-0">
                        <Map className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e] truncate">Region</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#1b1c19] truncate text-right flex-1 pl-2" title={itinerary.region}>{itinerary.region}</span>
                  </div>
                </div>

                {/* Vibes Section */}
                {itinerary.vibes && itinerary.vibes.length > 0 && (
                  <div className="pt-3 border-t-2 border-[#1b1c19]/20">
                    <p className="text-xs font-bold text-[#5f6e6e] mb-2">Vibes Included ({itinerary.vibes.length}):</p>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                      {itinerary.vibes.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-[#00ced1]/20 text-[#005354] px-2.5 py-0.5 rounded-none font-bold border border-[#1b1c19] break-words"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Floating Glass Footer Actions */}
        <div className="px-6 sm:px-10 py-4.5 border-t-2 border-[#1b1c19] bg-white">
          <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
            
            {/* 3 Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
              {/* Button 1: ICS Export */}
              <button
                onClick={handleSyncClick}
                disabled={syncState === 'syncing'}
                className="neobrutal-btn-terracotta px-4 py-3 font-headline font-black text-xs sm:text-sm rounded-none transition-all flex items-center justify-center gap-2"
              >
                {syncState === 'syncing' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    <span>Syncing...</span>
                  </>
                ) : syncState === 'synced' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Downloaded!</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Export (.ics)</span>
                  </>
                )}
              </button>

              {/* Button 2: Export PDF Guide */}
              <button
                onClick={() => exportItineraryToPdf(itinerary)}
                className="neobrutal-btn-teal px-4 py-3 font-headline font-black text-xs sm:text-sm rounded-none transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export PDF Guide</span>
              </button>

              {/* Button 3: Google Calendar */}
              <button
                onClick={handleGoogleCalendarSync}
                className="px-4 py-3 bg-white text-[#00696b] border-2 border-[#1b1c19] font-headline font-black text-xs sm:text-sm rounded-none shadow-[3px_3px_0px_0px_#1b1c19] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4 text-[#00696b]" />
                <span>Google Calendar</span>
              </button>
            </div>

            {/* Maybe Later link */}
            <button
              onClick={onClose}
              className="text-xs font-headline font-black uppercase text-[#5f6e6e] hover:text-[#00696b] transition-colors pt-0.5"
            >
              Maybe Later
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};


