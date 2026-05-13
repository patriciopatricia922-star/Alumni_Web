import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from 'react-icons/fa';
import '../modals/Disc.css';

// ============================================
// DEFAULTS — exported so DisclosureTabContent
// in Contentmgmtview.jsx can import and use
// the same fallback text for tab previews.
// ============================================
export const DEFAULT_TOS = `<h3>TERMS OF SERVICE</h3>
<p><strong>1. Acceptance of Terms</strong><br/>By accessing or using AlumnAI, you agree to comply with these Terms of Service. If you do not agree, you may not use the platform.</p>
<p><strong>2. Purpose of the Platform</strong><br/>AlumnAI is designed to support alumni engagement, data collection, and analytics for institutional use, including surveys, announcements, job opportunities, events, and alumni services.</p>
<p><strong>3. User Responsibilities</strong><br/>Provide accurate and truthful information. Use the platform only for lawful and appropriate purposes. Keep your login credentials secure and confidential. Refrain from activities that may disrupt or harm the platform.</p>
<p><strong>4. Data Use and Accuracy</strong><br/>The institution may use aggregated data for analytics, reporting, and institutional improvement. AlumnAI is not responsible for inaccuracies resulting from incorrect information provided by users.</p>
<p><strong>5. Availability and Updates</strong><br/>The institution may modify, update, or discontinue platform features at any time without prior notice.</p>
<p><strong>6. Limitation of Liability</strong><br/>AlumnAI is provided "as is". The institution is not liable for any damages arising from the use or inability to use the platform, including data loss, unauthorized access, or technical issues.</p>
<p><strong>7. Changes to the Terms</strong><br/>We may update these Terms of Service from time to time. Continued use of the platform means you accept the updated terms.</p>`;

export const DEFAULT_PP = `<h3>PRIVACY POLICY</h3>
<p><strong>8. Information We Collect</strong><br/>We may collect: Personal Information (Name, Contact Details, Demographic info), Educational Data (Program, Year Graduated, Academic Records), Employment Information (Job Details, Career Progress), and Usage Data (Device Information, Logs, Interactions).</p>
<p><strong>9. How We Use Your Information</strong><br/>Information may be used to maintain and improve alumni records, analyze graduate outcomes, provide personalized alumni services, and enhance alumni engagement.</p>
<p><strong>10. Data Sharing</strong><br/>We do not sell personal data. Information may only be shared with internal university offices for legitimate purposes, or third-party service providers under strict confidentiality agreements.</p>
<p><strong>11. Data Security</strong><br/>We implement administrative, technical, and physical measures to protect your information. While we strive to safeguard your data, no system can guarantee absolute security.</p>
<p><strong>12. User Rights</strong><br/>You have the right to access a copy of your personal data and update or correct inaccurate information.</p>
<p><strong>13. Cookies and Tracking</strong><br/>The platform may use cookies or similar technologies to improve functionality and user experience.</p>
<p><strong>14. Data Retention</strong><br/>Your information is retained only for as long as needed for institutional purposes, unless a longer retention period is required by law or policy.</p>
<p><strong>15. Third-Party Links</strong><br/>AlumnAI may contain links to third-party sites. We are not responsible for the privacy practices of external platforms.</p>
<p><strong>16. Updates to the Policy</strong><br/>We may revise this Privacy Policy from time to time. Continued use of AlumnAI means you agree to the updated policy.</p>
<p><strong>17. Contact Us</strong><br/>Email: nudaao@nu-dasma.edu.ph | Phone: 0912-345-6789 | Location: Governor\'s Drive, Sampaloc 1, City of Dasmaric\xf1as, Cavite 4114</p>`;

