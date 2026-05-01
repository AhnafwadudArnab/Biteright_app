import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingItemConfig = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  iconBg: string;
  onPress?: () => void;
};

// ─── Animated Item ────────────────────────────────────────────────────────────

type AnimatedSettingItemProps = SettingItemConfig & {
  delay: number;
  isLast: boolean;
};

const AnimatedSettingItem = ({
  icon,
  title,
  iconBg,
  onPress,
  delay,
  isLast,
}: AnimatedSettingItemProps) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.item, isLast && styles.itemLast]}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
              <Ionicons name={icon} size={18} color="#fff" />
            </View>
            <Text style={styles.itemText}>{title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#bbb" />
        </View>
      </TouchableWithoutFeedback>
      {!isLast && <View style={styles.divider} />}
    </Animated.View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────

const SETTINGS_ITEMS: SettingItemConfig[] = [
  {
    icon: "person-outline",
    title: "Account",
    iconBg: "#4CAF50",
    onPress: () => router.push("/Others/UserProfile"),
  },
  {
    icon: "fitness-outline",
    title: "Health & Goals",
    iconBg: "#FF7043",
    onPress: () => router.push("/Others/Settings_page files/health&goal"),
  },
  {
    icon: "notifications-outline",
    title: "Notifications",
    iconBg: "#FFA726",
    onPress: undefined,
  },
  {
    icon: "color-palette-outline",
    title: "App Preferences",
    iconBg: "#AB47BC",
    onPress: () => router.push("/Others/Settings_page files/App_pref"),
  },
  {
    icon: "lock-closed-outline",
    title: "Privacy & Security",
    iconBg: "#42A5F5",
    onPress: () => router.push("/Others/Settings_page files/Privacypolicy"),
  },
  {
    icon: "information-circle-outline",
    title: "About",
    iconBg: "#26A69A",
    onPress: () => router.push("/Others/Settings_page files/AboutScreen"),
  },
];

export default function SettingsScreen() {
  const headerSlide = useRef(new Animated.Value(-24)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.headerRow,
          { transform: [{ translateY: headerSlide }], opacity: headerOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={22} color="#222" />
        </TouchableOpacity>
        <Text style={styles.header}>Settings</Text>
      </Animated.View>

      {/* Card */}
      <View style={styles.card}>
        {SETTINGS_ITEMS.map((item, index) => (
          <AnimatedSettingItem
            key={item.title}
            {...item}
            delay={index * 80}
            isLast={index === SETTINGS_ITEMS.length - 1}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLast: {
    // no extra style needed; divider is omitted via isLast prop
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    fontSize: 15.5,
    color: "#222",
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#EBEBEB",
    marginLeft: 66, // aligns with text, after icon circle + gap
  },
});
