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
import { NetworkDevice } from '@/lib/mock-data';
import { formatDateYMD, formatTimeHHmm } from '@/lib/date';
import { MoreHorizontal, Edit, Trash2, Wifi, WifiOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NetworkDeviceTableProps {
  devices: NetworkDevice[];
  onEdit?: (device: NetworkDevice) => void;
  onDelete?: (id: string) => void;
}

export function NetworkDeviceTable({ devices, onEdit, onDelete }: NetworkDeviceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Online':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'Offline':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'Error':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Online':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'Offline':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'Error':
        return <WifiOff className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CCTV: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
      Router: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
      Switch: 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20',
      'Access Point': 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-500/20',
    };
    return colors[type] || '';
  };

  if (devices.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No network devices found matching your filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Model</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Brand</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Type</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">IP Address</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">MAC Address</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Location</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Firmware</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Department</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Last Seen</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow 
              key={device.id}
              className="border-b hover:bg-muted/40 transition-colors"
            >
              <TableCell className="p-3 text-sm text-muted-foreground">{device.deviceModel || '-'}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{device.deviceBrand || '-'}</TableCell>
              <TableCell className="p-3 font-medium">{device.name}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getTypeColor(device.type)}>
                  {device.type}
                </Badge>
              </TableCell>
              <TableCell className="p-3 font-mono text-sm">{device.ipAddress}</TableCell>
              <TableCell className="p-3 font-mono text-sm text-muted-foreground">{device.macAddress}</TableCell>
              <TableCell className="p-3 text-sm">{device.location}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`gap-2 ${getStatusColor(device.status)}`}>
                  {getStatusIcon(device.status)}
                  {device.status}
                </Badge>
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{device.firmwareVersion}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{device.department}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">
                {formatDateYMD(device.lastSeen)} {formatTimeHHmm(device.lastSeen)}
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
                    <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(device)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete?.(device.id)}>
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
