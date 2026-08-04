import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { supabase } from '../../lib/supabase'; // adjust path to match your project

// NOTE: assumes your `users` table has `full_name` and `email` columns.
// You already query `users` with `id, role` in ContentManagement.js —
// adjust the column names below (e.g. `name` instead of `full_name`)
// if your schema differs.

const useDebouncedValue = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
};

const SpecificUserModal = ({ open, onClose, onSelect, selectedUserId }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const inputRef = useRef(null);

  // Alphabetical by default; switches to a name/email search once the
  // admin types. Limit(50) keeps this snappy — raise if your alumni
  // base is small enough that it doesn't matter.
  const fetchUsers = useCallback(async (term) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('users')
        .select('id, full_name, email, avatar_url')
        .order('full_name', { ascending: true })
        .limit(50);

      if (term?.trim()) {
        const escaped = term.trim().replace(/[%,]/g, '');
        query = query.or(`full_name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('[SpecificUserModal] fetch error:', err);
      setError('Failed to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    fetchUsers(debouncedSearch);
  }, [open, debouncedSearch, fetchUsers]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="cm-modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="cm-modal cm-user-picker-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={16} />
        </button>
        <h2 className="cm-modal-title">Select User</h2>
        <p className="cm-modal-subtitle">Search by name or email to target a specific alumni.</p>

        <div className="cm-user-search-wrap">
          <FiSearch size={14} className="cm-user-search-icon" />
          <input
            ref={inputRef}
            className="cm-input cm-user-search-input"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cm-user-list">
          {loading && <div className="cm-user-list-status">Searching…</div>}
          {!loading && error && (
            <div className="cm-user-list-status cm-user-list-error">{error}</div>
          )}
          {!loading && !error && users.length === 0 && (
            <div className="cm-user-list-status">No users found.</div>
          )}
          {!loading && !error && users.map((u) => (
            <button
              key={u.id}
              type="button"
              className={`cm-user-row ${selectedUserId === u.id ? 'active' : ''}`}
              onClick={() => { onSelect(u); onClose(); }}
            >
              <div className="cm-user-avatar">
                {u.avatar_url
                  ? <img src={u.avatar_url} alt={u.full_name || u.email} />
                  : getInitials(u.full_name)}
              </div>
              <div className="cm-user-info">
                <div className="cm-user-name">{u.full_name || 'Unnamed User'}</div>
                <div className="cm-user-email">{u.email}</div>
              </div>
              {selectedUserId === u.id && <span className="cm-user-selected-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpecificUserModal;