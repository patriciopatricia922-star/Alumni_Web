import React from 'react';
import { Link } from 'react-router-dom';
import CameraIcon from '../assets/camera_icn.svg';
import '../styles/IDregistration.css';

const IDRegistrationView = ({
  fileInputRef, videoRef, canvasRef,
  agreed, preview, showModal, cameraActive,
  status, errorMsg, extractedData, camGuide,
  borderColor, frameBorder,
  setAgreed, setShowModal,
  startCamera, stopCamera,
  handleFileChange, handleReset, handleNext,
  // Modal-context props (optional — only passed when used inside modal)
  isModal = false,
  onSwitchToLogin,
}) => (
  <>
    <div style={{ width:'100%', height: isModal ? 'auto' : '100vh', background:'#002263', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Arimo,Arial,sans-serif', overflow: isModal ? 'visible' : 'hidden' }}>

      {/* Back Button — only shown on full-page route, not in modal */}
      {!isModal && (
        <div className="aid-back">
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px', textDecoration:'none' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M12 7.5H3M3 7.5L7.5 3M3 7.5L7.5 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily:'Arimo', fontWeight:700, fontSize:'14px', color:'#FFFFFF' }}>Back</span>
          </Link>
        </div>
      )}

      {/* ── Choice Modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div className="aid-modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'rgba(43,114,251,0.15)', border:'1px solid rgba(43,114,251,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M9 3H5a2 2 0 00-2 2v4M9 3h6M9 3v18m6-18h4a2 2 0 012 2v4M15 3v18M9 21h6M3 9v6m18-6v6M3 15h18" stroke="#51A2FF" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ textAlign:'center' }}>
              <h3 style={{ fontFamily:'Arimo', fontWeight:700, fontSize:'18px', color:'#FFFFFF', margin:'0 0 6px 0' }}>Scan Alumni ID</h3>
              <p style={{ fontFamily:'Arimo', fontSize:'12px', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:'18px' }}>Choose how you'd like to provide your ID for verification</p>
            </div>
            <button onClick={() => { setShowModal(false); fileInputRef.current?.click(); }}
              style={{ width:'100%', height:'54px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', padding:'0 20px', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(43,114,251,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(43,114,251,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontFamily:'Arimo', fontWeight:600, fontSize:'13px', color:'#FFFFFF', margin:0 }}>Upload from Device</p>
                <p style={{ fontFamily:'Arimo', fontSize:'11px', color:'rgba(255,255,255,0.4)', margin:0 }}>JPG, PNG, or other image formats</p>
              </div>
            </button>
            <button onClick={startCamera}
              style={{ width:'100%', height:'54px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'14px', cursor:'pointer', display:'flex', alignItems:'center', gap:'14px', padding:'0 20px', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(43,114,251,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
              <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'rgba(43,114,251,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke="#51A2FF" strokeWidth="2"/></svg>
              </div>
              <div style={{ textAlign:'left' }}>
                <p style={{ fontFamily:'Arimo', fontWeight:600, fontSize:'13px', color:'#FFFFFF', margin:0 }}>Use Camera</p>
                <p style={{ fontFamily:'Arimo', fontSize:'11px', color:'rgba(255,255,255,0.4)', margin:0 }}>ID will be captured automatically when stable</p>
              </div>
            </button>
            <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', fontFamily:'Arimo', fontSize:'12px', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Camera Fullscreen ──────────────────────────────────────────────── */}
      {cameraActive && (
        <div style={{ position:'fixed', inset:0, zIndex: isModal ? 3000 : 100, background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px' }}>
          <div style={{ minHeight:'36px', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.55)', borderRadius:'20px', padding:'0 20px', backdropFilter:'blur(4px)' }}>
            <p style={{ fontFamily:'Arimo,Arial', fontSize:'14px', fontWeight:600, color:'#FFFFFF', margin:0, letterSpacing:'0.2px', textAlign:'center' }}>{camGuide}</p>
          </div>
          <div style={{ position:'relative', width:'90%', maxWidth:'600px' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width:'100%', borderRadius:'16px', display:'block' }} />
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
              <div style={{ width:'88%', height:'60%', border:`2px solid ${frameBorder}`, borderRadius:'12px', boxShadow:'0 0 0 2000px rgba(0,0,0,0.5)', transition:'border-color 0.3s ease', position:'relative' }}>
                {[
                  { top:-2,    left:-2,   borderTopWidth:3,    borderLeftWidth:3,   borderTopLeftRadius:4    },
                  { top:-2,    right:-2,  borderTopWidth:3,    borderRightWidth:3,  borderTopRightRadius:4   },
                  { bottom:-2, left:-2,   borderBottomWidth:3, borderLeftWidth:3,   borderBottomLeftRadius:4 },
                  { bottom:-2, right:-2,  borderBottomWidth:3, borderRightWidth:3,  borderBottomRightRadius:4 },
                ].map((s, i) => (
                  <div key={i} style={{ position:'absolute', width:20, height:20, borderStyle:'solid', borderWidth:0, borderColor:frameBorder, ...s }} />
                ))}
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display:'none' }} />
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <p style={{ fontFamily:'Arimo,Arial', fontSize:'12px', color:'rgba(255,255,255,0.4)', margin:0 }}>ID will be captured automatically when stable</p>
            <button onClick={stopCamera} style={{ height:'44px', padding:'0 28px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'12px', fontFamily:'Arimo,Arial', fontSize:'14px', color:'#FFFFFF', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Main Card ──────────────────────────────────────────────────────── */}
      <div className="aid-card">
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <h1 style={{ fontFamily:'Arimo,Arial', fontWeight:700, fontSize:'24px', lineHeight:'34px', color:'#FFFFFF', margin:'0 0 6px 0' }}>Alumni Registration</h1>
          <p style={{ fontFamily:'Arimo,Arial', fontWeight:400, fontSize:'13px', lineHeight:'20px', color:'rgba(255,255,255,0.7)', margin:0 }}>Create your account to join</p>
        </div>

        {/* Upload section */}
        <div style={{ marginBottom:'14px' }}>
          <h2 style={{ fontFamily:'Arimo,Arial', fontWeight:700, fontSize:'15px', lineHeight:'22px', color:'#FFFFFF', margin:'0 0 8px 0' }}>Photo of Alumni ID</h2>
          <div className="aid-upload-area"
            onClick={() => !preview && setShowModal(true)}
            style={{ background:'#F3F3F5', border:`2px solid ${borderColor}`, borderRadius:'14px', cursor:preview?'default':'pointer' }}>
            {preview ? (
              <img src={preview} alt="Alumni ID Preview" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            ) : (
              <img src={CameraIcon} alt="Upload" style={{ width:'90px', height:'90px' }} />
            )}
            {status === 'scanning' && preview && (
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
                <div className="scan-line" />
                <div style={{ marginTop:'60px', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                  <div style={{ width:'36px', height:'36px', border:'3px solid rgba(81,162,255,0.3)', borderTop:'3px solid #51A2FF', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                  <p style={{ fontFamily:'Arimo,Arial', fontWeight:600, fontSize:'13px', color:'#FFFFFF', margin:0 }}>Scanning ID...</p>
                </div>
              </div>
            )}
            {status === 'verified' && preview && (
              <div style={{ position:'absolute', top:'12px', right:'12px', width:'32px', height:'32px', borderRadius:'50%', background:'#22C55E', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(34,197,94,0.5)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
            {status === 'failed' && preview && (
              <div style={{ position:'absolute', top:'12px', right:'12px', width:'32px', height:'32px', borderRadius:'50%', background:'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 12px rgba(239,68,68,0.5)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
            )}
          </div>

          <input ref={fileInputRef} id="alumni-id-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />

          {preview && status !== 'scanning' && (
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'6px' }}>
              <button onClick={handleReset} style={{ height:'34px', padding:'0 16px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'10px', fontFamily:'Arimo,Arial', fontSize:'12px', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 3v5h5" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Retake Image
              </button>
            </div>
          )}
        </div>

        {/* Scanning tips */}
        {status === 'idle' && !preview && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'12px 16px', marginBottom:'14px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
              <div style={{ width:'24px', height:'24px', borderRadius:'7px', background:'rgba(81,162,255,0.15)', border:'1px solid rgba(81,162,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#51A2FF" strokeWidth="2"/><path d="M12 8v4M12 16h.01" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontFamily:'Arimo,Arial', fontWeight:700, fontSize:'12px', color:'#FFFFFF', margin:0 }}>Tips for a successful scan</p>
            </div>
            {['1. Place your ID on a flat, well-lit surface before scanning.',
              '2. Keep the ID straight and avoid tilting or angling it.',
              '3. Make sure all text on the ID is clearly visible and not blurry.',
              '4. Avoid covering any part of the ID with your fingers.',
              "5. Avoid glare — don't scan under direct bright light or flash."
            ].map((tip, i) => (
              <p key={i} style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.55)', margin:'0 0 4px 0', lineHeight:'17px' }}>{tip}</p>
            ))}
          </div>
        )}

        {/* Scanning banner */}
        {status === 'scanning' && (
          <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(81,162,255,0.08)', border:'1px solid rgba(81,162,255,0.2)', borderRadius:'10px', padding:'10px 14px', marginBottom:'12px' }}>
            <div style={{ width:'18px', height:'18px', border:'2px solid rgba(81,162,255,0.3)', borderTop:'2px solid #51A2FF', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
            <p style={{ fontFamily:'Arimo,Arial', fontSize:'12px', color:'#93C5FD', margin:0 }}>Reading your Alumni ID, please wait...</p>
          </div>
        )}

        {/* Failed banner */}
        {status === 'failed' && errorMsg && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'10px' }}>
              <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#EF4444', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round"/></svg>
              </div>
              <div>
                <p style={{ fontFamily:'Arimo,Arial', fontWeight:600, fontSize:'12px', color:'#FCA5A5', margin:'0 0 2px 0' }}>Verification Failed</p>
                <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(252,165,165,0.7)', margin:0, lineHeight:'17px' }}>{errorMsg}</p>
              </div>
            </div>
          </div>
        )}

        {/* Verified banner */}
        {status === 'verified' && extractedData && (
          <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'10px', padding:'10px 14px', marginBottom:'12px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
              <div style={{ width:'18px', height:'18px', borderRadius:'50%', background:'#22C55E', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p style={{ fontFamily:'Arimo,Arial', fontWeight:700, fontSize:'12px', color:'#86EFAC', margin:0 }}>Alumni ID Verified!</p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px', paddingLeft:'26px' }}>
              {extractedData.firstName  && <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>First Name: </span>{extractedData.firstName}</p>}
              {extractedData.middleName && <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>Middle Name: </span>{extractedData.middleName}</p>}
              {extractedData.lastName   && <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>Last Name: </span>{extractedData.lastName}</p>}
              {extractedData.program    && <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>Program: </span>{extractedData.program}</p>}
              {extractedData.batchYear  && <p style={{ fontFamily:'Arimo,Arial', fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}><span style={{ color:'rgba(255,255,255,0.35)' }}>Batch Year: </span>{extractedData.batchYear}</p>}
            </div>
            <p style={{ fontFamily:'Arimo,Arial', fontSize:'10px', color:'rgba(255,255,255,0.25)', margin:'6px 0 0 26px' }}>This info will be pre-filled in your signup form.</p>
          </div>
        )}

        {/* Terms */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
          <input type="checkbox" id="terms-id" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width:'17px', height:'17px', accentColor:'#2B72FB', cursor:'pointer', flexShrink:0 }} />
          <label htmlFor="terms-id" style={{ fontFamily:'Arimo,Arial', fontWeight:400, fontSize:'13px', lineHeight:'20px', color:'#FFFFFF', cursor:'pointer' }}>
            I agree to the{' '}
            <Link to="/terms" style={{ color:'#D9CA81', textDecoration:'none' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color:'#D9CA81', textDecoration:'none' }}>Privacy Policy</Link>
          </label>
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={status !== 'verified' || !agreed}
          style={{ width:'100%', height:'46px', background:status==='verified'&&agreed?'rgba(0,40,255,0.7)':'rgba(0,40,255,0.25)', boxShadow:'0px 2px 2px rgba(255,255,255,0.25)', border:'none', borderRadius:'14px', fontFamily:'Arimo,Arial', fontWeight:700, fontSize:'15px', lineHeight:'24px', color:'#FFFFFF', cursor:status==='verified'&&agreed?'pointer':'not-allowed', transition:'all 0.3s ease', marginBottom:'14px' }}>
          {status === 'scanning' ? 'Verifying...' : 'Next'}
        </button>

        {/* Footer link — switches to login in modal, links normally on full page */}
        <p style={{ fontFamily:'Arimo,Arial', fontWeight:400, fontSize:'13px', lineHeight:'20px', color:'#FFFFFF', textAlign:'center', margin:0 }}>
          Already have an account?{' '}
          {isModal ? (
            <button onClick={onSwitchToLogin} style={{ background:'none', border:'none', padding:0, color:'#D9CA81', fontFamily:'Arimo,Arial', fontSize:'13px', fontWeight:700, cursor:'pointer' }}>Log in</button>
          ) : (
            <Link to="/login" style={{ color:'#D9CA81', textDecoration:'none', fontWeight:700 }}>Log in</Link>
          )}
        </p>
      </div>
    </div>
  </>
);

export default IDRegistrationView;