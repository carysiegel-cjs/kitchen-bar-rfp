#!/usr/bin/env node
/**
 * send-gmail-api.js
 * Sends RFP emails via Gmail REST API (no SMTP needed)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const contractors = require('./contractors.json');

const ACCESS_TOKEN = process.env.GMAIL_ACCESS_TOKEN;
const GMAIL_FROM = 'carysiegel@gmail.com';
const PHOTO_PATH = path.join(__dirname, 'IMG_5540.jpeg');
const SUBJECT = 'Request for Proposal — Kitchen Bar Modification (Orlando, FL)';

function buildEmailBody(contractor) {
  return `Dear ${contractor.contact},

I am seeking bids from qualified handymen/contractors for a kitchen bar modification project at a residential property in the Orlando, FL area.

PROJECT SUMMARY:
Removal of an existing raised bar overhang, modification of stud framing to standard counter height, electrical gang box relocation, drywall patching, and finish work — all in preparation for a new countertop installation.

A photo of the existing bar is attached for reference.

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

QUOTE DEADLINE: March 18, 2026

TO SCHEDULE AN ON-SITE INSPECTION OR SUBMIT YOUR QUOTE:
Text 407-529-6066 — we accept quotes and estimates by text or email.

If you have any questions or need clarification on the scope, please text 407-529-6066.

We look forward to hearing from you.

Best regards,
Cary Siegel
407-529-6066`;
}

function buildMimeMessage(to, subject, body, photoPath) {
  const boundary = 'boundary_' + Date.now();
  const photoData = fs.readFileSync(photoPath).toString('base64');

  const mime = [
    `From: Cary Siegel <${GMAIL_FROM}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
    ``,
    `--${boundary}`,
    `Content-Type: image/jpeg; name="kitchen-bar-photo.jpeg"`,
    `Content-Transfer-Encoding: base64`,
    `Content-Disposition: attachment; filename="kitchen-bar-photo.jpeg"`,
    ``,
    photoData,
    `--${boundary}--`,
  ].join('\r\n');

  return Buffer.from(mime).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sendEmail(raw) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ raw });
    const options = {
      hostname: 'www.googleapis.com',
      path: '/gmail/v1/users/me/messages/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!ACCESS_TOKEN) {
    console.error('ERROR: Set GMAIL_ACCESS_TOKEN env var');
    process.exit(1);
  }

  const emailContractors = contractors.filter(c => c.email);
  console.log(`Sending to ${emailContractors.length} contractors...\n`);

  for (const contractor of emailContractors) {
    try {
      const raw = buildMimeMessage(contractor.email, SUBJECT, buildEmailBody(contractor), PHOTO_PATH);
      const result = await sendEmail(raw);
      console.log(`✅ Sent to ${contractor.name} (${contractor.email}) — id: ${result.id}`);
    } catch (err) {
      console.error(`❌ Failed: ${contractor.name} (${contractor.email}): ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
