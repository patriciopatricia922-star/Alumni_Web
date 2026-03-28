import React from "react";
import SuperAdSidebar from '../SuperAdsidebar';
import AlumniProfileModal from "../components/AlumniProfileModal";
import FilterModal from "../components/FilterModal";
import {
  IconUsers,
  IconSurveyDone,
  IconSurveyPending,
  IconSearch,
  IconFilter,
  IconExport,
  EmpBadge,
  SurveyBadge,
  AccountBadge,
} from "../components/AlumniComponents";
import "../styles/SuperAdminAlumni.css";

const SuperAdminAlumniView = ({
  alumni,
  allAlumni,
  search,
  onSearch,
  stats,
  completedPct,
  pendingPct,
  totalAlumni,
  page,
  totalPages,
  startEntry,
  endEntry,
  filteredLength,
  selectedAlumni,
  onSelectAlumni,
  onCloseModal,
  onPrevPage,
  onNextPage,
  onGoToPage,
  onOpenFilter,
  onExport,
  showFilterModal,
  onCloseFilter,
  onApplyFilters,
  onClearFilters,
  filters,
  availablePrograms,
  availableBatches,
  employmentOptions,
  surveyOptions,
  hasActiveFilters,
}) => {
  return (
    <>
      <SuperAdSidebar />

      <div className="sam-page">
        <div className="am-heading-row">
          <div>
            <h1 className="am-title">Alumni Module</h1>
            <p className="am-subtitle">View, organize, and manage alumni data and activities.</p>
          </div>
        </div>

        <div className="am-metrics">
          <div className="am-metric-card">
            <div className="am-metric-left">
              <p className="am-metric-label">Active Accounts</p>
              <p className="am-metric-value">{stats.active}</p>
              <p className="am-metric-sub">of {totalAlumni} total</p>
            </div>
            <div className="am-metric-icon am-icon-blue">
              <IconUsers color="#155DFC" />
            </div>
          </div>

          <div className="am-metric-card">
            <div className="am-metric-left">
              <p className="am-metric-label">Inactive Accounts</p>
              <p className="am-metric-value">{stats.deactivated}</p>
              <p className="am-metric-sub">of {totalAlumni} total</p>
            </div>
            <div className="am-metric-icon am-icon-orange">
              <IconUsers color="#FCC271" />
            </div>
          </div>

          <div className="am-metric-card">
            <div className="am-metric-left">
              <p className="am-metric-label">Survey Completed</p>
              <p className="am-metric-value">{completedPct}%</p>
              <p className="am-metric-sub">{stats.completed} alumni</p>
            </div>
            <div className="am-metric-icon am-icon-green">
              <IconSurveyDone color="#00A63E" />
            </div>
          </div>

          <div className="am-metric-card">
            <div className="am-metric-left">
              <p className="am-metric-label">Survey Pending</p>
              <p className="am-metric-value">{stats.pending}</p>
              <p className="am-metric-sub">{pendingPct}% of total</p>
            </div>
            <div className="am-metric-icon am-icon-red">
              <IconSurveyPending color="#DF7171" />
            </div>
          </div>
        </div>

        <div className="am-table-card">
          <div className="am-toolbar">
            <div className="am-search-wrap">
              <IconSearch />
              <input
                type="text"
                placeholder="Search by name, email, or program..."
                value={search}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            <div className="am-toolbar-btns">
              <button className={`am-tb-btn ${hasActiveFilters ? "active-filter" : ""}`} onClick={onOpenFilter}>
                <IconFilter /> Filter
                {hasActiveFilters && <span className="filter-badge"></span>}
              </button>
              <button className="am-tb-btn" onClick={onExport}>
                <IconExport /> Export
              </button>
            </div>
          </div>

          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="am-col-batch">Batch</th>
                  <th className="am-col-program">Program</th>
                  <th className="tc">Employment Status</th>
                  <th className="tc am-col-survey">Survey Status</th>
                  <th className="tc am-col-account">Account Status</th>
                </tr>
              </thead>
              <tbody>
                {alumni.length === 0 ? (
                  <tr className="am-empty">
                    <td colSpan="6">No alumni records found.</td>
                  </tr>
                ) : (
                  alumni.map((a) => (
                    <tr key={a.id} className="apm-row-clickable" onClick={() => onSelectAlumni(a)}>
                      <td>
                        <div className="am-name-cell">
                          <div className="am-avatar">
                            {(a.name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="am-name-stack">
                            <span className="am-name">{a.name}</span>
                            <span className="am-email">{a.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="am-col-batch">
                        {a.batch !== "—" ? (
                          <span className="am-batch">{a.batch}</span>
                        ) : (
                          <span style={{ color: "#CBD5E1" }}>—</span>
                        )}
                      </td>
                      <td className="am-col-program">{a.program || "—"}</td>
                      <td className="tc">
                        <EmpBadge status={a.employment_status} />
                      </td>
                      <td className="tc am-col-survey">
                        <SurveyBadge status={a.survey_status} />
                      </td>
                      <td className="tc am-col-account">
                        <AccountBadge status={a.account_status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="am-footer">
            <span className="am-footer-text">
              Showing {startEntry} to {endEntry} of {filteredLength} entries
            </span>
            <div className="am-pages">
              <button className="am-pg-btn" disabled={page === 1} onClick={onPrevPage}>
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) {
                    acc.push(<span key={`g${p}`} className="pagination-dots">…</span>);
                  }
                  acc.push(
                    <button key={p} className={`am-pg-btn ${p === page ? "on" : ""}`} onClick={() => onGoToPage(p)}>
                      {p}
                    </button>
                  );
                  return acc;
                }, [])}
              <button className="am-pg-btn" disabled={page === totalPages} onClick={onNextPage}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedAlumni && (
        <AlumniProfileModal alumni={selectedAlumni} onClose={onCloseModal} />
      )}

      {showFilterModal && (
        <FilterModal
          filters={filters}
          onApply={onApplyFilters}
          onClear={onClearFilters}
          onClose={onCloseFilter}
          availablePrograms={availablePrograms}
          availableBatches={availableBatches}
          employmentOptions={employmentOptions}
          surveyOptions={surveyOptions}
        />
      )}
    </>
  );
};

export default SuperAdminAlumniView;