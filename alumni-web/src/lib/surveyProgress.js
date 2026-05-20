import { supabase } from './supabase';
import { classifyDepartment } from './departmentClassifier';
import { resolveRegistry }    from './surveyRegistry';

// ─── Section Cache ────────────────────────────────────────────────────────────
let _cachedSections = [];
let _loadPromise    = null;

// ─── Invalidate section cache on user change ──────────────────────────────────
// The cache is department-aware, so it must be cleared whenever the active
// user changes. Without this, switching accounts reuses the previous user's
// section/route set.
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
    _cachedSections = [];
    _loadPromise    = null;
  }
});

// SECTION_SLUG_MAP: index → slug used in App.jsx routes.
// Must match App.jsx exactly. Slugs → keys via replacing - with _.
const SECTION_SLUG_MAP = [
  'personal-background',        // key: personal_background       → DB col: personal_background ✓
  'educational-background',     // key: educational_background    → DB col: educational_background ✓
  'certification-achievement',  // key: certification_achievement → DB col: certification_achievement ✓
  'employment-information',     // key: employment_information    → DB col: employment_information ✓
  'job-experience',             // key: job_experience            → DB col: job_experience ✓
  'skills-and-competencies',    // key: skills_and_competencies   → DB col: skills_competencies (remapped below)
  'feedback-and-engagement',    // key: feedback_and_engagement   → DB cols: feedback_university + alumni_engagement (remapped below)
];

// ─── DB Column Remapping ──────────────────────────────────────────────────────
// Maps frontend section keys → actual DB column names.
// Required because the schema predates the slug system.
const DB_BOOLEAN_COL = {
  personal_background:        'personal_background',
  educational_background:     'educational_background',
  certification_achievement:  'certification_achievement',
  employment_information:     'employment_information',
  job_experience:             'job_experience',
  skills_and_competencies:    'skills_competencies',      // DB uses short name
  feedback_and_engagement:    'feedback_university',      // DB splits this into two cols
};

const DB_DATA_COL = {
  personal_background:        'personal_background_data',
  educational_background:     'educational_background_data',
  certification_achievement:  'certification_achievement_data',
  employment_information:     'employment_information_data',
  job_experience:             'job_experience_data',
  skills_and_competencies:    'skills_competencies_data', // DB uses short name
  // feedback_and_engagement is handled specially — split across two DB data cols
};

// ─── Load Sections ────────────────────────────────────────────────────────────
export const loadSurveySections = async () => {
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    try {
      // ── 1. Identify the authenticated user's program ──────────────────────
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let departmentType = 'college'; // safe default

      if (authUser?.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('program')
          .eq('id', authUser.id)
          .maybeSingle();

        departmentType = classifyDepartment(profile?.program) ?? 'college';
      }

      // ── 2. Resolve registry entry for this department type ────────────────
      const registry = resolveRegistry(departmentType);

      // ── 3. Fetch survey config — try matched type, fall back if needed ─────
      const { data: allConfigs } = await supabase
        .from('survey_config')
        .select('config')
        .order('updated_at', { ascending: false });

      const configs = allConfigs ?? [];

      // Find a config row that matches this department type
      let matchedConfig = configs.find(
        (row) => registry.configMatcher(row.config)
      );

      // If no match and a fallback type is defined, try the fallback registry
      if (!matchedConfig && registry.fallbackType) {
        const fallbackRegistry = resolveRegistry(registry.fallbackType);
        matchedConfig = configs.find(
          (row) => fallbackRegistry.configMatcher(row.config)
        );
      }

      // Last resort: use the most recent config row regardless of type
      if (!matchedConfig) {
        matchedConfig = configs[0] ?? null;
      }

      if (!matchedConfig?.config?.sections?.length) {
        console.warn('No survey config found — sections unavailable');
        _loadPromise = null;
        return [];
      }

      // ── 4. Build sections using the resolved slug map ─────────────────────
      const slugMap = registry.slugMap;

      _cachedSections = matchedConfig.config.sections.map((section, index) => {
        const slug = slugMap[index]
          ?? section.title.toLowerCase().trim()
               .replace(/\s+/g, '-')
               .replace(/[^a-z0-9-]/g, '');
        const key        = slug.replace(/-/g, '_');
        const percentage = Math.round(
          ((index + 1) / matchedConfig.config.sections.length) * 100
        );
        return {
          key,
          slug,
          title:        section.title,
          web_route:    `${registry.routePrefix}/${slug}`,
          mobile_route: `${registry.routePrefix}/${slug}`,
          percentage,
          index:        index + 1,
          departmentType,
        };
      });

      _loadPromise = null;
      return _cachedSections;
    } catch (err) {
      console.error('Error loading survey sections:', err);
      _loadPromise = null;
      return [];
    }
  })();

  return _loadPromise;
};

export const getSurveySections = async () => {
  if (_cachedSections.length > 0) return _cachedSections;
  return loadSurveySections();
};

