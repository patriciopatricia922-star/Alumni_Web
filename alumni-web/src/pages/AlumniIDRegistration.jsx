import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CameraIcon from '../assets/camera_icn.svg';

const OCR_API_KEY = 'K82618949788957';

// ─── OCR Verification ─────────────────────────────────────────────────────────

const verifyAlumniID = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');

  let data = null;
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      data = await response.json();
      if (data && !data.IsErroredOnProcessing) break;
      lastError = data?.ErrorMessage?.[0] || 'OCR processing failed.';
    } catch (err) {
      lastError = err.name === 'AbortError'
        ? `Scan timed out (attempt ${attempt}/3). Retrying...`
        : err.message;
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!data || data.IsErroredOnProcessing) {
    throw new Error(lastError || 'Scan failed after 3 attempts. Please try again.');
  }

  const rawText = data.ParsedResults?.[0]?.ParsedText || '';
  const upperText = rawText.toUpperCase();

  const isNU =
    upperText.includes('NATIONAL') &&
    upperText.includes('UNIVERSITY');
  const isAlumni = upperText.includes('ALUMNI');

  if (!isNU) {
    return { verified: false, reason: 'This ID does not appear to be a National University ID.' };
  }
  if (!isAlumni) {
    return { verified: false, reason: 'This ID does not appear to be an Alumni ID. Please use your official branch ID.' };
  }

  const isDasmarinas =
    upperText.includes('DASMARIÑAS') ||
    upperText.includes('NU-D') ||
    upperText.includes('NUD') ||
    /NU\s+D\b/.test(upperText);

  const otherBranches = [
    { keyword: 'MANILA',        label: 'Manila' },
    { keyword: 'FAIRVIEW',      label: 'Fairview' },
    { keyword: 'MOA',           label: 'MOA' },
    { keyword: 'LIPA',          label: 'Lipa' },
    { keyword: 'BALIWAG',       label: 'Baliwag' },
    { keyword: 'LAGUNA',        label: 'Laguna' },
    { keyword: 'CLARK',         label: 'Clark' },
    { keyword: 'EAST ORTIGAS',  label: 'East Ortigas' },
    { keyword: 'BACOLOD',       label: 'Bacolod' },
    { keyword: 'NAZARETH',      label: 'Nazareth' },
  ];

  const detectedOtherBranch = otherBranches.find(b => upperText.includes(b.keyword));

  if (detectedOtherBranch) {
    return { verified: false, reason: `This appears to be an NU ${detectedOtherBranch.label} Alumni ID. Only NU Dasmariñas Alumni IDs are accepted for registration.` };
  }

  if (!isDasmarinas) {
    return { verified: false, reason: 'This ID could not be verified as an Alumni ID. Please try again.' };
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const isNameLine = (line) => {
    const upper = line.toUpperCase();
    return (
      upper === line &&
      !upper.includes('NATIONAL') && !upper.includes('UNIVERSITY') &&
      !upper.includes('ALUMNI') && !upper.includes('MANILA') &&
      !upper.includes('DASMARINAS') && !upper.includes('CLASS') &&
      !upper.includes('BSBA') && !upper.includes('BS') &&
      !upper.includes('AB') && !upper.includes('NUI') &&
      !upper.match(/^[0-9]+$/) && line.length > 2
    );
  };

  let fullName = '';
  let nameLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (isNameLine(lines[i])) {
      nameLines.push(lines[i]);
      if (nameLines.length >= 2) break;
    } else if (nameLines.length > 0) {
      break;
    }
  }
  fullName = nameLines.join(' ').trim();

  let program = '';
  for (const line of lines) {
    const upper = line.toUpperCase();
    if (
      upper.includes('BS') || upper.includes('AB') || upper.includes('BSBA') ||
      upper.includes('BSED') || upper.includes('BSCS') || upper.includes('BSIT') ||
      upper.includes('BSECE') || upper.includes('BSCPE') || upper.includes('BSME') ||
      upper.includes('BSCE') || upper.includes('BSEE')
    ) {
      program = line.trim();
      break;
    }
  }

  let batchYear = '';
  const yearMatch = rawText.match(/(?:Class\s*)?(\b20\d{2}\b)/i);
  if (yearMatch) batchYear = yearMatch[1];

  let firstName = '';
  let middleName = '';
  let lastName = '';

  if (fullName) {
    const suffixes = ['JR', 'SR', 'JR.', 'SR.'];
    const particles = ['DELA', 'DE', 'DEL', 'DELOS', 'SAN', 'SANTA', 'LOS', 'LAS'];

    const parts = fullName.split(' ');

    let suffix = '';
    const lastPart = parts[parts.length - 1].replace('.', '').toUpperCase();
    if (suffixes.includes(lastPart) && parts.length > 2) {
      suffix = parts.pop();
    }

    let lastNameParts = [];
    if (
      parts.length >= 2 &&
      particles.includes(parts[parts.length - 2].toUpperCase())
    ) {
      lastNameParts = parts.splice(parts.length - 2, 2);
    } else {
      lastNameParts = parts.splice(parts.length - 1, 1);
    }
    lastName = lastNameParts.join(' ') + (suffix ? ' ' + suffix : '');

    if (parts.length === 0) {
      firstName = '';
      middleName = '';
    } else if (parts.length === 1) {
      firstName = parts[0];
      middleName = '';
    } else {
      middleName = parts[parts.length - 1];
      firstName = parts.slice(0, parts.length - 1).join(' ');
    }

    const cap = str => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    firstName = cap(firstName);
    middleName = cap(middleName);
    lastName = cap(lastName);
  }

  return {
    verified: true,
    extracted: { firstName, middleName, lastName, program, batchYear, rawText },
  };
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const scannerStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Arimo:wght@400;600;700&display=swap');
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(1.4); opacity: 0; }
  }
  @keyframes scan-line {
    0% { top: 8%; }
    50% { top: 88%; }
    100% { top: 8%; }
  }
  .scan-line {
    position: absolute;
    left: 6%;
    width: 88%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #51A2FF, transparent);
    box-shadow: 0 0 8px #51A2FF;
    animation: scan-line 2s ease-in-out infinite;
  }

  /* ── RWD Classes ── */
  .aid-back {
    position: fixed;
    top: 27px;
    left: 39px;
    z-index: 10;
  }
  .aid-card {
    width: 680px;
    max-width: 95vw;
    background: rgba(13, 19, 56, 0.25);
    border: 0.8px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 32px 40px;
    box-sizing: border-box;
  }
  .aid-upload-area {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    overflow: hidden;
    transition: border-color 0.4s ease;
  }
  .aid-modal-box {
    width: 360px;
    background: linear-gradient(145deg, #0D1338, #0a0f2e);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 36px 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }

  /* Tablet: <= 768px */
  @media (max-width: 768px) {
    .aid-back         { top: 16px; left: 16px; }
    .aid-card         { padding: 24px 20px; border-radius: 12px; }
    .aid-upload-area  { height: 170px; }
    .aid-modal-box    { width: 90vw; max-width: 360px; }
  }

  /* Mobile: <= 480px */
  @media (max-width: 480px) {
    .aid-back         { top: 12px; left: 12px; }
    .aid-card         { padding: 20px 14px; border-radius: 10px; max-width: 100vw; }
    .aid-upload-area  { height: 150px; }
    .aid-modal-box    { width: 92vw; padding: 24px 20px; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────

const AlumniIDRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [agreed, setAgreed] = useState(false);
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    if (!imageFile) return;
    const run = async () => {
      setStatus('scanning');
      setErrorMsg('');
      setExtractedData(null);
      try {
        const result = await verifyAlumniID(imageFile);
        if (result.verified) {
          setStatus('verified');
          setExtractedData(result.extracted);
        } else {
          setStatus('failed');
          setErrorMsg(result.reason);
        }
      } catch (err) {
        setStatus('failed');
        setErrorMsg(err.message || 'Something went wrong. Please try again.');
      }
    };
    run();
  }, [imageFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setShowModal(false);
  };

  const startCamera = async () => {
    setShowModal(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      setErrorMsg('Could not access camera. Please allow camera permission or use file upload instead.');
      setStatus('failed');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], 'captured-id.jpg', { type: 'image/jpeg' });
      setPreview(URL.createObjectURL(blob));
      setImageFile(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  }, []);

  const handleReset = () => {
    setPreview(null);
    setImageFile(null);
    setStatus('idle');
    setErrorMsg('');
    setExtractedData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNext = () => {
    if (status !== 'verified' || !agreed) return;
    navigate('/signup', { state: { fromIDVerification: true, ...extractedData } });
  };

  const borderColor = {
    idle: 'rgba(0,0,0,0.25)',
    scanning: '#51A2FF',
    verified: '#22C55E',
    failed: '#EF4444',
  }[status];

  return (
    <>
      <style>{scannerStyle}</style>
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          background: '#002263',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arimo, Arial, sans-serif',
          padding: '24px 0',
        }}
      >
        {/* Back Button */}
        <div className="aid-back">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>Back</span>
          </Link>
        </div>

        {/* ── Choice Modal ───────────────────────────────────────────────────── */}
        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >
            <div className="aid-modal-box" onClick={e => e.stopPropagation()}>
              {/* Icon */}
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H5a2 2 0 00-2 2v4M9 3h6M9 3v18m6-18h4a2 2 0 012 2v4M15 3v18M9 21h6M3 9v6m18-6v6M3 15h18" stroke="#51A2FF" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Arimo', fontWeight: 700, fontSize: '18px', color: '#FFFFFF', margin: '0 0 6px 0' }}>Scan Alumni ID</h3>
                <p style={{ fontFamily: 'Arimo', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '18px' }}>
                  Choose how you'd like to provide your ID for verification
                </p>
              </div>

              {/* Upload option */}
              <button
                onClick={() => { setShowModal(false); fileInputRef.current?.click(); }}
                style={{
                  width: '100%', height: '54px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '0 20px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,114,251,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Arimo', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Upload from Device</p>
                  <p style={{ fontFamily: 'Arimo', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>JPG, PNG, or other image formats</p>
                </div>
              </button>

              {/* Camera option */}
              <button
                onClick={startCamera}
                style={{
                  width: '100%', height: '54px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '0 20px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(43,114,251,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(43,114,251,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="#51A2FF" strokeWidth="2"/>
                  </svg>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Use Camera</p>
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Take a photo with your device camera</p>
                </div>
              </button>

              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Camera Fullscreen ──────────────────────────────────────────────── */}
        {cameraActive && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'Arimo, Arial', fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', letterSpacing: '0.3px' }}>
              Align your Alumni ID within the frame
            </p>
            <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '16px', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <div style={{ width: '88%', height: '60%', border: '2px solid rgba(81,162,255,0.7)', borderRadius: '12px', boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)' }} />
              </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={capturePhoto}
                style={{ height: '50px', padding: '0 36px', background: '#2B72FB', border: 'none', borderRadius: '14px', fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '15px', color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 20px rgba(43,114,251,0.4)' }}
              >
                📸 Capture
              </button>
              <button
                onClick={stopCamera}
                style={{ height: '50px', padding: '0 24px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', fontFamily: 'Arimo, Arial', fontSize: '14px', color: '#FFFFFF', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Main Card ─────────────────────────────────────────────────────── */}
        <div className="aid-card">

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '24px', lineHeight: '34px', color: '#FFFFFF', margin: '0 0 6px 0' }}>
              Alumni Registration
            </h1>
            <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Create your account to join
            </p>
          </div>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '15px', lineHeight: '22px', color: '#FFFFFF', margin: '0 0 8px 0' }}>
              Photo of Alumni ID
            </h2>

            {/* Upload Area */}
            <div
              className="aid-upload-area"
              onClick={() => !preview && setShowModal(true)}
              style={{
                background: '#F3F3F5',
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                cursor: preview ? 'default' : 'pointer',
              }}
            >
              {preview ? (
                <img src={preview} alt="Alumni ID Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <img src={CameraIcon} alt="Upload" style={{ width: '90px', height: '90px' }} />
              )}

              {status === 'scanning' && preview && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div className="scan-line" />
                  <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(81,162,255,0.3)', borderTop: '3px solid #51A2FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0, letterSpacing: '0.5px' }}>Scanning ID...</p>
                  </div>
                </div>
              )}

              {status === 'verified' && preview && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(34,197,94,0.5)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {status === 'failed' && preview && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(239,68,68,0.5)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>

            <input ref={fileInputRef} id="alumni-id-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

            {preview && status !== 'scanning' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  onClick={handleReset}
                  style={{ height: '34px', padding: '0 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 3v5h5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Retake Image
                </button>
              </div>
            )}
          </div>

          {/* ── Scanning Tips ─────────────────────────────────────────────── */}
          {status === 'idle' && !preview && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'rgba(81,162,255,0.15)', border: '1px solid rgba(81,162,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#51A2FF" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontWeight: 700, fontSize: '12px', color: '#FFFFFF', margin: 0 }}>Tips for a successful scan</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {[
                  { text: '1. Place your ID on a flat, well-lit surface before scanning.' },
                  { text: '2. Keep the ID straight and avoid tilting or angling it.' },
                  { text: '3. Make sure all text on the ID is clearly visible and not blurry.' },
                  { text: '4. Avoid covering any part of the ID with your fingers.' },
                  { text: "5. Avoid glare — don't scan under direct bright light or flash." },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: '17px' }}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scanning banner */}
          {status === 'scanning' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
              <div style={{ width: '18px', height: '18px', border: '2px solid rgba(81,162,255,0.3)', borderTop: '2px solid #51A2FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: '#93C5FD', margin: 0 }}>Reading your Alumni ID, please wait...</p>
            </div>
          )}

          {/* Failed banner */}
          {status === 'failed' && errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '12px', color: '#FCA5A5', margin: '0 0 2px 0' }}>Verification Failed</p>
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(252,165,165,0.7)', margin: 0, lineHeight: '17px' }}>{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          {/* Verified banner */}
          {status === 'verified' && extractedData && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', padding: '10px 14px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '12px', color: '#86EFAC', margin: 0 }}>Alumni ID Verified!</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '26px' }}>
                {extractedData.firstName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>First Name: </span>{extractedData.firstName}
                  </p>
                )}
                {extractedData.middleName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Middle Name: </span>{extractedData.middleName}
                  </p>
                )}
                {extractedData.lastName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Last Name: </span>{extractedData.lastName}
                  </p>
                )}
                {extractedData.program && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Program: </span>{extractedData.program}
                  </p>
                )}
                {extractedData.batchYear && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Batch Year: </span>{extractedData.batchYear}
                  </p>
                )}
              </div>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '10px', color: 'rgba(255,255,255,0.25)', margin: '6px 0 0 26px' }}>
                This info will be pre-filled in your signup form.
              </p>
            </div>
          )}

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '17px', height: '17px', accentColor: '#2B72FB', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="terms" style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', cursor: 'pointer' }}>
              I agree to the{' '}
              <Link to="/terms" style={{ color: '#D9CA81', textDecoration: 'none' }}>Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" style={{ color: '#D9CA81', textDecoration: 'none' }}>Privacy Policy</Link>
            </label>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={status !== 'verified' || !agreed}
            style={{
              width: '100%', height: '46px',
              background: status === 'verified' && agreed ? 'rgba(0, 40, 255, 0.7)' : 'rgba(0, 40, 255, 0.25)',
              boxShadow: status === 'verified' && agreed ? '0px 4px 20px rgba(0,40,255,0.3)' : 'none',
              border: 'none', borderRadius: '14px',
              fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '15px', lineHeight: '24px',
              color: '#FFFFFF', cursor: status === 'verified' && agreed ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              marginBottom: '14px',
            }}
          >
            {status === 'scanning' ? 'Verifying...' : status === 'verified' ? 'Next' : 'Verify Your ID to Continue'}
          </button>

          {/* Log in link */}
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#D9CA81', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AlumniIDRegistration;