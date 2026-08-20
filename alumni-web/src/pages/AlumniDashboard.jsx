// ============================================================================
// AlumniDashboard — Merged Implementation with Dynamic RewardsCard (All Content)
// ============================================================================
// Base logic: original (authoritative). Additive from friend's code:
//   • rewardPoints state + Supabase fetch from `reward_points`
//   • Extra imports: rewardIcon, grandWestsideHotel, announcement_icn.svg
//   • Extra props forwarded to AlumniDashboardView
//   • forYouItems order: Announcements → Discounts → Events → Jobs
//   • NEW: Dynamic RewardsCard content from ALL existing Events/Announcements/Jobs/Discounts
// ============================================================================
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  loadSurveyProgress,
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import { logAction } from "../lib/auditLogger";
import { stripHtml, decodeHtmlEntities } from "../utils/textHelpers";
// Icons — announcement_icn.svg (friend's variant) is used as the primary
// announcement icon; the original announcement_ic.svg is kept as a fallback
// alias so any view code referencing either name continues to work.
import announcementIcon from "../assets/announcement_icn.svg";
import rewardIcon from "../assets/reward_icn.svg";
import discountIcon from "../assets/discount_ic.svg";
import eventsIcon from "../assets/events_ic.svg";
import jobsIcon from "../assets/jobs_ic.svg";
import grandWestsideHotel from "../assets/grandwestside_hotel.jpeg";
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';
import AlumniDashboardView from "../Views/Alumnidashboardview";
import DataPrivacyModal from "../modals/Dataprivacymodal";
import { useDpaGate } from "../hooks/useDpaGate";
import { subscribeToRewardPoints } from "../lib/rewardPoints";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";
import { useNotifications } from "../hooks/useNotifications";
import PointsToast from "../modals/PointsToast";

// ============================ STORAGE KEYS ============================
// Centralised localStorage keys for all four badge categories.
// announcements: array of read IDs  (existing behaviour — unchanged)
// events|discounts|jobs: numeric count watermark — badge shows when
//   active item count exceeds the stored watermark.
const STORAGE_KEYS = {
  announcements: "read_notifs",
  events: "read_events_badge",
  discounts: "read_discounts_badge",
  jobs: "read_jobs_badge",
};

// ============================ HELPERS ============================
// Returns true when the user has already seen all items in `category`.
const isCategoryDismissed = (category, currentCount) => {
  const stored = parseInt(
    localStorage.getItem(STORAGE_KEYS[category]) || "0",
    10,
  );
  return stored >= currentCount;
};

// Persist the current count as the "seen" watermark for a category.
const persistDismissed = (category, count) => {
  localStorage.setItem(STORAGE_KEYS[category], String(count));
};

// Resolve image URL from raw Supabase row (mirrors Landingpageview.jsx pattern)
const resolveImage = (item, type) => {
  const FALLBACKS = {
    events: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    jobs: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80',
    discounts: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    announcements: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80'
  };
  // Prioritize image_url as per LandingPage implementation, then check other common fields
  return item.image_url || item.image || item.cover_image || item.banner_url || FALLBACKS[type] || null;
};

// ============================ WINDOW WIDTH HOOK ============================
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1440,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
};

