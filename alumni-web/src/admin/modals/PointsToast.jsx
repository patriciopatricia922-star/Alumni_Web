import React, { useEffect, useRef } from 'react';

/**
 * PointsToast
 * A polished, accessible toast notification for points-earned events.
 *
 * Props:
 *   visible       {boolean}  — controls mount/unmount
 *   points        {number}   — points awarded in this event
 *   newBalance    {number}   — updated balance after award
 *   label         {string}   — context label  (default: "Survey completed")
 *   duration      {number}   — ms before auto-dismiss  (default: 5000)
 *   onDismiss     {function} — called when toast should close
 */
const PointsToast = ({
  visible,
  points,
  newBalance,
  label    = 'Survey completed',
  duration = 5000,
  onDismiss,
}) => {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    timerRef.current = setTimeout(onDismiss, duration);
    return () => clearTimeout(timerRef.current);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pt-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes pt-bar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        @keyframes pt-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .pt-close-btn:hover {
          background: var(--color-background-secondary, #f5f5f5) !important;
          color: var(--color-text-primary, #111) !important;
        }
        @media (max-width: 639px) {
          .pt-root {
            top: auto !important;
            right: 0 !important;
            bottom: 1rem !important;
            left: 0 !important;
            width: auto !important;
            margin: 0 1rem !important;
            animation-name: pt-in-up !important;
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pt-root"
        style={{
          position:     'fixed',
          top:          '1.25rem',
          right:        '1.25rem',
          zIndex:       9999,
          width:        '320px',
          background:   'var(--color-background-primary, #ffffff)',
          border:       '0.5px solid #0F6E56',
          borderLeft:   '3px solid #1D9E75',
          borderRadius: '12px',
          padding:      '14px 16px 12px',
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '14px',
          overflow:     'hidden',
          boxSizing:    'border-box',
          animation:    `pt-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both`,
        }}
      >
        {/* Icon */}
        <div
          aria-hidden="true"
          style={{
            flexShrink:     0,
            width:          '36px',
            height:         '36px',
            borderRadius:   '8px',
            background:     '#E1F5EE',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            marginTop:      '1px',
          }}
        >
          <i className="ti ti-coin" style={{ fontSize: '18px', color: '#0F6E56' }} />
        </div>

        {/* Text body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize:      '11px',
            fontWeight:    500,
            color:         '#0F6E56',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin:        '0 0 3px',
          }}>
            Points earned
          </p>
          <p style={{
            fontSize:   '15px',
            fontWeight: 500,
            color:      'var(--color-text-primary, #111111)',
            margin:     '0 0 2px',
            lineHeight: 1.3,
          }}>
            +{points} reward points
          </p>
          <p style={{
            fontSize:   '13px',
            color:      'var(--color-text-secondary, #555555)',
            margin:     0,
            lineHeight: 1.4,
          }}>
            {label} · Balance: {newBalance} pts
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="pt-close-btn"
          style={{
            flexShrink:     0,
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            padding:        0,
            color:          'var(--color-text-tertiary, #999999)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '24px',
            height:         '24px',
            borderRadius:   '4px',
            marginTop:      '-2px',
            transition:     'background 0.15s, color 0.15s',
          }}
        >
          <i className="ti ti-x" aria-hidden="true" style={{ fontSize: '15px' }} />
        </button>

        {/* Auto-dismiss progress bar */}
        <div
          aria-hidden="true"
          style={{
            position:        'absolute',
            bottom:          0,
            left:            0,
            height:          '2.5px',
            background:      '#1D9E75',
            borderRadius:    '0 0 0 12px',
            animation:       `pt-bar ${duration}ms linear forwards`,
            animationDelay:  '0ms',
          }}
        />
      </div>
    </>
  );
};

export default PointsToast;