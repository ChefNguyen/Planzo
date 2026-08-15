import React, { useState } from 'react';
import { Itinerary, Activity } from '../types';
import { MapPin, Clock, Map, Edit2, Trash2, CheckCircle, Plus, X, Calendar, Download, ExternalLink, Sparkles, AlertCircle, Hourglass, Footprints, Zap, Compass } from 'lucide-react';
import { downloadItineraryIcs, createGoogleCalendarUrl, syncAllToGoogleCalendar, syncItineraryToGoogleCalendarApi, getGoogleCalendarUrl, parseItineraryStartDate } from '../lib/googleCalendar';
import { exportItineraryToPdf } from '../lib/exportPdf';
import { auth, signInWithGoogle, connectGoogleCalendarAccount } from '../lib/firebase';
import { parseActivityTimeRange, formatActivityTimeRange, timeStringToHHMM, hhmmToTimeString } from '../lib/timeUtils';
import { toCommunityEnglishLabel } from '../lib/communityLabels';

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
  const [icsState, setIcsState] = useState<'idle' | 'exporting' | 'exported'>('idle');
  const [gcalState, setGcalState] = useState<'idle' | 'syncing' | 'synced'>('idle');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncNoticeType, setSyncNoticeType] = useState<'success' | 'warning'>('success');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00 AM');
  const [editEndTime, setEditEndTime] = useState('11:00 AM');
  const [editVibe, setEditVibe] = useState('');

  const baseStartDate = parseItineraryStartDate(itinerary);
  const endItineraryDate = new Date(baseStartDate);
  endItineraryDate.setDate(endItineraryDate.getDate() + (itinerary.days.length - 1));

  const formattedStartDateStr = baseStartDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedEndDateStr = endItineraryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedDateRange = `${formattedStartDateStr} – ${formattedEndDateStr}`;

  const handleIcsExport = () => {
    setIcsState('exporting');
    setSyncNotice(null);
    downloadItineraryIcs(itinerary);
    setTimeout(() => {
      setIcsState('exported');
      setSyncNoticeType('success');
      setSyncNotice(`Downloaded .ics file containing all ${itinerary.totalStops} itinerary stops!`);
      setTimeout(() => setIcsState('idle'), 3000);
    }, 600);
  };

  const handleGoogleCalendarSync = async () => {
    setGcalState('syncing');
    setSyncNotice(null);

    let token = sessionStorage.getItem('gcal_access_token');
    let gcalEmail = sessionStorage.getItem('gcal_account_email');

    // Single-popup OAuth flow: connectGoogleCalendarAccount signs in and requests Calendar permissions in 1 step without prior window.open conflicts
    if (!token) {
      const res = await connectGoogleCalendarAccount();
      if (res?.error) {
        setGcalState('idle');
        setSyncNoticeType('warning');
        if (res.error === 'cancelled') {
          setSyncNotice('Google Calendar sign-in was closed or cancelled.');
        } else if (res.error === 'popup_blocked') {
          setSyncNotice('Browser blocked the sign-in popup. Please allow popups for Planzo and try again.');
        } else if (res.error === 'access_denied') {
          setSyncNotice('Google Calendar permission was not granted or this account is not registered as a Test User in Google Cloud Console.');
        } else {
          setSyncNotice('Google Calendar authorization failed. Please try again.');
        }
        return;
      }
      token = res?.accessToken || sessionStorage.getItem('gcal_access_token');
      gcalEmail = res?.email || sessionStorage.getItem('gcal_account_email') || '';
    }

    if (!token) {
      setGcalState('idle');
      setSyncNoticeType('warning');
      setSyncNotice('Unable to acquire Google Calendar access token. Please try again.');
      return;
    }

    let apiResult = await syncItineraryToGoogleCalendarApi(itinerary, token);

    // If token expired (401), clear session and retry once with fresh OAuth popup
    if (!apiResult.success && apiResult.error?.includes('401')) {
      sessionStorage.removeItem('gcal_access_token');
      sessionStorage.removeItem('gcal_account_email');
      const res = await connectGoogleCalendarAccount();
      if (res?.accessToken) {
        token = res.accessToken;
        gcalEmail = res.email || '';
        apiResult = await syncItineraryToGoogleCalendarApi(itinerary, token);
      }
    }

    if (apiResult.success && (apiResult.count > 0 || apiResult.skippedCount > 0)) {
      setGcalState('synced');
      setSyncNoticeType('success');
      setSyncNotice(
        apiResult.count > 0
          ? `Successfully synced ${apiResult.count} events directly to Google Calendar (${gcalEmail || 'Selected Account'})!${apiResult.skippedCount > 0 ? ` Skipped ${apiResult.skippedCount} existing events.` : ''}`
          : `All events already exist in Google Calendar (${gcalEmail || 'Selected Account'}), no duplicates created.`
      );
      const targetUrl = getGoogleCalendarUrl(gcalEmail, itinerary);
      window.open(targetUrl, '_blank');
      onConfirmSync();
    } else {
      setGcalState('idle');
      setSyncNoticeType('warning');
      setSyncNotice(apiResult.error || 'Failed to sync events to Google Calendar. Please check calendar permissions.');
    }
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 md:p-8">
      <div className="bg-white rounded-none w-full max-w-6xl xl:max-w-7xl max-h-[92vh] flex flex-col overflow-hidden relative border-2 border-[#1b1c19] shadow-[8px_8px_0px_0px_#00696b] animate-in zoom-in-95 duration-200">
        
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

          {/* Sync Notice Alert Banner */}
          {syncNotice && (
            <div className={`mt-3 px-4 py-2.5 border-2 border-[#1b1c19] rounded-none text-xs text-center font-semibold max-w-2xl flex flex-col sm:flex-row items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
              syncNoticeType === 'warning'
                ? 'bg-[#fe7e4f]/15 text-[#a43c12]'
                : 'bg-[#00696b]/10 text-[#00696b]'
            }`}>
              <div className="flex items-center gap-2">
                {syncNoticeType === 'warning' ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#a43c12]" />
                ) : (
                  <CheckCircle className="w-4 h-4 shrink-0 text-[#00696b]" />
                )}
                <span>{syncNotice}</span>
              </div>
              {syncNoticeType === 'warning' && (
                <button
                  onClick={() => syncAllToGoogleCalendar(itinerary)}
                  className="underline font-black text-[#a43c12] hover:text-[#8b320e] cursor-pointer shrink-0 ml-1"
                  title="Download .ics and open Google Calendar Import"
                >
                  ⚡ 1-Click Import to Calendar
                </button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-10 py-6 scrollbar-thin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Left Column: Days Timeline */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-7">
              {itinerary.days.map((day, dayIdx) => {
                const dayDate = new Date(baseStartDate);
                dayDate.setDate(dayDate.getDate() + (day.dayNumber - 1));
                const formattedDayDate = dayDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
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
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a43c12] bg-[#fe7e4f]/10 border border-[#a43c12]/30 px-2 py-0.5 rounded-none">
                              <Calendar className="w-3 h-3 text-[#a43c12]" /> {formattedDayDate}
                            </span>
                            <span className="text-[11px] text-[#6b7a7a] font-medium">
                              • {day.activities.length} stops planned
                            </span>
                          </div>
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
                            {/* Time Editor */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-black uppercase tracking-wider text-[#00696b] bg-[#00ced1]/20 border border-[#00696b]/30 px-2 py-0.5 rounded-none">
                                Time Slot
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="time"
                                  value={timeStringToHHMM(editStartTime)}
                                  onClick={(e) => {
                                    try {
                                      e.currentTarget.showPicker?.();
                                    } catch {}
                                  }}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setEditStartTime(hhmmToTimeString(e.target.value));
                                    }
                                  }}
                                  className="text-xs font-bold text-[#00696b] bg-white border-2 border-[#1b1c19] px-2.5 py-1 rounded-none text-center focus:outline-none focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                  title="Click to pick start time"
                                />
                                <span className="text-xs font-black text-[#1b1c19]">–</span>
                                <input
                                  type="time"
                                  value={timeStringToHHMM(editEndTime)}
                                  onClick={(e) => {
                                    try {
                                      e.currentTarget.showPicker?.();
                                    } catch {}
                                  }}
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      setEditEndTime(hhmmToTimeString(e.target.value));
                                    }
                                  }}
                                  className="text-xs font-bold text-[#00696b] bg-white border-2 border-[#1b1c19] px-2.5 py-1 rounded-none text-center focus:outline-none focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                  title="Click to pick end time"
                                />
                              </div>
                            </div>

                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Activity Title"
                              spellCheck={false}
                              autoCorrect="off"
                              autoCapitalize="off"
                              className="w-full font-bold text-base text-[#1b1c19] border-2 border-[#1b1c19] bg-white rounded-none p-2 focus:outline-none"
                            />

                            <input
                              type="text"
                              value={editVibe}
                              onChange={(e) => setEditVibe(e.target.value)}
                              placeholder="Vibe note..."
                              spellCheck={false}
                              autoCorrect="off"
                              autoCapitalize="off"
                              className="w-full text-xs italic text-[#3b4949] border-2 border-[#1b1c19] bg-white rounded-none p-2 focus:outline-none"
                            />

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() => setEditingActivity(null)}
                                className="px-3.5 py-1.5 text-xs text-[#6b7a7a] border-2 border-[#1b1c19] rounded-none bg-white font-semibold hover:bg-[#f5f3ee] transition-colors"
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
                          className="group relative bg-white p-4 sm:p-5 rounded-none border-2 border-[#1b1c19] flex justify-between items-center shadow-[2px_2px_0px_0px_#1b1c19] transition-all duration-200"
                        >
                          <div className="flex flex-col gap-1.5 pr-3 min-w-0 flex-1">
                            {(() => {
                              const { startTime, endTime } = parseActivityTimeRange(act.time);
                              return (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none bg-[#00ced1]/15 border border-[#00696b]/35 text-[#00696b] text-xs font-headline font-black tracking-wide w-fit">
                                  <span>{startTime}</span>
                                  <span className="text-[#1b1c19]/50 font-black">–</span>
                                  <span>{endTime}</span>
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
                            {/* Google Maps Link */}
                            <a
                              href={act.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + (act.location || itinerary.destination))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-[#6b7a7a] hover:text-[#00696b] transition-all rounded-none hover:bg-[#00ced1]/10 border border-transparent hover:border-[#1b1c19]"
                              title="View on Google Maps"
                            >
                              <MapPin className="w-4 h-4" />
                            </a>

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
              );
            })}
            </div>

            {/* Right Column: Trip Summary Card Widget */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
              <div className="bg-white p-5 sm:p-6 rounded-none border-2 border-[#1b1c19] shadow-[5px_5px_0px_0px_#00696b] space-y-4.5 max-h-[calc(85vh-100px)] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b-2 border-[#1b1c19]/20 pb-3 shrink-0">
                  <h5 className="font-headline font-black text-[#1b1c19] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Map className="w-4 h-4 text-[#00696b]" /> Trip Summary
                  </h5>
                  <span className="px-2.5 py-0.5 rounded-none bg-[#00696b]/10 text-[#00696b] text-[10px] font-headline font-black uppercase border border-[#00696b]/30">
                    Overview
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Destination */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#00696b]/15 text-[#00696b] border border-[#1b1c19] shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Destination</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#1b1c19] text-right break-words font-headline" title={toCommunityEnglishLabel(itinerary.destination) || itinerary.destination}>
                      {toCommunityEnglishLabel(itinerary.destination) || itinerary.destination}
                    </span>
                  </div>

                  {/* Travel Dates */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#a43c12]/15 text-[#a43c12] border border-[#1b1c19] shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Travel Dates</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#a43c12] text-right break-words font-headline" title={formattedDateRange}>{formattedDateRange}</span>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#fe7e4f]/15 text-[#a43c12] border border-[#1b1c19] shrink-0">
                        <Hourglass className="w-4 h-4 text-[#a43c12]" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Duration</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#1b1c19] shrink-0 font-headline">{itinerary.days.length} Days</span>
                  </div>

                  {/* Total Stops */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#00ced1]/15 text-[#00696b] border border-[#1b1c19] shrink-0">
                        <Footprints className="w-4 h-4 text-[#00696b]" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Total Stops</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#1b1c19] shrink-0 font-headline">{itinerary.totalStops} Stops</span>
                  </div>

                  {/* Active Hours */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#fe7e4f]/20 text-[#d9531e] border border-[#1b1c19] shrink-0">
                        <Zap className="w-4 h-4 text-[#d9531e]" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Active Hours</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#1b1c19] shrink-0 font-headline">{itinerary.activeHours} Hrs</span>
                  </div>

                  {/* Region */}
                  <div className="flex items-center justify-between p-3 rounded-none bg-[#f5f3ee] border-2 border-[#1b1c19] gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="p-1.5 rounded-none bg-[#00696b]/15 text-[#00696b] border border-[#1b1c19] shrink-0">
                        <Compass className="w-4 h-4 text-[#00696b]" />
                      </div>
                      <span className="text-xs font-semibold text-[#5f6e6e]">Region</span>
                    </div>
                    <span className="text-xs font-extrabold text-[#1b1c19] text-right break-words font-headline" title={toCommunityEnglishLabel(itinerary.region)}>{toCommunityEnglishLabel(itinerary.region)}</span>
                  </div>
                </div>

                {/* Vibes Section */}
                {itinerary.vibes && itinerary.vibes.length > 0 && (
                  <div className="pt-3.5 border-t-2 border-[#1b1c19]/20">
                    <p className="text-xs font-bold text-[#5f6e6e] mb-2.5">Vibes Included ({itinerary.vibes.length}):</p>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                      {itinerary.vibes.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-[#00ced1]/20 text-[#005354] px-2.5 py-1 rounded-none font-bold border border-[#1b1c19] break-words"
                        >
                          {toCommunityEnglishLabel(v)}
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
          <div className="flex flex-col items-center gap-3 max-w-3xl mx-auto">
            
            {/* 3 Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {/* Button 1: ICS Export */}
              <button
                onClick={handleIcsExport}
                disabled={icsState === 'exporting'}
                className="neobrutal-btn-terracotta px-4 py-3 font-headline font-black text-xs sm:text-sm rounded-none transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {icsState === 'exporting' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    <span>Downloading...</span>
                  </>
                ) : icsState === 'exported' ? (
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
                disabled={gcalState === 'syncing'}
                className="px-4 py-3 bg-white text-[#00696b] border-2 border-[#1b1c19] font-headline font-black text-xs sm:text-sm rounded-none shadow-[3px_3px_0px_0px_#1b1c19] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {gcalState === 'syncing' ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    <span>Syncing Schedule...</span>
                  </>
                ) : gcalState === 'synced' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-[#00696b]" />
                    <span>Synced to Calendar!</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 text-[#00696b]" />
                    <span>Google Calendar</span>
                  </>
                )}
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


