/**
 * functions/readFile.js
 * Reads file content as plain text. Handles Google Workspace files
 * (export as text) and binary files (download + convert).
 */
import {
  getFileMetadata,
  exportGoogleFile,
  downloadFile,
} from '../drive.js';
import { convertToText } from '../converters.js';

const MAX_CHARS = 50_000;

export async function readFile(drive, fileId) {
  const meta = await getFileMetadata(drive, fileId);
  const { mimeType, name } = meta;

  let content;

  if (mimeType.startsWith('application/vnd.google-apps.')) {
    const { content: exported } = await exportGoogleFile(drive, fileId, mimeType);
    content = exported;
  } else {
    const buffer = await downloadFile(drive, fileId);
    content = await convertToText(buffer, mimeType, name);
  }

  if (content.length > MAX_CHARS) {
    content = content.slice(0, MAX_CHARS) + '\n\n[...content truncated at 50,000 characters...]';
  }

  return { name, mimeType, content };
}
