import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'yaml';

// Read the YAML file
const yamlContent = readFileSync('./swagger-api-spec.yaml', 'utf8');

// Parse YAML to JS object
const jsonObject = parse(yamlContent);

// Convert to JSON and write to file
writeFileSync('./swagger-api-spec.json', JSON.stringify(jsonObject, null, 2));

console.log('Conversion completed: swagger-api-spec.yaml → swagger-api-spec.json');