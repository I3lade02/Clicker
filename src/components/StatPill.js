import React from "react";
import { View, Text } from "react-native";
import { colors } from "../constants/colors";

export default function StatPill({ label, value }) {
  return (
    <View style={{ padding: 12, backgroundColor: colors.card, borderRadius: 16 }}>
      <Text style={{ color: colors.text, fontWeight: "700" }}>{label}: {value}</Text>
    </View>
  );
}