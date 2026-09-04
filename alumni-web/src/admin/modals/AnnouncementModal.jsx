import React, { useState, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
} from "react-icons/fa";
import { FiX, FiChevronDown } from "react-icons/fi";
import MultiImageUpload from "../modals/MultiImageUpload";
import SpecificUserModal from "../modals/SpecificUserModal";
import BatchProgramModal from "../modals/BatchProgramModal";
import { useAlumniType } from "../contexts/AlumniTypeContext"; // adjust path to match your project
import "../modals/Disc.css";

// ── Date restriction helper ───────────────────────────────────────────────────
// Returns today's date as 'YYYY-MM-DD' (local time), used as the `min` for
// date inputs so past dates cannot be selected. Computed at render time so it
// stays correct on any future day.
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ── Shared modal shell ────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, children }) => {
  if (!open) return null;
  return (
    <div className="cm-modal-overlay" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-modal-close" onClick={onClose} aria-label="Close">
          <FiX size={16} />
        </button>
        <h2 className="cm-modal-title">{title}</h2>
        <p className="cm-modal-subtitle">{subtitle}</p>
        {children}
      </div>
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div className="cm-field">
    <label className="cm-label">
      {label}
      {required && <span className="cm-label-required"> *</span>}
    </label>
    {children}
  </div>
);

// ── Footer ────────────────────────────────────────────────────────────────────
const ModalFooter = ({ onCancel, createLabel, loading, onSubmit }) => (
  <div className="cm-modal-actions">
    <button className="cm-btn-cancel" onClick={onCancel}>
      Cancel
    </button>
    <button className="cm-btn-submit" onClick={onSubmit} disabled={loading}>
      {loading ? "Saving..." : createLabel}
    </button>
  </div>
);

// ── Rich text editor ──────────────────────────────────────────────────────────
const RichTextEditor = ({ value, onChange, placeholder }) => {
  const editorRef = React.useRef(null);

  const execCommand = (command) => {
    document.execCommand(command, false, null);
    onChange(editorRef.current.innerHTML);
    editorRef.current.focus();
  };

  React.useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div className="cm-rich-editor">
      <div className="cm-rich-toolbar">
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          {" "}
          <FaBold size={13} />
        </button>
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          {" "}
          <FaItalic size={13} />
        </button>
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("underline")}
          title="Underline"
        >
          {" "}
          <FaUnderline size={13} />
        </button>
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        >
          {" "}
          <FaAlignLeft size={13} />
        </button>
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        >
          {" "}
          <FaAlignCenter size={13} />
        </button>
        <button
          type="button"
          className="cm-toolbar-btn"
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        >
          {" "}
          <FaAlignRight size={13} />
        </button>
      </div>
      <div
        ref={editorRef}
        className="cm-rich-content"
        contentEditable="true"
        onInput={() => onChange(editorRef.current.innerHTML)}
        data-placeholder={placeholder}
        style={{ minHeight: "100px" }}
      />
    </div>
  );
};

