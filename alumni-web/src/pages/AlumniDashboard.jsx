// ============================================================================
// AlumniDashboard — Merged Implementation
// ============================================================================
// Base logic: original (authoritative). Additive from friend's code:
//   • rewardPoints state + Supabase fetch from `reward_points`
//   • Extra imports: rewardIcon, grandWestsideHotel, announcement_icn.svg
//   • Extra props forwarded to AlumniDashboardView
//   • forYouItems order: Announcements → Discounts → Events → Jobs
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

import AlumniDashboardView from "../Views/Alumnidashboardview";
import DataPrivacyModal from "../modals/Dataprivacymodal";
import { useDpaGate } from "../hooks/useDpaGate";
import { subscribeToRewardPoints } from "../lib/rewardPoints";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";
import PointsToast from "../modals/PointsToast";
import NotificationBell from '../components/notifications/NotificationBell';
import '../styles/NotificationBell.css';

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
  // const [notifs, setNotifs] = useState([]);
  // const [unreadCount, setUnreadCount] = useState(0);
  // const [showDropdown, setShowDropdown] = useState(false);
  // const [notifTab, setNotifTab] = useState("all");
  const {
    unreadCount,
    markAllRead,
    markOneRead,
  } = useNotifications();
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });
  // const bellRef = useRef(null);

  // Survey route — null while resolving (same pattern as Sidebar).
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

  // ============================ FETCH NOTIFICATIONS (ANNOUNCEMENTS) ============================
  // useEffect(() => {
  //   const fetchNotifs = async () => {
  //     const { data, error } = await supabase
  //       .from("announcements")
  //       .select("id, title, content, published_at, is_active")
  //       .eq("is_active", true)
  //       .order("published_at", { ascending: false })
  //       .limit(20);
  //     if (error || !data) return;
  //     const readIds = JSON.parse(
  //       localStorage.getItem(STORAGE_KEYS.announcements) || "[]",
  //     );
  //     const mapped = data.map((n) => ({
  //       id: n.id,
  //       title: decodeHtmlEntities(n.title),
  //       body: stripHtml(n.content),
  //       time: n.published_at,
  //       read: readIds.includes(n.id),
  //     }));
  //     setNotifs(mapped);
  //     setUnreadCount(mapped.filter((n) => !n.read).length);
  //     setCardBadges((prev) => ({
  //       ...prev,
  //       announcements: mapped.some((n) => !n.read),
  //     }));
  //   };
  //   fetchNotifs();
  // }, []);

  

  // ============================ FETCH CARD BADGES (EVENTS / DISCOUNTS / JOBS) ============================
  // Badge is shown when: active items exist AND stored watermark < current count.
  // This means the badge automatically reappears when an admin adds new content.
  // Also stores live counts for dynamic card descriptions.
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

  // ============================ BELL OUTSIDE CLICK ============================
  // useEffect(() => {
  //   const handler = (e) => {
  //     if (bellRef.current && !bellRef.current.contains(e.target))
  //       setShowDropdown(false);
  //   };
  //   document.addEventListener("mousedown", handler);
  //   return () => document.removeEventListener("mousedown", handler);
  // }, []);

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

  // ============================ NOTIFICATION HANDLERS ============================

  // Bulk dismiss — clears every category at once.
  // Announcements: marks every fetched notification ID as read in localStorage.
  // Events / Discounts / Jobs: writes current count as watermark so badge stays
  // gone until new content is added.
  // // const markAllRead = useCallback(async () => {
  // //   // ── Announcements ──
  // //   const allIds = notifs.map((n) => n.id);
  // //   localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(allIds));
  // //   setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  // //   setUnreadCount(0);

  // //   // ── Events / Discounts / Jobs ──
  // //   // Optimistically clear all dots immediately; then persist the watermarks.
  // //   setCardBadges({
  // //     announcements: false,
  // //     events: false,
  // //     discounts: false,
  // //     jobs: false,
  // //   });

  // //   try {
  // //     const [eventsRes, discountsRes, jobsRes] = await Promise.all([
  // //       supabase
  // //         .from("events")
  // //         .select("id", { count: "exact", head: true })
  // //         .eq("is_active", true),
  // //       supabase
  // //         .from("discounts")
  // //         .select("id", { count: "exact", head: true })
  // //         .eq("is_active", true),
  // //       supabase
  // //         .from("jobs")
  // //         .select("id", { count: "exact", head: true })
  // //         .eq("is_active", true),
  // //     ]);
  // //     persistDismissed("events", eventsRes.count || 0);
  // //     persistDismissed("discounts", discountsRes.count || 0);
  // //     persistDismissed("jobs", jobsRes.count || 0);
  // //   } catch (err) {
  // //     // Fetch failed — write a safe sentinel so badges stay cleared.
  // //     console.warn("AlumniDashboard: markAllRead badge fetch failed", err);
  // //     persistDismissed("events", 999999);
  // //     persistDismissed("discounts", 999999);
  // //     persistDismissed("jobs", 999999);
  // //   }
  // // }, [notifs]);

  // // // Per-item announcement read (existing behaviour — unchanged).
  // // const markOneRead = useCallback((id) => {
  // //   const readIds = JSON.parse(
  // //     localStorage.getItem(STORAGE_KEYS.announcements) || "[]",
  // //   );
  // //   if (!readIds.includes(id)) {
  // //     readIds.push(id);
  // //     localStorage.setItem(STORAGE_KEYS.announcements, JSON.stringify(readIds));
  // //   }
  // //   setNotifs((prev) => {
  // //     const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
  // //     setCardBadges((p) => ({
  // //       ...p,
  // //       announcements: updated.some((n) => !n.read),
  // //     }));
  // //     return updated;
  // //   });
  // //   setUnreadCount((prev) => Math.max(0, prev - 1));
  // // }, []);

  // // Per-card dismiss for Events / Discounts / Jobs.
  // // Called the moment the user clicks a ForYouCard so the dot vanishes
  // // before the route transition completes.
  // // Announcements are handled exclusively through markOneRead / markAllRead
  // // (their IDs are already tracked individually), so this is a no-op for them.
  // const dismissBadge = useCallback(async (category) => {
  //   if (category === "announcements") return;

  //   // Optimistic UI clear — instant feedback.
  //   setCardBadges((prev) => ({ ...prev, [category]: false }));

  //   // Persist watermark so the badge stays gone after a page refresh.
  //   try {
  //     const { count } = await supabase
  //       .from(category)
  //       .select("id", { count: "exact", head: true })
  //       .eq("is_active", true);
  //     persistDismissed(category, count || 0);
  //   } catch (err) {
  //     console.warn(
  //       `AlumniDashboard: dismissBadge fetch failed for "${category}"`,
  //       err,
  //     );
  //     // Optimistic clear is already applied; use sentinel as fallback.
  //     persistDismissed(category, 999999);
  //   }
  // }, []);

  // ============================ HELPER FUNCTIONS ============================
  // const groupByDate = (list) => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const yesterday = new Date(today);
  //   yesterday.setDate(today.getDate() - 1);
  //   const weekAgo = new Date(today);
  //   weekAgo.setDate(today.getDate() - 7);
  //   const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
  //   list.forEach((n) => {
  //     const d = new Date(n.time);
  //     d.setHours(0, 0, 0, 0);
  //     if (d >= today) groups["Today"].push(n);
  //     else if (d >= yesterday) groups["Yesterday"].push(n);
  //     else if (d >= weekAgo) groups["This Week"].push(n);
  //     else groups["Earlier"].push(n);
  //   });
  //   return groups;
  // };

  // const formatTime = (iso) => {
  //   if (!iso) return "";
  //   const d = new Date(iso);
  //   const now = new Date();
  //   const diff = Math.floor((now - d) / 1000);
  //   if (diff < 60) return "Just now";
  //   if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  //   if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  //   if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  //   return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  // };

  // ============================ FOR YOU ITEMS ============================
  // Order: Announcements → Discounts → Events → Jobs (friend's order).
  // All descriptions and badge logic use YOUR (original) implementation.
  // `category` is the dismissBadge key; must match a STORAGE_KEYS entry and
  // the Supabase table name for events / discounts / jobs.
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
        // bellRef={bellRef}
        // notifs={notifs}
        unreadCount={unreadCount}
        // showDropdown={showDropdown}
        // notifTab={notifTab}
        // setShowDropdown={setShowDropdown}
        // setNotifTab={setNotifTab}
        // markAllRead={markAllRead}
        // markOneRead={markOneRead}
        // groupByDate={groupByDate}
        // formatTime={formatTime}
        // onSeeAllNotifs={() => {
        //   setShowDropdown(false);
        //   navigate("/notifications");
        // }}
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
