import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import EventsView from '../Views/EventsView';
import { useNotifications } from '../hooks/useNotifications';

const useWindowWidth = () => {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
};

const CATEGORIES = ['All Events', 'Upcoming Events', 'Exclusive Events'];

const Events = () => {
  const navigate  = useNavigate();
  const width     = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;

  const [activeCategory, setActiveCategory] = useState('All Events');
  const [showFilter,     setShowFilter]     = useState(false);
  const [events,         setEvents]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const filterRef = useRef(null);

  const { unreadCount } = useNotifications();

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });
      
      if (!error && data) {
        const now = new Date();
        const formattedEvents = data.map(event => {
          const eventDate = new Date(event.event_date);
          let category = 'Exclusive Events';
          if (eventDate > now) {
            category = 'Upcoming Events';
          }
          return {
            id: event.id,
            name: event.title,
            date: eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            description: event.description,
            category: category,
            location: event.location,
            image: event.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
            images: event.image_urls?.length
              ? event.image_urls
              : [event.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'],
          };
        });
        setEvents(formattedEvents);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const filtered = activeCategory === 'All Events'
    ? events
    : events.filter(e => e.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All Events' ? events.length : events.filter(e => e.category === cat).length;
    return acc;
  }, {});

  return (
    <EventsView
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
      // navigation
      navigate={navigate}
    />
  );
};

export default Events;