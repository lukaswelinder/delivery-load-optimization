import { readFile } from 'node:fs/promises';
import { join as joinPath } from 'node:path';
import { URL } from 'url';

import type { Coordinate } from './types';
import { Delivery } from './Delivery';

// NOTE: `__dirname` is not provided as a global when using `"type": "module"`
const __dirname = new URL('.', import.meta.url).pathname;

// Regex: if friend, why not friend shaped?
const problemLinePattern =
  /^(\d+)\s+\((-?\d+\.\d+),(-?\d+\.\d+)\)\s\((-?\d+\.\d+),(-?\d+\.\d+)\)$/;

/**
 * Reads problem file from filesystem and returns the contents as structured date.
 *
 * @param problemFile Accepts problem file path in accordance with evaluation script.
 * @returns Async result provides <id, Delivery> map entreis.
 */
export async function readAndParseProblemFile(
  problemFile: string,
): Promise<[id: number, Delivery][]> {
  // Problem file path is in a parent directory
  const filePath = joinPath(__dirname, '../', problemFile);
  const fileContents = await readFile(filePath, 'utf-8');
  const fileLines = fileContents.split('\n');
  const result: [number, Delivery][] = [];
  // Ignore column name line by starting at 1
  for (let i = 1; i < fileLines.length; i++) {
    const line = fileLines[i];
    // A production solution should do better input validation
    if (!line) {
      continue;
    }
    const lineMatch = problemLinePattern.exec(line);
    if (!lineMatch) {
      throw new Error('Invalid input format.');
    }
    const id = +lineMatch[1];
    // Type inference was not happy with skimpy input/type validation
    const pickup: Coordinate = [+lineMatch[2], +lineMatch[3]];
    const dropoff: Coordinate = [+lineMatch[4], +lineMatch[5]];
    result.push([id, new Delivery(id, pickup, dropoff)]);
  }
  return result;
}
