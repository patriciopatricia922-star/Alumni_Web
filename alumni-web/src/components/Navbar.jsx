import React, { useState, useEffect } from 'react';
import NavbarView from './Navbarview';

const Navbar = ({
  isScrolled,
  onOpenRegister,
  onOpenLogin,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // index.css sets `body { overflow-y: auto !important }`, which makes
  // <body> the actual scrolling box in most desktop browsers instead of
  // the window/document element. window.scrollTo() therefore has no
  // effect there. Scroll whichever element actually has scroll range.
  const getScrollEl = () => {
    if (document.body.scrollHeight > document.body.clientHeight) return document.body;
    return document.documentElement;
  };

  const scrollToY = (y) => {
    getScrollEl().scrollTop = y;
  };

  const getScrollY = () => getScrollEl().scrollTop || window.scrollY;

  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = getScrollY();
    const diff   = targetY - startY;
    let startTime = null;
    const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      scrollToY(startY + diff * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + getScrollY() - 64;
      smoothScrollTo(top, 700);
    } else {
      window.location.href = `/#${id}`;
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',      action: () => { smoothScrollTo(0, 700); setMenuOpen(false); } },
    { label: 'Events',    action: () => scrollTo('events')    },
    { label: 'Jobs',      action: () => scrollTo('jobs')      },
    { label: 'Discounts', action: () => scrollTo('discounts') },
    { label: 'About',     action: () => scrollTo('about')     },
  ];

  return (
    <NavbarView
      scrolled={isScrolled}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      navLinks={navLinks}
      onOpenRegister={onOpenRegister}
      onOpenLogin={onOpenLogin}
    />
  );
};

export default Navbar;