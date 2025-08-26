import { useEffect } from "react";
import * as ECON from "../services/economy";

export default function useCpsTicker(state, dispatch, actions, notify) {
  useEffect(() => {
    const id = setInterval(() => {
      // passive food
      const amount = Math.floor(ECON.effectiveCps(state));
      if (amount > 0) {
        dispatch({ type: actions.FEED_PASSIVE, amount, notify });
      }
      // cleanup timers
      dispatch({ type: actions.TICK_BOOSTS });
      dispatch({ type: actions.TICK_EVENTS });
    }, 1000);
    return () => clearInterval(id);
  }, [state.cps, state.perTap, state.prestige, state.boosts, state.events]);
}
