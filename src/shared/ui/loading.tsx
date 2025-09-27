'use client';

import React from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { cn } from '../../core/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'coffee' | 'dots';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className,
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'coffee') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className="relative">
          <Coffee 
            className={cn(
              'text-amber-600 animate-bounce',
              sizeClasses[size]
            )} 
          />
          <div className="absolute inset-0 animate-ping">
            <Coffee 
              className={cn(
                'text-amber-400 opacity-75',
                sizeClasses[size]
              )} 
            />
          </div>
        </div>
        {text && (
          <p className={cn(
            'text-gray-600 dark:text-gray-400 font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-amber-600 rounded-full animate-pulse',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn(
            'text-gray-600 dark:text-gray-400 font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 
        className={cn(
          'animate-spin text-amber-600',
          sizeClasses[size]
        )} 
      />
      {text && (
        <p className={cn(
          'text-gray-600 dark:text-gray-400 font-medium',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

interface LoadingCardProps {
  className?: string;
  children?: React.ReactNode;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ className, children }) => {
  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6',
      className
    )}>
      {children || (
        <div className="space-y-4">
          <div className="animate-shimmer h-6 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="space-y-2">
            <div className="animate-shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="animate-shimmer h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          </div>
        </div>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = 'Loading...',
  className
}) => {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center',
      className
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <LoadingSpinner 
          size="lg" 
          variant="coffee" 
          text={text}
        />
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingCard, LoadingOverlay };