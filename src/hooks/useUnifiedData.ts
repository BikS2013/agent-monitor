import { useContext } from 'react';
import { ConversationsRepositoryContext } from '../context/ConversationsRepositoryContext';
import { DataContext } from '../context/DataContext';
import { ConversationsDataContext } from '../context/ConversationsDataContext';

/**
 * Hook that provides unified data access, always preferring the Conversations data source.
 * This ensures that collections and conversations always come from the same data source
 * as the conversations page (ConversationsDataContext).
 *
 * Priority order:
 * 1. ConversationsDataContext (if available) - Always preferred
 * 2. Regular DataContext (fallback only)
 */
export const useUnifiedData = () => {
  // Check if Conversations API is enabled by checking the context
  const conversationsRepoContext = useContext(ConversationsRepositoryContext);

  // Try to get data from ConversationsDataContext first
  const conversationsDataContext = useContext(ConversationsDataContext);

  // Get regular data context
  const regularDataContext = useContext(DataContext);

  // Debug logging
  console.log('useUnifiedData: Context selection', {
    hasConversationsDataContext: !!conversationsDataContext,
    hasConversationsRepoContext: !!conversationsRepoContext,
    conversationsApiEnabled: conversationsRepoContext?.isUsingApi,
    hasRegularDataContext: !!regularDataContext,
    willUseConversationsApi: !!conversationsDataContext
  });

  // Always prefer ConversationsDataContext if available (regardless of API status)
  // This ensures collections page always uses the same data source as conversations page
  if (conversationsDataContext) {
    console.log('useUnifiedData: Using ConversationsDataContext for collections and conversations (preferred)');
    return conversationsDataContext;
  }

  // Fallback to regular data context only if ConversationsDataContext is not available
  if (!regularDataContext) {
    throw new Error('useUnifiedData must be used within a DataProvider or ConversationsDataProvider');
  }

  console.log('useUnifiedData: Using regular DataContext for collections and conversations (fallback)');
  return regularDataContext;
};