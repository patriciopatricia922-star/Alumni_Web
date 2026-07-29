// ============================================================================
// SurveySkeletonView.jsx — Loading skeleton for SurveyManagement
// ============================================================================
// Mirrors the pixel geometry of SurveyMgmtView exactly:
//   • Same outer .survey-page grid
//   • Same .survey-header proportions (title block + publish button stub)
//   • Same .survey-sections sidebar width + section item heights
//   • Same .survey-builder card structure + question card heights
//
// Uses .sm-skel-* classes (defined in Surveymgmt.css) with a shimmer
// animation. No logic, no state, no props — drop-in replacement for the
// <LoadingScreen> in SurveyManagement while survey === null.
//
// Architecture contract:
//   - Rendered by SurveyManagement (logic controller) when survey === null
//   - AdminSidebar is included here so the sidebar appears immediately,
//     not after the Supabase fetch resolves
//   - SurveyMgmtView is NOT modified — it retains its own inline guard
//     as a safety net, but it is never reached while this skeleton is shown
// ============================================================================

import SuperAdSidebar from "../SuperAdSidebar";
import "../styles/Surveymgmt.css";

// ---------------------------------------------------------------------------
// Primitive skeleton atoms
// ---------------------------------------------------------------------------

/** A single shimmer block. width/height/borderRadius are inline for precision. */
const Bone = ({ width = "100%", height = 14, radius = 6, style = {} }) => (
  <div
    className="sm-skel-bone"
    style={{ width, height, borderRadius: radius, ...style }}
  />
);

// ---------------------------------------------------------------------------
// Section sidebar skeleton — 4 section items, widths staggered naturally
// ---------------------------------------------------------------------------
const SECTION_WIDTHS = ["68%", "82%", "55%", "74%"];

const SectionSidebarSkeleton = () => (
  <div className="survey-sections">
    {/* "+ Add Section" button placeholder */}
    <div className="sm-skel-add-section-btn" />

    <div className="sections-list">
      {SECTION_WIDTHS.map((w, i) => (
        <div
          key={i}
          // mirror .section-item geometry exactly; first item acts as "active"
          className={`section-item${i === 0 ? " active" : ""}`}
          style={{ pointerEvents: "none", cursor: "default" }}
        >
          {/* Number badge */}
          <div className="sm-skel-section-number" />
          {/* Label bar */}
          <Bone width={w} height={12} radius={5} />
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Question card skeleton — mimics a real .question-card
// The labelWidth and inputType let us vary the cards so they look organic.
// ---------------------------------------------------------------------------
const QuestionCardSkeleton = ({ labelWidth = "55%", inputRows = 1 }) => (
  <div className="question-card sm-skel-question-card">
    {/* Header row: label bone + type badge bone + action icons */}
    <div className="question-header" style={{ pointerEvents: "none" }}>
      <Bone width={labelWidth} height={13} radius={5} />
      <div className="sm-skel-qcard-actions">
        <Bone width={72} height={22} radius={8} />
        <Bone width={18} height={18} radius={5} />
        <Bone width={18} height={18} radius={5} />
        <Bone width={18} height={18} radius={5} />
      </div>
    </div>

    {/* Input area */}
    {inputRows === 1 ? (
      <Bone width="70%" height={32} radius={6} style={{ marginTop: 10 }} />
    ) : (
      <div className="sm-skel-textarea-rows">
        <Bone width="88%" height={13} radius={5} />
        <Bone width="74%" height={13} radius={5} />
      </div>
    )}

    {/* Branch button stub */}
    <div className="branch-container" style={{ pointerEvents: "none" }}>
      <Bone width={62} height={26} radius={6} />
    </div>
  </div>
);

// Three cards with varied widths/types to look like real content
const QUESTION_CARDS = [
  { labelWidth: "48%", inputRows: 1 },
  { labelWidth: "62%", inputRows: 2 },
  { labelWidth: "38%", inputRows: 1 },
];

// ---------------------------------------------------------------------------
// Builder area skeleton — section header card + question cards
// ---------------------------------------------------------------------------
const BuilderSkeleton = () => (
  <div className="survey-builder">
    {/* Section header card */}
    <div className="section-card">
      <div className="section-top">
        <Bone width={100} height={11} radius={5} />
      </div>
      {/* Section title */}
      <Bone width="42%" height={20} radius={6} style={{ marginTop: 10 }} />
      {/* Section description */}
      <Bone width="58%" height={12} radius={5} style={{ marginTop: 8 }} />
    </div>

    {/* Question cards */}
    {QUESTION_CARDS.map((props, i) => (
      <QuestionCardSkeleton key={i} {...props} />
    ))}

    {/* "+ Add Question" button stub */}
    <div className="sm-skel-add-question-btn" />
  </div>
);

// ---------------------------------------------------------------------------
// Header skeleton
// ---------------------------------------------------------------------------
const HeaderSkeleton = () => (
  <div className="survey-header">
    <div className="survey-header-left">
      {/* "Survey Management" title */}
      <Bone width={220} height={27} radius={7} />
      {/* Description line */}
      <Bone width={300} height={13} radius={5} style={{ marginTop: 8 }} />
    </div>
    <div className="survey-header-actions" style={{ gap: 12 }}>
      {/* Publish button */}
      <Bone width={90} height={34} radius={8} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Composed full-page skeleton
// ---------------------------------------------------------------------------
const SurveySkeletonView = () => (
  <>
    <SuperAdSidebar />

    <div className="survey-page sm-skel-page">
      <HeaderSkeleton />

      <div className="survey-main">
        <SectionSidebarSkeleton />
        <BuilderSkeleton />
      </div>
    </div>
  </>
);

export default SurveySkeletonView;