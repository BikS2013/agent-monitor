/**
 * Build script to generate and export large sample data to JSON
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { faker } from '@faker-js/faker';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed faker for consistent results
faker.seed(456);

// Generate a random timestamp within a range
const randomTimestamp = (startDate, endDate = new Date()) => {
  return faker.date.between({ from: startDate, to: endDate }).toISOString();
};

// Calculate duration in minutes between two timestamps
const calculateDuration = (startTimestamp, endTimestamp) => {
  const start = new Date(startTimestamp);
  const end = endTimestamp ? new Date(endTimestamp) : new Date();
  const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  return `${minutes}m`;
};

console.log('Starting large dataset generation...');
const startTime = Date.now();

// AI Agents with realistic properties
const aiAgentData = [
  {
    id: 'ai1',
    name: 'Claude',
    model: 'Claude-3.5-Sonnet',
    status: 'active',
    conversationsProcessed: 4587,
    successRate: '96%',
    avgResponseTime: '8m',
    lastActive: new Date().toISOString(),
    capabilities: ['natural language', 'conversation', 'knowledge retrieval', 'problem solving', 'personalization'],
    specializations: ['customer support', 'technical support']
  },
  {
    id: 'ai2',
    name: 'GPT-4',
    model: 'GPT-4-Turbo',
    status: 'active',
    conversationsProcessed: 5231,
    successRate: '92%',
    avgResponseTime: '12m',
    lastActive: new Date().toISOString(),
    capabilities: ['natural language', 'conversation', 'knowledge retrieval', 'problem solving'],
    specializations: ['customer support', 'sales']
  },
  {
    id: 'ai3',
    name: 'Llama',
    model: 'Llama-3-70B',
    status: 'active',
    conversationsProcessed: 3845,
    successRate: '88%',
    avgResponseTime: '15m',
    lastActive: new Date().toISOString(),
    capabilities: ['natural language', 'conversation', 'knowledge retrieval'],
    specializations: ['technical support']
  },
  {
    id: 'ai4',
    name: 'Gemini',
    model: 'Gemini-Pro',
    status: 'inactive',
    conversationsProcessed: 2754,
    successRate: '85%',
    avgResponseTime: '18m',
    lastActive: randomTimestamp(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    capabilities: ['natural language', 'conversation', 'knowledge retrieval'],
    specializations: ['booking', 'feedback']
  },
  {
    id: 'ai5',
    name: 'Falcon',
    model: 'Falcon-180B',
    status: 'training',
    conversationsProcessed: 976,
    successRate: '78%',
    avgResponseTime: '22m',
    lastActive: randomTimestamp(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)),
    capabilities: ['natural language', 'conversation'],
    specializations: ['sales']
  }
];

// User data
const userData = [
  {
    id: 'admin1',
    name: 'Alex Johnson',
    role: 'admin',
    permissions: ['edit', 'delete', 'create', 'view']
  },
  {
    id: 'admin2',
    name: 'Morgan Chen',
    role: 'admin',
    permissions: ['edit', 'delete', 'create', 'view']
  },
  {
    id: 'super1',
    name: 'Taylor Williams',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  {
    id: 'super2',
    name: 'Sam Rodriguez',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  {
    id: 'super3',
    name: 'Jordan Lee',
    role: 'supervisor',
    permissions: ['edit', 'create', 'view']
  },
  {
    id: 'exec1',
    name: 'Casey Smith',
    role: 'executive',
    permissions: ['view']
  },
  {
    id: 'exec2',
    name: 'Jamie Davis',
    role: 'executive',
    permissions: ['view']
  }
];

// Support topics for conversation generation
const supportTopics = [
  'account access', 'billing issue', 'product feature',
  'technical problem', 'how to', 'subscription change',
  'refund request', 'service outage', 'payment method',
  'password reset', 'account upgrade', 'product compatibility',
  'login issue', 'data migration', 'performance problem',
  'security concern', 'error message', 'installation trouble',
  'integration question', 'upgrade process', 'feature request',
  'bug report', 'missing data', 'device compatibility'
];

// User query templates by topic
const userQueryTemplates = {
  'account access': [
    "I can't log into my account. It says my password is incorrect but I'm sure it's right.",
    "My account seems to be locked. I've tried resetting my password but it's not working.",
    "I'm getting an 'unauthorized access' message when trying to log in. Can you help?",
    "I can't access my account on the mobile app, but it works fine on desktop.",
    "I've been locked out of my account after too many login attempts."
  ],
  'billing issue': [
    "I was charged twice for my subscription this month. Can you help me get a refund?",
    "My invoice shows the wrong amount. I should be on the basic plan but I'm being charged for premium.",
    "I canceled my subscription but was still charged. Can you explain why?",
    "I'm seeing a charge on my credit card statement I don't recognize from your company.",
    "I need to update my billing information. My card expired and I need to add a new one."
  ],
  'technical problem': [
    "The app keeps crashing whenever I try to upload a file larger than 10MB.",
    "I'm experiencing serious lag when using the search function.",
    "The dashboard isn't loading any of my data. It's just a blank screen.",
    "I'm getting a '404 error' when trying to access my saved reports.",
    "The integration with our CRM system stopped working after your last update."
  ]
};

// AI response templates
const aiResponseTemplates = {
  'initial': [
    "Hello, I'm here to help with your {topic} issue. Could you please provide more details?",
    "I understand you're having trouble with {topic}. I'm here to assist you.",
    "Thanks for reaching out about your {topic} concern. Let me see how I can help.",
    "I'd be happy to help resolve your {topic} issue. Let's work through this together.",
    "I'm sorry to hear you're experiencing issues with {topic}. Let's get this sorted out."
  ],
  'follow_up': [
    "Thank you for that information. Let me check our system regarding your {topic} issue.",
    "I appreciate your patience. I'm looking into your {topic} concern now.",
    "I understand the situation better now. Let me see what we can do about this {topic} matter.",
    "Based on what you've told me, I can recommend a solution for your {topic} problem.",
    "I've found some information that might help with your {topic} issue."
  ]
};

// User follow-up templates
const userFollowUpTemplates = [
  "Thanks for your quick response. {additional_info}",
  "I appreciate your help. Here's the information you requested: {additional_info}",
  "Thank you. {additional_info}",
  "That makes sense. {additional_info}",
  "I'm still having the issue. {additional_info}",
  "That worked! Thank you for your help.",
  "I'm still confused about something. {additional_info}",
  "Could you explain that in simpler terms?",
  "That didn't solve my problem. {additional_info}",
  "Perfect, that's exactly what I needed!"
];

// Additional info templates
const additionalInfoTemplates = {
  'account access': [
    "My email is example@domain.com.",
    "I last logged in about a week ago.",
    "I'm using the same laptop I always use.",
    "I did recently change my email address.",
    "I'm seeing a 'credentials invalid' message."
  ],
  'billing issue': [
    "I'm using Visa ending in 4321.",
    "The charge appeared on March 15th.",
    "The transaction ID is TX897234565.",
    "I should be on the Basic Plan at $9.99/month.",
    "I submitted the cancellation on February 28th."
  ]
};

// Generate a single message
const generateMessage = (
  id,
  conversationId,
  content,
  timestamp,
  sender,
  senderName,
  tags
) => {
  return {
    id,
    content,
    timestamp,
    sender,
    senderName,
    messageType: 'text',
    readStatus: true,
    metadata: {
      tags,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      confidence: sender === 'ai' ? Math.floor(Math.random() * 30 + 70) + '%' : undefined
    }
  };
};

// Generate all messages for a conversation
const generateMessagesForConversation = (
  conversationId,
  topic,
  startTimestamp,
  endTimestamp,
  messageCount
) => {
  const messages = [];
  const messageIds = [];
  
  // Set up the timeline
  const startDate = new Date(startTimestamp);
  const endDate = endTimestamp ? new Date(endTimestamp) : new Date();
  const timeSpan = endDate.getTime() - startDate.getTime();
  
  // Generate user names
  const userName = faker.person.fullName();
  const aiName = aiAgentData[Math.floor(Math.random() * aiAgentData.length)].name;
  
  // Determine first message
  let firstMessageContent = '';
  if (userQueryTemplates[topic]) {
    const templates = userQueryTemplates[topic];
    firstMessageContent = templates[Math.floor(Math.random() * templates.length)];
  } else {
    firstMessageContent = `Hi, I need help with a ${topic} issue.`;
  }
  
  // Create first message
  const firstMessageId = `${conversationId}_msg1`;
  const firstMessage = generateMessage(
    firstMessageId,
    conversationId,
    firstMessageContent,
    startTimestamp,
    'user',
    userName,
    [topic]
  );
  
  messages.push(firstMessage);
  messageIds.push(firstMessageId);
  
  // Generate conversation flow
  let currentSender = 'user';
  
  for (let i = 1; i < messageCount; i++) {
    // Toggle sender
    currentSender = currentSender === 'user' ? 'ai' : 'user';
    
    // Calculate time offset proportionally
    const timeOffset = (timeSpan / messageCount) * i;
    const messageTime = new Date(startDate.getTime() + timeOffset).toISOString();
    
    // Generate message content based on position in conversation
    let content = '';
    
    if (currentSender === 'ai') {
      // AI response
      if (i === 1) {
        // First AI response
        const templates = aiResponseTemplates.initial;
        content = templates[Math.floor(Math.random() * templates.length)].replace('{topic}', topic);
      } else {
        // Regular follow-up
        const templates = aiResponseTemplates.follow_up;
        content = templates[Math.floor(Math.random() * templates.length)].replace('{topic}', topic);
      }
    } else {
      // User response
      let template = userFollowUpTemplates[Math.floor(Math.random() * userFollowUpTemplates.length)];
      
      // Include additional info if the template has a placeholder
      if (template.includes('{additional_info}')) {
        let additionalInfo = 'Here is the information you asked for.';
        
        if (additionalInfoTemplates[topic]) {
          additionalInfo = additionalInfoTemplates[topic][Math.floor(Math.random() * additionalInfoTemplates[topic].length)];
        }
        
        content = template.replace('{additional_info}', additionalInfo);
      } else {
        content = template;
      }
    }
    
    // Create message
    const messageId = `${conversationId}_msg${i + 1}`;
    const message = generateMessage(
      messageId,
      conversationId,
      content,
      messageTime,
      currentSender,
      currentSender === 'user' ? userName : aiName,
      [topic]
    );
    
    messages.push(message);
    messageIds.push(messageId);
  }
  
  return [messages, messageIds];
};

// Generate a single conversation
const generateConversation = (
  id,
  userId,
  aiAgentId,
  startDate,
  isActive,
  messageCount
) => {
  // Setup basic conversation parameters
  const aiAgent = aiAgentData.find(agent => agent.id === aiAgentId);
  const user = userData.find(user => user.id === userId);
  
  // Random topic selection
  const topic = supportTopics[Math.floor(Math.random() * supportTopics.length)];
  
  // Generate timestamps
  const startTimestamp = randomTimestamp(startDate);
  let endTimestamp;
  
  if (!isActive) {
    // Generate end timestamp for closed conversations
    // Duration between 5 minutes and 3 hours
    const durationMs = Math.floor(Math.random() * (3 * 60 * 60 * 1000 - 5 * 60 * 1000)) + 5 * 60 * 1000;
    const endDate = new Date(new Date(startTimestamp).getTime() + durationMs);
    endTimestamp = endDate.toISOString();
  }
  
  // Generate messages
  const [messages, messageIds] = generateMessagesForConversation(
    id,
    topic,
    startTimestamp,
    endTimestamp,
    messageCount
  );
  
  // Status and conclusion
  const status = isActive ? 'active' : 'closed';
  let conclusion = 'pending';
  
  if (!isActive) {
    conclusion = Math.random() > 0.2 ? 'successful' : 'unsuccessful';
  }
  
  // Priority
  const isRecent = new Date(startTimestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000;
  const priorityRoll = Math.random();
  let priority;
  
  if (isRecent && isActive) {
    priority = priorityRoll < 0.4 ? 'high' : priorityRoll < 0.8 ? 'medium' : 'low';
  } else if (isRecent || isActive) {
    priority = priorityRoll < 0.2 ? 'high' : priorityRoll < 0.7 ? 'medium' : 'low';
  } else {
    priority = priorityRoll < 0.1 ? 'high' : priorityRoll < 0.6 ? 'medium' : 'low';
  }
  
  // Generate tags
  let tags = [topic];
  
  if (conclusion !== 'pending') {
    tags.push(conclusion === 'successful' ? 'resolved' : 'unresolved');
  }
  
  if (priority === 'high') {
    tags.push('priority');
  }
  
  if (isRecent) {
    tags.push('recent');
  }
  
  // Calculate duration
  const duration = calculateDuration(startTimestamp, endTimestamp);
  
  // Resolution notes
  let resolutionNotes;
  if (conclusion === 'successful') {
    resolutionNotes = 'Issue resolved to customer satisfaction.';
  } else if (conclusion === 'unsuccessful') {
    resolutionNotes = 'Customer issue could not be resolved.';
  }
  
  // Create conversation object
  const conversation = {
    id,
    userId,
    userName: user.name,
    aiAgentId,
    aiAgentName: aiAgent.name,
    aiAgentType: aiAgent.model,
    status,
    conclusion,
    startTimestamp,
    endTimestamp,
    messages: messageIds,
    tags,
    resolutionNotes,
    priority,
    duration,
    messageCount,
    confidence: `${Math.floor(Math.random() * 20 + 80)}%`,
    conversationTimestamp: startTimestamp
  };
  
  return [conversation, messages];
};

// Collection templates
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
  { name: "Agent Training Data", description: "Conversations used for AI agent training" },
  { name: "Response Time Analysis", description: "Monitoring agent response times" },
  { name: "User Satisfaction Metrics", description: "Tracking customer satisfaction indicators" },
  { name: "Service Quality Evaluation", description: "Analyzing overall service quality" },
  { name: "Conversation Flow Analysis", description: "Studying conversation patterns and flows" },
  { name: "Product Feedback Collection", description: "Gathering product feedback from users" },
  { name: "Support Team Performance", description: "Evaluating support team effectiveness" }
];

// Group templates
const groupTemplates = [
  { name: "Customer Support Team", description: "Customer service agent evaluation group", purpose: "evaluation" },
  { name: "Technical Support Analysis", description: "Technical support performance monitoring", purpose: "evaluation" },
  { name: "AI Performance Review", description: "AI agent performance evaluation group", purpose: "evaluation" },
  { name: "Critical Issues Team", description: "Management of high priority cases", purpose: "security" },
  { name: "Efficiency Improvement", description: "Analyzing conversation efficiency metrics", purpose: "efficiency" },
  { name: "Agent Training Program", description: "Collections used for agent training", purpose: "evaluation" },
  { name: "Executive Dashboard", description: "High-level metrics for executive review", purpose: "efficiency" },
  { name: "Security Review Team", description: "Sensitive conversation monitoring and analysis", purpose: "security" }
];

// Generate the large-scale sample data
const generateLargeScaleSampleData = () => {
  console.log('Generating large-scale sample data...');
  
  // Set up data storage
  const conversations = {};
  const messages = {};
  const collections = {};
  const groups = {};
  
  // Convert array data to records
  const aiAgents = {};
  aiAgentData.forEach(agent => {
    aiAgents[agent.id] = agent;
  });
  
  const users = {};
  userData.forEach(user => {
    users[user.id] = user;
  });
  
  // Setup date ranges
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  
  const oneDayAgo = new Date();
  oneDayAgo.setDate(now.getDate() - 1);
  
  // 1. Generate conversations and messages
  console.log('Generating 2000+ conversations with 20000+ messages...');
  
  // Distribution of conversations by time period
  const recentConversations = 200; // Last 24 hours
  const weekConversations = 300;   // Last week (excluding last 24 hours)
  const monthConversations = 500;  // Last month (excluding last week)
  const olderConversations = 1000; // Older than a month
  
  let totalMessages = 0;
  
  // Generate recent conversations (last 24 hours)
  for (let i = 0; i < recentConversations; i++) {
    const id = `c${i + 1}`;
    const userId = userData[Math.floor(Math.random() * userData.length)].id;
    const aiAgentId = aiAgentData[Math.floor(Math.random() * aiAgentData.length)].id;
    
    // 70% of recent conversations are active
    const isActive = Math.random() < 0.7;
    
    // Recent conversations have 3-8 messages
    const messageCount = Math.floor(Math.random() * 5) + 3;
    
    const [conversation, conversationMessages] = generateConversation(
      id,
      userId,
      aiAgentId,
      oneDayAgo,
      isActive,
      messageCount
    );
    
    conversations[id] = conversation;
    conversationMessages.forEach(msg => {
      messages[msg.id] = msg;
    });
    
    totalMessages += messageCount;
  }
  
  // Generate week conversations (last week, excluding last 24 hours)
  for (let i = 0; i < weekConversations; i++) {
    const id = `c${recentConversations + i + 1}`;
    const userId = userData[Math.floor(Math.random() * userData.length)].id;
    const aiAgentId = aiAgentData[Math.floor(Math.random() * aiAgentData.length)].id;
    
    // 40% of week-old conversations are active
    const isActive = Math.random() < 0.4;
    
    // Week-old conversations have 4-12 messages
    const messageCount = Math.floor(Math.random() * 8) + 4;
    
    const [conversation, conversationMessages] = generateConversation(
      id,
      userId,
      aiAgentId,
      oneWeekAgo,
      isActive,
      messageCount
    );
    
    conversations[id] = conversation;
    conversationMessages.forEach(msg => {
      messages[msg.id] = msg;
    });
    
    totalMessages += messageCount;
  }
  
  // Generate month conversations (last month, excluding last week)
  for (let i = 0; i < monthConversations; i++) {
    const id = `c${recentConversations + weekConversations + i + 1}`;
    const userId = userData[Math.floor(Math.random() * userData.length)].id;
    const aiAgentId = aiAgentData[Math.floor(Math.random() * aiAgentData.length)].id;
    
    // 10% of month-old conversations are active
    const isActive = Math.random() < 0.1;
    
    // Month-old conversations have 5-15 messages
    const messageCount = Math.floor(Math.random() * 10) + 5;
    
    const [conversation, conversationMessages] = generateConversation(
      id,
      userId,
      aiAgentId,
      oneMonthAgo,
      isActive,
      messageCount
    );
    
    conversations[id] = conversation;
    conversationMessages.forEach(msg => {
      messages[msg.id] = msg;
    });
    
    totalMessages += messageCount;
  }
  
  // Generate older conversations
  for (let i = 0; i < olderConversations; i++) {
    const id = `c${recentConversations + weekConversations + monthConversations + i + 1}`;
    const userId = userData[Math.floor(Math.random() * userData.length)].id;
    const aiAgentId = aiAgentData[Math.floor(Math.random() * aiAgentData.length)].id;
    
    // 5% of older conversations are still active
    const isActive = Math.random() < 0.05;
    
    // Older conversations have 6-20 messages
    const messageCount = Math.floor(Math.random() * 14) + 6;
    
    const [conversation, conversationMessages] = generateConversation(
      id,
      userId,
      aiAgentId,
      threeMonthsAgo,
      isActive,
      messageCount
    );
    
    conversations[id] = conversation;
    conversationMessages.forEach(msg => {
      messages[msg.id] = msg;
    });
    
    totalMessages += messageCount;
  }
  
  console.log(`Generated ${Object.keys(conversations).length} conversations with ${Object.keys(messages).length} messages`);
  
  // 2. Generate collections
  console.log('Generating collections...');
  
  const conversationIds = Object.keys(conversations);
  
  for (let i = 0; i < collectionTemplates.length; i++) {
    const id = `col${i + 1}`;
    const template = collectionTemplates[i];
    const creatorId = userData[Math.floor(Math.random() * userData.length)].id;
    
    // Assign a subset of conversations to this collection
    // Each collection gets between 50 and 200 conversations
    const collectionSize = Math.floor(Math.random() * 150) + 50;
    const collectionConversations = conversationIds
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(collectionSize, conversationIds.length));
    
    let filterCriteria = {};
    
    // Generate filter criteria based on collection name
    if (template.name.toLowerCase().includes('performance')) {
      filterCriteria = {
        aiAgentBased: [aiAgentData[Math.floor(Math.random() * aiAgentData.length)].id]
      };
    }
    else if (template.name.toLowerCase().includes('priority')) {
      filterCriteria = {
        multiFactorFilters: [
          { priority: 'high' }
        ]
      };
    }
    else if (template.name.toLowerCase().includes('successful')) {
      filterCriteria = {
        outcomeBased: 'successful'
      };
    }
    else {
      // Time based filter for other types
      const now = new Date();
      const startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
      
      filterCriteria = {
        timeBased: {
          startDate: startDate.toISOString(),
          period: 'month'
        }
      };
    }
    
    // Generate access permissions (always include creator)
    const accessPermissions = [creatorId];
    
    // Add 1-3 random users
    const otherUsers = userData.filter(user => user.id !== creatorId);
    const permissionCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < permissionCount && i < otherUsers.length; i++) {
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      if (!accessPermissions.includes(randomUser.id)) {
        accessPermissions.push(randomUser.id);
      }
    }
    
    collections[id] = {
      id,
      name: template.name,
      description: template.description,
      filterCriteria,
      creationTimestamp: randomTimestamp(new Date(2023, 0, 1)),
      creator: creatorId,
      accessPermissions,
      metadata: {
        totalConversations: collectionConversations.length,
        avgDuration: `${Math.floor(Math.random() * 20 + 10)}m`,
        lastRefreshed: new Date().toISOString()
      },
      conversations: collectionConversations
    };
  }
  
  console.log(`Generated ${Object.keys(collections).length} collections`);
  
  // 3. Generate groups
  console.log('Generating groups...');
  
  const collectionIds = Object.keys(collections);
  
  for (let i = 0; i < groupTemplates.length; i++) {
    const id = `g${i + 1}`;
    const template = groupTemplates[i];
    
    // Assign a subset of collections to this group
    // Each group gets between 2 and 5 collections
    const groupSize = Math.floor(Math.random() * 3) + 2;
    const groupCollections = collectionIds
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(groupSize, collectionIds.length));
    
    // Select 2-4 admin users
    const shuffledUsers = [...userData.map(u => u.id)].sort(() => 0.5 - Math.random());
    const adminCount = Math.floor(Math.random() * 3) + 2;
    const adminUsers = shuffledUsers.slice(0, adminCount);
    
    // Generate permission levels
    const permissionLevels = {};
    
    // Admins get admin or edit permissions
    adminUsers.forEach(userId => {
      const user = userData.find(u => u.id === userId);
      permissionLevels[userId] = user.role === 'admin' ? 'admin' : 'edit';
    });
    
    // Add some view-only permissions for other users
    const otherUsers = userData.filter(user => !adminUsers.includes(user.id)).map(u => u.id);
    const viewerCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < viewerCount && i < otherUsers.length; i++) {
      permissionLevels[otherUsers[i]] = 'view';
    }
    
    groups[id] = {
      id,
      name: template.name,
      description: template.description,
      purpose: template.purpose,
      collectionIds: groupCollections,
      adminUsers,
      permissionLevels,
      analyticsData: {
        totalConversations: Math.floor(Math.random() * 500) + 100,
        avgResponseTime: `${Math.floor(Math.random() * 10 + 5)}m`,
        successRate: `${Math.floor(Math.random() * 20 + 75)}%`,
        lastUpdated: new Date().toISOString()
      }
    };
  }
  
  console.log(`Generated ${Object.keys(groups).length} groups`);
  
  return {
    messages,
    conversations,
    collections,
    groups,
    aiAgents,
    users
  };
};

const largeData = generateLargeScaleSampleData();
const endTime = Date.now();
console.log(`Data generation completed in ${(endTime - startTime) / 1000} seconds`);

// Final data statistics
console.log('Generated data statistics:', {
  messagesCount: Object.keys(largeData.messages).length,
  conversationsCount: Object.keys(largeData.conversations).length,
  collectionsCount: Object.keys(largeData.collections).length,
  groupsCount: Object.keys(largeData.groups).length,
  aiAgentsCount: Object.keys(largeData.aiAgents).length,
  usersCount: Object.keys(largeData.users).length
});

// Create the data object
const jsonData = largeData;

// Output directory
const outputDir = path.join(__dirname, 'public');
console.log('Output directory:', outputDir);

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created output directory:', outputDir);
}

// Output file path
const outputFile = path.join(outputDir, 'largeSampleData.json');

// Write to file with pretty formatting
fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2));

console.log(`Data exported to ${outputFile}`);
console.log('Data statistics:', {
  messagesCount: Object.keys(largeData.messages).length,
  conversationsCount: Object.keys(largeData.conversations).length,
  collectionsCount: Object.keys(largeData.collections).length,
  groupsCount: Object.keys(largeData.groups).length,
  aiAgentsCount: Object.keys(largeData.aiAgents).length,
  usersCount: Object.keys(largeData.users).length
});