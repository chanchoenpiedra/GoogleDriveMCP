/**
 * tools/searchFiles.tool.js
 * Registers the "search_files" MCP tool.
 */
import { searchFiles } from '../functions/searchFiles.js';

export function registerSearchFilesTool(server, drive) {
  server.tool(
    'search_files',
    'Searches for files across ALL Google Drives (My Drive and all Shared Drives) ' +
      'using full-text search. Returns file names, IDs, types, and locations.',
    {
      query: {
        type: 'string',
        description: 'Search terms to look for in file names and content.',
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of results (default: 20, max: 100).',
      },
    },
    async ({ query, max_results = 20 }) => {
      const files = await searchFiles(drive, query, max_results);

      if (files.length === 0) {
        return {
          content: [{ type: 'text', text: `No files found matching: "${query}"` }],
        };
      }

      const text = files
        .map((f) => {
          const owners = f.owners.length ? ` | Owner: ${f.owners[0]}` : '';
          const modified = f.modifiedTime
            ? ` | Modified: ${new Date(f.modifiedTime).toLocaleDateString()}`
            : '';
          return `📄 **${f.name}**\n   ID: ${f.id}  |  Type: ${f.mimeType}${owners}${modified}`;
        })
        .join('\n\n');

      return {
        content: [
          {
            type: 'text',
            text: `Found ${files.length} result(s) for "${query}":\n\n${text}`,
          },
        ],
      };
    }
  );
}
