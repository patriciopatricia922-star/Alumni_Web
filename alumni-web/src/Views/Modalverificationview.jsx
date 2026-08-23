// Views/ModalVerificationView.jsx
import React from "react";
/* ── Lock icon badge — matches ModalForgotPasswordView ──────── */
const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect
      x="5"
      y="11"
      width="14"
      height="10"
      rx="2"
      stroke="#FFFFFF"
      strokeWidth="1.8"
    />
    <path
      d="M8 11V7a4 4 0 0 1 8 0v4"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
/* ════════════════════════════════════════════════════════════════
ModalVerificationView — pure presentation layer
Mirrors ModalForgotPasswordView: lgn-* classes, blue header band,
white card body, Montserrat font.
Single X close button lives only inside lgn-card-header.
════════════════════════════════════════════════════════════════ */
const ModalVerificationView = ({
  code,
  error,
  loading,
  canResend,
  timer,
  inputRefs,
  formatTime,
  handleChange,
  handleKeyDown,
  handlePaste,
  handleVerify,
  handleResend,
  onClose,
}) => (
  <div
    className="lgn-page-root lgn-page-root--modal"
    style={{ fontFamily: "Montserrat, Arial, sans-serif" }}
  >
    {/* ════════════════════════════════════════════════════════
FLOATING CARD — mirrors lgn-floating-card
════════════════════════════════════════════════════════ */}
    <div className="lgn-floating-card">
      {/* ── Card header band ─────────────────────────────── */}
      <div className="lgn-card-header">
        {/* Lock icon badge */}
        <div className="lgn-header-icon">
          <LockIcon />
        </div>
        {/* Title + subtitle */}
        <div className="lgn-header-text">
          <h1 className="lgn-header-title">Verification</h1>
          <p className="lgn-header-sub">Enter verification code</p>
        </div>
        {/* X close button — THE ONLY close control; no duplicate outside header */}
        <button
          className="lgn-header-close"
          onClick={onClose}
          title="Close"
          aria-label="Close verification modal"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {/* ── Card body ────────────────────────────────────── */}
      <div className="lgn-card-body" style={{ alignItems: "center" }}>
        {/* Error banner */}
        {error && (
          <div
            className="lgn-error-banner"
            style={{ width: "100%", boxSizing: "border-box" }}
          >
            <p>{error}</p>
          </div>
        )}
        {/* ── OTP input boxes ──────────────────────────────
         6 boxes, white bg with blue border on fill,
         sized to match Figma: wider than tall ratio    */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            width: "100%",
            marginBottom: "4px",
          }}
          onPaste={handlePaste}
        >
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "47px",
                height: "56px",
                background: "#FFFFFF",
                border: digit ? "2px solid #003EA6" : "2px solid #003EA6",
                borderRadius: "14px",
                fontFamily: "Montserrat, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#003EA6",
                textAlign: "center",
                outline: "none",
                cursor: "text",
                transition: "border-color 0.2s, box-shadow 0.2s",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#003EA6";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 62, 166, 0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#003EA6";
                e.target.style.boxShadow = "none";
              }}
            />
          ))}
        </div>
        {/* ── Confirm / Verify button ──────────────────────── */}
        <button
          type="button"
          className="lgn-submit-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying…" : "Confirm"}
        </button>
        {/* ── Timer / resend row ───────────────────────────── */}
        <div
          className="lgn-verification-footer"
          style={{ textAlign: "center", width: "100%" }}
        >
          <p
            style={{
              fontFamily: "Montserrat, Arial, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              lineHeight: "20px",
              color: "#4A5565",
              margin: "0 0 2px 0",
            }}
          >
            {canResend
              ? "Didn't receive the code?"
              : `Send code again: ${formatTime(timer)}`}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontFamily: "Montserrat, Arial, sans-serif",
              fontWeight: 700,
              fontSize: "13px",
              lineHeight: "20px",
              color: canResend ? "#003EA6" : "rgba(0, 62, 166, 0.35)",
              cursor: canResend ? "pointer" : "default",
              transition: "color 0.2s, opacity 0.2s",
              marginBottom: "4px",
            }}
          >
            Resend
          </button>
        </div>
      </div>
    </div>
  </div>
);
export default ModalVerificationView;
