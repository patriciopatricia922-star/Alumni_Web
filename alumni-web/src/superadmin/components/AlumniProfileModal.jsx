import React, { useEffect } from "react";
import { MdEmail, MdWork, MdAssignment, MdAccountCircle, MdBusinessCenter } from "react-icons/md";
import "./AlumniProfileModal.css";

const AlumniProfileModal = ({ alumni, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const getInitials = (name) =>
    (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const statusClass = (value) =>
    (value ?? "").toLowerCase().replace(/[\s-]+/g, "-");

  // Display-only helper: capitalizes the first letter for rendering.
  // Does NOT touch the underlying status value/data source.
  const capitalizeDisplay = (value) =>
    typeof value === "string" && value.length > 0
      ? value.charAt(0).toUpperCase() + value.slice(1)
      : value;

  const detailItems = [
    {
      icon: <MdEmail size={18} color="#155DFC" />,
      label: "Email Address",
      value: alumni.email || "—",
      isText: true,
    },
    {
      icon: <MdBusinessCenter size={18} color="#155DFC" />,
      label: "Job Position",
      value: alumni.job_position || "—",
      isText: true,
    },
    {
      icon: <MdAssignment size={18} color="#155DFC" />,
      label: "Survey Status",
      value: alumni.survey_status || "—",
      isBadge: true,
    },
    {
      icon: <MdAccountCircle size={18} color="#155DFC" />,
      label: "Account Status",
      value: alumni.account_status || "—",
      isBadge: true,
    },
  ];

  // Also include employment status if available (as additional info)
  const hasEmploymentStatus = alumni.employment_status && alumni.employment_status !== "—";
  const employmentStatusItem = hasEmploymentStatus ? {
    icon: <MdWork size={18} color="#155DFC" />,
    label: "Employment Status",
    value: alumni.employment_status,
    isText: true,
  } : null;

  // Combine items, adding employment status if available
  const allDetailItems = employmentStatusItem 
    ? [...detailItems.slice(0, 2), employmentStatusItem, ...detailItems.slice(2)]
    : detailItems;

  return (
    <div className="apm-overlay" onClick={onClose}>
      <div className="apm-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="apm-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="apm-hero">
          <div className="apm-hero-bg" aria-hidden="true" />
          <div className="apm-avatar-ring">
            <div className="apm-avatar">{getInitials(alumni.name)}</div>
          </div>
          <div className="apm-hero-info">
            <h2 className="apm-name">{alumni.name}</h2>
            <p className="apm-program">{alumni.program || "—"}</p>
            <span className="apm-batch">Batch {alumni.batch || "—"}</span>
          </div>
        </div>

        <div className="apm-body">
          <p className="apm-section-title">Profile Details</p>
          <ul className="apm-details-list">
            {allDetailItems.map((item, i) => (
              <li key={i} className="apm-detail-item">
                <div className="apm-detail-icon-wrap">
                  {item.icon}
                </div>
                <div className="apm-detail-content">
                  <span className="apm-detail-label">{item.label}</span>
                  {item.isBadge ? (
                    <span className={`apm-badge apm-badge--${statusClass(item.value)}`}>
                      {item.value === "completed" ? "Completed" : item.value === "pending" ? "Pending" : capitalizeDisplay(item.value)}
                    </span>
                  ) : (
                    <span className="apm-detail-value">{item.value}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlumniProfileModal;