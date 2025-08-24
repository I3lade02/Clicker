import React from "react";
import { Modal, View, Text, TouchableOpacity, Alert } from "react-native";
import { colors } from "../constants/colors";
import * as ECON from "../services/economy";

export default function PrestigeModal({ visible, onClose, state, onSpend, onPrestige, onTotalReset }) {
  const projected = ECON.tokensForRun(state.runTotalFed);
  const bonusPct = (state.prestige?.upgrades?.globalFoodLevel || 0) * 2;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Sanctuary (Prestige)</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
            <Text style={{ color: colors.text, fontWeight: "800" }}>
              Tokens: {state.prestige.tokens}  •  Global Bonus: +{bonusPct}%
            </Text>
            <Text style={{ color: colors.textDim, marginTop: 6 }}>
              If you prestige now, you’ll earn <Text style={{ color: "white", fontWeight: "900" }}>{projected}</Text> token(s).
            </Text>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <TouchableOpacity
                onPress={onSpend}
                style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>Spend 1 token → +2% Global</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onPrestige(projected)}
                style={{ backgroundColor: colors.warning, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>Prestige Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              Alert.alert("Reset all progress?", "This clears your local save. This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Reset", style: "destructive", onPress: onTotalReset },
              ])
            }
            style={{ alignSelf: "center", marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#64748b" }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Total Reset</Text>
          </TouchableOpacity>

          <Text style={{ color: colors.textDim, marginTop: 8, fontSize: 12, textAlign: "center" }}>
            Prestige resets your run but keeps prestige upgrades.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
