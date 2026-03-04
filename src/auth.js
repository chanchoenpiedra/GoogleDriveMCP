/**
 * auth.js – OAuth2 Desktop App flow for Google Drive
 *
 * First run: opens the browser for the user to log in and saves
 * the refresh token to ~/.plugindrive/token.json
 * Subsequent runs: silently reuses the saved token.
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { URL } from 'url';
import open from 'open';

const TOKEN_DIR = path.join(os.homedir(), '.plugindrive');
const TOKEN_PATH = path.join(TOKEN_DIR, 'token.json');
const CREDENTIALS_PATH = path.join(TOKEN_DIR, 'credentials.json');

const SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
];

/**
 * Returns an authenticated OAuth2 client.
 * If no saved token exists, starts the interactive OAuth flow.
 */
export async function getAuthClient() {
  const credentials = loadCredentials();
  const { client_id, client_secret } = credentials;

  // We use a loopback redirect URI as recommended by Google for Desktop apps
  const REDIRECT_URI = 'http://localhost:3456/oauth2callback';

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);

  // Try to load a saved token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);

    // Auto-save any new tokens Google issues (e.g. refreshed access tokens)
    oAuth2Client.on('tokens', (newTokens) => {
      const merged = { ...token, ...newTokens };
      saveToken(merged);
    });

    // Proactively refresh if the access token is expired or about to expire (< 5 min)
    if (token.expiry_date && token.expiry_date < Date.now() + 5 * 60 * 1000) {
      try {
        const { credentials: refreshed } = await oAuth2Client.refreshAccessToken();
        saveToken(refreshed);
        oAuth2Client.setCredentials(refreshed);
      } catch {
        // Token refresh failed – run the full OAuth flow again
        return runOAuthFlow(oAuth2Client);
      }
    }

    return oAuth2Client;
  }

  return runOAuthFlow(oAuth2Client);
}

/**
 * Runs the interactive OAuth2 flow:
 * 1. Opens the user's browser to the Google consent screen
 * 2. Starts a temporary local HTTP server to receive the callback
 * 3. Exchanges the auth code for tokens and saves them
 */
async function runOAuthFlow(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // force refresh_token to be issued
  });

  console.error('\n🔑 PluginDrive needs access to your Google Drive.');
  console.error('   Opening your browser for login...\n');
  console.error(`   If the browser doesn't open, paste this URL manually:\n   ${authUrl}\n`);

  await open(authUrl);

  // Wait for the OAuth callback on localhost:3456
  const code = await waitForAuthCode();

  const { tokens } = await oAuth2Client.getToken(code);
  saveToken(tokens);
  oAuth2Client.setCredentials(tokens);

  console.error('\n✅ Google Drive access authorised. Token saved.\n');
  return oAuth2Client;
}

/**
 * Starts a one-shot HTTP server on port 3456 and waits for the
 * ?code= query parameter that Google sends after user consent.
 */
function waitForAuthCode() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost:3456');

      if (url.pathname !== '/oauth2callback') {
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.end(`<h2>Authentication failed: ${error}</h2><p>You can close this tab.</p>`);
        server.close();
        reject(new Error(`OAuth error: ${error}`));
        return;
      }

      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>PluginDrive – Authorised</title>
            <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f0fdf4}
            .card{text-align:center;padding:2rem;background:white;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,.1)}
            h1{color:#16a34a}p{color:#555}</style>
          </head>
          <body>
            <div class="card">
              <h1>✅ PluginDrive is authorised!</h1>
              <p>Google Drive is now connected to Claude Desktop.</p>
              <p>You can close this tab and return to Claude.</p>
            </div>
          </body>
        </html>
      `);

      server.close();
      resolve(code);
    });

    server.listen(3456, '127.0.0.1', () => {
      // Server is ready and waiting
    });

    server.on('error', (err) => {
      reject(new Error(`Could not start auth server on port 3456: ${err.message}`));
    });

    // Safety timeout: 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('Authentication timed out (5 min). Run again to retry.'));
    }, 5 * 60 * 1000);
  });
}

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `No credentials found at ${CREDENTIALS_PATH}.\n` +
      'Run the installer script first, or copy your credentials.json there manually.\n' +
      'See docs/google-cloud-setup.md for instructions.'
    );
  }

  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));

  // Support both the raw file from Google Cloud Console and our own simplified format
  if (raw.installed) return raw.installed;
  if (raw.web) return raw.web;
  if (raw.client_id && raw.client_secret) return raw;

  throw new Error('credentials.json format not recognised. Download a fresh OAuth2 "Desktop app" JSON from Google Cloud Console.');
}

function saveToken(token) {
  if (!fs.existsSync(TOKEN_DIR)) fs.mkdirSync(TOKEN_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}
