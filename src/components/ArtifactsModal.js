import React from 'react';
import { Modal, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../constants/colors';
import { ARTIFACTS, ARTIFACT_IDS } from '../constants/artifacts';

export default function ArtifactsModal({ visible, onClose, bag, equipped, onEquip, onUnequip }) {
    const ownedIds = ARTIFACT_IDS.filter(id => (bag?.[id] || 0) > 0);

    return (
        <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '85%' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Artifacts</Text>
                        <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#334155', borderRadius: 10 }}>
                            <Text style={{ color: 'white', fontWeight: '800' }}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Equipped slots */}
                    <View style={{ backgroundColor: colors.surface, borderRadius:14, padding:12, marginBottom:10 }}>
                        <Text style={{ color:"white", fontWeight:"800", marginBottom:8 }}>Equipped (3)</Text>
                        <View style={{ flexDirection:"row", gap:8 }}>
                        {Array.from({ length: 3 }).map((_, idx) => {
                            const id = equipped?.[idx] || null;
                            const art = id ? ARTIFACTS[id] : null;
                            return (
                            <View key={idx} style={{ flex:1, backgroundColor:"#0b1220", borderRadius:12, padding:10, alignItems:"center", borderWidth:1, borderColor:"#1f2937" }}>
                                <Text style={{ color:"white", fontWeight:"800" }}>{art ? art.name : "Empty"}</Text>
                                <Text style={{ color: colors.textDim, fontSize:12, marginTop:4, textAlign:"center" }}>
                                {art ? art.desc : "Tap an artifact below to equip"}
                                </Text>
                                {art ? (
                                <TouchableOpacity onPress={() => onUnequip(idx)} style={{ marginTop:8, backgroundColor:"#475569", paddingHorizontal:10, paddingVertical:6, borderRadius:8 }}>
                                    <Text style={{ color:"white", fontWeight:"800" }}>Unequip</Text>
                                </TouchableOpacity>
                                ) : null}
                            </View>
                            );
                        })}
                        </View>
                    </View>

                    {/* Inventory */}
                    <Text style={{ color: colors.text, fontWeight:"900", marginBottom:6 }}>Inventory</Text>
                    <FlatList
                        data={ownedIds}
                        keyExtractor={(id)=>id}
                        renderItem={({ item:id }) => {
                            const art = ARTIFACTS[id];
                            const count = bag?.[id] || 0;
                            const alreadyEquipped = equipped?.includes(id);
                            return (
                                <View style={{ backgroundColor: colors.surface, borderRadius:14, padding:12, marginBottom:8 }}>
                                    <Text style={{ color:"white", fontWeight:"800" }}>{art.name} <Text style={{ color:"#a5b4fc" }}>x{count}</Text></Text>
                                    <Text style={{ color: colors.textDim, marginTop:4 }}>{art.desc}</Text>
                                    <View style={{ flexDirection:"row", justifyContent:"flex-end", marginTop:8 }}>
                                        <TouchableOpacity
                                            disabled={alreadyEquipped}
                                            onPress={() => onEquip(id)}
                                            style={{ backgroundColor: alreadyEquipped ? "#475569" : colors.primary, paddingHorizontal:12, paddingVertical:8, borderRadius:10 }}
                                        >
                                            <Text style={{ color:"white", fontWeight:"800" }}>{alreadyEquipped ? "Equipped" : "Equip"}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                    />
                </View>
            </View>
        </Modal>
    );
}
