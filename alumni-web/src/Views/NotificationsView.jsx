import React from 'react';
import Sidebar from '../components/Sidebar';

/* ─────────────────────────────────────────────────────────────────────────────
Utility — strips HTML tags so raw markup in n.body never shows as text
───────────────────────────────────────────────────────────────────────────── */
const stripHtml = (html = '') =>
  html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

/* ─────────────────────────────────────────────────────────────────────────────
NotificationsPageView
Light-theme, fully aligned with Announcements.css design tokens
───────────────────────────────────────────────────────────────────────────── */
const NotificationsPageView = ({
  tab, setTab,
  loading, unreadCount,
  list, groups,
  markAllRead, markOneRead,
  formatTime,
  navigate,
  isMobile,
  isTablet,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Arimo:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        
        /*
         * Root background — matches --ann-page-bg exactly.
         * Covers html/body/#root so no seam appears at the sidebar edge.
         */
        html, body, #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          background: #DAE5F1 !important;
        }

        /* ── Design tokens (mirrors Announcements.css) ────────── */
        .np-shell {
          --np-page-bg:           #DAE5F1;
          --np-card-bg:           #FFFFFF;
          --np-card-border:       #E5E7EB;
          --np-card-shadow:       0px 2px 8px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.06);
          --np-card-shadow-hover: 0px 8px 24px rgba(43,114,251,0.14), 0px 2px 8px rgba(0,0,0,0.08);
          --np-card-border-hover: #2B72FB;
          --np-title-color:       #003EA6;
          --np-body-color:        #4A5565;
          --np-meta-color:        #8A94A6;
          --np-timestamp-color:   rgba(74,85,101,0.65);
          --np-clock-stroke:      rgba(74,85,101,0.45);
          --np-accent-btn:        #003EA6;
          --np-badge-bg:          #2B72FB;
          --np-page-title:        #324D87;
          --np-page-subtitle:     #545454;
          --np-back-color:        #003EA6;
          --np-icon-box-bg:       linear-gradient(180deg, #2B7FFF 0%, #155DFC 100%);
          --np-icon-box-shadow:   0px 4px 10px rgba(43,114,251,0.35);
          --np-unread-border:     #2B72FB;
          --np-divider:           #F0F2F5;
          --np-group-label-text:  #8A94A6;
        }

        /* ── Full-viewport flex shell ─────────────────────────── */
        .np-shell {
          display: flex;
          min-height: 100vh;
          background: var(--np-page-bg);
          font-family: 'Montserrat', 'Arimo', sans-serif;
        }

        /* ── Content area ─────────────────────────────────────── */
        .np-content {
          flex: 1;
          min-width: 0;
          padding: 37px 51px 60px;
        }

        /* ── Back button — mirrors ann-back-btn ───────────────── */
        .np-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          margin-bottom: 14px;
          transition: opacity 0.15s;
        }
        .np-back-btn:hover { opacity: 0.7; }
        .np-back-btn span {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: var(--np-back-color);
        }

        /* ── Page heading — mirrors ann-heading ───────────────── */
        .np-heading {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 39px;
          color: var(--np-page-title);
          margin: 0 0 6px 0;
          letter-spacing: -1px;
          line-height: 1.15;
        }

        .np-subheading {
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          font-size: 15px;
          line-height: 22px;
          color: var(--np-page-subtitle);
          margin: 0 0 20px 0;
        }

        /* ── Tabs ─────────────────────────────────────────────── */
        .np-tabs { display: flex; gap: 6px; margin-bottom: 28px; }
        .np-tab-btn {
          height: 34px;
          padding: 0 18px;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          transition: all 0.15s;
        }
        .np-tab-btn--active {
          background: var(--np-accent-btn);
          border: none;
          font-weight: 700;
          color: #ffffff;
        }
        .np-tab-btn--inactive {
          background: #ffffff;
          border: 1px solid var(--np-card-border);
          font-weight: 500;
          color: var(--np-body-color);
        }
        .np-tab-btn--inactive:hover {
          border-color: var(--np-card-border-hover);
          color: var(--np-title-color);
        }

        /* ── Mark-all — mirrors FILTER button styling ─────────── */
        .np-mark-all-btn {
          height: 37px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--np-accent-btn);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 13px;
          color: #ffffff;
          cursor: pointer;
          white-space: nowrap;
          letter-spacing: 0.2px;
          transition: opacity 0.15s;
          filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.15));
          margin-bottom: 28px;
        }
        .np-mark-all-btn:hover { opacity: 0.85; }

        /* ── Notification cards list ──────────────────────────── */
        .np-cards-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* ── Date-group label ─────────────────────────────────── */
        .np-group-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 0 6px;
          margin-top: 6px;
        }
        .np-group-label:first-child { margin-top: 0; }
        .np-group-label span {
          font-family: 'Montserrat', sans-serif;
          font-weight: 600;
          font-size: 10.5px;
          color: var(--np-group-label-text);
          text-transform: uppercase;
          letter-spacing: 0.9px;
          white-space: nowrap;
        }
        .np-group-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--np-card-border);
        }

        /* ── Notification card — mirrors ann-card ─────────────── */
        .np-notif-card {
          background: var(--np-card-bg);
          border: 1px solid var(--np-card-border);
          box-shadow: var(--np-card-shadow);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .np-notif-card:hover {
          border-color: var(--np-card-border-hover);
          box-shadow: var(--np-card-shadow-hover);
          transform: translateY(-2px);
        }

        /* Unread: left accent stripe + very faint tint */
        .np-notif-card--unread {
          border-left: 3px solid var(--np-unread-border);
          background: rgba(43,114,251,0.025);
        }
        .np-notif-card--unread:hover {
          background: rgba(43,114,251,0.05);
        }

        /* Inner body — mirrors ann-card__body */
        .np-notif-card__body {
          display: flex;
          align-items: flex-start;
          padding: 16px 20px;
          gap: 14px;
        }

        /* Icon box — mirrors ann-card__icon-box */
        .np-notif-card__icon {
          width: 46px;
          height: 46px;
          min-width: 46px;
          background: var(--np-icon-box-bg);
          box-shadow: var(--np-icon-box-shadow);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .np-notif-card:hover .np-notif-card__icon {
          transform: scale(1.04);
          box-shadow: 0px 8px 20px rgba(43,114,251,0.45);
        }

        /* Content area */
        .np-notif-card__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        /* Top row: title + timestamp — mirrors ann-card__top-row */
        .np-notif-card__top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        /* Title — mirrors ann-card__title */
        .np-notif-card__title {
          font-family: 'Montserrat', sans-serif;
          font-size: 14.5px;
          line-height: 1.35;
          letter-spacing: -0.15px;
          color: var(--np-title-color);
          margin: 0;
          flex: 1;
          min-width: 0;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        .np-notif-card__title--unread { font-weight: 700; }
        .np-notif-card__title--read   { font-weight: 600; }

        /* Timestamp row — mirrors ann-card__timestamp */
        .np-notif-card__meta {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .np-notif-card__time {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px;
          color: var(--np-timestamp-color);
          white-space: nowrap;
          font-weight: 400;
          letter-spacing: 0.1px;
        }

        /* Unread indicator dot */
        .np-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #2B72FB;
          flex-shrink: 0;
        }

        /* Body preview — mirrors ann-card__preview */
        .np-notif-card__preview {
          font-family: 'Montserrat', sans-serif;
          font-weight: 400;
          font-size: 13px;
          line-height: 1.65;
          color: var(--np-body-color);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        /* ── Empty / loading states ───────────────────────────── */
        .np-state-card {
          background: var(--np-card-bg);
          border: 1px solid var(--np-card-border);
          border-radius: 16px;
          box-shadow: var(--np-card-shadow);
        }
        .np-state-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          gap: 14px;
        }
        .np-state-center p {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          color: var(--np-meta-color);
          margin: 0;
          font-weight: 500;
        }
        .np-loading-row {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
        }
        .np-loading-row span {
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          color: var(--np-meta-color);
          font-weight: 500;
        }
        .np-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid var(--np-card-border);
          border-top-color: #2B72FB;
          border-radius: 50%;
          animation: np-spin 0.8s linear infinite;
        }
        @keyframes np-spin { to { transform: rotate(360deg); } }

        /* ── Responsive ───────────────────────────────────────── */
        @media (max-width: 1024px) {
          .np-content { padding: 37px 32px 48px; }
          .np-heading  { font-size: 31px; }
        }
        @media (max-width: 900px) {
          .np-content        { padding: 24px 16px 60px; margin-left: 0 !important; }
          .np-heading        { font-size: 27px; }
          .np-subheading     { font-size: 13px; }
          .np-back-btn span  { font-size: 14px; }
          .np-notif-card__body { padding: 14px; gap: 12px; }
          .np-notif-card__title { font-size: 13.5px; }
          .np-notif-card__preview { font-size: 12.5px; }
        }
        @media (max-width: 480px) {
          .np-notif-card__top-row { flex-direction: column; gap: 4px; }
          .np-notif-card__meta    { align-self: flex-start; }
        }
        @media (max-width: 380px) {
          .np-content { padding: 20px 12px 48px; }
          .np-heading { font-size: 23px; }
          .np-notif-card__body { padding: 12px; gap: 10px; }
          .np-notif-card__icon { width: 40px; height: 40px; min-width: 40px; }
          .np-tabs { flex-wrap: wrap; }
        }
      `}</style>

      {/*
       * .np-shell spans the full viewport width in a flex row.
       * The #DAE5F1 background on this element — and on html/body/#root —
       * ensures no white gaps appear at the sidebar edge or page corners.
       */}
      <div className="np-shell">
        <Sidebar />
        <div
          className="np-content"
          style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
        >
          {/* ── Header Section (About-style) ─────────────────────────── */}
          <button
            className="np-back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
              <path
                d="M3.33 8.5H13.67M3.33 8.5L8.5 3.33M3.33 8.5L8.5 13.67"
                stroke="#003EA6"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Back</span>
          </button>

          <h1 className="np-heading">Notifications</h1>
          <p className="np-subheading">
            Stay updated with the latest announcements and activities.
          </p>

          {/* ── Controls Row ──────────────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {/* Tabs sit flush-left under the subheading */}
            <div className="np-tabs" style={{ marginBottom: 0 }}>
              {['all', 'unread'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`np-tab-btn ${tab === t ? 'np-tab-btn--active' : 'np-tab-btn--inactive'}`}
                >
                  {t === 'all'
                    ? 'All'
                    : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
                </button>
              ))}
            </div>

            {/* RIGHT column — Mark All Read */}
            {unreadCount > 0 && (
              <button className="np-mark-all-btn" onClick={markAllRead} style={{ marginBottom: 0 }}>
                Mark all as read
              </button>
            )}
          </div>

          {/* ── Notification list ──────────────────────────────────────── */}
          {loading ? (
            <div className="np-state-card">
              <div className="np-loading-row">
                <div className="np-spinner" />
                <span>Loading notifications…</span>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="np-state-card">
              <div className="np-state-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <p>{tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
              </div>
            </div>
          ) : (
            <div className="np-cards-list">
              {Object.entries(groups).map(([label, items]) => {
                if (!items.length) return null;
                return (
                  <React.Fragment key={label}>
                    {/* Date-group label with trailing rule */}
                    <div className="np-group-label">
                      <span>{label}</span>
                    </div>
                    {items.map(n => (
                      <div
                        key={n.id}
                        className={`np-notif-card${n.read ? '' : ' np-notif-card--unread'}`}
                        onClick={() => markOneRead(n.id)}
                      >
                        <div className="np-notif-card__body">
                          {/* Gradient icon box */}
                          <div className="np-notif-card__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                                stroke="#ffffff"
                                strokeWidth="1.75"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                          {/* Text content */}
                          <div className="np-notif-card__content">
                            {/* Title + timestamp on same row */}
                            <div className="np-notif-card__top-row">
                              <p className={`np-notif-card__title np-notif-card__title--${n.read ? 'read' : 'unread'}`}>
                                {n.title}
                              </p>
                              <div className="np-notif-card__meta">
                                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                                  <circle cx="7" cy="7" r="6" stroke="rgba(74,85,101,0.45)" strokeWidth="1.17"/>
                                  <path d="M7 4V7.5L9.5 9" stroke="rgba(74,85,101,0.45)" strokeWidth="1.17" strokeLinecap="round"/>
                                </svg>
                                <span className="np-notif-card__time">{formatTime(n.time)}</span>
                                {!n.read && <div className="np-unread-dot" />}
                              </div>
                            </div>
                            {/* Body — HTML stripped to plain text */}
                            <p className="np-notif-card__preview">
                              {stripHtml(n.body)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPageView;