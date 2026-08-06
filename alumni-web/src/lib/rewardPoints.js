//reward_points
import { supabase } from './supabase';

// ─── internal: resolve authenticated user reliably ────────────────────────────
const resolveUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user) return user;

  console.warn('[rewardPoints] getUser() failed, falling back to getSession():', error);
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

// ─── fetch ────────────────────────────────────────────────────────────────────
export const fetchRewardProfile = async () => {
  const user = await resolveUser();
  if (!user) {
    console.error('[rewardPoints] fetchRewardProfile: no authenticated user');
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('reward_points, survey_reward_claimed_at')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('[rewardPoints] fetchRewardProfile query failed:', error);
    return null;
  }

  console.log('[rewardPoints] fetched profile:', {
    userId:          user.id,
    rewardPoints:    data.reward_points,
    surveyClaimedAt: data.survey_reward_claimed_at,
  });

  return {
    rewardPoints:         data.reward_points          ?? 0,
    surveyAlreadyClaimed: !!data.survey_reward_claimed_at,
  };
};

// ─── deduct (redemption) ──────────────────────────────────────────────────────
export const deductPoints = async (currentPoints, cost) => {
  const user = await resolveUser();
  if (!user) {
    console.error('[rewardPoints] deductPoints: no authenticated user');
    return null;
  }

  const newPoints = currentPoints - cost;
  console.log('[rewardPoints] deductPoints:', { userId: user.id, currentPoints, cost, newPoints });

  const { data, error } = await supabase
    .from('users')
    .update({ reward_points: newPoints })
    .eq('id', user.id)
    .select('reward_points')
    .single();

  if (error) {
    console.error('[rewardPoints] deductPoints failed:', error);
    return null;
  }

  console.log('[rewardPoints] deductPoints confirmed:', data.reward_points);
  return data.reward_points;
};

// ─── claim (survey reward) ────────────────────────────────────────────────────
export const claimSurveyReward = async (pointsToAward = 50) => {
  const user = await resolveUser();
  if (!user) {
    console.error('[rewardPoints] claimSurveyReward: no authenticated user — cannot claim');
    return null;
  }

  console.log('[rewardPoints] claimSurveyReward: invoking RPC', {
    userId: user.id,
    pointsToAward,
  });

  const { data, error } = await supabase.rpc('claim_survey_reward', {
    p_user_id: user.id,
    p_points:  pointsToAward,
  });

  if (error) {
    console.error('[rewardPoints] claimSurveyReward RPC error:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
    });
    return null;
  }

  console.log('[rewardPoints] claimSurveyReward RPC response:', {
    awarded: data.awarded,
    points:  data.points,
    reason:  data.reason,
    userId:  user.id,
  });

  return data;
};

// ─── realtime subscription ────────────────────────────────────────────────────
// Returns Promise<RealtimeChannel | null>.
// Caller must await and store the channel, then call channel.unsubscribe() on cleanup.
export const subscribeToRewardPoints = async (onChange, onAwarded) => {
  const user = await resolveUser();
  if (!user) {
    console.error('[rewardPoints] subscribeToRewardPoints: no authenticated user');
    return null;
  }

  const channelName = `reward_points:${user.id}`;

  try {
    const stale = supabase.channel(channelName);
    await supabase.removeChannel(stale);
  } catch {
    // channel may not exist yet — ignore
  }

  const { data: initial } = await supabase
    .from('users')
    .select('reward_points')
    .eq('id', user.id)
    .single();
  let lastKnown = initial?.reward_points ?? 0;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'users',
        filter: `id=eq.${user.id}`,
      },
      (payload) => {
        const newPoints = payload.new?.reward_points;
        console.log('[rewardPoints] realtime UPDATE received:', {
          userId:      user.id,
          newPoints,
          fullPayload: payload.new,
        });
        if (typeof newPoints === 'number') {
          onChange(newPoints);

          const delta = newPoints - lastKnown;
          lastKnown = newPoints;
          if (delta > 0 && typeof onAwarded === 'function') {
            onAwarded({ points: delta, newBalance: newPoints });
          }
        }
      }
    )
    .subscribe((status, err) => {
      if (err) {
        console.error('[rewardPoints] subscription error:', err);
      } else {
        console.log('[rewardPoints] subscription status:', status);
      }
    });

  return channel;
};