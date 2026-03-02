import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CameraIcon from '../assets/camera_icn.svg';

const AlumniIDRegistration = () => {
  const [agreed, setAgreed] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#002263',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, Arial, sans-serif',
        padding: '48px 0',
      }}
    >
      {/* Back Button - outside the card */}
      <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: 'Arial',
              fontWeight: 700,
              fontSize: '14px',
              lineHeight: '16px',
              color: '#FFFFFF',
            }}
          >
            Back
          </span>
        </Link>
      </div>

      {/* Card Container */}
      <div
        style={{
          width: '800px',
          background: 'rgba(13, 19, 56, 0.25)',
          border: '0.8px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px',
          padding: '48px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '42px',
              color: '#FFFFFF',
              margin: '0 0 12px 0',
            }}
          >
            Alumni Registration
          </h1>
          <p
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
            }}
          >
            Create your account to join
          </p>
        </div>

        {/* Photo Upload Section */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '30px',
              color: '#FFFFFF',
              margin: '0 0 16px 0',
            }}
          >
            Photo of Alumni ID
          </h2>

          {/* Upload Area */}
          <label
            htmlFor="alumni-id-upload"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '300px',
              background: '#F3F3F5',
              border: '0.8px solid rgba(0, 0, 0, 0.25)',
              borderRadius: '14px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            {preview ? (
              <img
                src={preview}
                alt="Alumni ID Preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img src={CameraIcon} alt="Upload" style={{ width: '139px', height: '139px' }} />
            )}
          </label>
          <input
            id="alumni-id-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Terms Checkbox */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <input
            type="checkbox"
            id="terms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{
              width: '20px',
              height: '20px',
              accentColor: '#2B72FB',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <label
            htmlFor="terms"
            style={{
              fontFamily: 'Montserrat',
              fontWeight: 400,
              fontSize: '15px',
              lineHeight: '24px',
              color: '#FFFFFF',
              cursor: 'pointer',
            }}
          >
            I agree to the{' '}
            <Link to="/terms" style={{ color: '#D9CA81', textDecoration: 'none' }}>
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: '#D9CA81', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </label>
        </div>

        <Link
          to={agreed ? '/signup' : '#'}
          style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}
        >
  <button
    disabled={!agreed}
    style={{
      width: '100%',
      height: '50px',
      background: agreed ? 'rgba(0, 40, 255, 0.7)' : 'rgba(0, 40, 255, 0.35)',
      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
      border: 'none',
      borderRadius: '14px',
      fontFamily: 'Montserrat',
      fontWeight: 700,
      fontSize: '16px',
      lineHeight: '24px',
      color: '#FFFFFF',
      cursor: agreed ? 'pointer' : 'not-allowed',
      transition: 'background 0.2s ease',
    }}
  >
    Next
  </button>
</Link>

        {/* Log in Link */}
        <p
          style={{
            fontFamily: 'Montserrat',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '22px',
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0,
          }}
        >
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#D9CA81', textDecoration: 'none' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AlumniIDRegistration;