# Google Cloud Console Setup — Free OAuth2 Credentials for PluginDrive

This is the **only setup step that requires Google Cloud Console**. It is completely free — no billing, no credit card, no paid services. You just need a Google account.

Total time: ~8 minutes.

---

## Step 1 – Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top left (it might say "Select a project")
3. Click **New Project**
4. Name it something like `PluginDrive` (any name is fine)
5. Leave "Location" as "No organization" unless your company has one
6. Click **Create**
7. Wait a few seconds, then make sure `PluginDrive` is selected as the active project in the top bar

---

## Step 2 – Enable the Google Drive API

1. In the left sidebar, go to **APIs & Services → Library**
2. In the search box type: `Google Drive API`
3. Click on **Google Drive API** in the results
4. Click the blue **Enable** button
5. Wait for it to activate (a few seconds)

---

## Step 3 – Configure the OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services → OAuth consent screen**
2. Select **External** as the User type
3. Click **Create**
4. Fill in the required fields:
   - **App name**: `PluginDrive` (or anything you like)
   - **User support email**: your email address
   - **Developer contact information** (at the bottom): your email address
5. Click **Save and Continue**
6. On the "Scopes" page, click **Save and Continue** (no changes needed)
7. On the "Test users" page:
   - Click **Add Users**
   - Add the Google accounts of **everyone on your team** who will use PluginDrive
   - Click **Save and Continue**
8. Click **Back to Dashboard**

> [!NOTE]
> You added users as "Test users" because the app is in testing mode. This lets up to 100 users authenticate without publishing the app publicly. For most teams this is perfect — no extra steps required.

---

## Step 4 – Create OAuth 2.0 Credentials

1. In the left sidebar, go to **APIs & Services → Credentials**
2. Click **+ Create Credentials** at the top
3. Select **OAuth client ID**
4. Under **Application type**, select **Desktop app**
5. Name it `PluginDrive Desktop` (any name)
6. Click **Create**
7. A popup will appear showing your **Client ID** and **Client Secret**
8. **Copy and keep both values** — you'll paste them into the installer

> [!IMPORTANT]
> The Client ID looks like: `123456789-abcdefghijkl.apps.googleusercontent.com`  
> The Client Secret looks like: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxx`
>
> You only need these once — the installer will save them locally.

---

## Step 5 – Run the Installer

Go back and run the installer for your operating system:

- **Mac:** `bash install/install-mac.sh`
- **Windows:** Right-click `install\install-windows.ps1` → Run with PowerShell

Paste the Client ID and Client Secret when prompted.

---

## Sharing with Teammates

**You only create the Google Cloud Project once.** Your teammates do NOT need their own Google Cloud Project.

Each teammate:

1. Gets the `PluginDrive` folder (zip it and share via email / Drive / USB)
2. Runs the installer
3. Uses the **same** Client ID and Client Secret you created above
4. Logs in with their own Google account when the browser opens

Each person's Google token is saved locally on their own computer.

---

## Troubleshooting

| Problem                                                                         | Solution                                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| "Access blocked: PluginDrive has not completed the Google verification process" | You forgot to add the user as a Test User in Step 3. Go back and add them.                 |
| "Error 400: redirect_uri_mismatch"                                              | The OAuth app type isn't set to "Desktop app". Delete the credential and create a new one. |
| Browser doesn't open                                                            | Manually copy the URL from the terminal and paste it in any browser.                       |
| "Token has been expired or revoked"                                             | Run `node src/server.js --auth` again to re-authenticate.                                  |
