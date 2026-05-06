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
import { Issue } from '@/lib/mock-data';
import { formatDateYMD } from '@/lib/date';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface RecentIssuesTableProps {
  issues: Issue[];
}

export function RecentIssuesTable({ issues }: RecentIssuesTableProps) {
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

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide">Title</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Status</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Priority</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Assigned To</TableHead>
            <TableHead className="text-xs uppercase tracking-wide">Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow 
              key={issue.id}
              className="border-b hover:bg-muted/40 transition-colors"
            >
              <TableCell className="p-3 font-medium">{issue.title}</TableCell>
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
                {formatDateYMD(issue.dueDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
