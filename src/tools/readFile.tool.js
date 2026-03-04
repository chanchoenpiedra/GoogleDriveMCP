/**
 * tools/readFile.tool.js
 * Registers the "read_file" MCP tool.
 */
import { readFile } from '../functions/readFile.js';

export function registerReadFileTool(server, drive) {
  server.tool(
    'read_file',
    'Reads the content of a file from Google Drive and returns it as text. ' +
      'Supports: Google Docs, Google Sheets (as CSV), Google Slides, PDF, DOCX, XLSX, PPTX, and plain text. ' +
      'Use list_files or search_files to get the file ID first.',
    {
      file_id: {
        type: 'string',
        description: 'The Google Drive file ID.',
      },
    },
    async ({ file_id }) => {
      const { name, mimeType, content } = await readFile(drive, file_id);

      return {
        content: [
          {
            type: 'text',
            text: `📄 **${name}** (${mimeType})\n\n${content}`,
          },
        ],
      };
    }
  );
}
