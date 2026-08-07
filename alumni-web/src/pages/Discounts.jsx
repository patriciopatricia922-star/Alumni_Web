import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DiscountsView from '../Views/DiscountsView';
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

  const { unreadCount } = useNotifications();

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
          images: discount.image_urls?.length
            ? discount.image_urls
            : [discount.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'],
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

  // Fetch filtered category
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
      // navigation
      navigate={navigate}
    />
  );
};

export default Discounts;