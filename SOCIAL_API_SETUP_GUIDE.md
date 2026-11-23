# Cross-Platform Content Planner: Social Media API Keys Setup Guide

This guide explains step-by-step where and how to obtain all the environment variables for **YouTube**, **Meta (Instagram & Facebook)**, and **LinkedIn**, and how to paste them into `server/.env`.

---

## 1. 📺 YouTube (Google Cloud Console & YouTube Data API v3)

### Variables to add in `.env`:
```env
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
YOUTUBE_CHANNEL_ID=
```

### Step-by-Step Instructions:
1. **Open Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (e.g. `koh-command-center`) or select your existing one.
2. **Enable the YouTube Data API v3**:
   - Go to **APIs & Services** > **Library**.
   - Search for **YouTube Data API v3** and click **Enable**.
3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** > **OAuth consent screen**.
   - Choose **External** (or Internal for Google Workspace).
   - Fill in App Name (`koh! Content Hub`), user support email, and developer contact.
   - In **Scopes**, add:
     - `https://www.googleapis.com/auth/youtube.upload`
     - `https://www.googleapis.com/auth/youtube`
   - In **Test users**, add the Google email account that manages your YouTube channel.
4. **Create OAuth 2.0 Credentials**:
   - Go to **APIs & Services** > **Credentials** > click **Create Credentials** > **OAuth client ID**.
   - Application Type: **Web application** (or Desktop app).
   - In **Authorized redirect URIs**, add `https://developers.google.com/oauthplayground`.
   - Click **Create**. Copy your **Client ID** and **Client Secret** into `.env`.
5. **Generate a Refresh Token**:
   - Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
   - Click the **Gear icon (OAuth 2.0 configuration)** in the top right:
     - Check **"Use your own OAuth credentials"**.
     - Paste your `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET`.
   - On the left panel under **Step 1**, scroll down or input: `https://www.googleapis.com/auth/youtube.upload`.
   - Click **Authorize APIs** and log in with your YouTube channel account.
   - In **Step 2**, click **Exchange authorization code for tokens**.
   - Copy the resulting **Refresh token** and paste it as `YOUTUBE_REFRESH_TOKEN` in `server/.env`.
6. **Channel ID**:
   - Open YouTube Studio (`studio.youtube.com`) > **Settings** > **Channel** > **Advanced Settings** > copy your **Channel ID**.

---

## 2. 📸 Meta (Instagram Business & Facebook Page)

### Variables to add in `.env`:
```env
META_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```

### Prerequisites:
- Your Instagram account must be a **Professional / Business / Creator account**.
- Your Instagram account must be **linked to your Facebook Page** (via Facebook Page Settings > Linked Accounts > Instagram).

### Step-by-Step Instructions:
1. **Register as a Meta Developer**:
   - Go to [Meta for Developers](https://developers.facebook.com/).
   - Log in and click **My Apps** > **Create App**.
   - Select **Other** > App Type: **Business**.
   - Enter App Name (`koh! Publishing Engine`) and your business email.
2. **Add Products**:
   - In your app dashboard, add **Facebook Login for Business** and **Instagram Graph API**.
3. **Generate User Token & Permissions**:
   - Go to [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
   - Select your App from the dropdown.
   - Under **User or Page**, select **User Token**.
   - Under **Permissions**, add these scopes:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`
     - `instagram_basic`
     - `instagram_content_publish`
     - `business_management`
   - Click **Generate Access Token** and approve the Facebook login dialog.
4. **Retrieve Page ID & Instagram Business Account ID**:
   - In Graph API Explorer, make a GET request to:
     `me/accounts?fields=name,id,access_token,instagram_business_account{id,username}`
   - Click **Submit**. You will receive:
     - `id`: This is your **FACEBOOK_PAGE_ID**.
     - `instagram_business_account.id`: This is your **INSTAGRAM_BUSINESS_ACCOUNT_ID**.
     - `access_token`: This is your Page Access Token.
5. **Generate a Never-Expiring Long-Lived Page Access Token**:
   - Go to **Access Token Debugger** (`developers.facebook.com/tools/debug/accesstoken/`).
   - Paste the token and click **Extend Access Token** to generate a 60-day or permanent System User token via Business Settings > Users > System Users.
   - Paste the token as `META_PAGE_ACCESS_TOKEN` in `server/.env`.

---

## 3. 💼 LinkedIn (Company Page & Member Social)

### Variables to add in `.env`:
```env
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_URN=
```

### Step-by-Step Instructions:
1. **Create an App in LinkedIn Developer Portal**:
   - Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).
   - Click **Create App**.
   - Fill in App Name (`koh! Command Center`), Company Page URL (`https://www.linkedin.com/company/kohfoods`), and upload a logo.
   - Verify the app via the verification URL sent to your Company Page Admin.
2. **Request Access to Products**:
   - Go to the **Products** tab inside your LinkedIn app.
   - Request:
     - **Share on LinkedIn** (for personal/member posts)
     - **Community Management API** (for posting directly on behalf of your Organization / Company Page).
3. **Generate OAuth 2.0 Access Token**:
   - In the **Auth** tab, under **OAuth 2.0 scopes**, verify you have:
     - `w_member_social`
     - `w_organization_social`
     - `r_organization_social`
   - Use the LinkedIn Token Generator tool or OAuth 2.0 authorization URL to authorize your account:
     `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id={YOUR_CLIENT_ID}&redirect_uri={YOUR_REDIRECT_URI}&scope=w_member_social%20w_organization_social%20r_organization_social`
   - Exchange the returned code for an access token via `POST https://www.linkedin.com/oauth/v2/accessToken`.
   - Paste this token as `LINKEDIN_ACCESS_TOKEN` in `server/.env`.
4. **Get your Organization URN**:
   - Your company page URN format is: `urn:li:organization:<YOUR_NUMERIC_COMPANY_ID>`.
   - You can find your numeric company ID in the URL when viewing your LinkedIn Company Page Admin view (e.g. `https://www.linkedin.com/company/12345678/admin/page-posts/` -> URN is `urn:li:organization:12345678`).
   - Paste this into `server/.env` as `LINKEDIN_ORGANIZATION_URN`.

---

## Summary of `.env` snippet:

```env
# YouTube
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REFRESH_TOKEN=
YOUTUBE_CHANNEL_ID=

# Meta (Instagram + Facebook)
META_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=

# LinkedIn
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_ORGANIZATION_URN=
```
