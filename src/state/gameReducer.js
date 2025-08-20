import { applyFoodWithEvolution } from "../services/evolution";

export const initialState = {
    //resources
    coins: 0,
    perTap: 1,
    cps: 0,

    //upgrades
    upgrades: {
        multiplier: { level: 0, baseCost: 250 },
        autoclick: { level: 0, baseCost: 50 },
    },

    //animals
    animalIndex: 0,
    foodFed: 0,
    foodRequired: 5000,
    foodGrowth: 1.8,

    lastSavedAt: Date.now(),
};

export const actions = {
    LOAD: 'LOAD',
    FEED_TAP: 'FEED_TAP',
    FEED_PASSIVE: 'FEED_PASSIVE',
    BUY_MULT: 'BUY_MULT',
    BUY_AUTO: 'BUY_AUTO',
    RESET: 'RESET',
};

export function gameReducer(state, action) {
    switch (action.type) {
        case actions.LOAD: {
            return { ...state, ...action.payload};
        }

        case actions.FEED_TAP: {
            return applyFoodWithEvolution(state, state.perTap, action.notify);
        }

        case actions.FEED_PASSIVE: {
            return applyFoodWithEvolution(state, action.amount, action.notify);
        }

        case actions.BUY_MULT: {
            const level = state.upgrades.multiplier.level;
            const cost = Math.floor(state.upgrades.multiplier.baseCost * Math.pow(1.55, level));
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
            const cost = Math.floor(state.upgrades.autoclick.baseCost * Math.pow(1.6, level));
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

        case actions.RESET: {
            return { ...initialState, lastSavedAt: Date.now() };
        }

        default:
            return state;
    }
}
