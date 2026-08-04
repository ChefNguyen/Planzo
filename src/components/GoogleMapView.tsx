import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Activity } from '../types';
import { MapPin, Key, ExternalLink } from 'lucide-react';

interface GoogleMapViewProps {
  destination: string;
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Default center coordinates mapping for common destinations
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  bali: { lat: -8.5069, lng: 115.2625 },
  ubud: { lat: -8.5069, lng: 115.2625 },
  'new york': { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
  rome: { lat: 41.9028, lng: 12.4964 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  destination,
  activities,
  selectedActivityId,
  onSelectActivity,
}) => {
  const [infoWindowOpenId, setInfoWindowOpenId] = useState<string | null>(selectedActivityId);

  useEffect(() => {
    setInfoWindowOpenId(selectedActivityId);
  }, [selectedActivityId]);

  // Determine map center
  const destLower = destination.toLowerCase();
  const matchedKey = Object.keys(DESTINATION_COORDS).find((k) => destLower.includes(k));
  const center = matchedKey ? DESTINATION_COORDS[matchedKey] : { lat: 35.0116, lng: 135.7681 };

  // Calculate slight offsets for activities so pins don't overlap
  const activityPositions = activities.map((act, idx) => {
    const latOffset = (idx % 2 === 0 ? 1 : -1) * (Math.floor(idx / 2) + 1) * 0.006;
    const lngOffset = (idx % 3 === 0 ? 1 : -1) * (Math.floor(idx / 3) + 1) * 0.008;
    return {
      ...act,
      position: {
        lat: center.lat + latOffset,
        lng: center.lng + lngOffset,
      },
    };
  });

  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[450px] bg-[#f5f3ee] flex flex-col items-center justify-center p-6 text-center border border-[#bac9c9]/30 rounded-2xl shadow-inner">
        <div className="w-14 h-14 rounded-full bg-[#00ced1]/20 text-[#00696b] flex items-center justify-center mb-4">
          <Key className="w-7 h-7" />
        </div>
        <h3 className="font-headline font-bold text-xl text-[#1b1c19] mb-2">
          Google Maps API Key Required
        </h3>
        <p className="text-sm text-[#3b4949] max-w-md mb-6 leading-relaxed">
          To enable live interactive Google Maps rendering, place coordinates, and route calculations, please configure your key.
        </p>

        <div className="bg-white p-4 rounded-xl border border-[#bac9c9]/40 text-left text-xs text-[#3b4949] space-y-2 max-w-md w-full mb-6">
          <p className="font-bold text-[#00696b]">How to configure Google Maps API Key:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Get an API key at{' '}
              <a
                href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
                target="_blank"
                rel="noreferrer"
                className="text-[#00696b] font-semibold underline inline-flex items-center gap-0.5"
              >
                Google Cloud Console <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Open <strong>Settings</strong> (⚙️ top-right) → <strong>Secrets</strong>
            </li>
            <li>
              Add Secret key: <code className="bg-[#f0eee6] px-1.5 py-0.5 rounded font-mono text-[#00696b]">GOOGLE_MAPS_PLATFORM_KEY</code>
            </li>
            <li>Paste your key & press Enter (the app rebuilds automatically).</li>
          </ol>
        </div>

        {/* Fallback Static Visual Representation */}
        <div className="w-full max-w-md p-3 bg-[#00696b]/10 rounded-xl border border-[#00696b]/20 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#00696b] shrink-0" />
          <div className="text-left">
            <span className="text-xs font-bold text-[#00696b] block">{destination} Stops</span>
            <span className="text-[11px] text-[#3b4949]">{activities.length} activity pins ready for display</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[450px] relative rounded-2xl overflow-hidden shadow-inner border border-[#bac9c9]/30">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="PLANZO_TRAVEL_MAP"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%', minHeight: '450px' }}
          gestureHandling="greedy"
        >
          {activityPositions.map((act, index) => {
            const isSelected = selectedActivityId === act.id;
            return (
              <React.Fragment key={act.id}>
                <AdvancedMarker
                  position={act.position}
                  title={act.title}
                  onClick={() => {
                    onSelectActivity(act.id);
                    setInfoWindowOpenId(act.id);
                  }}
                >
                  <Pin
                    background={isSelected ? '#a43c12' : '#00696b'}
                    glyphColor="#ffffff"
                    borderColor="#ffffff"
                    glyphText={`${index + 1}`}
                  />
                </AdvancedMarker>

                {infoWindowOpenId === act.id && (
                  <InfoWindow
                    position={act.position}
                    onCloseClick={() => setInfoWindowOpenId(null)}
                  >
                    <div className="p-1 max-w-xs font-sans">
                      <div className="text-[10px] font-bold text-[#00696b] uppercase tracking-wider mb-0.5">
                        {act.time}
                      </div>
                      <h4 className="font-bold text-sm text-[#1b1c19]">{act.title}</h4>
                      <p className="text-xs text-[#3b4949] italic mt-1 font-medium">"{act.vibe}"</p>
                      {act.location && (
                        <div className="flex items-center gap-1 text-[11px] text-[#6b7a7a] mt-2 border-t pt-1 border-[#bac9c9]/30">
                          <MapPin className="w-3.5 h-3.5 text-[#00696b]" />
                          <span>{act.location}</span>
                        </div>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </React.Fragment>
            );
          })}
        </Map>
      </APIProvider>
    </div>
  );
};
