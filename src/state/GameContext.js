import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { actions, gameReducer, initialState } from "./gameReducer";
import { clearState, loadState, saveState } from "../storage/persistence";

const GameCtx = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const notify = (oldA, nextA, extra = "") => {
    // Haptic (evolution)
    if (state.settings?.hapticsEnabled && Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert(
      "Yum! Full belly!",
      `${oldA.emoji} ${oldA.name} is satisfied.\nSay hi to ${nextA.emoji} ${nextA.name}!${extra}`
    );
  };

  useEffect(() => {
    (async () => {
      const saved = await loadState();
      if (!saved) return;
      const now = Date.now();
      const elapsedSec = Math.max(0, Math.floor((now - (saved.lastSavedAt || now)) / 1000));
      const offlineFood = (saved.cps || 0) * elapsedSec;
      dispatch({ type: actions.LOAD, payload: { ...saved, lastSavedAt: now } });
      if (offlineFood > 0) {
        dispatch({ type: actions.FEED_PASSIVE, amount: offlineFood, notify });
        Alert.alert("Welcome back!", `Your feeders added ${offlineFood} food while away.`);
      }
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(() => saveState(state), 5000);
    return () => clearInterval(id);
  }, [state]);

  const value = useMemo(
    () => ({ state, dispatch, actions, notify, clearState: () => clearState() }),
    [state]
  );
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export const useGame = () => useContext(GameCtx);
