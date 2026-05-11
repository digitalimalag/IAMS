const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const outputPath = path.join(process.cwd(), 'public', 'IT_Assets_Management_SaaS_User_Guide.pdf');
const logoPath = path.join(process.cwd(), 'public', 'logo.png');

const COLORS = {
  blue: rgb(0.12, 0.37, 0.78),
  teal: rgb(0.1, 0.55, 0.52),
  green: rgb(0.1, 0.65, 0.34),
  amber: rgb(0.83, 0.49, 0.08),
  ink: rgb(0.08, 0.12, 0.2),
  muted: rgb(0.38, 0.44, 0.53),
  border: rgb(0.85, 0.89, 0.93),
  bg: rgb(0.98, 0.99, 1),
  softBlue: rgb(0.93, 0.96, 1),
  softTeal: rgb(0.92, 0.98, 0.97),
  softGreen: rgb(0.94, 0.99, 0.95),
  softAmber: rgb(1, 0.97, 0.92),
  softRose: rgb(0.99, 0.95, 0.95),
};

function wrapText(font, text, size, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return ['-'];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${current} ${words[i]}`;
    if (font.widthOfTextAtSize(next, size) > maxWidth) {
      lines.push(current);
      current = words[i];
    } else {
      current = next;
    }
  }
  lines.push(current);
  return lines;
}

function drawParagraph(page, font, text, x, y, maxWidth, size, color, lineGap = 4) {
  const lines = wrapText(font, text, size, maxWidth);
  let cursor = y;
  lines.forEach((line) => {
    page.drawText(line, { x, y: cursor, size, font, color });
    cursor -= size + lineGap;
  });
  return cursor;
}

function drawCard(page, x, y, w, h, fill = COLORS.bg, border = COLORS.border) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: fill,
    borderColor: border,
    borderWidth: 1,
    borderRadius: 16,
  });
}

function drawSection(page, title, subtitle, x, y, w, fontBold, fontRegular) {
  page.drawText(title, { x, y, size: 16, font: fontBold, color: COLORS.ink });
  if (subtitle) {
    page.drawText(subtitle, { x, y: y - 18, size: 10.5, font: fontRegular, color: COLORS.muted });
  }
}

async function buildGuide() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logoBytes = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;
  const logo = logoBytes ? await pdf.embedPng(logoBytes) : null;

  function addPage(title, subtitle, pageNo) {
    const page = pdf.addPage([595, 842]);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: 0, width, height, color: COLORS.bg });
    page.drawRectangle({ x: 0, y: height - 74, width, height: 74, color: COLORS.blue });
    page.drawText('Digital IMALAG', { x: 42, y: height - 38, size: 16, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText('IT Assets Management SaaS', { x: 42, y: height - 54, size: 10.5, font, color: rgb(0.9, 0.95, 1) });
    page.drawText(`Page ${pageNo}`, { x: width - 72, y: height - 38, size: 9.5, font, color: rgb(0.9, 0.95, 1) });

    if (logo) {
      page.drawImage(logo, { x: width - 102, y: height - 62, width: 30, height: 30 });
    }

    drawSection(page, title, subtitle, 42, height - 118, width - 84, fontBold, font);
    return page;
  }

  // Cover
  let page = addPage('User Guide', 'A simple walkthrough for first-time companies and new team members', 1);
  drawCard(page, 42, 474, 511, 250, COLORS.bg);
  page.drawText('What this guide covers', { x: 60, y: 690, size: 13.5, font: fontBold, color: COLORS.ink });
  const coverBullets = [
    'How to sign up a company workspace and create the first Master Admin',
    'How to log in, complete onboarding, and open your dashboard',
    'How to manage company settings, logo, departments, users, and roles',
    'How to manage assets, IT help desk tickets, handovers, billing, and invoices',
  ];
  let cursor = 664;
  coverBullets.forEach((bullet) => {
    page.drawText(`• ${bullet}`, { x: 62, y: cursor, size: 11, font, color: COLORS.ink });
    cursor -= 24;
  });
  page.drawRectangle({ x: 60, y: 500, width: 195, height: 62, color: COLORS.softBlue, borderColor: COLORS.blue, borderWidth: 1 });
  page.drawText('Best for', { x: 76, y: 542, size: 9, font: fontBold, color: COLORS.blue });
  page.drawText('new registered users, admins, IT, HR, and company owners', { x: 76, y: 525, size: 10.5, font, color: COLORS.ink, maxWidth: 160 });
  page.drawRectangle({ x: 275, y: 500, width: 240, height: 62, color: COLORS.softGreen, borderColor: COLORS.green, borderWidth: 1 });
  page.drawText('Goal', { x: 291, y: 542, size: 9, font: fontBold, color: COLORS.green });
  page.drawText('help every company understand the value and daily use of the SaaS', { x: 291, y: 525, size: 10.5, font, color: COLORS.ink, maxWidth: 204 });

  // System map
  page = addPage('How the system works', 'A tenant-safe workspace for company assets and internal operations', 2);
  drawCard(page, 42, 394, 511, 294);
  const flow = [
    ['1', 'Sign Up', 'Create company, slug, and Master Admin'],
    ['2', 'Login', 'Access only your company workspace'],
    ['3', 'Settings', 'Add logo, contact details, and branding'],
    ['4', 'Departments & Users', 'Assign roles, teams, and permissions'],
    ['5', 'Assets & Help Desk', 'Track devices, tickets, and handovers'],
  ];
  flow.forEach((item, idx) => {
    const x = 62 + idx * 95;
    page.drawCircle({ x: x + 18, y: 586, size: 36, color: idx % 2 === 0 ? COLORS.softBlue : COLORS.softTeal, borderColor: COLORS.border, borderWidth: 1 });
    page.drawText(item[0], { x: x + 13, y: 598, size: 12, font: fontBold, color: COLORS.ink });
    page.drawText(item[1], { x, y: 558, size: 10.5, font: fontBold, color: COLORS.ink, maxWidth: 58, align: 'center' });
    page.drawText(item[2], { x: x - 2, y: 536, size: 8.8, font, color: COLORS.muted, maxWidth: 72, align: 'center' });
    if (idx < flow.length - 1) {
      page.drawLine({ start: { x: x + 66, y: 604 }, end: { x: x + 92, y: 604 }, thickness: 1.8, color: COLORS.blue });
    }
  });
  drawCard(page, 62, 430, 215, 112, COLORS.softBlue, COLORS.blue);
  page.drawText('Free plan', { x: 78, y: 518, size: 13, font: fontBold, color: COLORS.blue });
  page.drawText('1 Master Admin', { x: 78, y: 496, size: 11, font: fontBold, color: COLORS.ink });
  page.drawText('5 Assets', { x: 78, y: 478, size: 11, font: fontBold, color: COLORS.ink });
  page.drawText('Good for small teams or pilot use.', { x: 78, y: 458, size: 9.5, font, color: COLORS.muted });
  drawCard(page, 318, 430, 215, 112, COLORS.softGreen, COLORS.green);
  page.drawText('Paid plans', { x: 334, y: 518, size: 13, font: fontBold, color: COLORS.green });
  page.drawText('Starter, Growth, Enterprise', { x: 334, y: 496, size: 11, font: fontBold, color: COLORS.ink });
  page.drawText('Add more users, billing, and invoice history.', { x: 334, y: 458, size: 9.5, font, color: COLORS.muted, maxWidth: 178 });

  // Sign up
  page = addPage('Sign up and first setup', 'Create the first company workspace and Master Admin account', 3);
  drawCard(page, 42, 396, 511, 288);
  const signupSteps = [
    'Open the home page and choose Sign Up.',
    'Enter company name, unique slug, admin name, email, department, and password.',
    'Pick the billing plan if you are starting on a paid tier.',
    'Confirm the workspace details and save the company profile.',
  ];
  page.drawText('Step-by-step', { x: 60, y: 648, size: 13, font: fontBold, color: COLORS.ink });
  let y = 616;
  signupSteps.forEach((step, idx) => {
    page.drawCircle({ x: 68, y: y - 2, size: 20, color: COLORS.softAmber, borderColor: COLORS.amber, borderWidth: 1 });
    page.drawText(String(idx + 1), { x: 74, y: y + 4, size: 9, font: fontBold, color: COLORS.amber });
    page.drawText(step, { x: 98, y, size: 11, font, color: COLORS.ink, maxWidth: 430 });
    y -= 54;
  });
  drawCard(page, 60, 424, 470, 86, COLORS.softBlue, COLORS.blue);
  page.drawText('Tip', { x: 76, y: 488, size: 10, font: fontBold, color: COLORS.blue });
  page.drawText('Use a short company slug and a strong password. The slug becomes your workspace identity.', {
    x: 76,
    y: 470,
    size: 10.5,
    font,
    color: COLORS.ink,
    maxWidth: 435,
  });

  // Login and onboarding
  page = addPage('Login and onboarding', 'Welcome the user, then guide them through setup tasks', 4);
  drawCard(page, 42, 396, 511, 288);
  const loginBullets = [
    'Sign in with email and password.',
    'The first Master Admin sees onboarding only once until it is completed.',
    'Use the checklist to complete settings, departments, and users in order.',
    'Open the checklist again later from the dashboard if needed.',
  ];
  page.drawText('What happens after login', { x: 60, y: 646, size: 13, font: fontBold, color: COLORS.ink });
  drawParagraph(page, font, 'The first logged-in Master Admin is guided with a simple checklist so the company can finish setup in the right order without missing important workspace details.', 60, 624, 470, 10.5, COLORS.muted);
  let by = 565;
  loginBullets.forEach((bullet, idx) => {
    page.drawRectangle({ x: 62, y: by - 4, width: 22, height: 22, color: idx % 2 === 0 ? COLORS.softTeal : COLORS.softBlue, borderColor: COLORS.border, borderWidth: 1 });
    page.drawText('OK', { x: 62.5, y: by + 2, size: 8.5, font: fontBold, color: COLORS.green });
    page.drawText(bullet, { x: 94, y: by, size: 10.5, font, color: COLORS.ink, maxWidth: 425 });
    by -= 42;
  });

  // Settings / departments / users
  page = addPage('Settings, departments, and users', 'Complete company branding, team structure, and access control', 5);
  drawCard(page, 42, 382, 511, 302);
  page.drawText('Settings to complete first', { x: 60, y: 630, size: 13, font: fontBold, color: COLORS.ink });
  const settingsItems = [
    ['Company name', 'Use the official company name shown in the workspace and navigation.'],
    ['Logo upload', 'Upload a square or wide PNG logo so branding feels professional.'],
    ['Contact details', 'Add company email, phone, address, GSTIN, PAN, and timezone.'],
    ['Departments', 'Create departments such as IT, HR, Operations, or Finance.'],
    ['Users and roles', 'Add employees and assign Admin, IT, HR, Master Admin, or staff permissions.'],
  ];
  let sy = 598;
  settingsItems.forEach(([label, body]) => {
    page.drawText(label, { x: 72, y: sy, size: 11.2, font: fontBold, color: COLORS.ink });
    drawParagraph(page, font, body, 242, sy, 285, 10.2, COLORS.muted);
    sy -= 54;
  });

  // Assets and ticketing
  page = addPage('Assets and IT help desk ticketing', 'Keep devices, issues, and support requests organized', 6);
  drawCard(page, 42, 382, 511, 302);
  const assetsList = [
    ['Assets', 'Tag laptops, desktops, servers, printers, monitors, and accessories.'],
    ['Employee view', 'Employees should see only assets assigned to them or their scope.'],
    ['Help desk tickets', 'Use Issues as IT support tickets for calls, fixes, and downtime tracking.'],
    ['Requests', 'Users can raise new asset requests and track approvals.'],
  ];
  let ay = 620;
  assetsList.forEach((item, idx) => {
    page.drawCircle({ x: 70, y: ay - 3, size: 18, color: idx % 2 === 0 ? COLORS.softRose : COLORS.softAmber, borderColor: COLORS.border, borderWidth: 1 });
    page.drawText('•', { x: 76, y: ay + 1, size: 14, font: fontBold, color: idx % 2 === 0 ? COLORS.blue : COLORS.amber });
    page.drawText(item[0], { x: 96, y: ay, size: 11.4, font: fontBold, color: COLORS.ink });
    page.drawText(item[1], { x: 192, y: ay, size: 10.2, font, color: COLORS.muted, maxWidth: 320 });
    ay -= 54;
  });
  drawCard(page, 60, 418, 215, 84, COLORS.softBlue, COLORS.blue);
  page.drawText('Employee rule', { x: 76, y: 482, size: 10.5, font: fontBold, color: COLORS.blue });
  page.drawText('Normal employees should only view their own assigned assets, requests, and handover records.', {
    x: 76,
    y: 464,
    size: 9.8,
    font,
    color: COLORS.ink,
    maxWidth: 180,
  });
  drawCard(page, 286, 418, 245, 84, COLORS.softGreen, COLORS.green);
  page.drawText('Support workflow', { x: 302, y: 482, size: 10.5, font: fontBold, color: COLORS.green });
  page.drawText('Open ticket -> IT review -> action -> resolution -> record history.', {
    x: 302,
    y: 464,
    size: 9.8,
    font,
    color: COLORS.ink,
    maxWidth: 212,
  });

  // Handovers / billing
  page = addPage('Handovers, billing, and invoices', 'Manage resignations and keep subscription records accessible', 7);
  drawCard(page, 42, 382, 511, 302);
  page.drawText('Resignation handover', { x: 60, y: 630, size: 13, font: fontBold, color: COLORS.ink });
  drawParagraph(page, font, 'When an employee leaves, create a handover record, assign the assets that must be returned, and download the PDF for hard copy filing or signature collection.', 60, 608, 470, 10.5, COLORS.muted);
  page.drawText('Billing area', { x: 60, y: 530, size: 13, font: fontBold, color: COLORS.ink });
  const billBullets = [
    'View the active plan and payment history.',
    'Download invoices or receipts as PDF.',
    'Upgrade or manage monthly and yearly subscriptions.',
  ];
  let bl = 506;
  billBullets.forEach((line) => {
    page.drawText(`• ${line}`, { x: 72, y: bl, size: 10.5, font, color: COLORS.ink });
    bl -= 22;
  });
  drawCard(page, 288, 430, 245, 150, COLORS.softBlue, COLORS.blue);
  page.drawText('Subscription reminder', { x: 304, y: 554, size: 11.5, font: fontBold, color: COLORS.blue });
  drawParagraph(page, font, 'Show a reminder five days before expiry, and let the company renew before access ends. The paid billing cycle should remain active until the end of the purchased term.', 304, 534, 210, 9.7, COLORS.ink);
  drawCard(page, 288, 440, 245, 54, COLORS.softGreen, COLORS.green);
  page.drawText('Payment policy', { x: 304, y: 476, size: 10.5, font: fontBold, color: COLORS.green });
  page.drawText('Mid-cycle upgrades do not refund the used billing period.', { x: 304, y: 458, size: 9.3, font, color: COLORS.ink, maxWidth: 210 });

  // First week checklist
  page = addPage('Suggested first-week rollout', 'A practical adoption plan for new customers', 8);
  drawCard(page, 42, 392, 511, 292);
  const checklist = [
    'Day 1: complete settings and upload the company logo.',
    'Day 2: create all departments and managers.',
    'Day 3: add users and assign roles and permissions.',
    'Day 4: tag assets and assign them to owners.',
    'Day 5: open the first help desk tickets and confirm reporting.',
    'Day 6-7: review billing, invoice downloads, and renewal reminders.',
  ];
  page.drawText('Checklist', { x: 60, y: 638, size: 13, font: fontBold, color: COLORS.ink });
  let cy = 608;
  checklist.forEach((step, idx) => {
    page.drawCircle({ x: 70, y: cy - 2, size: 18, color: COLORS.softBlue, borderColor: COLORS.border, borderWidth: 1 });
    page.drawText(String(idx + 1), { x: 76, y: cy + 3, size: 8.8, font: fontBold, color: COLORS.blue });
    page.drawText(step, { x: 98, y: cy, size: 10.5, font, color: COLORS.ink, maxWidth: 430 });
    cy -= 40;
  });
  drawCard(page, 60, 426, 470, 72, COLORS.softAmber, COLORS.amber);
  page.drawText('Outcome', { x: 76, y: 478, size: 10.5, font: fontBold, color: COLORS.amber });
  page.drawText('The company gets a clean, branded workspace where assets, tickets, users, and billing stay organized from day one.', {
    x: 76,
    y: 460,
    size: 10,
    font,
    color: COLORS.ink,
    maxWidth: 430,
  });

  return pdf.save();
}

async function main() {
  const bytes = await buildGuide();
  fs.writeFileSync(outputPath, Buffer.from(bytes));
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
