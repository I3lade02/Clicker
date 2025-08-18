import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { format } from "../utils/format";

export default function UpgradeCard({ title, description, level, cost, affordable, onBuy }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 16, padding: 12, gap: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "white", fontWeight: "800" }}>{title} <Text style={{ color: colors.lilac, fontWeight: "700", fontSize: 12 }}>Lv {level}</Text></Text>
        <Text style={{ color: colors.textDim, marginTop: 2 }}>{description}</Text>
      </View>
      <TouchableOpacity
        onPress={onBuy}
        disabled={!affordable}
        style={{ backgroundColor: affordable ? colors.primary : "#64748b", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 }}
      >
        <Text style={{ color: "white", fontWeight: "800" }}>Buy {format(cost)}</Text>
      </TouchableOpacity>
    </View>
  );
}