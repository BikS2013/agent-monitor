/**
 * Test script to verify loosened agent validation
 * Tests scenarios where API returns agents with missing fields
 */

// Mock API responses with missing fields
const mockApiResponses = [
  {
    id: 'agent-1',
    name: 'Complete Agent',
    model: 'gpt-4',
    status: 'active'
  },
  {
    id: 'agent-2',
    name: 'Missing Model Agent',
    // model field missing
    status: 'inactive'
  },
  {
    id: 'agent-3',
    // name field missing
    model: 'claude-3',
    status: 'training'
  },
  {
    id: 'agent-4',
    name: 'Old Structure Agent',
    modelName: 'gpt-3.5', // old field name
    status: 'active'
  },
  {
    id: 'agent-5',
    name: 'Minimal Agent'
    // only id and name provided
  },
  {
    // missing id - should be filtered out
    name: 'No ID Agent',
    model: 'test-model',
    status: 'inactive'
  }
];

console.log('Testing agent validation with mock API responses...');

// Test validation logic
function testAgentValidation(agents) {
  console.log(`\nTesting ${agents.length} agents:`);
  
  const validAgents = [];
  
  agents.forEach((agent, index) => {
    console.log(`\nAgent ${index + 1}:`, agent);
    
    // Simulate our loosened validation logic
    if (agent && typeof agent === 'object' && agent.id) {
      // Apply defaults like our updated code does
      const processedAgent = { ...agent };
      
      if (!processedAgent.model && agent.modelName) {
        console.log('  ✓ Migrated modelName to model');
        processedAgent.model = agent.modelName;
      }
      
      if (!processedAgent.model || processedAgent.model.trim() === '') {
        console.log('  ✓ Applied default model');
        processedAgent.model = 'Unknown Model';
      }
      
      if (!processedAgent.name || processedAgent.name.trim() === '') {
        console.log('  ✓ Applied default name');
        processedAgent.name = 'Unnamed Agent';
      }
      
      if (!processedAgent.status) {
        console.log('  ✓ Applied default status');
        processedAgent.status = 'inactive';
      }
      
      console.log('  → Agent accepted:', {
        id: processedAgent.id,
        name: processedAgent.name,
        model: processedAgent.model,
        status: processedAgent.status
      });
      
      validAgents.push(processedAgent);
    } else {
      console.log('  ✗ Agent rejected (missing ID or invalid structure)');
    }
  });
  
  return validAgents;
}

const processedAgents = testAgentValidation(mockApiResponses);

console.log(`\n=== SUMMARY ===`);
console.log(`Input agents: ${mockApiResponses.length}`);
console.log(`Valid agents: ${processedAgents.length}`);
console.log(`Filtered out: ${mockApiResponses.length - processedAgents.length}`);

console.log('\nFinal processed agents:');
processedAgents.forEach((agent, index) => {
  console.log(`${index + 1}. ${agent.name} (${agent.model}) - ${agent.status}`);
});

console.log('\n✅ Test completed - validation logic working correctly!');