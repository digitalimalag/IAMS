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
import { Issue } from '@/lib/mock-data';
import { getIssueDisplayId } from '@/lib/issues';
import { formatDateYMD } from '@/lib/date';
import { MoreHorizontal, Edit, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface IssueTableProps {
  issues: Issue[];
  onEdit?: (issue: Issue) => void;
  onDelete?: (id: string) => void;
}

export function IssueTable({ issues, onEdit, onDelete }: IssueTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'In Progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      case 'In Progress':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'Resolved':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20';
      case 'Low':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20';
      default:
        return '';
    }
  };

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        No issues found matching your filters.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Ticket ID</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Subject</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Priority</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Assigned To</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Designation</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Created</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Department</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow 
              key={issue.id}
              className="border-b hover:bg-muted/40 transition-colors"
            >
              <TableCell className="p-3 font-mono font-medium text-sm">{getIssueDisplayId(issue)}</TableCell>
              <TableCell className="p-3 font-medium max-w-xs truncate">{issue.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`gap-2 ${getStatusColor(issue.status)}`}>
                  {getStatusIcon(issue.status)}
                  {issue.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
              </TableCell>
              <TableCell className="p-3 text-sm">{issue.assignedTo}</TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">
                <span className="block max-w-[180px] truncate">{issue.designation || '-'}</span>
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">
                {formatDateYMD(issue.createdDate)}
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">
                {formatDateYMD(issue.dueDate)}
              </TableCell>
              <TableCell className="p-3 text-sm text-muted-foreground">{issue.department}</TableCell>
              <TableCell className="p-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={() => onEdit?.(issue)}>
                      <Edit className="w-4 h-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete?.(issue.id)}>
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
