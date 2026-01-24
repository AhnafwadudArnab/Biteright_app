import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: "#E8F5E9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 6,
  },
  fill: {
    height: "100%",
    backgroundColor: "#43A047",
  },
});
