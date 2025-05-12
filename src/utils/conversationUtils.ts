/**
 * Utility functions for conversation data
 */
import { Conversation } from '../data/types';

/**
 * Calculate the status of a conversation based on its updated_at timestamp
 * A conversation is considered active if it was updated less than 5 minutes ago
 * 
 * @param conversation The conversation to check
 * @returns 'active' if updated less than 5 minutes ago, 'closed' otherwise
 */
export const calculateStatus = (conversation: Conversation): 'active' | 'closed' => {
  // If no updated_at timestamp, use created_at
  const lastUpdateTime = conversation.updated_at || conversation.created_at;
  
  // Calculate time difference in milliseconds
  const lastUpdate = new Date(lastUpdateTime);
  const now = new Date();
  const diffMs = now.getTime() - lastUpdate.getTime();
  
  // Convert to minutes
  const diffMinutes = diffMs / (1000 * 60);
  
  // Active if less than 5 minutes old
  return diffMinutes < 5 ? 'active' : 'closed';
};

/**
 * Calculate the duration of a conversation based on created_at and updated_at
 * 
 * @param conversation The conversation to calculate duration for
 * @returns Duration string in the format "Xm" (X minutes)
 */
export const calculateDuration = (conversation: Conversation): string => {
  const startTime = new Date(conversation.created_at);
  const endTime = conversation.updated_at ? new Date(conversation.updated_at) : new Date();
  
  // Calculate duration in minutes
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.round(durationMs / (1000 * 60));
  
  return `${durationMinutes}m`;
};

/**
 * Format a thread ID to show first 4 and last 4 characters with ellipsis in between
 * Example: "1234567890abcdef" becomes "1234...cdef"
 * 
 * @param threadId The thread ID to format
 * @returns Formatted thread ID
 */
export const formatThreadId = (threadId: string): string => {
  if (!threadId || threadId.length <= 8) {
    return threadId;
  }
  
  const first4 = threadId.substring(0, 4);
  const last4 = threadId.substring(threadId.length - 4);
  
  return `${first4}...${last4}`;
};
