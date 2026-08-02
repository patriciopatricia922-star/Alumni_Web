import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AnnouncementsView from "../Views/AnnouncementsView";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";
import PointsToast from "../modals/PointsToast";
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import DataPrivacyModal from "../modals/DataPrivacyModal";
import { useDpaGate } from "../hooks/useDpaGate";

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

const CATEGORIES = ["All Announcements", "Activities", "News"];

const STORAGE_KEY_ANNOUNCEMENTS = "read_notifs";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso),
    now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

const Announcements = () => {
  const navigate = useNavigate();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const bellRef = useRef(null);
  const filterRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState("All Announcements");
  const [showFilter, setShowFilter] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab, setNotifTab] = useState("all");
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });
  const [surveyRoute, setSurveyRoute] = useState(null);
  const { showModal, requestNavigation, handleAccept, handleDecline } =
    useDpaGate(navigate);

  // Fetch announcements from Supabase
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("announcements")
        .select(
          "id, title, content, published_at, is_active, category, image_url, image_urls",
        )
        .eq("is_active", true)
        .order("published_at", { ascending: false });

      if (!error && data) {
        const formattedAnnouncements = data.map((a) => ({
          id: a.id,
          title: a.title,
          description: a.content,
          time: formatTime(a.published_at),
          category: a.category || "News",
          published_at: a.published_at,
          image: a.image_url || null,
          images: a.image_urls?.length
            ? a.image_urls
            : a.image_url
              ? [a.image_url]
              : null,
        }));
        setAnnouncements(formattedAnnouncements);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const resolveSurveyRoute = async () => {
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();
        if (cancelled) return;
        setSurveyRoute(complete ? "/update-tracer" : await getResumeRoute());
      } catch (err) {
        console.error("Announcements: error resolving survey route:", err);
        if (!cancelled) setSurveyRoute("/survey/personal-background");
      }
    };
    resolveSurveyRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch notifications for the bell dropdown AND auto-mark all as read
  // because the user is on the Announcements page — they are actively
  // viewing the content, so the red indicator should clear immediately.
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("id, title, content, published_at, is_active")
        .eq("is_active", true)
        .order("published_at", { ascending: false })
        .limit(20);
      if (error || !data) return;

      // Auto-mark every fetched announcement as read in localStorage.
      // This mirrors the exact same key used by AlumniDashboard so the
      // dashboard bell badge clears the next time it mounts/re-renders.
      const allIds = data.map((n) => n.id);
      const existingReadIds = JSON.parse(
        localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS) || "[]",
      );
      const mergedReadIds = Array.from(
        new Set([...existingReadIds, ...allIds]),
      );
      localStorage.setItem(
        STORAGE_KEY_ANNOUNCEMENTS,
        JSON.stringify(mergedReadIds),
      );

      // Build notif list with every item pre-marked read so the bell
      // dropdown also reflects the cleared state instantly.
      const mapped = data.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.content,
        time: n.published_at,
        read: true, // all read — user is on this page
      }));
      setNotifs(mapped);
      setUnreadCount(0); // clear the red badge on the bell immediately
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target))
        setShowDropdown(false);
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useSurveyRewardClaim({
    onPointsSynced: () => {},
    onClaimedStatus: () => {},
    onToast: setToast,
  });
  

  const handleSurveyNavigate = useCallback(() => {
    if (!surveyRoute) return;
    if (surveyRoute === "/update-tracer") {
      navigate(surveyRoute);
    } else {
      sessionStorage.setItem("survey_claim_reward", "1");
      requestNavigation(surveyRoute);
    }
  }, [surveyRoute, requestNavigation, navigate]);

  // markAllRead is kept for the dropdown's "Mark all read" button;
  // on this page it is effectively a no-op since all are already read,
  // but we preserve the handler so the view contract is unchanged.
  const markAllRead = useCallback(() => {
    const allIds = notifs.map((n) => n.id);
    localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(allIds));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS) || "[]",
    );
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(readIds));
    }
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], "This Week": [], Earlier: [] };
    list.forEach((n) => {
      const d = new Date(n.time);
      d.setHours(0, 0, 0, 0);
      if (d >= today) groups["Today"].push(n);
      else if (d >= yesterday) groups["Yesterday"].push(n);
      else if (d >= weekAgo) groups["This Week"].push(n);
      else groups["Earlier"].push(n);
    });
    return groups;
  };

  const filtered =
    activeCategory === "All Announcements"
      ? announcements
      : announcements.filter((a) => a.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] =
      cat === "All Announcements"
        ? announcements.length
        : announcements.filter((a) => a.category === cat).length;
    return acc;
  }, {});

  return (
    <>
      {showModal && (
        <DataPrivacyModal onAccept={handleAccept} onDecline={handleDecline} />
      )}

      <PointsToast
        visible={toast.visible}
        points={toast.points}
        newBalance={toast.newBalance}
        label={toast.label}
        onDismiss={() => setToast((t) => ({ ...t, visible: false }))}
      />

      <AnnouncementsView
        isMobile={isMobile}
        isTablet={isTablet}
        // announcements
        filtered={filtered}
        loading={loading}
        categories={CATEGORIES}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categoryCounts={categoryCounts}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        filterRef={filterRef}
        // notifications
        bellRef={bellRef}
        notifs={notifs}
        unreadCount={unreadCount}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        notifTab={notifTab}
        setNotifTab={setNotifTab}
        markAllRead={markAllRead}
        markOneRead={markOneRead}
        groupByDate={groupByDate}
        formatTime={formatTime}
        // navigation
        navigate={navigate}
      />
    </>
  );
};

export default Announcements;
