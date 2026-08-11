import React, { useState, useRef, useEffect } from 'react';
import { Itinerary, Activity } from '../types';
import { MapPin, ArrowLeft, GripVertical, Clock } from 'lucide-react';
import { GoogleMapView } from './GoogleMapView';
import { getPlacePhoto } from '../lib/photoUtils';
import { parseActivityTimeRange, formatActivityTimeRange, timeStringToHHMM, hhmmToTimeString } from '../lib/timeUtils';

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

  const [draggedActIndex, setDraggedActIndex] = useState<number | null>(null);
  const [dragOverActIndex, setDragOverActIndex] = useState<number | null>(null);

  // Splitter Bar state & dragging logic
  const [sidebarWidth, setSidebarWidth] = useState<number>(42); // Percentage (min 25%, max 65%)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReorderActivity = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || toIdx >= currentDay.activities.length) return;
    const updatedActivities = [...currentDay.activities];
    const [movedItem] = updatedActivities.splice(fromIdx, 1);
    updatedActivities.splice(toIdx, 0, movedItem);

    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === selectedDayIndex) {
        return { ...day, activities: updatedActivities };
      }
      return day;
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
    });
    setDraggedActIndex(null);
    setDragOverActIndex(null);
  };

  const handleTimeChange = (actId: string, newStart: string, newEnd: string) => {
    const newTime = formatActivityTimeRange(newStart, newEnd);
    const updatedDays = itinerary.days.map((day, idx) => {
      if (idx === selectedDayIndex) {
        return {
          ...day,
          activities: day.activities.map((act) =>
            act.id === actId ? { ...act, time: newTime } : act
          ),
        };
      }
      return day;
    });

    onUpdateItinerary({
      ...itinerary,
      days: updatedDays,
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll selected activity card into view in the left timeline panel
  useEffect(() => {
    if (selectedActivityId) {
      const el = document.getElementById(`activity-card-${selectedActivityId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedActivityId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidthPx = e.clientX - containerRect.left;
      const newWidthPercent = (newWidthPx / containerRect.width) * 100;
      // Clamp between 25% and 65%
      const clamped = Math.min(65, Math.max(25, newWidthPercent));
      setSidebarWidth(clamped);
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const currentDay = itinerary.days[selectedDayIndex] || itinerary.days[0];

  return (
    <div className="fixed inset-x-0 bottom-0 flex flex-col z-40 bg-[#fbf9f4] transition-colors duration-300" style={{ top: '76px' }}>
      {/* Top Banner Control — Neobrutalist Travel Header */}
      <div className="bg-white border-b-2 border-[#1b1c19] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-[0px_3px_0px_0px_#00696b] z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onBackToInput}
            className="px-3.5 py-1.5 bg-white text-[#00696b] border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19] hover:-translate-y-0.5 active:translate-y-0 text-xs font-headline font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all"
            title="Quay lại tạo lịch trình mới"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>New Vibe</span>
          </button>

          <div className="h-6 w-px bg-[#1b1c19]/30 shrink-0" />

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline font-black text-lg sm:text-xl text-[#00696b] tracking-tight truncate">
                {itinerary.destination}
              </h2>
              {itinerary.duration?.formatted && (
                <span className="text-[11px] font-headline font-black uppercase tracking-wider text-[#a43c12] bg-[#a43c12]/15 border border-[#a43c12]/30 px-2.5 py-0.5 rounded-none shrink-0">
                  {itinerary.duration.formatted}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6b7a7a] mt-0.5 flex-wrap">
              <span className="font-bold text-[#3b4949]">{itinerary.dates}</span>
              <span>•</span>
              <span className="font-black text-[#00696b]">{itinerary.totalStops} Stops</span>
              <span>•</span>
              <span>{itinerary.activeHours} hrs active/day</span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenReviewModal}
            className="neobrutal-btn-terracotta px-5 py-2 font-headline font-black text-xs sm:text-sm flex items-center gap-2 transition-all rounded-none"
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
            <span>Review & Sync Schedule</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Sidebar & Interactive Map - fills remaining space */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col lg:flex-row min-h-0 relative"
        style={{ overflow: 'hidden' }}
      >
        {/* Left Sidebar - Days & Activity List */}
        <div
          className="w-full bg-white border-r-2 border-[#1b1c19] flex flex-col h-full overflow-hidden transition-all duration-75"
          style={{ width: isDesktop ? `${sidebarWidth}%` : '100%' }}
        >
          {/* Pinned Top Header inside Left Sidebar */}
          <div className="p-4 sm:p-5 pb-4 shrink-0 border-b-2 border-[#1b1c19] bg-[#fbf9f4] space-y-3 z-10">
            {/* Day Tabs with vertical padding to prevent top/bottom clipping */}
            <div className="flex items-center gap-2 overflow-x-auto py-1.5 px-0.5 custom-scrollbar">
              {itinerary.days.map((day, idx) => (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setSelectedDayIndex(idx);
                    if (day.activities[0]) setSelectedActivityId(day.activities[0].id);
                  }}
                  className={`px-4 py-2 font-headline font-black uppercase text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 border-2 rounded-none ${
                    selectedDayIndex === idx
                      ? 'bg-[#00696b] text-white border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19]'
                      : 'bg-white text-[#3b4949] border-[#1b1c19] hover:bg-[#f0eee6]'
                  }`}
                >
                  <span>Day {day.dayNumber}</span>
                  <span className="text-[10px] opacity-90">({day.activities.length})</span>
                </button>
              ))}
            </div>

            {/* Current Day Title Banner — Hard Neobrutalism */}
            <div className="bg-white p-3.5 sm:p-4 border-2 border-[#1b1c19] shadow-[4px_4px_0px_0px_#00696b] rounded-none transition-all">
              <h3 className="font-headline font-black text-base sm:text-lg text-[#1b1c19] leading-tight uppercase tracking-tight truncate">
                {currentDay.title}
              </h3>
            </div>
          </div>

          {/* Scrollable Activities Timeline */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-5 space-y-6 custom-scrollbar">
            {/* Activities Vertical Stepper Timeline */}
            <div className="relative pl-6 sm:pl-7 border-l-2 border-dashed border-[#00696b]/40 space-y-5 my-2 ml-3">
              {currentDay.activities.map((act, idx) => {
                const isSelected = selectedActivityId === act.id;
                const isBeingDragged = draggedActIndex === idx;
                const isDragOverTarget = dragOverActIndex === idx;
                const photoUrl = getPlacePhoto(act, itinerary.destination);

                return (
                  <div
                    key={act.id}
                    id={`activity-card-${act.id}`}
                    className="relative group/card"
                    draggable
                    onDragStart={(e) => {
                      setDraggedActIndex(idx);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverActIndex !== idx) setDragOverActIndex(idx);
                    }}
                    onDragLeave={() => {
                      if (dragOverActIndex === idx) setDragOverActIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedActIndex !== null && draggedActIndex !== idx) {
                        handleReorderActivity(draggedActIndex, idx);
                      } else {
                        setDragOverActIndex(null);
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedActIndex(null);
                      setDragOverActIndex(null);
                    }}
                  >
                    {/* Stepper Node Icon on Vertical Dashed Line */}
                    <div
                      onClick={() => setSelectedActivityId(act.id)}
                      className={`absolute -left-[37px] sm:-left-[41px] top-3 w-8 h-8 rounded-none flex items-center justify-center font-headline font-black text-xs cursor-pointer transition-all duration-200 z-10 border-2 border-[#1b1c19] ${isSelected
                        ? 'bg-[#a43c12] text-white shadow-[3px_3px_0px_0px_#1b1c19] scale-110'
                        : 'bg-white text-[#00696b] shadow-[2px_2px_0px_0px_#1b1c19] hover:scale-105'
                        }`}
                    >
                      <span>{idx + 1}</span>
                    </div>

                    {/* Boarding-Pass Activity Card with Square Thumbnail & Drag Handle */}
                    <div
                      onClick={() => setSelectedActivityId(act.id)}
                      className={`p-3.5 rounded-none border-2 transition-all cursor-pointer bg-white text-[#1b1c19] relative ${isBeingDragged ? 'opacity-40 border-dashed border-[#00696b]' : ''
                        } ${isDragOverTarget ? 'border-[#00ced1] shadow-[5px_5px_0px_0px_#00ced1] scale-[1.01]' : ''
                        } ${isSelected
                          ? 'border-[#00696b] shadow-[4px_4px_0px_0px_#00696b] -translate-y-0.5'
                          : 'border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:shadow-[5px_5px_0px_0px_#1b1c19] hover:-translate-y-0.5'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-3.5">
                        {/* Compact Square Image Banner */}
                        <div className="w-full sm:w-24 h-28 sm:h-24 rounded-none overflow-hidden shrink-0 bg-[#f0eee6] relative border-2 border-[#1b1c19] group">
                          <img
                            src={photoUrl}
                            alt={act.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Content Details */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            {(() => {
                              const { startTime, endTime } = parseActivityTimeRange(act.time);
                              return (
                                <div className="flex items-center gap-1 sm:gap-1.5" onClick={(e) => e.stopPropagation()}>
                                  <Clock className="w-3.5 h-3.5 text-[#00696b] shrink-0" />
                                  <input
                                    type="time"
                                    value={timeStringToHHMM(startTime)}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleTimeChange(act.id, hhmmToTimeString(e.target.value), endTime);
                                      }
                                    }}
                                    className="text-[11px] font-headline font-black text-[#00696b] bg-[#00ced1]/15 border-2 border-[#1b1c19] px-1 py-0.5 rounded-none text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                    title="Chọn Giờ Bắt Đầu"
                                  />
                                  <span className="text-xs font-black text-[#1b1c19]">-</span>
                                  <input
                                    type="time"
                                    value={timeStringToHHMM(endTime)}
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        handleTimeChange(act.id, startTime, hhmmToTimeString(e.target.value));
                                      }
                                    }}
                                    className="text-[11px] font-headline font-black text-[#00696b] bg-[#00ced1]/30 border-2 border-[#1b1c19] px-1 py-0.5 rounded-none text-center focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00696b] shadow-[1px_1px_0px_0px_#1b1c19] cursor-pointer"
                                    title="Chọn Giờ Kết Thúc"
                                  />
                                </div>
                              );
                            })()}

                            {/* Drag Handle for Mouse Reordering */}
                            <div className="flex items-center">
                              <span
                                className="p-1.5 text-[#a0afaf] hover:text-[#00696b] cursor-grab active:cursor-grabbing transition-colors"
                                title="Kéo để đổi thứ tự địa điểm"
                              >
                                <GripVertical className="w-4 h-4" />
                              </span>
                            </div>
                          </div>

                          <h4 className="font-bold text-base text-[#1b1c19] mt-1 leading-snug">
                            {act.title}
                          </h4>

                          {/* Rating & Reviews */}
                          {(act.rating || act.userRatingsTotal) && (
                            <div className="flex items-center gap-1.5 mt-1">
                              {act.rating && (
                                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#a43c12]">
                                  <span className="text-amber-500">★</span> {act.rating.toFixed(1)}
                                </span>
                              )}
                              {act.userRatingsTotal && (
                                <span className="text-[11px] text-[#6b7a7a]">
                                  ({act.userRatingsTotal.toLocaleString()} reviews)
                                </span>
                              )}
                            </div>
                          )}

                          <p className="text-xs text-[#3b4949] italic mt-1 line-clamp-2">
                            "{act.vibe}"
                          </p>

                          {act.location && (
                            <div className="flex items-center gap-1 text-[11px] text-[#6b7a7a] mt-2 border-t pt-2 border-[#1b1c19]/15">
                              <MapPin className="w-3 h-3 text-[#00696b] shrink-0" />
                              <span className="truncate">{act.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sleek Vertical Resizable Splitter Bar (Desktop Only) */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={() => setSidebarWidth(42)}
          className={`hidden lg:flex w-2.5 hover:w-3.5 bg-[#f5f3ee] hover:bg-[#00ced1]/20 border-x border-[#1b1c19]/30 items-center justify-center cursor-col-resize z-20 group transition-all duration-150 relative shrink-0 ${isDragging ? 'bg-[#00ced1]/30 border-[#00696b]' : ''
            }`}
          title="Kéo để thay đổi kích thước Left Panel & Map View (Double-click để reset)"
        >
          {/* Central Grip Handle Pill */}
          <div className={`w-5 h-10 rounded-none bg-white border-2 border-[#1b1c19] shadow-[2px_2px_0px_0px_#1b1c19] flex flex-col items-center justify-center transition-all group-hover:scale-110 ${isDragging ? 'bg-[#00696b] text-white border-[#1b1c19] scale-110' : 'text-[#6b7a7a] group-hover:text-[#00696b]'
            }`}>
            <GripVertical className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Right Canvas - Interactive Google Map Visualizer */}
        <div
          className="w-full flex-1 relative p-4 lg:p-6 bg-[#f5f3ee] flex flex-col transition-all duration-75"
          style={{ height: '100%', overflow: 'hidden' }}
        >
          <div className="flex items-center justify-between mb-3 px-1 shrink-0">
            <span className="text-xs font-headline font-black text-[#00696b] uppercase tracking-widest flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#a43c12]" />
              <span>Map • {itinerary.destination} (Day {currentDay.dayNumber})</span>
            </span>
            <span className="text-[11px] text-[#6b7a7a] font-medium">
              Click pins to inspect vibes & locations
            </span>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            <GoogleMapView
              destination={itinerary.destination}
              activities={currentDay.activities}
              selectedActivityId={selectedActivityId}
              onSelectActivity={(id) => setSelectedActivityId(id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
