import React, { useState, useEffect, useRef } from 'react';
import './FilterDropdown.css';

const FilterDropdown = ({ value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="filter-dropdown">
      <button className="filter-dropdown-btn" onClick={() => setOpen(o => !o)}>
        <span>{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="#717182" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="filter-dropdown-menu">
          {options.map(opt => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`filter-dropdown-item ${value === opt ? 'active' : ''}`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;