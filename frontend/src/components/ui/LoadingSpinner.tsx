import React, { HTMLAttributes } from 'react';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text,
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorStyles = {
    primary: 'text-purple-600',
    white: 'text-white',
    gray: 'text-gray-500',
  };

  const spinnerSvg = (
    <svg
      className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50"
        role="status"
        aria-live="polite"
        aria-label="Loading"
        {...props}
      >
        {spinnerSvg}
        {text && (
          <p className="mt-4 text-gray-700 text-lg font-medium">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading"
      {...props}
    >
      {spinnerSvg}
      {text && (
        <p className="mt-2 text-gray-700 text-sm font-medium">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
