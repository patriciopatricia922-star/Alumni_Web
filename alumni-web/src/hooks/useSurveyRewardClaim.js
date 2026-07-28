import { useEffect, useRef } from 'react';
import { fetchRewardProfile, claimSurveyReward } from '../lib/rewardPoints';

const SURVEY_REWARD_POINTS = 50;

/**
 * @param {object} handlers
 * @param {(points:number) => void} handlers.onPointsSynced
 * @param {(claimed:boolean) => void} handlers.onClaimedStatus
 * @param {(toast:{visible:boolean,points:number,newBalance:number,label:string}) => void} handlers.onToast
 */
export const useSurveyRewardClaim = ({ onPointsSynced, onClaimedStatus, onToast, onClaimed }) => {
  const isClaimingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasQueryFlag = params.get('survey_completed') === '1';
    const hasSessionFlag = sessionStorage.getItem('survey_claim_reward') === '1';

    if (!hasQueryFlag && !hasSessionFlag) return;

    if (hasQueryFlag) window.history.replaceState({}, '', window.location.pathname);
    if (hasSessionFlag) sessionStorage.removeItem('survey_claim_reward');

    const attemptClaim = async () => {
      if (isClaimingRef.current) {
        console.warn('[useSurveyRewardClaim] attemptClaim already in progress, skipping');
        return;
      }
      isClaimingRef.current = true;

      try {
        await new Promise((r) => setTimeout(r, 400));

        console.log('[useSurveyRewardClaim] calling claimSurveyReward...');
        const result = await claimSurveyReward(SURVEY_REWARD_POINTS);

        if (!result) {
          console.error('[useSurveyRewardClaim] claimSurveyReward returned null — re-fetching balance');
          const profile = await fetchRewardProfile();
          if (profile) {
            onPointsSynced?.(profile.rewardPoints);
            onClaimedStatus?.(profile.surveyAlreadyClaimed);
          }
          return;
        }

        console.log('[useSurveyRewardClaim] result:', result);

        if (typeof result.points === 'number' && result.points >= 0) {
          onPointsSynced?.(result.points);
        }

        if (result.awarded) {
          onClaimedStatus?.(true);
          onToast?.({
            visible: true,
            points: SURVEY_REWARD_POINTS,
            newBalance: result.points,
            label: 'Survey completed',
          });
          onClaimed?.();
        } else if (result.reason === 'survey_incomplete') {
          console.warn('[useSurveyRewardClaim] survey_incomplete — verifying via direct fetch');
          const profile = await fetchRewardProfile();
          if (profile) {
            onPointsSynced?.(profile.rewardPoints);
            onClaimedStatus?.(profile.surveyAlreadyClaimed);
          }
        } else if (result.reason === 'already_claimed') {
          onClaimedStatus?.(true);
          console.log('[useSurveyRewardClaim] already claimed previously, balance synced');
        } else if (result.reason === 'cooldown_active') {
          console.log('[useSurveyRewardClaim] cooldown active, no points awarded this update');
          onToast?.({
            visible: true,
            points: 0,
            newBalance: result.points,
            label: 'Survey updated! You can earn more points again after the cooldown period.',
          });
        }
      } catch (err) {
        console.error('[useSurveyRewardClaim] threw unexpectedly:', err);
        const profile = await fetchRewardProfile();
        if (profile) {
          onPointsSynced?.(profile.rewardPoints);
          onClaimedStatus?.(profile.surveyAlreadyClaimed);
        }
      } finally {
        isClaimingRef.current = false;
      }
    };

    attemptClaim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export { SURVEY_REWARD_POINTS };