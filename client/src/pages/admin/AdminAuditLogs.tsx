import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '../../context/AuthContext';
import {
  ADMIN_AUDIT_LOGS_QUERY,
  type AdminAuditLogsQueryData,
} from '../../graphql/mutations/adminMutations';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ScrollText } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  USER_ROLE_CHANGED: 'Role Changed',
  USER_ACTIVATED: 'User Activated',
  USER_DEACTIVATED: 'User Deactivated',
  JOB_ACTIVATED: 'Job Activated',
  JOB_DEACTIVATED: 'Job Deactivated',
  JOB_DELETED: 'Job Deleted',
};

const ACTION_COLORS: Record<string, string> = {
  USER_ROLE_CHANGED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  USER_ACTIVATED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  USER_DEACTIVATED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  JOB_ACTIVATED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  JOB_DEACTIVATED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  JOB_DELETED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const formatDate = (value: string) => {
  // Backend may return timestamp string or ISO
  const date = /^\d+$/.test(value) ? new Date(parseInt(value)) : new Date(value);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminAuditLogs = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');

  const { data, loading, error } = useQuery<AdminAuditLogsQueryData>(
    ADMIN_AUDIT_LOGS_QUERY,
    {
      variables: {
        adminId: user?.id,
        page,
        limit: 15,
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
      },
      skip: !user?.id,
      fetchPolicy: 'network-only',
    }
  );

  const logs = data?.adminAuditLogs?.logs || [];
  const pageInfo = data?.adminAuditLogs?.pageInfo;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ScrollText className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          value={actionFilter || 'all'}
          onValueChange={(val) => {
            setActionFilter(val === 'all' ? '' : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="USER_ROLE_CHANGED">Role Changed</SelectItem>
            <SelectItem value="USER_ACTIVATED">User Activated</SelectItem>
            <SelectItem value="USER_DEACTIVATED">User Deactivated</SelectItem>
            <SelectItem value="JOB_ACTIVATED">Job Activated</SelectItem>
            <SelectItem value="JOB_DEACTIVATED">Job Deactivated</SelectItem>
            <SelectItem value="JOB_DELETED">Job Deleted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={targetTypeFilter || 'all'}
          onValueChange={(val) => {
            setTargetTypeFilter(val === 'all' ? '' : val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All targets" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All targets</SelectItem>
            <SelectItem value="User">User</SelectItem>
            <SelectItem value="Job">Job</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-destructive">
          Failed to load audit logs: {error.message}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p>No audit logs found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && logs.length > 0 && (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left p-4 font-medium">Action</th>
                      <th className="text-left p-4 font-medium">Details</th>
                      <th className="text-left p-4 font-medium">Actor</th>
                      <th className="text-left p-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border last:border-0">
                        <td className="p-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              ACTION_COLORS[log.action] ||
                              'bg-muted text-muted-foreground'
                            }`}
                          >
                            {ACTION_LABELS[log.action] || log.action}
                          </span>
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="text-sm leading-relaxed">{log.details}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {log.targetType}
                          </p>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {log.actor?.name || '—'}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={!pageInfo.hasPreviousPage}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageInfo.currentPage} of {pageInfo.totalPages}
                {' · '}
                {pageInfo.totalCount} total
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pageInfo.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminAuditLogs;