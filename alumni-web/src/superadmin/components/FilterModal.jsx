import React, { useState } from "react";
import "./FilterModal.css";

const FilterModal = ({
  filters,
  onApply,
  onClear,
  onClose,
  availablePrograms,
  availableBatches,
  employmentOptions,
  surveyOptions,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleClear = () => {
    setLocalFilters({
      program: "",
      batch: "",
      employmentStatus: "",
      surveyStatus: "",
    });
    onClear();
  };

  return (
    <div className="filter-modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
        <div className="filter-modal-header">
          <h3>Filter Alumni</h3>
          <button className="filter-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="filter-modal-body">
          {/* Program Filter */}
          <div className="filter-group">
            <label className="filter-label">Program</label>
            <select
              className="filter-select"
              value={localFilters.program}
              onChange={(e) => handleChange("program", e.target.value)}
            >
              <option value="">All Programs</option>
              {availablePrograms.map((program) => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div className="filter-group">
            <label className="filter-label">Batch Year</label>
            <select
              className="filter-select"
              value={localFilters.batch}
              onChange={(e) => handleChange("batch", e.target.value)}
            >
              <option value="">All Batches</option>
              {availableBatches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </div>

          {/* Employment Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Employment Status</label>
            <select
              className="filter-select"
              value={localFilters.employmentStatus}
              onChange={(e) => handleChange("employmentStatus", e.target.value)}
            >
              <option value="">All Statuses</option>
              {employmentOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Survey Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Survey Status</label>
            <select
              className="filter-select"
              value={localFilters.surveyStatus}
              onChange={(e) => handleChange("surveyStatus", e.target.value)}
            >
              <option value="">All Statuses</option>
              {surveyOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-modal-footer">
          <button className="filter-btn-clear" onClick={handleClear}>
            Clear All
          </button>
          <div className="filter-actions">
            <button className="filter-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="filter-btn-apply" onClick={handleApply}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;