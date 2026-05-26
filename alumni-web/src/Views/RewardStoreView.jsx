// ============================================================================
// RewardStoreView.jsx — Presentational layer
// ============================================================================
// Changes vs. original:
//   • Survey button disabled + labelled "Loading…" while surveyRoute resolves
//   • Label becomes "Update Survey" after reward is claimed (no duplicate CTA)
//   • Points label reflects actual award amount via surveyRewardPoints prop
//   • Contextual hint appears after claim: "Points awarded · Update anytime"
// ============================================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import '../styles/RewardStore.css';

// ============================ MERCH CARD ============================
const MerchCard = ({ item, userPoints, onRedeem }) => {
  const canAfford = userPoints >= item.points;
  return (
    <div className="merch-card">
      <div className="merch-card-image-wrap">
        <img src={item.image} alt={item.name} />
        <div className="merch-card-points-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffffff">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {item.points}
        </div>
        <div className="merch-card-category-badge">{item.category}</div>
      </div>
      <div className="merch-card-info">
        <p className="merch-card-name">{item.name}</p>
        <p className="merch-card-desc">{item.description}</p>
        <button
          className="merch-card-redeem-btn"
          disabled={!canAfford}
          onClick={() => canAfford && onRedeem(item)}
        >
          {canAfford
            ? `Redeem for ${item.points} pts`
            : `Need ${item.points - userPoints} more pts`}
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
}) => {
  const filters  = ['All', 'Apparel', 'Drinkware', 'Accessories', 'Stationery'];
  const filtered = activeFilter === 'All'
    ? merchandise
    : merchandise.filter(m => m.category === activeFilter);

  const navigate = useNavigate();

  // Survey button derived state
  const surveyLoading  = !surveyRoute;
  const surveyBtnLabel = surveyLoading
    ? 'Loading…'
    : surveyAlreadyClaimed
      ? 'Update Survey'
      : `Complete Survey (+${surveyRewardPoints} pts)`;

  // ============================ BELL ============================
  const bell = (
    <div
      ref={bellRef}
      className={`notification-bell-wrapper${isMobile ? ' mobile' : ''}`}
      style={{ marginLeft: 'auto', marginRight: '15px', paddingTop: '35px' }}
    >
      <button
        className={`notification-bell-btn${showDropdown ? ' active' : ''}`}
        onClick={() => setShowDropdown(v => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M10 21h4M18 9C18 5.686 15.314 3 12 3C8.686 3 6 5.686 6 9C6 13.5 4 15.5 4 15.5H20C20 15.5 18 13.5 18 9Z"
            stroke="#FFFFFF"
            strokeWidth="1.67"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <div className="notification-badge">
            <span className="notification-badge-text">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>
    </div>
  );

  // ============================ BACK BUTTON ============================
  const backButton = (
    <button
      onClick={() => navigate('/dashboard')}
      className="back-button"
      style={{ marginTop: '16px', marginLeft: '0.5rem' }}
    >
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
        <path
          d="M13 8.5H2M2 8.5L7 3.5M2 8.5L7 13.5"
          stroke="#003EA6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      &nbsp;<span className="back-button-text">Back</span>
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
    <div className="rewards-points-banner">
      <div className="rewards-points-left">
        <div className="rewards-points-icon-box">
          {rewardIcon
            ? (
              <img
                src={rewardIcon}
                alt="Reward"
                width={36}
                height={36}
                style={{
                  objectFit: 'contain',
                  filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.18))',
                }}
              />
            )
            : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <circle cx="12" cy="8" r="6" />
                <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
              </svg>
            )
          }
        </div>
        <div className="rewards-points-info">
          <p className="rewards-points-label">Available Points</p>
          <p className="rewards-points-value">
            {rewardPoints ?? 0}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FFD600" style={{ marginLeft: 8 }}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </p>
        </div>
      </div>

      <div className="rewards-points-right">
        <p className="rewards-earn-label">
          {surveyAlreadyClaimed ? 'Survey Completed ✓' : 'Earn More Points'}
        </p>
        <button
          className="rewards-survey-button"
          onClick={onCompleteSurvey}
          disabled={surveyLoading}
          title={
            surveyLoading
              ? 'Checking survey status…'
              : surveyAlreadyClaimed
                ? 'You can still update your survey responses'
                : `Complete the tracer survey to earn ${surveyRewardPoints} points`
          }
        >
          {surveyBtnLabel}
        </button>
        {surveyAlreadyClaimed && (
          <p className="rewards-survey-claimed-hint">
            Points awarded · You can still update your responses
          </p>
        )}
      </div>
    </div>
  );

  // ============================ FILTERS ============================
  const filterTabs = (
    <div className="merchandise-filters">
      {filters.map(f => (
        <button
          key={f}
          className={`filter-tab${activeFilter === f ? ' active' : ''}`}
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          No items in this category yet.
        </div>
      ) : (
        filtered.map(item => (
          <MerchCard
            key={item.id}
            item={item}
            userPoints={rewardPoints ?? 0}
            onRedeem={onRedeem}
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
        Choose from our exclusive collection of NU branded items
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
        {bell}
        {backButton}
        {header}
        {pointsBanner}
        {merchandiseSection}
      </div>
    </div>
  );
};

export default RewardStoreView;