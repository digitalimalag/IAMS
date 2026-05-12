import { Asset, NetworkDevice, Issue } from './mock-data';
import { formatDateYMD } from './date';

// CSV Export Functions
export function exportToCSV<T>(data: T[], filename: string) {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0] as Record<string, any>);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = (row as Record<string, any>)[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportAssetsToCSV(assets: Asset[]) {
  const csvAssets = assets.map(asset => ({
    'Asset Tag': asset.assetTag,
    'Name': asset.name,
    'Type': asset.type,
    'Serial Number': asset.serialNumber,
    'Manufacturer': asset.manufacturer,
    'Model': asset.model,
    'Processor': asset.processor || '-',
    'RAM': asset.ram || '-',
    'Storage': asset.storage || '-',
    'OS': asset.osInstalled || '-',
    'Status': asset.status,
    'Location': asset.location,
    'Owner': asset.owner,
    'Department': asset.department,
    'Purchase Date': asset.purchaseDate,
    'Warranty Expiry': asset.warrantyExpiry,
    'Cost': asset.cost,
    'Notes': asset.notes,
  }));

  exportToCSV(csvAssets, `assets-${formatDateYMD(new Date())}`);
}

export function exportNetworkDevicesToCSV(devices: NetworkDevice[]) {
  const csvDevices = devices.map(device => ({
    'Device ID': device.id,
    'Name': device.name,
    'Type': device.type,
    'IP Address': device.ipAddress,
    'MAC Address': device.macAddress,
    'Location': device.location,
    'Status': device.status,
    'Firmware Version': device.firmwareVersion,
    'Department': device.department,
    'Last Seen': device.lastSeen,
  }));

  exportToCSV(csvDevices, `network-devices-${formatDateYMD(new Date())}`);
}

export function exportIssuesToCSV(issues: Issue[]) {
  const csvIssues = issues.map(issue => ({
    'Issue ID': issue.id,
    'Title': issue.title,
    'Description': issue.description,
    'Status': issue.status,
    'Priority': issue.priority,
    'Asset ID': issue.assetId,
    'Assigned To': issue.assignedTo,
    'Created Date': issue.createdDate,
    'Due Date': issue.dueDate,
    'Department': issue.department,
  }));

  exportToCSV(csvIssues, `issues-${formatDateYMD(new Date())}`);
}

// PDF Generation for Asset Issue Form
export function generateAssetIssueFormPDF(issue: Issue, asset: Asset | null) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 800;
  canvas.height = 1100;
  
  const y = { current: 40 };
  const lineHeight = 25;

  // Helper function to draw text
  const drawText = (text: string, x: number, size: number, bold: boolean = false) => {
    ctx.font = `${bold ? 'bold' : ''} ${size}px Arial`;
    ctx.fillStyle = '#000';
    ctx.fillText(text, x, y.current);
    y.current += lineHeight;
  };

  const drawLine = () => {
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    ctx.moveTo(40, y.current);
    ctx.lineTo(760, y.current);
    ctx.stroke();
    y.current += 15;
  };

  // Header
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, canvas.width, 60);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Arial';
  ctx.fillText('IT ASSET ISSUE REPORT FORM', 40, 35);
  y.current = 80;

  // Issue Details Section
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = '#000';
  ctx.fillText('ISSUE DETAILS', 40, y.current);
  y.current += 30;
  drawLine();

  ctx.font = '12px Arial';
  drawText(`Issue ID: ${issue.id}`, 40, 12);
  drawText(`Date: ${formatDateYMD(new Date())}`, 40, 12);
  drawText(`Title: ${issue.title}`, 40, 12);
  drawText(`Description: ${issue.description}`, 40, 12);
  drawText(`Status: ${issue.status}`, 40, 12);
  drawText(`Priority: ${issue.priority}`, 40, 12);
  
  y.current += 20;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('ASSET INFORMATION', 40, y.current);
  y.current += 30;
  drawLine();

  if (asset) {
    ctx.font = '12px Arial';
    drawText(`Asset Tag: ${asset.assetTag}`, 40, 12);
    drawText(`Name: ${asset.name}`, 40, 12);
    drawText(`Type: ${asset.type}`, 40, 12);
    drawText(`Serial Number: ${asset.serialNumber}`, 40, 12);
    drawText(`Owner: ${asset.owner}`, 40, 12);
  } else {
    ctx.font = '12px Arial';
    drawText('No Asset Associated', 40, 12);
  }

  y.current += 30;
  ctx.font = 'bold 14px Arial';
  ctx.fillText('EMPLOYEE INFORMATION', 40, y.current);
  y.current += 30;
  drawLine();

  ctx.font = '12px Arial';
  drawText(`Assigned To: ${issue.assignedTo}`, 40, 12);
  drawText(`Designation: ${issue.designation || '-'}`, 40, 12);
  drawText(`Department: ${issue.department}`, 40, 12);
  drawText(`Created Date: ${issue.createdDate}`, 40, 12);
  drawText(`Due Date: ${issue.dueDate}`, 40, 12);

  y.current += 40;
  ctx.font = 'bold 12px Arial';
  ctx.fillText('SIGNATURE & APPROVAL', 40, y.current);
  y.current += 40;

  // Signature areas
  ctx.font = '11px Arial';
  ctx.fillText('Employee Signature: _____________________', 40, y.current);
  y.current += 30;
  ctx.fillText('Manager Signature: _____________________', 40, y.current);
  y.current += 30;
  ctx.fillText('IT Admin Signature: _____________________', 40, y.current);

  // Download
  const image = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = image;
  link.download = `asset-issue-form-${issue.id}-${formatDateYMD(new Date())}.png`;
  link.click();
}
