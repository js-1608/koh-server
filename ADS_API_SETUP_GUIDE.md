# Paid Ads Scheduling & Planning Setup Guide: Meta Ads & Google Ads

This guide details step-by-step how to obtain and configure API credentials for scheduling and managing ads on **Meta (Facebook & Instagram Ads Manager)** and **Google Ads (Performance Max & Search Campaigns)** in `server/.env`.

---

## 1. 📸 Meta Marketing API (Facebook & Instagram Ads)

### Variables to add in `server/.env`:
```env
META_ADS_ACCESS_TOKEN=
META_AD_ACCOUNT_ID=
META_PIXEL_ID=
```

### Step-by-Step Instructions:
1. **Access Meta for Developers**:
   - Go to [Meta for Developers](https://developers.facebook.com/).
   - Open your existing app or click **Create App** > Type: **Business**.
2. **Add the Marketing API Product**:
   - In your App Dashboard, locate **Marketing API** and click **Set Up**.
3. **Generate User / System User Access Token**:
   - Go to [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/).
   - Select your App, and in the **Permissions** section, add:
     - `ads_management`
     - `ads_read`
     - `business_management`
     - `pages_read_engagement`
   - Click **Generate Access Token**.
   - For a production/never-expiring token:
     - Go to **Business Manager Settings** (`business.facebook.com/settings/`) > **Users** > **System Users**.
     - Create a System User (Role: Admin or Employee), click **Assign Assets**, grant your Ad Account `Manage Campaigns` permission, and click **Generate Token**.
     - Copy the token and paste it as `META_ADS_ACCESS_TOKEN`.
4. **Locate your Ad Account ID**:
   - Open [Meta Ads Manager](https://adsmanager.facebook.com/).
   - In the account switcher at top-left, view your numeric account ID (e.g. `1234567890`).
   - Format: prefix with `act_`, e.g. `act_1234567890`.
   - Paste it as `META_AD_ACCOUNT_ID`.
5. **(Optional) Meta Pixel ID**:
   - In Events Manager (`business.facebook.com/events_manager`), copy your Pixel Dataset ID and paste as `META_PIXEL_ID`.

---

## 2. 🚀 Google Ads API (Performance Max & Responsive Search)

### Variables to add in `server/.env`:
```env
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_CUSTOMER_ID=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=
```

### Step-by-Step Instructions:
1. **Developer Token (Google Ads Manager Account / MCC)**:
   - You need a Google Ads Manager Account (MCC). Create one at [Google Ads Manager](https://ads.google.com/home/tools/manager-accounts/).
   - In your MCC account, navigate to **Tools and Settings (gear icon)** > **API Center**.
   - Fill in your contact and company details to request a **Developer Token** (Test Account Access is instant; Basic Access allows production requests).
   - Copy this token as `GOOGLE_ADS_DEVELOPER_TOKEN`.
2. **Google Cloud OAuth2 Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create or select your project, navigate to **APIs & Services > Library**, search for **Google Ads API**, and click **Enable**.
   - In **OAuth consent screen**, set user type to **External** and add your Google Ads login email as a test user.
   - In **Credentials**, click **Create Credentials** > **OAuth client ID** > Type: **Web Application**.
   - Add Authorized redirect URI: `https://developers.google.com/oauthplayground`.
   - Copy **Client ID** (`GOOGLE_ADS_CLIENT_ID`) and **Client Secret** (`GOOGLE_ADS_CLIENT_SECRET`).
3. **Generate Google Ads Refresh Token**:
   - Go to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
   - Click the **Gear icon (OAuth 2.0 configuration)** in top right:
     - Check **"Use your own OAuth credentials"**.
     - Paste `GOOGLE_ADS_CLIENT_ID` and `GOOGLE_ADS_CLIENT_SECRET`.
   - In **Step 1**, input scope: `https://www.googleapis.com/auth/adwords`.
   - Click **Authorize APIs** and log in with your Google Ads account.
   - In **Step 2**, click **Exchange authorization code for tokens**.
   - Copy the resulting **Refresh token** and paste as `GOOGLE_ADS_REFRESH_TOKEN`.
4. **Customer ID & Login Customer ID**:
   - Open [Google Ads](https://ads.google.com/).
   - In the top right corner, see your 10-digit Customer ID (e.g. `123-456-7890`).
   - Remove the dashes and paste as `GOOGLE_ADS_CUSTOMER_ID=1234567890`.
   - If managing through an MCC Manager Account, specify the Manager ID as `GOOGLE_ADS_LOGIN_CUSTOMER_ID`.
