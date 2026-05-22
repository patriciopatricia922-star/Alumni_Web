import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import rewardIcon from '../assets/reward_icn.svg';
import RewardStoreView from '../views/RewardStoreView';

// ============================ WINDOW WIDTH HOOK ============================
const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

// ============================ MAIN COMPONENT ============================
const RewardStore = () => {
  const navigate      = useNavigate();
  const windowWidth   = useWindowWidth();
  const isMobile      = windowWidth < 768;
  const sidebarWidth  = windowWidth < 768 ? 0 : windowWidth < 1100 ? 72 : 220;

  const bellRef       = useRef(null);

  const [rewardPoints,  setRewardPoints]  = useState(0);
  const [merchandise,   setMerchandise]   = useState([]);
  const [activeFilter,  setActiveFilter]  = useState('All');
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [showDropdown,  setShowDropdown]  = useState(false);

// ============================ FETCH REWARD POINTS ============================
  useEffect(() => {
    const fetchPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('alumni_profiles')
        .select('reward_points')
        .eq('user_id', user.id)
        .single();
      if (data) setRewardPoints(data.reward_points ?? 0);
    };
    fetchPoints();
  }, []);

// ============================ FETCH MERCHANDISE ============================
  useEffect(() => {
    const fetchMerchandise = async () => {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .order('points', { ascending: true });
      if (!error && data) setMerchandise(data);
    };
    fetchMerchandise();
  }, []);

// ============================ FETCH UNREAD NOTIFICATIONS ============================
  useEffect(() => {
    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();
  }, []);

// ============================ CLOSE DROPDOWN ON OUTSIDE CLICK ============================
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

// ============================ HANDLERS ============================
  const handleRedeem = async (item) => {
    if (rewardPoints < item.points) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const newPoints = rewardPoints - item.points;
    const { error } = await supabase
      .from('alumni_profiles')
      .update({ reward_points: newPoints })
      .eq('user_id', user.id);
    if (!error) {
      setRewardPoints(newPoints);
      alert(`Successfully redeemed ${item.name}! A confirmation will be sent to you.`);
    }
  };

  const handleCompleteSurvey = () => navigate('/tracer-survey');

// ============================ RENDER ============================
  return (
    <RewardStoreView
      sidebarWidth={sidebarWidth}
      isMobile={isMobile}
      rewardPoints={rewardPoints}
      merchandise={merchandise}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      onRedeem={handleRedeem}
      onCompleteSurvey={handleCompleteSurvey}
      rewardIcon={rewardIcon}
      bellRef={bellRef}
      unreadCount={unreadCount}
      showDropdown={showDropdown}
      setShowDropdown={setShowDropdown}
    />
  );
};

export default RewardStore;