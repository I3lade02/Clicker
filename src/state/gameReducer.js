import { applyFoodWithEvolution } from "../services/evolution";
import { multCost, autoCost } from "../services/economy";

export const initialState = {
  // resources
  coins: 0,
  perTap: 1,
  cps: 0,

  // upgrades
  upgrades: {
    multiplier: { level: 0, baseCost: 25 },
    autoclick: { level: 0, baseCost: 50 },
  },

  // animals / feeding
  animalIndex: 0,
  foodFed: 0,
  foodRequired: 100,
  foodGrowth: 1.8,

  // habitats
  biomeBonuses: {}, // { Forest: 0.1, Arctic: 0.2, ... }

  // crits & combo
  crit: { chance: 0.1, min: 2.0, max: 4.0 },
  combo: { count: 0, lastTapAt: 0, windowMs: 800, step: 0.05, maxBonus: 0.5 },

  // prestige
  prestige: {
    tokens: 0,
    upgrades: { globalFoodLevel: 0 } // each level = +2% global
  },

  // stats
  evolutions: 0,
  runTotalFed: 0,
  lifetimeTotalFed: 0,

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
  SET_COMBO: "SET_COMBO"
};

export function gameReducer(state, action) {
  switch (action.type) {
    case actions.LOAD: {
      return { ...state, ...action.payload };
    }
    case actions.FEED_TAP: {
      // action.payload: { amount, nextCombo }
      const s1 = applyFoodWithEvolution(state, action.payload.amount, action.notify);
      return { ...s1, combo: action.payload.nextCombo };
    }
    case actions.FEED_PASSIVE: {
      return applyFoodWithEvolution(state, action.amount, action.notify);
    }
    case actions.BUY_MULT: {
      const level = state.upgrades.multiplier.level;
      const cost = multCost(state.upgrades.multiplier.baseCost, level);
      if (state.coins < cost) return state;
      return {
        ...state,
        coins: state.coins - cost,
        perTap: state.perTap + 1,
        upgrades: {
          ...state.upgrades,
          multiplier: { ...state.upgrades.multiplier, level: level + 1 },
        },
      };
    }
    case actions.BUY_AUTO: {
      const level = state.upgrades.autoclick.level;
      const cost = autoCost(state.upgrades.autoclick.baseCost, level);
      if (state.coins < cost) return state;
      return {
        ...state,
        coins: state.coins - cost,
        cps: state.cps + 1,
        upgrades: {
          ...state.upgrades,
          autoclick: { ...state.upgrades.autoclick, level: level + 1 },
        },
      };
    }
    case actions.PRESTIGE: {
      const { tokensEarned } = action.payload;
      return {
        ...initialState,
        prestige: {
          ...state.prestige,
          tokens: state.prestige.tokens + tokensEarned,
        },
        biomeBonuses: { ...state.biomeBonuses }, // keep biome bonuses
        lifetimeTotalFed: state.lifetimeTotalFed,
        lastSavedAt: Date.now(),
      };
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
            globalFoodLevel: (state.prestige.upgrades.globalFoodLevel || 0) + 1
          }
        }
      };
    }
    case actions.RESET: {
      return { ...initialState, lastSavedAt: Date.now() };
    }
    case actions.SET_COMBO: {
      return { ...state, combo: { ...state.combo, ...action.payload } };
    }
    default:
      return state;
  }
}
