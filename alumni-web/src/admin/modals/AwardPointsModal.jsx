// ============================================================================
// AwardPointsModal.jsx — Select alumni (who attended events) and award points
// Points are NOT set by the admin — they're randomized automatically when
// the award is submitted (see onAward / handleAwardPoints in the parent).
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import './Disc.css'; // reuse existing modal look (cm-modal, cm-input, etc.)

const AwardPointsModal = ({ open, onClose, onAward }) => {
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [alumni, setAlumni]     = useState([]);    // all eligible alumni (attended >=1 event)
  const [selectedMap, setSelectedMap] = useState({}); // { [userId]: userObject }
  const [submitting, setSubmitting] = useState(false);

  // Fetch alumni who have attended at least one event.
  useEffect(() => {
    if (!open) return;
    const fetchAttendees = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('event_attendees')
          .select(`
            user_id,
            events ( title ),
            users ( id, full_name, email, avatar_url )
          `);

        if (error) throw error;

        const byUser = {};
        (data || []).forEach(row => {
          const u = row.users;
          if (!u) return;
          if (!byUser[u.id]) {
            byUser[u.id] = {
              id: u.id,
              name: u.full_name || 'Unnamed Alumni',
              email: u.email,
              avatar_url: u.avatar_url,
              eventTitles: [],
            };
          }
          if (row.events?.title) byUser[u.id].eventTitles.push(row.events.title);
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

  // Reset everything when the modal closes
  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedMap({});
      setError(null);
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

  const handleSend = async () => {
    if (selectedList.length === 0) return;
    setSubmitting(true);
    try {
      // Only user IDs go out — points are decided on the backend/handler side.
      const userIds = selectedList.map(u => u.id);
      await onAward(userIds);
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

          {/* Search results list — click a row to add/remove from selection */}
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

          {/* Selected users review list */}
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

          <p className="cm-field-hint" style={{ marginTop: 10 }}>
            Points will be automatically assigned to each selected alumni upon sending.
          </p>

          <div className="cm-modal-actions">
            <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
            <button
              className="cm-btn-submit"
              disabled={selectedList.length === 0 || submitting}
              onClick={handleSend}
            >
              {submitting ? 'Sending...' : `Send (${selectedList.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AwardPointsModal;