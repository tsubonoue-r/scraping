#!/usr/bin/env tsx

import { runScraping } from './src/main.js';

const inputFile = process.argv[2] || 'input.csv';
const outputFile = process.argv[3] || 'output.csv';

runScraping(inputFile, outputFile).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
