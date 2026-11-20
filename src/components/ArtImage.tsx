import { useState } from 'react';

interface ArtImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ArtImage({ src, alt, className = '', fallbackTitle }: ArtImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1B2A4E] via-[#273963] to-[#C97714]/40 text-amber-100 p-4 ${className}`}
      >
        <svg viewBox="0 0 48 48" className="w-10 h-10 mb-2 opacity-80" fill="none">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
          <path d="M24 12 L28 22 L38 24 L28 26 L24 36 L20 26 L10 24 L20 22 Z" fill="currentColor" />
        </svg>
        {fallbackTitle && (
          <span className="text-xs font-medium text-center">{fallbackTitle}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
