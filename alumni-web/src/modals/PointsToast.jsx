import React, { useEffect, useRef, useState } from 'react';
import rewardIcon from '../assets/reward_icn.svg';

/**
 * PointsToast
 * A polished, accessible toast notification for points-earned events.
 *
 * Props:
 *   visible       {boolean}  — controls mount/unmount
 *   points        {number}   — points awarded in this event (actual amount
 *                              from the reward system — never invented here)
 *   newBalance    {number}   — updated balance after award
 *   label         {string}   — supporting message shown under the headline
 *                              (default: Rewards Store redemption note)
 *   duration      {number}   — ms visible before auto-dismiss starts (default: 5000)
 *   onDismiss     {function} — called once the toast has fully dismissed
 */
const EXIT_ANIMATION_MS = 220;

const PointsToast = ({
  visible,
  points,
  newBalance,
  label    = 'These points can be redeemed for rewards in the Rewards Store.',
  duration = 5000,
  onDismiss,
}) => {
  const dismissTimerRef = useRef(null);
  const exitTimerRef = useRef(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      setLeaving(false);
      return;
    }

    setLeaving(false);
    dismissTimerRef.current = setTimeout(() => {
      // Play the exit animation first, then tell the parent to actually
      // unmount — this is what makes the disappearance feel smooth instead
      // of an abrupt cut.
      setLeaving(true);
      exitTimerRef.current = setTimeout(onDismiss, EXIT_ANIMATION_MS);
    }, duration);

    return () => {
      clearTimeout(dismissTimerRef.current);
      clearTimeout(exitTimerRef.current);
    };
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes pt-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
        @keyframes pt-out {
          from { opacity: 1; transform: translateX(0);    }
          to   { opacity: 0; transform: translateX(20px); }
        }
        @keyframes pt-bar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
        @keyframes pt-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pt-out-down {
          from { opacity: 1; transform: translateY(0);    }
          to   { opacity: 0; transform: translateY(16px); }
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
          .pt-root.pt-leaving {
            animation-name: pt-out-down !important;
          }
        }
      `}</style>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`pt-root${leaving ? ' pt-leaving' : ''}`}
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
          animation: leaving
            ? `pt-out ${EXIT_ANIMATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1) both`
            : `pt-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both`,
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
          <img
            src={rewardIcon}
            alt=""
            style={{ width: '18px', height: '18px' }}
          />
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
            You got rewarded {points} {points === 1 ? 'point' : 'points'}!
          </p>
          <p style={{
            fontSize:   '13px',
            color:      'var(--color-text-secondary, #555555)',
            margin:     0,
            lineHeight: 1.4,
          }}>
            {label}
          </p>
        </div>

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