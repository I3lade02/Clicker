import React from "react";
import { View, Text } from "react-native";
import { colors } from "../constants/colors";
import { format } from "../utils/format";

export default function ProgressBar({ fed, required }) {
  const progress = Math.max(0, Math.min(1, required > 0 ? fed / required : 0));
  return (
    <View style={{ alignItems: "center", marginBottom: 8 }}>
      <View style={{ width: "100%", height: 16, backgroundColor: colors.surface, borderRadius: 999, overflow: "hidden" }}>
        <View style={{ height: "100%", width: `${progress * 100}%`, backgroundColor: colors.bar }} />
      </View>
      <Text style={{ color: colors.textDim, marginTop: 6, fontWeight: "700" }}>
        {format(fed)} / {format(required)} food
      </Text>
    </View>
  );
}