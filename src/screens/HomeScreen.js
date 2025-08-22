import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useGame } from "../state/GameContext";
import { colors } from "../constants/colors";
import { format } from "../utils/format";
import AnimalHeader from "../components/AnimalHeader";
import BigButton from "../components/BigButton";
import ProgressBar from "../components/ProgessBar";
import StatPill from "../components/StatPill";
import UpgradeCard from "../components/UpgradeCard";
import FloatingText from "../components/FloatingText";
import useCpsTicker from "../hooks/useCpsTicker";
import { biomeBonus, getCurrentBiome, computeTapOutcome, multCost, autoCost, tokensForRun } from "../services/economy";

export default function HomeScreen() {
  const { state, dispatch, actions: A, notify } = useGame();
  useCpsTicker(state, dispatch, A, notify);

  const [floaters, setFloaters] = useState([]);

  // Costs
  const multLevel = state.upgrades.multiplier.level;
  const autoLevel = state.upgrades.autoclick.level;
  const multC = multCost(state.upgrades.multiplier.baseCost, multLevel);
  const autoC = autoCost(state.upgrades.autoclick.baseCost, autoLevel);

  const upgrades = [
    {
      key: "mult",
      title: "Bigger Bite (+1 per tap)",
      description: `Increase food per tap by 1 (current: ${state.perTap})`,
      cost: multC,
      onBuy: () => dispatch({ type: A.BUY_MULT }),
      affordable: state.coins >= multC,
      level: multLevel,
    },
    {
      key: "auto",
      title: "Auto-Feeder (+1 food/s)",
      description: `Gain 1 food/sec passively (current: ${state.cps}/s)` ,
      cost: autoC,
      onBuy: () => dispatch({ type: A.BUY_AUTO }),
      affordable: state.coins >= autoC,
      level: autoLevel,
    },
  ];

  const currentBiome = getCurrentBiome(state);
  const biomeBonusPct = Math.round((biomeBonus(state, currentBiome) || 0) * 100);

  const onFeed = () => {
    const outcome = computeTapOutcome(state, Date.now());
    // floating juice
    const label = `+${format(outcome.amount)}${outcome.isCrit ? " ✨CRIT" : ""}${outcome.comboMul > 1 ? ` x${outcome.comboMul.toFixed(2)}` : ""}`;
    const id = Math.random().toString(36).slice(2);
    setFloaters((arr) => [...arr, { id, label }]);
    dispatch({ type: A.FEED_TAP, payload: { amount: outcome.amount, nextCombo: outcome.nextCombo }, notify });
  };

  const projectedTokens = tokensForRun(state.runTotalFed);

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 28, fontWeight: "800", color: "white", textAlign: "center", marginTop: 4 }}>Animal Feeder+</Text>

      <AnimalHeader animalIndex={state.animalIndex} biomeBonus={(biomeBonus(state, currentBiome) || 0)} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
        <StatPill label="Food" value={format(state.coins)} />
        <StatPill label="/tap" value={state.perTap} />
        <StatPill label="/s" value={state.cps} />
      </View>

      {/* Floating juice overlay */}
      <View style={{ height: 0, alignItems: "center" }}>
        {floaters.map((f) => (
          <FloatingText key={f.id} id={f.id} text={f.label} onDone={(id) => setFloaters((arr) => arr.filter((x) => x.id !== id))} />
        ))}
      </View>

      {/* Glow increases as bar nears full */}
      <BigButton glow={state.foodRequired > 0 ? state.foodFed / state.foodRequired > 0.95 ? 1 : 0 : 0} onPress={onFeed} />

      <ProgressBar fed={state.foodFed} required={state.foodRequired} />

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
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Sanctuary / Prestige */}
      <View style={{ marginTop: 12, padding: 12, backgroundColor: colors.card, borderRadius: 16 }}>
        <Text style={{ color: "white", fontWeight: "800", marginBottom: 6 }}>Sanctuary (Prestige)</Text>
        <Text style={{ color: colors.textDim }}>Tokens: {state.prestige.tokens}</Text>
        <Text style={{ color: colors.textDim, marginBottom: 8 }}>Projected if you prestige now: {projectedTokens}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => dispatch({ type: A.BUY_PRESTIGE_UPGRADE })}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Spend 1 token → +2% Global</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch({ type: A.PRESTIGE, payload: { tokensEarned: projectedTokens } })}
            style={{ backgroundColor: colors.warning, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Prestige Now</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textDim, marginTop: 6 }}>Global bonus: +{(state.prestige.upgrades.globalFoodLevel * 2)}%</Text>
      </View>

      <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 10, fontSize: 12 }}>
        Biome bonus in {currentBiome}: +{biomeBonusPct}% CPS · Tokens: {state.prestige.tokens}
      </Text>
    </View>
  );
}
