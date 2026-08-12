import React, { useState, useEffect, startTransition } from 'react';
import { getTripCoverPhoto } from '../lib/photoUtils';

interface CustomSearchImageProps {
  query: string;
  alt: string;
  className?: string;
}

// Module-level caches — survive React unmount/remount cycles
const imageCache: Record<string, string> = {};
// Deduplicates concurrent fetches for the same query key
const pendingRequests: Record<string, Promise<void>> = {};

export const CustomSearchImage = React.memo<CustomSearchImageProps>(({ query, alt, className = '' }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(() => imageCache[query] || getTripCoverPhoto(query));

  useEffect(() => {
    if (!query || imageCache[query]) return;

    // If a fetch for this query is already in-flight, skip — it will populate the cache
    if (pendingRequests[query]) return;

    let isMounted = true;

    pendingRequests[query] = fetch(`/api/search-image?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.photoUrl) {
          imageCache[query] = data.photoUrl;
          // Defer the state update so it never blocks tab switching or user interactions
          if (isMounted) {
            startTransition(() => {
              setPhotoUrl(data.photoUrl);
            });
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        delete pendingRequests[query];
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className={`relative overflow-hidden bg-[#e6e3d8] ${className}`}>
      <img
        src={photoUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => {
          startTransition(() => setPhotoUrl(getTripCoverPhoto(query)));
        }}
      />
    </div>
  );
});
