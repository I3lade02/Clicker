import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useGame } from "../state/GameContext";
import { colors } from "../constants/colors";
import { format } from "../utils/format";
import AnimalHeader from "../components/AnimalHeader";
import BigButton from "../components/BigButton";
import ProgressBar from "../components/ProgessBar";
import StatPill from "../components/StatPill";
import UpgradeCard from "../components/UpgradeCard";
import FloatingText from "../components/FloatingText";
import BottomBar from "../components/BottomBar";
import AchievementsModal from "../components/AchievementsModal";
import InventoryModal from "../components/InventoryModal";
import PrestigeModal from "../components/PrestigeModal";
import ResearchModal from "../components/ResearchModal";
import SettingsModal from "../components/SettingsModal";
import useCpsTicker from "../hooks/useCpsTicker";
import * as ECON from "../services/economy";

export default function HomeScreen() {
  const { state, dispatch, actions: A, notify, clearState } = useGame();
  useCpsTicker(state, dispatch, A, notify);

  const [floaters, setFloaters] = useState([]);
  const [showAch, setShowAch] = useState(false);
  const [showInv, setShowInv] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Haptics helpers
  const hOn = state.settings?.hapticsEnabled && Platform.OS !== "web";
  const lastTapH = useRef(0);
  const impact = async (style) => { if (hOn) try { await Haptics.impactAsync(style); } catch {} };
  const notifyH = async (type) => { if (hOn) try { await Haptics.notificationAsync(type); } catch {} };

  // Costs
  const multLevel = state.upgrades.multiplier.level;
  const autoLevel = state.upgrades.autoclick.level;
  const multC = ECON.multCost(state.upgrades.multiplier.baseCost, multLevel);
  const autoC = ECON.autoCost(state.upgrades.autoclick.baseCost, autoLevel);

  const upgrades = [
    {
      key: "mult",
      title: "Bigger Bite (+1 per tap)",
      description: `Increase food per tap by 1 (current: ${state.perTap})`,
      cost: multC,
      onBuy: async () => { await impact(Haptics.ImpactFeedbackStyle.Medium); dispatch({ type: A.BUY_MULT }); },
      affordable: state.coins >= multC,
      level: multLevel,
    },
    {
      key: "auto",
      title: "Auto-Feeder (+1 food/s)",
      description: `Gain 1 food/sec passively (current: ${state.cps}/s)`,
      cost: autoC,
      onBuy: async () => { await impact(Haptics.ImpactFeedbackStyle.Medium); dispatch({ type: A.BUY_AUTO }); },
      affordable: state.coins >= autoC,
      level: autoLevel,
    },
  ];

  const onFeed = async () => {
    const outcome = ECON.computeTapOutcome(state, Date.now());
    // haptic tier: crit = medium, normal = light (rate-limited)
    const now = Date.now();
    if (outcome.isCrit) await impact(Haptics.ImpactFeedbackStyle.Medium);
    else if (now - lastTapH.current > 90) { lastTapH.current = now; await impact(Haptics.ImpactFeedbackStyle.Light); }

    const label = `+${format(outcome.amount)}${outcome.isCrit ? " ✨CRIT" : ""}${
      outcome.comboMul > 1 ? ` x${outcome.comboMul.toFixed(2)}` : ""
    }`;
    const id = Math.random().toString(36).slice(2);
    setFloaters((arr) => [...arr, { id, label }]);
    dispatch({
      type: A.FEED_TAP,
      payload: { amount: outcome.amount, nextCombo: outcome.nextCombo, isCrit: outcome.isCrit },
      notify,
    });
  };

  // Toast for newly unlocked achievements (+ haptic)
  useEffect(() => {
    const pending = state.achievements?.lastUnlocked || [];
    if (!pending.length) return;
    notifyH(Haptics.NotificationFeedbackType.Success);
    const lines = pending.map((a) => `• ${a.title}`).join("\n");
    const rewards = pending
      .map((a) => {
        const r = a.reward || {};
        const tokenTxt = r.tokens ? `+${r.tokens} token${r.tokens > 1 ? "s" : ""}` : "";
        const boostsTxt = r.boosts ? Object.entries(r.boosts).map(([k, v]) => `+${v} ${k}`).join(", ") : "";
        return [tokenTxt, boostsTxt].filter(Boolean).join(", ");
      })
      .filter(Boolean);
    const rewardLine = rewards.length ? `\n${rewards.join("\n")}` : "";
    Alert.alert("Achievement unlocked!", `${lines}${rewardLine}`);
    dispatch({ type: A.CLEAR_ACH_NOTICES });
  }, [state.achievements?.lastUnlocked?.length]);

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 100, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: "white", textAlign: "center", marginTop: 30 }}>
        Animal Feeder+
      </Text>

      <AnimalHeader animalIndex={state.animalIndex} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
        <StatPill label="Food" value={format(state.coins)} />
        <StatPill label="/tap" value={state.perTap} />
        <StatPill label="/s" value={state.cps} />
      </View>

      {/* Floating juice overlay */}
      <View style={{ height: 0, alignItems: "center" }}>
        {floaters.map((f) => (
          <FloatingText
            key={f.id}
            id={f.id}
            text={f.label}
            onDone={(id) => setFloaters((arr) => arr.filter((x) => x.id !== id))}
          />
        ))}
      </View>

      {/* Glow increases as bar nears full */}
      <BigButton
        glow={state.foodRequired > 0 ? (state.foodFed / state.foodRequired > 0.95 ? 1 : 0) : 0}
        onPress={onFeed}
      />

      <ProgressBar fed={state.foodFed} required={state.foodRequired} />

      {/* Upgrades */}
      <Text style={{ color: colors.info, fontWeight: "700", marginTop: 6, marginBottom: 4 }}>Upgrades</Text>
      <FlatList
        data={upgrades}
        keyExtractor={(i) => i.key}
        renderItem={({ item }) => (
          <UpgradeCard
            title={item.title}
            description={item.description}
            level={item.level}
            cost={item.cost}
            affordable={item.affordable}
            onBuy={item.onBuy}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Bottom navigation */}
      <BottomBar
        onAchievements={() => setShowAch(true)}
        onInventory={() => setShowInv(true)}
        onPrestige={() => setShowPrestige(true)}
        onResearch={() => setShowResearch(true)}
        onSettings={() => setShowSettings(true)}
      />

      {/* Modals */}
      <AchievementsModal visible={showAch} onClose={() => setShowAch(false)} state={state} />

      <InventoryModal
        visible={showInv}
        onClose={() => setShowInv(false)}
        state={state}
        onActivate={async (kind) => { await impact(Haptics.ImpactFeedbackStyle.Medium); dispatch({ type: A.ACTIVATE_BOOST, kind }); }}
      />

      <PrestigeModal
        visible={showPrestige}
        onClose={() => setShowPrestige(false)}
        state={state}
        onSpend={async () => { await impact(Haptics.ImpactFeedbackStyle.Medium); dispatch({ type: A.BUY_PRESTIGE_UPGRADE }); }}
        onPrestige={async (tokens) => { await notifyH(Haptics.NotificationFeedbackType.Success); dispatch({ type: A.PRESTIGE, payload: { tokensEarned: tokens } }); }}
        onTotalReset={() => {
          clearState?.();
          dispatch({ type: A.RESET });
        }}
      />

      <ResearchModal
        visible={showResearch}
        onClose={() => setShowResearch(false)}
        state={state}
        onBuy={async (key) => { await impact(Haptics.ImpactFeedbackStyle.Medium); dispatch({ type: A.BUY_RESEARCH, key }); }}
      />

      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        hapticsEnabled={state.settings?.hapticsEnabled}
        onToggleHaptics={() => dispatch({ type: A.TOGGLE_HAPTICS })}
      />
    </View>
  );
}
