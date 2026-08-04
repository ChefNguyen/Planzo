import React from 'react';
import { Itinerary } from '../types';
import { MapPin, Calendar, Clock, ArrowRight, Trash2, ExternalLink } from 'lucide-react';

interface MyTripsViewProps {
  savedTrips: Itinerary[];
  onSelectTrip: (trip: Itinerary) => void;
  onDeleteTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  savedTrips,
  onSelectTrip,
  onDeleteTrip,
  onCreateNewTrip,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 min-h-[70vh]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-headline font-extrabold text-3xl text-[#00696b]">My Trips</h2>
          <p className="text-sm text-[#3b4949] mt-1">
            Your saved AI-generated travel itineraries and escapes.
          </p>
        </div>
        <button
          onClick={onCreateNewTrip}
          className="bg-[#00696b] text-white px-5 py-2.5 rounded-full font-headline font-bold text-sm hover:bg-[#005354] transition-all shadow-sm"
        >
          + Plan New Escape
        </button>
      </div>

      {savedTrips.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-[#00ced1]/20 rounded-full flex items-center justify-center mx-auto text-[#00696b]">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="font-headline font-bold text-xl text-[#1b1c19]">No Trips Saved Yet</h3>
          <p className="text-sm text-[#3b4949] max-w-md mx-auto">
            Use the Planzo AI generator to craft your first vibe-based itinerary and sync it to your calendar!
          </p>
          <button
            onClick={onCreateNewTrip}
            className="bg-[#fe7e4f] text-white px-6 py-3 rounded-xl font-headline font-bold text-sm hover:bg-[#a43c12] transition-all shadow-md"
          >
            Generate Itinerary Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTrips.map((trip) => (
            <div
              key={trip.id}
              className="glass-card rounded-2xl p-6 border border-[#bac9c9]/30 hover:border-[#00696b] transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-[#00696b] bg-[#00ced1]/20 px-3 py-1 rounded-full">
                    {trip.region || 'Curated Escape'}
                  </span>
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="text-[#6b7a7a] hover:text-[#ba1a1a] p-1 transition-colors"
                    title="Delete Trip"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-headline font-extrabold text-xl text-[#1b1c19] mb-1 group-hover:text-[#00696b] transition-colors">
                  {trip.destination}
                </h3>
                <p className="text-xs text-[#6b7a7a] flex items-center gap-1 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{trip.dates}</span>
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-[#3b4949]">
                    <Clock className="w-3.5 h-3.5 text-[#00696b]" />
                    <span>{trip.totalStops} Stops • {trip.activeHours} Hours Active</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {trip.vibes.map((v, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-white/80 border border-[#bac9c9]/40 text-[#3b4949] px-2.5 py-0.5 rounded-full"
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
                <span>View Full Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
