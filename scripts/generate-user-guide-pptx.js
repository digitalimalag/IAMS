const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Digital IMALAG';
pptx.company = 'Digital IMALAG';
pptx.subject = 'IT Assets Management SaaS user guide';
pptx.title = 'Digital IMALAG IT Assets Management SaaS User Guide';
pptx.lang = 'en-IN';
pptx.theme = {
  headFontFace: 'Aptos Display',
  bodyFontFace: 'Aptos',
  lang: 'en-IN',
};

const W = 13.333;
const H = 7.5;

const colors = {
  bg: 'F7F5EE',
  ink: '0F172A',
  muted: '64748B',
  border: 'D9DED5',
  card: 'FFFFFF',
  blue: '1D4ED8',
  sky: '0EA5E9',
  teal: '0F766E',
  green: '16A34A',
  amber: 'D97706',
  softBlue: 'EAF2FF',
  softSky: 'E0F2FE',
  softTeal: 'E6FFFB',
  softGreen: 'ECFDF5',
  softAmber: 'FFF7E1',
  softRose: 'FEF2F2',
  chip: 'EEF2F7',
};

const logoPath = path.join(process.cwd(), 'public', 'logo.png');
const bgPath = path.join(process.cwd(), 'public', 'bg.png');
const outputPath = path.join(process.cwd(), 'public', 'IT_Assets_Management_SaaS_User_Guide.pptx');

function fileExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function addPageChrome(slide, page, section, title, subtitle) {
  slide.background = { color: colors.bg };

  if (fileExists(bgPath)) {
    slide.addImage({ path: bgPath, x: 0, y: 0, w: W, h: H, transparency: 91 });
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: colors.bg, transparency: 10 },
    line: { color: colors.bg, transparency: 100 },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.16,
    fill: { color: colors.blue },
    line: { color: colors.blue },
  });

  if (fileExists(logoPath)) {
    slide.addImage({ path: logoPath, x: 0.5, y: 0.28, w: 0.52, h: 0.52 });
  }

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.22,
    y: 0.31,
    w: 1.65,
    h: 0.3,
    rectRadius: 0.08,
    fill: { color: colors.softBlue },
    line: { color: 'C7DCF9', pt: 1 },
  });
  slide.addText(section.toUpperCase(), {
    x: 1.28,
    y: 0.355,
    w: 1.55,
    h: 0.12,
    fontFace: 'Aptos',
    fontSize: 10,
    bold: true,
    color: colors.blue,
    margin: 0,
    fit: 'shrink',
  });

  slide.addText(title, {
    x: 0.55,
    y: 0.88,
    w: 8.1,
    h: 0.56,
    fontFace: 'Aptos Display',
    fontSize: 27,
    bold: true,
    color: colors.ink,
    margin: 0,
    fit: 'shrink',
  });

  slide.addText(subtitle, {
    x: 0.55,
    y: 1.38,
    w: 8.4,
    h: 0.42,
    fontFace: 'Aptos',
    fontSize: 11.5,
    color: colors.muted,
    margin: 0,
    fit: 'shrink',
  });

  slide.addText(`Page ${page}`, {
    x: 12.22,
    y: 0.36,
    w: 0.55,
    h: 0.14,
    fontFace: 'Aptos',
    fontSize: 9,
    color: colors.muted,
    align: 'right',
    margin: 0,
  });

  slide.addText('Digital IMALAG IT Assets Management SaaS', {
    x: 0.55,
    y: 7.08,
    w: 6.5,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 8.5,
    color: colors.muted,
    margin: 0,
  });
}

function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.12,
    fill: { color: opts.fill || colors.card, transparency: opts.transparency || 0 },
    line: { color: opts.line || colors.border, pt: 1 },
    shadow: opts.shadow || undefined,
  });
}

function addChip(slide, x, y, w, text, fill, color) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x,
    y,
    w,
    h: 0.34,
    rectRadius: 0.15,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addText(text, {
    x: x + 0.08,
    y: y + 0.08,
    w: w - 0.16,
    h: 0.14,
    fontFace: 'Aptos',
    fontSize: 9.5,
    bold: true,
    color,
    align: 'center',
    margin: 0,
    fit: 'shrink',
  });
}

function addStepBubble(slide, x, y, number, fill) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x,
    y,
    w: 0.42,
    h: 0.42,
    fill: { color: fill },
    line: { color: fill },
  });
  slide.addText(String(number), {
    x,
    y: y + 0.07,
    w: 0.42,
    h: 0.14,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
    margin: 0,
  });
}

