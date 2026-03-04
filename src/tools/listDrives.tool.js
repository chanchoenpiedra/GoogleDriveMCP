/**
 * tools/listDrives.tool.js
 * Registers the "list_drives" MCP tool.
 */
import { listDrives } from '../functions/listDrives.js';

export function registerListDrivesTool(server, drive) {
  server.tool(
    'list_drives',
    'Lists all Google Drives the user has access to, including My Drive and all Shared Drives (also called Shared Units or Team Drives).',
    {},
    async () => {
      const drives = await listDrives(drive);
      const text = drives
        .map(
          (d) =>
            `• ${d.name}  (ID: ${d.id}${d.kind === 'drive#myDrive' ? ' – My Drive' : ' – Shared Drive'})`
        )
        .join('\n');

      return {
        content: [{ type: 'text', text: `Found ${drives.length} drive(s):\n\n${text}` }],
      };
    }
  );
}
