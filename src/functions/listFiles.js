/**
 * functions/listFiles.js
 * Lists files/folders inside a given parent (folder or drive root).
 */
import { listFiles as driveListFiles } from '../drive.js';

export async function listFiles(drive, parentId, driveId = null, maxResults = 100) {
  return driveListFiles(drive, parentId, driveId, maxResults);
}
