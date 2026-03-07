/**
 * drive.js – Google Drive API v3 wrapper
 *
 * KEY: every list/get call includes:
 *   includeItemsFromAllDrives: true
 *   supportsAllDrives: true
 * These two flags are what Claude's native integration is missing,
 * which is why Shared Drives don't appear there.
 */

import { google } from 'googleapis';

/**
 * Returns a Google Drive API v3 client authenticated with the given auth client.
 */
export function getDriveClient(auth) {
  return google.drive({ version: 'v3', auth });
}

/**
 * Lists all drives the user has access to:
 * - "My Drive" (always present as a virtual root)
 * - All Shared Drives (formerly Team Drives)
 *
 * @returns {Array<{id, name, kind}>}
 */
export async function listDrives(drive) {
  const results = [];

  // Add "My Drive" as a virtual entry
  results.push({
    id: 'root',
    name: 'My Drive',
    kind: 'drive#myDrive',
  });

  // Paginate through all Shared Drives
  let pageToken;
  do {
    const res = await drive.drives.list({
      pageSize: 100,
      fields: 'nextPageToken, drives(id, name, kind)',
      ...(pageToken ? { pageToken } : {}),
    });
    const drives = res.data.drives || [];
    results.push(...drives.map((d) => ({ id: d.id, name: d.name, kind: d.kind })));
    pageToken = res.data.nextPageToken;
  } while (pageToken);

  return results;
}

/**
 * Lists files and folders inside a given parent (folder or drive root).
 *
 * @param {object} drive - Drive API client
 * @param {string} parentId - Folder ID or drive ID ('root' for My Drive)
 * @param {string|null} driveId - Shared Drive ID (null for My Drive)
 * @param {number} maxResults
 * @returns {Array<FileMetadata>}
 */
export async function listFiles(drive, parentId, driveId = null, maxResults = 100) {
  const params = {
    q: `'${parentId}' in parents and trashed = false`,
    pageSize: Math.min(maxResults, 1000),
    fields: 'files(id, name, mimeType, size, modifiedTime, owners, webViewLink)',
    orderBy: 'folder,name',
    // Shared Drive flags
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  };

  if (driveId && driveId !== 'root') {
    params.driveId = driveId;
    params.corpora = 'drive';
  } else {
    params.corpora = 'allDrives';
  }

  const res = await drive.files.list(params);
  return (res.data.files || []).map(normalizeFile);
}

/**
 * Searches for files across all drives.
 *
 * @param {object} drive - Drive API client
 * @param {string} query - Search query (plain text)
 * @param {number} maxResults
 * @returns {Array<FileMetadata>}
 */
export async function searchFiles(drive, query, maxResults = 50) {
  // Escape single quotes in the user query
  const escaped = query.replace(/'/g, "\\'");

  const res = await drive.files.list({
    q: `fullText contains '${escaped}' and trashed = false`,
    pageSize: Math.min(maxResults, 1000),
    fields: 'files(id, name, mimeType, size, modifiedTime, owners, parents, driveId, webViewLink)',
    orderBy: 'modifiedTime desc',
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
    corpora: 'allDrives',
  });

  return (res.data.files || []).map(normalizeFile);
}

/**
 * Gets metadata for a single file by ID.
 *
 * @param {object} drive - Drive API client
 * @param {string} fileId
 * @returns {FileMetadata}
 */
export async function getFileMetadata(drive, fileId) {
  const res = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size, modifiedTime, createdTime, owners, parents, driveId, webViewLink, description, shared, sharingUser',
    supportsAllDrives: true,
  });

  return normalizeFile(res.data);
}

/**
 * Downloads a binary file (PDF, DOCX, XLSX, PPTX, etc.) as a Buffer.
 *
 * @param {object} drive - Drive API client
 * @param {string} fileId
 * @returns {Buffer}
 */
export async function downloadFile(drive, fileId) {
  const res = await drive.files.get(
    { fileId, alt: 'media', supportsAllDrives: true },
    { responseType: 'arraybuffer' }
  );

  return Buffer.from(res.data);
}

/**
 * Exports a Google Workspace file (Docs, Sheets, Slides) to a plain format.
 *
 * MIME type map:
 *   Google Docs   → text/plain
 *   Google Sheets → text/csv
 *   Google Slides → text/plain
 *
 * @param {object} drive - Drive API client
 * @param {string} fileId
 * @param {string} mimeType - The source Google MIME type
 * @returns {{ content: string, exportedAs: string }}
 */
export async function exportGoogleFile(drive, fileId, mimeType) {
  const exportMimeMap = {
    'application/vnd.google-apps.document': 'text/plain',
    'application/vnd.google-apps.spreadsheet': 'text/csv',
    'application/vnd.google-apps.presentation': 'text/plain',
  };

  const exportMime = exportMimeMap[mimeType];
  if (!exportMime) {
    throw new Error(`Cannot export Google file of type: ${mimeType}`);
  }

  const res = await drive.files.export(
    { fileId, mimeType: exportMime },
    { responseType: 'text' }
  );

  return { content: res.data, exportedAs: exportMime };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeFile(f) {
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? parseInt(f.size, 10) : null,
    modifiedTime: f.modifiedTime,
    createdTime: f.createdTime || null,
    owners: (f.owners || []).map((o) => o.displayName || o.emailAddress),
    driveId: f.driveId || null,
    webViewLink: f.webViewLink || null,
    description: f.description || null,
  };
}
