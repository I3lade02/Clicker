import { ANIMALS } from "../constants/animals";

export const evolve = (state, notify) => {
  const oldAnimal = ANIMALS[state.animalIndex % ANIMALS.length];
  const nextIdx = (state.animalIndex + 1) % ANIMALS.length;
  const nextAnimal = ANIMALS[nextIdx % ANIMALS.length];
  const nextRequired = Math.floor(state.foodRequired * state.foodGrowth);

  const bonuses = { ...(state.biomeBonuses || {}) };
  if (oldAnimal.lastInBiome) {
    const biome = oldAnimal.biome;
    const prev = bonuses[biome] || 0;
    bonuses[biome] = prev + 0.10; // +10% CPS in that biome
  }

  if (notify) {
    const biomeMsg = oldAnimal.lastInBiome ? `\nBiome bonus for ${oldAnimal.biome}: +10% CPS!` : "";
    notify(oldAnimal, nextAnimal, biomeMsg);
  }

  return {
    ...state,
    animalIndex: nextIdx,
    foodFed: 0,
    foodRequired: nextRequired,
    biomeBonuses: bonuses,
    evolutions: (state.evolutions || 0) + 1
  };
};

export const applyFoodWithEvolution = (state, delta, notify) => {
  let next = {
    ...state,
    coins: state.coins + delta,
    foodFed: state.foodFed + delta,
    runTotalFed: (state.runTotalFed || 0) + delta,
    lifetimeTotalFed: (state.lifetimeTotalFed || 0) + delta
  };
  while (next.foodFed >= next.foodRequired) {
    const overflow = next.foodFed - next.foodRequired;
    next = evolve({ ...next, foodFed: next.foodRequired }, notify);
    next.foodFed = overflow;
  }
  return next;
};
