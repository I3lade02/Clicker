import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { colors } from '../constants/colors';

export default function BigButton({ label = 'FEED', onPress}) {
    const scale = useRef(new Animated.Value(1)).current;
    const tapAnim = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.93, duration: 70, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4 }),
        ]).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }], marginVertical: 12 }}>
            <TouchableOpacity style={{ backgroundColor: colors.accent, borderRadius: 9999, paddingVertical: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 }} activeOpacity={0.9} onPress={() => { tapAnim(); onPress && onPress(); }}>
                <Text style={{ color: colors.accentDark, fontSize: 32, fontWeight: '900', letterSpacing: 2 }}>{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}