/**
 * SkeletonLoader.jsx — Generic survey-form skeleton
 * Mimics the layout of the survey pages (sidebar + header + progress + card fields)
 * so transitions between forms don't show a blank "Loading..." screen.
 */

import React from 'react';
import Sidebar from './Sidebar'; 

const STYLES = `
  .sk-content {
    flex: 1;
    min-width: 0;
    margin-left: 229px;
    padding: 28px 51px 60px;
  }
  .sk-shimmer {
    position: relative;
    overflow: hidden;
    background: #E5E9F1;
    border-radius: 8px;
  }
  .sk-shimmer::after {
    content: '';
    position: absolute;
    top: 0; left: -150%;
    width: 150%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
    animation: sk-shimmer-move 1.4s ease-in-out infinite;
  }
  @keyframes sk-shimmer-move {
    0%   { left: -150%; }
    100% { left: 150%; }
  }
  .sk-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .sk-title { height: 28px; width: 260px; margin: 20px auto 0; border-radius: 8px; }
  .sk-subtitle { height: 16px; width: 380px; margin: 12px auto 0; border-radius: 6px; }
  .sk-progress { height: 74px; margin-top: 16px; border-radius: 16px; }
  .sk-card {
    margin-top: 24px;
    background: #FFFFFF;
    border-radius: 25px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .sk-section-title { height: 22px; width: 220px; margin: 0 auto; border-radius: 6px; }
  .sk-field-label { height: 12px; width: 120px; border-radius: 4px; }
  .sk-field-input { height: 47px; width: 100%; border-radius: 10px; margin-top: 8px; }
  .sk-row { display: flex; gap: 24px; }
  .sk-row .sk-field { flex: 1; }
  @media (max-width: 767px) {
    .sk-sidebar { display: none; }
    .sk-content { margin-left: 0; padding: 20px 16px 60px; }
  }
`;

const SkeletonLoader = ({ fieldCount = 6 }) => (
  <>
    <style>{STYLES}</style>
    <div className="sk-root">
      <Sidebar />
      <div className="sk-content">
        <div className="sk-topbar">
          <div className="sk-shimmer" style={{ width: 70, height: 20, borderRadius: 6 }} />
          <div className="sk-shimmer" style={{ width: 48, height: 48, borderRadius: 14 }} />
        </div>
        <div className="sk-shimmer sk-title" />
        <div className="sk-shimmer sk-subtitle" />
        <div className="sk-shimmer sk-progress" />
        <div className="sk-card">
          <div className="sk-shimmer sk-section-title" />
          {Array.from({ length: fieldCount }).map((_, i) => (
            <div className="sk-field" key={i}>
              <div className="sk-shimmer sk-field-label" />
              <div className="sk-shimmer sk-field-input" />
            </div>
          ))}
          <div className="sk-row">
            <div className="sk-field">
              <div className="sk-shimmer sk-field-label" />
              <div className="sk-shimmer sk-field-input" />
            </div>
            <div className="sk-field">
              <div className="sk-shimmer sk-field-label" />
              <div className="sk-shimmer sk-field-input" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default SkeletonLoader;