function addBullet(slide, x, y, w, text, color = colors.ink) {
  slide.addText(`• ${text}`, {
    x,
    y,
    w,
    h: 0.3,
    fontFace: 'Aptos',
    fontSize: 11.2,
    color,
    margin: 0,
    fit: 'shrink',
  });
}

function addStatCard(slide, x, y, w, h, title, body, accent, fill) {
  addCard(slide, x, y, w, h, { fill, line: fill });
  slide.addText(title, {
    x: x + 0.16,
    y: y + 0.15,
    w: w - 0.32,
    h: 0.28,
    fontFace: 'Aptos',
    fontSize: 12.5,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.16,
    y: y + 0.48,
    w: w - 0.32,
    h: h - 0.58,
    fontFace: 'Aptos',
    fontSize: 9.5,
    color: colors.muted,
    margin: 0,
    fit: 'shrink',
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.16,
    y: y + h - 0.22,
    w: w - 0.32,
    h: 0.08,
    fill: { color: accent },
    line: { color: accent },
  });
}

function addCover() {
  const slide = pptx.addSlide();
  slide.background = { color: colors.bg };
  if (fileExists(bgPath)) {
    slide.addImage({ path: bgPath, x: 0, y: 0, w: W, h: H, transparency: 90 });
  }
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: H,
    fill: { color: colors.bg, transparency: 12 },
    line: { color: colors.bg, transparency: 100 },
  });

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: W,
    h: 0.16,
    fill: { color: colors.blue },
    line: { color: colors.blue },
  });

  if (fileExists(logoPath)) {
    slide.addImage({ path: logoPath, x: 0.58, y: 0.55, w: 0.76, h: 0.76 });
  }

  slide.addText('Digital IMALAG', {
    x: 1.42,
    y: 0.63,
    w: 3.2,
    h: 0.26,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: colors.muted,
    margin: 0,
  });

  slide.addText('IT Assets Management SaaS', {
    x: 0.6,
    y: 1.55,
    w: 6.2,
    h: 1.2,
    fontFace: 'Aptos Display',
    fontSize: 28,
    bold: true,
    color: colors.ink,
    margin: 0,
    fit: 'shrink',
  });

  slide.addText('A practical guide for new registered users, master admins, IT teams, HR, and company owners.', {
    x: 0.6,
    y: 2.73,
    w: 6.0,
    h: 0.7,
    fontFace: 'Aptos',
    fontSize: 14,
    color: colors.muted,
    margin: 0,
    fit: 'shrink',
  });

  addChip(slide, 0.6, 3.48, 2.0, 'Sign Up', colors.softBlue, colors.blue);
  addChip(slide, 2.72, 3.48, 2.0, 'Settings', colors.softTeal, colors.teal);
  addChip(slide, 4.84, 3.48, 2.0, 'Assets', colors.softGreen, colors.green);
  addChip(slide, 0.6, 3.92, 2.0, 'Help Desk', colors.softAmber, colors.amber);
  addChip(slide, 2.72, 3.92, 2.2, 'Billing', 'FEE2E2', 'DC2626');
  addChip(slide, 5.04, 3.92, 2.0, 'Users', 'EDE9FE', '7C3AED');

  addCard(slide, 7.55, 0.9, 5.1, 5.6, { fill: 'FFFFFF', line: 'DCE2DB' });
  slide.addText('What the platform does', {
    x: 7.84,
    y: 1.18,
    w: 2.5,
    h: 0.25,
    fontFace: 'Aptos',
    fontSize: 13,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('One workspace for asset control, ticketing, roles, and billing.', {
    x: 7.84,
    y: 1.48,
    w: 4.4,
    h: 0.28,
    fontFace: 'Aptos',
    fontSize: 10.5,
    color: colors.muted,
    margin: 0,
  });

  const stack = [
    ['Sign Up', colors.softBlue, colors.blue],
    ['Login', colors.softTeal, colors.teal],
    ['Settings', colors.softGreen, colors.green],
    ['Departments', colors.softAmber, colors.amber],
    ['Users', 'FCE7F3', 'DB2777'],
    ['Assets', 'E0E7FF', '4F46E5'],
    ['Tickets', 'FEE2E2', 'DC2626'],
    ['Billing', 'EDE9FE', '7C3AED'],
  ];
  stack.forEach((item, index) => {
    const y = 1.88 + index * 0.52;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 7.84,
      y,
      w: 4.3,
      h: 0.36,
      rectRadius: 0.12,
      fill: { color: item[1] },
      line: { color: item[1] },
    });
    slide.addText(item[0], {
      x: 8.0,
      y: y + 0.08,
      w: 2.2,
      h: 0.15,
      fontFace: 'Aptos',
      fontSize: 11,
      bold: true,
      color: item[2],
      margin: 0,
    });
    if (index < stack.length - 1) {
      slide.addText('↓', {
        x: 9.82,
        y: y + 0.32,
        w: 0.4,
        h: 0.12,
        fontFace: 'Aptos',
        fontSize: 12,
        color: colors.muted,
        margin: 0,
        align: 'center',
      });
    }
  });

  slide.addText('Built to guide company users from first sign-up to daily operations.', {
    x: 7.84,
    y: 6.36,
    w: 4.3,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 10,
    color: colors.muted,
    margin: 0,
  });

  slide.addText('01', {
    x: 12.1,
    y: 6.86,
    w: 0.48,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 9,
    color: colors.muted,
    align: 'right',
    margin: 0,
  });
}

