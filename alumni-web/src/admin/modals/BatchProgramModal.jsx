import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { supabase } from '../../lib/supabase'; // adjust path to match your project

// Pulls distinct Batch (year graduated) or Program (degree/track) values
// from survey_progress — mirrors the extraction logic used for the PDF/CSV
// export filter picker in ResponseAnalyticsView, so the options here always
// match what admins see when exporting. Handles both college and SHS schemas.

const extractYear = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    const match = value.match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : null;
  }
  const date = new Date(value);
  return !isNaN(date.getTime()) ? String(date.getFullYear()) : null;
};

const BatchProgramModal = ({ open, onClose, filterType, onSelect, selectedValue, alumniType }) => {
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('survey_progress')
        .select('educational_background_data, shs_personal_background_data');

      if (error) throw error;

      const isShs = alumniType === 'shs';
      const values = new Set();

      (data || []).forEach((row) => {
        if (filterType === 'batch') {
          const edu = (isShs ? row.shs_personal_background_data : row.educational_background_data) || {};
          const year = isShs
            ? String(edu.year_graduated || '').replace(/\D/g, '')
            : extractYear(edu.year_graduated);
          if (year) values.add(year);
        } else {
          const edu = (isShs ? row.shs_personal_background_data : row.educational_background_data) || {};
          const program = isShs ? edu.track_strand : edu.degree_program;
          if (program && String(program).trim()) values.add(String(program).trim());
        }
      });

      const sorted = [...values].sort((a, b) =>
        filterType === 'batch' ? Number(b) - Number(a) : a.localeCompare(b)
      );
      setOptions(sorted);
    } catch (err) {
      console.error('[BatchProgramModal] fetch error:', err);
      setError('Failed to load options.');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [filterType, alumniType]);

  useEffect(() => {
    if (open) {
      setSearch('');
      fetchOptions();
    }
  }, [open, fetchOptions]);

  if (!open) return null;

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(search.trim().toLowerCase())
  );

  const title = filterType === 'batch' ? 'Select Batch' : 'Select Program';

  return (
    <div className="cm-modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="cm-modal cm-user-picker-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={16} />
        </button>
        <h2 className="cm-modal-title">{title}</h2>
        <p className="cm-modal-subtitle">
          {filterType === 'batch'
            ? 'Choose a graduating batch to target this announcement to.'
            : 'Choose a degree program / track to target this announcement to.'}
        </p>

        <div className="cm-user-search-wrap">
          <FiSearch size={14} className="cm-user-search-icon" />
          <input
            className="cm-input cm-user-search-input"
            placeholder={filterType === 'batch' ? 'Search batch year…' : 'Search program…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cm-user-list">
          {loading && <div className="cm-user-list-status">Loading…</div>}
          {!loading && error && <div className="cm-user-list-status cm-user-list-error">{error}</div>}
          {!loading && !error && filtered.length === 0 && (
            <div className="cm-user-list-status">
              No {filterType === 'batch' ? 'batches' : 'programs'} found.
            </div>
          )}
          {!loading && !error && filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`cm-user-row ${selectedValue === opt ? 'active' : ''}`}
              onClick={() => { onSelect(opt); onClose(); }}
            >
              <div className="cm-user-info">
                <div className="cm-user-name">{filterType === 'batch' ? `Batch ${opt}` : opt}</div>
              </div>
              {selectedValue === opt && <span className="cm-user-selected-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BatchProgramModal;