import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

export default function InventoryModal({ visible, onClose, state, onActivate }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible]);

  const left = (until) => Math.max(0, Math.ceil(((until || 0) - now) / 1000));

  const inv = state.boosts?.inventory || {};
  const active = state.boosts?.active || { doubleBiteUntil: 0, turboFeederUntil: 0 };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Inventory</Text>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 10 }}>
            <Row
              title="Double Bite"
              subtitle="×2 food per tap for 30s"
              count={inv.doubleBite || 0}
              timer={active.doubleBiteUntil > now ? `${left(active.doubleBiteUntil)}s` : ""}
              onUse={() => onActivate("doubleBite")}
              color={colors.primary}
              timerActive={active.doubleBiteUntil > now}
            />
            <Row
              title="Turbo Feeder"
              subtitle="×2 food per second for 30s"
              count={inv.turboFeeder || 0}
              timer={active.turboFeederUntil > now ? `${left(active.turboFeederUntil)}s` : ""}
              onUse={() => onActivate("turboFeeder")}
              color={colors.accent}
              darkText
              timerActive={active.turboFeederUntil > now}
            />
          </View>

          <Text style={{ color: colors.textDim, marginTop: 8, fontSize: 12 }}>
            Tip: achievements sometimes grant boosts.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function Row({ title, subtitle, count, timer, onUse, color, darkText, timerActive }) {
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={{ color: "white", fontWeight: "800" }}>{title}</Text>
          <Text style={{ color: colors.textDim, marginTop: 2 }}>{subtitle}</Text>
          <Text style={{ color: colors.textDim, marginTop: 2, fontSize: 12 }}>
            Owned: {count} {timerActive ? `• Active: ${timer}` : ""}
          </Text>
        </View>
        <TouchableOpacity
          disabled={count <= 0}
          onPress={onUse}
          style={{
            backgroundColor: count > 0 ? color : "#475569",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: darkText ? "#052e16" : "white", fontWeight: "800" }}>
            {count > 0 ? "Activate" : "None"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
