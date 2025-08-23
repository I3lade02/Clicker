import { ANIMALS } from "../constants/animals";

//Cost curves
export const multCost = (base, level) => Math.floor(base * Math.pow(1.55, level));
export const autoCost = (base, level) => Math.floor(base * Math.pow(1.6, level));


//Prestige token formula (for current run)
export const tokensForRun = (runTotalFed) =>
  Math.floor(Math.pow(Math.max(0, runTotalFed) / 10000, 0.6));

//Helpers
export const getCurrentAnimal = (s) => ANIMALS[s.animalIndex % ANIMALS.length];


export const prestigeBonus = (s) =>
  0.02 * ((s?.prestige?.upgrades?.globalFoodLevel) || 0);

export const globalMultiplier = (s) => 1 + prestigeBonus(s);

// Active boost multipliers
const tapBoost = (s) =>
  (s?.boosts?.active?.doubleBiteUntil || 0) > Date.now() ? 2 : 1;

const cpsBoost = (s) =>
  (s?.boosts?.active?.turboFeederUntil || 0) > Date.now() ? 2 : 1;

/**
 * Effective production
 */
export const effectivePerTap = (s) =>
  (s?.perTap || 0) * globalMultiplier(s) * tapBoost(s);

export const effectiveCps = (s) =>
  (s?.cps || 0) * globalMultiplier(s) * cpsBoost(s);

/**
 * Tapping outcome with combo + crits
 * Returns: { amount, isCrit, comboMul, critMul, nextCombo }
 */
export const computeTapOutcome = (s, now = Date.now()) => {
  // Combo progress
  const comboWin = s?.combo?.windowMs ?? 800;
  const step     = s?.combo?.step ?? 0.05;
  const maxBonus = s?.combo?.maxBonus ?? 0.5;

  let count = s?.combo?.count || 0;
  const last = s?.combo?.lastTapAt || 0;
  if (now - last <= comboWin) count += 1;
  else count = 0;

  const comboMul = 1 + Math.min(count * step, maxBonus);

  // Crit roll
  const chance  = s?.crit?.chance ?? 0.1;
  const critMin = s?.crit?.min ?? 2.0;
  const critMax = s?.crit?.max ?? 4.0;

  const base   = effectivePerTap(s);
  const isCrit = Math.random() < chance;
  const critMul = isCrit ? (critMin + Math.random() * (critMax - critMin)) : 1;

  const amount = Math.floor(base * comboMul * critMul);
  const nextCombo = { ...(s?.combo || {}), count, lastTapAt: now };

  return { amount, isCrit, comboMul, critMul, nextCombo };
};
