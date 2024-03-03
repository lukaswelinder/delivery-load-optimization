import { join } from 'node:path';

const testFile = process.argv[2];
console.error(
  new Error(`${testFile} path: ${join(__dirname, '../', testFile)}`),
);
