import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const CATEGORIES = ['All', 'Food & Dining', 'Health, Wellness & Leisure', 'Shopping'];

const discounts = [
  {
    id: 1,
    name: 'Two Seasons Hotel and Resorts',
    discount: '25% Discount',
    category: 'Health, Wellness & Leisure',
    location: 'Two Seasons Boracay, Two Seasons Coron Island Resort, and Two Seasons Coron Bayside Hotel',
    offer: '10% off on room accommodation',
    validUntil: 'Until March 31, 2026',
  },
  {
    id: 2,
    name: 'Vista Venice',
    discount: '10% Discount',
    category: 'Health, Wellness & Leisure',
    location: 'Makati Ave, corner Kalayaan Avenue, Makati City',
    offer: '10% off on room accommodation',
    validUntil: null,
  },
  {
    id: 3,
    name: 'Wingfinity',
    discount: '5% Discount',
    category: 'Food & Dining',
    location: 'Wingfinity and Beyond Torre Central Branch',
    offer: 'Get 5% discount on any unlimited menu and Ala Carte meals',
    validUntil: 'Until March 31, 2026',
  },
  {
    id: 4,
    name: 'AIM Taekwondo School',
    discount: 'Waived Membership Fee',
    category: 'Health, Wellness & Leisure',
    location: '5th floor 1318 G. Tuazon St. Sampaloc, Manila',
    offer: 'Membership fee (P500.00) is waived',
    validUntil: 'Until March 31, 2026',
  },
  {
    id: 5,
    name: 'The Pretty You',
    discount: '5% Discount',
    category: 'Health, Wellness & Leisure',
    location: 'P. Campa St. Sampaloc Manila',
    offer: 'Get 5% discount on all services',
    validUntil: null,
  },
  {
    id: 6,
    name: 'MetroDental',
    discount: '35% Discount',
    category: 'Health, Wellness & Leisure',
    location: 'Greenbelt 5 Makati City, Eastwood Libis, Trinoma Mall Quezon City, The Podium Pasig City',
    offer: 'Get up to 35% discount',
    validUntil: 'Until January 30, 2027',
  },
  {
    id: 7,
    name: 'Supplies Station, Inc.',
    discount: '10% Discount',
    category: 'Shopping',
    location: 'Clark, Pampanga',
    offer: '10% discount on all items with minimum purchase of P1,000',
    validUntil: 'Until March 31, 2026',
  },
  {
    id: 8,
    name: 'OJO Eyewear',
    discount: '10% Discount',
    category: 'Shopping',
    location: 'Warehouse 16B, La Fuerza Compound 2241 Chino Roces Avenue, Makati City',
    offer: 'Get 10% discount on eyewear packages starting at P1,888 and above',
    validUntil: 'Until November 15, 2026',
  },
];

const PriceTagIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
    <path d="M12.586 2.586A2 2 0 0011.172 2H4a2 2 0 00-2 2v7.172a2 2 0 00.586 1.414l8 8a2 2 0 002.828 0l7.172-7.172a2 2 0 000-2.828l-8-8z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7" cy="7" r="1.5" fill="#FFFFFF"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="14" height="13" rx="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M1 6h14" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="M5 1v2M11 1v2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <circle cx="8" cy="6" r="1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
  </svg>
);

