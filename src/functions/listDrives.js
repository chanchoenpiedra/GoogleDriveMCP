/**
 * functions/listDrives.js
 * Lists My Drive + all Shared Drives.
 */
import { listDrives as driveListDrives } from '../drive.js';

export async function listDrives(drive) {
  return driveListDrives(drive);
}
