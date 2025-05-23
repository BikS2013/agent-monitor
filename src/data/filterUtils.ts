import { Conversation, Collection } from './types';

/**
 * Filters conversations based on collection filter criteria
 */
export const filterConversationsByCollectionCriteria = (
  conversations: Record<string, Conversation>,
  filterCriteria: any
): string[] => {
  // Get all conversations as an array
  const conversationArray = Object.values(conversations);
  console.log(`Filtering ${conversationArray.length} total conversations with criteria:`, filterCriteria);

  let filteredConversations: Conversation[] = [];

  // Filter by AI Agent
  if (filterCriteria.aiAgentBased && filterCriteria.aiAgentBased.length > 0) {
    filteredConversations = conversationArray.filter(conversation =>
      filterCriteria.aiAgentBased.includes(conversation.aiAgentId)
    );
  }
  // Filter by Time
  else if (filterCriteria.timeBased) {
    const now = new Date();
    let startDate: Date | null = null;

    if (filterCriteria.timeBased.period) {
      // Calculate start date based on period
      switch (filterCriteria.timeBased.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = new Date(now.setHours(0, 0, 0, 0));
      }
    } else if (filterCriteria.timeBased.startDate) {
      // Use custom date range and set to beginning of the day (00:00:00.000)
      startDate = new Date(filterCriteria.timeBased.startDate);
      startDate.setHours(0, 0, 0, 0);
    }

    // Set end date if provided, otherwise use current time
    let endDate;
    if (filterCriteria.timeBased.endDate) {
      // Set to end of the day (23:59:59.999) to include the entire day
      endDate = new Date(filterCriteria.timeBased.endDate);
      endDate.setHours(23, 59, 59, 999);
    } else {
      endDate = new Date();
    }

    if (startDate) {
      console.log('Time filter - Start date:', startDate.toISOString());
      console.log('Time filter - End date:', endDate.toISOString());

      filteredConversations = conversationArray.filter(conversation => {
        const conversationDate = new Date(conversation.created_at);
        return conversationDate >= startDate! && conversationDate <= endDate;
      });

      console.log(`Time filter - Found ${filteredConversations.length} matching conversations`);
    } else {
      filteredConversations = conversationArray;
    }
  }
  // Filter by Outcome
  else if (filterCriteria.outcomeBased) {
    if (filterCriteria.outcomeBased === 'all') {
      filteredConversations = conversationArray;
    } else {
      filteredConversations = conversationArray.filter(conversation =>
        conversation.conclusion === filterCriteria.outcomeBased
      );
    }
  }
  // Filter by Multiple Factors
  else if (filterCriteria.multiFactorFilters && filterCriteria.multiFactorFilters.length > 0) {
    // Start with all conversations
    filteredConversations = conversationArray;

    // Apply each filter sequentially
    for (const filter of filterCriteria.multiFactorFilters) {
      // Filter by agent(s)
      if (filter.agentId) {
        // For backward compatibility
        filteredConversations = filteredConversations.filter(conversation =>
          conversation.aiAgentId === filter.agentId
        );
      } else if (filter.agentIds && filter.agentIds.length > 0) {
        // New format with multiple agent IDs
        filteredConversations = filteredConversations.filter(conversation =>
          filter.agentIds.includes(conversation.aiAgentId)
        );
      }

      // Filter by time range
      if (filter.timeRange) {
        const now = new Date();
        let startDate: Date | null = null;

        if (filter.timeRange.period) {
          // Calculate start date based on period
          switch (filter.timeRange.period) {
            case 'today':
              startDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'quarter':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 3);
              break;
            case 'year':
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);
              break;
            default:
              startDate = new Date(now.setHours(0, 0, 0, 0));
          }
        } else if (filter.timeRange.startDate) {
          // Use custom date range and set to beginning of the day (00:00:00.000)
          startDate = new Date(filter.timeRange.startDate);
          startDate.setHours(0, 0, 0, 0);
        }

        // Set end date if provided, otherwise use current time
        let endDate;
        if (filter.timeRange.endDate) {
          // Set to end of the day (23:59:59.999) to include the entire day
          endDate = new Date(filter.timeRange.endDate);
          endDate.setHours(23, 59, 59, 999);
        } else {
          endDate = new Date();
        }

        if (startDate) {
          console.log('Multi-factor time filter - Start date:', startDate.toISOString());
          console.log('Multi-factor time filter - End date:', endDate.toISOString());

          const beforeCount = filteredConversations.length;
          filteredConversations = filteredConversations.filter(conversation => {
            const conversationDate = new Date(conversation.created_at);
            return conversationDate >= startDate! && conversationDate <= endDate;
          });

          console.log(`Multi-factor time filter - Filtered from ${beforeCount} to ${filteredConversations.length} conversations`);
        }
      }

      // Filter by outcome
      if (filter.outcome) {
        if (filter.outcome !== 'all') {
          filteredConversations = filteredConversations.filter(conversation =>
            conversation.conclusion === filter.outcome
          );
        }
      }

      // Filter by priority
      if (filter.priority) {
        filteredConversations = filteredConversations.filter(conversation =>
          conversation.priority === filter.priority
        );
      }

      // Filter by tags (exact match for any in the array)
      if (filter.tags && filter.tags.length > 0) {
        filteredConversations = filteredConversations.filter(conversation =>
          conversation.tags.some(tag => filter.tags.includes(tag))
        );
      }

      // Filter by message count (min and/or max)
      if (filter.messageCount) {
        if (filter.messageCount.min !== undefined) {
          filteredConversations = filteredConversations.filter(conversation =>
            conversation.messageCount >= filter.messageCount.min
          );
        }
        if (filter.messageCount.max !== undefined) {
          filteredConversations = filteredConversations.filter(conversation =>
            conversation.messageCount <= filter.messageCount.max
          );
        }
      }
    }
  } else {
    // No filters, return all conversations
    filteredConversations = conversationArray;
  }

  // Return conversation thread_ids
  const result = filteredConversations.map(conversation => conversation.thread_id);
  console.log(`Filter result: ${result.length} matching conversations`);
  return result;
};