// ── AnnouncementModal ─────────────────────────────────────────────────────────
const AnnouncementModal = ({
  open,
  onClose,
  mode,
  announcement,
  onCreate,
  onUpdate,
}) => {
  const { alumniType } = useAlumniType();

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "Medium",
    audience: "All Alumni",
    expiry: "",
    image_urls: [],
    // ── Specific-user targeting ─────────────────────────────────────────────
    target_user_id: null,
    target_user_name: "",
    target_user_email: "",
    // ── NEW: batch / program targeting ──────────────────────────────────────
    target_filter_value: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [batchProgramPickerOpen, setBatchProgramPickerOpen] = useState(false);

  useEffect(() => {
    if (mode === "edit" && announcement) {
      setForm({
        title: announcement.title || "",
        content: announcement.content || "",
        priority: announcement.priority || "Medium",
        audience: announcement.audience || "All Alumni",
        expiry: announcement.expiry || "",
        image_urls: announcement.image_urls?.length
          ? announcement.image_urls
          : announcement.image_url
            ? [announcement.image_url]
            : [],
        target_user_id: announcement.target_user_id || null,
        target_user_name: announcement.target_user_name || "",
        target_user_email: announcement.target_user_email || "",
        target_filter_value: announcement.target_filter_value || "",
      });
    } else {
      setForm({
        title: "",
        content: "",
        priority: "Medium",
        audience: "All Alumni",
        expiry: "",
        image_urls: [],
        target_user_id: null,
        target_user_name: "",
        target_user_email: "",
        target_filter_value: "",
      });
    }
    setFormError("");
  }, [mode, announcement]);

  const s = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Guards a date field against past dates regardless of entry method
  // (calendar click, typed digits, or paste). `min` on the input restricts
  // the calendar UI; this catches any value that still slips through.
  const handleDateFieldChange = (k) => (e) => {
    const val = e.target.value;
    const today = getTodayDateString();
    s(k, val && val < today ? today : val);
  };

  // Switching audience clears whichever targeting fields no longer apply,
  // and auto-opens the relevant picker so the admin isn't left with a
  // blank required field.
  const handleAudienceChange = (value) => {
    setForm((f) => ({
      ...f,
      audience: value,
      ...(value !== "Specific User"
        ? { target_user_id: null, target_user_name: "", target_user_email: "" }
        : {}),
      ...(value !== "By Program" && value !== "By Batch"
        ? { target_filter_value: "" }
        : {}),
    }));
    if (value === "Specific User") setUserPickerOpen(true);
    if (value === "By Program" || value === "By Batch")
      setBatchProgramPickerOpen(true);
    setFormError("");
  };

  const handleUserSelect = (user) => {
    setForm((f) => ({
      ...f,
      target_user_id: user.id,
      target_user_name: user.full_name || "",
      target_user_email: user.email || "",
    }));
    setFormError("");
  };

  const handleBatchProgramSelect = (value) => {
    setForm((f) => ({ ...f, target_filter_value: value }));
    setFormError("");
  };

  const handleSubmit = async () => {
    if (form.audience === "Specific User" && !form.target_user_id) {
      setFormError("Please select a user to target this announcement to.");
      return;
    }
    if (
      (form.audience === "By Program" || form.audience === "By Batch") &&
      !form.target_filter_value
    ) {
      setFormError(
        `Please select a ${form.audience === "By Batch" ? "batch" : "program"} to target this announcement to.`,
      );
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      if (mode === "edit" && announcement) {
        await onUpdate(announcement.id, form);
      } else {
        await onCreate(form);
      }
    } catch (err) {
      console.error("[AnnouncementModal] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit Announcement" : "Create New Announcement"}
      subtitle={
        mode === "edit"
          ? "Update announcement details"
          : "Create a new announcement for alumni"
      }
    >
      <div className="cm-modal-fields">
        <Field label="Announcement Title" required>
          <input
            className="cm-input"
            placeholder="Enter announcement title"
            value={form.title}
            onChange={(e) => s("title", e.target.value)}
          />
        </Field>

        <Field label="Announcement Photos">
          <MultiImageUpload
            images={form.image_urls}
            onChange={(urls) => s("image_urls", urls)}
            bucketName="announcement-images"
            folder="announcements"
            label="Upload Photos"
            classPrefix="cm-"
          />
        </Field>

        <Field label="Content" required>
          <RichTextEditor
            value={form.content}
            onChange={(content) => s("content", content)}
            placeholder="Enter announcement content..."
          />
        </Field>

        <div className="cm-field-grid">
          <Field label="Priority" required>
            <div className="cm-select-wrap">
              <select
                className="cm-select"
                value={form.priority}
                onChange={(e) => s("priority", e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <FiChevronDown size={14} className="cm-select-arrow" />
            </div>
          </Field>
          <Field label="Target Audience" required>
            <div className="cm-select-wrap">
              <select
                className="cm-select"
                value={form.audience}
                onChange={(e) => handleAudienceChange(e.target.value)}
              >
                <option>All Alumni</option>
                <option>By Program</option>
                <option>By Batch</option>
                <option>Specific User</option>
              </select>
              <FiChevronDown size={14} className="cm-select-arrow" />
            </div>
          </Field>
        </div>

        {/* ── Specific User picker ────────────────────────────────────────────── */}
        {form.audience === "Specific User" && (
          <Field label="Targeted User" required>
            {form.target_user_id ? (
              <div className="cm-target-user-chip">
                <div className="cm-target-user-info">
                  <div className="cm-target-user-name">
                    {form.target_user_name || "Unnamed User"}
                  </div>
                  <div className="cm-target-user-email">
                    {form.target_user_email}
                  </div>
                </div>
                <button
                  type="button"
                  className="cm-target-user-change"
                  onClick={() => setUserPickerOpen(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="cm-target-user-select-btn"
                onClick={() => setUserPickerOpen(true)}
              >
                + Choose a user
              </button>
            )}
            {formError && (
              <p className="cm-field-hint cm-field-error">{formError}</p>
            )}
          </Field>
        )}

        {/* ── NEW: Batch / Program picker ─────────────────────────────────────── */}
        {(form.audience === "By Program" || form.audience === "By Batch") && (
          <Field
            label={
              form.audience === "By Batch"
                ? "Targeted Batch"
                : "Targeted Program"
            }
            required
          >
            {form.target_filter_value ? (
              <div className="cm-target-user-chip">
                <div className="cm-target-user-info">
                  <div className="cm-target-user-name">
                    {form.audience === "By Batch"
                      ? `Batch ${form.target_filter_value}`
                      : form.target_filter_value}
                  </div>
                </div>
                <button
                  type="button"
                  className="cm-target-user-change"
                  onClick={() => setBatchProgramPickerOpen(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="cm-target-user-select-btn"
                onClick={() => setBatchProgramPickerOpen(true)}
              >
                + Choose a {form.audience === "By Batch" ? "batch" : "program"}
              </button>
            )}
            {formError && (
              <p className="cm-field-hint cm-field-error">{formError}</p>
            )}
          </Field>
        )}

        <Field label="Expiry Date">
          <input
            className="cm-input"
            type="date"
            value={form.expiry}
            min={getTodayDateString()}
            onChange={handleDateFieldChange("expiry")}
          />
        </Field>

        <ModalFooter
          onCancel={onClose}
          createLabel={
            mode === "edit" ? "Update Announcement" : "Create Announcement"
          }
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>

      <SpecificUserModal
        open={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        onSelect={handleUserSelect}
        selectedUserId={form.target_user_id}
      />

      <BatchProgramModal
        open={batchProgramPickerOpen}
        onClose={() => setBatchProgramPickerOpen(false)}
        filterType={form.audience === "By Batch" ? "batch" : "program"}
        onSelect={handleBatchProgramSelect}
        selectedValue={form.target_filter_value}
        alumniType={alumniType}
      />
    </Modal>
  );
};

export default AnnouncementModal;
