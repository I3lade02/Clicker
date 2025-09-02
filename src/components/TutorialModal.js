import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../constants/colors';

const STEPS = [
    { 
        title: 'Welcome!',
        body: 'Tap the big button to feed your animal. Crits and combos grant more food.',
    },
    {
        title: 'Upgrades',
        body: 'Buy upgrades with food. Purchases also reduce the progress bar toward the next animal.', 
    },
    {
        title: 'Prestige & Research',
        body: 'Prestige to earn tokens and Research Points for permanent boosts.',
    },
    {
        title: 'Events & Bosses',
        body: 'Watch for Feeding Frenzy and defeat bosses for rewards. GOOD LUCK!',
    },
];

export default function TutorialModal({ visible, onClose, onFinish }) {
    const [i, setI] = useState(0);
    const step = STEPS[i];

    const next = () => {
        if (i < STEPS.length - 1) setI(i + 1);
        else {
            onFinish?.();
            onClose?.();
        }
    };

    return (
        <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', padding: 16 }}>
                <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 18 }}>
                    <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>{step.title}</Text>
                    <Text style={{ color: colors.textDim, marginTop: 8 }}>{step.body}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                        <TouchableOpacity onPress={() => { onFinish?.(); onClose?.(); }}>
                            <Text style={{ color: '#93c5fd', fontWeight: '800' }}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={next} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                            <Text style={{ color: 'white', fontWeight: '800' }}>{i < STEPS.length - 1 ? 'Next' : 'Finish'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}