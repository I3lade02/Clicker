import React from "react";
import { View, TouchableOpacity, Text, Platform } from "react-native";
import { colors } from "../constants/colors";

export default function BottomBar({ onAchievements, onInventory, onPrestige, onResearch, onSettings }) {
  return (
    <View
      style={{
        position: "absolute",
        left: 16,
        right: 16,
        bottom: Platform.OS === "ios" ? 24 : 16,
        backgroundColor: "#0b1220",
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1f2937",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 6,
      }}
    >
      <Item emoji="🏆" label="Achievements" onPress={onAchievements} />
      <Item emoji="🎒" label="Inventory" onPress={onInventory} />
      <Item emoji="🏛️" label="Prestige" onPress={onPrestige} />
      <Item emoji="🔬" label="Research" onPress={onResearch} />
      <Item emoji="⚙️" label="Settings" onPress={onSettings} />
    </View>
  );
}

function Item({ emoji, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: "center", padding: 6 }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
      <Text style={{ color: colors.text, fontWeight: "800", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
}
