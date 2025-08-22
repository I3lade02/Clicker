import { useEffect } from "react";
import { effectiveCps } from "../services/economy";

export default function useCpsTicker(state, dispatch, actions, notify) {
  useEffect(() => {
    if (state.cps <= 0) return;
    const id = setInterval(() => {
      const amount = Math.floor(effectiveCps(state));
      if (amount > 0) {
        dispatch({ type: actions.FEED_PASSIVE, amount, notify });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [state.cps, state.upgrades, state.prestige, state.biomeBonuses, state.animalIndex]);
}
