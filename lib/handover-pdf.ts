import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Asset, AssetHandover } from '@/lib/mock-data';
import { degrees } from 'pdf-lib';

const PAGE_SIZE: [number, number] = [595, 842];
const MARGIN_X = 40;
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

async function loadImage(pdf: PDFDocument, logoUrl?: string) {
  const source = logoUrl?.trim();
  if (!source) return null;

  try {
    if (source.startsWith('data:image/png;base64,')) {
      const base64 = source.split(',')[1] || '';
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      return await pdf.embedPng(bytes);
    }

    if (source.startsWith('data:image/jpeg;base64,') || source.startsWith('data:image/jpg;base64,')) {
      const base64 = source.split(',')[1] || '';
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      return await pdf.embedJpg(bytes);
    }

    const response = await fetch(source);
    if (!response.ok) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (source.endsWith('.jpg') || source.endsWith('.jpeg')) {
      return await pdf.embedJpg(bytes);
    }

    return await pdf.embedPng(bytes);
  } catch {
    return null;
  }
}


export async function createHandoverPdfBytes(
  handover: AssetHandover,
  assets: Asset[],
  companyName = 'Digital IMALAG IT Assets Management SaaS',
  logoUrl?: string
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadImage(pdf, logoUrl);

  const drawHeader = (page: any, pageNo: number) => {
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: height - 86,
      width,
      height: 86,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.09, 0.29, 0.62),
      borderWidth: 1.1,
    });
    if (logo) {
      const maxLogoWidth = 72;
      const maxLogoHeight = 44;
      const scale = Math.min(maxLogoWidth / logo.width, maxLogoHeight / logo.height, 1);
      const drawWidth = logo.width * scale;
      const drawHeight = logo.height * scale;
      page.drawImage(logo, {
        x: MARGIN_X,
        y: height - 68,
        width: drawWidth,
        height: drawHeight,
      });
    }
    const textX = MARGIN_X + (logo ? 86 : 0);
    const titleLines = wrapText(bold, companyName, 12.5, width - textX - 250).slice(0, 2);
    titleLines.forEach((line, index) => {
      page.drawText(line, {
        x: textX,
        y: height - 30 - index * 15,
        size: 12.5,
        font: bold,
        color: rgb(0.07, 0.11, 0.18),
      });
    });

    page.drawText('IT Assets Management SaaS', {
      x: textX,
      y: height - 53,
      size: 8.8,
      font: regular,
      color: rgb(0.38, 0.44, 0.53),
    });
    page.drawText(`Asset Handover Receipt • Page ${pageNo}`, {
      x: width - 220,
      y: height - 40,
      size: 10,
      font: regular,
      color: rgb(0.07, 0.11, 0.18),
    });
  };

  const drawFooter = (page: any, pageNo: number) => {
    const { width } = page.getSize();
    page.drawLine({
      start: { x: MARGIN_X, y: 34 },
      end: { x: width - MARGIN_X, y: 34 },
      thickness: 0.8,
      color: rgb(0.86, 0.89, 0.93),
    });
    page.drawText(companyName, {
      x: MARGIN_X,
      y: 20,
      size: 8.5,
      font: regular,
      color: rgb(0.42, 0.47, 0.56),
    });
    page.drawText(`Page ${pageNo}`, {
      x: width - MARGIN_X - 40,
      y: 20,
      size: 8.5,
      font: regular,
      color: rgb(0.42, 0.47, 0.56),
    });
  };

  let page = pdf.addPage(PAGE_SIZE);
  let pageNo = 1;
  drawHeader(page, pageNo);
  drawFooter(page, pageNo);

  let y = PAGE_SIZE[1] - 114;
  const width = PAGE_SIZE[0] - MARGIN_X * 2;
  const sectionTitle = (title: string) => {
    page.drawText(title, { x: MARGIN_X, y, size: 13.5, font: bold, color: rgb(0.07, 0.11, 0.18) });
    y -= 14;
  };

  y = y - 22;
  sectionTitle('Employee Summary');
  const summaryCardTop = y + 4;
  const summaryCardHeight = 164;
  const colWidth = (width - 18) / 2;
  const leftX = MARGIN_X;
  const rightX = MARGIN_X + colWidth + 18;
  page.drawRectangle({
    x: MARGIN_X,
    y: summaryCardTop - summaryCardHeight,
    width,
    height: summaryCardHeight,
    borderColor: rgb(0.86, 0.89, 0.93),
    borderWidth: 1,
    color: rgb(0.98, 0.99, 1),
  });

  const drawFieldBox = (x: number, yTop: number, label: string, value: string, highlighted = false) => {
    const boxHeight = 38;
    page.drawRectangle({
      x,
      y: yTop - boxHeight,
      width: colWidth,
      height: boxHeight,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.90, 0.92, 0.95),
      borderWidth: 0.8,
    });
    page.drawText(label.toUpperCase(), {
      x: x + 12,
      y: yTop - 14,
      size: 8,
      font: bold,
      color: rgb(0.45, 0.52, 0.62),
    });
    const lines = wrapText(highlighted ? bold : regular, value || '-', 10.2, colWidth - 24);
    page.drawText(lines.slice(0, 2).join('\n'), {
      x: x + 12,
      y: yTop - 28,
      size: 10.2,
      font: highlighted ? bold : regular,
      color: highlighted ? rgb(0.08, 0.5, 0.24) : rgb(0.08, 0.12, 0.2),
      lineHeight: 11,
      maxWidth: colWidth - 24,
    });
  };

  drawFieldBox(leftX, summaryCardTop - 16, 'Employee', handover.employeeName);
  drawFieldBox(rightX, summaryCardTop - 16, 'Handover ID', handover.id);
  drawFieldBox(leftX, summaryCardTop - 62, 'Designation', handover.employeeRole);
  drawFieldBox(rightX, summaryCardTop - 62, 'Resignation Date', handover.resignationDate);
  drawFieldBox(leftX, summaryCardTop - 108, 'Department', handover.department);
  drawFieldBox(rightX, summaryCardTop - 108, 'Status', handover.handoverStatus, true);

  y = summaryCardTop - summaryCardHeight - 18;

  sectionTitle('Returned Assets');

