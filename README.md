# Kitchen Bar RFP — Orlando Handyman Outreach

Scope: Lower Kitchen Bar / Prep for Countertop
Contact: Text quotes/questions to **407-529-6066**

## Contractors List (10)

| # | Company | Phone | Email | Has Email |
|---|---------|-------|-------|-----------|
| 1 | TJ Handyman Home Repair & Remodeling LLC | (321) 424-8590 | info@tjhandymanservicesllc.com | ✅ |
| 2 | The Handyman Company Orlando | (407) 374-2228 | Support@The-Handyman-Company.com | ✅ |
| 3 | Your Handyman Orlando | (689) 254-1516 | yourhandymanorl@gmail.com | ✅ |
| 4 | Majestic Home Repairs, LLC | (321) 209-5475 | info@majesticrepairs.com | ✅ |
| 5 | RR Handyman & Renovation Services | (305) 609-6847 | Contact via website | — |
| 6 | Mid Florida Home Repairs, LLC | (407) 399-3600 | Contact via website | — |
| 7 | Loose Ends Handyman Services | (407) 279-7513 | Quote form on website | — |
| 8 | Ramm Drywall | (386) 668-7633 | Contact via website | — |
| 9 | Dr. Handyman Orlando LLC | (407) 871-3110 | Contact via website | — |
| 10 | Mr. Handyman of Windermere/W&S Orlando | (689) 210-4336 | Contact via website | — |

4 can receive email directly. The other 6 should be contacted by phone/text or via their website contact form.

## Send Emails

### Setup

```bash
npm install
```

Set environment variables:
```bash
export GMAIL_CLIENT_ID=your_client_id
export GMAIL_CLIENT_SECRET=your_client_secret
export GMAIL_REFRESH_TOKEN=your_refresh_token
export GMAIL_FROM=your@gmail.com
```

### Dry Run (preview without sending)
```bash
npm run dry-run
```

### Send
```bash
npm run send
```

## Getting Gmail OAuth2 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Gmail API
3. Create OAuth2 credentials (Desktop app type)
4. Go to [OAuth2 Playground](https://developers.google.com/oauthplayground)
   - Settings → Use your own credentials → enter Client ID + Secret
   - Authorize `https://mail.google.com/`
   - Exchange for refresh token
5. Copy the refresh token into `GMAIL_REFRESH_TOKEN`
