import React, { useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { colors } from "../constants/colors";
import { RESEARCH_NODES, RESEARCH_TRACKS, researchCostFor } from "../constants/research";

export default function ResearchModal({ visible, onClose, state, onBuy }) {
  const nodes = state.research?.nodes || {};
  const rp = state.research?.rp || 0;

  const grouped = useMemo(() => {
    const byTrack = Object.fromEntries(RESEARCH_TRACKS.map(t => [t, []]));
    Object.entries(RESEARCH_NODES).forEach(([key, meta]) => {
      const level = nodes[key] || 0;
      const cost = researchCostFor(key, level);
      byTrack[meta.track].push({ key, ...meta, level, cost });
    });
    RESEARCH_TRACKS.forEach(t => byTrack[t].sort((a,b)=>a.title.localeCompare(b.title)));
    return byTrack;
  }, [nodes]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "85%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Research</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 8 }}>RP: {rp}</Text>

          <FlatList
            data={RESEARCH_TRACKS}
            keyExtractor={(t)=>t}
            renderItem={({item: track}) => (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: colors.text, fontWeight: "900", marginBottom: 6 }}>{track}</Text>
                {grouped[track].map(n => (
                  <Row key={n.key} node={n} rp={rp} onBuy={onBuy} />
                ))}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function Row({ node, rp, onBuy }) {
  const atCap = node.level >= node.max;
  const cost = atCap ? "—" : node.cost;
  const can = !atCap && rp >= node.cost;

  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 8 }}>
      <Text style={{ color: "white", fontWeight: "800" }}>{node.title} <Text style={{ color: "#a5b4fc" }}>Lv {node.level}/{node.max}</Text></Text>
      <Text style={{ color: colors.textDim, marginTop: 2 }}>{node.desc}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: colors.textDim }}>Cost: {cost} RP</Text>
        <TouchableOpacity
          disabled={!can}
          onPress={() => onBuy(node.key)}
          style={{ backgroundColor: can ? colors.primary : "#475569", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>{can ? "Buy" : atCap ? "Maxed" : "Need RP"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
