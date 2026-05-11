import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Asset, AssetHandover } from '@/lib/mock-data';

const PAGE_SIZE: [number, number] = [595, 842];
const MARGIN_X = 40;
const TOP = 54;
const BOTTOM = 48;

function textWidth(font: any, text: string, size: number) {
  return font.widthOfTextAtSize(text, size);
}

function wrapText(font: any, text: string, size: number, maxWidth: number) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return ['-'];
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${line} ${words[i]}`;
    if (textWidth(font, next, size) > maxWidth) {
      lines.push(line);
      line = words[i];
    } else {
      line = next;
    }
  }
  lines.push(line);
  return lines;
}

function downloadBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createHandoverPdfBytes(
  handover: AssetHandover,
  assets: Asset[],
  companyName = 'Digital IMALAG IT Assets Management SaaS'
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const drawHeader = (page: any, pageNo: number) => {
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: height - 74,
      width,
      height: 74,
      color: rgb(0.09, 0.29, 0.62),
    });
    page.drawText('IT Assets Management SaaS', {
      x: MARGIN_X,
      y: height - 36,
      size: 16,
      font: bold,
      color: rgb(1, 1, 1),
    });
    page.drawText(companyName, {
      x: MARGIN_X,
      y: height - 52,
      size: 10.5,
      font: regular,
      color: rgb(0.88, 0.94, 1),
    });
    page.drawText(`Asset Handover Receipt • Page ${pageNo}`, {
      x: width - 220,
      y: height - 38,
      size: 10,
      font: regular,
      color: rgb(0.88, 0.94, 1),
    });
  };

  let page = pdf.addPage(PAGE_SIZE);
  let pageNo = 1;
  drawHeader(page, pageNo);

  let y = PAGE_SIZE[1] - 114;
  const width = PAGE_SIZE[0] - MARGIN_X * 2;
  const leftCol = width * 0.48;
  const rightCol = width * 0.48;

  const sectionTitle = (title: string) => {
    page.drawText(title, { x: MARGIN_X, y, size: 13.5, font: bold, color: rgb(0.07, 0.11, 0.18) });
    y -= 14;
  };

  const labelValue = (label: string, value: string, x: number, boxWidth: number) => {
    const labelY = y;
    page.drawText(label.toUpperCase(), {
      x,
      y: labelY,
      size: 8.5,
      font: bold,
      color: rgb(0.45, 0.52, 0.62),
    });
    const lines = wrapText(regular, value || '-', 10.5, boxWidth);
    lines.forEach((line, idx) => {
      page.drawText(line, {
        x,
        y: labelY - 14 - idx * 12,
        size: 10.5,
        font: regular,
        color: rgb(0.08, 0.12, 0.2),
      });
    });
    return labelY - 16 - lines.length * 12;
  };

  page.drawRectangle({
    x: MARGIN_X,
    y: y - 100,
    width,
    height: 96,
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });

  y = y - 22;
  sectionTitle('Employee Summary');
  const empLeft = MARGIN_X + 16;
  const empRight = MARGIN_X + 16 + leftCol + 24;
  let leftY = y;
  let rightY = y;
  leftY = labelValue('Employee', handover.employeeName, empLeft, leftCol);
  leftY = labelValue('Role', handover.employeeRole, empLeft, leftCol);
  leftY = labelValue('Department', handover.department, empLeft, leftCol);

  rightY = labelValue('Handover ID', handover.id, empRight, rightCol);
  rightY = labelValue('Resignation Date', handover.resignationDate, empRight, rightCol);
  rightY = labelValue('Status', handover.handoverStatus, empRight, rightCol);

  y = Math.min(leftY, rightY) - 18;

  sectionTitle('Returned Assets');
  page.drawRectangle({
    x: MARGIN_X,
    y: y - 24,
    width,
    height: 24,
    color: rgb(0.93, 0.96, 0.99),
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
  });
  page.drawText('Asset Tag', { x: MARGIN_X + 12, y: y - 9, size: 8.5, font: bold, color: rgb(0.33, 0.39, 0.48) });
  page.drawText('Asset Name', { x: MARGIN_X + 118, y: y - 9, size: 8.5, font: bold, color: rgb(0.33, 0.39, 0.48) });
  page.drawText('Type', { x: MARGIN_X + 326, y: y - 9, size: 8.5, font: bold, color: rgb(0.33, 0.39, 0.48) });
  page.drawText('Status', { x: MARGIN_X + 420, y: y - 9, size: 8.5, font: bold, color: rgb(0.33, 0.39, 0.48) });
  y -= 28;

  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  handover.assetDetails.forEach((item, index) => {
    if (y < 120) {
      page = pdf.addPage(PAGE_SIZE);
      pageNo += 1;
      drawHeader(page, pageNo);
      y = PAGE_SIZE[1] - 110;
    }

    const asset = assetsById.get(item.id);
    const tag = asset?.assetTag || item.id;
    const rowY = y - 22;
    page.drawRectangle({
      x: MARGIN_X,
      y: rowY,
      width,
      height: 22,
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
      color: index % 2 === 0 ? rgb(1, 1, 1) : rgb(0.99, 0.995, 1),
    });
    page.drawText(tag, { x: MARGIN_X + 12, y: rowY + 7, size: 9.5, font: bold, color: rgb(0.11, 0.16, 0.26) });
    page.drawText(item.name, { x: MARGIN_X + 118, y: rowY + 7, size: 9.5, font: regular, color: rgb(0.11, 0.16, 0.26), maxWidth: 190 });
    page.drawText(item.type, { x: MARGIN_X + 326, y: rowY + 7, size: 9.5, font: regular, color: rgb(0.11, 0.16, 0.26), maxWidth: 82 });
    page.drawText(item.status, { x: MARGIN_X + 420, y: rowY + 7, size: 9.5, font: bold, color: item.status === 'Returned' ? rgb(0.08, 0.5, 0.24) : rgb(0.72, 0.45, 0.05) });
    y = rowY - 2;
  });

  y -= 18;
  sectionTitle('Approvals');
  const approvals = [
    `IT Approval: ${handover.itApproval ? `${handover.itApproval.approvedBy} on ${handover.itApproval.approvalDate}` : 'Pending'}`,
    `HR Approval: ${handover.hrApproval ? `${handover.hrApproval.approvedBy} on ${handover.hrApproval.approvalDate}` : 'Pending'}`,
    `Created On: ${handover.createdDate}`,
  ];

  approvals.forEach((line) => {
    page.drawText(`• ${line}`, {
      x: MARGIN_X + 8,
      y,
      size: 10,
      font: regular,
      color: rgb(0.11, 0.16, 0.26),
    });
    y -= 16;
  });

  y -= 10;
  page.drawText('This receipt is provided for record keeping, verification, and print-ready handover processing.', {
    x: MARGIN_X,
    y,
    size: 9,
    font: regular,
    color: rgb(0.42, 0.47, 0.56),
    maxWidth: width,
  });

  return pdf.save();
}

export async function downloadHandoverPdf(
  handover: AssetHandover,
  assets: Asset[],
  companyName?: string
) {
  const bytes = await createHandoverPdfBytes(handover, assets, companyName);
  const safeName = handover.employeeName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'handover';
  downloadBytes(bytes, `handover-${safeName}-${handover.id}.pdf`);
}
