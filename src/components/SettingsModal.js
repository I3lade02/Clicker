import React from "react";
import { Modal, View, Text, TouchableOpacity, Switch, Platform } from "react-native";
import { colors } from "../constants/colors";

export default function SettingsModal({ visible, onClose, hapticsEnabled, onToggleHaptics }) {
  const supported = Platform.OS !== "web";
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>Haptics</Text>
                <Text style={{ color: colors.textDim, marginTop: 2 }}>{supported ? "Vibration feedback for taps, crits, evolves, etc." : "Not supported on this platform."}</Text>
              </View>
              <Switch value={hapticsEnabled && supported} onValueChange={onToggleHaptics} disabled={!supported} />
            </View>
          </View>

          <Text style={{ color: colors.textDim, marginTop: 8, fontSize: 12, textAlign: "center" }}>
            Changes are saved automatically.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
