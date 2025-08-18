import { ANIMALS } from '../constants/animals';

export const evolve = (state, notify) => {
    const oldAnimal = ANIMALS[state.animalIndex % ANIMALS.length];
    const nextIdx = (state.animalIndex + 1) % ANIMALS.length;
    const nextAnimal = ANIMALS[nextIdx % ANIMALS.length];
    const nextRequired = Math.floor(state.foodRequired  * state.foodGrowth);
    
    if (notify) notify(oldAnimal, nextAnimal);

    return {
        ...state,
        animalIndex: nextIdx,
        foodFed: 0,
        foodRequired: nextRequired,
    };
};

export const applyFoodWithEvolution = (state, delta, notify) => {
    //add to wallet and progress bar
    let next = { ...state, coins: state.coins + delta, foodFed: state.foodFed + delta };
    while (next.foodFed >= next.foodRequired) {
        const overflow = next.foodFed - next.foodRequired;
        next = evolve({ ...next, foodFed: next.foodRequired }, notify);
        next.foodFed = overflow;
    }
    return next;
};