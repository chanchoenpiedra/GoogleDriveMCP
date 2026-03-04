#!/usr/bin/env bash
# PluginDrive – macOS Installer
# Connects Claude Desktop to Google Drive Shared Drives via MCP
# Usage: bash install-mac.sh

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="$HOME/.plugindrive"
CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

# ── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

print_header() {
  echo -e "\n${CYAN}${BOLD}=== $1 ===${RESET}\n"
}
ok() { echo -e "${GREEN}✅ $1${RESET}"; }
warn() { echo -e "${YELLOW}⚠️  $1${RESET}"; }
fail() { echo -e "${RED}❌ $1${RESET}"; exit 1; }

echo -e "${BOLD}"
echo "╔══════════════════════════════════════════╗"
echo "║       PluginDrive – macOS Installer      ║"
echo "║   Claude Desktop + Google Drive MCP      ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${RESET}"

# ── Step 1: Check Claude Desktop ─────────────────────────────────────────────
print_header "Step 1: Checking Claude Desktop"

if [ ! -d "$HOME/Library/Application Support/Claude" ]; then
  fail "Claude Desktop not found. Download it first from https://claude.ai/download\nAfter installing Claude Desktop, run this script again."
fi
ok "Claude Desktop found"

# ── Step 2: Check / Install Node.js ──────────────────────────────────────────
print_header "Step 2: Checking Node.js"

if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    warn "Node.js $NODE_VERSION found, but version 18+ is required."
    INSTALL_NODE=true
  else
    ok "Node.js $NODE_VERSION found"
    INSTALL_NODE=false
  fi
else
  warn "Node.js not found."
  INSTALL_NODE=true
fi

if [ "$INSTALL_NODE" = true ]; then
  if command -v brew &>/dev/null; then
    echo "Installing Node.js via Homebrew..."
    brew install node
    ok "Node.js installed"
  else
    echo ""
    echo "Please install Node.js 18+ from: https://nodejs.org/en/download/"
    echo "Then run this installer again."
    fail "Node.js not installed"
  fi
fi

# ── Step 3: Install npm dependencies ─────────────────────────────────────────
print_header "Step 3: Installing dependencies"

cd "$PLUGIN_DIR"
npm install --omit=dev --silent
ok "Dependencies installed"

# ── Step 4: Collect Google OAuth credentials ──────────────────────────────────
print_header "Step 4: Google OAuth credentials"

echo "You need an OAuth2 Client ID and Secret from Google Cloud Console."
echo "If you haven't done this yet, follow the guide at:"
echo -e "${CYAN}  $PLUGIN_DIR/docs/google-cloud-setup.md${RESET}"
echo ""
echo "Once you have the credentials, paste them below."
echo "(They stay on your computer only – never sent anywhere.)"
echo ""

mkdir -p "$CONFIG_DIR"

read -rp "  Client ID:     " CLIENT_ID
[ -z "$CLIENT_ID" ] && fail "Client ID cannot be empty"

read -rsp "  Client Secret: " CLIENT_SECRET
echo ""
[ -z "$CLIENT_SECRET" ] && fail "Client Secret cannot be empty"

# Write credentials in the format Google Cloud Console uses (installed app)
cat > "$CONFIG_DIR/credentials.json" << EOF
{
  "installed": {
    "client_id": "$CLIENT_ID",
    "client_secret": "$CLIENT_SECRET",
    "redirect_uris": ["http://localhost:3456/oauth2callback"],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token"
  }
}
EOF
chmod 600 "$CONFIG_DIR/credentials.json"
ok "Credentials saved to $CONFIG_DIR/credentials.json"

# ── Step 5: Update Claude Desktop config ─────────────────────────────────────
print_header "Step 5: Configuring Claude Desktop"

SERVER_CMD="node"
SERVER_ARGS="[\"$PLUGIN_DIR/src/server.js\"]"

# If the config file already exists, merge our entry; otherwise create it.
if [ -f "$CLAUDE_CONFIG" ]; then
  # Simple merge using Python (always available on macOS)
  python3 - <<PYEOF
import json, sys, os

config_path = "$CLAUDE_CONFIG"
plugin_path = "$PLUGIN_DIR"

with open(config_path, 'r') as f:
    config = json.load(f)

if 'mcpServers' not in config:
    config['mcpServers'] = {}

config['mcpServers']['plugindrive'] = {
    'command': 'node',
    'args': [f'{plugin_path}/src/server.js']
}

with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print('Config updated successfully')
PYEOF
else
  mkdir -p "$(dirname "$CLAUDE_CONFIG")"
  cat > "$CLAUDE_CONFIG" << EOF
{
  "mcpServers": {
    "plugindrive": {
      "command": "node",
      "args": ["$PLUGIN_DIR/src/server.js"]
    }
  }
}
EOF
fi
ok "Claude Desktop config updated"

# ── Step 6: First-time Google login ──────────────────────────────────────────
print_header "Step 6: Google Drive authorisation"

echo "We need to link your Google account to PluginDrive."
echo "Your browser will open – log in and allow access."
echo ""
read -rp "Press Enter when you're ready..."

node "$PLUGIN_DIR/src/server.js" --auth
ok "Google Drive authorised"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}"
echo "╔══════════════════════════════════════════════════╗"
echo "║     ✅ PluginDrive installed successfully!       ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Next steps:                                     ║"
echo "║  1. Fully quit Claude Desktop (⌘Q)              ║"
echo "║  2. Reopen Claude Desktop                        ║"
echo "║  3. Start a new chat and try:                    ║"
echo "║     \"List all my Google Drives\"                  ║"
echo "║                                                  ║"
echo "╚══════════════════════════════════════════════════╝"
echo -e "${RESET}"
