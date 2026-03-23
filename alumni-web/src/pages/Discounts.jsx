import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DiscountsView from '../Views/DiscountsView';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const CATEGORIES = ['All', 'Accommodations', 'Food & Dining', 'Health, Wellness & Leisure', 'Shopping'];

const discounts = [
  { id: 1, name: 'Two Seasons Hotel and Resorts', discount: 'Up to 25% discount on room accommodation with complimentary breakfast', category: 'Accommodations', location: 'Two Seasons Boracay\nTwo Seasons Coron Island Resort\nTwo Seasons Coron Bayside Hotel', validUntil: 'Valid until March 31, 2026', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80' },
  { id: 2, name: 'Vista Venice', discount: '10% off on room accommodation', category: 'Accommodations', location: 'Makati Ave, corner Kalayaan Avenue, Makati City', validUntil: null, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80' },
  { id: 3, name: 'Wingfinity', discount: 'Get 5% discount on any unlimited menu and Ala Carte meals', category: 'Food & Dining', location: 'Wingfinity and Beyond Torre Central Branch', validUntil: 'Valid until March 31, 2026', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&q=80' },
  { id: 4, name: 'AIM Taekwondo School', discount: 'Membership fee (P500.00) is waived', category: 'Health, Wellness & Leisure', location: '5th floor 1318 G. Tuazon St. Sampaloc, Manila', validUntil: 'Valid until March 31, 2026', image: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600&q=80' },
  { id: 5, name: 'The Pretty You', discount: 'Get 5% discount on all services', category: 'Health, Wellness & Leisure', location: 'P. Campa St. Sampaloc Manila', validUntil: null, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80' },
  { id: 6, name: 'MetroDental', discount: 'Get up to 35% discount', category: 'Health, Wellness & Leisure', location: 'Greenbelt 5 Makati City, Eastwood Libis, Trinoma Mall Quezon City, The Podium Pasig City', validUntil: 'Valid until January 30, 2027', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80' },
  { id: 7, name: 'Supplies Station, Inc.', discount: '10% discount on all items with minimum purchase of P1,000', category: 'Shopping', location: 'Clark, Pampanga', validUntil: 'Valid until March 31, 2026', image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80' },
  { id: 8, name: 'OJO Eyewear', discount: 'Get 10% discount on eyewear packages starting at P1,888 and above', category: 'Shopping', location: 'Warehouse 16B, La Fuerza Compound 2241 Chino Roces Avenue, Makati City', validUntil: 'Valid until November 15, 2026', image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80' },
];

const Discounts = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilter,     setShowFilter]     = useState(false);
  const filterRef = useRef(null);
  const bellRef   = useRef(null);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, content, published_at, is_active')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(20);
      if (error || !data) return;
      const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
      const mapped  = data.map(n => ({ id: n.id, title: n.title, body: n.content, time: n.published_at, read: readIds.includes(n.id) }));
      setNotifs(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    };
    fetchNotifs();
  }, []);

  const markAllRead = useCallback(() => {
    localStorage.setItem('read_notifs', JSON.stringify(notifs.map(n => n.id)));
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifs]);

  const markOneRead = useCallback((id) => {
    const readIds = JSON.parse(localStorage.getItem('read_notifs') || '[]');
    if (!readIds.includes(id)) { readIds.push(id); localStorage.setItem('read_notifs', JSON.stringify(readIds)); }
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const groupByDate = (list) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const weekAgo   = new Date(today); weekAgo.setDate(today.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'This Week': [], Earlier: [] };
    list.forEach(n => {
      const d = new Date(n.time); d.setHours(0, 0, 0, 0);
      if      (d >= today)     groups['Today'].push(n);
      else if (d >= yesterday) groups['Yesterday'].push(n);
      else if (d >= weekAgo)   groups['This Week'].push(n);
      else                     groups['Earlier'].push(n);
    });
    return groups;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso), now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60)     return 'Just now';
    if (diff < 3600)   return Math.floor(diff / 60)   + 'm ago';
    if (diff < 86400)  return Math.floor(diff / 3600)  + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const filtered = activeCategory === 'All'
    ? discounts
    : discounts.filter(d => d.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? discounts.length : discounts.filter(d => d.category === cat).length;
    return acc;
  }, {});

  return (
    <DiscountsView
      isMobile={isMobile}
      isTablet={isTablet}
      // category / filter
      categories={CATEGORIES}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      showFilter={showFilter}
      setShowFilter={setShowFilter}
      filterRef={filterRef}
      categoryCounts={categoryCounts}
      filtered={filtered}
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
  );
};

export default Discounts;