import React, { useState, useEffect, useRef } from 'react';
import { Activity } from '../types';
import { MapPin, ExternalLink, Star, Sparkles } from 'lucide-react';
import { getPlacePhoto } from '../lib/photoUtils';

interface GoogleMapViewProps {
  destination: string;
  activities: Activity[];
  selectedActivityId: string | null;
  onSelectActivity: (id: string) => void;
}

// Comprehensive center coordinates mapping for Vietnam & global destinations
const DESTINATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'quy nhon': { lat: 13.7820, lng: 109.2194 },
  'binh dinh': { lat: 13.7820, lng: 109.2194 },
  'nha trang': { lat: 12.2388, lng: 109.1967 },
  'khanh hoa': { lat: 12.2388, lng: 109.1967 },
  'phu quoc': { lat: 10.2899, lng: 103.9840 },
  'ha noi': { lat: 21.0285, lng: 105.8542 },
  hanoi: { lat: 21.0285, lng: 105.8542 },
  saigon: { lat: 10.8231, lng: 106.6297 },
  'ho chi minh': { lat: 10.8231, lng: 106.6297 },
  'da lat': { lat: 11.9404, lng: 108.4583 },
  dalat: { lat: 11.9404, lng: 108.4583 },
  sapa: { lat: 22.3364, lng: 103.8438 },
  'sa pa': { lat: 22.3364, lng: 103.8438 },
  'hoi an': { lat: 15.8801, lng: 108.3380 },
  hue: { lat: 16.4637, lng: 107.5909 },
  'ha long': { lat: 20.9599, lng: 107.0425 },
  'quang ninh': { lat: 20.9599, lng: 107.0425 },
  'vung tau': { lat: 10.3460, lng: 107.0843 },
  'phan thiet': { lat: 10.9804, lng: 108.2615 },
  'mui ne': { lat: 10.9333, lng: 108.2833 },
  'can tho': { lat: 10.0452, lng: 105.7469 },
  'ninh binh': { lat: 20.2506, lng: 105.9744 },
  'phong nha': { lat: 17.5906, lng: 106.2826 },
  'ha giang': { lat: 22.8094, lng: 104.9818 },
  'con dao': { lat: 8.6833, lng: 106.6000 },
  'da nang': { lat: 16.0544, lng: 108.2022 },
  'tuy hoa': { lat: 13.0882, lng: 109.3149 },
  'phu yen': { lat: 13.0882, lng: 109.3149 },
  kyoto: { lat: 35.0116, lng: 135.7681 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  bali: { lat: -8.5069, lng: 115.2625 },
  ubud: { lat: -8.5069, lng: 115.2625 },
  'new york': { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
  rome: { lat: 41.9028, lng: 12.4964 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
};

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  destination,
  activities,
  selectedActivityId,
  onSelectActivity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  const destLower = destination.toLowerCase();
  const matchedKey = Object.keys(DESTINATION_COORDS).find((k) => destLower.includes(k));

  // Dynamic center: Use first activity's lat/lng if present, else fallback to DESTINATION_COORDS lookup
  const firstActWithCoords = activities.find((a) => a.lat && a.lng);
  const center = firstActWithCoords
    ? { lat: firstActWithCoords.lat!, lng: firstActWithCoords.lng! }
    : matchedKey
    ? DESTINATION_COORDS[matchedKey]
    : { lat: 16.0544, lng: 108.2022 };

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || activities[0];

  useEffect(() => {
    let isSubscribed = true;

    const loadLeaflet = async () => {
      // 1. Inject Leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // 2. Inject Leaflet JS
      if (!(window as any).L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapContainerRef.current || !isSubscribed) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([center.lat, center.lng], 13);
      mapInstanceRef.current = map;

      // Force canvas recalculation to prevent blank map tiles
      setTimeout(() => {
        try {
          map.invalidateSize();
        } catch {}
      }, 150);

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Voyager tiles (Always vibrant Light Mode map for maximum legibility & color richness)
      const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tileLayer = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      markersRef.current = {};

      // Add numbered activity pins
      activities.forEach((act, idx) => {
        const latOffset = (idx % 2 === 0 ? 1 : -1) * (Math.floor(idx / 2) + 1) * 0.006;
        const lngOffset = (idx % 3 === 0 ? 1 : -1) * (Math.floor(idx / 3) + 1) * 0.008;
        const lat = act.lat || (center.lat + latOffset);
        const lng = act.lng || (center.lng + lngOffset);

        const isSelected = selectedActivityId === act.id;
        const pinSize = isSelected ? 36 : 30;
        const bgColor = isSelected ? '#a43c12' : '#00696b';
        const ringShadow = isSelected
          ? '4px 4px 0px 0px #1b1c19'
          : '3px 3px 0px 0px #1b1c19';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${pinSize + 18}px; height: ${pinSize + 18}px;">
              ${isSelected ? `
                <div style="
                  position: absolute;
                  width: ${pinSize + 10}px;
                  height: ${pinSize + 10}px;
                  background: #00ced1;
                  border: 2px solid #1b1c19;
                  border-radius: 0px;
                  box-shadow: 3px 3px 0px 0px #1b1c19;
                  transform: rotate(45deg);
                  z-index: 1;
                "></div>
              ` : ''}
              <div style="
                position: relative;
                width: ${pinSize}px;
                height: ${pinSize}px;
                background: ${bgColor};
                border-radius: 0px;
                transform: rotate(45deg);
                border: 2.5px solid #1b1c19;
                box-shadow: ${ringShadow};
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.15s ease;
                z-index: 10;
              ">
                <span style="
                  transform: rotate(-45deg);
                  color: #ffffff;
                  font-weight: 900;
                  font-size: ${isSelected ? '15px' : '13px'};
                  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                ">${idx + 1}</span>
              </div>
            </div>
          `,
          iconSize: [pinSize + 18, pinSize + 18],
          iconAnchor: [(pinSize + 18) / 2, (pinSize + 18) / 2],
          popupAnchor: [0, -(pinSize / 2) - 10],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        markersRef.current[act.id] = marker;

        const gmapsUrl = act.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.title + ' ' + (act.location || destination))}`;
        const ratingDisplay = act.rating ? `★ ${act.rating.toFixed(1)}` : '★ 4.8';
        const reviewsDisplay = act.userRatingsTotal ? `(${act.userRatingsTotal.toLocaleString()} Reviews)` : '(180+ Reviews)';

        const photoUrl = getPlacePhoto(act, destination);

        const popupBg = '#ffffff';
        const popupText = '#1b1c19';
        const popupSubtext = '#6b7a7a';

        const photoHtml = `
          <div style="position: relative; width: 100%; height: 125px; overflow: hidden; border-radius: 0px; border-bottom: 2px solid #1b1c19;">
            <img src="${photoUrl}" alt="${act.title}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.12);"></div>
            
            <!-- Stop Tag (Top Left) -->
            <div style="position: absolute; top: 8px; left: 8px; background: #a43c12; color: #ffffff; font-weight: 900; font-size: 10px; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 0px; border: 2px solid #1b1c19; box-shadow: 2px 2px 0px 0px #1b1c19; text-transform: uppercase;">
              STOP 0${idx + 1}
            </div>

            <!-- Floating Time Badge (Bottom Left) -->
            <div style="position: absolute; bottom: 8px; left: 8px; background: #00696b; color: #ffffff; font-weight: 900; font-size: 10px; font-family: 'Plus Jakarta Sans', sans-serif; padding: 3px 8px; border-radius: 0px; border: 2px solid #1b1c19; box-shadow: 2px 2px 0px 0px #1b1c19; display: flex; align-items: center; gap: 4px;">
              <span style="display: inline-block; width: 5px; height: 5px; background-color: #ffffff;"></span>
              <span>${act.time}</span>
            </div>
          </div>
        `;

        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 0 14px 14px 14px; width: 245px; text-align: left; background-color: ${popupBg}; color: ${popupText}; border-radius: 0px;">
            ${photoHtml}
            
            <div style="margin-top: 10px;">
              <div style="font-size: 14.5px; font-weight: 900; color: ${popupText}; line-height: 1.25; font-family: 'Plus Jakarta Sans', sans-serif;">${act.title}</div>
              
              ${act.location ? `<div style="font-size: 11px; color: ${popupSubtext}; margin-top: 4px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;">
                <span style="color: #00696b; font-weight: 900;">📍</span> ${act.location}
              </div>` : ''}

              <div style="display: flex; align-items: center; gap: 6px; margin-top: 5px; font-size: 11px; font-weight: 800; color: #a43c12; font-family: 'Plus Jakarta Sans', sans-serif;">
                <span>${ratingDisplay}</span>
                <span style="color: ${popupSubtext}; font-weight: 600;">${reviewsDisplay}</span>
              </div>
              
              <!-- Vibe Accent Card (Hard Neobrutalism) -->
              <div style="margin-top: 8px; background: #f5f3ee; border: 2px solid #1b1c19; padding: 6px 10px; border-radius: 0px; font-size: 11px; color: #1b1c19; font-style: italic; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; box-shadow: 2px 2px 0px 0px #1b1c19;">
                "${act.vibe}"
              </div>
              
              <!-- Hard Neobrutalist CTA Button with enhanced UX & Hover -->
              <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" class="popup-gmaps-btn" title="Open on Google Maps">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>View on Google Maps</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
              </a>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          autoPan: true,
          autoPanPaddingTopLeft: [30, 90],
          autoPanPaddingBottomRight: [30, 30],
        });

        marker.on('click', () => {
          onSelectActivity(act.id);
        });
      });
    };

    loadLeaflet();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [destination, activities]);

  // Dynamic pan to center when destination center changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView([center.lat, center.lng], 13);
    }
  }, [center.lat, center.lng]);

  // Center map camera on selected activity & dynamically update pin selection states
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).L) return;
    const L = (window as any).L;

    // 1. Update all marker icons to reflect active selection
    activities.forEach((act, idx) => {
      const marker = markersRef.current[act.id];
      if (!marker) return;

      const isSelected = selectedActivityId === act.id;
      const pinSize = isSelected ? 36 : 30;
      const bgColor = isSelected ? '#a43c12' : '#00696b';
      const ringShadow = isSelected
        ? '4px 4px 0px 0px #1b1c19'
        : '3px 3px 0px 0px #1b1c19';

      const updatedIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: ${pinSize + 18}px; height: ${pinSize + 18}px;">
            ${isSelected ? `
              <div style="
                position: absolute;
                width: ${pinSize + 10}px;
                height: ${pinSize + 10}px;
                background: #00ced1;
                border: 2px solid #1b1c19;
                border-radius: 0px;
                box-shadow: 3px 3px 0px 0px #1b1c19;
                transform: rotate(45deg);
                z-index: 1;
              "></div>
            ` : ''}
            <div style="
              position: relative;
              width: ${pinSize}px;
              height: ${pinSize}px;
              background: ${bgColor};
              border-radius: 0px;
              transform: rotate(45deg);
              border: 2.5px solid #1b1c19;
              box-shadow: ${ringShadow};
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.15s ease;
              z-index: 10;
            ">
              <span style="
                transform: rotate(-45deg);
                color: #ffffff;
                font-weight: 900;
                font-size: ${isSelected ? '15px' : '13px'};
                font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
              ">${idx + 1}</span>
            </div>
          </div>
        `,
        iconSize: [pinSize + 18, pinSize + 18],
        iconAnchor: [(pinSize + 18) / 2, (pinSize + 18) / 2],
        popupAnchor: [0, -(pinSize / 2) - 10],
      });

      marker.setIcon(updatedIcon);
    });

    // 2. Smoothly fly camera to selected pin with mathematical offset so popup is centered with 90px top margin
    if (selectedActivityId && markersRef.current[selectedActivityId]) {
      const selectedMarker = markersRef.current[selectedActivityId];
      const latLng = selectedMarker.getLatLng();

      const map = mapInstanceRef.current;
      const currentZoom = map.getZoom();
      const targetZoom = Math.max(currentZoom, 14);

      // Convert point to screen pixels, offset 90px North (upwards), and unproject back to LatLng
      const targetPoint = map.project(latLng, targetZoom).subtract([0, 90]);
      const targetCenter = map.unproject(targetPoint, targetZoom);

      map.flyTo(targetCenter, targetZoom, {
        animate: true,
        duration: 0.5,
      });

      selectedMarker.openPopup();
    }
  }, [selectedActivityId, activities]);

  const selectedPhotoUrl = selectedActivity ? getPlacePhoto(selectedActivity, destination) : '';

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-none overflow-hidden border-2 border-[#1b1c19] flex flex-col shadow-[4px_4px_0px_0px_#00696b]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 min-h-[300px]" />

      {/* Bottom Map Watermark Badge */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white px-3 py-1.5 rounded-none border-2 border-[#1b1c19] text-[11px] font-headline font-black uppercase text-[#00696b] shadow-[2px_2px_0px_0px_#1b1c19] flex items-center gap-2">
        <span className="w-2 h-2 bg-[#00ced1]"></span>
        <span>Interactive Map (CartoDB)</span>
      </div>
    </div>
  );
};
