import React from 'react';
import { SAMPLE_COMMUNITY_TRIPS } from '../data/mockData';
import { Itinerary } from '../types';
import { Sparkles, MapPin, Compass, ArrowRight } from 'lucide-react';

interface CommunityViewProps {
  onSelectTrip: (trip: Itinerary) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ onSelectTrip }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-[70vh]">
      <div className="mb-8">
        <h2 className="font-headline font-extrabold text-3xl text-[#00696b] flex items-center gap-2">
          <span>Community Vibe Vault</span>
          <Sparkles className="w-6 h-6 text-[#fe7e4f]" />
        </h2>
        <p className="text-sm text-[#3b4949] mt-1">
          Explore trending AI itineraries created by travelers around the globe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_COMMUNITY_TRIPS.map((trip) => (
          <div
            key={trip.id}
            className="glass-card rounded-2xl p-6 border border-[#bac9c9]/30 hover:border-[#00696b] transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#00696b] bg-[#00ced1]/20 px-3 py-1 rounded-full">
                  {trip.destination}
                </span>
                <span className="text-xs text-[#6b7a7a] font-medium">🔥 Popular</span>
              </div>

              <h3 className="font-headline font-extrabold text-xl text-[#1b1c19] mb-2">
                {trip.region}
              </h3>

              <p className="text-xs text-[#3b4949] mb-4">
                {trip.totalStops} curated stops designed for {trip.vibes.join(', ')}.
              </p>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {trip.vibes.map((v, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white border border-[#bac9c9]/30 text-[#3b4949] px-2.5 py-0.5 rounded-full"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectTrip(trip)}
              className="w-full bg-[#00696b] hover:bg-[#005354] text-white py-2.5 rounded-xl font-headline font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore & Clone Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