const DiscountCard = ({ item }) => (
  <div style={{
    background: 'rgba(13, 19, 56, 0.4)',
    border: '1.24px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0px 4px 4px rgba(0,0,0,0.25)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'border-color 0.2s, transform 0.2s',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(43,114,251,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    {/* Card Header */}
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '20px 24px',
      borderBottom: '0.89px solid rgba(255,255,255,0.1)',
    }}>
      {/* Icon */}
      <div style={{
        width: '48px', height: '48px', flexShrink: 0,
        background: 'linear-gradient(180deg, rgba(30,37,85,0.8) 0%, rgba(15,19,56,0.8) 100%)',
        boxShadow: '0px 10px 15px rgba(97,95,255,0.3), 0px 4px 6px rgba(43,114,251,0.15)',
        borderRadius: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PriceTagIcon />
      </div>

      {/* Name + Discount */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'Arimo, Arial', fontSize: '15px', lineHeight: '22px',
          letterSpacing: '-0.35px', color: '#FFFFFF',
          margin: '0 0 4px 0',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.name}
        </p>
        <p style={{
          fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px',
          lineHeight: '20px', letterSpacing: '-0.35px', color: '#D9CA81',
          margin: 0,
        }}>
          {item.discount}
        </p>
      </div>
    </div>

    {/* Card Body */}
    <div style={{ padding: '16px 24px' }}>
      {/* Location */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
        <div style={{ marginTop: '3px', flexShrink: 0 }}><LocationIcon /></div>
        <p style={{
          fontFamily: 'Arimo, Arial', fontSize: '12px', lineHeight: '20px',
          color: 'rgba(255,255,255,0.7)', margin: 0,
        }}>
          {item.location}
        </p>
      </div>

      {/* Offer */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
        <div style={{ marginTop: '3px', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M8 2v12" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{
          fontFamily: 'Arimo, Arial', fontSize: '12px', lineHeight: '20px',
          color: 'rgba(255,255,255,0.85)', margin: 0,
        }}>
          {item.offer}
        </p>
      </div>
    </div>

    {/* Card Footer */}
    <div style={{
      padding: '12px 24px',
      borderTop: '0.89px solid rgba(255,255,255,0.1)',
      display: 'flex', alignItems: 'center', gap: '7px',
    }}>
      {/* Blue dot */}
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%',
        background: '#2B72FB',
        boxShadow: '0px 4px 8px rgba(43,114,251,0.5)',
        flexShrink: 0,
      }} />
      <CalendarIcon />
      <span style={{
        fontFamily: 'Arimo, Arial', fontSize: '12px', lineHeight: '16px',
        color: 'rgba(255,255,255,0.5)',
      }}>
        {item.validUntil || 'No date'}
      </span>
    </div>
  </div>
);

const Discounts = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = activeCategory === 'All'
    ? discounts
    : discounts.filter(d => d.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = cat === 'All' ? discounts.length : discounts.filter(d => d.category === cat).length;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#002263' }}>
      <Sidebar />

      <div style={{ marginLeft: '229px', flex: 1, padding: '37px 51px 60px 48px', position: 'relative' }}>

        {/* Notification Bell */}
        <div style={{ position: 'absolute', top: '37px', right: '51px' }}>
          <button style={{
            width: '48px', height: '48px',
            background: 'linear-gradient(135deg, rgba(15,22,66,0.1) 0%, rgba(10,15,46,0.05) 100%)',
            border: '1.24px solid rgba(255,255,255,0.1)',
            boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
            borderRadius: '14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '20px', height: '20px',
              background: '#2B72FB', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: '#FFFFFF' }}>3</span>
            </div>
          </button>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, marginBottom: '24px',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Arial', fontWeight: 700, fontSize: '14px', color: '#FFFFFF' }}>Back</span>
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h1 style={{
              fontFamily: 'Arial', fontWeight: 700, fontSize: '40px',
              lineHeight: '48px', letterSpacing: '-1px', color: '#FFFFFF', margin: 0,
            }}>
              Discounts
            </h1>
            <div style={{
              background: 'linear-gradient(90deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '1.24px solid rgba(99,102,241,0.3)',
              borderRadius: '999px', padding: '7px 20px',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', letterSpacing: '0.3px', color: 'rgba(255,255,255,0.8)' }}>
                LATEST UPDATES
              </span>
            </div>
          </div>
          <p style={{
            fontFamily: 'Arimo, Arial', fontSize: '15px', lineHeight: '22px',
            color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Stay connected with the latest discounts and exclusive offers for NU Dasmarinas alumni.
          </p>
        </div>

        {/* Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '24px', gap: '12px', position: 'relative' }}>
          {/* Active filter label + count */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px',
            background: 'linear-gradient(90deg, #1E2555 0%, #0F1338 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            minWidth: '200px',
          }}>
            <span style={{
              fontFamily: 'Arimo, Arial', fontSize: '14px', lineHeight: '20px',
              color: 'rgba(255,255,255,0.9)', flex: 1,
            }}>
              {activeCategory}
            </span>
            <div style={{
              background: '#2B72FB', borderRadius: '8px',
              padding: '1px 7px', minWidth: '22px', textAlign: 'center',
            }}>
              <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#FFFFFF' }}>
                {categoryCounts[activeCategory]}
              </span>
            </div>
          </div>

          {/* Filter Button */}
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilter(f => !f)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 18px',
                background: 'linear-gradient(180deg, rgba(30,37,85,0.7) 0%, rgba(15,19,56,0.7) 100%)',
                border: showFilter ? '1px solid rgba(43,114,251,0.4)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Filter icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M7 12h10M11 18h2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px',
                color: '#FFFFFF', letterSpacing: '0.5px',
              }}>
                FILTER
              </span>
            </button>

            {/* Dropdown */}
            {showFilter && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'linear-gradient(180deg, #1E2555 0%, #0F1338 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                zIndex: 50,
                minWidth: '220px',
                boxShadow: '0px 10px 30px rgba(0,0,0,0.4)',
              }}>
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setShowFilter(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: activeCategory === cat ? 'rgba(43,114,251,0.15)' : 'transparent',
                      border: 'none',
                      borderTop: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    onMouseLeave={e => { if (activeCategory !== cat) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      fontFamily: 'Arimo, Arial', fontSize: '14px',
                      color: activeCategory === cat ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                      fontWeight: activeCategory === cat ? 700 : 400,
                    }}>
                      {cat}
                    </span>
                    <div style={{
                      background: activeCategory === cat ? '#2B72FB' : 'rgba(43,114,251,0.25)',
                      borderRadius: '6px', padding: '1px 7px',
                    }}>
                      <span style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '11px', color: '#FFFFFF' }}>
                        {categoryCounts[cat]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '24px',
          }}>
            {filtered.map(item => (
              <DiscountCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 0',
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'Arimo, Arial', fontSize: '15px',
          }}>
            No discounts found for this category.
          </div>
        )}
      </div>
    </div>
  );
};

export default Discounts;