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
  const [loading, setLoading] = useState<boolean>(!imageCache[query]);

  useEffect(() => {
    if (!query) return;

    if (imageCache[query]) {
      setPhotoUrl(imageCache[query]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`/api/search-image?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.photoUrl) {
          imageCache[query] = data.photoUrl;
          setPhotoUrl(data.photoUrl);
        }
      })
      .catch((err) => {
        console.warn('[Google Custom Search] Image fetch failed:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-[#eae8e1] animate-pulse z-10 flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#00696b] tracking-wider uppercase opacity-75">
            Google Photo...
          </span>
        </div>
      )}
      <img
        src={photoUrl}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => {
          setPhotoUrl(getTripCoverPhoto(query));
        }}
      />
    </div>
  );
});
