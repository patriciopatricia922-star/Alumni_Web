//reward_points
import { supabase } from './supabase';

// ─── internal: resolve authenticated user reliably ────────────────────────────
const resolveUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user) return user;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
};

// ─── fetch ────────────────────────────────────────────────────────────────────
export const fetchRewardProfile = async () => {
  const user = await resolveUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('users')
    .select('reward_points, survey_reward_claimed_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return null;
  }

  return {
    rewardPoints:         data.reward_points          ?? 0,
    surveyAlreadyClaimed: !!data.survey_reward_claimed_at,
  };
};

// ─── deduct (redemption) ──────────────────────────────────────────────────────
export const deductPoints = async (currentPoints, cost) => {
  const user = await resolveUser();
  if (!user) {
    return null;
  }

  const newPoints = currentPoints - cost;

  const { data, error } = await supabase
    .from('users')
    .update({ reward_points: newPoints })
    .eq('id', user.id)
    .select('reward_points')
    .single();

  if (error) {
    return null;
  }

  return data.reward_points;
};

// ─── claim (survey reward) ────────────────────────────────────────────────────
export const claimSurveyReward = async (pointsToAward = 50) => {
  const user = await resolveUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase.rpc('claim_survey_reward', {
    p_user_id: user.id,
    p_points:  pointsToAward,
  });

  if (error) {
    return null;
  }

  return data;
};

// ─── realtime subscription ────────────────────────────────────────────────────
// Returns Promise<RealtimeChannel | null>.
// Caller must await and store the channel, then call channel.unsubscribe() on cleanup.
export const subscribeToRewardPoints = async (onChange, onAwarded) => {
  const user = await resolveUser();
  if (!user) {
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
    });

  return channel;
};