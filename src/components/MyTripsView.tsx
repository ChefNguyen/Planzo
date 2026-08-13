import React, { useState, useMemo } from 'react';
import { Itinerary } from '../types';
import { MapPin, Calendar, Clock, ArrowRight, Trash2, Sparkles, Ticket, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomSearchImage } from './CustomSearchImage';
import { toCommunityEnglishLabel } from '../lib/communityLabels';

interface MyTripsViewProps {
  savedTrips: Itinerary[];
  onSelectTrip: (trip: Itinerary) => void;
  onDeleteTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  isVisible?: boolean;
}

const ITEMS_PER_PAGE = 4;

export const MyTripsView = React.memo<MyTripsViewProps>(({
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  onCreateNewTrip,
  isVisible = true,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(savedTrips.length / ITEMS_PER_PAGE));

  // Clamp page inline — no useEffect needed, avoids extra render cycle
  const safePage = Math.min(currentPage, totalPages);
  const currentTrips = useMemo(
    () => savedTrips.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE),
    [savedTrips, safePage],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-[70vh]">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a43c12]/10 text-[#a43c12] text-xs font-headline font-black uppercase tracking-wider mb-2 border border-[#a43c12]/30 rounded-none">
            <Ticket className="w-3.5 h-3.5" />
            <span>{savedTrips.length} Saved Passports</span>
          </div>
          <h2 className="font-headline font-extrabold text-3xl text-[#00696b] flex items-center gap-2">
            <span>My Trips</span>
            <Compass className="w-6 h-6 text-[#a43c12]" />
          </h2>
          <p className="text-sm text-[#3b4949] mt-1">
            Your personal passport of saved AI-generated travel itineraries ({savedTrips.length} total).
          </p>
        </div>

        <button
          onClick={onCreateNewTrip}
          className="neobrutal-btn-terracotta px-5 py-2.5 rounded-none font-headline font-black text-sm uppercase transition-all shadow-[3px_3px_0px_0px_#1b1c19]"
        >
          + Plan New Escape
        </button>
      </div>

      {savedTrips.length === 0 ? (
        <div className="neobrutal-card rounded-none p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-[#a43c12]/15 border-2 border-[#1b1c19] rounded-none flex items-center justify-center mx-auto text-[#a43c12]">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="font-headline font-bold text-xl text-[#1b1c19]">No Trips Saved Yet</h3>
          <p className="text-sm text-[#3b4949] max-w-md mx-auto">
            Use the Planzo AI generator to craft your first vibe-based itinerary and sync it to your calendar!
          </p>
          <button
            onClick={onCreateNewTrip}
            className="neobrutal-btn-terracotta px-6 py-3 rounded-none font-headline font-black text-sm uppercase shadow-[3px_3px_0px_0px_#1b1c19]"
          >
            Generate Itinerary Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {currentTrips.map((trip) => {
            const displayDestination = toCommunityEnglishLabel(trip.destination);
            const displayRegion = toCommunityEnglishLabel(trip.region || trip.destination);
            const displayVibes = trip.vibes.map(toCommunityEnglishLabel);

            return (
              <div
                key={trip.id}
                className="bg-white border-2 border-[#1b1c19] rounded-none shadow-[5px_5px_0px_0px_#a43c12] hover:shadow-[7px_7px_0px_0px_#a43c12] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-200 transform-gpu overflow-hidden flex flex-col md:flex-row items-stretch group"
              >
                {/* Left Cover Image Banner */}
                <div className="w-full md:w-64 h-48 md:h-48 relative overflow-hidden shrink-0 bg-[#f0eee6] rounded-none border-b-2 md:border-b-0 md:border-r-2 border-[#1b1c19]">
                  <CustomSearchImage
                    query={displayDestination || displayRegion}
                    alt={displayDestination}
                    className="w-full h-full"
                    isVisible={isVisible}
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                  {/* Neobrutalist Location Pill Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b1c19] text-white text-xs font-headline font-black uppercase tracking-wider border-2 border-white/30 rounded-none shadow-[2px_2px_0px_0px_#a43c12]">
                      <span className="w-2 h-2 bg-[#a43c12] shrink-0" />
                      <span>{displayRegion}</span>
                    </span>
                  </div>
                </div>

                {/* Center Content Body */}
                <div className="p-5 md:py-5 md:px-6 flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-headline font-extrabold text-2xl text-[#1b1c19] group-hover:text-[#00696b] transition-colors truncate">
                        {displayDestination}
                      </h3>
                      {trip.duration?.formatted && (
                        <span className="text-xs font-headline font-black uppercase text-[#a43c12] bg-[#a43c12]/10 px-2.5 py-0.5 rounded-none border border-[#a43c12]/30 shrink-0">
                          {trip.duration.formatted}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#6b7a7a] flex items-center gap-1.5 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-[#a43c12]" />
                      <span className="font-medium text-[#3b4949]">{trip.dates}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#3b4949] font-medium mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00696b]" />
                        <span>{trip.totalStops} Stops</span>
                      </span>
                      <span>•</span>
                      <span>{trip.activeHours} Hours Active/day</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {displayVibes.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-[#f5f3ee] border border-[#1b1c19]/30 text-[#3b4949] font-bold px-2.5 py-0.5 rounded-none"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Column (Ticket Stub) */}
                <div className="border-t-2 md:border-t-0 md:border-l-2 border-dashed border-[#1b1c19]/30 p-4 md:px-6 flex md:flex-col justify-between items-center md:justify-center gap-3 bg-[#fbf9f4]/60 shrink-0">
                  <button
                    onClick={() => onSelectTrip(trip)}
                    className="neobrutal-btn-teal px-5 py-2.5 font-headline font-black text-xs sm:text-sm uppercase flex items-center gap-2 transition-all rounded-none"
                  >
                    <span>View Full Itinerary</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTrip(trip.id);
                    }}
                    className="p-2 text-[#6b7a7a] hover:text-[#ba1a1a] bg-white border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#ba1a1a] transition-all"
                    title="Delete Saved Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Neobrutalist Pagination Bar (Max 4 items per page) */}
      {savedTrips.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-center gap-3 mt-8 pt-6 border-t-2 border-[#1b1c19]/20">
          <button
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((prev) => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2.5 font-headline font-black text-xs uppercase flex items-center gap-1.5 border-2 border-[#1b1c19] rounded-none transition-all ${
              currentPage === 1
                ? 'bg-[#e5e2d8] text-[#9ba8a8] cursor-not-allowed border-[#1b1c19]/30 opacity-60'
                : 'bg-white text-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:bg-[#00ced1]/20 hover:-translate-x-0.5 hover:-translate-y-0.5'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="px-4 py-2.5 bg-[#a43c12] text-white font-headline font-black text-xs uppercase tracking-wider border-2 border-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] flex items-center gap-2">
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((prev) => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-4 py-2.5 font-headline font-black text-xs uppercase flex items-center gap-1.5 border-2 border-[#1b1c19] rounded-none transition-all ${
              currentPage === totalPages
                ? 'bg-[#e5e2d8] text-[#9ba8a8] cursor-not-allowed border-[#1b1c19]/30 opacity-60'
                : 'bg-white text-[#1b1c19] shadow-[3px_3px_0px_0px_#1b1c19] hover:bg-[#00ced1]/20 hover:-translate-x-0.5 hover:-translate-y-0.5'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});
