'use client';

import { Button } from '@/components/ui/button';
import { Download, FileText, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportAssetsToCSV, exportNetworkDevicesToCSV, exportIssuesToCSV } from '@/lib/export-utils';
import { Asset, NetworkDevice, Issue } from '@/lib/mock-data';

interface ExportButtonsProps {
  data: Asset[] | NetworkDevice[] | Issue[];
  type: 'assets' | 'devices' | 'issues';
  onGeneratePDF?: () => void;
}

export function ExportButtons({ data, type, onGeneratePDF }: ExportButtonsProps) {
  const handleCSVExport = () => {
    switch (type) {
      case 'assets':
        exportAssetsToCSV(data as Asset[]);
        break;
      case 'devices':
        exportNetworkDevicesToCSV(data as NetworkDevice[]);
        break;
      case 'issues':
        exportIssuesToCSV(data as Issue[]);
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport} className="gap-2 cursor-pointer">
          <Share2 className="w-4 h-4" />
          Export as CSV
        </DropdownMenuItem>
        {type === 'issues' && onGeneratePDF && (
          <DropdownMenuItem onClick={onGeneratePDF} className="gap-2 cursor-pointer">
            <FileText className="w-4 h-4" />
            Download PDF Form
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
