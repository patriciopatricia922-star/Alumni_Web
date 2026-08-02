import React from 'react';
import Sidebar from '../../components/Sidebar';
import '../styles/EducationalBackgroundSHS.css';

/* ── Shared SVG atoms ────────────────────────────────────────────────────── */
const BackArrow = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M13 7.5H2M2 7.5L7 2.5M2 7.5L7 12.5"
      stroke="#002263" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BellIcon = () => (
  <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
    <path d="M10.8 22.75H15.2M20.8 9.75C20.8 6.215 17.206 3.25 13 3.25C8.794 3.25 5.2 6.215 5.2 9.75C5.2 14.625 3.25 16.9 3.25 16.9H22.75C22.75 16.9 20.8 14.625 20.8 9.75Z"
      stroke="#FFFFFF" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotifBellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
      stroke="#003EA6" strokeWidth="1.67" strokeLinecap="round"/>
  </svg>
);

/* ── Focus/blur handlers for inputs ──────────────────────────────────────── */
const onFocus = (e) => { if (!e.target.readOnly) e.target.style.borderColor = '#003EA6'; };
const onBlur  = (e) => { if (!e.target.readOnly) e.target.style.borderColor = '#D1D5DC'; };

/* ── Static option lists (fallback defaults only — overridden by
   questionOptions from survey_config when available) ────────────────────── */
const NU_BRANCHES = [
  'NU Manila', 'NU Nazareth', 'NU Laguna', 'NU MOA', 'NU Fairview',
  'NU Baliwag', 'NU Dasma', 'NU APC', 'NU Lipa', 'NU Clark',
  'NU Bacolod', 'NU East Ortigas', 'NU Cebu', 'NU Las Piñas',
];

const EDUCATION_LEVELS = [
  "Bachelor's Degree",
  'Associate Degree',
  'Diploma/Certificate Course',
  'Not Applicable',
  'Other',
];

const YEAR_LEVELS = [
  '1st Year College',
  '2nd Year College',
  '3rd Year College',
  '4th Year College',
  'Not Applicable',
];

const STOPPED_REASONS = [
  'Financial Constraints',
  'Employment Opportunity',
  'Family Responsibility',
  'Lack of Interest',
  'Not Applicable',
  'Others',
];

const STATUS_OPTIONS = ['Currently Studying', 'Graduated', 'Stopped', 'Working'];
const YES_NO_OPTIONS  = ['Yes', 'No'];

