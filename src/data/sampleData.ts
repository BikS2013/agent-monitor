/**
 * Sample data for AI Agent Monitor application
 * Contains a comprehensive set of mock data for all entity types
 */
import { Message, Conversation, Collection, Group, AIAgent, User } from './types';
import { faker } from '@faker-js/faker';

// Seed faker for consistent results
faker.seed(123);

// Generate a random timestamp within a range
const randomTimestamp = (startDate: Date, endDate: Date = new Date()): string => {
  return faker.date.between({ from: startDate, to: endDate }).toISOString();
};

// Calculate duration in minutes between two timestamps
const calculateDuration = (startTimestamp: string, endTimestamp?: string): string => {
  const start = new Date(startTimestamp);
  const end = endTimestamp ? new Date(endTimestamp) : new Date();
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return `${minutes}m`;
};

// Generate AI agent names
const aiAgentNames = [
  'Claude', 'GPT-4', 'Llama', 'Falcon', 'Gemini',
  'Bard', 'Mistral', 'Sage', 'Nexus', 'Athena',
  'Eliza', 'Jarvis', 'Watson', 'Echo', 'Nova'
];

// Generate AI agent models
const aiAgentModels = [
  'Claude-3.5-Sonnet', 'GPT-4-Turbo', 'Llama-3-70B', 'Falcon-180B', 'Gemini-Pro',
  'PaLM-2', 'Mistral-8x7B', 'Sage-20B', 'Nexus-13B', 'Athena-65B'
];

