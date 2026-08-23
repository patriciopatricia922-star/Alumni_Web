import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import megaphoneIcon from "../assets/announcement_icn.svg";
import calenderIcon from "../assets/calendar_ic.svg";
import documentIcon from "../assets/document_ic.svg";
import clockIcon from "../assets/clock_icn.svg";
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import { truncateHtml, createMarkup } from "../utils/textHelpers";
import "../styles/Announcements.css";
import NotificationBell from '../components/notifications/NotificationBell'; // NEW IMPORT
import '../styles/NotificationBell.css';

const CATEGORY_ICONS = {
  News: megaphoneIcon,
  Activities: calenderIcon,
};

const getIcon = (category) => CATEGORY_ICONS[category] || documentIcon;

// ── Icons ──────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
  <img
    src={clockIcon}
    alt=""
    aria-hidden="true"
    width="12"
    height="12"
    style={{ 
      display: "block", 
      flexShrink: 0,
      // FIX: Apply brightness filter to ensure visibility on white background
      // Matches the treatment used in the Alumni Tracer Survey banner
      filter: "brightness(0.4)" 
    }}
  />
);

// ── Announcement Card ─────────────────────────────────────────────────────────
const AnnouncementCard = ({ announcement, isMobile, isTablet }) => {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);

  const images = announcement.images?.length
    ? announcement.images
    : announcement.image
    ? [announcement.image]
    : [];

  const prevImg = (e) => {
    e.stopPropagation();
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  };

  const nextImg = (e) => {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % images.length);
  };

  const [hovered, setHovered] = useState(false);
  const hasDetails = Boolean(announcement.time);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        border: `1px solid ${hovered || expanded ? "rgba(0,62,166,0.25)" : "rgba(0,0,0,0.07)"}`,
        boxShadow:
          hovered || expanded
            ? "0px 12px 32px rgba(0,62,166,0.15), 0px 4px 16px rgba(0,0,0,0.08)"
            : "0px 4px 16px rgba(0,0,0,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        maxWidth: "96%",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* ── Photo with arrows + category pill ─ */}
      {images.length > 0 && (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "330px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={images[imgIndex]}
            alt={announcement.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.35s ease",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          {/* Left / Right arrows */}
          <>
            <button
              onClick={prevImg}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.4)")
              }
            >
              <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                <path
                  d="M7 1L3 5L7 9"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={nextImg}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(0,0,0,0.4)",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.65)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.4)")
              }
            >
              <svg width="13" height="13" viewBox="0 0 10 10" fill="none">
                <path
                  d="M3 1L7 5L3 9"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Dot indicators */}
            <div
              style={{
                position: "absolute",
                bottom: "7.5px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "5px",
                zIndex: 10,
              }}
            >
              {images.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIndex(i);
                  }}
                  style={{
                    width: i === imgIndex ? "18px" : "6px",
                    height: "6px",
                    borderRadius: "3px",
                    background:
                      i === imgIndex ? "#fff" : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>
          </>
          {/* Category tag — bottom-left, white pill (matches discount card) */}
          {announcement.category && (
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "12px",
                background: "rgba(255,255,255,0.92)",
                borderRadius: "999px",
                padding: "4px 10px",
              }}
            >
              <span
                style={{
                  fontFamily: "'Montserrat', Arial, sans-serif",
                  fontWeight: 600,
                  fontSize: "11px",
                  color: "#1e3a5f",
                  lineHeight: 1,
                }}
              >
                {announcement.category}
              </span>
            </div>
          )}
        </div>
      )}
      {/* ── Body ── */}
      <div
        style={{
          padding: "18px 20px 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <p
            style={{
              fontFamily: "'Montserrat', Arial, sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              lineHeight: 1.45,
              color: "#1e3a5f",
              margin: 0,
              wordBreak: "break-word",
              flex: 1,
            }}
          >
            {announcement.title}
          </p>
        </div>
        {/* Description — truncated or full depending on expanded state */}
        {!expanded ? (
          <p
            style={{
              fontFamily: "'Montserrat', Arial, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              lineHeight: 1.65,
              color: "#4a5565",
              margin: "0 0 16px 0",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {truncateHtml(announcement.description, 80)}
          </p>
        ) : (
          <div
            style={{
              fontFamily: "'Montserrat', Arial, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              lineHeight: 1.65,
              color: "#4a5565",
              margin: "0 0 16px 0",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
            dangerouslySetInnerHTML={createMarkup(announcement.description)}
          />
        )}
        {/* Divider */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "rgba(0,0,0,0.08)",
          }}
        />
        {/* ── Expandable details (timestamp) ─ */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: expanded ? "200px" : "0px",
            transition:
              "max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {hasDetails && (
            <div
              style={{
                padding: "14px 0 4px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <ClockIcon />
                </div>
                <p
                  style={{
                    fontFamily: "'Montserrat', Arial, sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: 1.6,
                    color: "#4a5565",
                    margin: 0,
                  }}
                >
                  {announcement.time}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ─ Toggle button ── */}
      <div style={{ padding: "14px 20px 20px" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
            if (!expanded) setRead(true);
          }}
          style={{
            width: "100%",
            height: "37px",
            background: expanded ? "transparent" : "#003ea6",
            border: expanded ? "1.5px solid #003ea6" : "none",
            borderRadius: "10px",
            fontFamily: "'Montserrat', Arial, sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: expanded ? "#003ea6" : "#ffffff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            transition: "background 0.15s, color 0.15s, border-color 0.15s",
          }}
        >
          {expanded ? (
            <>
              See Less <FaChevronUp size={10} />
            </>
          ) : (
            <>
              See More <FaChevronDown size={10} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main View ──────────────────────────────────────────────────────────────────
const AnnouncementsView = ({
  isMobile,
  isTablet,
  filtered,
  loading,
  categories,
  activeCategory,
  setActiveCategory,
  categoryCounts,
  showFilter,
  setShowFilter,
  filterRef,
  navigate,
}) => {
  const sidebarWidth = isTablet ? 200 : 229;
  const [surveyRoute, setSurveyRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const resolveSurveyRoute = async () => {
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();
        if (cancelled) return;
        if (complete) {
          setSurveyRoute("/update-tracer");
        } else {
          const route = await getResumeRoute();
          if (!cancelled) setSurveyRoute(route);
        }
      } catch (err) {
        console.error("AnnouncementsView: error resolving survey route:", err);
        if (!cancelled) setSurveyRoute("/survey/personal-background");
      }
    };
    resolveSurveyRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="ann-page" style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div
        className={
          isMobile
            ? "announcements-main-content mobile"
            : isTablet
            ? "announcements-main-content tablet"
            : "announcements-main-content"
        }
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          flex: 1,
          padding: isMobile
            ? "24px 16px 90px"
            : isTablet
            ? "37px 32px 48px"
            : "37px 51px 60px",
          boxSizing: "border-box",
          maxWidth: "100%",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        <NotificationBell
          onSeeAll={() => navigate('/notifications')}
          className={isMobile ? 'mobile' : ''}
          autoMarkReadOnMount={true}
        />
        <button className="ann-back" onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 17 17" fill="none">
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
        <div
          className="ann-hdr"
          style={{
            paddingRight: isMobile ? "60px" : "90px",
            marginBottom: isMobile ? "20px" : "28px",
            marginLeft: isMobile ? "4px" : "40px",
            marginTop: "10px",
          }}
        >
          <h1 className="ann-heading">Announcements</h1>
          <p
            className="ann-subheading"
            style={{
              fontFamily: "Montserrat, Arial",
              fontWeight: 400,
              fontSize: isMobile ? "12px" : "13.5px",
              lineHeight: isMobile ? "1.5" : "0.3",
              margin: 0,
              marginLeft: isMobile ? 0 : "-4px",
              marginTop: "12px",
            }}
          >
            Stay connected with the latest news, events, and opportunities from
            your alumni network.
          </p>
        </div>
        {!isMobile && (
          <div
            className="ann-banner"
            style={{
              position: "relative",
              padding: isTablet ? "24px 28px" : "24px 32px",
              border: "1px solid #E5E7EB",
              boxShadow:
                "0px 2px 8px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06)",
              borderRadius: "24px",
              marginBottom: isTablet ? "28px" : "32px",
              marginLeft: "20px",
              marginRight: "-24px",
              transform: "translateX(6px)",
              marginTop: "40px",
              width: "calc(100% - 42px)",
              overflow: "hidden",
              display: "flex",
              gap: "24px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "256px",
                height: "256px",
                right: "-30px",
                top: "-127px",
                background: "#2B72FB",
                opacity: 0.05,
                filter: "blur(64px)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                width: isTablet ? "80px" : "120px",
                height: isTablet ? "80px" : "120px",
                flexShrink: 0,
                background: "linear-gradient(180deg, #fcc7cb 0%, #ffb7ba 80%)",
                boxShadow: "0px 4px 10px rgba(43, 114, 251, 0.15)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={megaphoneIcon}
                alt="Megaphone"
                style={{
                  width: "110%",
                  height: "110%",
                  objectFit: "contain",
                  filter: "drop-shadow(0px 3px 4px #000000)",
                }}
              />
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <h2
                style={{
                  fontFamily: "Montserrat, Montserrat, Arial",
                  fontWeight: 700,
                  fontSize: isTablet ? "20px" : "25px",
                  lineHeight: "1.3",
                  letterSpacing: "-0.35px",
                  color: "#324D87",
                  margin: "0 0 8px 0",
                }}
              >
                Alumni Tracer Survey
              </h2>
              <p
                style={{
                  fontFamily: "Montserrat, Arial",
                  fontWeight: 400,
                  fontSize: "13px",
                  lineHeight: "22px",
                  color: "#545454",
                  margin: "0 0 16px 0",
                }}
              >
                Your feedback matters! Complete our annual survey to help us
                improve the alumni experience and community engagement.
              </p>
              <div
                style={{ display: "flex", alignItems: "center", gap: "24px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={clockIcon}
                    alt=""
                    aria-hidden="true"
                    width="14"
                    height="14"
                    style={{
                      display: "block",
                      flexShrink: 0,
                      filter: "brightness(0.4)",
                      opacity: 1,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "Montserrat, Arial",
                      fontSize: "12px",
                      color: "#8A94A6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    2 hours ago
                  </span>
                </div>
                <button
                  onClick={() => surveyRoute && navigate(surveyRoute)}
                  disabled={!surveyRoute}
                  style={{
                    height: "39px",
                    padding: "0 20px",
                    borderRadius: "14px",
                    border: "none",
                    background: "#003EA6",
                    boxShadow: "0px 4px 12px rgba(0, 62, 166, 0.2)",
                    fontFamily: "Montserrat, Arial",
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#FFFFFF",
                    cursor: surveyRoute ? "pointer" : "not-allowed",
                    opacity: surveyRoute ? 1 : 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (surveyRoute) e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseLeave={(e) => {
                    if (surveyRoute) e.currentTarget.style.opacity = "1";
                  }}
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          className={isMobile ? "ann-filter-row mobile" : "ann-filter-row"}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            marginBottom: isMobile ? "16px" : "24px",
            marginLeft: isMobile ? "8px" : "28px",
            marginRight: isMobile ? "8px" : "15px",
            paddingRight: isMobile ? 0 : "15px",
            gap: "2px",
          }}
        >
          <div
            ref={filterRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              position: "relative",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <div
              className="ann-filter-display"
              style={{
                height: "40px",
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: "10px",
                borderRadius: "10px",
                background: "#FFFFFF",
                border: "1px solid var(--ann-card-border)",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.06)",
                minWidth: isMobile ? 0 : "236px",
                flex: isMobile ? 1 : "none",
              }}
            >
              <span
                style={{
                  fontFamily: "Montserrat, Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  lineHeight: "1.4",
                  color: "#1e3a5f",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  marginLeft: "2px",
                  flex: 1,
                }}
              >
                {activeCategory}
              </span>
              <div
                style={{
                  background: "#003ea6",
                  borderRadius: "6px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1px 7px",
                  marginLeft: "-5px",
                  flexShrink: 0,
                  verticalAlign: "middle",
                }}
              >
                <span
                  style={{
                    fontFamily: "Montserrat, Arial",
                    fontWeight: 700,
                    fontSize: "11px",
                    color: "#FFFFFF",
                  }}
                >
                  {filtered.length}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowFilter((f) => !f)}
              style={{
                height: "37px",
                padding: "0 18px",
                transform: isMobile ? "none" : "translateX(12px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "var(--ann-accent-btn)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                cursor: "pointer",
                flexShrink: 0,
                filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.15))",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M1 2H13L8.5 7.5V12L5.5 10.5V7.5L1 2Z"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  fontFamily: "Montserrat, Arial",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                FILTER
              </span>
            </button>
            {showFilter && (
              <div
                className="ann-filter-dropdown"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  background: "#FFFFFF",
                  border: "1px solid var(--ann-card-border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  zIndex: 300,
                  minWidth: isMobile ? "100%" : "236px",
                  width: isMobile ? "100%" : "auto",
                  boxShadow: "0px 10px 30px rgba(0,0,0,0.15)",
                  boxSizing: "border-box",
                }}
              >
                {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setShowFilter(false);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background:
                        activeCategory === cat
                          ? "rgba(43,114,251,0.08)"
                          : "transparent",
                      border: "none",
                      borderTop:
                        i > 0 ? "1px solid var(--ann-card-border)" : "none",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (activeCategory !== cat)
                        e.currentTarget.style.background =
                          "rgba(0,62,166,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (activeCategory !== cat)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Montserrat, Arial, sans-serif",
                        fontSize: "13.5px",
                        color: "#1e3a5f",
                        fontWeight: activeCategory === cat ? 700 : 400,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cat}
                    </span>
                    <div
                      style={{
                        background:
                          activeCategory === cat ? "#003ea6" : "#dbeafe",
                        borderRadius: "6px",
                        padding: "1px 7px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Montserrat, Arial",
                          fontWeight: 700,
                          fontSize: "11px",
                          color: activeCategory === cat ? "#FFFFFF" : "#003ea6",
                        }}
                      >
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "60px 0",
              marginLeft: "28px",
              marginRight: "-30px",
            }}
          >
            <span
              style={{
                fontFamily: "Montserrat, Arial",
                fontSize: "14px",
                color: "var(--ann-body-color)",
              }}
            >
              Loading announcements…
            </span>
          </div>
        ) : (
          <div
            className="ann-cards-list"
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : isTablet
                ? "repeat(2, 1fr)"
                : "repeat(3, 1fr)",
              gap: isMobile ? "16px" : "14px",
              alignItems: "start",
              marginLeft: isMobile ? "8px" : "24px",
              marginRight: isMobile ? "8px" : "-10px",
              paddingRight: isMobile ? 0 : "10px",
            }}
          >
            {filtered.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsView;