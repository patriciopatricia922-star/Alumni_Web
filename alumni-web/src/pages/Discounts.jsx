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

// Map discount categories to display categories
const mapCategory = (discount) => {
  const title = discount.title?.toLowerCase() || '';
  const description = discount.description?.toLowerCase() || '';
  
  if (title.includes('hotel') || title.includes('resort') || description.includes('accommodation')) {
    return 'Accommodations';
  }
  if (title.includes('wingfinity') || description.includes('meal') || description.includes('restaurant')) {
    return 'Food & Dining';
  }
  if (title.includes('taekwondo') || title.includes('dental') || title.includes('pretty you')) {
    return 'Health, Wellness & Leisure';
  }
  if (title.includes('supplies') || title.includes('eyewear') || title.includes('shopping')) {
    return 'Shopping';
  }
  return 'Shopping';
};

const Discounts = () => {
  const navigate = useNavigate();
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilter,     setShowFilter]     = useState(false);
  const [discounts,      setDiscounts]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const filterRef = useRef(null);
  const bellRef   = useRef(null);

  const [notifs,       setNotifs]       = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifTab,     setNotifTab]     = useState('all');

  // Fetch discounts from Supabase
  useEffect(() => {
    const fetchDiscounts = async () => {
      setLoading(true);
      
      
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        setDiscounts([]);
        setLoading(false);
        return;
      }
      
      if (data) {
        console.log('Raw discount data with image_url:', data.map(d => ({ 
          id: d.id, 
          title: d.title, 
          image_url: d.image_url 
        })));
        
        const formattedDiscounts = data.map(discount => ({
          id: discount.id,
          name: discount.title,
          discount: discount.description,
          category: mapCategory(discount),
          location: discount.company || 'Various locations',
          validUntil: discount.valid_until ? `Valid until ${new Date(discount.valid_until).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : null,
          image: discount.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
        }));
        
        console.log('Formatted discounts with images:', formattedDiscounts.map(d => ({ 
          name: d.name, 
          image: d.image 
        })));
        
        setDiscounts(formattedDiscounts);
      }
      setLoading(false);
    };
    fetchDiscounts();
  }, []);

  // Fetch notifications
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

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
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
      loading={loading}
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