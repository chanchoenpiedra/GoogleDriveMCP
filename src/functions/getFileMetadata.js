/**
 * functions/getFileMetadata.js
 * Returns detailed metadata for a single file.
 */
import { getFileMetadata as driveGetMeta } from '../drive.js';

export async function getFileMetadata(drive, fileId) {
  return driveGetMeta(drive, fileId);
}