/* ── Notification dropdown (unchanged) ───────────────────────────────────── */
const NotificationDropdown = ({
  notifs, unreadCount, notifTab, setNotifTab,
  markAllRead, markOneRead, groupByDate, formatTime,
  navigate, setShowDropdown,
}) => {
  const list = notifTab === 'unread' ? notifs.filter((n) => !n.read) : notifs;

  return (
    <div className="shs-eb-notif-dropdown">
      <div className="shs-eb-notif-header">
        <span className="shs-eb-notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button className="shs-eb-notif-mark-all" onClick={markAllRead}>Mark all read</button>
        )}
      </div>

      <div className="shs-eb-notif-tabs">
        {['all', 'unread'].map((t) => (
          <button
            key={t}
            className={`shs-eb-notif-tab ${notifTab === t ? 'active' : 'inactive'}`}
            onClick={() => setNotifTab(t)}
          >
            {t === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      <div className="shs-eb-notif-list">
        {!list.length ? (
          <div className="shs-eb-notif-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M8.33 17.5H11.67M15 7.5C15 4.74 12.76 2.5 10 2.5C7.24 2.5 5 4.74 5 7.5C5 11.25 3.33 13.33 3.33 13.33H16.67C16.67 13.33 15 11.25 15 7.5Z"
                stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="shs-eb-notif-empty-text">
              {notifTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          Object.entries(groupByDate(list)).map(([label, items]) => {
            if (!items.length) return null;
            return (
              <div key={label}>
                <p className="shs-eb-notif-group-label">{label}</p>
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`shs-eb-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => markOneRead(n.id)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(0,62,166,0.05)')}
                  >
                    <div className="shs-eb-notif-icon"><NotifBellIcon /></div>
                    <div className="shs-eb-notif-body">
                      <p className={`shs-eb-notif-item-title ${n.read ? 'read' : 'unread'}`}>{n.title}</p>
                      <p className="shs-eb-notif-item-body">{n.body}</p>
                      <span className="shs-eb-notif-item-time">{formatTime(n.time)}</span>
                    </div>
                    {!n.read && <div className="shs-eb-notif-unread-dot" />}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      <div className="shs-eb-notif-footer">
        <button
          className="shs-eb-notif-see-all"
          onClick={() => { setShowDropdown(false); navigate('/notifications'); }}
        >
          See all notifications
        </button>
      </div>
    </div>
  );
};

/* ── Reusable radio group (unchanged) ────────────────────────────────────── */
const RadioGroup = ({ name, options, value, onChange }) => (
  <div className="shs-eb-radio-group">
    {options.map((opt) => (
      <label key={opt} className="shs-eb-radio-label">
        <input
          type="radio"
          name={name}
          value={opt}
          checked={value === opt}
          onChange={() => onChange(opt)}
        />
        {opt}
      </label>
    ))}
  </div>
);

/* ── Shared "further studies details" block ──────────────────────────────── */
/* ← CHANGED: accepts getLabel/getPlaceholder/questionOptions, falls back to
   the original hardcoded strings/arrays exactly as before when config is
   absent for a given field key. */
const FurtherStudiesDetails = ({
  form, set, errors,
  showNuBranch,
  showSchoolName,
  showReasonNu,
  showReasonNotNu,
  getLabel,
  getPlaceholder,
  questionOptions,
}) => (
  <>
    {/* ── NU Branch selector ──────────────────────────────────────────── */}
    {showNuBranch && (
      <div className="shs-eb-field">
        <label className="shs-eb-label-sub">
          {getLabel ? getLabel('nu_branch') : 'What Branch of NU?'} <span className="shs-eb-req">*</span>
          {errors.has('nu_branch') && <span className="shs-eb-field-error">Required</span>}
        </label>
        <RadioGroup
          name="shs_nu_branch"
          options={questionOptions?.['nu_branch'] || NU_BRANCHES}
          value={form.nu_branch}
          onChange={(v) => set('nu_branch', v)}
        />
      </div>
    )}

    {/* ── Reason why chose NU ─────────────────────────────────────────── */}
    {showReasonNu && (
      <div className="shs-eb-field">
        <label className="shs-eb-label-sub">
          {getLabel ? getLabel('reason_nu') : 'Reason(s) why did you choose NU.'} <span className="shs-eb-req">*</span>
          {errors.has('reason_nu') && <span className="shs-eb-field-error">Required</span>}
        </label>
        <textarea
          className="shs-eb-textarea"
          placeholder={getPlaceholder ? (getPlaceholder('reason_nu') || 'Enter your reason(s)…') : 'Enter your reason(s)…'}
          value={form.reason_nu}
          onChange={(e) => set('reason_nu', e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    )}

    {/* ── Reason why did NOT choose NU ────────────────────────────────── */}
    {showReasonNotNu && (
      <div className="shs-eb-field">
        <label className="shs-eb-label-sub">
          {getLabel ? getLabel('reason_not_nu') : 'Reason(s) why did you not choose NU.'} <span className="shs-eb-req">*</span>
          {errors.has('reason_not_nu') && <span className="shs-eb-field-error">Required</span>}
        </label>
        <textarea
          className="shs-eb-textarea"
          placeholder={getPlaceholder ? (getPlaceholder('reason_not_nu') || 'Enter your reason(s)…') : 'Enter your reason(s)…'}
          value={form.reason_not_nu}
          onChange={(e) => set('reason_not_nu', e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    )}

    {/* ── School / University name ─────────────────────────────────────── */}
    {showSchoolName && (
      <div className="shs-eb-field">
        <label className="shs-eb-label-sub">
          {getLabel ? getLabel('school_name') : 'Name of School/University'} <span className="shs-eb-req">*</span>
          {errors.has('school_name') && <span className="shs-eb-field-error">Required</span>}
        </label>
        <input
          className="shs-eb-input"
          placeholder={getPlaceholder ? (getPlaceholder('school_name') || 'e.g. University of the Philippines') : 'e.g. University of the Philippines'}
          value={form.school_name}
          onChange={(e) => set('school_name', e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    )}

    {/* ── Education level ─────────────────────────────────────────────── */}
    <div className="shs-eb-field">
      <label className="shs-eb-label-sub">
        {getLabel ? getLabel('education_level') : 'What level of education are you currently in or have completed?'}{' '}
        <span className="shs-eb-req">*</span>
        {errors.has('education_level') && <span className="shs-eb-field-error">Required</span>}
      </label>
      <RadioGroup
        name="shs_education_level"
        options={questionOptions?.['education_level'] || EDUCATION_LEVELS}
        value={form.education_level}
        onChange={(v) => set('education_level', v)}
      />
      {form.education_level === 'Other' && (
        <input
          className="shs-eb-input"
          style={{ marginTop: '8px' }}
          placeholder={getPlaceholder ? (getPlaceholder('education_level_other') || 'Please specify…') : 'Please specify…'}
          value={form.education_level_other}
          onChange={(e) => set('education_level_other', e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {form.education_level === 'Other' && errors.has('education_level_other') && (
        <span className="shs-eb-field-error" style={{ marginLeft: 0 }}>Required</span>
      )}
    </div>

    {/* ── Course / Program ────────────────────────────────────────────── */}
    <div className="shs-eb-field">
      <label className="shs-eb-label-sub">
        {getLabel ? getLabel('course_program') : 'Course/Program'} <span className="shs-eb-req">*</span>
        {errors.has('course_program') && <span className="shs-eb-field-error">Required</span>}
      </label>
      <textarea
        className="shs-eb-textarea"
        placeholder={getPlaceholder ? (getPlaceholder('course_program') || 'e.g. BS Computer Science') : 'e.g. BS Computer Science'}
        value={form.course_program}
        onChange={(e) => set('course_program', e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>

    {/* ── Year Level ──────────────────────────────────────────────────── */}
    <div className="shs-eb-field">
      <label className="shs-eb-label-sub">
        {getLabel ? getLabel('year_level') : 'Year Level'} <span className="shs-eb-req">*</span>
        {errors.has('year_level') && <span className="shs-eb-field-error">Required</span>}
      </label>
      <RadioGroup
        name="shs_year_level"
        options={questionOptions?.['year_level'] || YEAR_LEVELS}
        value={form.year_level}
        onChange={(v) => set('year_level', v)}
      />
    </div>
  </>
);

/* ══════════════════════════════════════════════════════════════════════════
   MAIN VIEW
═══════════════════════════════════════════════════════════════════════════ */
const EducationalBackgroundViewSHS = ({
  /* form */
  form,
  set,
  setStatus,
  setPursuedNuBranch,
  setPursuedOtherSchool,
  errors,
  saveToast,
  cardRef,
  /* progress */
  formPct,
  currentSection,
  totalSections,
  /* actions */
  handleSave,
  handleNext,
  /* ← ADDED: dynamic config */
  getLabel,
  getPlaceholder,
  questionOptions,
  /* notifications */
  bellRef,
  notifs,
  unreadCount,
  showDropdown,
  setShowDropdown,
  notifTab,
  setNotifTab,
  markAllRead,
  markOneRead,
  groupByDate,
  formatTime,
  /* routing */
  navigate,
}) => {

  /* ── Branch visibility flags (unchanged) ─────────────────────────────── */
  const isStudyingOrGraduated = form.status === 'Currently Studying' || form.status === 'Graduated';
  const isStopped             = form.status === 'Stopped';

  const pursuedNU          = form.pursued_nu_branch === 'Yes';
  const didNotPursueNU     = form.pursued_nu_branch === 'No';
  const pursuedOtherSchool = form.pursued_other_school === 'Yes';

  return (
    <div className="shs-eb-root">
      <Sidebar />
      <div className="shs-eb-content">

        {/* ── Sticky header (unchanged) ────────────────────────────────── */}
        <div className="shs-eb-header">
          <div className="shs-eb-topbar">

            <button
              className="shs-eb-back-btn"
              onClick={() => navigate('/surveyshs/shs-personal-background')}
            >
              <BackArrow /> Back
            </button>

            <div className="shs-eb-badge">SHS ALUMNI STATUS</div>

            <div ref={bellRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className={`shs-eb-bell${showDropdown ? ' active' : ''}`}
                onClick={() => setShowDropdown((v) => !v)}
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadCount > 0 && (
                  <>
                    <div className="shs-eb-bell-dot" />
                    <div className="shs-eb-bell-count">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  </>
                )}
              </button>

              {showDropdown && (
                <NotificationDropdown
                  notifs={notifs}
                  unreadCount={unreadCount}
                  notifTab={notifTab}
                  setNotifTab={setNotifTab}
                  markAllRead={markAllRead}
                  markOneRead={markOneRead}
                  groupByDate={groupByDate}
                  formatTime={formatTime}
                  navigate={navigate}
                  setShowDropdown={setShowDropdown}
                />
              )}
            </div>
          </div>

          <h1 className="shs-eb-title">SHS Tracer Survey</h1>
          <p className="shs-eb-subtitle">
            Please complete all sections to update your alumni status.
          </p>

          <div className="shs-eb-progress">
            <div className="shs-eb-progress-row">
              <span>Section {currentSection} of {totalSections}</span>
              <span style={{ color: '#003EA6', fontWeight: 700 }}>{formPct}% Complete</span>
            </div>
            <div className="shs-eb-progress-track">
              <div className="shs-eb-progress-fill" style={{ width: `${formPct}%` }} />
            </div>
            <span className="shs-eb-progress-label">Educational Background</span>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────────────── */}
        <div className="shs-eb-body">
          <div className="shs-eb-card" ref={cardRef}>

            <div>
              <h2 className="shs-eb-section-title">Educational Background</h2>
              <p className="shs-eb-section-sub">Your academic background after SHS</p>
            </div>

            <div className="shs-eb-fields">

              {/* ── Q: Status ───────────────────────────────────────────── */}
              <div className="shs-eb-field">
                <label className="shs-eb-label">
                  {getLabel ? getLabel('status') : 'Status'} <span className="shs-eb-req">*</span>
                  {errors.has('status') && (
                    <span className="shs-eb-field-error">Required</span>
                  )}
                </label>
                <RadioGroup
                  name="shs_status"
                  options={questionOptions?.['status'] || STATUS_OPTIONS}
                  value={form.status}
                  onChange={setStatus}
                />
              </div>

              {/* ══ BRANCH: Currently Studying / Graduated ════════════════ */}
              {isStudyingOrGraduated && (
                <div className="shs-eb-branch">

                  {/* ── Did you pursue further studies at any NU branch? ─── */}
                  <div className="shs-eb-field">
                    <label className="shs-eb-label-sub">
                      {getLabel ? getLabel('pursued_nu_branch') : 'Did you pursue further studies to any NU branch after SHS?'}{' '}
                      <span className="shs-eb-req">*</span>
                      {errors.has('pursued_nu_branch') && (
                        <span className="shs-eb-field-error">Required</span>
                      )}
                    </label>
                    <RadioGroup
                      name="shs_pursued_nu_branch"
                      options={questionOptions?.['pursued_nu_branch'] || YES_NO_OPTIONS}
                      value={form.pursued_nu_branch}
                      onChange={setPursuedNuBranch}
                    />
                  </div>

                  {/* ── YES → NU branch details ──────────────────────────── */}
                  {pursuedNU && (
                    <div className="shs-eb-branch">
                      <FurtherStudiesDetails
                        form={form}
                        set={set}
                        errors={errors}
                        showNuBranch={true}
                        showSchoolName={false}
                        showReasonNu={true}
                        showReasonNotNu={false}
                        getLabel={getLabel}
                        getPlaceholder={getPlaceholder}
                        questionOptions={questionOptions}
                      />
                    </div>
                  )}

                  {/* ── NO → Did you pursue further studies at any other school? */}
                  {didNotPursueNU && (
                    <>
                      <div className="shs-eb-field">
                        <label className="shs-eb-label-sub">
                          {getLabel ? getLabel('pursued_other_school') : 'Did you pursue further studies to any school after SHS?'}{' '}
                          <span className="shs-eb-req">*</span>
                          {errors.has('pursued_other_school') && (
                            <span className="shs-eb-field-error">Required</span>
                          )}
                        </label>
                        <RadioGroup
                          name="shs_pursued_other_school"
                          options={questionOptions?.['pursued_other_school'] || YES_NO_OPTIONS}
                          value={form.pursued_other_school}
                          onChange={setPursuedOtherSchool}
                        />
                      </div>

                      {/* ── Other school YES → school details ─────────────── */}
                      {pursuedOtherSchool && (
                        <div className="shs-eb-branch">
                          <FurtherStudiesDetails
                            form={form}
                            set={set}
                            errors={errors}
                            showNuBranch={false}
                            showSchoolName={true}
                            showReasonNu={false}
                            showReasonNotNu={true}
                            getLabel={getLabel}
                            getPlaceholder={getPlaceholder}
                            questionOptions={questionOptions}
                          />
                        </div>
                      )}

                      {/* Both NO → no further questions (valid dead end) */}
                    </>
                  )}

                </div>
              )}

              {/* ══ BRANCH: Stopped ══════════════════════════════════════ */}
              {isStopped && (
                <div className="shs-eb-branch">
                  <div className="shs-eb-field">
                    <label className="shs-eb-label-sub">
                      {getLabel ? getLabel('stopped_reason') : 'What is the main reason you did not pursue further studies?'}{' '}
                      <span className="shs-eb-req">*</span>
                      {errors.has('stopped_reason') && (
                        <span className="shs-eb-field-error">Required</span>
                      )}
                    </label>
                    <RadioGroup
                      name="shs_stopped_reason"
                      options={questionOptions?.['stopped_reason'] || STOPPED_REASONS}
                      value={form.stopped_reason}
                      onChange={(v) => set('stopped_reason', v)}
                    />

                    {/* "Others" free-text expands inline */}
                    {form.stopped_reason === 'Others' && (
                      <>
                        <input
                          className="shs-eb-input"
                          style={{ marginTop: '8px' }}
                          placeholder={getPlaceholder ? (getPlaceholder('stopped_reason_other') || 'Please specify…') : 'Please specify…'}
                          value={form.stopped_reason_other}
                          onChange={(e) => set('stopped_reason_other', e.target.value)}
                          onFocus={onFocus}
                          onBlur={onBlur}
                        />
                        {errors.has('stopped_reason_other') && (
                          <span className="shs-eb-field-error" style={{ marginLeft: 0 }}>
                            Required
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ══ BRANCH: Working ══════════════════════════════════════ */}
              {/* No sub-questions for Working — Next navigates to EmploymentInformationSHS */}

            </div>{/* end .shs-eb-fields */}

            {/* ── Footer (unchanged) ─────────────────────────────────────── */}
            <div className="shs-eb-footer">
              <button
                className="shs-eb-btn-prev"
                onClick={() => navigate('/surveyshs/shs-personal-background')}
              >
                Previous
              </button>

              <div className="shs-eb-footer-right">
                {saveToast && (
                  <span className="shs-eb-save-toast">Progress saved</span>
                )}
                <button className="shs-eb-btn-save" onClick={handleSave}>Save</button>
                <button className="shs-eb-btn-next" onClick={handleNext}>Next</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default EducationalBackgroundViewSHS;