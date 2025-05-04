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
      // Use custom date range
      startDate = new Date(filterCriteria.timeBased.startDate);
    }

    // Set end date if provided, otherwise use current time
    const endDate = filterCriteria.timeBased.endDate 
      ? new Date(filterCriteria.timeBased.endDate) 
      : new Date();
    
    if (startDate) {
      filteredConversations = conversationArray.filter(conversation => {
        const conversationDate = new Date(conversation.startTimestamp);
        return conversationDate >= startDate! && conversationDate <= endDate;
      });
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
      // Filter by agent
      if (filter.agentId) {
        filteredConversations = filteredConversations.filter(conversation => 
          conversation.aiAgentId === filter.agentId
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
            default:
              startDate = new Date(now.setHours(0, 0, 0, 0));
          }
        } else if (filter.timeRange.startDate) {
          // Use custom date range
          startDate = new Date(filter.timeRange.startDate);
        }

        // Set end date if provided, otherwise use current time
        const endDate = filter.timeRange.endDate 
          ? new Date(filter.timeRange.endDate) 
          : new Date();
        
        if (startDate) {
          filteredConversations = filteredConversations.filter(conversation => {
            const conversationDate = new Date(conversation.startTimestamp);
            return conversationDate >= startDate! && conversationDate <= endDate;
          });
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
    }
  } else {
    // No filters, return all conversations
    filteredConversations = conversationArray;
  }
  
  // Return conversation IDs
  return filteredConversations.map(conversation => conversation.id);
};
