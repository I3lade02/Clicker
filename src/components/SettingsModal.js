import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, Platform } from "react-native";
import { colors } from "../constants/colors";

/**
 * Props:
 * - visible, onClose
 * - hapticsEnabled, onToggleHaptics
 * - sfxEnabled, onToggleSfx
 * - sfxVolume (0..1), onChangeVolume(v)
 * - hapticsProfile ("subtle" | "default" | "arcade"), onSetHapticsProfile(p)
 * - lowMotion, colorblindSafe, largeTapTarget
 * - onToggleLowMotion, onToggleColorblind, onToggleLargeTap
 * - onExportSave, onImportSave
 */
export default function SettingsModal(props) {
  const hSupported = Platform.OS !== "web";
  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 }}>
          <Header onClose={props.onClose} />

          {/* Sound effects */}
          <Row>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Sound effects</Text>
              <Text style={{ color: colors.textDim, marginTop: 2 }}>Audio feedback for taps, crits, events, boss fights.</Text>
            </View>
            <Checkbox checked={!!props.sfxEnabled} onToggle={props.onToggleSfx} />
          </Row>

          {/* Volume */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 8 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>SFX Volume</Text>
            <Text style={{ color: colors.textDim, marginTop: 2 }}>Adjust click/crit/boss sound levels.</Text>
            <VolumeSlider
              value={props.sfxVolume ?? 1}
              onChange={props.onChangeVolume}
              disabled={!props.sfxEnabled}
              style={{ marginTop: 10 }}
            />
          </View>

          {/* Haptics */}
          <Row style={{ marginTop: 8, opacity: hSupported ? 1 : 0.6 }}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ color: "white", fontWeight: "800" }}>Haptics</Text>
              <Text style={{ color: colors.textDim, marginTop: 2 }}>
                {hSupported ? "Vibration feedback for taps, crits, evolves, etc." : "Not supported on this platform."}
              </Text>
            </View>
            <Checkbox checked={!!props.hapticsEnabled && hSupported} onToggle={props.onToggleHaptics} disabled={!hSupported} />
          </Row>

          {/* Haptics profile */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 8 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Haptics Profile</Text>
            <Text style={{ color: colors.textDim, marginTop: 2 }}>Choose intensity & feel.</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              {["subtle", "default", "arcade"].map((p) => (
                <TouchableOpacity
                  key={p}
                  onPress={() => props.onSetHapticsProfile?.(p)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                    backgroundColor: props.hapticsProfile === p ? colors.primary : "#334155",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "800", textTransform: "capitalize" }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Accessibility */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 8 }}>
            <Text style={{ color: "white", fontWeight: "800", marginBottom: 6 }}>Accessibility</Text>
            <Check label="Low motion (reduce animations)" checked={!!props.lowMotion} onToggle={props.onToggleLowMotion} />
            <Check label="Colorblind-safe crit cues" checked={!!props.colorblindSafe} onToggle={props.onToggleColorblind} />
            <Check label="Large tap target" checked={!!props.largeTapTarget} onToggle={props.onToggleLargeTap} />
          </View>

          {/* Cloud save */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginTop: 8 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Cloud Save (manual)</Text>
            <Text style={{ color: colors.textDim, marginTop: 2 }}>Export your save to iCloud/Drive/Files and import on another device.</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <TouchableOpacity onPress={props.onExportSave} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>Export</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={props.onImportSave} style={{ backgroundColor: "#475569", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
                <Text style={{ color: "white", fontWeight: "800" }}>Import</Text>
              </TouchableOpacity>
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
        width: 26,
        height: 26,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: checked ? "#a5b4fc" : "#475569",
        backgroundColor: checked ? "#6366f1" : "transparent",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {checked ? <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>✓</Text> : null}
    </TouchableOpacity>
  );
}

/** Labeled checkbox row */
function Check({ label, checked, onToggle }) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
      <Checkbox checked={checked} onToggle={onToggle} />
      <Text style={{ color: "white", marginLeft: 10 }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Lightweight volume slider */
function VolumeSlider({ value = 1, onChange, disabled, style }) {
  const [width, setWidth] = useState(1);
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const pct = clamp(value);

  const handle = (x) => clamp(x / Math.max(1, width));

  const onResponder = (evt) => {
    if (disabled) return;
    onChange && onChange(handle(evt.nativeEvent.locationX || 0));
  };
  const onMove = (evt) => {
    if (disabled) return;
    onChange && onChange(handle(evt.nativeEvent.locationX || 0));
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
      <View
        style={{
          position: "absolute",
          left: Math.max(0, fillW - 10),
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "white",
          top: 8,
          borderWidth: 2,
          borderColor: colors.primary,
        }}
      />
      <Text style={{ color: colors.textDim, marginTop: 6, alignSelf: "flex-end", fontWeight: "800" }}>
        {Math.round(pct * 100)}%
      </Text>
    </View>
  );
}
