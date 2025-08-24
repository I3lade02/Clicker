import { ACHIEVEMENTS } from "../constants/achievements";

// --- Stat readers ---
function getStatByType(s, type) {
  switch (type) {
    case "fed_total":     return s.lifetimeTotalFed || 0;
    case "evolutions":    return s.evolutions || 0;
    case "per_tap":       return s.perTap || 0;
    case "cps":           return s.cps || 0;
    case "auto_level":    return (s.upgrades?.autoclick?.level) || 0;
    case "best_combo":    return s.bestCombo || 0;
    case "crits":         return s.lifetimeCrits || 0;
    case "prestiges":     return s.prestiges || 0;
    case "tokens_total":  return s.tokensTotal || 0; // lifetime tokens earned
    default:              return 0;
  }
}

// Exported stat helper for the UI
export function statValueFor(s, type) {
  return getStatByType(s, type);
}

// --- Rewards ---
function applyReward(state, reward) {
  if (!reward) return state;
  let next = { ...state };

  // ensure prestige container
  next.prestige = next.prestige || { tokens: 0, upgrades: { globalFoodLevel: 0 } };

  if (reward.tokens) {
    next.prestige = {
      ...next.prestige,
      tokens: (next.prestige.tokens || 0) + reward.tokens,
    };
    next.tokensTotal = (next.tokensTotal || 0) + reward.tokens;
  }

  if (reward.boosts) {
    const invOld = (next.boosts?.inventory) || {};
    const invNew = { ...invOld };
    for (const [k, v] of Object.entries(reward.boosts)) {
      invNew[k] = (invNew[k] || 0) + v;
    }
    next.boosts = {
      ...(next.boosts || {}),
      inventory: invNew,
      active: { ...(next.boosts?.active || { doubleBiteUntil: 0, turboFeederUntil: 0 }) },
    };
  }

  return next;
}

// --- Evaluator ---
export function evaluateAndApplyAchievements(prevState, currState) {
  let next = { ...currState };
  const unlocked = { ...(next.achievements?.unlocked || {}) };
  const newly = [];

  for (const a of ACHIEVEMENTS) {
    if (unlocked[a.key]) continue;
    const val = getStatByType(next, a.type);
    if (val >= a.threshold) {
      unlocked[a.key] = Date.now();
      newly.push({ key: a.key, title: a.title, desc: a.desc, reward: a.reward });
      next = applyReward(next, a.reward);
    }
  }

  if (newly.length === 0) return next;

  return {
    ...next,
    achievements: {
      unlocked,
      lastUnlocked: newly,
    },
  };
}
