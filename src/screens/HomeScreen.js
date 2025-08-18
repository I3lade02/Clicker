import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useGame } from '../state/GameContext';
import { actions } from '../state/gameReducer';
import { format } from '../utils/format';
import { colors } from '../constants/colors';
import AnimalHeader from '../components/AnimalHeader';
import BigButton from '../components/BigButton';
import ProgressBar from '../components/ProgessBar';
import StatPill from '../components/StatPill';
import UpgradeCard from '../components/UpgradeCard';
import useCpsTicker from '../hooks/useCpsTicker';

export default function HomeScreen() {
    const { state, dispatch, actions: A, notify, clearState } = useGame();
    useCpsTicker(state, dispatch, A, notify);

    const multLevel = state.upgrades.multiplier.level;
    const autoLevel = state.upgrades.autoclick.level;
    const multCost = Math.floor(state.upgrades.multiplier.baseCost * Math.pow(1.55, multLevel));
    const autoCost = Math.floor(state.upgrades.autoclick.baseCost * Math.pow(1.6, autoLevel));

    const upgrades = [
        {
            key: 'mult',
            title: "Bigger Bite (+1 per tap)",
            description: `Increase food per tap by 1 (current: ${state.perTap})`,
            cost: multCost,
            onBuy: () => dispatch({ type: actions.BUY_MULT }),
            affordable: state.coins >= multCost,
            level: multLevel,
        },
        {
            key: 'auto',
            title: 'Auto-Feeder (+1 food/s)',
            description: `Gain 1 food/s passively (current: ${state.cps}/s)`,
            cost: autoCost,
            onBuy: () => dispatch({ type: actions.BUY_AUTO }),
            affordable: state.coins >= autoCost,
            level: autoLevel
        },
    ];

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: colors.bg }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center', marginTop: 4 }}>Animal Feeder +</Text>

            <AnimalHeader animalIndex={state.animalIndex} />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 }}>
                <StatPill label="Food" value={format(state.coins)} />
                <StatPill label='/tap' value={state.perTap} />
                <StatPill label='/s' value={state.cps} />
            </View>

            <BigButton onPress={() => dispatch({ type: actions.FEED_TAP, notify })} />

            <ProgressBar fed={state.foodFed} required={state.foodRequired} />

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
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                contentContainerStyle={{ paddingBottom: 24 }}
            />

            <TouchableOpacity
                onPress={() => {
                    clearState();
                    dispatch({ type: actions.RESET });
                }}
                style={{ alignSelf: 'center', marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.warning }}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>Reset Progress</Text>
                </TouchableOpacity>

                <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 12 }}>Animals evolve as you feed them 🐾</Text>
        </View>
    );
}