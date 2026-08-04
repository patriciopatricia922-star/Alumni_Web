import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { logAction } from '../lib/auditLogger';
import AdminAccountManagementView from './Views/AdminAccountManagementView';

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

  // ── Permission-edit state ────────────────────────────────────────────────────
  // Stores the admin ID being edited (not the full object) to prevent stale
  // object references from closing the modal when admins[] re-renders.
  const [editPermUserId, setEditPermUserId] = useState(null);

  // Stats
  const [statsTotal,    setStatsTotal]    = useState(0);
  const [statsActive,   setStatsActive]   = useState(0);
  const [statsInactive, setStatsInactive] = useState(0);
  const [statsDisabled, setStatsDisabled] = useState(0);

  const PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [roleFilter, statusFilter, debouncedSearch]);

  // Fetch stats — depends on refreshTrigger so it re-runs after every
  // access toggle, keeping the Disabled Access counter in sync.
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
  }, [refreshTrigger]); // re-fetch whenever a toggle fires

  // Fetch admin list — module_permissions included in select
  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabaseAdmin
        .from('users')
        .select(
          'id, first_name, last_name, email, role, account_status, created_at, module_permissions',
          { count: 'exact' }
        )
        .in('role', ['admin', 'superadmin'])
        .order('created_at', { ascending: false })
        .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

      if (roleFilter === 'Admin')       q = q.eq('role', 'admin');
      if (roleFilter === 'Super Admin') q = q.eq('role', 'superadmin');

      if (statusFilter === 'Active')   q = q.eq('account_status', 'active');
      if (statusFilter === 'Inactive') q = q.eq('account_status', 'inactive');
      if (statusFilter === 'Disabled') q = q.eq('account_status', 'disabled');

      if (debouncedSearch.trim()) {
        q = q.or(
          `first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`
        );
      }

      const { data, count, error } = await q;
      if (error) throw error;

      // Fetch last login from audit_logs
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
    logAction({
      action:      'View',
      module:      'User Management',
      description: 'Accessed admin account management page',
    });
  }, [fetchStats]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // Toggle access
  const handleToggleAccess = async () => {
    if (!confirmUser) return;
    setConfirmLoading(true);
    try {
      const { user, currentEnabled } = confirmUser;
      const newStatus = currentEnabled ? 'disabled' : 'active';

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ account_status: newStatus })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { data: verifyData, error: verifyError } = await supabaseAdmin
        .from('users')
        .select('account_status')
        .eq('id', user.id)
        .single();

      if (!verifyError && verifyData.account_status !== newStatus) {
        console.error('Status mismatch! Expected:', newStatus, 'Got:', verifyData.account_status);
      }

      await logAction({
        action:      'Update',
        module:      'User Management',
        description: `${currentEnabled ? 'Disabled' : 'Enabled'} admin access for ${user.email}`,
        recordId:    user.id,
      });

      setConfirmUser(null);
      // Incrementing refreshTrigger causes both fetchAdmins and fetchStats
      // to re-run (via their useCallback deps), so all counters stay in sync.
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('toggleAccess error:', err);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCreateAdmin   = ()  => setShowCreate(true);
  const handleCloseCreate   = ()  => setShowCreate(false);
  const handleAdminCreated  = ()  => setRefreshTrigger(prev => prev + 1);
  const handleConfirmToggle = (user, currentEnabled) => setConfirmUser({ user, currentEnabled });
  const handleCloseConfirm  = ()  => setConfirmUser(null);

  // ── Permission-edit handlers ─────────────────────────────────────────────────

  /** Open the edit modal — store only the ID, not the full object reference */
  const handleOpenEditPerm = useCallback((admin) => {
    setEditPermUserId(admin.id);
  }, []);

  /** Close without saving */
  const handleCloseEditPerm = useCallback(() => {
    setEditPermUserId(null);
  }, []);

  /**
   * Called by EditPermissionsModal on successful save.
   * Patches the local `admins` array in-place so the permissions column
   * updates instantly without a full re-fetch.
   *
   * NOTE: does NOT close the modal here — the modal calls onClose() itself
   * after onSaved(), so closing is handled exactly once via handleCloseEditPerm.
   */
  const handlePermSaved = useCallback((updatedAdmin) => {
    setAdmins(prev =>
      prev.map(a =>
        a.id === updatedAdmin.id
          ? { ...a, module_permissions: updatedAdmin.module_permissions }
          : a
      )
    );
    // Do NOT call setEditPermUserId(null) here — the modal's own onClose prop
    // (handleCloseEditPerm) will fire after this callback and close cleanly.
  }, []);

  // Derive the full admin object from the stable ID so the modal always gets
  // a fresh reference from the current admins array, not a stale closure.
  const editPermUser = editPermUserId
    ? admins.find(a => a.id === editPermUserId) ?? null
    : null;

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const startEntry = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endEntry   = Math.min(page * PER_PAGE, total);

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
      // permission-edit props
      editPermUser={editPermUser}
      handleOpenEditPerm={handleOpenEditPerm}
      handleCloseEditPerm={handleCloseEditPerm}
      handlePermSaved={handlePermSaved}
    />
  );
};

export default AdminAccountManagement;