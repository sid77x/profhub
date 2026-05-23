import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, Loader } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api';

interface AuditLog {
  id: string;
  admin_name: string;
  admin_email: string;
  action: string;
  resource_type: string;
  resource_name?: string;
  status: string;
  timestamp: string;
  details?: any;
}

interface AuditStats {
  total_actions: number;
  actions_today: number;
  actions_this_week: number;
  actions_by_admin: Record<string, number>;
}

interface AuditLogsProps {
  token: string;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ token }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadAuditData();
  }, [actionFilter, resourceTypeFilter]);

  const loadAuditData = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/audit-logs`, {
          headers,
          params: {
            action: actionFilter || undefined,
            resource_type: resourceTypeFilter || undefined,
            limit: 50
          }
        }),
        axios.get(`${API_URL}/admin/audit-stats`, { headers })
      ]);

      setLogs(logsRes.data);
      setStats(statsRes.data);
    } catch (error: any) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await axios.post(
        `${API_URL}/admin/audit-logs/export?days=30`,
        {},
        { headers }
      );

      // Create CSV file and download
      const csv = response.data.csv_data;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Exported ${response.data.record_count} audit logs`);
    } catch (error: any) {
      toast.error('Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith('view')) return 'bg-blue-100 text-blue-800';
    if (action.startsWith('delete')) return 'bg-red-100 text-red-800';
    if (action.startsWith('onboard')) return 'bg-green-100 text-green-800';
    if (action.startsWith('deboard')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const allActions = Array.from(new Set(logs.map(log => log.action)));
  const allResourceTypes = Array.from(new Set(logs.map(log => log.resource_type)));

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground">Total Actions</p>
            <p className="text-3xl font-bold mt-2">{stats.total_actions}</p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-3xl font-bold mt-2">{stats.actions_today}</p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground">This Week</p>
            <p className="text-3xl font-bold mt-2">{stats.actions_this_week}</p>
          </div>
          <div className="bg-card rounded-lg p-6 border border-border">
            <p className="text-sm text-muted-foreground">Active Admins</p>
            <p className="text-3xl font-bold mt-2">{Object.keys(stats.actions_by_admin).length}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium block mb-2">Action Type</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
            >
              <option value="">All Actions</option>
              {allActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Resource Type</label>
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-sm"
            >
              <option value="">All Resources</option>
              {allResourceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 w-full justify-center"
            >
              {exporting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No audit logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                  <th className="text-left py-3 px-4 font-semibold">Admin</th>
                  <th className="text-left py-3 px-4 font-semibold">Action</th>
                  <th className="text-left py-3 px-4 font-semibold">Resource</th>
                  <th className="text-left py-3 px-4 font-semibold">Target</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-xs">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium">{log.admin_name}</div>
                      <div className="text-xs text-muted-foreground">{log.admin_email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
                        {log.resource_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm max-w-xs truncate" title={log.resource_name}>
                      {log.resource_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Activity Breakdown */}
      {stats && Object.keys(stats.actions_by_admin).length > 0 && (
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="font-semibold mb-4">Activity by Admin</h3>
          <div className="space-y-2">
            {Object.entries(stats.actions_by_admin).map(([admin, count]) => (
              <div key={admin} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                <span className="text-sm">{admin}</span>
                <span className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded">
                  {count} action{count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
