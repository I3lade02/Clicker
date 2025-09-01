import React, { useMemo, useRef, useState } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";
import { Platform } from "react-native";

export default function SettingsModal({
  visible,
  onClose,
  hapticsEnabled,
  onToggleHaptics,
  sfxEnabled,
  onToggleSfx,
  sfxVolume = 1,
  onChangeVolume,
}) {
  const hSupported = Platform.OS !== "web";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <Header onClose={onClose} />

          {/* Sound effects (checkbox) */}
          <Row>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Sound effects</Text>
              <Text style={{ color: colors.textDim, marginTop: 2 }}>
                Audio feedback for taps, crits, events, boss fights.
              </Text>
            </View>
            <Checkbox checked={!!sfxEnabled} onToggle={onToggleSfx} />
          </Row>

          {/* SFX Volume slider */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 8 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>SFX Volume</Text>
            <Text style={{ color: colors.textDim, marginTop: 2 }}>Adjust click/crit/boss sound levels.</Text>
            <VolumeSlider
              value={sfxVolume}
              onChange={onChangeVolume}
              disabled={!sfxEnabled}
              style={{ marginTop: 10 }}
            />
          </View>

          {/* Haptics (checkbox) */}
          <Row style={{ marginTop: 8, opacity: hSupported ? 1 : 0.6 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Haptics</Text>
              <Text style={{ color: colors.textDim, marginTop: 2 }}>
                {hSupported ? "Vibration feedback for taps, crits, evolves, etc." : "Not supported on this platform."}
              </Text>
            </View>
            <Checkbox checked={!!hapticsEnabled && hSupported} onToggle={onToggleHaptics} disabled={!hSupported} />
          </Row>

          <Text style={{ color: colors.textDim, marginTop: 8, fontSize: 12, textAlign: "center" }}>
            Changes are saved automatically.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

/* ---------- UI bits ---------- */

function Header({ onClose }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>Settings</Text>
      <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#334155", borderRadius: 10 }}>
        <Text style={{ color: "white", fontWeight: "800" }}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ children, style }) {
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, flexDirection: "row", alignItems: "center" }, style]}>
      {children}
    </View>
  );
}

/** Minimal checkbox (tick box) without extra libs */
function Checkbox({ checked, onToggle, disabled }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={disabled ? undefined : onToggle}
      style={{
        width: 26, height: 26, borderRadius: 6,
        borderWidth: 2, borderColor: checked ? "#a5b4fc" : "#475569",
        backgroundColor: checked ? "#6366f1" : "transparent",
        alignItems: "center", justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {checked ? <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>✓</Text> : null}
    </TouchableOpacity>
  );
}

/** Lightweight volume slider: tap/drag to set value [0..1] */
function VolumeSlider({ value = 1, onChange, disabled, style }) {
  const [width, setWidth] = useState(1);
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const pct = clamp(value);

  const handlePosToVal = (x) => clamp(x / Math.max(1, width));

  const onResponder = (evt) => {
    if (disabled) return;
    const x = evt.nativeEvent.locationX || 0;
    onChange && onChange(handlePosToVal(x));
  };

  const onMove = (evt) => {
    if (disabled) return;
    const x = evt.nativeEvent.locationX || 0;
    onChange && onChange(handlePosToVal(x));
  };

  const fillW = Math.max(8, pct * width);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={onResponder}
      onResponderMove={onMove}
      style={[{ height: 36, justifyContent: "center", opacity: disabled ? 0.5 : 1 }, style]}
    >
      <View style={{ height: 8, borderRadius: 999, backgroundColor: "#0b1220", overflow: "hidden" }}>
        <View style={{ height: "100%", width: fillW, backgroundColor: colors.primary }} />
      </View>
      {/* Thumb */}
      <View style={{
        position: "absolute",
        left: Math.max(0, fillW - 10),
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: "white",
        top: 8,
        borderWidth: 2, borderColor: colors.primary,
      }} />
      <Text style={{ color: colors.textDim, marginTop: 6, alignSelf: "flex-end", fontWeight: "800" }}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}
