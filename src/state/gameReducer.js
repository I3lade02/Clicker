import { applyFoodWithEvolution } from "../services/evolution";
import { multCost, autoCost } from "../services/economy";
import { evaluateAndApplyAchievements } from "../services/achievements";
import { researchCostFor } from "../constants/research";
import { AFFIX_KEYS } from "../constants/affixes";

const rl = (s, key) => s?.research?.nodes?.[key] || 0;

function addBoosts(inv = {}, delta = {}) { const out = { ...inv }; for (const [k, v] of Object.entries(delta)) out[k] = (out[k] || 0) + v; return out; }

export const initialState = {
  coins: 0, perTap: 1, cps: 0,
  upgrades: { multiplier: { level: 0, baseCost: 25 }, autoclick: { level: 0, baseCost: 50 } },

  animalIndex: 0, foodFed: 0, foodRequired: 100, foodGrowth: 1.8,

  crit: { chance: 0.1, min: 2.0, max: 4.0 },
  combo: { count: 0, lastTapAt: 0, windowMs: 800, step: 0.05, maxBonus: 0.5 },

  prestige: { tokens: 0, upgrades: { globalFoodLevel: 0 } },

  research: { rp: 0, nodes: { tapPower: 0, critChance: 0, cpsPower: 0, cpsMulti: 0, comboStep: 0, boostDuration: 0 } },

  // NEW: compendium
  compendium: { entries: {}, shiniesTotal: 0 },

  boosts: { inventory: { doubleBite: 0, turboFeeder: 0 }, active: { doubleBiteUntil: 0, turboFeederUntil: 0 } },

  events: { frenzyUntil: 0, nextFrenzyAt: 0, nextBossAt: 5 },

  boss: {
    active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: null,
    // NEW
    affixes: [], shieldOn: false, nextShieldToggleAt: 0,
  },

  settings: { hapticsEnabled: true, sfxEnabled: true, sfxVolume: 1 },

  evolutions: 0, runTotalFed: 0, lifetimeTotalFed: 0, bestCombo: 0, lifetimeCrits: 0,
  upgradesPurchased: 0, prestiges: 0, tokensTotal: 0,

  achievements: { unlocked: {}, lastUnlocked: [] },

  lastSavedAt: Date.now(),
};

export const actions = {
  LOAD: "LOAD", FEED_TAP: "FEED_TAP", FEED_PASSIVE: "FEED_PASSIVE",
  BUY_MULT: "BUY_MULT", BUY_AUTO: "BUY_AUTO",
  PRESTIGE: "PRESTIGE", BUY_PRESTIGE_UPGRADE: "BUY_PRESTIGE_UPGRADE",
  RESET: "RESET", SET_COMBO: "SET_COMBO", CLEAR_ACH_NOTICES: "CLEAR_ACH_NOTICES",
  ACTIVATE_BOOST: "ACTIVATE_BOOST", TICK_BOOSTS: "TICK_BOOSTS", TOGGLE_HAPTICS: "TOGGLE_HAPTICS", TOGGLE_SFX: "TOGGLE_SFX",
  BUY_RESEARCH: "BUY_RESEARCH",
  TICK_EVENTS: "TICK_EVENTS", START_FRENZY: "START_FRENZY",
  START_BOSS: "START_BOSS", SET_SFX_VOLUME: 'SET_SFX_VOLUME',
};

