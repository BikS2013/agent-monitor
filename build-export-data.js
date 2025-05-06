/**
 * Build script to compile and run the data export utility
 */
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the export utility
const exportScript = path.join('src', 'data', 'exportDataToJson.ts');

console.log('Compiling and running data export utility...');

// First compile the TypeScript file with ts-node
exec(`npx ts-node --esm ${exportScript}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(stdout);
  console.log('Large sample data JSON file generated successfully!');
});