import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate }  from 'react-router-dom';
import { supabase }     from '../lib/supabase';
import {
  getResumeRoute,
  getSurveySections,
  isSurveyComplete,
} from '../lib/surveyProgress';
import {
  fetchRewardProfile,
  deductPoints,
  claimSurveyReward,
  subscribeToRewardPoints,
} from '../lib/rewardPoints';
import { useDpaGate }   from '../hooks/useDpaGate';
import DataPrivacyModal from '../modals/DataPrivacyModal';
import rewardIcon       from '../assets/reward_icn.svg';
import RewardStoreView  from '../views/RewardStoreView';
import PointsToast      from '../modals/PointsToast';

const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const SURVEY_REWARD_POINTS = 50;

const RewardStore = () => {
  const navigate     = useNavigate();
  const windowWidth  = useWindowWidth();
  const isMobile     = windowWidth < 768;
  const sidebarWidth = windowWidth < 768 ? 0 : windowWidth < 1100 ? 72 : 220;
  const bellRef      = useRef(null);

  // Holds the real Supabase channel so cleanup is reliable
  const realtimeChannelRef = useRef(null);
  // Ref-based mutex — immune to stale closure issues with useState
  const isClaimingRef      = useRef(false);

  const { showModal, requestNavigation, handleAccept, handleDecline } = useDpaGate(navigate);

  const [rewardPoints,         setRewardPoints]         = useState(0);
  const [merchandise,          setMerchandise]          = useState([]);
  const [activeFilter,         setActiveFilter]         = useState('All');
  const [unreadCount,          setUnreadCount]          = useState(0);
  const [showDropdown,         setShowDropdown]         = useState(false);
  const [surveyRoute,          setSurveyRoute]          = useState(null);
  const [surveyAlreadyClaimed, setSurveyAlreadyClaimed] = useState(false);
  const [isClaiming,           setIsClaiming]           = useState(false);

  // Toast state — replaces the browser alert()
  const [toast, setToast] = useState({
    visible:    false,
    points:     0,
    newBalance: 0,
    label:      '',
  });

  const dismissToast = useCallback(() => {
    setToast(t => ({ ...t, visible: false }));
  }, []);

  // ── Fetch reward profile ──────────────────────────────────────────────────
  useEffect(() => {
    fetchRewardProfile().then(profile => {
      if (!profile) return;
      setRewardPoints(profile.rewardPoints);
      setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
    });
  }, []);

  // ── Realtime reward sync ──────────────────────────────────────────────────
  useEffect(() => {
    subscribeToRewardPoints((newPoints) => {
      console.log('[RewardStore] realtime reward update:', newPoints);
      setRewardPoints(newPoints);
    }).then(channel => {
      realtimeChannelRef.current = channel;
    });

    return () => {
      realtimeChannelRef.current?.unsubscribe();
      realtimeChannelRef.current = null;
    };
  }, []);

  // ── Fetch merchandise ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMerchandise = async () => {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('points', { ascending: true });
      if (error) {
        console.error('[RewardStore] fetchMerchandise failed:', error);
        return;
      }
      if (data) setMerchandise(data);
    };
    fetchMerchandise();
  }, []);

  // ── Fetch unread notifications ────────────────────────────────────────────
  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count, error } = await supabase
        .from('announcements')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) {
        console.error('[RewardStore] fetchUnread failed:', error);
        return;
      }
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
  }, []);

  // ── Resolve survey route ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const resolveSurveyRoute = async () => {
      try {
        await getSurveySections();
        const complete = await isSurveyComplete();
        if (cancelled) return;
        setSurveyRoute(complete ? '/update-tracer' : await getResumeRoute());
      } catch (err) {
        console.error('[RewardStore] resolveSurveyRoute error:', err);
        if (!cancelled) setSurveyRoute('/survey/personal-background');
      }
    };
    resolveSurveyRoute();
    return () => { cancelled = true; };
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Auto-claim on return from survey ─────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('survey_completed') !== '1') return;

    // Strip param immediately — prevents re-trigger on refresh
    window.history.replaceState({}, '', window.location.pathname);

    const attemptClaim = async () => {
      if (isClaimingRef.current) {
        console.warn('[RewardStore] attemptClaim already in progress, skipping');
        return;
      }
      isClaimingRef.current = true;
      setIsClaiming(true);

      try {
        // saveSectionProgress awaits its own upsert before navigate() fires
        // so the DB write is already committed. Short buffer covers replication lag.
        await new Promise(r => setTimeout(r, 400));

        console.log('[RewardStore] attemptClaim: calling claimSurveyReward...');
        const result = await claimSurveyReward(SURVEY_REWARD_POINTS);

        if (!result) {
          console.error('[RewardStore] claimSurveyReward returned null — re-fetching balance');
          const profile = await fetchRewardProfile();
          if (profile) {
            setRewardPoints(profile.rewardPoints);
            setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
          }
          return;
        }

        console.log('[RewardStore] attemptClaim result:', result);

        // Sync to DB-confirmed balance regardless of awarded flag
        if (typeof result.points === 'number' && result.points >= 0) {
          setRewardPoints(result.points);
        }

        if (result.awarded) {
          setSurveyAlreadyClaimed(true);
          // Show the polished toast instead of a browser alert
          setToast({
            visible:    true,
            points:     SURVEY_REWARD_POINTS,
            newBalance: result.points,
            label:      'Survey completed',
          });
        } else if (result.reason === 'survey_incomplete') {
          console.warn('[RewardStore] RPC returned survey_incomplete — verifying via direct fetch');
          const profile = await fetchRewardProfile();
          if (profile) {
            setRewardPoints(profile.rewardPoints);
            setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
          }
        } else if (result.reason === 'already_claimed') {
          setSurveyAlreadyClaimed(true);
          console.log('[RewardStore] reward already claimed previously, balance synced');
        }
      } catch (err) {
        console.error('[RewardStore] attemptClaim threw unexpectedly:', err);
        const profile = await fetchRewardProfile();
        if (profile) {
          setRewardPoints(profile.rewardPoints);
          setSurveyAlreadyClaimed(profile.surveyAlreadyClaimed);
        }
      } finally {
        isClaimingRef.current = false;
        setIsClaiming(false);
      }
    };

    attemptClaim();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleRedeem = async (item) => {
    if (rewardPoints < item.points) return;

    const confirmedPoints = await deductPoints(rewardPoints, item.points);
    if (confirmedPoints === null) {
      alert('Redemption failed — your points were not deducted. Please try again.');
      return;
    }
    setRewardPoints(confirmedPoints);
    alert(`Successfully redeemed ${item.name}! A confirmation will be sent to you.`);
  };

  const handleCompleteSurvey = useCallback(() => {
    if (!surveyRoute) return;

    // Write intent to sessionStorage — survives section-to-section navigation,
    // unlike a URL param which is lost after the first navigate() call.
    sessionStorage.setItem('survey_claim_reward', '1');

    requestNavigation(surveyRoute);
  }, [surveyRoute, requestNavigation]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {showModal && (
        <DataPrivacyModal
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
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
      />
    </>
  );
};

export default RewardStore;