// Static users with different roles
const userRecords: Record<string, User> = {
  'admin1': {
    id: 'admin1',
    name: 'Alex Johnson',
    role: 'admin',
    permissions: ['edit', 'delete', 'create', 'view']
  },
  'admin2': {
    id: 'admin2',
    name: 'Morgan Chen',
    role: 'admin',
    permissions: ['edit', 'delete', 'create', 'view']
  },
  'super1': {
    id: 'super1',
    name: 'Taylor Williams',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  'super2': {
    id: 'super2',
    name: 'Sam Rodriguez',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  'super3': {
    id: 'super3',
    name: 'Jordan Lee',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  'exec1': {
    id: 'exec1',
    name: 'Casey Smith',
    role: 'executive',
    permissions: ['view']
  },
  'exec2': {
    id: 'exec2',
    name: 'Jamie Davis',
    role: 'executive',
    permissions: ['view']
  }
};

// Generate AI agents
const generateAIAgents = (count: number): Record<string, AIAgent> => {
  const aiAgents: Record<string, AIAgent> = {};

  for (let i = 0; i < count; i++) {
    const id = `ai${i + 1}`;
    const randomIndex = i % aiAgentNames.length;
    const status = Math.random() > 0.2 ?
      'active' :
      (Math.random() > 0.5 ? 'inactive' : 'training');

    const conversations = Math.floor(Math.random() * 500) + 50;
    const successRate = Math.floor(Math.random() * 30) + 70; // 70-99%

    aiAgents[id] = {
      id,
      name: aiAgentNames[randomIndex],
      model: aiAgentModels[randomIndex],
      status,
      conversationsProcessed: conversations,
      successRate: `${successRate}%`,
      avgResponseTime: `${Math.floor(Math.random() * 25) + 5}m`,
      lastActive: randomTimestamp(new Date(2023, 0, 1)),
      capabilities: [
        'natural language',
        'conversation',
        'knowledge retrieval',
        'problem solving',
        'personalization'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      specializations: [
        'customer support',
        'technical support',
        'sales',
        'booking',
        'feedback'
      ].slice(0, Math.floor(Math.random() * 2) + 1)
    };
  }

  return aiAgents;
};

// Generate a set of messages for a conversation
const generateMessages = (
  conversationId: string,
  count: number,
  startTimestamp: string,
  endTimestamp?: string,
  userNames: string[] = ['Customer', 'Client']
): [Record<string, Message>, string[]] => {
  const messages: Record<string, Message> = {};
  const messageIds: string[] = [];
  const startDate = new Date(startTimestamp);
  const endDate = endTimestamp ? new Date(endTimestamp) : new Date();

  // Common customer support topics
  const supportTopics = [
    'account access', 'billing issue', 'product feature',
    'technical problem', 'how to', 'subscription change',
    'refund request', 'service outage', 'payment method',
    'password reset', 'account upgrade', 'product compatibility'
  ];

  // Select a topic for this conversation
  const topic = supportTopics[Math.floor(Math.random() * supportTopics.length)];

  // First message always from user
  let currentSender: 'user' | 'ai' = 'user';
  const userName = userNames[Math.floor(Math.random() * userNames.length)];
  const aiName = ['AI Assistant', 'Support Agent', 'Help Desk'][Math.floor(Math.random() * 3)];

  // Generate opening messages based on the selected topic
  let firstMessage = '';
  switch(topic) {
    case 'account access':
      firstMessage = "I can't log into my account. It keeps saying my password is incorrect even though I'm sure it's right.";
      break;
    case 'billing issue':
      firstMessage = "I was charged twice for my subscription this month. Can you help me get a refund for the duplicate charge?";
      break;
    case 'product feature':
      firstMessage = "I'm trying to figure out how to use the new export feature. The documentation isn't very clear.";
      break;
    case 'technical problem':
      firstMessage = "The app keeps crashing whenever I try to upload a file larger than 10MB. Is this a known issue?";
      break;
    case 'how to':
      firstMessage = "How do I change my notification settings? I'm getting too many emails.";
      break;
    case 'subscription change':
      firstMessage = "I'd like to upgrade my subscription from the basic to the premium plan. What's the process?";
      break;
    case 'refund request':
      firstMessage = "I purchased the wrong plan and need a refund. I haven't used any of the premium features yet.";
      break;
    case 'service outage':
      firstMessage = "Is the service down? I've been trying to access the dashboard for the past hour but keep getting errors.";
      break;
    case 'payment method':
      firstMessage = "I need to update my credit card information. My current card is expiring this month.";
      break;
    case 'password reset':
      firstMessage = "I forgot my password and the reset link isn't coming through to my email. Can you help?";
      break;
    default:
      firstMessage = "Hi, I need some help with my account.";
  }

  // Generate timestamps at even intervals between start and end
  const timestamps: string[] = [];
  const interval = (endDate.getTime() - startDate.getTime()) / (count - 1);

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(startDate.getTime() + interval * i).toISOString();
    timestamps.push(timestamp);
  }

  // Generate initial message
  const firstMsgId = `${conversationId}_msg1`;
  messages[firstMsgId] = {
    id: firstMsgId,
    content: firstMessage,
    sender: 'user',
    senderName: userName
  };
  messageIds.push(firstMsgId);

  // Generate the rest of the conversation
  for (let i = 1; i < count; i++) {
    const id = `${conversationId}_msg${i + 1}`;
    currentSender = currentSender === 'user' ? 'ai' : 'user';

    // Generate content based on the conversation context
    let content = '';
    const prevMessage = messages[messageIds[i - 1]];

    if (currentSender === 'ai') {
      // AI responses
      if (i === 1) {
        // First AI response
        content = `Hello ${userName}, I'm here to help with your ${topic} issue. `;

        switch(topic) {
          case 'account access':
            content += "Let's try to reset your password. Can you tell me the email address associated with your account?";
            break;
          case 'billing issue':
            content += "I'm sorry to hear about the double charge. Let me look up your account to verify this.";
            break;
          case 'product feature':
            content += "I'd be happy to explain the export feature. Which file format are you trying to export to?";
            break;
          case 'technical problem':
            content += "I'm sorry you're experiencing crashes. Let me check if this is a known issue with large files.";
            break;
          default:
            content += "Could you please provide me with some more details so I can assist you better?";
        }
      } else {
        // Follow-up AI responses
        const responses = [
          "I understand your concern. Let me help you with that.",
          "Thanks for providing that information. Let me check our system.",
          "I've found your account in our database. Let me look into this issue.",
          "I'm checking with our technical team to get more information.",
          "Based on what you've told me, I can recommend the following solution.",
          "Could you please confirm the last four digits of your account number?",
          "I've identified the problem and I know how to fix it.",
          "This is a known issue that our team is currently working on.",
          "I've processed your request. You should see the changes within 24 hours.",
          "Is there anything else I can help you with today?"
        ];
        content = responses[Math.floor(Math.random() * responses.length)];
      }
    } else {
      // User responses
      const responses = [
        "Thanks for the quick response.",
        "Yes, that's correct.",
        "No, that's not what I meant.",
        "My email is example@domain.com.",
        "I've already tried that and it didn't work.",
        "How long will this take to resolve?",
        "Can you escalate this to a manager?",
        "That solution worked! Thank you!",
        "I'm still having the same problem.",
        "Could you explain that in simpler terms?",
        "I appreciate your help with this."
      ];
      content = responses[Math.floor(Math.random() * responses.length)];
    }

    // Random priority with higher likelihood of medium
    const priority = Math.random() < 0.7 ?
      'medium' :
      (Math.random() < 0.5 ? 'low' : 'high');

    messages[id] = {
      id,
      content,
      sender: currentSender,
      senderName: currentSender === 'user' ? userName : aiName
    };
    messageIds.push(id);
  }

  return [messages, messageIds];
};

// Generate conversations
const generateConversations = (
  count: number,
  aiAgents: Record<string, AIAgent>
): [Record<string, Conversation>, Record<string, Message>] => {
  const conversations: Record<string, Conversation> = {};
  let allMessages: Record<string, Message> = {};

  const userIds = Object.keys(userRecords);
  const aiAgentIds = Object.keys(aiAgents);

  // Start date for generating conversations (approximately 3 months ago)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);

  // Ensure we have some very recent conversations for the dashboard
  // Generate at least 10 conversations from the last 24 hours
  const recentCount = Math.min(10, Math.floor(count * 0.05)); // 5% of total or 10, whichever is less
  const recentStartDate = new Date();
  recentStartDate.setHours(recentStartDate.getHours() - 24);

  for (let i = 0; i < count; i++) {
    const id = `c${i + 1}`;
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const aiAgentId = aiAgentIds[Math.floor(Math.random() * aiAgentIds.length)];

    // For the first few conversations, use very recent timestamps
    let startTimestamp;
    if (i < recentCount) {
      // Very recent conversations (within last 24 hours)
      startTimestamp = randomTimestamp(recentStartDate);
    } else {
      // Regular distribution over the past 3 months
      startTimestamp = randomTimestamp(startDate);
    }

    // Make more conversations active for recent ones
    const isActive = i < recentCount ? (Math.random() > 0.3) : (Math.random() > 0.8);
    const status = isActive ? 'active' : 'closed';

    // If closed, generate an end timestamp after the start timestamp
    const endTimestamp = !isActive ? randomTimestamp(new Date(startTimestamp)) : undefined;

    // Generate between 3 and 15 messages for this conversation
    const messageCount = Math.floor(Math.random() * 12) + 3;
    const [messages, messageIds] = generateMessages(id, messageCount, startTimestamp, endTimestamp);

    // Add messages to the overall message collection
    allMessages = { ...allMessages, ...messages };

    // 70% of closed conversations are successful
    const conclusion = !isActive ?
      (Math.random() > 0.3 ? 'successful' : 'unsuccessful') :
      'pending';

    // Random priority with higher likelihood of medium
    // Make recent conversations have higher priority
    const priority = i < recentCount ?
      (Math.random() < 0.7 ? 'high' : 'medium') :
      (Math.random() < 0.7 ? 'medium' : (Math.random() < 0.5 ? 'low' : 'high'));

    // Tags based on message content
    const firstMessage = messages[messageIds[0]];
    const tags = firstMessage.metadata.tags.slice();

    if (conclusion === 'successful') {
      tags.push('resolved');
    } else if (conclusion === 'unsuccessful') {
      tags.push('unresolved');
    }

    if (priority === 'high') {
      tags.push('priority');
    }

    // Add a 'recent' tag for recent conversations
    if (i < recentCount) {
      tags.push('recent');
    }

    // Calculate duration
    const duration = calculateDuration(startTimestamp, endTimestamp);

    // AI confidence between 70-99%
    const confidence = Math.floor(Math.random() * 30 + 70) + '%';

    conversations[id] = {
      thread_id: id,
      userId,
      userName: userRecords[userId].name,
      aiAgentId,
      aiAgentName: aiAgents[aiAgentId].name,
      aiAgentType: aiAgents[aiAgentId].model,
      status,
      conclusion,
      created_at: startTimestamp,
      updated_at: endTimestamp,
      messages: messageIds,
      tags,
      resolutionNotes: conclusion === 'successful' ?
        'Issue resolved to customer satisfaction.' :
        (conclusion === 'unsuccessful' ? 'Customer issue could not be resolved.' : undefined),
      priority: priority as 'low' | 'medium' | 'high',
      duration,
      messageCount,
      confidence
    };
  }

  // Sort conversations by timestamp to ensure IDs are ordered correctly
  const sortedConversations: Record<string, Conversation> = {};
  Object.values(conversations)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .forEach((conversation, index) => {
      const newId = `c${index + 1}`;
      sortedConversations[newId] = {
        ...conversation,
        thread_id: newId
      };
    });

  return [sortedConversations, allMessages];
};

// Generate collections
const generateCollections = (
  count: number,
  conversations: Record<string, Conversation>,
  userIds: string[]
): Record<string, Collection> => {
  const collections: Record<string, Collection> = {};
  const conversationIds = Object.keys(conversations);

  // Collection name templates
  const collectionTemplates = [
    { name: "AI Performance Evaluation", description: "Monitoring AI agent performance metrics" },
    { name: "Customer Support Issues", description: "Tracking customer support interactions" },
    { name: "Technical Problems", description: "Analyzing technical support conversations" },
    { name: "High Priority Cases", description: "Monitoring high priority customer interactions" },
    { name: "Billing Inquiries", description: "Conversations related to billing and payments" },
    { name: "Account Management", description: "User account related conversations" },
    { name: "Product Feature Questions", description: "Queries about product features and usage" },
    { name: "Unresolved Issues", description: "Tracking conversations with unresolved outcomes" },
    { name: "Successful Resolutions", description: "Collection of successfully resolved cases" },
    { name: "Long Conversations", description: "Analyzing lengthy customer interactions" },
    { name: "New User Onboarding", description: "Tracking new user support conversations" },
    { name: "Agent Training Data", description: "Conversations used for AI agent training" }
  ];

  for (let i = 0; i < count; i++) {
    const id = `col${i + 1}`;
    const templateIndex = i % collectionTemplates.length;
    const template = collectionTemplates[templateIndex];

    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const creationTimestamp = randomTimestamp(new Date(2023, 0, 1));

    // Different filter types based on template
    let filterCriteria: any = {};
    let filteredConversations: string[] = [];

    // Apply different filter strategies based on the collection type
    if (template.name.includes("Performance")) {
      // AI agent based filter
      const aiAgentIds = [...new Set(Object.values(conversations).map(c => c.aiAgentId))].slice(0, 2);
      filterCriteria = {
        aiAgentBased: aiAgentIds
      };

      filteredConversations = conversationIds.filter(cId =>
        aiAgentIds.includes(conversations[cId].aiAgentId)
      );
    }
    else if (template.name.includes("Priority")) {
      // High priority filter
      filterCriteria = {
        multiFactorFilters: [
          { priority: 'high' }
        ]
      };

      filteredConversations = conversationIds.filter(cId =>
        conversations[cId].priority === 'high'
      );
    }
    else if (template.name.includes("Successful")) {
      // Outcome based filter
      filterCriteria = {
        outcomeBased: 'successful'
      };

      filteredConversations = conversationIds.filter(cId =>
        conversations[cId].conclusion === 'successful'
      );
    }
    else if (template.name.includes("Unresolved")) {
      // Outcome based filter
      filterCriteria = {
        outcomeBased: 'unsuccessful'
      };

      filteredConversations = conversationIds.filter(cId =>
        conversations[cId].conclusion === 'unsuccessful'
      );
    }
    else if (template.name.includes("Technical") ||
             template.name.includes("Billing") ||
             template.name.includes("Account") ||
             template.name.includes("Product")) {
      // Tag based filter (implemented as multi-factor)
      const tag = template.name.includes("Technical") ? "technical problem" :
                 template.name.includes("Billing") ? "billing issue" :
                 template.name.includes("Account") ? "account access" :
                 "product feature";

      filterCriteria = {
        multiFactorFilters: [
          { tags: [tag] }
        ]
      };

      filteredConversations = conversationIds.filter(cId =>
        conversations[cId].tags.some(t => t.includes(tag))
      );
    }
    else {
      // Time based filter for other types
      const now = new Date();
      const startDate = new Date();

      if (template.name.includes("Long")) {
        // Filter conversations with more than 10 messages
        filteredConversations = conversationIds.filter(cId =>
          conversations[cId].messageCount > 10
        );

        filterCriteria = {
          multiFactorFilters: [
            { messageCount: { min: 10 } }
          ]
        };
      } else {
        // Default to last month
        startDate.setMonth(now.getMonth() - 1);

        filterCriteria = {
          timeBased: {
            startDate: startDate.toISOString(),
            period: 'month'
          }
        };

        filteredConversations = conversationIds.filter(cId => {
          const convDate = new Date(conversations[cId].created_at);
          return convDate >= startDate && convDate <= now;
        });
      }
    }

    // Limit to a random subset if too many matches
    if (filteredConversations.length > 30) {
      filteredConversations = filteredConversations
        .sort(() => 0.5 - Math.random())
        .slice(0, 30);
    }

    // Add some randomness - don't include all matching conversations
    if (filteredConversations.length > 5) {
      filteredConversations = filteredConversations.filter(() => Math.random() > 0.2);
    }

    // Calculate metadata
    const totalConversations = filteredConversations.length;

    // Calculate average duration
    let totalMinutes = 0;
    filteredConversations.forEach(cId => {
      const durationString = conversations[cId].duration;
      const minutes = parseInt(durationString.replace('m', ''));
      totalMinutes += minutes;
    });

    const avgDuration = totalConversations > 0 ?
      `${Math.round(totalMinutes / totalConversations)}m` :
      '0m';

    collections[id] = {
      id,
      name: template.name,
      description: template.description,
      filterCriteria,
      creationTimestamp,
      creator: userId,
      accessPermissions: [userId],
      metadata: {
        totalConversations,
        avgDuration,
        lastRefreshed: new Date().toISOString()
      },
      conversations: filteredConversations
    };
  }

  return collections;
};

// Generate groups
const generateGroups = (
  count: number,
  collections: Record<string, Collection>,
  userIds: string[]
): Record<string, Group> => {
  const groups: Record<string, Group> = {};
  const collectionIds = Object.keys(collections);
  const groupPurposes: ('evaluation' | 'security' | 'efficiency')[] = ['evaluation', 'security', 'efficiency'];

  // Group templates
  const groupTemplates = [
    { name: "Customer Support Team", description: "Customer service agent evaluation group" },
    { name: "Technical Support Analysis", description: "Technical support performance monitoring" },
    { name: "AI Performance Review", description: "AI agent performance evaluation group" },
    { name: "Critical Issues Team", description: "Management of high priority cases" },
    { name: "Efficiency Improvement", description: "Analyzing conversation efficiency metrics" },
    { name: "Agent Training Program", description: "Collections used for agent training" },
    { name: "Executive Dashboard", description: "High-level metrics for executive review" },
    { name: "Security Review Team", description: "Sensitive conversation monitoring and analysis" }
  ];

  for (let i = 0; i < count; i++) {
    const id = `g${i + 1}`;
    const templateIndex = i % groupTemplates.length;
    const template = groupTemplates[templateIndex];

    // Select 2-4 admin users
    const shuffledUsers = [...userIds].sort(() => 0.5 - Math.random());
    const adminCount = Math.floor(Math.random() * 3) + 2;
    const adminUsers = shuffledUsers.slice(0, adminCount);

    // Select a purpose based on the group type
    let purpose: 'evaluation' | 'security' | 'efficiency';

    if (template.name.includes("Performance") || template.name.includes("Review") || template.name.includes("Support")) {
      purpose = 'evaluation';
    }
    else if (template.name.includes("Security") || template.name.includes("Critical")) {
      purpose = 'security';
    }
    else {
      purpose = 'efficiency';
    }

    // Select 2-5 collections for this group
    // Try to match collections with the group purpose
    const matchingCollections = collectionIds.filter(cId => {
      const collection = collections[cId];
      const name = collection.name.toLowerCase();

      if (purpose === 'evaluation' &&
          (name.includes('performance') || name.includes('support') || name.includes('evaluation'))) {
        return true;
      }

      if (purpose === 'security' &&
          (name.includes('priority') || name.includes('unresolved') || name.includes('issues'))) {
        return true;
      }

      if (purpose === 'efficiency' &&
          (name.includes('successful') || name.includes('resolution') || name.includes('onboarding'))) {
        return true;
      }

      return false;
    });

    // If not enough matching collections, add random ones
    let selectedCollections = [...matchingCollections];
    if (selectedCollections.length < 2) {
      const remainingCollections = collectionIds.filter(id => !selectedCollections.includes(id));
      const additionalCount = Math.min(2, remainingCollections.length);
      selectedCollections = [
        ...selectedCollections,
        ...remainingCollections.sort(() => 0.5 - Math.random()).slice(0, additionalCount)
      ];
    }

    // Limit to 5 collections max
    if (selectedCollections.length > 5) {
      selectedCollections = selectedCollections.slice(0, 5);
    }

    // Generate permission levels based on user roles
    const permissionLevels: Record<string, string> = {};

    adminUsers.forEach(userId => {
      const user = userRecords[userId];
      permissionLevels[userId] = user.role === 'admin' ? 'admin' : 'edit';
    });

    // Add some view-only permissions for other users
    const nonAdminUsers = userIds.filter(id => !adminUsers.includes(id));
    const viewerCount = Math.floor(Math.random() * 3);

    for (let j = 0; j < viewerCount && j < nonAdminUsers.length; j++) {
      permissionLevels[nonAdminUsers[j]] = 'view';
    }

    groups[id] = {
      id,
      name: template.name,
      description: template.description,
      purpose,
      collectionIds: selectedCollections,
      adminUsers,
      permissionLevels,
      analyticsData: {
        totalConversations: selectedCollections.reduce((sum, colId) => {
          return sum + collections[colId].conversations.length;
        }, 0),
        avgResponseTime: `${Math.floor(Math.random() * 10) + 5}m`,
        successRate: `${Math.floor(Math.random() * 20) + 75}%`,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  return groups;
};

// Generate the full data set
const generateMockData = () => {
  console.log('Generating mock data...');

  // Generate 15 AI agents
  console.log('Generating AI agents...');
  const aiAgents = generateAIAgents(15);
  console.log(`Generated ${Object.keys(aiAgents).length} AI agents`);

  // Generate 200 conversations with messages
  console.log('Generating conversations and messages...');
  const [conversations, messages] = generateConversations(200, aiAgents);
  console.log(`Generated ${Object.keys(conversations).length} conversations and ${Object.keys(messages).length} messages`);

  // Generate 12 collections using conversations
  console.log('Generating collections...');
  const userIdsForCollections = Object.keys(userRecords);
  const collections = generateCollections(12, conversations, userIdsForCollections);
  console.log(`Generated ${Object.keys(collections).length} collections`);

  // Generate 6 groups using collections
  console.log('Generating groups...');
  const groups = generateGroups(6, collections, userIdsForCollections);
  console.log(`Generated ${Object.keys(groups).length} groups`);

  // Log the final tally
  console.log('Mock data generation complete:', {
    aiAgentsCount: Object.keys(aiAgents).length,
    conversationsCount: Object.keys(conversations).length,
    messagesCount: Object.keys(messages).length,
    collectionsCount: Object.keys(collections).length,
    groupsCount: Object.keys(groups).length,
    usersCount: Object.keys(userRecords).length
  });

  return {
    messages,
    conversations,
    collections,
    groups,
    aiAgents,
    users: userRecords
  };
};

// Generate the data once and export it
const generatedData = generateMockData();

// Export the generated data
export const messages = generatedData.messages;
export const conversations = generatedData.conversations;
export const collections = generatedData.collections;
export const groups = generatedData.groups;
export const aiAgents = generatedData.aiAgents;
export const users = generatedData.users;