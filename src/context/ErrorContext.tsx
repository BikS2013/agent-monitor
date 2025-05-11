import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ApiError } from '../data/api/ApiError';
import ErrorNotification from '../components/common/ErrorNotification';

interface ErrorContextType {
  handleError: (error: Error | ApiError | unknown) => void;
  clearError: () => void;
  currentError: Error | ApiError | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Provider for global error handling
 */
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentError, setCurrentError] = useState<Error | ApiError | null>(null);

  /**
   * Handle and process an error
   */
  const handleError = (error: Error | ApiError | unknown) => {
    console.error('Application error:', error);
    
    if (error instanceof ApiError || error instanceof Error) {
      setCurrentError(error);
    } else if (typeof error === 'string') {
      setCurrentError(new Error(error));
    } else {
      setCurrentError(new Error('An unknown error occurred'));
    }
    
    // Check for authentication errors and redirect to login if needed
    if (error instanceof ApiError && error.isAuthError()) {
      // Clear any stored authentication data
      localStorage.removeItem('agent_monitor_api_token');
      localStorage.removeItem('agent_monitor_token_expiry');
      
      // If we're not already on the login page, show the auth error
      // In a real app, we might want to redirect to login or prompt the user
    }
  };

  /**
   * Clear the current error
   */
  const clearError = () => {
    setCurrentError(null);
  };

  const value: ErrorContextType = {
    handleError,
    clearError,
    currentError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorNotification 
        error={currentError} 
        onDismiss={clearError} 
      />
    </ErrorContext.Provider>
  );
};

/**
 * Hook for using the error context
 */
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

/**
 * Utility function to handle an API operation with error handling
 */
export const safeApiCall = async <T,>(
  apiCall: () => Promise<T>,
  onSuccess?: (result: T) => void
): Promise<T | null> => {
  const { handleError } = useError();
  
  try {
    const result = await apiCall();
    
    if (onSuccess) {
      onSuccess(result);
    }
    
    return result;
  } catch (error) {
    handleError(error);
    return null;
  }
};

export default ErrorProvider;