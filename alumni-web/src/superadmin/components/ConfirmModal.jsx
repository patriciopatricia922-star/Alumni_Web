import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ user, currentEnabled, onClose, onConfirm, loading }) => {
  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" fill={currentEnabled ? "#FEF2F2" : "#F0FDF4"} stroke={currentEnabled ? "#EF4444" : "#00A63E"} strokeWidth="1.5"/>
            {currentEnabled ? (
              <path d="M24 14v12M24 30v2" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
            ) : (
              <path d="M20 24l4 4 8-8" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </div>
        
        <h2>{currentEnabled ? 'Disable Admin Access' : 'Enable Admin Access'}</h2>
        
        <p className="confirm-modal-message">
          Are you sure you want to <strong>{currentEnabled ? 'disable' : 'enable'}</strong> access for{' '}
          <span className="user-email">{user?.email}</span>?
        </p>
        
        {currentEnabled ? (
          <div className="confirm-modal-warning">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1 14h14L8 1z" stroke="#EF4444" strokeWidth="1.2" fill="#FEF2F2"/>
              <path d="M8 6v3M8 11v1" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>This action is reversible. You can enable their access at any time from this panel.</span>
          </div>
        ) : (
          <div className="confirm-modal-info">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#00A63E" strokeWidth="1.2" fill="#F0FDF4"/>
              <path d="M7 8l1 1 2-2" stroke="#00A63E" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span>The admin will regain full access to the system immediately.</span>
          </div>
        )}
        
        <div className="confirm-modal-actions">
          <button className="confirm-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`confirm-action ${currentEnabled ? 'disable' : 'enable'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : (currentEnabled ? 'Yes, Disable Access' : 'Yes, Enable Access')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;