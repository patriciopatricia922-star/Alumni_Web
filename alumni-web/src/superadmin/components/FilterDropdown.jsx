import React, { useState, useEffect, useRef, useId } from 'react';
import './FilterDropdown.css';

let activeDropdownId = null;
const listeners = new Set();
const setActiveDropdown = (id) => {
  activeDropdownId = id;
  listeners.forEach(fn => fn(id));
};

const FilterDropdown = ({ value, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const btnRef = useRef(null);
  const id = useId();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const listener = (activeId) => {
      if (activeId !== id) setOpen(false);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [id]);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setOpen(o => {
      const next = !o;
      if (next) {
        setActiveDropdown(id);
        const rect = btnRef.current.getBoundingClientRect();
        setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      }
      return next;
    });
  };

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  return (
    <div ref={ref} className="filter-dropdown">
      <button type="button" ref={btnRef} className="filter-dropdown-btn" onClick={toggleOpen}>
        <span>{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
          <path d="M4 6L8 10L12 6" stroke="#717182" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div
          className="filter-dropdown-menu filter-dropdown-menu-fixed"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
        >
          {(options || []).map(opt => (
            <div
              key={opt}
              onClick={() => handleSelect(opt)}
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