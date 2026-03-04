/**
 * functions/searchFiles.js
 * Full-text search across all drives.
 */
import { searchFiles as driveSearch } from '../drive.js';

export async function searchFiles(drive, query, maxResults = 20) {
  return driveSearch(drive, query, maxResults);
}
