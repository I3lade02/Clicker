import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors } from '../constants/colors';
import { format } from '../utils/format';
import AnimalHeader from '../components/AnimalHeader';
import BigButton from '../components/BigButton';
import ProgressBar from '../components/ProgessBar';
import StatPill from '../components/StatPill';
import UpgradeCard from '../components/UpgradeCard';
import FloatingText from '../components/FloatingText';
import useCpsTicker from '../hooks/useCpsTicker';
import * as ECON from '../services/economy';

export default function HomeScreen() {
  const { state, dispatch, actions: A, notify, clearState } = useGame();
  useCpsTicker(state, dispatch, A, notify);

  const [floaters, setFloaters] = useState([]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  //costs
  const multLevel = state.upgrades.multiplier.level;
  const autoLevel = state.upgrades.autoclick.level;
  const multC = ECON.multCost(state.upgrades.multiplier.baseCost, multLevel);
  const autoC = ECON.autoCost(state.upgrades.autoclick.baseCost, autoLevel);

  const upgrades = [
    {
      key: 'mult',
      title: 'Bigger bite (+1 per tap)',
      description: `Increase food per tap by 1 (current: ${state.perTap})`,
      cost: multC,
      onBuy: () => dispatch({ type: A.BUY_MULT }),
      affordable: state.coins >= multC,
      level: multLevel,
    },
    {
      key: 'auto',
      title: 'Auto-Feeder (+1 food/s)',
      description: `Gain 1 food/sec passively (current: ${state.cps}/s)`,
      cost: autoC,
      onBuy: () => dispatch({ type: A.BUY_AUTO }),
      affordable: state.coins >= autoC,
      level: autoLevel,
    },
  ];

  const onFeed = () => {
    const outcome = ECON.computeTapOutcome(state, Date.now());
    const label = `+${format(outcome.amount)}${outcome.isCrit ? " ✨CRIT" : ""}${outcome.comboMul > 1 ? ` x${outcome.comboMul.toFixed(2)}` : ""}`;
    const id = Math.random().toString(36).slice(2);
    setFloaters((arr) => [...arr, { id, label }]);
    dispatch({
      type: A.FEED_TAP,
      payload: { amount: outcome.amount, nextCombo: outcome.nextCombo, isCrit: outcome.isCrit },
      notify,
    });
  };

  //Toast for newly unlocked achievements
  useEffect(() => {
    const pending = state.achievements?.lastUnlocked || [];
    if (!pending.length) return;
    const lines = pending.map((a) => `° ${a.title}`).join("\n");
    const rewards = pending
      .map((a) => {
        const r = a.reward || {};
        const tokenTxt = r.tokens ? `+${r.tokens} token${r.tokens > 1 ? "s" : ""}` : "";
        const boostsTxt = r.boostsTxt
          ? Object.entries(r.boosts)
            .map(([k, v]) => `+${v} ${k}`)
            .join(", ")
          : "";
          return [tokenTxt, boostsTxt].filter(Boolean).join(", ");
      })
      .filter(Boolean);
    const rewardLine = rewards.length ? `\n${rewards.join("\n")}` : "";
    Alert.alert("Achievement unlocked", `${lines}${rewardLine}`);
    dispatch({ type: A.CLEAR_ACH_NOTICES });
  }, [state.achievements?.lastUnlocked?.length]);

  const projectedTokens = ECON.tokensForRun(state.runTotalFed);

  //Helpers for inventory timers
  const left = (until) => Math.max(0, Math.ceil((until - now) / 1000));

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
      <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center', marginTop: 24 }}>Animal Feeder +</Text>

      <AnimalHeader animalIndex={state.animalIndex} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
        <StatPill label='Food' value={format(state.coins)} />
        <StatPill label='/tap' value={state.perTap} />
        <StatPill label='/s' value={state.cps} />
      </View>

      {/* Floating juice overlay */}
      <View style={{ height: 0, alignItems: 'center' }}>
        {floaters.map((f) => (
          <FloatingText
            key={f.id}
            id={f.id}
            text={f.label}
            onDone={(id) => setFloaters((arr) => arr.filter((x) => x.id !== id))}
          />
        ))}
      </View>

      {/* Glow increases as bars nears full */}
      <BigButton glow={state.foodRequired > 0 ? (state.foodFed / state.foodRequired > 0.95 ? 1 : 0) : 0} onPress={onFeed} />
      <ProgressBar fed={state.foodFed} required={state.foodRequired} />

      {/* Upgrades */}
      <Text style={{ color: colors.info, fontWeight: '700', marginTop: 6, marginBottom: 4 }}>Upgrades</Text>
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
        style={{ marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      {/* Inventory (boosts) */}
      <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.card, borderRadius: 16 }}>
        <Text style={{ color: 'white', fontWeight: '800', marginBottom: 8 }}>Inventory</Text>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity
            onPress={() => dispatch({ type: A.ACTIVE_BOOST, kind: 'doubleBite' })}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>
                Double Bite x {state.boosts.inventory.doubleBite || 0}
                {state.boosts.active.doubleBiteUntil > now ? ` . ${left(state.boosts.active.doubleBiteUntil)}s` : ""}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => dispatch({ type: A.ACTIVE_BOOST, kind: 'turboFeeder' })}
              style={{ backgroundColor: colors.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                <Text style={{ color: '#052e16', fontWeight: '800' }}>
                  Turbo Feeder x {state.boosts.inventory.turboFeeder || 0}
                  {state.boosts.active.turboFeederUntil > now ? ` . ${left(state.boosts.active.turboFeederUntil)}s` : ""}
                </Text>
              </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textDim, marginTop: 6, fontSize: 12 }}>
          Active a boost to power up for 30s
        </Text>
      </View>

      {/* Sanctuary / Prestige */}
      <View style={{ marginTop: 8, padding: 12, backgroundColor: colors.card, borderRadius: 16 }}>
        <Text style={{ color: 'white', fontWeight: '800', marginBottom: 6 }}>Sanctuary (Prestige)</Text>
        <Text style={{ color: colors.textDim }}>Tokens: {state.prestige.tokens}</Text>
        <Text style={{ color: colors.textDim, marginBottom: 8 }}>
          Projected if you prestige now: {projectedTokens}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <TouchableOpacity
            onPress={() => dispatch({ type: A.BUY_PRESTIGE_UPGRADE })}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>1 token ➡️ +2% global</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => dispatch({ type: A.PRESTIGE, payload: { tokensEarned: projectedTokens } })} style={{ backgroundColor: colors.warning, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ color: 'white', fontWeight: '800' }}>Prestige now</Text>
            </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textDim, marginTop: 6 }}>
          Global bonus: +{state.prestige.upgrades.globalFoodLevel * 2}%
        </Text>
      </View>

      {/* Reset */}
      <TouchableOpacity
        onPress={() => {
          Alert.alert("Reset all progress?", "This clears your local save. This cannot be undone", [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset',
              style: 'destructive',
              onPress: () => {
                clearState?.();               //wipe AsyncStorage
                dispatch({ type: A.RESET });  //reset in-memory state
              },
            },
          ]);
        }}
        style={{ alignSelf: 'center', marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: '#64748b' }}>
          <Text style={{ color: 'white', fontWeight: '800' }}>Total reset</Text>
        </TouchableOpacity>

        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 12 }}>
          Achievements grant tokens & boosts ° Purchases reduce the progress bar
        </Text>
    </View>
  );
}