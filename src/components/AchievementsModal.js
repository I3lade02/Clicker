import React, { useMemo, useState } from "react";
import { Modal, View, Text, TouchableOpacity, FlatList } from "react-native";
import { colors } from "../constants/colors";
import { ACHIEVEMENTS } from "../constants/achievements";
import { statValueFor } from "../services/achievements";
import AchievementRow from "./AchievementRow";

export default function AchievementsModal({ visible, onClose, state }) {
  const [filter, setFilter] = useState("all"); // all | locked | unlocked
  const unlocked = state.achievements?.unlocked || {};

  const data = useMemo(() => {
    const rows = ACHIEVEMENTS.map(a => {
      const value = statValueFor(state, a.type);
      const unlockedAt = unlocked[a.key];
      return { ...a, value, unlockedAt };
    });

    let filtered = rows;
    if (filter === "locked")   filtered = rows.filter(r => !r.unlockedAt);
    if (filter === "unlocked") filtered = rows.filter(r => !!r.unlockedAt);

    return filtered.sort((x, y) => {
      if (!!x.unlockedAt && !!y.unlockedAt) return (y.unlockedAt || 0) - (x.unlockedAt || 0);
      if (!!x.unlockedAt) return 1;
      if (!!y.unlockedAt) return -1;
      const px = x.threshold > 0 ? x.value / x.threshold : 0;
      const py = y.threshold > 0 ? y.value / y.threshold : 0;
      return py - px;
    });
  }, [state, filter]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "85%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Achievements</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
            {["all","locked","unlocked"].map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)}
                style={{ backgroundColor: filter === f ? colors.primary : "#334155", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 }}>
                <Text style={{ color: "white", fontWeight: "800", textTransform: "capitalize" }}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={data}
            keyExtractor={(i) => i.key}
            renderItem={({ item }) => (
              <AchievementRow
                title={item.title}
                desc={item.desc}
                value={item.value}
                threshold={item.threshold}
                unlockedAt={item.unlockedAt}
              />
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        </View>
      </View>
    </Modal>
  );
}
