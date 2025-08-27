import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FirebaseImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export function FirebaseImage({
  src,
  alt,
  width = 200,
  height = 200,
  className,
  fallbackSrc = '/placeholder-coffee.png',
  priority = false
}: FirebaseImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  // Convert Firebase Storage URLs to public URLs if needed
  const getImageUrl = (url: string) => {
    if (!url) return fallbackSrc;
    
    // If it's already a full URL, return it
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a Firebase path, construct the full URL
    if (url.startsWith('products/')) {
      return `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BASE_URL}/${url}`;
    }
    
    return url;
  };

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={getImageUrl(imgSrc)}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onError={handleError}
        className="object-cover w-full h-full"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image not found</p>
          </div>
        </div>
      )}
    </div>
  );
}
