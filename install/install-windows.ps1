# PluginDrive – Windows Installer (PowerShell)
# Connects Claude Desktop to Google Drive Shared Drives via MCP
# Usage: Right-click → "Run with PowerShell"   OR   .\install-windows.ps1

#Requires -Version 5.1
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$PluginDir = Split-Path $PSScriptRoot -Parent
$ConfigDir = Join-Path $env:USERPROFILE '.plugindrive'
$ClaudeConfigPath = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'

# ── Helpers ──────────────────────────────────────────────────────────────────
function Write-Header($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
    Write-Host ""
}
function Write-OK($msg)   { Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail($msg) {
    Write-Host "❌ $msg" -ForegroundColor Red
    Read-Host "`nPress Enter to exit"
    exit 1
}

# ── Banner ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     PluginDrive – Windows Installer      ║" -ForegroundColor Cyan
Write-Host "║  Claude Desktop + Google Drive MCP       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Claude Desktop ─────────────────────────────────────────────
Write-Header "Step 1: Checking Claude Desktop"

$ClaudeDir = Join-Path $env:APPDATA 'Claude'
if (-not (Test-Path $ClaudeDir)) {
    Write-Fail "Claude Desktop not found.`nDownload it from https://claude.ai/download, install it, then run this script again."
}
Write-OK "Claude Desktop found"

# ── Step 2: Check / Install Node.js ──────────────────────────────────────────
Write-Header "Step 2: Checking Node.js"

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVersion = (node -v).TrimStart('v')
    $nodeMajor = [int]($nodeVersion.Split('.')[0])
    if ($nodeMajor -lt 18) {
        Write-Warn "Node.js $nodeVersion found, but version 18+ is required."
        Write-Host "Please download and install Node.js 18+ from: https://nodejs.org/en/download/"
        Write-Host "After installing, run this script again."
        Write-Fail "Please upgrade Node.js and retry."
    } else {
        Write-OK "Node.js $nodeVersion found"
    }
} else {
    Write-Warn "Node.js not found."
    Write-Host ""
    Write-Host "Please install Node.js 18+ (LTS) from:" -ForegroundColor Yellow
    Write-Host "  https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host ""
    $open = Read-Host "Open the Node.js download page now? (Y/n)"
    if ($open -ne 'n' -and $open -ne 'N') {
        Start-Process "https://nodejs.org/en/download/"
    }
    Write-Fail "Install Node.js and then run this script again."
}

# ── Step 3: Install npm dependencies ─────────────────────────────────────────
Write-Header "Step 3: Installing dependencies"

Set-Location $PluginDir
npm install --omit=dev --silent
if ($LASTEXITCODE -ne 0) { Write-Fail "npm install failed. Check your internet connection." }
Write-OK "Dependencies installed"

# ── Step 4: Google OAuth credentials ─────────────────────────────────────────
Write-Header "Step 4: Google OAuth credentials"

Write-Host "You need an OAuth2 Client ID and Secret from Google Cloud Console."
Write-Host "If you haven't done this yet, see the guide at:"
Write-Host "  $PluginDir\docs\google-cloud-setup.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Once you have the credentials, paste them below."
Write-Host "(They are saved locally on your computer only.)"
Write-Host ""

if (-not (Test-Path $ConfigDir)) {
    New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
}

$ClientId = Read-Host "  Client ID"
if ([string]::IsNullOrWhiteSpace($ClientId)) { Write-Fail "Client ID cannot be empty." }

$ClientSecretSecure = Read-Host "  Client Secret" -AsSecureString
$ClientSecret = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ClientSecretSecure)
)
if ([string]::IsNullOrWhiteSpace($ClientSecret)) { Write-Fail "Client Secret cannot be empty." }

$credentials = @{
    installed = @{
        client_id     = $ClientId
        client_secret = $ClientSecret
        redirect_uris = @("http://localhost:3456/oauth2callback")
        auth_uri      = "https://accounts.google.com/o/oauth2/auth"
        token_uri     = "https://oauth2.googleapis.com/token"
    }
}
$credPath = Join-Path $ConfigDir 'credentials.json'
$credentials | ConvertTo-Json -Depth 5 | Set-Content $credPath -Encoding UTF8
Write-OK "Credentials saved to $credPath"

# ── Step 5: Update Claude Desktop config ─────────────────────────────────────
Write-Header "Step 5: Configuring Claude Desktop"

# Normalise path separators (JSON needs forward slashes or escaped backslashes)
$ServerPath = ($PluginDir -replace '\\', '/') + '/src/server.js'

$mcpEntry = @{
    command = "node"
    args    = @($ServerPath)
}

if (Test-Path $ClaudeConfigPath) {
    $config = Get-Content $ClaudeConfigPath -Raw | ConvertFrom-Json
    if (-not $config.PSObject.Properties['mcpServers']) {
        $config | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([PSCustomObject]@{})
    }
    $config.mcpServers | Add-Member -NotePropertyName 'plugindrive' -NotePropertyValue $mcpEntry -Force
    $config | ConvertTo-Json -Depth 10 | Set-Content $ClaudeConfigPath -Encoding UTF8
} else {
    $config = @{
        mcpServers = @{
            plugindrive = $mcpEntry
        }
    }
    $config | ConvertTo-Json -Depth 10 | Set-Content $ClaudeConfigPath -Encoding UTF8
}
Write-OK "Claude Desktop config updated"

# ── Step 6: First-time Google login ──────────────────────────────────────────
Write-Header "Step 6: Google Drive authorisation"

Write-Host "Your browser will open for Google login."
Write-Host "Sign in and allow 'Google Drive (read-only)' access."
Write-Host ""
Read-Host "Press Enter when ready"

node "$PluginDir\src\server.js" --auth
if ($LASTEXITCODE -ne 0) { Write-Fail "Google authorisation failed. Check credentials and try again." }
Write-OK "Google Drive authorised"

# ── Done ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║    ✅ PluginDrive installed successfully!        ║" -ForegroundColor Green
Write-Host "╠══════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                  ║" -ForegroundColor Green
Write-Host "║  Next steps:                                     ║" -ForegroundColor Green
Write-Host "║  1. Fully close Claude Desktop (system tray)    ║" -ForegroundColor Green
Write-Host "║  2. Reopen Claude Desktop                        ║" -ForegroundColor Green
Write-Host "║  3. Start a new chat and try:                    ║" -ForegroundColor Green
Write-Host "║     'List all my Google Drives'                  ║" -ForegroundColor Green
Write-Host "║                                                  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