export const invalidateSectionsCache = () => {
  _cachedSections = [];
  _loadPromise    = null;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPLETE_SENTINEL = '__complete__';

// ─── Legacy Route Normalisation ───────────────────────────────────────────────
const LEGACY_ROUTE_MAP = {
  '/survey/1': null,  // → first section
  '/survey/2': '/survey/educational-background',
  '/survey/3': '/survey/certification-achievement',
  '/survey/4': '/survey/employment-information',
  '/survey/5': '/survey/job-experience',
  '/survey/6': '/survey/skills-and-competencies',
  '/survey/7': '/survey/feedback-and-engagement',
  '/survey/feedback':                       '/survey/feedback-and-engagement',
  '/survey/alumni-engagement':              '/survey/feedback-and-engagement',
  '/survey/feedback-and-alumni-engagement': '/survey/feedback-and-engagement',
  '/feedback':                              '/survey/feedback-and-engagement',
  '/engage':                                '/survey/feedback-and-engagement',
};

const normalizeLegacyRoute = async (route) => {
  if (!route) return null;
  if (LEGACY_ROUTE_MAP[route] !== undefined) {
    const mapped = LEGACY_ROUTE_MAP[route];
    if (mapped) return mapped;
    const sections = await getSurveySections();
    return sections[0]?.web_route ?? null;
  }
  const numericMatch = route.match(/^\/survey\/(\d+)$/);
  if (numericMatch) {
    const idx      = parseInt(numericMatch[1], 10) - 1;
    const sections = await getSurveySections();
    return sections[idx]?.web_route ?? sections[0]?.web_route ?? null;
  }
  return route;
};

// ─── Save Progress ────────────────────────────────────────────────────────────
export const saveSectionProgress = async (sectionKey, formData = null) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const sections     = await getSurveySections();
  const sectionIndex = sections.findIndex(s => s.key === sectionKey);

  if (sectionIndex === -1) {
    console.warn(`saveSectionProgress: unknown sectionKey "${sectionKey}". Valid keys:`, sections.map(s => s.key));
    return;
  }

  const isLast      = sectionIndex === sections.length - 1;
  const nextSection = sections[sectionIndex + 1];

  // ── Map frontend key → actual DB boolean column ──
  const boolCol = DB_BOOLEAN_COL[sectionKey] ?? sectionKey;

  const updates = {
    user_id:              user.id,
    current_section:      sectionIndex + 1,
    web_current_route:    isLast ? COMPLETE_SENTINEL : nextSection.web_route,
    mobile_current_route: isLast ? COMPLETE_SENTINEL : nextSection.mobile_route,
    percentage:           sections[sectionIndex].percentage,
    completed:            isLast,
    last_updated:         new Date().toISOString(),
    [boolCol]:            true,
  };

  // ── Map frontend key → actual DB data column(s) ──
  if (formData) {
    if (sectionKey === 'feedback_and_engagement') {
      updates.feedback_university_data = {
        satisfaction: formData.satisfaction ?? '',
        recommend:    formData.recommend    ?? '',
        suggestions:  formData.suggestions  ?? '',
      };
      updates.alumni_engagement_data = {
        informed_about_events: formData.informed_about_events ?? '',
        participate_in:        formData.participate_in        ?? [],
        other_participate:     formData.other_participate     ?? '',
      };
      updates.feedback_university = true;
      updates.alumni_engagement   = true;
    } else {
      const dataCol    = DB_DATA_COL[sectionKey] ?? `${sectionKey}_data`;
      updates[dataCol] = formData;
    }
  }

  const { error } = await supabase
    .from('survey_progress')
    .upsert(updates, { onConflict: 'user_id' });

  if (error) console.error('Error saving progress:', error.message);
};

// ─── Load Section Data ────────────────────────────────────────────────────────
export const loadSectionData = async (sectionKey) => {
  const progress = await loadSurveyProgress();
  if (!progress) return null;

  if (sectionKey === 'feedback_and_engagement') {
    return {
      ...(progress.feedback_university_data ?? {}),
      ...(progress.alumni_engagement_data   ?? {}),
    };
  }

  const dataCol = DB_DATA_COL[sectionKey] ?? `${sectionKey}_data`;
  return progress[dataCol] ?? null;
};

// ─── Load Full Progress Row ───────────────────────────────────────────────────
export const loadSurveyProgress = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('survey_progress')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error loading survey progress:', error.message);
    return null;
  }
  return data;
};

// ─── Resume Routes ────────────────────────────────────────────────────────────
export const getResumeRoute = async () => {
  const sections = await getSurveySections();
  const fallback  = sections[0]?.web_route ?? '/survey/personal-background';

  const progress = await loadSurveyProgress();
  if (!progress) return fallback;

  if (progress.completed || progress.web_current_route === COMPLETE_SENTINEL) {
    return '/update-tracer';
  }

  if (progress.web_current_route) {
    return (await normalizeLegacyRoute(progress.web_current_route)) ?? fallback;
  }

  if (progress.current_route) {
    const normalized = await normalizeLegacyRoute(progress.current_route);
    if (normalized) return normalized;
  }

  return fallback;
};

export const getMobileResumeRoute = async () => {
  const sections = await getSurveySections();
  const fallback  = sections[0]?.mobile_route ?? '/survey/personal-background';

  const progress = await loadSurveyProgress();
  if (!progress) return fallback;

  if (progress.completed || progress.mobile_current_route === COMPLETE_SENTINEL) {
    return '/survey-complete';
  }

  if (progress.mobile_current_route) {
    return (await normalizeLegacyRoute(progress.mobile_current_route)) ?? fallback;
  }

  if (progress.current_route) {
    const normalized = await normalizeLegacyRoute(progress.current_route);
    if (normalized) return normalized;
  }

  return fallback;
};

// ─── Misc Exports ─────────────────────────────────────────────────────────────
export const isSurveyComplete = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return false;
  return progress.completed === true || progress.percentage >= 100;
};

export const getCurrentSectionIndex = async () => {
  const progress = await loadSurveyProgress();
  if (!progress) return 0;
  return progress.current_section ? progress.current_section - 1 : 0;
};

export const markSectionComplete = async (sectionKey) => {
  return saveSectionProgress(sectionKey, null);
};