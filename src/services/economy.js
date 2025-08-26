import { ANIMALS } from "../constants/animals";

const rl = (s, key) => s?.research?.nodes?.[key] || 0;

export const multCost = (base, level) => Math.floor(base * Math.pow(1.55, level));
export const autoCost = (base, level) => Math.floor(base * Math.pow(1.6, level));

export const tokensForRun = (runTotalFed) =>
  Math.floor(Math.pow(Math.max(0, runTotalFed) / 10000, 0.6));

export const getCurrentAnimal = (s) => ANIMALS[s.animalIndex % ANIMALS.length];

export const prestigeBonus = (s) => 0.02 * (s?.prestige?.upgrades?.globalFoodLevel || 0);
export const globalMultiplier = (s) => 1 + prestigeBonus(s);

// Boost multipliers
const tapBoost = (s) => (s?.boosts?.active?.doubleBiteUntil || 0) > Date.now() ? 2 : 1;
const cpsBoost = (s) => (s?.boosts?.active?.turboFeederUntil || 0) > Date.now() ? 2 : 1;

// Event multiplier (Frenzy)
const eventMult = (s) => (s?.events?.frenzyUntil || 0) > Date.now() ? 1.5 : 1;

// Research bonuses
const tapFlat   = (s) => rl(s, "tapPower");
const cpsFlat   = (s) => rl(s, "cpsPower");
const cpsMult   = (s) => 1 + 0.10 * rl(s, "cpsMulti");
const comboStepBonus = (s) => 0.01 * rl(s, "comboStep");
const critBonus = (s) => 0.02 * rl(s, "critChance");

export const effectivePerTap = (s) =>
  ((s?.perTap || 0) + tapFlat(s)) * globalMultiplier(s) * eventMult(s) * tapBoost(s);

export const effectiveCps = (s) =>
  ((s?.cps || 0) + cpsFlat(s)) * globalMultiplier(s) * eventMult(s) * cpsMult(s) * cpsBoost(s);

export const computeTapOutcome = (s, now = Date.now()) => {
  const baseStep = s?.combo?.step ?? 0.05;
  const step     = baseStep + comboStepBonus(s);
  const comboWin = s?.combo?.windowMs ?? 800;
  const maxBonus = s?.combo?.maxBonus ?? 0.5;

  let count = s?.combo?.count || 0;
  const last = s?.combo?.lastTapAt || 0;
  if (now - last <= comboWin) count += 1; else count = 0;
  const comboMul = 1 + Math.min(count * step, maxBonus);

  const baseChance = s?.crit?.chance ?? 0.1;
  const chance = Math.min(0.3, baseChance + critBonus(s));
  const critMin = s?.crit?.min ?? 2.0;
  const critMax = s?.crit?.max ?? 4.0;

  const base   = effectivePerTap(s);
  const isCrit = Math.random() < chance;
  const critMul = isCrit ? (critMin + Math.random() * (critMax - critMin)) : 1;

  const amount = Math.floor(base * comboMul * critMul);
  const nextCombo = { ...(s?.combo || {}), count, lastTapAt: now };

  return { amount, isCrit, comboMul, critMul, nextCombo };
};
