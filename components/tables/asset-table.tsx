'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Asset } from '@/lib/mock-data';
import { formatDateYMD } from '@/lib/date';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssetTableProps {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
  onTransfer?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
}

export function AssetTable({ assets, onEdit, onTransfer, onDelete }: AssetTableProps) {
  const formatRam = (asset: Asset) => {
    if (Array.isArray(asset.ramModules) && asset.ramModules.length > 0) {
      return asset.ramModules
        .map((module) => [module.capacity, module.ramType, module.ramMhz ? `${module.ramMhz} MHz` : ''].filter(Boolean).join(' '))
        .filter(Boolean)
        .join(', ');
    }
    const parts = [asset.ram, asset.ramType, asset.ramMhz ? `${asset.ramMhz} MHz` : ''].filter(Boolean).join(' ');
    return parts || '-';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'Inactive':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
      case 'Maintenance':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'Retired':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      Desktop: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
      Laptop: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
      Server: 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
      Printer: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20',
      Monitor: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20',
      Router: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
      Switch: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20',
    };
    return colors[type] || '';
  };

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No assets found matching your filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Asset Tag</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Type</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Processor</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">RAM</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Storage</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">OS</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Department</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Warranty</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow 
              key={asset.id}
              className="border-b hover:bg-muted/40 transition-colors"
            >
              <TableCell className="p-3 font-mono font-medium text-sm">{asset.assetTag}</TableCell>
              <TableCell className="p-3 font-medium">{asset.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(asset.type)}>
                  {asset.type}
                </Badge>
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{asset.processor || '-'}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{formatRam(asset)}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{asset.storage || '-'}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{asset.osInstalled || '-'}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusColor(asset.status)}>
                  {asset.status}
                </Badge>
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{asset.department}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">
                {formatDateYMD(asset.warrantyExpiry)}
              </TableCell>
              <TableCell className="p-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(asset)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={() => onTransfer?.(asset)}>
                      <MoreHorizontal className="w-4 h-4" />
                      Transfer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete?.(asset.id)}>
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