// ============================================
// RICH TEXT EDITOR
// ============================================
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  const execCmd = (cmd) => {
    document.execCommand(cmd, false, null);
    onChange(editorRef.current.innerHTML);
    editorRef.current.focus();
  };

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  return (
    <div className="cm-rich-editor">
      <div className="cm-rich-toolbar">
        <button type="button" className="cm-toolbar-btn" title="Bold"         onClick={() => execCmd('bold')}         ><FaBold      size={11} /></button>
        <button type="button" className="cm-toolbar-btn" title="Italic"       onClick={() => execCmd('italic')}       ><FaItalic    size={11} /></button>
        <button type="button" className="cm-toolbar-btn" title="Underline"    onClick={() => execCmd('underline')}    ><FaUnderline size={11} /></button>
        <div style={{ width: 1, height: 18, background: '#E2E8F0', margin: '0 4px', alignSelf: 'center' }} />
        <button type="button" className="cm-toolbar-btn" title="Align Left"   onClick={() => execCmd('justifyLeft')}  ><FaAlignLeft   size={11} /></button>
        <button type="button" className="cm-toolbar-btn" title="Align Center" onClick={() => execCmd('justifyCenter')}><FaAlignCenter size={11} /></button>
        <button type="button" className="cm-toolbar-btn" title="Align Right"  onClick={() => execCmd('justifyRight')} ><FaAlignRight  size={11} /></button>
      </div>
      <div
        ref={editorRef}
        className="cm-rich-content"
        style={{ minHeight: 300, maxHeight: 400, overflowY: 'auto', lineHeight: 1.6 }}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
      />
    </div>
  );
};

// ============================================
// DISCLOSURE MODAL
//
// EDITOR-ONLY — no internal card picker.
// The card picker lives on the disclosure tab itself (DisclosureTabContent).
//
// X button  → onClose  (closes whole modal)
// Cancel    → onClose  (closes whole modal)
// Save      → onUpdate({ tos_content, pp_content }) which upserts to Supabase,
//             then calls closeDisclosureModal on success (wired in ContentManagement.jsx)
//
// DB-ready: pass `disclosure` prop from Supabase and wire `onUpdate` to the
// handleDisclosureUpdate handler in ContentManagement.jsx.
// ============================================
const DisclosureModal = ({ open, onClose, disclosure, onUpdate, initialEditing }) => {
  const [tosContent, setTosContent] = useState('');
  const [ppContent,  setPpContent]  = useState('');
  const [loading,    setLoading]    = useState(false);

  // Sync editor state whenever modal opens or disclosure data arrives from DB.
  // Falls back to DEFAULT_* so the editor is never empty.
  useEffect(() => {
    if (open) {
      setTosContent(disclosure?.tos_content || DEFAULT_TOS);
      setPpContent(disclosure?.pp_content   || DEFAULT_PP);
    }
  }, [open, disclosure]);

  // Render nothing if closed or no target document was specified.
  if (!open || !initialEditing) return null;

  const isTos      = initialEditing === 'tos';
  const docLabel   = isTos ? 'Terms of Service' : 'Privacy Policy';
  const content    = isTos ? tosContent : ppContent;
  const setContent = isTos ? setTosContent : setPpContent;

  const handleSave = async () => {
    setLoading(true);
    try {
      // Passes both fields so the upsert always writes the full row.
      await onUpdate({ tos_content: tosContent, pp_content: ppContent });
      // ContentManagement.handleDisclosureUpdate closes the modal on success.
    } catch (err) {
      console.error('[DisclosureModal] save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div
        className="cm-modal"
        style={{ width: 700, maxWidth: '95vw' }}
        onClick={e => e.stopPropagation()}
      >
        {/* X — always closes the whole modal */}
        <button className="cm-modal-close" onClick={onClose}>
          <FiX size={15} />
        </button>

        <h2 className="cm-modal-title">{docLabel}</h2>
        <p className="cm-modal-subtitle">Edit content below, then click Save Changes.</p>

        <div className="cm-modal-fields">
          <div className="cm-field">
            <label className="cm-label">{docLabel} Content</label>
            {/* key forces the editor to remount if user switches between TOS and PP */}
            <RichTextEditor
              key={initialEditing}
              value={content}
              onChange={setContent}
              placeholder={`Enter ${docLabel} content\u2026`}
            />
          </div>
        </div>

        <div className="cm-modal-actions">
          <button className="cm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="cm-btn-submit" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving\u2026' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclosureModal;