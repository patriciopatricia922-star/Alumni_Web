// ============================================================================
// RewardStoreView.jsx — Merged (Friend's UI + Modal + My Logic, no dummy data)
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import "../styles/RewardStore.css";
import { truncateHtml, stripHtml, htmlToReadableText } from '../utils/textHelpers';

// ============================ MERCH CARD ============================
const MerchCard = ({ item, userPoints, onRedeem, isTarget }) => {
  const [hovered, setHovered] = useState(false);
  const canAfford = userPoints >= item.points;
  
  // Scroll into view if it's the target
  const cardRef = useRef(null);
  useEffect(() => {
    if (isTarget && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isTarget]);

  return (
    <div
      ref={cardRef}
      className={`merch-card ${isTarget ? 'target-highlight' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.2s, box-shadow 0.2s",
        boxShadow: isTarget ? '0 0 0 2px #003ea6, 0px 12px 32px rgba(0,62,166,0.15)' : undefined
      }}
    >
      {/* Image */}
      <div className="merch-card-image-wrap">
        <img
          src={item.image}
          alt={item.name}
          style={{
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.35s ease",
          }}
          onError={(e) => {
            e.target.style.background = "#dbeafe";
            e.target.style.display = "none";
          }}
        />
        <div className="merch-card-points-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {item.points}
        </div>
        <div className="merch-card-category-badge">{item.category}</div>
      </div>
      {/* Body */}
      <div className="merch-card-info">
        <p className="merch-card-name">{item.name}</p>
        <p
          className="merch-card-desc"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {htmlToReadableText(item.description || '')}
        </p>
        <button
          className="merch-card-redeem-btn"
          disabled={!canAfford}
          onClick={() => canAfford && onRedeem(item)}
        >
          {canAfford
            ? `Redeem For ${item.points} Points`
            : `Need ${item.points - userPoints} More Points`}
        </button>
      </div>
    </div>
  );
};

// ============================ MAIN VIEW ============================
const RewardStoreView = ({
  sidebarWidth,
  isMobile,
  rewardPoints,
  merchandise,
  activeFilter,
  onFilterChange,
  onRedeem,
  onCompleteSurvey,
  surveyRoute,
  surveyAlreadyClaimed,
  surveyRewardPoints,
  rewardIcon,
  bellRef,
  unreadCount,
  showDropdown,
  setShowDropdown,
  notifs,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  navigate,
  targetRewardId, // NEW PROP
}) => {
  const filters = ["All", "Apparel", "Drinkware", "Accessories"];
  const filtered =
    activeFilter === "All"
      ? merchandise || []
      : (merchandise || []).filter((m) => m.category === activeFilter);

  // const navigate = useNavigate();
  // ── Redeem confirmation modal ──────────────────────────────────────────
  const [redeemedItem, setRedeemedItem] = useState(null);
  const handleRedeem = (item) => {
    onRedeem(item);
    setRedeemedItem(item);
  };
  const closeRedeemModal = () => setRedeemedItem(null);

  // Survey button derived state (my logic — controls disabled + label)
  const surveyLoading = !surveyRoute;
  const surveyBtnLabel = surveyLoading
    ? "Loading…"
    : surveyAlreadyClaimed
      ? "Update Survey"
      : `Complete Survey (+${surveyRewardPoints} pts)`;

  // ============================ BACK BUTTON ============================
  const backButton = (
    <button
      className="back-button"
      onClick={() => navigate(-1)}
      style={{ position: "relative", top: "14px", marginLeft: "-51px" }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 17 17"
        fill="none"
        style={{ marginLeft: "7.5px" }}
      >
        <path
          d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
          stroke="#002263"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Back</span>
    </button>
  );

  // ============================ HEADER ============================
  const header = (
    <div className="rewards-header">
      <div className="rewards-header-text">
        <h1>Reward Store</h1>
        <p>Redeem your points for exclusive NU merchandise</p>
      </div>
    </div>
  );

  // ============================ POINTS BANNER ============================
  const pointsBanner = (
    <div className="rewards-banner-wrapper">
      <div className="rewards-points-banner">
        {/* Left — icon + text */}
        <div className="rewards-points-left">
          <div className="rewards-points-icon-box">
            {rewardIcon ? (
              <img
                src={rewardIcon}
                alt="Reward"
                width={90}
                height={90}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.18))",
                }}
              />
            ) : (
              <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="#FFD600" opacity="0.25" />
                <circle cx="24" cy="24" r="14" fill="#FFD600" opacity="0.5" />
                <path
                  d="M24 10l3.6 7.3 8.1 1.2-5.9 5.7 1.4 8-7.2-3.8-7.2 3.8 1.4-8-5.9-5.7 8.1-1.2z"
                  fill="#FFD600"
                  stroke="#FFB800"
                  strokeWidth="1"
                />
              </svg>
            )}
          </div>
          <div className="rewards-points-info">
            <p className="rewards-points-label">Your Reward Points</p>
            <p className="rewards-points-value">
              {rewardPoints ?? 0}
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#FFD600"
                style={{ marginLeft: 8 }}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </p>
            <p className="reward-banner-sub">
              {surveyAlreadyClaimed
                ? "Survey Completed · Points Awarded"
                : "Complete surveys to earn more points!"}
            </p>
          </div>
        </div>
        {/* Right — survey button (my logic: disabled + dynamic label, friend's styling via className) */}
        <button
          className="rewards-survey-button"
          onClick={onCompleteSurvey}
          disabled={surveyLoading}
          title={
            surveyLoading
              ? "Checking survey status…"
              : surveyAlreadyClaimed
                ? "You can still update your survey responses"
                : `Complete the tracer survey to earn ${surveyRewardPoints} points`
          }
        >
          {surveyBtnLabel}
        </button>
      </div>
    </div>
  );

  // ============================ FILTERS ============================
  const filterTabs = (
    <div className="merchandise-filters">
      {filters.map((f) => (
        <button
          key={f}
          className={`filter-tab${activeFilter === f ? " active" : ""}`}
          onClick={() => onFilterChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );

  // ============================ GRID ============================
  const grid = (
    <div className="merchandise-grid">
      {filtered.length === 0 ? (
        <div className="merch-empty">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          No items in this category yet
        </div>
      ) : (
        filtered.map((item) => (
          <MerchCard
            key={item.id}
            item={item}
            userPoints={rewardPoints ?? 0}
            onRedeem={handleRedeem}
            isTarget={targetRewardId && String(item.id) === String(targetRewardId)}
          />
        ))
      )}
    </div>
  );

  // ============================ MERCHANDISE ============================
  const merchandiseSection = (
    <div className="merchandise-section">
      <h2 className="merchandise-heading">Available Merchandise</h2>
      <p className="merchandise-subheading">
        Choose from our exclusive collection of NU merchandise
      </p>
      {filterTabs}
      {grid}
    </div>
  );

  return (
    <div className="rewards-store">
      <Sidebar />
      <div
        className="rewards-store-content"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
      >
        {/* ── Sticky header row (pattern: AlumniDashboardView's .dashboard-header) ──
        backButton renders inside this same row, bell sits at the far right,
        so both sit on one sticky line  like the reference screenshot. ── */}
        <div className="rewards-header-row">
          {backButton}
          <div ref={bellRef} className="notification-bell-inline">
            <button
              onClick={() => setShowDropdown((v) => !v)}
              style={{
                width: isMobile ? "44px" : "52px",
                height: isMobile ? "44px" : "52px",
                background: showDropdown ? "#002263" : "#003EA6",
                border: showDropdown
                  ? "1px solid rgba(0,34,99,0.5)"
                  : "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
                borderRadius: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "all 0.15s",
                flexShrink: 0,
              }}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            >
              <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                <path
                  d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.67"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {unreadCount > 0 && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "-4.41px",
                      right: "-4.41px",
                      width: "28.81px",
                      height: "28.81px",
                      background: "rgba(255,0,0,0.7)",
                      opacity: 0.42,
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "-1px",
                      right: "-1px",
                      minWidth: "20px",
                      height: "20px",
                      background: "rgba(255,0,0,0.7)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Arimo, Arial, sans-serif",
                        fontSize: "10px",
                        color: "#fff",
                        fontWeight: 400,
                      }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </div>
                </>
              )}
            </button>
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: 0,
                  width: "min(380px, calc(100vw - 32px))",
                  maxHeight: "520px",
                  background: "#FFFFFF",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "16px",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  zIndex: 300,
                }}
              >
                <div
                  style={{
                    padding: "16px 18px 12px",
                    borderBottom: "1px solid rgba(0,0,0,0.07)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Arimo",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#003EA6",
                    }}
                  >
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        fontFamily: "Arimo",
                        fontSize: "12px",
                        color: "#003EA6",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "10px 18px 0",
                    gap: "4px",
                    flexShrink: 0,
                  }}
                >
                  {["all", "unread"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setNotifTab(t)}
                      style={{
                        height: "32px",
                        padding: "0 16px",
                        background: notifTab === t ? "#003EA6" : "transparent",
                        border: notifTab === t ? "none" : "1px solid #D1D5DC",
                        borderRadius: "20px",
                        cursor: "pointer",
                        fontFamily: "Arimo",
                        fontSize: "13px",
                        fontWeight: notifTab === t ? 700 : 400,
                        color: notifTab === t ? "#FFFFFF" : "#4A5565",
                        transition: "all 0.15s",
                        textTransform: "capitalize",
                      }}
                    >
                      {t === "all"
                        ? "All"
                        : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
                    </button>
                  ))}
                </div>
                <div style={{ overflowY: "auto", flex: 1, padding: "8px 0" }}>
                  {(() => {
                    const list =
                      notifTab === "unread"
                        ? notifs.filter((n) => !n.read)
                        : notifs;
                    if (!list.length)
                      return (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "40px 20px",
                            gap: "10px",
                          }}
                        >
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                              stroke="rgba(0,0,0,0.2)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          <p
                            style={{
                              fontFamily: "Arimo",
                              fontSize: "13px",
                              color: "rgba(0,0,0,0.3)",
                              margin: 0,
                            }}
                          >
                            {notifTab === "unread"
                              ? "No unread notifications"
                              : "No notifications yet"}
                          </p>
                        </div>
                      );
                    return Object.entries(groupByDate(list)).map(
                      ([label, items]) => {
                        if (!items.length) return null;
                        return (
                          <div key={label}>
                            <p
                              style={{
                                fontFamily: "Arimo",
                                fontWeight: 700,
                                fontSize: "11px",
                                color: "rgba(0,0,0,0.35)",
                                textTransform: "uppercase",
                                letterSpacing: "0.8px",
                                margin: "10px 18px 4px",
                              }}
                            >
                              {label}
                            </p>
                            {items.map((n) => (
                              <div
                                key={n.id}
                                onClick={() => markOneRead(n.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                  padding: "10px 18px",
                                  background: n.read
                                    ? "transparent"
                                    : "rgba(0,62,166,0.05)",
                                  cursor: "pointer",
                                  transition: "background 0.12s",
                                  borderLeft: n.read
                                    ? "3px solid transparent"
                                    : "3px solid #003EA6",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "rgba(0,0,0,0.03)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = n.read
                                    ? "transparent"
                                    : "rgba(0,62,166,0.05)")
                                }
                              >
                                <div
                                  style={{
                                    width: "38px",
                                    height: "38px",
                                    borderRadius: "50%",
                                    background: "rgba(0,62,166,0.08)",
                                    border: "1px solid rgba(0,62,166,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    marginTop: "2px",
                                  }}
                                >
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                                      stroke="#003EA6"
                                      strokeWidth="1.67"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p
                                    style={{
                                      fontFamily: "Arimo",
                                      fontWeight: n.read ? 400 : 700,
                                      fontSize: "13px",
                                      color: "#0A0A0A",
                                      margin: "0 0 2px 0",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    {n.title}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: "Arimo",
                                      fontSize: "12px",
                                      color: "#4A5565",
                                      margin: "0 0 4px 0",
                                      lineHeight: "1.4",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {getExcerpt(n.body, 100)}
                                  </p>
                                  <span
                                    style={{
                                      fontFamily: "Arimo",
                                      fontSize: "11px",
                                      color: "rgba(0,0,0,0.35)",
                                    }}
                                  >
                                    {formatTime(n.time)}
                                  </span>
                                </div>
                                {!n.read && (
                                  <div
                                    style={{
                                      width: "8px",
                                      height: "8px",
                                      borderRadius: "50%",
                                      background: "#003EA6",
                                      flexShrink: 0,
                                      marginTop: "6px",
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      },
                    );
                  })()}
                </div>
                <div
                  style={{
                    padding: "10px 18px",
                    borderTop: "1px solid rgba(0,0,0,0.07)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/notifications");
                    }}
                    style={{
                      width: "100%",
                      height: "36px",
                      background: "#F9FAFB",
                      border: "1px solid #D1D5DC",
                      borderRadius: "10px",
                      fontFamily: "Arimo",
                      fontSize: "13px",
                      color: "#4A5565",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F0F4FB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#F9FAFB")
                    }
                  >
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {header}
        {pointsBanner}
        {merchandiseSection}
      </div>
      {/* ── Redeem confirmation modal ── */}
      {redeemedItem && (
        <div className="redeem-modal-overlay" onClick={closeRedeemModal}>
          <div className="redeem-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="redeem-modal-close"
              onClick={closeRedeemModal}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="redeem-modal-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 12v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 7H2v5h20V7z"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22V7"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="redeem-modal-title">Redeem Request Received</h2>
            <p className="redeem-modal-subtitle">
              Your request to redeem{" "}
              <span className="redeem-modal-item-name">
                {redeemedItem.name}
              </span>{" "}
              has been noted.
            </p>
            <div className="redeem-modal-notice">
              <p className="redeem-modal-notice-title">Important Notice</p>
              <p className="redeem-modal-notice-text">
                Please visit the <strong>Alumni Relations Office</strong> at
                NU-Dasmariñas Main Campus to claim your merchandise. Bring a
                valid ID for verification.
              </p>
            </div>
            <button
              className="redeem-modal-confirm-btn"
              onClick={closeRedeemModal}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardStoreView;