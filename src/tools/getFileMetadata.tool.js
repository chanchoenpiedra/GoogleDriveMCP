/**
 * tools/getFileMetadata.tool.js
 * Registers the "get_file_metadata" MCP tool.
 */
import { getFileMetadata } from '../functions/getFileMetadata.js';

export function registerGetFileMetadataTool(server, drive) {
  server.tool(
    'get_file_metadata',
    'Returns detailed metadata for a specific file: name, type, size, owner, ' +
      'last modified date, Drive location, and sharing link.',
    {
      file_id: {
        type: 'string',
        description: 'The Google Drive file ID.',
      },
    },
    async ({ file_id }) => {
      const meta = await getFileMetadata(drive, file_id);

      const lines = [
        `**Name:** ${meta.name}`,
        `**Type:** ${meta.mimeType}`,
        `**ID:** ${meta.id}`,
        meta.size != null ? `**Size:** ${humanSize(meta.size)}` : null,
        meta.owners.length ? `**Owner(s):** ${meta.owners.join(', ')}` : null,
        meta.createdTime
          ? `**Created:** ${new Date(meta.createdTime).toLocaleString()}`
          : null,
        meta.modifiedTime
          ? `**Last Modified:** ${new Date(meta.modifiedTime).toLocaleString()}`
          : null,
        meta.driveId ? `**Shared Drive ID:** ${meta.driveId}` : null,
        meta.webViewLink ? `**Link:** ${meta.webViewLink}` : null,
        meta.description ? `**Description:** ${meta.description}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      return { content: [{ type: 'text', text: lines }] };
    }
  );
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
