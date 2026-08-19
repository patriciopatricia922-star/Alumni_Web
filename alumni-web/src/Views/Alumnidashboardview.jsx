import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/notifications/NotificationBell";
import "../styles/NotificationBell.css";
import "../styles/AlumniDashboard.css";
import "../styles/RewardsCard.css";
import { truncateHtml } from "../utils/textHelpers";

const ForYouCard = ({ item, onNavigate, onDismissBadge }) => (
  <div
    className={`for-you-card for-you-${item.category}`}
    onClick={() => {
      onDismissBadge(item.category);
      onNavigate(item.path);
    }}
  >
    <div className="for-you-icon-box">
      <img
        src={item.icon}
        alt={item.title}
        className={`for-you-icon ${item.title === "Discounts" ? "discount-icon" : ""}`}
      />
      {item.showDot && <div className="notification-dot" />}
    </div>
    <div className="for-you-text">
      <p className="card-title">{item.title}</p>
      <p className="card-description">{item.description}</p>
    </div>
  </div>
);

const ProgressCircle = ({ animatedPercentage }) => {
  const size = 154;
  const radius = 64;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="progress-circle">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="progress-svg"
        style={{ width: "100%", height: "100%" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-bg"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="progress-fill"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - animatedPercentage / 100)}
        />
      </svg>
      <div className="progress-percentage">{animatedPercentage}%</div>
    </div>
  );
};

const slideTransitionStyles = `.reward-banner-slider { position: relative; overflow: hidden; border-radius: 20px; margin-bottom: 15px; } .reward-slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 10px 60px; border-radius: 20px; opacity: 0; pointer-events: none; transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.42s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform, opacity; } .reward-slide--active { opacity: 1; pointer-events: auto; transform: translateX(0) !important; } .reward-slide--enter-next { transform: translateX(100%); } .reward-slide--enter-prev { transform: translateX(-100%); } .reward-slide--exit-next { transform: translateX(-100%); opacity: 0; } .reward-slide--exit-prev { transform: translateX(100%); opacity: 0; } @media (max-width: 767px) { .reward-slide { padding: 12px 16px; flex-direction: column; align-items: flex-start; gap: 12px; } .reward-banner-slider { min-height: clamp(200px, 56vw, 260px); } } @media (max-width: 380px) { .reward-banner-slider { min-height: clamp(220px, 64vw, 260px); } } .slide-dots { position: absolute; top: 10px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; z-index: 10; } .slide-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255, 255, 255, 0.4); transition: background 0.3s, transform 0.3s; cursor: pointer; border: none; padding: 0; flex-shrink: 0; } .slide-dot--active { background: rgba(255, 255, 255, 0.95); width: 18px; border-radius: 3px; transform: none; }`;

const AlumniDashboardView = ({
  isMobile,
  isTablet,
  sidebarWidth,
  firstName,
  unreadCount,
  animatedPercentage,
  forYouItems,
  onNavigate,
  onDismissBadge,
  surveyRoute,
  onSurveyNavigate,
  rewardPoints = 0,
  dynamicRewardSlide = null,
  loadingRewardContent = true,
  announcementIcon,
  rewardIcon,
  discountIcon,
  eventsIcon,
  jobsIcon,
  grandWestsideHotel,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [animating, setAnimating] = useState(false);
  const autoPlayRef = useRef(null);
  const slideLenRef = useRef(2); // Will be updated dynamically
  const interactedRef = useRef(false);
  const goToSlideRef = useRef(null);
  const bannerRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchDeltaRef = useRef(0);

  goToSlideRef.current = (nextIdx) => {
    if (animating) return;
    setAnimating(true);
    setSlideIndex((cur) => {
      const resolved =
        nextIdx !== null ? nextIdx : (cur + 1) % slideLenRef.current;
      setPrevIndex(cur);
      setTimeout(() => {
        setPrevIndex(null);
        setAnimating(false);
      }, 440);
      return resolved;
    });
  };

  const resetAutoPlay = (afterInteraction = false) => {
    if (afterInteraction) interactedRef.current = true;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    const delay = interactedRef.current ? 15000 : 2500;
    autoPlayRef.current = setInterval(() => goToSlideRef.current(null), delay);
  };

  useEffect(() => {
    resetAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, []);

  useEffect(() => {
    if (!isMobile || !bannerRef.current) return;
    const SWIPE_THRESHOLD = 50;
    const DIRECTION_LOCK_ANGLE = 30;
    let startY = 0;
    let isHorizontalSwipe = null;

    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      touchDeltaRef.current = 0;
      isHorizontalSwipe = null;
    };

    const handleTouchMove = (e) => {
      if (touchStartRef.current === null) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - touchStartRef.current;
      const deltaY = currentY - startY;
      touchDeltaRef.current = deltaX;

      if (isHorizontalSwipe === null) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        if (absX > 10 || absY > 10) {
          const angle = Math.atan2(absY, absX) * (180 / Math.PI);
          isHorizontalSwipe = angle < DIRECTION_LOCK_ANGLE;
        }
      }

      if (isHorizontalSwipe) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (touchStartRef.current === null || !isHorizontalSwipe) {
        touchStartRef.current = null;
        touchDeltaRef.current = 0;
        isHorizontalSwipe = null;
        return;
      }

      const delta = touchDeltaRef.current;
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        if (delta < 0) {
          const next = (slideIndex + 1) % slideLenRef.current;
          goToSlideRef.current(next);
          resetAutoPlay(true);
        } else {
          const prev =
            (slideIndex - 1 + slideLenRef.current) % slideLenRef.current;
          goToSlideRef.current(prev);
          resetAutoPlay(true);
        }
      }

      touchStartRef.current = null;
      touchDeltaRef.current = 0;
      isHorizontalSwipe = null;
    };

    const el = bannerRef.current;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isMobile, slideIndex]);

  // Build reward slides array dynamically
  const rewardSlides = [
    // Slide 0: Always the Reward Points slide (static)
    {
      label: "Your Reward Points",
      points: rewardPoints ?? 0,
      sub: "Complete surveys to earn more points!",
      gradient: "linear-gradient(90deg, #1A55C0 0%, #2E6AE8 50%, #4A85F5 100%)",
      icon: rewardIcon,
      iconBg: "transparent",
      isReward: true,
      buttonLabel: "Redeem Rewards",
      buttonPath: "/rewards",
    },
    // Slide 1: Dynamic content from ALL existing Events/Announcements/Jobs/Discounts
    ...(dynamicRewardSlide
      ? [dynamicRewardSlide]
      : [
          // Fallback if loading or no content
          {
            label: "Welcome",
            title: "Alumni Network",
            description:
              "Connect with fellow alumni and explore opportunities!",
            buttonLabel: "Explore More",
            buttonPath: "/dashboard",
            gradient:
              "linear-gradient(90deg, #1A55C0 0%, #2E6AE8 50%, #4A85F5 100%)",
            icon: rewardIcon,
            iconBg: "transparent",
          },
        ]),
  ];

  slideLenRef.current = rewardSlides.length;

  const prevSlide = (e) => {
    e.stopPropagation();
    const prev = (slideIndex - 1 + rewardSlides.length) % rewardSlides.length;
    goToSlideRef.current(prev);
    resetAutoPlay(true);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    const next = (slideIndex + 1) % rewardSlides.length;
    goToSlideRef.current(next);
    resetAutoPlay(true);
  };

  const getSlideClass = (idx) => {
    if (idx === slideIndex) return "reward-slide reward-slide--active";
    if (idx === prevIndex) return "reward-slide reward-slide--exit-next";
    return "reward-slide reward-slide--enter-next";
  };

  const renderSlideContent = (slide) => {
    const iconSize = slide.isReward ? 100 : (slide.iconSize ?? 130);

    return (
      <>
        <div
          className="reward-banner-left"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="reward-banner-icon-box"
            style={{ background: slide.iconBg, boxShadow: "none" }}
          >
            <img
              src={slide.icon}
              alt={slide.label}
              style={{
                width: `clamp(40px, 12vw, ${iconSize}px)`,
                height: `clamp(40px, 12vw, ${iconSize}px)`,
                objectFit: "contain",
                transform: slide.isReward
                  ? "translateY(2px)"
                  : (slide.iconTransform ?? undefined),
                filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.18))",
              }}
            />
          </div>
          <div className="reward-banner-text">
            <p className="reward-banner-label">{slide.label}</p>
            <p className="reward-banner-points">
              {slide.isReward ? (
                <>
                  {rewardSlides[0].points}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="#FFD600"
                    style={{ marginLeft: 8, verticalAlign: "middle" }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </>
              ) : (
                <span
                  style={{
                    fontSize: "clamp(18px, 4vw, 30px)",
                    fontWeight: 700,
                  }}
                >
                  {slide.title}
                </span>
              )}
            </p>
            <p className="reward-banner-sub">
              {slide.isReward ? rewardSlides[0].sub : slide.description}
            </p>
          </div>
        </div>
        <button
          className="redeem-button"
          style={
            slide.buttonColor
              ? { color: slide.buttonColor, boxShadow: slide.buttonShadow }
              : undefined
          }
          onClick={() => onNavigate(slide.buttonPath || "/rewards")}
        >
          {slide.buttonLabel || "Redeem Rewards"}
        </button>
      </>
    );
  };

  return (
    <div className="alumni-dashboard">
      <style>{slideTransitionStyles}</style>
      <Sidebar />
      <div
        className="dashboard-content"
        style={{ marginLeft: isMobile ? 0 : `${sidebarWidth}px` }}
      >
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Welcome Bark!</h1>
            <p>Let's see what's new in your alumni network.</p>
          </div>
          <div
            className={`notification-bell ${isMobile ? "mobile" : ""}`}
            style={{
              marginLeft: "auto",
              alignSelf: "flex-start",
              paddingTop: "15px",
              marginRight: "35px",
            }}
          >
            <NotificationBell onSeeAll={() => onNavigate("/notifications")} />
          </div>
        </div>

        <div className="reward-banner reward-banner-slider" ref={bannerRef}>
          <button
            className="reward-nav reward-nav--left"
            onClick={prevSlide}
            aria-label="Previous"
            style={{ zIndex: 10 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className="reward-nav reward-nav--right"
            onClick={nextSlide}
            aria-label="Next"
            style={{ zIndex: 10 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <div className="slide-dots">
            {rewardSlides.map((_, idx) => (
              <button
                key={idx}
                className={`slide-dot${idx === slideIndex ? " slide-dot--active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlideRef.current(idx);
                  resetAutoPlay(true);
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
          {rewardSlides.map((slide, idx) => {
            const isActive = idx === slideIndex;
            const isExiting = idx === prevIndex;
            if (!isActive && !isExiting) return null;
            return (
              <div
                key={idx}
                className={getSlideClass(idx)}
                style={{
                  background: slide.bgImage ? "transparent" : slide.gradient,
                }}
              >
                {slide.bgImage && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 20,
                        backgroundImage: `url(${slide.bgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        imageRendering: "high-quality",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: 20,
                        background: "rgba(0,0,0,0.55)",
                      }}
                    />
                  </>
                )}
                {renderSlideContent(slide)}
              </div>
            );
          })}
        </div>

        <div className="top-banner-row">
          <div className="hello-card">
            <div className="hello-deco-circle hello-deco-circle--tr" />
            <div className="hello-deco-circle hello-deco-circle--bl" />
            <div className="hello-card-inner">
              <h2 className="hello-text">
                Hello,
                <br />
                <span className="hello-name">{firstName}!</span>
              </h2>
              <p className="hello-notification-text">
                {unreadCount > 0 ? (
                  <>
                    You have{" "}
                    <span className="hello-notif-highlight">
                      {unreadCount} new notification
                      {unreadCount !== 1 ? "s" : ""}.
                    </span>{" "}
                    Check it now!
                  </>
                ) : (
                  "You're all caught up. No new notifications."
                )}
              </p>
            </div>
          </div>
          <div className="survey-card">
            <div className="survey-blur" />
            <div className="survey-deco-circle survey-deco-circle--tl" />
            <div className="survey-deco-circle survey-deco-circle--br" />
            <div className="survey-card-content">
              <p className="survey-label">TRACER SURVEY</p>
              <p className="survey-message">
                Your alumni tracer survey progress!
              </p>
              <button
                className="continue-button"
                onClick={() => surveyRoute && onSurveyNavigate(surveyRoute)}
                disabled={!surveyRoute}
                style={{
                  opacity: surveyRoute ? 1 : 0.5,
                  cursor: surveyRoute ? "pointer" : "not-allowed",
                }}
              >
                Proceed
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8H13M13 8L9 4M13 8L9 12"
                    stroke="rgba(0, 40, 255, 0.85)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <ProgressCircle animatedPercentage={animatedPercentage} />
          </div>
        </div>

        <div className="for-you-section">
          <h3 className="for-you-heading">For You</h3>
          <p className="for-you-subtitle">See what's here for you.</p>
          <div className="for-you-grid">
            {forYouItems.map((item, i) => (
              <ForYouCard
                key={i}
                item={item}
                onNavigate={onNavigate}
                onDismissBadge={onDismissBadge}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboardView;
