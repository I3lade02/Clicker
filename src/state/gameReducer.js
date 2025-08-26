import { applyFoodWithEvolution } from "../services/evolution";
import { multCost, autoCost } from "../services/economy";
import { evaluateAndApplyAchievements } from "../services/achievements";
import { researchCostFor } from "../constants/research";

const rl = (s, key) => s?.research?.nodes?.[key] || 0;

function addBoosts(inv = {}, delta = {}) {
  const out = { ...inv };
  for (const [k, v] of Object.entries(delta)) out[k] = (out[k] || 0) + v;
  return out;
}

export const initialState = {
  coins: 0,
  perTap: 1,
  cps: 0,
  upgrades: {
    multiplier: { level: 0, baseCost: 400 },
    autoclick: { level: 0, baseCost: 1000 },
  },

  animalIndex: 0,
  foodFed: 0,
  foodRequired: 5000,
  foodGrowth: 2.3,

  crit: { chance: 0.1, min: 2.0, max: 4.0 },
  combo: { count: 0, lastTapAt: 0, windowMs: 800, step: 0.05, maxBonus: 0.5 },

  prestige: { tokens: 0, upgrades: { globalFoodLevel: 0 } },

  research: {
    rp: 0,
    nodes: { tapPower: 0, critChance: 0, cpsPower: 0, cpsMulti: 0, comboStep: 0, boostDuration: 0 },
  },

  boosts: {
    inventory: { doubleBite: 0, turboFeeder: 0 },
    active: { doubleBiteUntil: 0, turboFeederUntil: 0 },
  },

  // Live events
  events: {
    frenzyUntil: 0,
    nextFrenzyAt: 0, // scheduler
    nextBossAt: 5,   // spawn a boss at this evolution count
  },

  // Boss fight
  boss: {
    active: false,
    hp: 0,
    hpMax: 0,
    endsAt: 0,
    reward: null,     // { tokens, boosts }
    lastOutcome: null // "win" | "timeout" | null
  },

  settings: { hapticsEnabled: true, sfxEnabled: true },

  evolutions: 0,
  runTotalFed: 0,
  lifetimeTotalFed: 0,
  bestCombo: 0,
  lifetimeCrits: 0,
  upgradesPurchased: 0,
  prestiges: 0,
  tokensTotal: 0,

  achievements: { unlocked: {}, lastUnlocked: [] },

  lastSavedAt: Date.now(),
};

export const actions = {
  LOAD: "LOAD",
  FEED_TAP: "FEED_TAP",
  FEED_PASSIVE: "FEED_PASSIVE",
  BUY_MULT: "BUY_MULT",
  BUY_AUTO: "BUY_AUTO",
  PRESTIGE: "PRESTIGE",
  BUY_PRESTIGE_UPGRADE: "BUY_PRESTIGE_UPGRADE",
  RESET: "RESET",
  SET_COMBO: "SET_COMBO",
  CLEAR_ACH_NOTICES: "CLEAR_ACH_NOTICES",

  // boosts & settings
  ACTIVATE_BOOST: "ACTIVATE_BOOST",
  TICK_BOOSTS: "TICK_BOOSTS",
  TOGGLE_HAPTICS: "TOGGLE_HAPTICS",
  TOGGLE_SFX: "TOGGLE_SFX",

  // research
  BUY_RESEARCH: "BUY_RESEARCH",

  // events
  TICK_EVENTS: "TICK_EVENTS",
  START_FRENZY: "START_FRENZY",

  // boss
  START_BOSS: "START_BOSS",
  BOSS_FEED: "BOSS_FEED",
  BOSS_TIMEOUT: "BOSS_TIMEOUT",
};

function startBossFromState(s, now = Date.now()) {
  const hpMax = Math.floor(s.foodRequired * 2); // tough but fair
  const endsAt = now + 30_000; // 30s timer (modified later if you want)
  const tokens = 1 + Math.floor((s.evolutions || 0) / 10);
  const boosts = Math.random() < 0.5 ? { doubleBite: 1 } : { turboFeeder: 1 };
  return {
    ...s,
    boss: { active: true, hp: hpMax, hpMax, endsAt, reward: { tokens, boosts }, lastOutcome: null },
  };
}

