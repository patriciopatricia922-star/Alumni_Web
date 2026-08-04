import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getExcerpt } from "../utils/textHelpers";
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from "../lib/surveyProgress";
import {
  fetchRewardProfile,
  deductPoints,
  claimSurveyReward,
  subscribeToRewardPoints,
} from "../lib/rewardPoints";
import { useDpaGate } from "../hooks/useDpaGate";
import DataPrivacyModal from "../modals/Dataprivacymodal";
import rewardIcon from "../assets/reward_icn.svg";
import RewardStoreView from "../views/RewardStoreView";
import PointsToast from "../modals/PointsToast";
import { useSurveyRewardClaim } from "../hooks/useSurveyRewardClaim";

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

const SURVEY_REWARD_POINTS = 50;

const RewardStore = () => {
  const navigate = useNavigate();
  const windowWidth = useWindowWidth();
  const isMobile = windowWidth < 768;
  const sidebarWidth = windowWidth < 768 ? 0 : windowWidth < 1100 ? 72 : 220;
  const bellRef = useRef(null);

  // Holds the real Supabase channel so cleanup is reliable
  const realtimeChannelRef = useRef(null);
  // Ref-based mutex — immune to stale closure issues with useState
  // const isClaimingRef = useRef(false);


  const { showModal, requestNavigation, handleAccept, handleDecline } =
    useDpaGate(navigate);

  const [rewardPoints, setRewardPoints] = useState(0);
  const [merchandise, setMerchandise] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [notifTab, setNotifTab] = useState("all");
  const [surveyRoute, setSurveyRoute] = useState(null);
  const [surveyAlreadyClaimed, setSurveyAlreadyClaimed] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const NOTIF_KEY = "alumnai_read_notifs";
  const getReadIds = () => {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const saveReadIds = (ids) => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(ids));
    } catch {}
  };

  const groupByDate = (list) => {
    const now = new Date();
    const today = new Date(now);
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

  const formatTime = (iso) => {
    if (!iso) return "";
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(iso).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
    });
  };

  // Toast state — replaces the browser alert()
  const [toast, setToast] = useState({
    visible: false,
    points: 0,
    newBalance: 0,
    label: "",
  });

  const dismissToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  // ── Fetch reward profile ──────────────────────────────────────────────────
  useEffect(() => {
    fetchRewardProfile().then((profile) => {
      if (!profile) return;
      setRewardPoints(profile.rewardPoints);
      setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
    });
  }, []);

  // ── Realtime reward sync ──────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    subscribeToRewardPoints((newPoints) => {
      console.log("[RewardStore] realtime reward update:", newPoints);
      if (mounted) setRewardPoints(newPoints);
    }).then((channel) => {
      if (mounted) realtimeChannelRef.current = channel;
      else channel?.unsubscribe();
    });

    return () => {
      mounted = false;
      realtimeChannelRef.current?.unsubscribe();
      realtimeChannelRef.current = null;
    };
  }, []);

  // ── Fetch merchandise ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMerchandise = async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });
      if (error) {
        console.error("[RewardStore] fetchMerchandise failed:", error);
        return;
      }
      // Map rewards-table fields onto the shape RewardStoreView/MerchCard expect
      // (name/points/image) without touching the view component.
      if (data) {
        setMerchandise(
          data.map((r) => ({
            ...r,
            name: r.title,
            points: r.points_required,
            image: r.image_url || (r.image_urls?.[0] ?? ""),
          })),
        );
      }
    };
    fetchMerchandise();
  }, []);

  // ── Fetch notifications ───────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from("announcements")
      .select("id, title, content, published_at, is_active")
      .eq("is_active", true)
      .order("published_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (error || !data) return;
        const readIds = getReadIds();
        const mapped = data.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.content,
          time: n.published_at,
          read: readIds.includes(n.id),
        }));
        setNotifs(mapped);
        setUnreadCount(mapped.filter((n) => !n.read).length);
      });
  }, []);

  // ── Resolve survey route ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const resolveSurveyRoute = async () => {
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();
        if (cancelled) return;
        setSurveyRoute(complete ? "/update-tracer" : await getResumeRoute());
      } catch (err) {
        console.error("[RewardStore] resolveSurveyRoute error:", err);
        if (!cancelled) setSurveyRoute("/survey/personal-background");
      }
    };
    resolveSurveyRoute();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Auto-claim on return from survey ─────────────────────────────────────
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   if (params.get("survey_completed") !== "1") return;

  //   // Strip param immediately — prevents re-trigger on refresh
  //   window.history.replaceState({}, "", window.location.pathname);

  //   const attemptClaim = async () => {
  //     if (isClaimingRef.current) {
  //       console.warn(
  //         "[RewardStore] attemptClaim already in progress, skipping",
  //       );
  //       return;
  //     }
  //     isClaimingRef.current = true;
  //     setIsClaiming(true);

  //     try {
  //       // saveSectionProgress awaits its own upsert before navigate() fires
  //       // so the DB write is already committed. Short buffer covers replication lag.
  //       await new Promise((r) => setTimeout(r, 400));

  //       console.log("[RewardStore] attemptClaim: calling claimSurveyReward...");
  //       const result = await claimSurveyReward(SURVEY_REWARD_POINTS);

  //       if (!result) {
  //         console.error(
  //           "[RewardStore] claimSurveyReward returned null — re-fetching balance",
  //         );
  //         const profile = await fetchRewardProfile();
  //         if (profile) {
  //           setRewardPoints(profile.rewardPoints);
  //           setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
  //         }
  //         return;
  //       }

  //       console.log("[RewardStore] attemptClaim result:", result);

  //       // Sync to DB-confirmed balance regardless of awarded flag
  //       if (typeof result.points === "number" && result.points >= 0) {
  //         setRewardPoints(result.points);
  //       }

  //       if (result.awarded) {
  //         setSurveyAlreadyClaimed(true);
  //         // Show the polished toast instead of a browser alert
  //         setToast({
  //           visible: true,
  //           points: SURVEY_REWARD_POINTS,
  //           newBalance: result.points,
  //           label: "Survey completed",
  //         });
  //       } else if (result.reason === "survey_incomplete") {
  //         console.warn(
  //           "[RewardStore] RPC returned survey_incomplete — verifying via direct fetch",
  //         );
  //         const profile = await fetchRewardProfile();
  //         if (profile) {
  //           setRewardPoints(profile.rewardPoints);
  //           setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
  //         }
  //       } else if (result.reason === "already_claimed") {
  //         setSurveyAlreadyClaimed(true);
  //         console.log(
  //           "[RewardStore] reward already claimed previously, balance synced",
  //         );
  //       } else if (result.reason === "cooldown_active") {
  //         console.log(
  //           "[RewardStore] reward cooldown active, no points awarded this update",
  //         );
  //         setToast({
  //           visible: true,
  //           points: 0,
  //           newBalance: result.points,
  //           label:
  //             "Survey updated! You can earn more points again after the cooldown period.",
  //         });
  //       }
  //     } catch (err) {
  //       console.error("[RewardStore] attemptClaim threw unexpectedly:", err);
  //       const profile = await fetchRewardProfile();
  //       if (profile) {
  //         setRewardPoints(profile.rewardPoints);
  //         setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
  //       }
  //     } finally {
  //       isClaimingRef.current = false;
  //       setIsClaiming(false);
  //     }
  //   };

  //   attemptClaim();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // intentionally runs once on mount only

  useSurveyRewardClaim({
  onPointsSynced: setRewardPoints,
  onClaimedStatus: setSurveyAlreadyClaimed,
  onToast: setToast,
});

  // ── Handlers ─────────────────────────────────────────────────────────────

  const isRedeemingRef = useRef(false);

  const markAllRead = useCallback(() => {
    saveReadIds(notifs.map((n) => n.id));
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const ids = getReadIds();
    if (!ids.includes(id)) {
      ids.push(id);
      saveReadIds(ids);
    }
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleRedeem = async (item) => {
    if (isRedeemingRef.current) return;
    isRedeemingRef.current = true;

    try {
      // Re-fetch the authoritative balance instead of trusting stale closure state.
      const profile = await fetchRewardProfile();
      const currentPoints = profile ? profile.rewardPoints : rewardPoints;

      if (currentPoints < item.points) {
        setToast({
          visible: true,
          points: 0,
          newBalance: currentPoints,
          label: `Not enough points — you need ${item.points - currentPoints} more.`,
        });
        return;
      }

      const confirmedPoints = await deductPoints(currentPoints, item.points);
      if (confirmedPoints === null) {
        setToast({
          visible: true,
          points: 0,
          newBalance: currentPoints,
          label:
            "Redemption failed — your points were not deducted. Please try again.",
        });
        return;
      }

      // Record the redemption using the existing Supabase client.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: redemptionError } = await supabase
          .from("reward_redemptions")
          .insert([
            { user_id: user.id, reward_id: item.id, points_spent: item.points },
          ]);
        if (redemptionError) {
          console.error(
            "[RewardStore] failed to record redemption:",
            redemptionError,
          );
        }
      }

      setRewardPoints(confirmedPoints);
      setToast({
        visible: true,
        points: -item.points,
        newBalance: confirmedPoints,
        label: `Redeemed ${item.name}!`,
      });
    } finally {
      isRedeemingRef.current = false;
    }
  };

  const handleCompleteSurvey = useCallback(() => {
    if (!surveyRoute) return;
    sessionStorage.setItem("survey_origin_route", "/rewards");
    requestNavigation(surveyRoute);
  }, [surveyRoute, requestNavigation]);

  // ── Render ────────────────────────────────────────────────────────────────
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
        onDismiss={dismissToast}
      />

      <RewardStoreView
        sidebarWidth={sidebarWidth}
        isMobile={isMobile}
        rewardPoints={rewardPoints}
        merchandise={merchandise}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRedeem={handleRedeem}
        onCompleteSurvey={handleCompleteSurvey}
        surveyRoute={surveyRoute}
        surveyAlreadyClaimed={surveyAlreadyClaimed}
        surveyRewardPoints={SURVEY_REWARD_POINTS}
        rewardIcon={rewardIcon}
        bellRef={bellRef}
        unreadCount={unreadCount}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        notifs={notifTab === "unread" ? notifs.filter((n) => !n.read) : notifs}
        notifTab={notifTab}
        setNotifTab={setNotifTab}
        markAllRead={markAllRead}
        markOneRead={markOneRead}
        groupByDate={groupByDate}
        formatTime={formatTime}
        navigate={navigate}
      />
    </>
  );
};

export default RewardStore;
