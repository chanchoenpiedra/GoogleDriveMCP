/**
 * tools/listFiles.tool.js
 * Registers the "list_files" MCP tool.
 */
import { listFiles } from '../functions/listFiles.js';

export function registerListFilesTool(server, drive) {
  server.tool(
    'list_files',
    'Lists files and folders inside a specific Google Drive or folder. ' +
      'Use list_drives first to get drive IDs, then use this to browse folders. ' +
      'Pass a folder ID as parent_id to navigate into subdirectories.',
    {
      parent_id: {
        type: 'string',
        description:
          "ID of the folder or drive to list. Use 'root' for My Drive root. " +
          'For a Shared Drive root, use the drive ID from list_drives.',
      },
      drive_id: {
        type: 'string',
        description:
          'Shared Drive ID (required when listing inside a Shared Drive). ' +
          "Leave empty for My Drive.",
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of files to return (default: 100, max: 1000).',
      },
    },
    async ({ parent_id, drive_id = null, max_results = 100 }) => {
      const files = await listFiles(drive, parent_id, drive_id, max_results);

      if (files.length === 0) {
        return { content: [{ type: 'text', text: 'This folder is empty.' }] };
      }

      const text = files
        .map((f) => {
          const isFolder = f.mimeType === 'application/vnd.google-apps.folder';
          const icon = isFolder ? '📁' : fileIcon(f.mimeType);
          const size = f.size ? ` (${humanSize(f.size)})` : '';
          const modified = f.modifiedTime
            ? ` | Modified: ${new Date(f.modifiedTime).toLocaleDateString()}`
            : '';
          return `${icon} ${f.name}${size}${modified}\n   ID: ${f.id}  |  Type: ${f.mimeType}`;
        })
        .join('\n\n');

      return {
        content: [{ type: 'text', text: `${files.length} item(s):\n\n${text}` }],
      };
    }
  );
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fileIcon(mimeType) {
  if (mimeType === 'application/vnd.google-apps.document') return '📝';
  if (mimeType === 'application/vnd.google-apps.spreadsheet') return '📊';
  if (mimeType === 'application/vnd.google-apps.presentation') return '📽️';
  if (mimeType === 'application/pdf') return '📕';
  if (mimeType.includes('wordprocessing')) return '📄';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  return '📄';
}
