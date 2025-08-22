import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

export default function FloatingText({ id, text, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -40, duration: 700, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start(() => onDone && onDone(id));
  }, []);

  return (
    <Animated.View style={{ position: "absolute", alignSelf: "center", transform: [{ translateY }], opacity }}>
      <Text style={{ color: "white", fontWeight: "900" }}>{text}</Text>
    </Animated.View>
  );
}