/**
 * Filters conversations based on collection's new filter format (FilterElement array)
 */
export const filterConversationsByCollection = (
  conversations: Record<string, Conversation>,
  collection: Collection
): Conversation[] => {
  const conversationArray = Object.values(conversations);
  
  // Handle new filter format (array of FilterElement)
  if (collection.filter && Array.isArray(collection.filter) && collection.filter.length > 0) {
    // Collection includes conversations that meet ANY of the filter elements (OR logic)
    const matchingConversations = new Set<Conversation>();
    
    for (const filterElement of collection.filter) {
      let filtered = conversationArray;
      
      // Filter by AI agents
      if (filterElement.aiAgentIds && filterElement.aiAgentIds.length > 0) {
        filtered = filtered.filter(conv => 
          filterElement.aiAgentIds!.includes(conv.aiAgentId)
        );
      }
      
      // Filter by time range
      if (filterElement.timeRange) {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date = new Date();
        
        if (filterElement.timeRange.period) {
          switch (filterElement.timeRange.period) {
            case 'today':
              startDate = new Date(now.setHours(0, 0, 0, 0));
              break;
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              break;
            case 'quarter':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 3);
              break;
            case 'year':
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);
              break;
          }
        } else if (filterElement.timeRange.startDate) {
          startDate = new Date(filterElement.timeRange.startDate);
          startDate.setHours(0, 0, 0, 0);
        }
        
        if (filterElement.timeRange.endDate) {
          endDate = new Date(filterElement.timeRange.endDate);
          endDate.setHours(23, 59, 59, 999);
        }
        
        if (startDate) {
          filtered = filtered.filter(conv => {
            const convDate = new Date(conv.created_at);
            return convDate >= startDate! && convDate <= endDate;
          });
        }
      }
      
      // Filter by outcome
      if (filterElement.outcome && filterElement.outcome !== 'all') {
        filtered = filtered.filter(conv => 
          conv.conclusion === filterElement.outcome
        );
      }
      
      // Add all filtered conversations to the set
      filtered.forEach(conv => matchingConversations.add(conv));
    }
    
    return Array.from(matchingConversations);
  }
  
  // Handle legacy filterCriteria format
  if (collection.filterCriteria) {
    const threadIds = filterConversationsByCollectionCriteria(conversations, collection.filterCriteria);
    return threadIds.map(id => conversations[id]).filter(Boolean);
  }
  
  // No filters, return all conversations
  return conversationArray;
};
