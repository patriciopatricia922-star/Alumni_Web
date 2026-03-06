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

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!data || data.IsErroredOnProcessing) {
    throw new Error(data?.ErrorMessage?.[0] || 'OCR processing failed. Please try again.');
  }

  const rawText = data.ParsedResults?.[0]?.ParsedText || '';
  console.log('OCR RAW TEXT:', rawText); // debug — check browser console
  const upperText = rawText.toUpperCase();

  // OCR splits lines so check each word separately
  const isNU =
    upperText.includes('NATIONAL') &&
    upperText.includes('UNIVERSITY');
  const isAlumni = upperText.includes('ALUMNI');

  if (!isNU) {
    return { verified: false, reason: 'This ID does not appear to be a National University ID. Please use your official NU Alumni ID.' };
  }
  if (!isAlumni) {
    return { verified: false, reason: 'This ID does not appear to be an Alumni ID. Please use your official NU Alumni ID.' };
  }

  // ── Extract info ─────────────────────────────────────────────────────────
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

  // Collect consecutive all-caps name lines and join them
  let fullName = '';
  let nameLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (isNameLine(lines[i])) {
      nameLines.push(lines[i]);
      // Check if next line is also a name line — if so keep collecting
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
    // Filipino compound last name particles
    const particles = ['DELA', 'DE', 'DEL', 'DELOS', 'SAN', 'SANTA', 'LOS', 'LAS'];

    const parts = fullName.split(' ');

    // 1. Separate suffix only if there are enough name parts remaining
    //    e.g. dont strip "II" if it would leave us with < 2 parts
    let suffix = '';
    const lastPart = parts[parts.length - 1].replace('.', '').toUpperCase();
    if (suffixes.includes(lastPart) && parts.length > 2) {
      suffix = parts.pop();
    }

    // 2. Detect compound last name (e.g. Dela Cruz, De Leon, San Jose)
    //    If second-to-last word is a particle, last name = last 2 words
    let lastNameParts = [];
    if (
      parts.length >= 2 &&
      particles.includes(parts[parts.length - 2].toUpperCase())
    ) {
      lastNameParts = parts.splice(parts.length - 2, 2); // grab last 2 words
    } else {
      lastNameParts = parts.splice(parts.length - 1, 1); // grab last 1 word
    }
    lastName = lastNameParts.join(' ') + (suffix ? ' ' + suffix : '');

    // 3. Remaining parts: last word = middle name, rest = first name
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

    // 4. Capitalize each word properly
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

// ─── Scanning Spinner ─────────────────────────────────────────────────────────

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
  const [status, setStatus] = useState('idle'); // 'idle' | 'scanning' | 'verified' | 'failed'
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  // ── Auto-scan whenever imageFile changes ───────────────────────────────────
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

  // ── File Upload ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setShowModal(false);
  };

  // ── Camera ─────────────────────────────────────────────────────────────────
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
      setImageFile(file); // triggers auto-scan via useEffect
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

  // ── Border color by status ─────────────────────────────────────────────────
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
          padding: '48px 0',
        }}
      >
        {/* Back Button */}
        <div style={{ position: 'fixed', top: '27px', left: '39px', zIndex: 10 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontFamily: 'Arimo, Arial, sans-serif', fontWeight: 700, fontSize: '14px', lineHeight: '16px', color: '#FFFFFF' }}>Back</span>
          </Link>
        </div>

        {/* ── Choice Modal ───────────────────────────────────────────────────── */}
        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: 'linear-gradient(145deg, #0D1338, #0a0f2e)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '36px 32px',
                width: '360px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
              }}
            >
              {/* Icon */}
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(43,114,251,0.15)', border: '1px solid rgba(43,114,251,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path d="M9 3H5a2 2 0 00-2 2v4M9 3h6M9 3v18m6-18h4a2 2 0 012 2v4M15 3v18M9 21h6M3 9v6m18-6v6M3 15h18" stroke="#51A2FF" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '18px', color: '#FFFFFF', margin: '0 0 6px 0' }}>Scan Alumni ID</h3>
                <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: '18px' }}>
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
                  <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Upload from Device</p>
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>JPG, PNG, or other image formats</p>
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
                Capture
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

        {/* ── Main Card (original layout preserved) ─────────────────────────── */}
        <div
          style={{
            width: '800px',
            maxWidth: '95vw',
            background: 'rgba(13, 19, 56, 0.25)',
            border: '0.8px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '48px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '28px', lineHeight: '42px', color: '#FFFFFF', margin: '0 0 12px 0' }}>
              Alumni Registration
            </h1>
            <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '16px', lineHeight: '24px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
              Create your account to join
            </p>
          </div>

          {/* Photo Upload Section */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '20px', lineHeight: '30px', color: '#FFFFFF', margin: '0 0 16px 0' }}>
              Photo of Alumni ID
            </h2>

            {/* Upload Area */}
            <div
              onClick={() => !preview && setShowModal(true)}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                width: '100%', height: '300px',
                background: '#F3F3F5',
                border: `2px solid ${borderColor}`,
                borderRadius: '14px',
                cursor: preview ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'border-color 0.4s ease',
              }}
            >
              {preview ? (
                <img src={preview} alt="Alumni ID Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <img src={CameraIcon} alt="Upload" style={{ width: '139px', height: '139px' }} />
              )}

              {/* Scanning overlay on top of preview */}
              {status === 'scanning' && preview && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  <div className="scan-line" />
                  <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(81,162,255,0.3)', borderTop: '3px solid #51A2FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '13px', color: '#FFFFFF', margin: 0, letterSpacing: '0.5px' }}>Scanning ID...</p>
                  </div>
                </div>
              )}

              {/* Verified overlay checkmark */}
              {status === 'verified' && preview && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(34,197,94,0.5)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Failed overlay x mark */}
              {status === 'failed' && preview && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(239,68,68,0.5)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} id="alumni-id-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

            {/* Retry button — only shown after failed or verified */}
            {preview && status !== 'scanning' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  onClick={handleReset}
                  style={{ height: '38px', padding: '0 20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontFamily: 'Arimo, Arial', fontSize: '13px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '20px 24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(81,162,255,0.15)', border: '1px solid rgba(81,162,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#51A2FF" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontWeight: 700, fontSize: '13px', color: '#FFFFFF', margin: 0 }}>Tips for a successful scan</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {  text: 'Place your ID on a flat, well-lit surface before scanning.' },
                  {  text: 'Keep the ID straight and avoid tilting or angling it.' },
                  {  text: 'Make sure all text on the ID is clearly visible and not blurry.' },
                  {  text: 'Avoid covering any part of the ID with your fingers.' },
                  {  text: "Avoid glare — don't scan under direct bright light or flash." },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{tip.icon}</span>
                    <p style={{ fontFamily: 'Arimo, Arial, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: '18px' }}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Status Banners ──────────────────────────────────────────────── */}

          {/* Scanning */}
          {status === 'scanning' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(81,162,255,0.08)', border: '1px solid rgba(81,162,255,0.2)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid rgba(81,162,255,0.3)', borderTop: '2px solid #51A2FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '13px', color: '#93C5FD', margin: 0 }}>Reading your Alumni ID, please wait...</p>
            </div>
          )}

          {/* Failed */}
          {status === 'failed' && errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 600, fontSize: '13px', color: '#FCA5A5', margin: '0 0 4px 0' }}>Verification Failed</p>
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(252,165,165,0.7)', margin: 0, lineHeight: '18px' }}>{errorMsg}</p>
                </div>
              </div>
            </div>
          )}

          {/* Verified */}
          {status === 'verified' && extractedData && (
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '16px 18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '13px', color: '#86EFAC', margin: 0 }}>Alumni ID Verified!</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '30px' }}>
                {extractedData.firstName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>First Name: </span>{extractedData.firstName}
                  </p>
                )}
                {extractedData.middleName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Middle Name: </span>{extractedData.middleName}
                  </p>
                )}
                {extractedData.lastName && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Last Name: </span>{extractedData.lastName}
                  </p>
                )}
                {extractedData.program && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Program: </span>{extractedData.program}
                  </p>
                )}
                {extractedData.batchYear && (
                  <p style={{ fontFamily: 'Arimo, Arial', fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>Batch Year: </span>{extractedData.batchYear}
                  </p>
                )}
              </div>
              <p style={{ fontFamily: 'Arimo, Arial', fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: '10px 0 0 30px' }}>
                This info will be pre-filled in your signup form.
              </p>
            </div>
          )}

          {/* Terms Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#2B72FB', cursor: 'pointer', flexShrink: 0 }}
            />
            <label htmlFor="terms" style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '15px', lineHeight: '24px', color: '#FFFFFF', cursor: 'pointer' }}>
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
              width: '100%', height: '50px',
              background: status === 'verified' && agreed ? 'rgba(0, 40, 255, 0.7)' : 'rgba(0, 40, 255, 0.25)',
              boxShadow: status === 'verified' && agreed ? '0px 4px 20px rgba(0,40,255,0.3)' : 'none',
              border: 'none', borderRadius: '14px',
              fontFamily: 'Arimo, Arial', fontWeight: 700, fontSize: '16px', lineHeight: '24px',
              color: '#FFFFFF', cursor: status === 'verified' && agreed ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
            }}
          >
            {status === 'scanning' ? 'Verifying...' : status === 'verified' ? 'Next →' : 'Verify Your ID to Continue'}
          </button>

          {/* Log in link */}
          <p style={{ fontFamily: 'Arimo, Arial', fontWeight: 400, fontSize: '15px', lineHeight: '22px', color: '#FFFFFF', textAlign: 'center', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#D9CA81', textDecoration: 'none' }}>Log in</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default AlumniIDRegistration;