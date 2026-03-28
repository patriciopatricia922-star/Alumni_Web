import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseadmin';
import { logAction } from '../lib/auditLogger';
import AdminAccountManagementView from './views/AdminAccountManagementView';

const AdminAccountManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showCreate, setShowCreate] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Stats
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsActive, setStatsActive] = useState(0);
  const [statsInactive, setStatsInactive] = useState(0);
  const [statsDisabled, setStatsDisabled] = useState(0);

  const PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [roleFilter, statusFilter, debouncedSearch]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    const { count: tot } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin']);
    setStatsTotal(tot ?? 0);

    const { count: act } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'active');
    setStatsActive(act ?? 0);

    const { count: inact } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'inactive');
    setStatsInactive(inact ?? 0);

    const { count: dis } = await supabaseAdmin
      .from('users').select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'superadmin'])
      .eq('account_status', 'disabled');
    setStatsDisabled(dis ?? 0);
  }, []);

  // Fetch admin list
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, email, role, account_status, created_at', { count: 'exact' })
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      if (roleFilter === 'Admin') q = q.eq('role', 'admin');
      if (roleFilter === 'Super Admin') q = q.eq('role', 'superadmin');

      if (statusFilter === 'Active') q = q.eq('account_status', 'active');
      if (statusFilter === 'Inactive') q = q.eq('account_status', 'inactive');
      if (statusFilter === 'Disabled') q = q.eq('account_status', 'disabled');

      if (debouncedSearch.trim()) {
        q = q.or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      const { data, count, error } = await q;
      if (error) throw error;

      // Fetch last login from audit_logs for each user
      const ids = (data || []).map(u => u.id);
      let lastLogins = {};
      if (ids.length > 0) {
        const { data: loginData } = await supabaseAdmin
          .from('audit_logs')
          .select('user_id, created_at')
          .eq('action', 'Login')
          .eq('status', 'Success')
          .in('user_id', ids)
          .order('created_at', { ascending: false });

        (loginData || []).forEach(l => {
          if (!lastLogins[l.user_id]) lastLogins[l.user_id] = l.created_at;
        });
      }

      setAdmins((data || []).map(u => ({ ...u, last_login: lastLogins[u.id] || null })));
      setTotal(count || 0);
    } catch (err) {
      console.error('fetchAdmins error:', err.message);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, debouncedSearch, refreshTrigger]);

  useEffect(() => {
    fetchStats();
    logAction({ action: 'View', module: 'User Management', description: 'Accessed admin account management page' });
  }, [fetchStats]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // Toggle access - Disable/Enable user using supabaseAdmin
  const handleToggleAccess = async () => {
    if (!confirmUser) return;
    setConfirmLoading(true);
    try {
      const { user, currentEnabled } = confirmUser;
      const newStatus = currentEnabled ? 'disabled' : 'active';
      
      console.log(`Attempting to update user ${user.id} from ${user.account_status} to ${newStatus}`);
      console.log('Using supabaseAdmin for update');
      
      // Update account status using supabaseAdmin to bypass RLS
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ account_status: newStatus })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      
      console.log('Update successful, new status should be:', newStatus);

      // Verify the update by fetching the updated user
      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('account_status')
        .eq('id', user.id)
        .single();
      
      if (!verifyError) {
        console.log('Verified new status from DB:', verifyData.account_status);
        
        if (verifyData.account_status !== newStatus) {
          console.error('Status mismatch! Expected:', newStatus, 'Got:', verifyData.account_status);
        }
      }

      await logAction({
        action: 'Update',
        module: 'User Management',
        description: `${currentEnabled ? 'Disabled' : 'Enabled'} admin access for ${user.email}`,
        recordId: user.id,
      });

      // Close modal and refresh data
      setConfirmUser(null);
      
      // Force immediate refresh
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
      console.error('toggleAccess error:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateAdmin = () => {
    setShowCreate(true);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
  };

  const handleAdminCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleConfirmToggle = (user, currentEnabled) => {
    setConfirmUser({ user, currentEnabled });
  };

  const handleCloseConfirm = () => {
    setConfirmUser(null);
  };

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startEntry = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry = Math.min(page * PER_PAGE, total);

  return (
    <AdminAccountManagementView
      admins={admins}
      loading={loading}
      total={total}
      page={page}
      setPage={setPage}
      search={search}
      setSearch={setSearch}
      roleFilter={roleFilter}
      setRoleFilter={setRoleFilter}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      showCreate={showCreate}
      confirmUser={confirmUser}
      confirmLoading={confirmLoading}
      statsTotal={statsTotal}
      statsActive={statsActive}
      statsInactive={statsInactive}
      statsDisabled={statsDisabled}
      PER_PAGE={PER_PAGE}
      totalPages={totalPages}
      startEntry={startEntry}
      endEntry={endEntry}
      handleToggleAccess={handleToggleAccess}
      handleCreateAdmin={handleCreateAdmin}
      handleCloseCreate={handleCloseCreate}
      handleAdminCreated={handleAdminCreated}
      handleConfirmToggle={handleConfirmToggle}
      handleCloseConfirm={handleCloseConfirm}
    />
  );
};

export default AdminAccountManagement;