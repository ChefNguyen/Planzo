import React from 'react';
import { Itinerary } from '../types';
import { Sparkles, MapPin, ArrowRight, Globe, Flame } from 'lucide-react';
import { CustomSearchImage } from './CustomSearchImage';

interface CommunityViewProps {
  trips: Itinerary[];
  onSelectTrip: (trip: Itinerary) => void;
}

export const CommunityView = React.memo<CommunityViewProps>(({ trips, onSelectTrip }) => {
  const displayTrips = trips.slice(0, 12);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-[70vh]">
      {/* Header Section */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#a43c12]/10 text-[#a43c12] text-xs font-headline font-black uppercase tracking-wider mb-2 border border-[#a43c12]/30 rounded-none">
          <Globe className="w-3.5 h-3.5" />
          <span>Top {displayTrips.length} Trending Curations</span>
        </div>
        <h2 className="font-headline font-extrabold text-3xl text-[#00696b] flex items-center gap-2">
          <span>Community Vibe Vault</span>
          <Globe className="w-6 h-6 text-[#a43c12]" />
        </h2>
        <p className="text-sm text-[#3b4949] mt-1">
          Explore top trending AI itineraries created by travelers around the globe.
        </p>
      </div>

      {displayTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4 opacity-70">
          <Globe className="w-16 h-16 text-[#bac9c9]" />
          <h3 className="font-headline font-bold text-xl text-[#3b4949]">No community trips yet</h3>
          <p className="text-sm text-[#6b7a7a] max-w-xs">
            Be the first! Generate a trip itinerary and it will appear here for everyone to discover.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTrips.map((trip) => {
            return (
              <div
                key={trip.id}
                className="bg-white border-2 border-[#1b1c19] rounded-none shadow-[5px_5px_0px_0px_#00696b] hover:shadow-[7px_7px_0px_0px_#00696b] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Card Cover Image Header */}
                  <div className="h-44 w-full relative overflow-hidden bg-[#f0eee6] rounded-none border-b-2 border-[#1b1c19]">
                    <CustomSearchImage
                      query={trip.destination || trip.region}
                      alt={trip.destination}
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />

                    {/* Neobrutalist Location Pill Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1b1c19] text-white text-xs font-headline font-black uppercase tracking-wider border-2 border-white/30 rounded-none shadow-[2px_2px_0px_0px_#00696b]">
                        <span className="w-2 h-2 bg-[#00ced1] shrink-0" />
                        <span>{trip.region || trip.destination}</span>
                      </span>
                    </div>

                    {/* Modern Icon-Only Flame Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <div
                        className="w-8 h-8 bg-[#a43c12] text-white flex items-center justify-center border-2 border-[#1b1c19] rounded-none shadow-[2px_2px_0px_0px_#1b1c19]"
                        title="Trending Popular Itinerary"
                      >
                        <Flame className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-headline font-black text-2xl text-[#1b1c19] group-hover:text-[#00696b] transition-colors truncate">
                        {trip.destination}
                      </h3>
                      {trip.duration?.formatted && (
                        <span className="text-xs font-headline font-black uppercase tracking-wider text-[#a43c12] bg-[#a43c12]/15 border border-[#a43c12]/30 px-2.5 py-0.5 rounded-none shrink-0">
                          {trip.duration.formatted}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-[#00696b] mb-3 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00696b] shrink-0" />
                      <span>{trip.totalStops} curated stops • {trip.activeHours || 6} hrs active</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {trip.vibes.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-[#f5f3ee] border-2 border-[#1b1c19] text-[#3b4949] font-black uppercase px-2.5 py-0.5 rounded-none"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => onSelectTrip(trip)}
                    className="w-full neobrutal-btn-teal py-3 font-headline font-black uppercase text-xs sm:text-sm flex items-center justify-center gap-2 transition-all rounded-none"
                  >
                    <span>Explore & Clone Itinerary</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
