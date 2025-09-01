import React from 'react';
import { Modal, View, Text, FlatList } from 'react-native';
import { colors } from '../constants/colors';
import { ANIMALS } from '../constants/animals';

export default function CompendiumModal({ visible, onClose, compendium }) {
    const entries = compendium?.entries || {};
    const data = ANIMALS.map((a, idx) => {
        const e = entries[idx] || { count: 0, shiny: 0 };
        return { idx, name: a.name, emoji: a.emoji, count: e.count || 0, shiny: e.shiny || 0 };
    });

    return (
        <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '85%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Compendium</Text>
                        <Text onPress={onClose} style={{ color: 'white', fontWeight: '800', backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>Close</Text>
                    </View>

                    <Text style={{ color: colors.text, marginBottom: 8 }}>
                        Discovered: {data.filter(d => d.count > 0).length}/{data.length} • Shinies: {compendium?.shiniesTotal || 0}
                    </Text>

                    <FlatList
                        data={data}
                        keyExtractor={(i) => String(i.idx)}
                        numColumns={3}
                        columnWrapperStyle={{ gap: 8 }}
                        renderItem={({ item }) => (
                            <Card name={item.name} emoji={item.emoji} count={item.count} shiny={item.shiny} />
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                    />
                </View>
            </View>
        </Modal>
    );
}

function Card({ name, emoji, count, shiny }) {
    const seen = count > 0;
    return (
        <View style={{ flex: 1, backgroundColor: seen ? '#0b1220' : '#0b1220aa', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: seen ? '#1f2937' : '#0f172a' }}>
            <Text style={{ fontSize: 24, textAlign: 'center', opacity: seen ? 1 : 0.5 }}>{emoji}</Text>
            <Text style={{ color: 'white', fontWeight: '800', textAlign: 'center', marginTop: 6 }} numberOfLines={1}>
                {name}
            </Text>
            <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 12, marginTop: 2 }}>
                {seen ? `Seen ${count}x` : '-'}
            </Text>
            {shiny > 0 ? (
                <Text style={{ color: '#f59e0b', textAlign: 'center', fontSize: 12, marginTop: 2 }}>✨ Shiny {shiny}×</Text>
            ) : null}
        </View>
    );
}