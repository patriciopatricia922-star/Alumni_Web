import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import './Disc.css';

const AwardPointsModal = ({ open, onClose, onAward }) => {
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [alumni, setAlumni]     = useState([]);
  const [selectedMap, setSelectedMap] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [points, setPoints] = useState(''); // NEW: admin-entered points value

  useEffect(() => {
    if (!open) return;
    const fetchAttendees = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: usersData, error: usersErr } = await supabase
          .from('users')
          .select('id, last_name, first_name, middle_name, email')
          .not('email', 'is', null);

        if (usersErr) throw usersErr;

        const byUser = {};
        (usersData || []).forEach(u => {
          const last = u.last_name?.trim() || '';
          const first = u.first_name?.trim() || '';
          const middle = u.middle_name?.trim() || '';
          const displayName = last
            ? `${last}, ${[first, middle].filter(Boolean).join(' ')}`.trim()
            : ([first, middle].filter(Boolean).join(' ') || 'Unnamed Alumni');

          byUser[u.id] = {
            id: u.id,
            name: displayName,
            email: u.email,
            avatar_url: null,
            eventTitles: [],
          };
        });

        setAlumni(Object.values(byUser));
      } catch (err) {
        console.error('[AwardPointsModal] fetch error:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedMap({});
      setError(null);
      setPoints(''); // NEW: reset points on close
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return alumni;
    return alumni.filter(a =>
      a.name.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    );
  }, [alumni, search]);

  const selectedList = Object.values(selectedMap);

  const toggleUser = (user) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[user.id]) delete next[user.id];
      else next[user.id] = user;
      return next;
    });
  };

  const removeSelected = (id) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // NEW: only digits allowed, no decimals/minus signs
  const handlePointsChange = (e) => {
    const val = e.target.value;
    if (val === '' || /^\d+$/.test(val)) {
      setPoints(val);
    }
  };

  const parsedPoints = parseInt(points, 10);
  const isPointsValid = points.trim() !== '' && !isNaN(parsedPoints) && parsedPoints > 0;

  const handleSend = async () => {
    if (selectedList.length === 0) return;

    // NEW: points validation
    if (!isPointsValid) {
      setError('Please enter a valid number of points greater than 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const userIds = selectedList.map(u => u.id);
      await onAward(userIds, parsedPoints); // NEW: pass points through
      onClose();
    } catch (err) {
      console.error('[AwardPointsModal] award error:', err);
      setError('Failed to award points.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div className="cm-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <div className="cm-modal-header">
          <button className="cm-modal-close" onClick={onClose}>✕</button>
          <h2 className="cm-modal-title">Select User</h2>
          <p className="cm-modal-subtitle">
            Search by name or email to target a specific alumni.
          </p>
        </div>

        <div className="cm-modal-body">
          <div className="cm-field">
            <input
              className="cm-input"
              placeholder="Search name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: 10,
              marginTop: 10,
              maxHeight: 200,
              overflowY: 'auto',
            }}
          >
            {loading && (
              <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                Loading alumni…
              </div>
            )}

            {!loading && error && (
              <div style={{ padding: 24, textAlign: 'center', color: '#EF4444', fontSize: 13 }}>
                {error}
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                No eligible alumni found.
              </div>
            )}

            {!loading && !error && filtered.map(a => {
              const isSelected = !!selectedMap[a.id];
              return (
                <div
                  key={a.id}
                  onClick={() => toggleUser(a)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                    background: isSelected ? '#EFF6FF' : '#fff',
                  }}
                >
                  <input type="checkbox" checked={isSelected} readOnly />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{a.name}</div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{a.email}</div>
                    {a.eventTitles.length > 0 && (
                      <div style={{ fontSize: 10.5, color: '#155DFC', marginTop: 2 }}>
                        Attended: {a.eventTitles.slice(0, 2).join(', ')}
                        {a.eventTitles.length > 2 ? ` +${a.eventTitles.length - 2} more` : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="cm-label">
              Selected Alumni ({selectedList.length})
            </label>
            {selectedList.length === 0 ? (
              <div
                style={{
                  border: '1px dashed #E2E8F0',
                  borderRadius: 10,
                  padding: '16px',
                  textAlign: 'center',
                  color: '#94A3B8',
                  fontSize: 12.5,
                  marginTop: 6,
                }}
              >
                No alumni selected yet.
              </div>
            ) : (
              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  marginTop: 6,
                  maxHeight: 160,
                  overflowY: 'auto',
                }}
              >
                {selectedList.map(u => (
                  <div
                    key={u.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      borderBottom: '1px solid #F1F5F9',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1E293B' }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{u.email}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelected(u.id)}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#EF4444',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW: Points input field */}
          <div className="cm-field" style={{ marginTop: 16 }}>
            <label className="cm-label">Points to Award</label>
            <input
              className="cm-input"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              placeholder="Enter number of points…"
              value={points}
              onChange={handlePointsChange}
            />
          </div>

          <p className="cm-field-hint" style={{ marginTop: 10 }}>
            Enter the number of points to award to each selected alumni.
          </p>

          <div className="cm-modal-actions">
            <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="cm-btn-submit"
              disabled={selectedList.length === 0 || !isPointsValid || submitting}
              onClick={handleSend}
            >
              {submitting ? 'Sending...' : `Award Points (${selectedList.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardPointsModal;