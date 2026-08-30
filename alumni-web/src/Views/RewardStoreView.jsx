// ============================================================================
// RewardStoreView.jsx — Merged (Friend's UI + Modal + My Logic, no dummy data)
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from 'react-router-dom';
import Sidebar from "../components/Sidebar";
import "../styles/RewardStore.css";
import { truncateHtml, stripHtml, htmlToReadableText, getExcerpt } from '../utils/textHelpers';
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';

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
      style={
        isMobile
          ? { position: "relative", top: "14px", marginLeft: "-51px" }
          : undefined
      }
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
        {/* ── Bell + Back button render as independent siblings (matching
        Announcements' .announcements-main-content structure): the bell is
        absolutely positioned via .notification-bell-wrapper and the back
        button sits in normal document flow, rather than being paired in a
        shared flex row. ── */}
        <NotificationBell
          onSeeAll={() => navigate("/notifications")}
          className={isMobile ? "mobile" : ""}
        />
        {backButton}
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