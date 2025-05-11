import { AxiosError } from 'axios';

/**
 * Standard error format for API errors
 */
export interface ApiErrorDetails {
  status: number;
  message: string;
  details?: any;
  path?: string;
  timestamp?: string;
  code?: string;
}

/**
 * ApiError class for standardized error handling
 */
export class ApiError extends Error {
  public status: number;
  public details?: any;
  public path?: string;
  public timestamp?: string;
  public code?: string;

  constructor(errorDetails: ApiErrorDetails) {
    super(errorDetails.message);
    this.name = 'ApiError';
    this.status = errorDetails.status;
    this.details = errorDetails.details;
    this.path = errorDetails.path;
    this.timestamp = errorDetails.timestamp;
    this.code = errorDetails.code;
  }

  /**
   * Create an ApiError from an Axios error
   */
  static fromAxiosError(error: AxiosError): ApiError {
    const status = error.response?.status || 500;
    const data = error.response?.data as any;

    let message = 'An unexpected error occurred';
    let details = undefined;
    let path = undefined;
    let timestamp = undefined;
    let code = undefined;

    // Parse error details from response
    if (data) {
      // Python API error format
      if (data.message) {
        message = data.message;
        details = data.details;
        path = data.path;
        timestamp = data.timestamp;
        code = data.code;
      } 
      // Generic error format
      else if (typeof data === 'string') {
        message = data;
      } 
      // Unknown error format - try to use as is
      else {
        message = error.message;
        details = data;
      }
    } else {
      message = error.message;
    }

    return new ApiError({
      status,
      message,
      details,
      path,
      timestamp,
      code
    });
  }

  /**
   * Get a user-friendly error message
   */
  public getUserMessage(): string {
    switch (this.status) {
      case 400:
        return 'The request was invalid. Please check your input and try again.';
      case 401:
        return 'Your session has expired or you are not authenticated. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This operation caused a conflict. The resource might have been modified by another user.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'An unexpected server error occurred. Please try again later.';
      default:
        return this.message || 'An unexpected error occurred.';
    }
  }

  /**
   * Check if the error is a network error
   */
  public isNetworkError(): boolean {
    return this.status === 0 || !navigator.onLine;
  }

  /**
   * Check if the error is an authentication error
   */
  public isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if the error is a validation error
   */
  public isValidationError(): boolean {
    return this.status === 400 && !!this.details;
  }

  /**
   * Get validation errors as field-error pairs
   */
  public getValidationErrors(): Record<string, string> | null {
    if (!this.isValidationError()) {
      return null;
    }

    // Try to extract validation errors from details
    if (typeof this.details === 'object') {
      return this.details;
    }

    return null;
  }
}