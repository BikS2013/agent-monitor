import React, { useState, useEffect } from 'react';
import { ApiError } from '../../data/api/ApiError';

interface ErrorNotificationProps {
  error: ApiError | Error | null;
  onDismiss: () => void;
  autoHideDuration?: number;
}

/**
 * Component for displaying API errors as notifications
 */
export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  error,
  onDismiss,
  autoHideDuration = 5000
}) => {
  const [visible, setVisible] = useState(!!error);

  // Auto-hide the notification after a delay
  useEffect(() => {
    if (error) {
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, autoHideDuration);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [error, autoHideDuration, onDismiss]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  if (!error || !visible) {
    return null;
  }

  // Extract error details
  const isApiError = error instanceof ApiError;
  const message = isApiError 
    ? error.getUserMessage() 
    : error.message || 'An unexpected error occurred';
  
  const details = isApiError && error.details 
    ? typeof error.details === 'string' 
      ? error.details 
      : JSON.stringify(error.details, null, 2) 
    : null;

  // Determine color based on error type/status
  let bgColor = 'bg-red-100';
  let textColor = 'text-red-700';
  let borderColor = 'border-red-300';
  
  if (isApiError) {
    if (error.status === 401 || error.status === 403) {
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-300';
    } else if (error.isNetworkError()) {
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      borderColor = 'border-gray-300';
    }
  }

  return (
    <div 
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg border ${bgColor} ${borderColor} max-w-md z-50`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-1">
          <h3 className={`font-semibold ${textColor}`}>
            {isApiError ? `Error ${error.status}` : 'Error'}
          </h3>
          <p className={`mt-1 ${textColor}`}>{message}</p>
          
          {details && (
            <details className="mt-2">
              <summary className={`cursor-pointer ${textColor} text-sm`}>
                Show Details
              </summary>
              <pre className={`mt-2 text-xs p-2 rounded bg-white/50 ${textColor} overflow-x-auto`}>
                {details}
              </pre>
            </details>
          )}
          
          {isApiError && error.path && (
            <p className={`mt-1 text-xs ${textColor}`}>
              Path: {error.path}
            </p>
          )}
        </div>
        
        <button 
          onClick={handleDismiss}
          className={`ml-4 p-1 ${textColor} hover:bg-white/20 rounded`}
          aria-label="Dismiss"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ErrorNotification;