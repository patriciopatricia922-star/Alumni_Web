import React, { useRef, useEffect } from 'react';
import SuperAdsidebar from '../SuperAdsidebar';
import { 
  FiSearch, 
  FiRotateCcw, 
  FiDownload, 
  FiChevronLeft, 
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiDatabase,
  FiUser,
  FiFolder,
  FiActivity,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import './DetailedAuditLogs.css';

const Tag = ({ label, tagColors }) => {
  const colors = tagColors[label] || { bg: '#F3F4F6', color: '#374151' };
  return (
    <span className="audit-tag" style={{ background: colors.bg, color: colors.color }}>
      {label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const isSuccess = status === 'Success';
  return (
    <span className={`audit-status-badge ${isSuccess ? 'success' : 'failed'}`}>
      {isSuccess ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
      {status}
    </span>
  );
};

const DetailedAuditLogsView = ({
  logs,
  total,
  page,
  setPage,
  loading,
  selectedRole,
  setSelectedRole,
  selectedAction,
  setSelectedAction,
  selectedModule,
  setSelectedModule,
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  handleExport,
  handleReset,
  formatDate,
  startEntry,
  endEntry,
  totalPages,
  PER_PAGE,            
  setItemsPerPage,    
  filterOptions,
}) => {
  const tableWrapperRef = useRef(null);
  const scrollPositionRef = useRef(0);
  
  useEffect(() => {
    if (tableWrapperRef.current) {
      tableWrapperRef.current.scrollTop = scrollPositionRef.current;
    }
  }, [page, logs]);
  
  const handlePageChange = (newPage) => {
    if (tableWrapperRef.current) {
      scrollPositionRef.current = tableWrapperRef.current.scrollTop;
    }
    setPage(newPage);
  };

  const tagColors = {
    'Update': { bg: '#DBEAFE', color: '#1D4ED8' },
    'Login': { bg: '#EDE9FE', color: '#6D28D9' },
    'Create': { bg: '#DCFCE7', color: '#15803D' },
    'Delete': { bg: '#FEE2E2', color: '#B91C1C' },
    'Super Admin': { bg: '#FFEDD5', color: '#C2410C' },
    'Admin': { bg: '#FEF9C3', color: '#A16207' },
    'Alumni': { bg: '#E0E7FF', color: '#3730A3' },
    'Export': { bg: '#F0FDF4', color: '#15803D' },
    'Archive': { bg: '#FFF7ED', color: '#C2410C' },
  };

  // Ref for the table container to scroll to it after page change
  const tableContainerRef = useRef(null);


  // Scroll to top of table when page changes
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  return (
    <div className="audit-layout">
      <SuperAdsidebar activePage="audit-logs" />

      <main className="audit-main">
        {/* Header */}
        {/* Header with Stats */}
        <div className="audit-header">
          <div className="audit-header-left">
            <h1 className="audit-title">Detailed Audit Logs</h1>
            <p className="audit-subtitle">Complete audit trail of all system activities and operations</p>
          </div>
          <div className="audit-header-right">
            <div className="audit-header-stats">
              <span className="audit-header-stat">
                <FiDatabase size={12} />
                {total.toLocaleString()} records
              </span>
              <span className="audit-header-stat">
                <FiClock size={12} />
                Showing {startEntry}–{endEntry}
              </span>
              <span className="audit-header-stat">
                <FiActivity size={12} />
                Archived after 90d
              </span>
            </div>
            <button className="audit-btn-outline" onClick={handleExport}>
              <FiDownload size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="audit-filters-bar">
          <div className="audit-search-wrapper">
            <FiSearch size={16} className="audit-search-icon" />
            <input
              type="text"
              className="audit-search-input"
              placeholder="Search by user, description, or record ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="audit-filter-group">
            <select className="audit-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              {filterOptions.roles.map(option => <option key={option}>{option}</option>)}
            </select>
            <select className="audit-select" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
              {filterOptions.actions.map(option => <option key={option}>{option}</option>)}
            </select>
            <select className="audit-select" value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              {filterOptions.modules.map(option => <option key={option}>{option}</option>)}
            </select>
            <select className="audit-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              {filterOptions.statuses.map(option => <option key={option}>{option}</option>)}
            </select>
            <select className="audit-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
            <button className="audit-btn-reset" onClick={handleReset}>
              <FiRotateCcw size={14} /> Reset
            </button>
            
            <div className="audit-page-size">
              <span className="audit-page-size-label">Show:</span>
              <select 
                className="audit-page-size-select"
                value={PER_PAGE}
                onChange={(e) => {
                  // Save current scroll position
                  if (tableWrapperRef.current) {
                    scrollPositionRef.current = tableWrapperRef.current.scrollTop;
                  }
                  setItemsPerPage(parseInt(e.target.value));
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        

        {/* Table Container with ref */}
        <div ref={tableContainerRef} className="audit-table-container">
          {loading ? (
            <div className="audit-loading">
              <div className="audit-loading-spinner"></div>
              <span>Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="audit-empty-state">
              <FiDatabase size={48} />
              <h4>No logs found</h4>
              <p>Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="audit-table-wrapper" ref={tableWrapperRef}>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Description</th>
                      <th>Record ID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="audit-cell-timestamp">
                          <FiCalendar size={12} className="timestamp-icon" />
                          {formatDate(log.created_at)}
                        </td>
                        <td className="audit-cell-user">
                          <FiUser size={12} className="user-icon" />
                          {log.user_email || '—'}
                        </td>
                        <td>{log.user_role ? <Tag label={log.user_role} tagColors={tagColors} /> : '—'}</td>
                        <td>{log.action || '—'}</td>
                        <td>
                          <FiFolder size={12} className="module-icon" />
                          {log.module || '—'}
                        </td>
                        <td className="audit-cell-description">{log.description || '—'}</td>
                        <td className="audit-cell-record-id">{log.record_id || '—'}</td>
                        <td>{log.status ? <StatusBadge status={log.status} /> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="audit-pagination">
                <div className="audit-pagination-info">
                  Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{total.toLocaleString()}</strong> entries
                </div>
                <div className="audit-pagination-controls">
                  <button
                    className="audit-pagination-btn"
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <FiChevronLeft size={14} /> Prev
                  </button>
                  
                  <div className="audit-pagination-pages">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      
                      if (endPage - startPage + 1 < maxVisible) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            className={`audit-pagination-number ${i === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(i)}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </div>

                  <button
                    className="audit-pagination-btn"
                    onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                  >
                    Next <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetailedAuditLogsView;