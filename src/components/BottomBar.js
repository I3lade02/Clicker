import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { colors } from "../constants/colors";

export default function BottomBar({
  onAchievements,
  onInventory,
  onPrestige,
  onResearch,
  onCompendium,
  onArtifacts,
  onSettings,
  barColor,
}) {
  const bg = colors.bg;

  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: bg, paddingTop: 8, paddingBottom: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        <Item label="Trophies" emoji="🏆" onPress={onAchievements} />
        <Item label="Inventory" emoji="🎒" onPress={onInventory} />
        <Item label="Prestige" emoji="🏛️" onPress={onPrestige} />
        <Item label="Research" emoji="🔬" onPress={onResearch} />
        <Item label="Compendium" emoji="📘" onPress={onCompendium} />
        <Item label="Artifacts" emoji="🧿" onPress={onArtifacts} />
        <Item label="Settings" emoji="⚙️" onPress={onSettings} />
      </View>
    </View>
  );
}

function Item({ emoji, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.8}>
      <Text style={{ fontSize: 18, color: 'white' }}>{emoji}</Text>
      <Text numberOfLines={1} style={{ color: colors.text, fontWeight: "800", fontSize: 12, marginTop: 2 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
