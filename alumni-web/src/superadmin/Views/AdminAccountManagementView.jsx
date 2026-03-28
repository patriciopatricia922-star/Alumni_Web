import React from 'react';
import SuperAdSidebar from '../SuperAdsidebar';
import { formatDate, roleLabel, statusBadge, isEnabled } from '../../utils/adminHelpers';
import StatCard from '../components/StatCard';
import FilterDropdown from '../components/FilterDropdown';
import CreateAdminModal from '../components/CreateAdminModal';
import ConfirmModal from '../components/ConfirmModal';
import '../styles/AdminAccountManagement.css';

const AdminAccountManagementView = ({
  admins,
  loading,
  total,
  page,
  setPage,
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  showCreate,
  confirmUser,
  confirmLoading,
  statsTotal,
  statsActive,
  statsInactive,
  statsDisabled,
  totalPages,
  startEntry,
  endEntry,
  handleToggleAccess,
  handleCreateAdmin,
  handleCloseCreate,
  handleAdminCreated,
  handleConfirmToggle,
  handleCloseConfirm,
}) => {
  return (
    <>
      <div className="admin-management-layout">
        <SuperAdSidebar activePage="admin-management" />

        <main className="admin-management-main">
          {/* Page header */}
          <div className="admin-page-header">
            <div>
              <h1>Admin Account Management</h1>
              <p>Manage and monitor admin accounts</p>
            </div>
            <button className="create-admin-btn" onClick={handleCreateAdmin}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.33" strokeLinecap="round"/>
              </svg>
              Create New Admin
            </button>
          </div>

          {/* Stat Cards */}
            <div style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            }}>
            <StatCard
                title="Admin Accounts"
                value={String(statsTotal)}
                subtitle="Total admins"
                subtitleColor="#155DFC"
                iconBg="#EFF6FF"
                iconType="accounts"
            />
            <StatCard
                title="Active Admins"
                value={String(statsActive)}
                subtitle="Active admin accounts"
                subtitleColor="#DAA520"
                iconBg="rgba(217,202,129,0.35)"
                iconType="active"
            />
            <StatCard
                title="Inactive Admins"
                value={String(statsInactive)}
                subtitle="Nothing for now"
                subtitleColor="#BF0000"
                iconBg="#FFE2E2"
                iconType="inactive"
            />
            <StatCard
                title="Disabled Access"
                value={String(statsDisabled)}
                subtitle="Admin access disabled"
                subtitleColor="#666666"
                iconBg="rgba(98,98,98,0.13)"
                iconType="disabled"
            />
            </div>

          {/* Search & Filter */}
          <div className="search-filter-card">
            <div className="search-filter-title">Search & Filter</div>
            <div className="search-filter-subtitle">Find and filter admin accounts</div>
            <div className="search-filter-controls">
              <div className="search-input-wrapper">
                <span className="search-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.33"/>
                    <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round"/>
                    </svg>
                </span>
                <input
                    type="search"
                    name="search-admins"
                    id="search-admins"
                    autoComplete="off"
                    placeholder="Search by name, email, or department..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                />
                </div>
              <div className="filter-dropdown-wrapper">
                <FilterDropdown
                  value={roleFilter}
                  options={['All Roles', 'Admin', 'Super Admin']}
                  onChange={setRoleFilter}
                  placeholder="All Roles"
                />
              </div>
              <div className="filter-dropdown-wrapper">
                <FilterDropdown
                  value={statusFilter}
                  options={['All Status', 'Active', 'Inactive', 'Disabled']}
                  onChange={setStatusFilter}
                  placeholder="All Status"
                />
              </div>
            </div>
          </div>

          {/* Admin Accounts Table */}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Admin Accounts ({total})</div>
              <div className="table-subtitle">All administrative users in the system</div>
            </div>

            {loading ? (
              <div className="loading-state">Loading…</div>
            ) : admins.length === 0 ? (
              <div className="empty-state">No admin accounts found.</div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Created By</th>
                        <th>Date Created</th>
                        <th className="access-column">Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin, index) => {
                        const badge = statusBadge(admin.account_status);
                        const enabled = isEnabled(admin);
                        return (
                          <tr key={admin.id} className={index < admins.length - 1 ? 'table-row-border' : ''}>
                            <td className="full-name-cell">
                              {[admin.first_name, admin.last_name].filter(Boolean).join(' ') || '—'}
                            </td>
                            <td className="email-cell" title={admin.email}>
                              {admin.email || '—'}
                            </td>
                            <td>
                              <span className={`role-badge ${admin.role === 'superadmin' ? 'superadmin-role' : 'admin-role'}`}>
                                {roleLabel(admin.role)}
                              </span>
                            </td>
                            <td>
                              <span className="status-badge" style={{ background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            </td>
                            <td>{admin.last_login ? formatDate(admin.last_login) : '—'}</td>
                            <td>System</td>
                            <td>{formatDate(admin.created_at)}</td>
                            <td className="access-cell">
                              <button
                                onClick={() => handleConfirmToggle(admin, enabled)}
                                className={`access-toggle-btn ${enabled ? 'enabled' : 'disabled'}`}
                              >
                                {enabled ? 'Enabled' : 'Disabled'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination-container">
                  <span className="pagination-info">
                    Showing {startEntry} to {endEntry} of {total} entries
                  </span>
                  <div className="pagination-controls">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="pagination-btn"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                          acc.push(<span key={`g${p}`} className="pagination-dots">…</span>);
                        }
                        acc.push(
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`pagination-number ${p === page ? 'active' : ''}`}
                          >
                            {p}
                          </button>
                        );
                        return acc;
                      }, [])}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showCreate && (
        <CreateAdminModal
          onClose={handleCloseCreate}
          onCreated={handleAdminCreated}
        />
      )}

      {confirmUser && (
        <ConfirmModal
          user={confirmUser.user}
          currentEnabled={confirmUser.currentEnabled}
          onClose={handleCloseConfirm}
          onConfirm={handleToggleAccess}
          loading={confirmLoading}
        />
      )}
    </>
  );
};

export default AdminAccountManagementView;