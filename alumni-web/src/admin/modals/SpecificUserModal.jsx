import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiX, FiSearch } from 'react-icons/fi';
import { supabase } from '../../lib/supabase'; // adjust path to match your project

// NOTE: This implementation now mirrors AwardPointsModal's fetching logic
// to ensure consistent user loading and "Last, First Middle" formatting.

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('');
};

const SpecificUserModal = ({ open, onClose, onSelect, selectedUserId }) => {
  const [search, setSearch] = useState('');
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Replicated from AwardPointsModal: Fetches all eligible users and formats names
  useEffect(() => {
    if (!open) return;

    const fetchAttendees = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: usersData, error: usersErr } = await supabase
          .from('users')
          .select('id, last_name, first_name, middle_name, email, avatar_url')
          .not('email', 'is', null);

        if (usersErr) throw usersErr;

        const formattedUsers = (usersData || []).map(u => {
          const last = u.last_name?.trim() || '';
          const first = u.first_name?.trim() || '';
          const middle = u.middle_name?.trim() || '';
          
          // Format: Last Name, First Name Middle Name
          const displayName = last
            ? `${last}, ${[first, middle].filter(Boolean).join(' ')}`.trim()
            : ([first, middle].filter(Boolean).join(' ') || 'Unnamed Alumni');

          return {
            id: u.id,
            full_name: displayName, // Mapped to full_name for UI compatibility
            email: u.email,
            avatar_url: u.avatar_url,
          };
        });

        setAlumni(formattedUsers);
      } catch (err) {
        console.error('[SpecificUserModal] fetch error:', err);
        setError('Failed to load users.');
        setAlumni([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [open]);

  // Client-side filtering for instant search experience
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return alumni;
    return alumni.filter(a =>
      a.full_name.toLowerCase().includes(q) || 
      a.email?.toLowerCase().includes(q)
    );
  }, [alumni, search]);

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
          {loading && <div className="cm-user-list-status">Loading alumni…</div>}
          {!loading && error && (
            <div className="cm-user-list-status cm-user-list-error">{error}</div>
          )}
          {!loading && !error && filteredUsers.length === 0 && (
            <div className="cm-user-list-status">No users found.</div>
          )}
          {!loading && !error && filteredUsers.map((u) => (
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