function pickAffixes(evolutions = 0) {
  // 1 affix early, 2 after evo 10
  const count = evolutions >= 10 ? 2 : 1;
  const pool = [...AFFIX_KEYS];
  const out = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function startBossFromState(s, now = Date.now()) {
  const affixes = pickAffixes(s.evolutions || 0);
  let hpMax = Math.floor(s.foodRequired * 2);
  let tokens = 1 + Math.floor((s.evolutions || 0) / 10);
  if (affixes.includes("ENRAGE")) { hpMax = Math.floor(hpMax * 1.5); tokens += 1; }

  const endsAt = now + 30_000;
  const boosts = Math.random() < 0.5 ? { doubleBite: 1 } : { turboFeeder: 1 };
  const boss = { active: true, hp: hpMax, hpMax, endsAt, reward: { tokens, boosts }, lastOutcome: null, affixes, shieldOn: false, nextShieldToggleAt: 0 };
  // Initialize shield cycle if needed
  if (affixes.includes("SHIELDED")) {
    boss.shieldOn = false;
    boss.nextShieldToggleAt = now + 6000; // 6s vulnerable first
  }
  return { ...s, boss };
}

function maybeStartBoss(prev, curr) {
  if (prev.evolutions < curr.evolutions && curr.evolutions >= (curr.events?.nextBossAt || 9999)) {
    const s2 = startBossFromState(curr);
    return { ...s2, events: { ...s2.events, nextBossAt: (s2.events.nextBossAt || 5) + 5 } };
  }
  return curr;
}

function applyBossDamage(state, amount, { isCrit = false } = {}) {
  let dmg = amount;
  const ax = state.boss.affixes || [];
  if (ax.includes("SHIELDED") && state.boss.shieldOn && !isCrit) dmg = 0;
  if (ax.includes("THICK_HIDE")) dmg = Math.floor(dmg * 0.8);
  if (ax.includes("STAGGER") && isCrit) dmg = Math.floor(dmg * 5);
  const hpNext = Math.max(0, state.boss.hp - Math.max(0, dmg));
  const win = hpNext <= 0;
  const base = { ...state, boss: { ...state.boss, hp: hpNext } };
  if (!win) return base;
  const r = state.boss.reward || {};
  return {
    ...base,
    prestige: { ...state.prestige, tokens: (state.prestige.tokens || 0) + (r.tokens || 0) },
    tokensTotal: (state.tokensTotal || 0) + (r.tokens || 0),
    boosts: { ...state.boosts, inventory: addBoosts(state.boosts.inventory, r.boosts || {}) },
    boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "win", affixes: [], shieldOn: false, nextShieldToggleAt: 0 },
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case actions.LOAD: return { ...state, ...action.payload };

    // FEED
    case actions.FEED_TAP: {
      const amt = action.payload.amount;
      if (state.boss.active) {
        const afterCoins = { ...state, coins: state.coins + amt, runTotalFed: state.runTotalFed + amt, lifetimeTotalFed: state.lifetimeTotalFed + amt };
        const afterDmg = applyBossDamage(afterCoins, amt, { isCrit: !!action.payload.isCrit });
        const comboCount = action.payload?.nextCombo?.count || 0;
        return { ...afterDmg, combo: action.payload.nextCombo, bestCombo: Math.max(afterDmg.bestCombo || 0, comboCount), lifetimeCrits: (afterDmg.lifetimeCrits || 0) + (action.payload?.isCrit ? 1 : 0) };
      }
      let s1 = applyFoodWithEvolution(state, amt, action.notify);
      const comboCount = action.payload?.nextCombo?.count || 0;
      const bestCombo = Math.max(s1.bestCombo || 0, comboCount);
      const lifetimeCrits = (s1.lifetimeCrits || 0) + (action.payload?.isCrit ? 1 : 0);
      s1 = { ...s1, combo: action.payload.nextCombo, bestCombo, lifetimeCrits };
      s1 = evaluateAndApplyAchievements(state, s1);
      return maybeStartBoss(state, s1);
    }

    case actions.FEED_PASSIVE: {
      if (state.boss.active) {
        const add = action.amount;
        const afterCoins = { ...state, coins: state.coins + add, runTotalFed: state.runTotalFed + add, lifetimeTotalFed: state.lifetimeTotalFed + add };
        return applyBossDamage(afterCoins, add, { isCrit: false });
      }
      const s1 = applyFoodWithEvolution(state, action.amount, action.notify);
      const s2 = evaluateAndApplyAchievements(state, s1);
      return maybeStartBoss(state, s2);
    }

    // Purchases
    case actions.BUY_MULT: {
      const level = state.upgrades.multiplier.level;
      const cost = multCost(state.upgrades.multiplier.baseCost, level);
      if (state.coins < cost) return state;
      const s1 = { ...state, coins: state.coins - cost, foodFed: Math.max(0, state.foodFed - cost), perTap: state.perTap + 1, upgrades: { ...state.upgrades, multiplier: { ...state.upgrades.multiplier, level: level + 1 } }, upgradesPurchased: (state.upgradesPurchased || 0) + 1 };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.BUY_AUTO: {
      const level = state.upgrades.autoclick.level;
      const cost = autoCost(state.upgrades.autoclick.baseCost, level);
      if (state.coins < cost) return state;
      const s1 = { ...state, coins: state.coins - cost, foodFed: Math.max(0, state.foodFed - cost), cps: state.cps + 1, upgrades: { ...state.upgrades, autoclick: { ...state.upgrades.autoclick, level: level + 1 } }, upgradesPurchased: (state.upgradesPurchased || 0) + 1 };
      return evaluateAndApplyAchievements(state, s1);
    }

    // Prestige / Research
    case actions.PRESTIGE: {
      const { tokensEarned } = action.payload;
      const s1 = { ...initialState, prestige: { ...state.prestige, tokens: state.prestige.tokens + tokensEarned }, research: { ...state.research, rp: (state.research?.rp || 0) + tokensEarned }, lifetimeTotalFed: state.lifetimeTotalFed, prestiges: (state.prestiges || 0) + 1, tokensTotal: (state.tokensTotal || 0) + tokensEarned, compendium: state.compendium, lastSavedAt: Date.now() };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.BUY_PRESTIGE_UPGRADE: {
      if (state.prestige.tokens <= 0) return state;
      return { ...state, prestige: { ...state.prestige, tokens: state.prestige.tokens - 1, upgrades: { ...state.prestige.upgrades, globalFoodLevel: (state.prestige.upgrades.globalFoodLevel || 0) + 1 } } };
    }

    case actions.BUY_RESEARCH: {
      const key = action.key;
      const current = rl(state, key);
      const cost = researchCostFor(key, current);
      if (!isFinite(cost) || (state.research?.rp || 0) < cost) return state;
      return { ...state, research: { rp: (state.research?.rp || 0) - cost, nodes: { ...(state.research?.nodes || {}), [key]: current + 1 } } };
    }

    // Boosts & settings
    case actions.ACTIVATE_BOOST: {
      const kind = action.kind; const inv = state.boosts?.inventory?.[kind] || 0; if (inv <= 0) return state;
      const now = Date.now(); const extra = 5000 * rl(state, "boostDuration"); const DUR = 30_000 + extra;
      const active = { ...(state.boosts?.active || {}) };
      if (kind === "doubleBite") active.doubleBiteUntil = now + DUR;
      if (kind === "turboFeeder") active.turboFeederUntil = now + DUR;
      return { ...state, boosts: { inventory: { ...(state.boosts?.inventory || {}), [kind]: inv - 1 }, active } };
    }
    case actions.TICK_BOOSTS: {
      const now = Date.now(); const a = state.boosts?.active || { doubleBiteUntil: 0, turboFeederUntil: 0 };
      const nextActive = { doubleBiteUntil: a.doubleBiteUntil > now ? a.doubleBiteUntil : 0, turboFeederUntil: a.turboFeederUntil > now ? a.turboFeederUntil : 0 };
      if (nextActive.doubleBiteUntil === a.doubleBiteUntil && nextActive.turboFeederUntil === a.turboFeederUntil) return state;
      return { ...state, boosts: { ...(state.boosts || {}), active: nextActive } };
    }
    case actions.TOGGLE_HAPTICS: return { ...state, settings: { ...state.settings, hapticsEnabled: !state.settings?.hapticsEnabled } };
    case actions.TOGGLE_SFX:     return { ...state, settings: { ...state.settings, sfxEnabled: !state.settings?.sfxEnabled } };
    case actions.SET_SFX_VOLUME: {
      const v = Math.max(0, Math.min(1, action.value ?? 0));
      return { ...state, settings: { ...state.settings, sfxVolume: v } };
    }
    // Events (frenzy & boss shield cycle)
    case actions.START_FRENZY: {
      const now = Date.now(); const dur = 25_000; const nextWindow = now + (180_000 + Math.floor(Math.random() * 180_000));
      return { ...state, events: { ...state.events, frenzyUntil: now + dur, nextFrenzyAt: nextWindow } };
    }
    case actions.TICK_EVENTS: {
      const now = Date.now();
      let s1 = { ...state };
      if (!s1.events.nextFrenzyAt) { s1.events = { ...s1.events, nextFrenzyAt: now + (120_000 + Math.floor(Math.random() * 120_000)) }; }
      if ((s1.events.frenzyUntil || 0) <= now && s1.events.nextFrenzyAt && now >= s1.events.nextFrenzyAt) {
        s1 = gameReducer(s1, { type: actions.START_FRENZY });
      }
      // Boss shield toggling
      if (s1.boss.active && s1.boss.affixes.includes("SHIELDED")) {
        if (!s1.boss.nextShieldToggleAt) {
          s1.boss = { ...s1.boss, nextShieldToggleAt: now + 6000, shieldOn: false };
        } else if (now >= s1.boss.nextShieldToggleAt) {
          const shieldOn = !s1.boss.shieldOn;
          const nextAt = now + (shieldOn ? 4000 : 6000); // 4s shield, 6s vulnerable
          s1.boss = { ...s1.boss, shieldOn, nextShieldToggleAt: nextAt };
        }
        // Boss timeout
        if (s1.boss.endsAt <= now) {
          s1 = { ...s1, boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "timeout", affixes: [], shieldOn: false, nextShieldToggleAt: 0 } };
        }
      } else if (s1.boss.active && s1.boss.endsAt <= now) {
        s1 = { ...s1, boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "timeout", affixes: [], shieldOn: false, nextShieldToggleAt: 0 } };
      }
      return s1;
    }

    case actions.RESET: return { ...initialState, lastSavedAt: Date.now(), compendium: { ...state.compendium } };
    case actions.SET_COMBO: return { ...state, combo: { ...state.combo, ...action.payload } };
    case actions.CLEAR_ACH_NOTICES: return { ...state, achievements: { ...(state.achievements || { unlocked: {} }), unlocked: { ...(state.achievements?.unlocked || {}) }, lastUnlocked: [] } };

    default: return state;
  }
}