function maybeStartBoss(prev, curr) {
  // spawn when you reach/equal nextBossAt after an evolution
  if (prev.evolutions < curr.evolutions && curr.evolutions >= (curr.events?.nextBossAt || 9999)) {
    const s2 = startBossFromState(curr);
    return { ...s2, events: { ...s2.events, nextBossAt: (s2.events.nextBossAt || 5) + 5 } }; // next boss in +5 evolutions
  }
  return curr;
}

export function gameReducer(state, action) {
  switch (action.type) {
    case actions.LOAD: {
      return { ...state, ...action.payload };
    }

    // ---- Feeding
    case actions.FEED_TAP: {
      const amt = action.payload.amount;
      if (state.boss.active) {
        const hpNext = Math.max(0, state.boss.hp - amt);
        const win = hpNext <= 0;
        const base = {
          ...state,
          coins: state.coins + amt,
          runTotalFed: (state.runTotalFed || 0) + amt,
          lifetimeTotalFed: (state.lifetimeTotalFed || 0) + amt,
          boss: { ...state.boss, hp: hpNext },
          combo: action.payload.nextCombo,
          bestCombo: Math.max(state.bestCombo || 0, action.payload?.nextCombo?.count || 0),
          lifetimeCrits: (state.lifetimeCrits || 0) + (action.payload?.isCrit ? 1 : 0),
        };
        if (!win) return base;
        // Victory: grant rewards immediately
        const r = state.boss.reward || {};
        return {
          ...base,
          prestige: { ...state.prestige, tokens: (state.prestige.tokens || 0) + (r.tokens || 0) },
          tokensTotal: (state.tokensTotal || 0) + (r.tokens || 0),
          boosts: {
            ...state.boosts,
            inventory: addBoosts(state.boosts.inventory, r.boosts || {}),
          },
          boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "win" },
        };
      }
      // normal feeding path
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
        const hpNext = Math.max(0, state.boss.hp - action.amount);
        const win = hpNext <= 0;
        const base = {
          ...state,
          coins: state.coins + action.amount,
          runTotalFed: (state.runTotalFed || 0) + action.amount,
          lifetimeTotalFed: (state.lifetimeTotalFed || 0) + action.amount,
          boss: { ...state.boss, hp: hpNext },
        };
        if (!win) return base;
        const r = state.boss.reward || {};
        return {
          ...base,
          prestige: { ...state.prestige, tokens: (state.prestige.tokens || 0) + (r.tokens || 0) },
          tokensTotal: (state.tokensTotal || 0) + (r.tokens || 0),
          boosts: { ...state.boosts, inventory: addBoosts(state.boosts.inventory, r.boosts || {}) },
          boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "win" },
        };
      }
      const s1 = applyFoodWithEvolution(state, action.amount, action.notify);
      const s2 = evaluateAndApplyAchievements(state, s1);
      return maybeStartBoss(state, s2);
    }

    // ---- Purchases
    case actions.BUY_MULT: {
      const level = state.upgrades.multiplier.level;
      const cost = multCost(state.upgrades.multiplier.baseCost, level);
      if (state.coins < cost) return state;
      const s1 = {
        ...state,
        coins: state.coins - cost,
        foodFed: Math.max(0, state.foodFed - cost),
        perTap: state.perTap + 1,
        upgrades: { ...state.upgrades, multiplier: { ...state.upgrades.multiplier, level: level + 1 } },
        upgradesPurchased: (state.upgradesPurchased || 0) + 1,
      };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.BUY_AUTO: {
      const level = state.upgrades.autoclick.level;
      const cost = autoCost(state.upgrades.autoclick.baseCost, level);
      if (state.coins < cost) return state;
      const s1 = {
        ...state,
        coins: state.coins - cost,
        foodFed: Math.max(0, state.foodFed - cost),
        cps: state.cps + 1,
        upgrades: { ...state.upgrades, autoclick: { ...state.upgrades.autoclick, level: level + 1 } },
        upgradesPurchased: (state.upgradesPurchased || 0) + 1,
      };
      return evaluateAndApplyAchievements(state, s1);
    }

    // ---- Prestige & Research
    case actions.PRESTIGE: {
      const { tokensEarned } = action.payload;
      const s1 = {
        ...initialState,
        prestige: { ...state.prestige, tokens: state.prestige.tokens + tokensEarned },
        research: { ...state.research, rp: (state.research?.rp || 0) + tokensEarned },
        lifetimeTotalFed: state.lifetimeTotalFed,
        prestiges: (state.prestiges || 0) + 1,
        tokensTotal: (state.tokensTotal || 0) + tokensEarned,
        lastSavedAt: Date.now(),
      };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.BUY_PRESTIGE_UPGRADE: {
      if (state.prestige.tokens <= 0) return state;
      return {
        ...state,
        prestige: {
          ...state.prestige,
          tokens: state.prestige.tokens - 1,
          upgrades: { ...state.prestige.upgrades, globalFoodLevel: (state.prestige.upgrades.globalFoodLevel || 0) + 1 },
        },
      };
    }

    case actions.BUY_RESEARCH: {
      const key = action.key;
      const current = rl(state, key);
      const cost = researchCostFor(key, current);
      if (!isFinite(cost) || (state.research?.rp || 0) < cost) return state;
      return {
        ...state,
        research: { rp: (state.research?.rp || 0) - cost, nodes: { ...(state.research?.nodes || {}), [key]: current + 1 } },
      };
    }

    // ---- Boosts & settings
    case actions.ACTIVATE_BOOST: {
      const kind = action.kind;
      const inv = state.boosts?.inventory?.[kind] || 0;
      if (inv <= 0) return state;
      const now = Date.now();
      const extra = 5000 * rl(state, "boostDuration");
      const DUR = 30_000 + extra;
      const active = { ...(state.boosts?.active || {}) };
      if (kind === "doubleBite") active.doubleBiteUntil = now + DUR;
      if (kind === "turboFeeder") active.turboFeederUntil = now + DUR;
      return { ...state, boosts: { inventory: { ...(state.boosts?.inventory || {}), [kind]: inv - 1 }, active } };
    }

    case actions.TICK_BOOSTS: {
      const now = Date.now();
      const a = state.boosts?.active || { doubleBiteUntil: 0, turboFeederUntil: 0 };
      const nextActive = {
        doubleBiteUntil: a.doubleBiteUntil > now ? a.doubleBiteUntil : 0,
        turboFeederUntil: a.turboFeederUntil > now ? a.turboFeederUntil : 0,
      };
      if (nextActive.doubleBiteUntil === a.doubleBiteUntil && nextActive.turboFeederUntil === a.turboFeederUntil) return state;
      return { ...state, boosts: { ...(state.boosts || {}), active: nextActive } };
    }

    case actions.TOGGLE_HAPTICS: {
      return { ...state, settings: { ...state.settings, hapticsEnabled: !state.settings?.hapticsEnabled } };
    }
    case actions.TOGGLE_SFX: {
      return { ...state, settings: { ...state.settings, sfxEnabled: !state.settings?.sfxEnabled } };
    }

    // ---- Events & Boss timers
    case actions.START_FRENZY: {
      const now = Date.now();
      const dur = 25_000; // 25s frenzy
      const nextWindow = now + (180_000 + Math.floor(Math.random() * 180_000)); // 3–6 min
      return { ...state, events: { ...state.events, frenzyUntil: now + dur, nextFrenzyAt: nextWindow } };
    }

    case actions.TICK_EVENTS: {
      const now = Date.now();
      let s1 = { ...state };

      // Schedule first frenzy window if missing
      if (!s1.events.nextFrenzyAt) {
        s1.events = { ...s1.events, nextFrenzyAt: now + (120_000 + Math.floor(Math.random() * 120_000)) }; // 2–4 min first
      }

      // Auto-start frenzy
      if ((s1.events.frenzyUntil || 0) <= now && s1.events.nextFrenzyAt && now >= s1.events.nextFrenzyAt) {
        s1 = gameReducer(s1, { type: actions.START_FRENZY });
      }

      // Boss timeout
      if (s1.boss.active && s1.boss.endsAt <= now) {
        s1 = { ...s1, boss: { active: false, hp: 0, hpMax: 0, endsAt: 0, reward: null, lastOutcome: "timeout" } };
      }

      return s1;
    }

    case actions.RESET: {
      return { ...initialState, lastSavedAt: Date.now() };
    }

    case actions.SET_COMBO: {
      return { ...state, combo: { ...state.combo, ...action.payload } };
    }

    case actions.CLEAR_ACH_NOTICES: {
      return {
        ...state,
        achievements: { ...(state.achievements || { unlocked: {} }), unlocked: { ...(state.achievements?.unlocked || {}) }, lastUnlocked: [] },
      };
    }

    default:
      return state;
  }
}
