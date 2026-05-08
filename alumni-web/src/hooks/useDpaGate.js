/**
 * useDpaGate.js
 *
 * Centralised hook that manages the Data Privacy Act acceptance gate.
 *
 * FIX (root cause of bypass):
 * ───────────────────────────
 * The original implementation stored acceptance under a single shared key
 * ('dpa_accepted') in localStorage. Because localStorage is scoped to the
 * browser origin — not to the logged-in user — a key written by one user
 * remained present for every subsequent user on the same browser.
 *
 * This meant that:
 *  • A developer/tester who accepted the DPA once left 'dpa_accepted'='1'
 *    in the browser.
 *  • Every new user who opened the app on that browser already had the key
 *    set, so isDpaAccepted() returned true immediately and the modal was
 *    never shown.
 *  • The UpdateTracer path appeared to work only because it wired up the
 *    modal correctly *and* accepted the DPA, but it too would skip the modal
 *    on second visit.
 *
 * Fix: key the acceptance flag to the Supabase auth user's ID so each user
 * gets their own independent flag: 'dpa_accepted:<uid>'.
 * We read the uid from supabase.auth.getUser() once on mount. While the uid
 * is still being resolved the hook stays in a "pending" state and blocks all
 * navigation to prevent any race-condition bypass.
 *
 * ADDITIONAL FIX (UpdateTracer re-consent bypass):
 * ─────────────────────────────────────────────────
 * Even with per-user keying, a returning user who had previously accepted the
 * DPA would have '1' persisted in localStorage. On every subsequent visit to
 * the UpdateTracer flow, requestNavigation() would read that stored flag,
 * conclude the DPA had already been accepted, and navigate directly to
 * Personal Background — silently skipping the modal.
 *
 * The UpdateTracer flow is a re-submission path and must always re-present
 * the DPA consent modal, regardless of prior acceptance. This is because the
 * user is explicitly choosing to submit new personal data.
 *
 * Fix: requestNavigation() now accepts an optional `forceShow` boolean flag
 * (defaults to false). When true, the DPA modal is always shown and the
 * stored acceptance flag is cleared for the current user so that the modal
 * cannot be bypassed by a stale localStorage value. After the user accepts
 * inside the forced flow, the flag is re-persisted as normal.
 *
 * Callers in the first-time survey entry path continue to call
 * requestNavigation(route) with no change — their behaviour is unaffected.
 * Only UpdateTracerPage passes forceShow: true.
 *
 * Usage (unchanged from caller's perspective for first-time flow)
 * ───────────────────────────────────────────────────────────────
 *   const { showModal, requestNavigation, handleAccept, handleDecline } =
 *     useDpaGate(navigate);
 *
 *   // First-time survey entry (unchanged):
 *   requestNavigation('/survey/personal-background');
 *
 *   // UpdateTracer re-submission (always re-shows DPA):
 *   requestNavigation('/survey/personal-background', { forceShow: true });
 *
 *   // In JSX:
 *   {showModal && (
 *     <DataPrivacyModal onAccept={handleAccept} onDecline={handleDecline} />
 *   )}
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const DPA_KEY_PREFIX = 'dpa_accepted';

/** Returns the per-user localStorage key for the given uid. */
const dpaKey = (uid) => `${DPA_KEY_PREFIX}:${uid}`;

/**
 * Synchronously checks whether the given user has already accepted the DPA.
 * Returns false if uid is null/undefined (safe default while resolving).
 */
const isDpaAccepted = (uid) => {
  if (!uid) return false;
  return localStorage.getItem(dpaKey(uid)) === '1';
};

/**
 * Persists acceptance for the given user.
 * No-ops if uid is falsy (shouldn't happen in normal flow).
 */
const persistDpaAccepted = (uid) => {
  if (!uid) return;
  localStorage.setItem(dpaKey(uid), '1');
};

/**
 * Clears the stored DPA acceptance flag for the given user.
 * Used by the UpdateTracer forceShow path to prevent stale flag bypass.
 * No-ops if uid is falsy.
 */
const clearDpaAccepted = (uid) => {
  if (!uid) return;
  localStorage.removeItem(dpaKey(uid));
};

export { isDpaAccepted };

export const useDpaGate = (navigate) => {
  const [showModal,    setShowModal]    = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  // uid is null while resolving, a string once known.
  // We use a ref as well so callbacks always see the latest value without
  // needing to be recreated every time uid changes.
  const [uid, setUid] = useState(null);
  const uidRef        = useRef(null);

  // Resolve the authenticated user's ID once on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user?.id) {
          uidRef.current = user.id;
          setUid(user.id);
        }
      } catch (err) {
        console.error('useDpaGate: failed to resolve user id', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * Call this instead of navigate() for any survey entry point.
   *
   * @param {string}  route              The route to navigate to after DPA acceptance.
   * @param {object}  [options]          Optional configuration.
   * @param {boolean} [options.forceShow=false]
   *   When true, the DPA modal is always shown regardless of any stored
   *   acceptance flag. The stored flag is also cleared so that it cannot
   *   cause a bypass race. Use this for re-submission flows (UpdateTracer)
   *   where fresh consent is required for every new data submission.
   *
   * Behaviour:
   *  • If the uid is not yet resolved   → no-op (navigation is blocked; the
   *    UI should disable the button via `item.loading` / `!surveyRoute` which
   *    are already in place).
   *  • If forceShow is true             → clears stored flag, stores the
   *    intended route, and always shows the modal.
   *  • If the user has already accepted → navigates immediately.
   *  • Otherwise                        → stores the intended route and shows
   *    the modal.
   */
  const requestNavigation = useCallback((route, options = {}) => {
    if (!route) return;

    const { forceShow = false } = options;
    const currentUid = uidRef.current;

    // Block navigation entirely until we know who the user is.
    // (Prevents a race where the modal is skipped before the uid is fetched.)
    if (!currentUid) {
      console.warn('useDpaGate: uid not yet resolved, navigation deferred.');
      return;
    }

    if (forceShow) {
      // Clear the stored flag so a stale acceptance cannot bypass this check
      // even if something calls isDpaAccepted() directly before handleAccept
      // has a chance to re-persist it.
      clearDpaAccepted(currentUid);
      setPendingRoute(route);
      setShowModal(true);
      return;
    }

    if (isDpaAccepted(currentUid)) {
      navigate(route);
    } else {
      setPendingRoute(route);
      setShowModal(true);
    }
  }, [navigate]);

  /** Called when the user clicks "I Agree & Continue" in the modal. */
  const handleAccept = useCallback(() => {
    const currentUid = uidRef.current;
    persistDpaAccepted(currentUid);   // scoped to this user
    setShowModal(false);
    if (pendingRoute) {
      navigate(pendingRoute);
      setPendingRoute(null);
    }
  }, [navigate, pendingRoute]);

  /** Called when the user clicks "Cancel" in the modal. */
  const handleDecline = useCallback(() => {
    setShowModal(false);
    setPendingRoute(null);
  }, []);

  return { showModal, requestNavigation, handleAccept, handleDecline };
};