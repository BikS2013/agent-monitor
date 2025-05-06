/**
 * Utility to export data to JSON file
 * This can be used to generate a static JSON file from the large sample data
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { messages, conversations, collections, groups, aiAgents, users } from './largeSampleData.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the data object
const jsonData = {
  messages,
  conversations,
  collections,
  groups,
  aiAgents,
  users
};

// Output directory
const outputDir = path.join(path.resolve(__dirname, '../../'), 'public');
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
  messagesCount: Object.keys(messages).length,
  conversationsCount: Object.keys(conversations).length,
  collectionsCount: Object.keys(collections).length,
  groupsCount: Object.keys(groups).length,
  aiAgentsCount: Object.keys(aiAgents).length,
  usersCount: Object.keys(users).length
});