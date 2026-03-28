import React from 'react';

const StatCard = ({ title, value, subtitle, subtitleColor, iconBg, iconType }) => {
  const getIcon = () => {
    if (iconType === 'accounts') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#155DFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      );
    }
    if (iconType === 'active') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DAA520" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      );
    }
    if (iconType === 'inactive') {
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DF7171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
        </svg>
      );
    }
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="5" x2="23" y2="9"/><line x1="23" y1="5" x2="19" y2="9"/>
      </svg>
    );
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: '0.888889px solid #9E9E9E',
      borderRadius: '10px',
      padding: '24.8889px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flex: 1,
      minWidth: 0,
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <span style={{
          fontFamily: 'Lexend, Arial',
          fontSize: '14px',
          color: '#6A7282',
          lineHeight: '20px',
        }}>{title}</span>
        <span style={{
          fontFamily: 'Lexend, Arial',
          fontWeight: 700,
          fontSize: '30px',
          color: '#101828',
          lineHeight: '36px',
        }}>{value}</span>
        <span style={{
          fontFamily: 'Arimo, Arial',
          fontSize: '12px',
          color: subtitleColor || '#6A7282',
          lineHeight: '16px',
        }}>{subtitle}</span>
      </div>
      <div style={{
        width: '48px',
        height: '48px',
        flexShrink: 0,
        background: iconBg,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {getIcon()}
      </div>
    </div>
  );
};

export default StatCard;