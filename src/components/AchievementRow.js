import React from 'react';
import { View, Text } from 'react-native';
import  { colors } from '../constants/colors';

export default function AchievementRow({ title, desc, value, threshold, unlockedAt }) {
    const pct = Math.max(0, Math.min(1, threshold > 0 ? value / threshold : 0));
    const unlocked = !!unlockedAt;

    return (
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: 'white', fontWeight: '800' }}>{title}</Text>
                <Text style={{ color: unlocked ? '#86efac' : colors.textDim, fontWeight: '700' }}>
                    {unlocked ? 'Unlocked' : `${value}/${threshold}`}
                </Text>
            </View>
            <Text style={{ color: colors.textDim, marginBottom: 8 }}>{desc}</Text>
            <View style={{ height: 10, backgroundColor: '#0b1220', borderRadius: 999, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${pct * 100}%`, backgroundColor: unlocked ? '#22c55e' : colors.primary }} />
            </View>
            {unlockedAt ? (
                <Text style={{ color: '#86efac', marginTop: 6, fontSize: 12 }}>
                    Unlocked: {new Date(unlockedAt).toLocaleString()}
                </Text>
            ) : null}
        </View>
    );
}