// ============================ MAIN COMPONENT ============================
const AlumniDashboard = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();

  // ============================ DPA GATE ============================
  const { showModal, requestNavigation, handleAccept, handleDecline } =
    useDpaGate(navigate);

  // ============================ STATE DECLARATIONS ============================
  const [user, setUser] = useState(null);
  const [surveyProgress, setSurveyProgress] = useState({ percentage: 0 });
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const { unreadCount, markAllRead, markOneRead } = useNotifications();
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });
  const [surveyRoute, setSurveyRoute] = useState(null);
  const [cardBadges, setCardBadges] = useState({
    announcements: false,
    events: false,
    discounts: false,
    jobs: false,
  });

  // ============================ DYNAMIC COUNTS FOR FOR-YOU CARDS ============================
  const [cardCounts, setCardCounts] = useState({
    events: 0,
    discounts: 0,
    jobs: 0,
  });

  // ============================ REWARD POINTS (from friend's code) ============================
  const [rewardPoints, setRewardPoints] = useState(0);

  useSurveyRewardClaim({
    onPointsSynced: setRewardPoints,
    onClaimedStatus: () => {},
    onToast: setToast,
    onClaimed: () => {
      refreshSurveyProgress();
      refreshBadges();
    },
  });

  // ============================ DYNAMIC REWARDS CARD CONTENT ============================
  const [dynamicRewardSlide, setDynamicRewardSlide] = useState(null);
  const [loadingRewardContent, setLoadingRewardContent] = useState(true);

  // Fetch and randomize from ALL available content for RewardsCard
  const fetchAndRandomizeRewardContent = useCallback(async () => {
    try {
      // Fetch a larger pool of active items from each content type
      // Using limit(50) to get a good variety without fetching the entire database if it's huge
      const [eventsRes, announcementsRes, jobsRes, discountsRes] =
        await Promise.all([
          supabase
            .from("events")
            .select("*")
            .eq("is_active", true)
            .gte("event_date", new Date().toISOString()) // Keep future events for relevance
            .order("event_date", { ascending: true })
            .limit(50),
          supabase
            .from("announcements")
            .select("*")
            .eq("is_active", true)
            .order("published_at", { ascending: false })
            .limit(50),
          supabase
            .from("jobs")
            .select("*")
            .eq("is_active", true)
            .order("posted_at", { ascending: false })
            .limit(50),
          supabase
            .from("discounts")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

      // Build array of all available content items
      const allAvailableContent = [];

      if (eventsRes.data && eventsRes.data.length > 0) {
        eventsRes.data.forEach((event) => {
          allAvailableContent.push({
            type: "events",
            data: event,
            slide: {
              label: "Event",
              title: event.title || "Upcoming Event",
              description:
                stripHtml(event.description)?.substring(0, 100) +
                  (stripHtml(event.description)?.length > 100 ? "..." : "") ||
                "Check out our latest alumni event!",
              buttonLabel: "View Events",
              buttonPath: "/events",
              gradient:
                "linear-gradient(90deg, #7c3aed 0%, #9b5cf6 50%, #c4a0ff 100%)",
              icon: eventsIcon,
              iconSize: 137,
              iconTransform: "translateY(1.5px)",
              iconBg: "transparent",
              bgImage: resolveImage(event, "events"),
              buttonColor: "#5b21b6",
              buttonShadow: "0 12px 24px rgba(91,33,182,0.12)",
            },
          });
        });
      }

      if (announcementsRes.data && announcementsRes.data.length > 0) {
        announcementsRes.data.forEach((announcement) => {
          allAvailableContent.push({
            type: "announcements",
            data: announcement,
            slide: {
              label: "Announcement",
              title: announcement.title || "Latest Announcement",
              description:
                stripHtml(announcement.content)?.substring(0, 100) +
                  (stripHtml(announcement.content)?.length > 100
                    ? "..."
                    : "") || "Stay updated with the latest news!",
              buttonLabel: "View Announcements",
              buttonPath: "/announcements",
              gradient:
                "linear-gradient(90deg, #C01828 0%, #D92B40 50%, #F24057 100%)",
              icon: announcementIcon,
              iconSize: 142,
              iconBg: "transparent",
              bgImage: resolveImage(announcement, "announcements"),
              buttonColor: "#C0152A",
              buttonShadow: "0 12px 24px rgba(192,21,42,0.12)",
            },
          });
        });
      }

      if (jobsRes.data && jobsRes.data.length > 0) {
        jobsRes.data.forEach((job) => {
          allAvailableContent.push({
            type: "jobs",
            data: job,
            slide: {
              label: "Job",
              title: job.title || "Career Opportunity",
              description:
                stripHtml(job.description)?.substring(0, 100) +
                  (stripHtml(job.description)?.length > 100 ? "..." : "") ||
                "Explore career opportunities!",
              buttonLabel: "View Jobs",
              buttonPath: "/jobs",
              gradient:
                "linear-gradient(90deg, #0a7a5a 0%, #10b87e 50%, #4dd9a4 100%)",
              icon: jobsIcon,
              iconSize: 110,
              iconBg: "transparent",
              bgImage: resolveImage(job, "jobs"),
              buttonColor: "#065f46",
              buttonShadow: "0 12px 24px rgba(6,95,70,0.12)",
            },
          });
        });
      }

      if (discountsRes.data && discountsRes.data.length > 0) {
        discountsRes.data.forEach((discount) => {
          allAvailableContent.push({
            type: "discounts",
            data: discount,
            slide: {
              label: "Discount",
              title: discount.title || "Exclusive Discount",
              description:
                stripHtml(discount.description)?.substring(0, 100) +
                  (stripHtml(discount.description)?.length > 100
                    ? "..."
                    : "") || "Enjoy exclusive alumni benefits!",
              buttonLabel: "View Discounts",
              buttonPath: "/discounts",
              gradient:
                "linear-gradient(90deg, rgba(120,60,0,0.72) 0%, rgba(160,80,0,0.60) 50%, rgba(100,50,0,0.72) 100%)",
              icon: discountIcon,
              iconSize: 110,
              iconBg: "transparent",
              bgImage: resolveImage(discount, "discounts") || grandWestsideHotel,
              buttonColor: "#7a3c00",
              buttonShadow: "0 12px 24px rgba(120,60,0,0.18)",
            },
          });
        });
      }

      // Randomly select from ALL available content
      if (allAvailableContent.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * allAvailableContent.length,
        );
        setDynamicRewardSlide(allAvailableContent[randomIndex].slide);
      } else {
        // Fallback to a default message if no content is available
        setDynamicRewardSlide({
          label: "Welcome",
          title: "Alumni Network",
          description: "Connect with fellow alumni and explore opportunities!",
          buttonLabel: "Explore More",
          buttonPath: "/dashboard",
          gradient:
            "linear-gradient(90deg, #1A55C0 0%, #2E6AE8 50%, #4A85F5 100%)",
          icon: rewardIcon,
          iconBg: "transparent",
        });
      }
    } catch (error) {
      console.error("[AlumniDashboard] Error fetching reward content:", error);
      // Set a safe fallback on error
      setDynamicRewardSlide({
        label: "Welcome",
        title: "Alumni Network",
        description: "Connect with fellow alumni and explore opportunities!",
        buttonLabel: "Explore More",
        buttonPath: "/dashboard",
        gradient:
          "linear-gradient(90deg, #1A55C0 0%, #2E6AE8 50%, #4A85F5 100%)",
        icon: rewardIcon,
        iconBg: "transparent",
      });
    } finally {
      setLoadingRewardContent(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAndRandomizeRewardContent();
  }, [fetchAndRandomizeRewardContent]);

  // Refresh when navigating back to dashboard or periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAndRandomizeRewardContent();
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [fetchAndRandomizeRewardContent]);

  // ============================ RESPONSIVE BREAKPOINTS ============================
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const sidebarWidth = isTablet ? 200 : 229;

  const refreshSurveyProgress = useCallback(async () => {
    const progress = await loadSurveyProgress();
    if (progress) setSurveyProgress(progress);
  }, []);

  const refreshBadges = useCallback(async () => {
    const [eventsRes, discountsRes, jobsRes] = await Promise.all([
      supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("discounts")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("jobs")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
    ]);
    const eventsCount = eventsRes.count || 0;
    const discountsCount = discountsRes.count || 0;
    const jobsCount = jobsRes.count || 0;
    setCardCounts({
      events: eventsCount,
      discounts: discountsCount,
      jobs: jobsCount,
    });
    setCardBadges((prev) => ({
      ...prev,
      events: eventsCount > 0 && !isCategoryDismissed("events", eventsCount),
      discounts:
        discountsCount > 0 &&
        !isCategoryDismissed("discounts", discountsCount),
      jobs: jobsCount > 0 && !isCategoryDismissed("jobs", jobsCount),
    }));
  }, []);

  // ============================ DATA FETCHING ============================
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      // Fetch basic profile
      const { data } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", authUser.id)
        .single();
      if (data) setUser(data);

      // Fetch reward points (additive — from friend's code)
      const { data: rewardData, error: rewardError } = await supabase
        .from("users")
        .select("reward_points")
        .eq("id", authUser.id)
        .single();
      if (rewardError) {
        console.error(
          "[AlumniDashboard] reward_points fetch failed:",
          rewardError,
        );
      } else {
        console.log(
          "[AlumniDashboard] reward_points fetched:",
          rewardData?.reward_points,
        );
        setRewardPoints(rewardData?.reward_points ?? 0);
      }

      // Survey progress & audit log
      const progress = await loadSurveyProgress();
      if (progress) setSurveyProgress(progress);
      await logAction({
        action: "View",
        module: "Dashboard",
        description: "Alumni viewed dashboard (web)",
        status: "Success",
      });
    };
    fetchData();
  }, []);

  // ============================ RESOLVE SURVEY ROUTE ============================
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
        console.error("AlumniDashboard: error resolving survey route:", err);
        if (!cancelled) setSurveyRoute("/survey/personal-background");
      }
    };
    resolveSurveyRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = user?.first_name || "Alumni";
  const progressPct = Math.min(surveyProgress?.percentage || 0, 100);

  // ============================ ANIMATE PROGRESS CIRCLE ============================
  useEffect(() => {
    if (progressPct === 0) {
      setAnimatedPercentage(0);
      return;
    }
    let current = 0;
    const timer = setInterval(() => {
      current += progressPct / 60;
      if (current >= progressPct) {
        setAnimatedPercentage(progressPct);
        clearInterval(timer);
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [progressPct]);

  // ============================ FETCH CARD BADGES (EVENTS / DISCOUNTS / JOBS) ============================
  useEffect(() => {
    const fetchBadges = async () => {
      const [eventsRes, discountsRes, jobsRes] = await Promise.all([
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("discounts")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      const eventsCount = eventsRes.count || 0;
      const discountsCount = discountsRes.count || 0;
      const jobsCount = jobsRes.count || 0;

      // Store live counts for card descriptions
      setCardCounts({
        events: eventsCount,
        discounts: discountsCount,
        jobs: jobsCount,
      });

      setCardBadges((prev) => ({
        ...prev,
        events: eventsCount > 0 && !isCategoryDismissed("events", eventsCount),
        discounts:
          discountsCount > 0 &&
          !isCategoryDismissed("discounts", discountsCount),
        jobs: jobsCount > 0 && !isCategoryDismissed("jobs", jobsCount),
      }));
    };
    fetchBadges();
  }, []);

  // ============================ REAL-TIME REWARD SYNC (Dashboard) ============================
  const rewardChannelRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    subscribeToRewardPoints(
      (newPoints) => {
        console.log("[AlumniDashboard] realtime reward update:", newPoints);
        if (mounted) setRewardPoints(newPoints);
      },
      ({ points, newBalance }) => {
        if (!mounted) return;
        setToast({
          visible: true,
          points,
          newBalance,
          label: "Points awarded",
        });
      },
    ).then((channel) => {
      if (mounted) rewardChannelRef.current = channel;
      else channel?.unsubscribe();
    });
    return () => {
      mounted = false;
      rewardChannelRef.current?.unsubscribe();
      rewardChannelRef.current = null;
    };
  }, []);

  // Per-card dismiss for Events / Discounts / Jobs.
  const dismissBadge = useCallback(async (category) => {
    if (category === "announcements") return;

    // Optimistic UI clear — instant feedback.
    setCardBadges((prev) => ({ ...prev, [category]: false }));

    // Persist watermark so the badge stays gone after a page refresh.
    try {
      const { count } = await supabase
        .from(category)
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      persistDismissed(category, count || 0);
    } catch (err) {
      console.warn(
        `AlumniDashboard: dismissBadge fetch failed for "${category}"`,
        err,
      );
      // Optimistic clear is already applied; use sentinel as fallback.
      persistDismissed(category, 999999);
    }
  }, []);

  // ============================ FOR YOU ITEMS ============================
  const forYouItems = [
    {
      icon: announcementIcon,
      title: "Announcements",
      description:
        unreadCount > 0
          ? `${unreadCount} unread announcement${unreadCount !== 1 ? "s" : ""}`
          : "Check latest news",
      path: "/announcements",
      category: "announcements",
      showDot: cardBadges.announcements,
    },
    {
      icon: discountIcon,
      title: "Discounts",
      description:
        cardCounts.discounts > 0
          ? `${cardCounts.discounts} offer${cardCounts.discounts !== 1 ? "s" : ""} available`
          : "No offers available",
      path: "/discounts",
      category: "discounts",
      showDot: cardBadges.discounts,
    },
    {
      icon: eventsIcon,
      title: "Events",
      description:
        cardCounts.events > 0
          ? `${cardCounts.events} upcoming event${cardCounts.events !== 1 ? "s" : ""}`
          : "No upcoming events",
      path: "/events",
      category: "events",
      showDot: cardBadges.events,
    },
    {
      icon: jobsIcon,
      title: "Jobs",
      description:
        cardCounts.jobs > 0
          ? `${cardCounts.jobs} listing${cardCounts.jobs !== 1 ? "s" : ""} available`
          : "No listings available",
      path: "/jobs",
      category: "jobs",
      showDot: cardBadges.jobs,
    },
  ];

  // ============================ SURVEY NAVIGATION (DPA-GATED) ============================
  const handleSurveyNavigate = useCallback(
    (route) => {
      sessionStorage.setItem("survey_origin_route", "/dashboard");
      if (route === "/update-tracer") {
        navigate(route);
        return;
      }
      requestNavigation(route);
    },
    [requestNavigation, navigate],
  );

  // ============================ RENDER ============================
  return (
    <>
      <PointsToast
        visible={toast.visible}
        points={toast.points}
        newBalance={toast.newBalance}
        label={toast.label}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />
      {showModal && (
        <DataPrivacyModal onAccept={handleAccept} onDecline={handleDecline} />
      )}
      <AlumniDashboardView
        // ── Layout ──
        isMobile={isMobile}
        isTablet={isTablet}
        sidebarWidth={sidebarWidth}
        // ── User ──
        firstName={firstName}
        // ── Notifications / Bell ──
        unreadCount={unreadCount}
        // ── Survey progress ──
        animatedPercentage={animatedPercentage}
        surveyRoute={surveyRoute}
        onSurveyNavigate={handleSurveyNavigate}
        // ── For-you cards ──
        forYouItems={forYouItems}
        onNavigate={navigate}
        onDismissBadge={dismissBadge}
        // ── Reward points (additive — from friend's code) ──
        rewardPoints={rewardPoints}
        // ── Dynamic RewardsCard content ──
        dynamicRewardSlide={dynamicRewardSlide}
        loadingRewardContent={loadingRewardContent}
        // ── Asset references forwarded to view (additive — from friend's code) ──
        announcementIcon={announcementIcon}
        rewardIcon={rewardIcon}
        discountIcon={discountIcon}
        eventsIcon={eventsIcon}
        jobsIcon={jobsIcon}
        grandWestsideHotel={grandWestsideHotel}
      />
    </>
  );
};

export default AlumniDashboard;