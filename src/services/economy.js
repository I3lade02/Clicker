import { ANIMALS } from "../constants/animals";

export const multCost = (base, level) => Math.floor(base * Math.pow(1.55, level));
export const autoCost = (base, level) => Math.floor(base * Math.pow(1.6, level));

export const tokensForRun = (runTotalFed) =>
  Math.floor(Math.pow(Math.max(0, runTotalFed) / 10000, 0.6));

export const getCurrentAnimal = (s) => ANIMALS[s.animalIndex % ANIMALS.length];

// Global prestige multiplier only (biomes removed)
export const prestigeBonus = (s) => 0.02 * (s.prestige?.upgrades?.globalFoodLevel || 0);
export const globalMultiplier = (s) => 1 + prestigeBonus(s);

export const effectivePerTap = (s) => s.perTap * globalMultiplier(s);
export const effectiveCps    = (s) => s.cps * globalMultiplier(s);

export const computeTapOutcome = (s, now = Date.now()) => {
  // Combo
  const comboWin = s.combo.windowMs;
  const step     = s.combo.step;
  const maxBonus = s.combo.maxBonus;

  let count = s.combo.count || 0;
  const last = s.combo.lastTapAt || 0;
  if (now - last <= comboWin) count += 1; else count = 0;
  const comboMul = 1 + Math.min(count * step, maxBonus);

  // Crit
  const base   = effectivePerTap(s);
  const isCrit = Math.random() < s.crit.chance;
  const critMul = isCrit ? (s.crit.min + Math.random() * (s.crit.max - s.crit.min)) : 1;

  const amount = Math.floor(base * comboMul * critMul);
  const nextCombo = { ...s.combo, count, lastTapAt: now };

  return { amount, isCrit, comboMul, critMul, nextCombo };
};
