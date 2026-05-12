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

  y = y - 22;
  sectionTitle('Employee Summary');
  const summaryCardTop = y + 4;
  const summaryCardHeight = 150;
  const empLeft = MARGIN_X + 16;
  const empRight = MARGIN_X + 16 + leftCol + 24;
  const fieldWidth = leftCol;
  const fieldValueWidth = fieldWidth - 8;
  const summaryRows = [
    {
      label: 'Employee',
      value: handover.employeeName,
      x: empLeft,
      y: summaryCardTop - 10,
      width: fieldWidth,
    },
    {
      label: 'Handover ID',
      value: handover.id,
      x: empRight,
      y: summaryCardTop - 10,
      width: fieldWidth,
    },
    {
      label: 'Role',
      value: handover.employeeRole,
      x: empLeft,
      y: summaryCardTop - 56,
      width: fieldWidth,
    },
    {
      label: 'Resignation Date',
      value: handover.resignationDate,
      x: empRight,
      y: summaryCardTop - 56,
      width: fieldWidth,
    },
    {
      label: 'Department',
      value: handover.department,
      x: empLeft,
      y: summaryCardTop - 102,
      width: fieldWidth,
    },
    {
      label: 'Status',
      value: handover.handoverStatus,
      x: empRight,
      y: summaryCardTop - 102,
      width: fieldWidth,
    },
  ];

  page.drawRectangle({
    x: MARGIN_X,
    y: summaryCardTop - summaryCardHeight,
    width,
    height: summaryCardHeight,
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });

  summaryRows.forEach((field) => {
    page.drawText(field.label.toUpperCase(), {
      x: field.x,
      y: field.y,
      size: 8.5,
      font: bold,
      color: rgb(0.45, 0.52, 0.62),
    });

    const lines = wrapText(field.label === 'Status' ? bold : regular, field.value || '-', 10.5, fieldValueWidth);
    lines.forEach((line, idx) => {
      page.drawText(line, {
        x: field.x,
        y: field.y - 14 - idx * 12,
        size: 10.5,
        font: field.label === 'Status' ? bold : regular,
        color: field.label === 'Status'
          ? rgb(0.08, 0.5, 0.24)
          : rgb(0.08, 0.12, 0.2),
      });
    });
  });

  y = summaryCardTop - summaryCardHeight - 18;

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
    const asset = assetsById.get(item.id);
    const tag = asset?.assetTag || item.id;
    const tagLines = wrapText(regular, tag, 9.5, 92);
    const nameLines = wrapText(regular, item.name, 9.5, 194);
    const typeLines = wrapText(regular, item.type, 9.5, 82);
    const statusLines = wrapText(bold, item.status, 9.5, 72);
    const contentLines = Math.max(tagLines.length, nameLines.length, typeLines.length, statusLines.length);
    const rowHeight = Math.max(28, contentLines * 12 + 10);

    if (y - rowHeight < 120) {
      page = pdf.addPage(PAGE_SIZE);
      pageNo += 1;
      drawHeader(page, pageNo);
      y = PAGE_SIZE[1] - 110;
    }

    const rowY = y - rowHeight;
    page.drawRectangle({
      x: MARGIN_X,
      y: rowY,
      width,
      height: rowHeight,
      borderColor: rgb(0.9, 0.92, 0.95),
      borderWidth: 0.5,
      color: index % 2 === 0 ? rgb(1, 1, 1) : rgb(0.99, 0.995, 1),
    });

    const cellTop = rowY + rowHeight - 14;
    const drawLines = (lines: string[], x: number, fontRef: any, color: any) => {
      let lineY = cellTop;
      lines.forEach((line) => {
        page.drawText(line, { x, y: lineY, size: 9.5, font: fontRef, color });
        lineY -= 11.5;
      });
    };

    drawLines(tagLines, MARGIN_X + 12, bold, rgb(0.11, 0.16, 0.26));
    drawLines(nameLines, MARGIN_X + 118, regular, rgb(0.11, 0.16, 0.26));
    drawLines(typeLines, MARGIN_X + 326, regular, rgb(0.11, 0.16, 0.26));
    drawLines(statusLines, MARGIN_X + 420, bold, item.status === 'Returned' ? rgb(0.08, 0.5, 0.24) : rgb(0.72, 0.45, 0.05));
    y = rowY - 4;
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