const tableHeaderHeight = 34;

page.drawRectangle({
  x: MARGIN_X,
  y: y - tableHeaderHeight,
  width,
  height: tableHeaderHeight,
  color: rgb(0.93, 0.96, 0.99),
  borderColor: rgb(0.86, 0.89, 0.93),
  borderWidth: 1,
});

const headerTextY = y - 21;

page.drawText('Asset Tag', {
  x: MARGIN_X + 12,
  y: headerTextY,
  size: 8.5,
  font: bold,
  color: rgb(0.33, 0.39, 0.48),
});

page.drawText('Asset Name', {
  x: MARGIN_X + 118,
  y: headerTextY,
  size: 8.5,
  font: bold,
  color: rgb(0.33, 0.39, 0.48),
});

page.drawText('Type', {
  x: MARGIN_X + 326,
  y: headerTextY,
  size: 8.5,
  font: bold,
  color: rgb(0.33, 0.39, 0.48),
});

page.drawText('Status', {
  x: MARGIN_X + 420,
  y: headerTextY,
  size: 8.5,
  font: bold,
  color: rgb(0.33, 0.39, 0.48),
});

y -= 40;


  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  handover.assetDetails.forEach((item, index) => {
    const asset = assetsById.get(item.id);
    const tag = asset?.assetTag || item.id;
    const tagLines = wrapText(regular, tag, 9.5, 92);
    const nameLines = wrapText(regular, item.name, 9.5, 194);
    const typeLines = wrapText(regular, item.type, 9.5, 82);
    const statusLines = wrapText(bold, item.status, 9.5, 72);
    const contentLines = Math.max(tagLines.length, nameLines.length, typeLines.length, statusLines.length);
    const rowHeight = Math.max(42, contentLines * 14 + 14);

    if (y - rowHeight < 120) {
      page = pdf.addPage(PAGE_SIZE);
      pageNo += 1;
      drawHeader(page, pageNo);
      drawFooter(page, pageNo);
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

    const cellTop = rowY + rowHeight - 18;
    const drawLines = (lines: string[], x: number, fontRef: any, color: any) => {
      let lineY = cellTop;
      lines.forEach((line) => {
        page.drawText(line, { x, y: lineY, size: 9.5, font: fontRef, color });
        lineY -= 13;
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

  const finalSectionHeight = 190;
  if (y - finalSectionHeight < BOTTOM + 20) {
    page = pdf.addPage(PAGE_SIZE);
    pageNo += 1;
    drawHeader(page, pageNo);
    drawFooter(page, pageNo);
    y = PAGE_SIZE[1] - 110;
  }

  page.drawText('This receipt is provided for record keeping, verification, and print-ready handover processing.', {
    x: MARGIN_X,
    y,
    size: 9,
    font: regular,
    color: rgb(0.42, 0.47, 0.56),
    maxWidth: width,
  });

  y -= 20;
  page.drawText('Employee Acknowledgment', {
    x: MARGIN_X,
    y,
    size: 13,
    font: bold,
    color: rgb(0.07, 0.11, 0.18),
  });

  y -= 18;
  page.drawText(
    'I hereby confirm that the above listed assets have been returned/submitted to the organization and verified by the IT department.',
    {
      x: MARGIN_X,
      y,
      size: 9.3,
      font: regular,
      color: rgb(0.35, 0.41, 0.49),
      maxWidth: width,
      lineHeight: 13,
    }
  );

  const sigTop = y - 42;
  const sigHeight = 92;
  const sigWidth = (width - 24) / 3;
  const sigX1 = MARGIN_X;
  const sigX2 = MARGIN_X + sigWidth + 12;
  const sigX3 = MARGIN_X + (sigWidth + 12) * 2;

  const drawModernSignatureBox = (x: number, label: string, designation: string) => {
    page.drawRectangle({
      x,
      y: sigTop - sigHeight,
      width: sigWidth,
      height: sigHeight,
      borderColor: rgb(0.82, 0.85, 0.90),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    page.drawText(label, {
      x: x + 12,
      y: sigTop - 18,
      size: 10,
      font: bold,
      color: rgb(0.07, 0.11, 0.18),
    });

    page.drawText(designation, {
      x: x + 12,
      y: sigTop - 32,
      size: 8,
      font: regular,
      color: rgb(0.45, 0.52, 0.62),
    });

    page.drawLine({
      start: { x: x + 12, y: sigTop - 56 },
      end: { x: x + sigWidth - 12, y: sigTop - 56 },
      thickness: 0.8,
      color: rgb(0.35, 0.41, 0.49),
    });

    page.drawText('Signature', {
      x: x + 12,
      y: sigTop - 68,
      size: 7.5,
      font: regular,
      color: rgb(0.55, 0.60, 0.67),
    });

    page.drawText('Date: ___________', {
      x: x + 12,
      y: sigTop - 82,
      size: 7.5,
      font: regular,
      color: rgb(0.55, 0.60, 0.67),
    });
  };

  drawModernSignatureBox(sigX1, handover.employeeName, 'Employee');
  drawModernSignatureBox(sigX2, 'IT Department', 'Verified By');
  drawModernSignatureBox(sigX3, 'HR Department', 'Approved By');

  drawFooter(page, pageNo);

  return pdf.save();
}

export async function downloadHandoverPdf(
  handover: AssetHandover,
  assets: Asset[],
  companyName?: string,
  logoUrl?: string
) {
  const bytes = await createHandoverPdfBytes(handover, assets, companyName, logoUrl);
  const safeName = handover.employeeName.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'handover';
  downloadBytes(bytes, `handover-${safeName}-${handover.id}.pdf`);
}
