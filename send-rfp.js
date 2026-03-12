#!/usr/bin/env node
/**
 * send-rfp.js
 * Sends RFP emails to Orlando handyman contractors via Gmail OAuth2.
 *
 * Setup:
 *   1. npm install googleapis nodemailer
 *   2. Set env vars (or create .env):
 *        GMAIL_CLIENT_ID=...
 *        GMAIL_CLIENT_SECRET=...
 *        GMAIL_REFRESH_TOKEN=...
 *        GMAIL_FROM=your@gmail.com
 *   3. node send-rfp.js [--dry-run]
 */

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const contractors = require('./contractors.json');

const {
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  GMAIL_FROM,
} = process.env;

const DRY_RUN = process.argv.includes('--dry-run');

const SUBJECT = 'Request for Proposal — Kitchen Bar Modification (Orlando, FL)';

function buildEmailBody(contractor) {
  return `Dear ${contractor.contact},

I am seeking bids from qualified handymen/contractors for a kitchen bar modification project at a residential property in the Orlando, FL area.

PROJECT SUMMARY:
Removal of an existing raised bar overhang, modification of stud framing to standard counter height, electrical gang box relocation, drywall patching, and finish work — all in preparation for a new countertop installation.

SCOPE OF WORK:
• Protect adjacent floors, cabinets, and work area prior to demolition
• Remove the existing raised bar cap/overhang and any attached trim or framing above counter height
• Demolish and dispose of removed materials from the raised bar section
• Cut down and modify existing stud framing to standard counter height
• Install new horizontal top plate across shortened studs — must be straight and level across full run
• Relocate existing electrical gang boxes to new lower wall face using existing wiring
• Install new drywall to patch exposed area
• Tape, mud, sand, and prime patched areas
• Touch-up paint to match surrounding finish as closely as practical
• Ensure wall surface and framing are ready for countertop templating and installation
• Clean work area and remove all construction debris from site

BID REQUIREMENTS:
• All quotes must be TURNKEY (labor + materials included) unless exceptions are clearly noted
• Rough estimates are accepted and welcome — subject to on-site inspection
• Please itemize any exclusions or allowances

TO SCHEDULE AN ON-SITE INSPECTION OR SUBMIT YOUR QUOTE:
Text 407-529-6066 — we accept quotes and estimates by text or email.

If you have any questions or need clarification on the scope, please text 407-529-6066.

We look forward to hearing from you.

Best regards,
Cary Siegel
407-529-6066`;
}

async function createTransporter() {
  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });
  const { token: accessToken } = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: GMAIL_FROM,
      clientId: GMAIL_CLIENT_ID,
      clientSecret: GMAIL_CLIENT_SECRET,
      refreshToken: GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });
}

async function main() {
  if (DRY_RUN) {
    console.log('=== DRY RUN — no emails will be sent ===\n');
  }

  const emailContractors = contractors.filter(c => c.email);
  const noEmailContractors = contractors.filter(c => !c.email);

  console.log(`Contractors with email (${emailContractors.length}):`);
  emailContractors.forEach(c => console.log(`  ✓ ${c.name} — ${c.email}`));

  console.log(`\nContractors without email — CALL/TEXT instead (${noEmailContractors.length}):`);
  noEmailContractors.forEach(c => console.log(`  ☎ ${c.name} — ${c.phone} — ${c.website}`));

  if (emailContractors.length === 0) {
    console.log('\nNo email addresses found. Nothing to send.');
    return;
  }

  if (DRY_RUN) {
    console.log('\n--- Sample email body ---');
    console.log(buildEmailBody(emailContractors[0]));
    return;
  }

  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REFRESH_TOKEN || !GMAIL_FROM) {
    console.error('\nMissing Gmail credentials. Set env vars:\n  GMAIL_CLIENT_ID\n  GMAIL_CLIENT_SECRET\n  GMAIL_REFRESH_TOKEN\n  GMAIL_FROM');
    process.exit(1);
  }

  const transporter = await createTransporter();

  for (const contractor of emailContractors) {
    try {
      const info = await transporter.sendMail({
        from: GMAIL_FROM,
        to: contractor.email,
        subject: SUBJECT,
        text: buildEmailBody(contractor),
      });
      console.log(`✅ Sent to ${contractor.name} (${contractor.email}) — Message ID: ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${contractor.name} (${contractor.email}): ${err.message}`);
    }

    // Polite delay between sends
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
