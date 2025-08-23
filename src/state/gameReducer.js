import { applyFoodWithEvolution } from "../services/evolution";
import { multCost, autoCost } from "../services/economy";
import { evaluateAndApplyAchievements } from "../services/achievements";

export const initialState = {
  // resources
  coins: 0,
  perTap: 1,
  cps: 0,

  // upgrades
  upgrades: {
    multiplier: { level: 0, baseCost: 400 },
    autoclick: { level: 0, baseCost: 1000 },
  },

  // animals / feeding
  animalIndex: 0,
  foodFed: 0,
  foodRequired: 5000,
  foodGrowth: 2.1,

  // crits & combo
  crit: { chance: 0.05, min: 1.4, max: 3.5 },
  combo: { count: 0, lastTapAt: 0, windowMs: 800, step: 0.005, maxBonus: 0.4 },

  // prestige
  prestige: {
    tokens: 0,
    upgrades: { globalFoodLevel: 0 }, // each level = +2% global
  },

  // boosts (inventory + active)
  boosts: {
    inventory: { doubleBite: 0, turboFeeder: 0 },
    active: { doubleBiteUntil: 0, turboFeederUntil: 0 },
  },

  // stats
  evolutions: 0,
  runTotalFed: 0,
  lifetimeTotalFed: 0,
  bestCombo: 0,
  lifetimeCrits: 0,
  upgradesPurchased: 0,
  prestiges: 0,
  tokensTotal: 0,

  // achievements
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

  // inventory / boosts
  ACTIVATE_BOOST: "ACTIVATE_BOOST",
  TICK_BOOSTS: "TICK_BOOSTS",
};

export function gameReducer(state, action) {
  switch (action.type) {
    case actions.LOAD: {
      return { ...state, ...action.payload };
    }

    case actions.FEED_TAP: {
      // payload: { amount, nextCombo, isCrit }
      let s1 = applyFoodWithEvolution(state, action.payload.amount, action.notify);
      const comboCount = action.payload?.nextCombo?.count || 0;
      const bestCombo = Math.max(s1.bestCombo || 0, comboCount);
      const lifetimeCrits = (s1.lifetimeCrits || 0) + (action.payload?.isCrit ? 1 : 0);
      s1 = { ...s1, combo: action.payload.nextCombo, bestCombo, lifetimeCrits };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.FEED_PASSIVE: {
      const s1 = applyFoodWithEvolution(state, action.amount, action.notify);
      return evaluateAndApplyAchievements(state, s1);
    }

    // Purchases reduce progress bar (clamped at 0)
    case actions.BUY_MULT: {
      const level = state.upgrades.multiplier.level;
      const cost = multCost(state.upgrades.multiplier.baseCost, level);
      if (state.coins < cost) return state;

      const s1 = {
        ...state,
        coins: state.coins - cost,
        foodFed: Math.max(0, state.foodFed - cost),
        perTap: state.perTap + 1,
        upgrades: {
          ...state.upgrades,
          multiplier: { ...state.upgrades.multiplier, level: level + 1 },
        },
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
        upgrades: {
          ...state.upgrades,
          autoclick: { ...state.upgrades.autoclick, level: level + 1 },
        },
        upgradesPurchased: (state.upgradesPurchased || 0) + 1,
      };
      return evaluateAndApplyAchievements(state, s1);
    }

    case actions.PRESTIGE: {
      const { tokensEarned } = action.payload;
      const s1 = {
        ...initialState,
        prestige: { ...state.prestige, tokens: state.prestige.tokens + tokensEarned },
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
          upgrades: {
            ...state.prestige.upgrades,
            globalFoodLevel: (state.prestige.upgrades.globalFoodLevel || 0) + 1,
          },
        },
      };
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
        achievements: {
          ...(state.achievements || { unlocked: {} }),
          unlocked: { ...(state.achievements?.unlocked || {}) },
          lastUnlocked: [],
        },
      };
    }

    // Inventory / boosts
    case actions.ACTIVATE_BOOST: {
      const kind = action.kind; // "doubleBite" | "turboFeeder"
      const inv = state.boosts?.inventory?.[kind] || 0;
      if (inv <= 0) return state;
      const now = Date.now();
      const DUR = 30_000; // 30 seconds
      const active = { ...(state.boosts?.active || {}) };
      if (kind === "doubleBite") active.doubleBiteUntil = now + DUR;
      if (kind === "turboFeeder") active.turboFeederUntil = now + DUR;

      return {
        ...state,
        boosts: {
          inventory: { ...(state.boosts?.inventory || {}), [kind]: inv - 1 },
          active,
        },
      };
    }

    case actions.TICK_BOOSTS: {
      const now = Date.now();
      const a = state.boosts?.active || { doubleBiteUntil: 0, turboFeederUntil: 0 };
      const nextActive = {
        doubleBiteUntil: a.doubleBiteUntil > now ? a.doubleBiteUntil : 0,
        turboFeederUntil: a.turboFeederUntil > now ? a.turboFeederUntil : 0,
      };
      if (
        nextActive.doubleBiteUntil === a.doubleBiteUntil &&
        nextActive.turboFeederUntil === a.turboFeederUntil
      ) {
        return state;
      }
      return { ...state, boosts: { ...(state.boosts || {}), active: nextActive } };
    }

    default:
      return state;
  }
}
