import React from 'react';
import { View, TouchableOpacity, Text, Platform } from 'react-native';
import { colors } from '../constants/colors';

export default function BottomBar({ onAchievements, onInventory, onPrestige }) {
    return (
         <View
            style={{
                position: 'absolute',
                left: 16,
                right: 16, 
                bottom: Platform.OS === 'android' ? 24 : 16,
                backgroundColor: '#0b1220',
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#1f2937',
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 16,
                elevation: 6,
            }}
        >
            <TouchableOpacity onPress={onAchievements} style={{ alignItems: 'center', padding: 6 }}>
                <Text style={{ fontSize: 18 }}>🏆</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12, }}>Achievements</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onInventory} style={{ alignItems: 'center', padding: 6 }}>
                <Text style={{ fontSize: 18 }}>🎒</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPrestige} style={{ alignItems: 'center', padding: 6 }}>
                <Text style={{ fontSize: 18 }}>🏛️</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 12 }}>Prestige</Text>
            </TouchableOpacity>
        </View>
    );
}