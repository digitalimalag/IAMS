import type { Session } from '@/lib/auth';
import type { Issue } from '@/lib/mock-data';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export const ISSUE_STORAGE_KEY = 'issues';

export type IssueDbRow = {
  id: string;
  organization_id: string;
  ticket_number?: string | null;
  title: string;
  description: string;
  status: Issue['status'];
  priority: Issue['priority'];
  asset_id: string | null;
  assigned_to: string | null;
  designation: string | null;
  created_by_user_id: string | null;
  created_by_profile_id: string | null;
  created_at: string;
  due_date: string | null;
  department: string | null;
  updated_at: string;
};

export type IssueInputLike = {
  title: string;
  description: string;
  status: Issue['status'];
  priority: Issue['priority'];
  assetId: string;
  assignedTo: string;
  designation: string;
  createdDate: string;
  dueDate: string;
  department: string;
};

export function getIssueDisplayId(issue: Pick<Issue, 'id' | 'ticketNumber'>) {
  return issue.ticketNumber?.trim() || issue.id;
}

export function generateIssueTicketNumber(existingIssues: Array<Pick<Issue, 'id' | 'ticketNumber'>>) {
  const year = new Date().getFullYear();
  const prefix = `ITI-${year}-`;
  const existingSequence = existingIssues.reduce((max, issue) => {
    const candidate = (issue.ticketNumber || issue.id || '').trim();
    if (!candidate.startsWith(prefix)) return max;
    const suffix = candidate.slice(prefix.length);
    const sequence = Number.parseInt(suffix, 10);
    return Number.isFinite(sequence) && sequence > max ? sequence : max;
  }, 0);

  return `${prefix}${String(existingSequence + 1).padStart(3, '0')}`;
}

export function canUseIssueSupabase(session: Session | null) {
  return isSupabaseConfigured() && Boolean(session?.organizationId?.trim());
}

export function getIssueOrganizationId(session: Session | null) {
  return session?.organizationId?.trim() || '';
}

export function issueRowToRecord(row: IssueDbRow): Issue {
  return {
    id: row.id,
    ticketNumber: row.ticket_number || '',
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assetId: row.asset_id || '',
    assignedTo: row.assigned_to || '',
    designation: row.designation || '',
    createdByUserId: row.created_by_user_id || undefined,
    createdDate: row.created_at?.split('T')[0] || '',
    dueDate: row.due_date || '',
    department: row.department || '',
  };
}

export function issueInputToPayload(
  values: IssueInputLike,
  session: Session | null,
  currentUserId?: string | null,
  ticketNumber?: string | null
) {
  return {
    organization_id: getIssueOrganizationId(session),
    title: values.title.trim(),
    description: values.description.trim(),
    status: values.status,
    priority: values.priority,
    asset_id: values.assetId === 'none' ? null : values.assetId || null,
    assigned_to: values.assignedTo.trim() || null,
    designation: values.designation.trim() || null,
    created_by_user_id: currentUserId || null,
    due_date: values.dueDate || null,
    department: values.department.trim() || null,
    ...(ticketNumber ? { ticket_number: ticketNumber.trim() } : {}),
  } as Record<string, unknown>;
}

export function getSupabaseIssuesClient() {
  return createSupabaseBrowserClient();
}
