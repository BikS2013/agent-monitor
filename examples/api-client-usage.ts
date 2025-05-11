import { ApiDataSource } from '../src/data/sources/ApiDataSource';
import { IDataSource } from '../src/data/sources/IDataSource';
import { AIAgent, Conversation } from '../src/data/types';

/**
 * Example demonstrating how to use the ApiDataSource
 * to interact with the Agent Monitor API
 */
async function main() {
  // Configuration options
  const API_BASE_URL = 'https://api.agent-monitor.example.com/v1';
  const AUTH_TOKEN = 'your_jwt_token_here'; // Replace with actual token
  
  // Create the API client
  const dataSource: IDataSource = new ApiDataSource(API_BASE_URL, AUTH_TOKEN);
  
  try {
    // Initialize the data source
    console.log('Initializing data source...');
    await dataSource.initialize();
    
    // Example: Get active AI agents
    console.log('Fetching active AI agents...');
    const activeAgents = await dataSource.getAIAgentsByStatus('active');
    console.log(`Found ${activeAgents.length} active AI agents`);
    
    // Example: Get conversations for a specific AI agent
    if (activeAgents.length > 0) {
      const agent = activeAgents[0];
      console.log(`Fetching conversations for AI agent: ${agent.name} (${agent.id})`);
      
      const conversations = await dataSource.getConversationsByAIAgentId(agent.id);
      console.log(`Found ${conversations.length} conversations`);
      
      // Example: Filter conversations by criteria
      console.log('Filtering high priority conversations...');
      const highPriorityConversationIds = await dataSource.filterConversations({
        priority: 'high',
        aiAgentIds: [agent.id],
        timeRange: {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          endDate: new Date().toISOString()
        }
      });
      
      console.log(`Found ${highPriorityConversationIds.length} high priority conversations`);
      
      // Example: Get details for filtered conversations
      if (highPriorityConversationIds.length > 0) {
        const highPriorityConversations = await dataSource.getConversations(highPriorityConversationIds);
        
        // Process conversation details
        Object.values(highPriorityConversations).forEach(conversation => {
          console.log(`- Conversation: ${conversation.id}`);
          console.log(`  User: ${conversation.userName}`);
          console.log(`  AI Agent: ${conversation.aiAgentName}`);
          console.log(`  Status: ${conversation.status}`);
          console.log(`  Conclusion: ${conversation.conclusion}`);
          console.log(`  Message Count: ${conversation.messageCount}`);
          console.log('  ------');
        });
      }
    }
    
    // Example: Create a new AI agent
    console.log('Creating a new AI agent...');
    const newAgent: Omit<AIAgent, 'id'> = {
      name: 'Support Assistant',
      model: 'gpt-4',
      status: 'training',
      conversationsProcessed: 0,
      successRate: '0%',
      avgResponseTime: '0ms',
      lastActive: new Date().toISOString(),
      capabilities: ['text response', 'knowledge search'],
      specializations: ['customer support', 'product information']
    };
    
    const createdAgent = await dataSource.createAIAgent(newAgent);
    console.log(`Created new AI agent with ID: ${createdAgent.id}`);
    
    // Example: Create a conversation with the new agent
    console.log('Creating a new conversation...');
    const newConversation: Omit<Conversation, 'id'> = {
      userId: 'user123',
      userName: 'John Doe',
      aiAgentId: createdAgent.id,
      aiAgentName: createdAgent.name,
      aiAgentType: createdAgent.model,
      status: 'active',
      conclusion: 'pending',
      created_at: new Date().toISOString(),
      messages: [],
      tags: ['new', 'test'],
      priority: 'medium',
      duration: '0s',
      messageCount: 0,
      confidence: 'unknown'
    };
    
    const createdConversation = await dataSource.createConversation(newConversation);
    console.log(`Created new conversation with ID: ${createdConversation.id}`);
    
    // Example: System operations
    console.log('Saving data...');
    await dataSource.saveData();
    
    console.log('All operations completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { main };