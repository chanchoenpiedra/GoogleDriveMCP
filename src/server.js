#!/usr/bin/env node
/**
 * server.js – PluginDrive MCP Server (entry point)
 *
 * This file is intentionally thin. All tools live in src/tools/,
 * all Drive API logic in src/functions/ and src/drive.js.
 *
 * Usage:
 *   node src/server.js           (normal MCP server mode)
 *   node src/server.js --auth    (run OAuth flow only, then exit)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getAuthClient } from './auth.js';
import { getDriveClient } from './drive.js';
import { registerAllTools } from './tools/index.js';

const isAuthOnly = process.argv.includes('--auth');

async function main() {
  // Authenticate (or run the interactive OAuth flow on first run)
  const auth = await getAuthClient();
  const drive = getDriveClient(auth);

  if (isAuthOnly) {
    console.error('✅ Authentication successful. You can close this window.');
    process.exit(0);
  }

  // Create MCP server and register all tools
  const server = new McpServer({ name: 'plugindrive', version: '1.0.0' });
  registerAllTools(server, drive);

  // Connect via stdio transport (Claude Desktop communicates over stdin/stdout)
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🚀 PluginDrive MCP server running');
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
