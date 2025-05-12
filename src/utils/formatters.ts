/**
 * Utility functions for formatting data
 */

/**
 * Formats a thread ID to show first 4 and last 4 characters with ellipsis in between
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
