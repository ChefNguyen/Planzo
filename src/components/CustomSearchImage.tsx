import React, { useState, useEffect } from 'react';
import { getTripCoverPhoto } from '../lib/photoUtils';

interface CustomSearchImageProps {
  query: string;
  alt: string;
  className?: string;
}

// Global in-memory cache for fetched Custom Search photos
const imageCache: Record<string, string> = {};

export const CustomSearchImage = React.memo<CustomSearchImageProps>(({ query, alt, className = '' }) => {
  const [photoUrl, setPhotoUrl] = useState<string>(() => imageCache[query] || getTripCoverPhoto(query));

  useEffect(() => {
    if (!query || imageCache[query]) return;

    let isMounted = true;
    fetch(`/api/search-image?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.photoUrl) {
          imageCache[query] = data.photoUrl;
          setPhotoUrl(data.photoUrl);
        }
      })
      .catch(() => {});

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
          setPhotoUrl(getTripCoverPhoto(query));
        }}
      />
    </div>
  );
});
