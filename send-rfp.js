#!/usr/bin/env node
/**
 * send-rfp.js
 * Sends RFP emails to Orlando handyman contractors via Gmail SMTP + App Password.
 */

const nodemailer = require('nodemailer');
const contractors = require('./contractors.json');
const path = require('path');

const GMAIL_FROM = 'carysiegel@gmail.com';
const GMAIL_APP_PASSWORD = 'zwhy yfvw jzro fkgm';
const PHOTO_PATH = path.join(__dirname, 'IMG_5540.jpeg');

const DRY_RUN = process.argv.includes('--dry-run');

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

async function main() {
  const emailContractors = contractors.filter(c => c.email);
  const noEmailContractors = contractors.filter(c => !c.email);

  console.log(`Contractors with email (${emailContractors.length}):`);
  emailContractors.forEach(c => console.log(`  ✓ ${c.name} — ${c.email}`));

  console.log(`\nContractors without email — CALL/TEXT instead (${noEmailContractors.length}):`);
  noEmailContractors.forEach(c => console.log(`  ☎ ${c.name} — ${c.phone} — ${c.website}`));

  if (DRY_RUN) {
    console.log('\n=== DRY RUN — no emails sent ===');
    console.log('\n--- Sample email ---');
    console.log(`To: ${emailContractors[0].email}`);
    console.log(`Subject: ${SUBJECT}`);
    console.log(`Attachment: IMG_5540.jpeg`);
    console.log(buildEmailBody(emailContractors[0]));
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_FROM,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  for (const contractor of emailContractors) {
    try {
      const info = await transporter.sendMail({
        from: `Cary Siegel <${GMAIL_FROM}>`,
        to: contractor.email,
        subject: SUBJECT,
        text: buildEmailBody(contractor),
        attachments: [
          {
            filename: 'kitchen-bar-photo.jpeg',
            path: PHOTO_PATH,
          },
        ],
      });
      console.log(`✅ Sent to ${contractor.name} (${contractor.email}) — ${info.messageId}`);
    } catch (err) {
      console.error(`❌ Failed: ${contractor.name} (${contractor.email}): ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\nDone.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
