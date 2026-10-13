// ============================================================================
// schoolNames.js
// Groups free-text school answers into one entry per school.
//
// groupSchools(rawNames) -> [{ name, value }] sorted by count (desc)
//
// How a school gets its group:
//   1. KEYWORD RULES (SCHOOL_RULES) go first. Use them for abbreviations or
//      names that share words with other schools. First matching rule wins.
//   2. Everything else is grouped AUTOMATICALLY, no rule needed:
//        - Filler words (university, college, campus, of, the...) are dropped.
//        - Answers with the same remaining words merge, in any order.
//        - If one answer contains ALL the words of another (min. 2 words),
//          they merge, e.g. "Perpetual Help System Dalta Molino" + "Perpetual Help".
//        - A school with different words becomes its own new group.
//   Spelling mistakes are NOT guessed: a misspelled name is treated as a new school.
// ============================================================================

export const normalizeSchoolText = (raw) =>
  String(raw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // ñ -> n, é -> e
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")    // dashes, commas, periods -> space
    .replace(/\s+/g, " ")
    .trim();

// ORDER MATTERS. PUP and TUP sit above UP because their names contain
// "university of the philippines" and would otherwise be merged into UP.
export const SCHOOL_RULES = [
  {
    name: "Polytechnic University of the Philippines",
    keywords: ["polytechnic university of the philippines", "pup"],
  },
  {
    name: "Technological University of the Philippines",
    keywords: ["technological university of the philippines", "tup"],
  },
  {
    name: "University of the Philippines",
    keywords: ["university of the philippines", "up diliman", "up manila", "up los banos"],
  },
  {
    name: "Cavite State University",
    keywords: ["cavite state university", "cavite state", "cvsu", "cavsu"],
  },
  {
    name: "Emilio Aguinaldo College",
    keywords: ["emilio aguinaldo", "eac"],
  },
  {
    name: "University of Perpetual Help System DALTA",
    keywords: ["perpetual", "uphsd"],
  },
  {
    name: "Lyceum of the Philippines University",
    keywords: ["lyceum"],
  },
  // ── optional: add abbreviations / special cases here ──
];

// Words that do NOT identify a school. Do not add distinctive words
// ("state", "technological", "polytechnic") here.
const FILLER_WORDS = new Set([
  "of", "the", "and", "at", "in", "for",
  "university", "univ", "college", "campus", "main", "branch", "system", "inc",
]);

const hasPhrase = (haystack, phrase) => ` ${haystack} `.includes(` ${phrase} `);

const matchRule = (normalized) =>
  SCHOOL_RULES.find((rule) => rule.keywords.some((kw) => hasPhrase(normalized, kw)));

const tokensOf = (normalized) => [
  ...new Set(normalized.split(" ").filter((t) => t && !FILLER_WORDS.has(t))),
];

// Most common spelling wins as the display name; ties go to the shortest.
const pickLabel = (rawCounts) =>
  [...rawCounts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].length - b[0].length,
  )[0][0];

export const groupSchools = (rawNames) => {
  const ruleGroups = new Map(); // rule name -> count
  const loose = [];             // answers no rule matched

  (rawNames || []).forEach((raw) => {
    const trimmed = String(raw || "").trim();
    const normalized = normalizeSchoolText(trimmed);
    if (!normalized) return;

    const rule = matchRule(normalized);
    if (rule) {
      ruleGroups.set(rule.name, (ruleGroups.get(rule.name) || 0) + 1);
    } else {
      loose.push({ raw: trimmed, normalized, tokens: tokensOf(normalized) });
    }
  });

  // Smallest word-sets first so they become the "anchor" others join.
  loose.sort((a, b) => a.tokens.length - b.tokens.length);

  const clusters = []; // { tokens:Set, key, rawCounts:Map, count }
  loose.forEach((item) => {
    const itemSet = new Set(item.tokens);

    const home = clusters.find((c) => {
      if (itemSet.size === 0 || c.tokens.size === 0) {
        return c.key === item.normalized;
      }
      const sameWords =
        c.tokens.size === itemSet.size && [...c.tokens].every((t) => itemSet.has(t));
      const containsAnchor =
        c.tokens.size >= 2 && [...c.tokens].every((t) => itemSet.has(t));
      return sameWords || containsAnchor;
    });

    if (home) {
      home.count += 1;
      home.rawCounts.set(item.raw, (home.rawCounts.get(item.raw) || 0) + 1);
    } else {
      clusters.push({
        tokens: itemSet,
        key: item.normalized,
        rawCounts: new Map([[item.raw, 1]]),
        count: 1,
      });
    }
  });

  return [
    ...[...ruleGroups.entries()].map(([name, value]) => ({ name, value })),
    ...clusters.map((c) => ({ name: pickLabel(c.rawCounts), value: c.count })),
  ].sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
};