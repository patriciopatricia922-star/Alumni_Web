import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AnnouncementsView from "../Views/AnnouncementsView";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";
import PointsToast from "../modals/PointsToast";
import { subscribeToRewardPoints } from "../lib/rewardPoints";
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import DataPrivacyModal from "../modals/Dataprivacymodal";
import { useDpaGate } from "../hooks/useDpaGate";
import { useNotifications } from "../hooks/useNotifications";

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
  const filterRef = useRef(null);

  // NEW: read the announcement id (if any) carried by a notification
  // click, e.g. /announcements?announcement=<id>. Uses the existing
  // react-router-dom APIs already in use elsewhere in the app.
  const [searchParams] = useSearchParams();
  const targetAnnouncementId = searchParams.get("announcement");

  const [activeCategory, setActiveCategory] = useState("All Announcements");
  const [showFilter, setShowFilter] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useNotifications({ autoMarkReadOnMount: true });
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });
  const [surveyRoute, setSurveyRoute] = useState(null);
  const { showModal, requestNavigation, handleAccept, handleDecline } =
    useDpaGate(navigate);

  const rewardChannelRef = useRef(null);
  useEffect(() => {
    let mounted = true;
    subscribeToRewardPoints(
      () => {},
      ({ points, newBalance }) => {
        if (!mounted) return;
        setToast({
          visible: true,
          points,
          newBalance,
          label: "These points can be redeemed for rewards in the Rewards Store.",
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

  // Fetch announcements from Supabase
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("announcements")
        .select(
          "id, title, content, published_at, is_active, category, image_url, image_urls",
        )
        .eq("is_active", true)
        .or(`target_user_ids.is.null,target_user_ids.cs.{${user?.id}}`)
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

  useEffect(() => {
    const handler = (e) => {
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
    sessionStorage.setItem("survey_origin_route", "/announcements");
    if (surveyRoute === "/update-tracer") {
      navigate(surveyRoute);
    } else {
      requestNavigation(surveyRoute);
    }
  }, [surveyRoute, requestNavigation, navigate]);


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
        // unreadCount={unreadCount}
        // deep-link from a notification click
        targetAnnouncementId={targetAnnouncementId}
        // navigation
        navigate={navigate}
      />
    </>
  );
};

export default Announcements;