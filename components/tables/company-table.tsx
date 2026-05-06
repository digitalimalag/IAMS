'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Department } from '@/lib/mock-data';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DepartmentTableProps {
  departments: Department[];
}

export function CompanyTable({ departments }: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No departments found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Department Name</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Manager</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Email</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Phone</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Location</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Assets</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Devices</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Issues</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow 
              key={dept.id}
              className="border-border/50 hover:bg-muted/30 transition-colors"
            >
              <TableCell className="font-medium">{dept.name}</TableCell>
              <TableCell className="text-sm">{dept.manager}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{dept.email}</TableCell>
              <TableCell className="text-sm">{dept.phone}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{dept.location}</TableCell>
              <TableCell className="text-center font-medium">{dept.assetCount}</TableCell>
              <TableCell className="text-center font-medium">{dept.deviceCount}</TableCell>
              <TableCell className="text-center font-medium">{dept.issueCount}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive">
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
