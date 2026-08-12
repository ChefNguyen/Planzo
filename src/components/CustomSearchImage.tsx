import React, { useState, useEffect, startTransition } from 'react';
import { getTripCoverPhoto } from '../lib/photoUtils';

interface CustomSearchImageProps {
  query: string;
  alt: string;
  className?: string;
  isVisible?: boolean; // Only fire the API fetch when the parent tab is actually visible
}

// Module-level caches — survive React unmount/remount cycles
const imageCache: Record<string, string> = {};
// Deduplicates concurrent fetches for the same query key
const pendingRequests: Record<string, Promise<void>> = {};

export const CustomSearchImage = React.memo<CustomSearchImageProps>(({ query, alt, className = '', isVisible = true }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(() => imageCache[query] || getTripCoverPhoto(query));

  useEffect(() => {
    if (!query || !isVisible) return;

    // Bug fix 1: If cache was already populated by ANOTHER component while this
    // one was hidden, sync the cached URL to our local state now that we're visible.
    if (imageCache[query]) {
      if (imageCache[query] !== photoUrl) {
        startTransition(() => setPhotoUrl(imageCache[query]));
      }
      return;
    }

    let isMounted = true;

    // Bug fix 2: If another component is already fetching the same query,
    // attach to the same promise so we also pick up the result when it resolves.
    if (pendingRequests[query]) {
      pendingRequests[query].then(() => {
        if (isMounted && imageCache[query]) {
          startTransition(() => setPhotoUrl(imageCache[query]));
        }
      });
      return () => { isMounted = false; };
    }

    // No cache, no in-flight request — start a new fetch
    pendingRequests[query] = fetch(`/api/search-image?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.photoUrl) {
          imageCache[query] = data.photoUrl;
          if (isMounted) {
            startTransition(() => setPhotoUrl(data.photoUrl));
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
  }, [query, isVisible]);

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
