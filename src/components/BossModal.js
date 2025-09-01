import React, { useEffect, useState } from "react";
import { Modal, View, Text } from "react-native";
import { colors } from "../constants/colors";
import { BOSS_AFFIXES } from "../constants/affixes";

export default function BossModal({ visible, onClose, boss }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!visible) return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [visible]);

  const leftMs = Math.max(0, (boss?.endsAt || 0) - now);
  const left = Math.ceil(leftMs / 1000);
  const pct = boss?.hpMax ? Math.max(0, Math.min(1, (boss.hp / boss.hpMax))) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.6)", justifyContent:"center", padding:16 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 16 }}>
          <Text style={{ color:"white", fontWeight:"900", fontSize:18, marginBottom:8 }}>Boss Encounter</Text>

          {/* Affixes */}
          {!!(boss?.affixes?.length) && (
            <View style={{ marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: "800", marginBottom: 4 }}>Affixes</Text>
              {boss.affixes.map((k) => {
                const a = BOSS_AFFIXES[k];
                return <Text key={k} style={{ color: colors.textDim }}>• {a?.name}: {a?.desc}</Text>;
              })}
            </View>
          )}

          {/* Shield status */}
          {boss?.affixes?.includes("SHIELDED") ? (
            <Text style={{ color: boss.shieldOn ? "#f87171" : "#86efac", fontWeight: "800", marginBottom: 8 }}>
              {boss.shieldOn ? "Shielded: non-crit damage blocked" : "Vulnerable"}
            </Text>
          ) : null}

          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
            <Text style={{ color: "white", fontWeight: "800" }}>HP</Text>
            <View style={{ height: 12, backgroundColor: "#0b1220", borderRadius: 999, overflow:"hidden", marginTop: 6 }}>
              <View style={{ height: "100%", width: `${pct * 100}%` }} />
            </View>
            <Text style={{ color: colors.textDim, marginTop: 6 }}>{boss?.hp} / {boss?.hpMax}</Text>
            <Text style={{ color: "#fcd34d", fontWeight: "800", marginTop: 8 }}>Time Left: {left}s</Text>
          </View>

          {boss?.reward ? (
            <Text style={{ color: colors.text, marginTop: 10 }}>
              Reward: {boss.reward.tokens || 0} token(s)
              {boss.reward.boosts ? ` + ${Object.entries(boss.reward.boosts).map(([k,v]) => `${v} ${k}`).join(", ")}` : ""}
            </Text>
          ) : null}

          <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 8 }}>
            Keep tapping! Your taps and CPS target the boss automatically while this is open.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