function addFlowSlide() {
  const slide = pptx.addSlide();
  addPageChrome(
    slide,
    2,
    'System map',
    'A single company workspace connects identity, setup, operations, help desk, and billing.',
    'How the product fits together'
  );

  const nodes = [
    { x: 0.72, y: 2.15, w: 2.15, title: 'Home / Sign Up', body: 'New company registration and plan selection.', fill: colors.softBlue, accent: colors.blue },
    { x: 3.08, y: 2.15, w: 2.15, title: 'Master Admin Setup', body: 'Create the first organization, admin, and subscription.', fill: colors.softTeal, accent: colors.teal },
    { x: 5.44, y: 2.15, w: 2.15, title: 'Daily Operations', body: 'Assets, departments, users, and tickets live here.', fill: colors.softGreen, accent: colors.green },
    { x: 7.80, y: 2.15, w: 2.15, title: 'Monitoring', body: 'IT, HR, Admin, and Master Admin track activity.', fill: colors.softAmber, accent: colors.amber },
    { x: 10.16, y: 2.15, w: 2.45, title: 'Billing & Renewals', body: 'Manage plan, invoices, renewals, and reminders.', fill: 'FCE7F3', accent: 'DB2777' },
  ];

  nodes.forEach((node, idx) => {
    addCard(slide, node.x, node.y, node.w, 1.6, { fill: node.fill, line: node.fill });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: node.x + 0.16,
      y: node.y + 0.16,
      w: 0.34,
      h: 0.34,
      fill: { color: node.accent },
      line: { color: node.accent },
    });
    slide.addText(String(idx + 1), {
      x: node.x + 0.16,
      y: node.y + 0.235,
      w: 0.34,
      h: 0.1,
      fontFace: 'Aptos',
      fontSize: 8.5,
      bold: true,
      color: 'FFFFFF',
      margin: 0,
      align: 'center',
    });
    slide.addText(node.title, {
      x: node.x + 0.58,
      y: node.y + 0.14,
      w: node.w - 0.74,
      h: 0.26,
      fontFace: 'Aptos',
      fontSize: 11.5,
      bold: true,
      color: colors.ink,
      margin: 0,
    });
    slide.addText(node.body, {
      x: node.x + 0.16,
      y: node.y + 0.54,
      w: node.w - 0.32,
      h: 0.62,
      fontFace: 'Aptos',
      fontSize: 9.2,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });

  ['→', '→', '→', '→'].forEach((arrow, idx) => {
    slide.addText(arrow, {
      x: 2.87 + idx * 2.36,
      y: 2.68,
      w: 0.24,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 20,
      color: colors.muted,
      margin: 0,
      align: 'center',
    });
  });

  addCard(slide, 0.72, 4.25, 12.0, 1.65, { fill: colors.card, line: colors.border });
  slide.addText('Why this matters', {
    x: 1.0,
    y: 4.5,
    w: 2.1,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 12.5,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 1.0, 4.87, 3.3, 'One login per user with role-based access');
  addBullet(slide, 4.2, 4.87, 3.3, 'One organization keeps its own data and branding');
  addBullet(slide, 7.4, 4.87, 3.3, 'One renewal cycle keeps billing and invoices clear');
  addBullet(slide, 10.58, 4.87, 2.0, 'One help desk for staff downtime', colors.ink);
}

function addSignupSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 3, 'Start here', 'Every company begins from the public home page and creates a secure workspace.', 'Sign up and first company setup');

  addCard(slide, 0.72, 2.02, 6.05, 4.52, { fill: colors.card, line: colors.border });
  slide.addText('1. Open the home page', {
    x: 1.0,
    y: 2.3,
    w: 2.6,
    h: 0.25,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 1.0, 2.74, 5.2, 'Choose Sign Up for a new company workspace.');
  addBullet(slide, 1.0, 3.1, 5.2, 'Pick a unique company slug, like digital-atharva.');
  addBullet(slide, 1.0, 3.46, 5.2, 'Enter Master Admin name, email, phone, and password.');

  slide.addShape(pptx.ShapeType.line, {
    x: 1.0,
    y: 4.02,
    w: 5.0,
    h: 0,
    line: { color: colors.border, pt: 1.2, dash: 'dash' },
  });

  addStepBubble(slide, 1.0, 4.22, 1, colors.blue);
  slide.addText('Select a plan', {
    x: 1.5,
    y: 4.23,
    w: 1.4,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 11.5,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('Free = 1 Master Admin + 5 assets. Paid plans unlock more users.', {
    x: 1.5,
    y: 4.47,
    w: 4.95,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 9.6,
    color: colors.muted,
    margin: 0,
  });

  addStepBubble(slide, 1.0, 5.02, 2, colors.teal);
  slide.addText('Create workspace', {
    x: 1.5,
    y: 5.03,
    w: 1.9,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 11.5,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('The system creates the organization, profile, and initial department together.', {
    x: 1.5,
    y: 5.27,
    w: 4.95,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 9.6,
    color: colors.muted,
    margin: 0,
  });

  addStepBubble(slide, 1.0, 5.82, 3, colors.green);
  slide.addText('Sign in automatically', {
    x: 1.5,
    y: 5.83,
    w: 2.1,
    h: 0.16,
    fontFace: 'Aptos',
    fontSize: 11.5,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('You land in the dashboard and can continue to onboarding or settings.', {
    x: 1.5,
    y: 6.07,
    w: 4.95,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 9.6,
    color: colors.muted,
    margin: 0,
  });

  addCard(slide, 7.1, 2.02, 5.45, 4.52, { fill: colors.card, line: colors.border });
  slide.addText('Fields to fill', {
    x: 7.38,
    y: 2.3,
    w: 1.5,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 13,
    bold: true,
    color: colors.ink,
    margin: 0,
  });

  const fields = [
    ['Company name', 'What your organization should be called in the workspace.'],
    ['Slug', 'A unique short ID used in the tenant setup and billing flow.'],
    ['Full name', 'The first Master Admin account name.'],
    ['Email + password', 'Your primary sign in credentials.'],
    ['Department', 'Usually IT Support for the first admin.'],
  ];
  fields.forEach((field, idx) => {
    const y = 2.72 + idx * 0.62;
    addCard(slide, 7.38, y, 4.86, 0.46, { fill: idx % 2 === 0 ? 'F9FAFB' : 'FFFFFF', line: colors.border });
    slide.addText(field[0], {
      x: 7.58,
      y: y + 0.13,
      w: 1.45,
      h: 0.14,
      fontFace: 'Aptos',
      fontSize: 10.5,
      bold: true,
      color: colors.ink,
      margin: 0,
    });
    slide.addText(field[1], {
      x: 8.95,
      y: y + 0.1,
      w: 3.05,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 9,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });
}

function addLoginSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 4, 'Access', 'Authorized users sign in to reach their company workspace.', 'Login and onboarding');

  addCard(slide, 0.72, 2.05, 4.8, 4.35, { fill: colors.card, line: colors.border });
  slide.addText('Login screen', {
    x: 1.0,
    y: 2.34,
    w: 1.8,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addChip(slide, 1.0, 2.72, 1.9, 'Company email', colors.softBlue, colors.blue);
  addChip(slide, 1.0, 3.16, 1.95, 'Password', colors.softTeal, colors.teal);
  addChip(slide, 1.0, 3.6, 2.25, 'Sign In button', colors.softGreen, colors.green);
  slide.addText('Use the exact company email that was created for your account.', {
    x: 1.0,
    y: 4.12,
    w: 3.9,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 10,
    color: colors.muted,
    margin: 0,
  });
  slide.addText('Tip: if the user is inactive, ask a Master Admin to reactivate the account.', {
    x: 1.0,
    y: 4.46,
    w: 3.9,
    h: 0.42,
    fontFace: 'Aptos',
    fontSize: 9.4,
    color: colors.muted,
    italic: true,
    margin: 0,
    fit: 'shrink',
  });

  addCard(slide, 5.86, 2.05, 6.73, 4.35, { fill: colors.card, line: colors.border });
  slide.addText('First login onboarding', {
    x: 6.14,
    y: 2.34,
    w: 2.6,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('The checklist appears after the first login and can be reopened later.', {
    x: 6.14,
    y: 2.63,
    w: 5.5,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 10,
    color: colors.muted,
    margin: 0,
  });

  const items = [
    ['1', 'Complete company details in Settings', colors.softBlue, colors.blue],
    ['2', 'Create departments for teams and locations', colors.softTeal, colors.teal],
    ['3', 'Create users and assign roles or permissions', colors.softGreen, colors.green],
    ['4', 'Add assets and start ticketing', colors.softAmber, colors.amber],
  ];
  items.forEach((item, idx) => {
    const y = 3.0 + idx * 0.64;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.14,
      y,
      w: 5.95,
      h: 0.48,
      rectRadius: 0.12,
      fill: { color: 'FFFFFF' },
      line: { color: colors.border, pt: 1 },
    });
    addStepBubble(slide, 6.3, y + 0.03, item[0], item[3]);
    slide.addText(item[1], {
      x: 6.82,
      y: y + 0.13,
      w: 5.0,
      h: 0.15,
      fontFace: 'Aptos',
      fontSize: 10.2,
      color: colors.ink,
      bold: idx === 0,
      margin: 0,
      fit: 'shrink',
    });
  });
}

function addSettingsSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 5, 'Branding', 'Settings is where the company identity and communication details stay up to date.', 'Settings and company profile');

  addCard(slide, 0.72, 2.05, 5.4, 4.45, { fill: colors.card, line: colors.border });
  slide.addText('What to maintain in Settings', {
    x: 1.0,
    y: 2.34,
    w: 2.95,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 1.0, 2.78, 4.7, 'Company name, email, address, website, and phone');
  addBullet(slide, 1.0, 3.16, 4.7, 'GSTIN, PAN, CIN, country, state, timezone, currency');
  addBullet(slide, 1.0, 3.54, 4.7, 'Notifications for asset changes, tickets, approvals, and device offline events');
  addBullet(slide, 1.0, 3.92, 4.7, 'Company logo upload with PNG only and 100KB limit');

  addCard(slide, 1.0, 4.48, 4.7, 1.38, { fill: colors.softBlue, line: 'C7DCF9' });
  slide.addText('Logo tip', {
    x: 1.22,
    y: 4.68,
    w: 1.0,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 11.5,
    bold: true,
    color: colors.blue,
    margin: 0,
  });
  slide.addText('Use a square PNG with a transparent background for the cleanest nav/sidebar result.', {
    x: 1.22,
    y: 4.98,
    w: 4.15,
    h: 0.32,
    fontFace: 'Aptos',
    fontSize: 9.7,
    color: colors.muted,
    margin: 0,
    fit: 'shrink',
  });

  addCard(slide, 6.46, 2.05, 6.13, 4.45, { fill: colors.card, line: colors.border });
  slide.addText('Where the values appear', {
    x: 6.76,
    y: 2.34,
    w: 2.7,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  const cards = [
    ['Profile', 'Company identity and contact details'],
    ['Sidebar', 'Workspace name and logo at the top'],
    ['Top bar', 'Branding visible across the dashboard'],
    ['Billing', 'Company details on invoices and receipts'],
  ];
  cards.forEach((item, idx) => {
    const y = 2.82 + idx * 0.72;
    addCard(slide, 6.76, y, 5.53, 0.52, { fill: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF', line: colors.border });
    slide.addText(item[0], {
      x: 6.98,
      y: y + 0.16,
      w: 1.0,
      h: 0.14,
      fontFace: 'Aptos',
      fontSize: 10.7,
      bold: true,
      color: colors.ink,
      margin: 0,
    });
    slide.addText(item[1], {
      x: 8.0,
      y: y + 0.15,
      w: 3.98,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 9.2,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });
}

function addRolesSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 6, 'Access', 'Departments and roles keep the right people responsible for the right work.', 'Departments and user roles');

  addCard(slide, 0.72, 2.06, 12.0, 4.42, { fill: colors.card, line: colors.border });

  slide.addText('Suggested roles', {
    x: 1.0,
    y: 2.35,
    w: 1.9,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });

  const roles = [
    ['Master Admin', 'Can manage the whole tenant, billing, branding, users, and settings.', colors.softBlue, colors.blue],
    ['Admin', 'Handles daily setup, moderation, and most operational tasks.', colors.softTeal, colors.teal],
    ['IT', 'Works on assets, device health, and tickets.', colors.softGreen, colors.green],
    ['HR', 'Monitors onboarding, offboarding, and employee related handovers.', colors.softAmber, colors.amber],
    ['Employee', 'Raises tickets, views assigned assets, and follows company process.', 'FCE7F3', 'DB2777'],
  ];
  roles.forEach((role, idx) => {
    const col = idx < 3 ? 0 : 1;
    const row = idx < 3 ? idx : idx - 3;
    const x = col === 0 ? 1.0 : 7.0;
    const y = 2.82 + row * 0.98;
    const w = col === 0 ? 5.4 : 4.95;
    addCard(slide, x, y, w, 0.75, { fill: role[2], line: role[2] });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.18,
      y: y + 0.18,
      w: 0.4,
      h: 0.4,
      rectRadius: 0.09,
      fill: { color: role[3] },
      line: { color: role[3] },
    });
    slide.addText(role[0], {
      x: x + 0.66,
      y: y + 0.15,
      w: w - 0.86,
      h: 0.18,
      fontFace: 'Aptos',
      fontSize: 11,
      bold: true,
      color: colors.ink,
      margin: 0,
      fit: 'shrink',
    });
    slide.addText(role[1], {
      x: x + 0.66,
      y: y + 0.4,
      w: w - 0.86,
      h: 0.22,
      fontFace: 'Aptos',
      fontSize: 9.1,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });

  addCard(slide, 1.0, 5.95, 11.0, 0.38, { fill: 'F8FAFC', line: colors.border });
  slide.addText('Departments are separate from roles. For example, IT Support, Infrastructure, Operations, Design, and Security can each have different users and responsibilities.', {
    x: 1.18,
    y: 6.06,
    w: 10.6,
    h: 0.12,
    fontFace: 'Aptos',
    fontSize: 9.3,
    color: colors.muted,
    margin: 0,
    fit: 'shrink',
  });
}

function addAssetsSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 7, 'Operations', 'Assets should be tagged, assigned, and kept in a clean lifecycle.', 'Assets and tagging');

  addCard(slide, 0.72, 2.06, 6.15, 4.4, { fill: colors.card, line: colors.border });
  slide.addText('Asset lifecycle', {
    x: 1.0,
    y: 2.35,
    w: 1.9,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });

  const lifecycle = [
    ['Add', 'Create a record with asset tag, name, serial, and type.'],
    ['Assign', 'Link the asset to a user, department, or location.'],
    ['Track', 'Monitor warranty, status, cost, and notes.'],
    ['Handover', 'Move devices cleanly during transfers or exits.'],
    ['Retire', 'Keep history, then mark the asset inactive or retired.'],
  ];
  lifecycle.forEach((item, idx) => {
    const y = 2.78 + idx * 0.58;
    addStepBubble(slide, 1.0, y + 0.05, idx + 1, idx % 2 === 0 ? colors.blue : colors.teal);
    slide.addText(item[0], {
      x: 1.5,
      y: y,
      w: 1.1,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 11,
      bold: true,
      color: colors.ink,
      margin: 0,
    });
    slide.addText(item[1], {
      x: 2.52,
      y: y,
      w: 4.0,
      h: 0.22,
      fontFace: 'Aptos',
      fontSize: 9.3,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });

  addCard(slide, 7.12, 2.06, 5.52, 4.4, { fill: colors.card, line: colors.border });
  slide.addText('What changes based on asset type', {
    x: 7.4,
    y: 2.35,
    w: 3.0,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });

  const typeCards = [
    ['Laptop / Desktop / Server', 'Show processor, RAM, storage, and OS fields.', colors.softBlue, colors.blue],
    ['Printer / Monitor / Router', 'Show capacity, model, and other useful hardware fields.', colors.softTeal, colors.teal],
    ['Cables / Mouse / Keyboard', 'Keep the record lean with tag, name, quantity, and location.', colors.softGreen, colors.green],
    ['USB HDD / SSD', 'Show storage capacity only.', colors.softAmber, colors.amber],
  ];
  typeCards.forEach((item, idx) => {
    const y = 2.8 + idx * 0.73;
    addCard(slide, 7.4, y, 4.96, 0.55, { fill: item[2], line: item[2] });
    slide.addText(item[0], {
      x: 7.6,
      y: y + 0.14,
      w: 1.75,
      h: 0.16,
      fontFace: 'Aptos',
      fontSize: 10.3,
      bold: true,
      color: colors.ink,
      margin: 0,
      fit: 'shrink',
    });
    slide.addText(item[1], {
      x: 9.25,
      y: y + 0.11,
      w: 2.8,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 8.8,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
  });
}

function addTicketsSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 8, 'Support', 'The help desk keeps downtime visible and gives each team a clear action list.', 'IT help desk ticketing');

  addCard(slide, 0.72, 2.04, 12.0, 4.42, { fill: colors.card, line: colors.border });
  slide.addText('Ticket flow', {
    x: 1.0,
    y: 2.33,
    w: 1.5,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });

  const flow = [
    ['1', 'Employee reports issue', 'Laptop, desktop, printer, network, or service issue.'],
    ['2', 'IT reviews and acts', 'Assign priority, inspect logs, and work on the fix.'],
    ['3', 'HR/Admin monitors', 'See patterns, downtime, and unresolved issues.'],
    ['4', 'Ticket closes with history', 'Keep the full audit trail for future reporting.'],
  ];
  flow.forEach((item, idx) => {
    const x = 1.0 + idx * 2.8;
    const fill = [colors.softBlue, colors.softTeal, colors.softAmber, 'FCE7F3'][idx];
    const accent = [colors.blue, colors.teal, colors.amber, 'DB2777'][idx];
    addCard(slide, x, 2.92, 2.45, 1.72, { fill, line: fill });
    addStepBubble(slide, x + 0.18, 3.12, item[0], accent);
    slide.addText(item[1], {
      x: x + 0.64,
      y: 3.08,
      w: 1.68,
      h: 0.28,
      fontFace: 'Aptos',
      fontSize: 10.5,
      bold: true,
      color: colors.ink,
      margin: 0,
      fit: 'shrink',
    });
    slide.addText(item[2], {
      x: x + 0.18,
      y: 3.54,
      w: 2.08,
      h: 0.44,
      fontFace: 'Aptos',
      fontSize: 8.7,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
    if (idx < flow.length - 1) {
      slide.addText('→', {
        x: x + 2.46,
        y: 3.57,
        w: 0.18,
        h: 0.1,
        fontFace: 'Aptos',
        fontSize: 18,
        color: colors.muted,
        margin: 0,
        align: 'center',
      });
    }
  });

  addCard(slide, 1.0, 5.18, 11.15, 1.0, { fill: 'F8FAFC', line: colors.border });
  slide.addText('Good help desk habits', {
    x: 1.22,
    y: 5.41,
    w: 1.8,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 11.6,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 3.0, 5.41, 2.55, 'Use one ticket per issue');
  addBullet(slide, 5.75, 5.41, 2.55, 'Track root cause and resolution');
  addBullet(slide, 8.4, 5.41, 2.55, 'Keep comment history for audits');
}

function addBillingSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 9, 'Billing', 'Choose a plan, pay securely, then download the invoice and renew on time.', 'Plans, billing, and invoices');

  const plans = [
    ['Free', '1 Master Admin + 5 Assets', 'Best for trials and small pilots.', colors.softGreen, colors.green],
    ['Starter', '10 Users', 'Rs-600/M | Rs-6500/Y', colors.softBlue, colors.blue],
    ['Growth', '50 Users', 'Rs-700/M | Rs-7500/Y', colors.softTeal, colors.teal],
    ['Enterprise', '250 Users', 'Rs-1000/M | Rs-10000/Y', 'FCE7F3', 'DB2777'],
  ];
  plans.forEach((plan, idx) => {
    const x = 0.72 + idx * 3.16;
    addCard(slide, x, 2.18, 2.9, 2.56, { fill: plan[3], line: plan[3] });
    slide.addText(plan[0], {
      x: x + 0.18,
      y: 2.42,
      w: 1.4,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 13,
      bold: true,
      color: colors.ink,
      margin: 0,
    });
    slide.addText(plan[1], {
      x: x + 0.18,
      y: 2.8,
      w: 2.45,
      h: 0.25,
      fontFace: 'Aptos',
      fontSize: 9.8,
      bold: true,
      color: plan[4],
      margin: 0,
      fit: 'shrink',
    });
    slide.addText(plan[2], {
      x: x + 0.18,
      y: 3.16,
      w: 2.45,
      h: 0.35,
      fontFace: 'Aptos',
      fontSize: 9.2,
      color: colors.muted,
      margin: 0,
      fit: 'shrink',
    });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.18,
      y: 3.72,
      w: 2.54,
      h: 0.5,
      rectRadius: 0.14,
      fill: { color: colors.card },
      line: { color: colors.border, pt: 1 },
    });
    slide.addText(idx === 0 ? 'Start free' : 'Upgrade ready', {
      x: x + 0.18,
      y: 3.87,
      w: 2.54,
      h: 0.14,
      fontFace: 'Aptos',
      fontSize: 9.2,
      bold: true,
      color: idx === 0 ? colors.green : plan[4],
      align: 'center',
      margin: 0,
    });
  });

  addCard(slide, 0.72, 5.0, 6.15, 1.48, { fill: colors.card, line: colors.border });
  slide.addText('Renewal flow', {
    x: 1.0,
    y: 5.26,
    w: 1.5,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 1.0, 5.63, 5.2, 'You can switch monthly or yearly before checkout');
  addBullet(slide, 1.0, 5.93, 5.2, 'Renewal reminders appear before the subscription expires');

  addCard(slide, 7.12, 5.0, 5.52, 1.48, { fill: colors.card, line: colors.border });
  slide.addText('After payment', {
    x: 7.4,
    y: 5.26,
    w: 1.8,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 12,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  addBullet(slide, 7.4, 5.63, 4.9, 'Workspace gets activated automatically');
  addBullet(slide, 7.4, 5.93, 4.9, 'Invoice download stays available from the billing center');
}

function addRolloutSlide() {
  const slide = pptx.addSlide();
  addPageChrome(slide, 10, 'Rollout', 'A simple first-week checklist helps new companies adopt the system quickly.', 'Suggested first-week rollout');

  addCard(slide, 0.72, 2.05, 12.0, 4.44, { fill: colors.card, line: colors.border });
  slide.addText('7-day adoption plan', {
    x: 1.0,
    y: 2.34,
    w: 2.5,
    h: 0.22,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: colors.ink,
    margin: 0,
  });
  slide.addText('Use this flow when you train a new company after sign-up.', {
    x: 1.0,
    y: 2.64,
    w: 4.8,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 10,
    color: colors.muted,
    margin: 0,
  });

  const days = [
    ['Day 1', 'Complete Settings and upload the company logo.'],
    ['Day 2', 'Create departments and assign their managers.'],
    ['Day 3', 'Create users and map roles and permissions.'],
    ['Day 4', 'Add the first laptops, desktops, servers, and other assets.'],
    ['Day 5', 'Teach employees how to raise IT help desk tickets.'],
    ['Day 6', 'Review billing, plan limits, and invoice download.'],
    ['Day 7', 'Export reports and confirm the workspace is ready.'],
  ];
  days.forEach((day, idx) => {
    const y = 3.02 + idx * 0.42;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 1.0,
      y,
      w: 11.0,
      h: 0.32,
      rectRadius: 0.09,
      fill: { color: idx % 2 === 0 ? 'F8FAFC' : 'FFFFFF' },
      line: { color: colors.border, pt: 0.9 },
    });
    slide.addText(day[0], {
      x: 1.2,
      y: y + 0.09,
      w: 0.7,
      h: 0.1,
      fontFace: 'Aptos',
      fontSize: 9.8,
      bold: true,
      color: colors.blue,
      margin: 0,
    });
    slide.addText(day[1], {
      x: 2.0,
      y: y + 0.08,
      w: 9.7,
      h: 0.12,
      fontFace: 'Aptos',
      fontSize: 9.5,
      color: colors.ink,
      margin: 0,
      fit: 'shrink',
    });
  });

  addCard(slide, 1.0, 6.0, 11.0, 0.34, { fill: colors.softBlue, line: 'C7DCF9' });
  slide.addText('New users can reopen this guide from the home page and share it with their team whenever needed.', {
    x: 1.22,
    y: 6.11,
    w: 10.5,
    h: 0.1,
    fontFace: 'Aptos',
    fontSize: 9.2,
    color: colors.blue,
    margin: 0,
    fit: 'shrink',
  });
}

async function main() {
  addCover();
  addFlowSlide();
  addSignupSlide();
  addLoginSlide();
  addSettingsSlide();
  addRolesSlide();
  addAssetsSlide();
  addTicketsSlide();
  addBillingSlide();
  addRolloutSlide();

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(outputPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
