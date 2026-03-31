import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import DetailedAuditLogsView from './Views/DetailedAuditLogsView';
import { logAction } from '../lib/auditLogger';

const PER_PAGE = 10;


const roleMap = {
  'All Roles': null,
  'Super Admin': 'superadmin',  
  'Admin': 'admin',
  'Alumni': 'alumni'
};

const actionMap = {
  'All Actions': null,
  'Create': 'Create',
  'Update': 'Update',
  'Delete': 'Delete',
  'Login': 'Login',
  'Export': 'Export',
  'Archive': 'Archive'
};

const moduleMap = {
  'All Modules': null,
  'Alumni Profile': 'Alumni Profile',
  'Events': 'Events',
  'Donations': 'Donations',
  'User Management': 'User Management',
  'Survey': 'Survey',
  'Announcements': 'Announcements'
};

const statusMap = {
  'All': null,
  'Success': 'Success',
  'Failed': 'Failed'
};

const DetailedAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('All Roles');
  const [selectedAction, setSelectedAction] = useState('All Actions');
  const [selectedModule, setSelectedModule] = useState('All Modules');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const [itemsPerPage, setItemsPerPage] = useState(10); 
  const PER_PAGE = itemsPerPage;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch, dateRange]);

  // Helper to build date filter
  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        return { operator: 'gte', value: todayStart };
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
        return { operator: 'gte', value: weekAgo };
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
        return { operator: 'gte', value: monthAgo };
      default:
        return null;
    }
  };

  // Format date helper
  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('id, created_at, user_email, user_role, action, module, description, record_id, status', { 
          count: 'exact',
          head: false 
        })
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      // Apply filters - using mapped values
      const dbRole = roleMap[selectedRole];
      if (dbRole) {
        query = query.eq('user_role', dbRole);
      }
      
      const dbAction = actionMap[selectedAction];
      if (dbAction) {
        query = query.eq('action', dbAction);
      }
      
      const dbModule = moduleMap[selectedModule];
      if (dbModule) {
        query = query.eq('module', dbModule);
      }
      
      const dbStatus = statusMap[selectedStatus];
      if (dbStatus) {
        query = query.eq('status', dbStatus);
      }
      
      // Apply date range filter
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter.value);
      }
      
      // Apply search filter
      if (debouncedSearch.trim()) {
        query = query.or(
          `user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      
      setLogs(data || []);
      setTotal(count || 0);
    } catch (err) {
      console.error('Audit logs fetch error:', err.message);
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, selectedRole, selectedAction, selectedModule, selectedStatus, debouncedSearch, dateRange]);

   useEffect(() => {
    setPage(1);
    fetchLogs();
  }, [itemsPerPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Export CSV
  const handleExport = async () => {
    await logAction({
      action: 'Export',
      module: 'Audit Logs',
      description: `Exported audit logs`,
      status: 'Success'
    });
    
    try {
      let query = supabase
        .from('audit_logs')
        .select('id,created_at,user_email,user_role,action,module,description,record_id,status')
        .order('created_at', { ascending: false });

      const dbRole = roleMap[selectedRole];
      if (dbRole) {
        query = query.eq('user_role', dbRole);
      }
      
      const dbAction = actionMap[selectedAction];
      if (dbAction) {
        query = query.eq('action', dbAction);
      }
      
      const dbModule = moduleMap[selectedModule];
      if (dbModule) {
        query = query.eq('module', dbModule);
      }
      
      const dbStatus = statusMap[selectedStatus];
      if (dbStatus) {
        query = query.eq('status', dbStatus);
      }
      
      const dateFilter = getDateFilter();
      if (dateFilter) {
        query = query.gte('created_at', dateFilter.value);
      }
      
      if (debouncedSearch.trim()) {
        query = query.or(
          `user_email.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%,record_id.ilike.%${debouncedSearch}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      const headers = ['ID', 'Date', 'User Email', 'Role', 'Action', 'Module', 'Description', 'Record ID', 'Status'];
      const rows = (data || []).map(r => [
        r.id, formatDate(r.created_at), r.user_email, r.user_role,
        r.action, r.module, `"${(r.description || '').replace(/"/g, '""')}"`,
        r.record_id, r.status,
      ]);
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err.message);
    }
  };

  // Reset filters
  const handleReset = async () => {
    await logAction({
      action: 'Update',
      module: 'Audit Logs',
      description: 'Reset all audit log filters',
      status: 'Success'
    });
    
    setSelectedRole('All Roles');
    setSelectedAction('All Actions');
    setSelectedModule('All Modules');
    setSelectedStatus('All');
    setSearchQuery('');
    setDateRange('all');
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startEntry = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry = Math.min(page * PER_PAGE, total);

  const filterOptions = {
    roles: ['All Roles', 'Super Admin', 'Admin', 'Alumni'],
    actions: ['All Actions', 'Create', 'Update', 'Delete', 'Login', 'Export', 'Archive'],
    modules: ['All Modules', 'Alumni Profile', 'Events', 'Donations', 'User Management', 'Survey', 'Announcements'],
    statuses: ['All', 'Success', 'Failed'],
    dateRanges: ['All', 'Today', 'Last 7 Days', 'Last 30 Days']
  };

  return (
  <DetailedAuditLogsView
    logs={logs}
    total={total}
    page={page}
    setPage={setPage}
    loading={loading}
    selectedRole={selectedRole}
    setSelectedRole={setSelectedRole}
    selectedAction={selectedAction}
    setSelectedAction={setSelectedAction}
    selectedModule={selectedModule}
    setSelectedModule={setSelectedModule}
    selectedStatus={selectedStatus}
    setSelectedStatus={setSelectedStatus}
    searchQuery={searchQuery}
    setSearchQuery={setSearchQuery}
    dateRange={dateRange}
    setDateRange={setDateRange}
    handleExport={handleExport}
    handleReset={handleReset}
    formatDate={formatDate}
    startEntry={startEntry}
    endEntry={endEntry}
    totalPages={totalPages}
    filterOptions={filterOptions}
    PER_PAGE={PER_PAGE}              
    setItemsPerPage={setItemsPerPage} 
  />
);
};

export default DetailedAuditLogs;