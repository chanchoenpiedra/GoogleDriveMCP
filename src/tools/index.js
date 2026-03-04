/**
 * tools/index.js
 * Registers all MCP tools on the server instance.
 * Add new tools here — no changes needed to server.js.
 */
import { registerListDrivesTool } from './listDrives.tool.js';
import { registerListFilesTool } from './listFiles.tool.js';
import { registerReadFileTool } from './readFile.tool.js';
import { registerSearchFilesTool } from './searchFiles.tool.js';
import { registerGetFileMetadataTool } from './getFileMetadata.tool.js';

export function registerAllTools(server, drive) {
  registerListDrivesTool(server, drive);
  registerListFilesTool(server, drive);
  registerReadFileTool(server, drive);
  registerSearchFilesTool(server, drive);
  registerGetFileMetadataTool(server, drive);
}
