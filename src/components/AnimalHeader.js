import React from 'react';
import { View, Text } from 'react-native';
import { ANIMALS } from '../constants/animals';
import { colors } from '../constants/colors';

export default function AnimalHeader({ animalIndex }) {
    const current = ANIMALS[animalIndex % ANIMALS.length];
    const next = ANIMALS[(animalIndex + 1) % ANIMALS.length];
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
            <Text style={{ fontSize: 36 }}>{current.emoji}</Text>
            <View style={{ alignItems: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>{current.name}</Text>
                <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}> {next.emoji} {next.name}</Text>
            </View>
        </View>
    );
}   