// src/services/evolution.js
import { ANIMALS } from "../constants/animals";

export function applyFoodWithEvolution(state, amount, notify) {
  // add coins/food
  let coins = (state.coins || 0) + amount;
  let fed   = (state.foodFed || 0) + amount;
  let runTotal = (state.runTotalFed || 0) + amount;
  let lifetime = (state.lifetimeTotalFed || 0) + amount;

  let next = { ...state, coins, foodFed: fed, runTotalFed: runTotal, lifetimeTotalFed: lifetime };

  // evolve loop (in case of big bursts)
  while (next.foodFed >= next.foodRequired) {
    next = evolve(next, notify);
  }
  return next;
}

function evolve(state, notify) {
  const currIdx = state.animalIndex;
  const nextIdx = (currIdx + 1) % ANIMALS.length;
  const oldA = ANIMALS[currIdx];
  const nextA = ANIMALS[nextIdx];

  // progress to next animal
  const overflow = state.foodFed - state.foodRequired;
  const nextRequired = Math.floor(state.foodRequired * (state.foodGrowth || 1.8));
  let s = {
    ...state,
    animalIndex: nextIdx,
    foodFed: Math.max(0, overflow),
    foodRequired: nextRequired,
    evolutions: (state.evolutions || 0) + 1,
  };

  // Compendium logging for the NEW animal
  const shinyChance = 0.01; // 1% MVP
  const isShiny = Math.random() < shinyChance;
  const entries = { ...(state.compendium?.entries || {}) };
  const entry = entries[nextIdx] || { count: 0, shiny: 0 };
  entry.count += 1;
  if (isShiny) entry.shiny += 1;
  entries[nextIdx] = entry;

  s.compendium = {
    entries,
    shiniesTotal: (state.compendium?.shiniesTotal || 0) + (isShiny ? 1 : 0),
  };

  // Notify UI (e.g., alert + haptic/sfx)
  if (typeof notify === "function") {
    notify(oldA, nextA, isShiny ? "\n✨ You discovered a shiny variant!" : "");
  }

  return s;
}
