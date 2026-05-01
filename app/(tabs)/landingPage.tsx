import { router } from "expo-router";
import { Award, BookOpen, ChevronRight, Droplets, Leaf, TrendingUp, Utensils } from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const GREEN = "#3BB273";
const DARK = "#0F172A";

const FEATURES = [
  {
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    icon: <BookOpen size={20} color={GREEN} />,
    title: "Personalized Diet Plans",
    desc: "AI-powered meal plans tailored to your goals and lifestyle.",
    bg: "#ECFDF5",
  },
  {
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    icon: <Utensils size={20} color="#F59E0B" />,
    title: "Smart Meal Tracking",
    desc: "Log meals effortlessly with detailed nutrition breakdown.",
    bg: "#FFFBEB",
  },
  {
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80",
    icon: <Droplets size={20} color="#3B82F6" />,
    title: "Hydration Tracking",
    desc: "Set goals, log water intake, and stay hydrated.",
    bg: "#EFF6FF",
  },
  {
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    icon: <TrendingUp size={20} color="#8B5CF6" />,
    title: "Health Insights",
    desc: "Visualize your progress with beautiful charts.",
    bg: "#F5F3FF",
  },
  {
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
    icon: <Award size={20} color="#EC4899" />,
    title: "Motivation & Rewards",
    desc: "Earn badges and streaks for staying consistent.",
    bg: "#FDF2F8",
  },
];

const STEPS = [
  { num: "01", title: "Create Profile", desc: "Tell us your goals and preferences", color: "#ECFDF5", numColor: GREEN },
  { num: "02", title: "Get Your Plan", desc: "Receive a personalized meal plan", color: "#EFF6FF", numColor: "#3B82F6" },
  { num: "03", title: "Track & Achieve", desc: "Log progress and hit your goals", color: "#F5F3FF", numColor: "#8B5CF6" },
];

export default function LandingPage() {
  // Hero animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(50)).current;
  const ctaScale = useRef(new Animated.Value(0.85)).current;
  const leafSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(ctaScale, { toValue: 1, tension: 60, friction: 7, delay: 400, useNativeDriver: true }),
    ]).start();

    // Gentle leaf pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(leafSpin, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(leafSpin, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const leafRotate = leafSpin.interpolate({ inputRange: [0, 1], outputRange: ["-8deg", "8deg"] });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── HERO ── */}
      <View style={styles.hero}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&q=80" }}
          style={StyleSheet.absoluteFillObject as any}
          blurRadius={3}
        />
        <View style={styles.heroOverlay} />

        <Animated.View style={[styles.heroContent, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <Animated.View style={[styles.logoIcon, { transform: [{ rotate: leafRotate }] }]}>
              <Leaf size={22} color="#fff" />
            </Animated.View>
            <Text style={styles.logoText}>BiteRight</Text>
          </View>

          <Text style={styles.heroTitle}>Right Bite,{"\n"}Right Life 🌿</Text>
          <Text style={styles.heroSub}>Your personal nutrition companion{"\n"}for a healthier, happier you</Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            {[["50K+", "Users"], ["1M+", "Meals"], ["4.8★", "Rating"]].map(([v, l]) => (
              <View key={l} style={styles.statPill}>
                <Text style={styles.statVal}>{v}</Text>
                <Text style={styles.statLabel}>{l}</Text>
              </View>
            ))}
          </View>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: ctaScale }] }}>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push("/login_signup/login")}
              activeOpacity={0.88}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <ChevronRight size={22} color={GREEN} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>

      {/* ── FEATURES ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Everything You Need</Text>
        <Text style={styles.sectionSub}>Powerful tools to help you reach your health goals</Text>
      </View>

      {FEATURES.map((f, i) => (
        <FeatureCard key={i} {...f} reverse={i % 2 !== 0} index={i} />
      ))}

      {/* ── HOW IT WORKS ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionSub}>Get started in 3 simple steps</Text>
      </View>

      <View style={styles.stepsContainer}>
        {STEPS.map((s, i) => (
          <StepCard key={i} {...s} />
        ))}
      </View>

      {/* ── FINAL CTA ── */}
      <View style={styles.finalCTA}>
        <View style={styles.finalLeafBg}>
          <Leaf size={80} color="rgba(255,255,255,0.08)" />
        </View>
        <Text style={styles.finalTitle}>Ready to Start?</Text>
        <Text style={styles.finalSub}>Join thousands achieving their goals</Text>
        <TouchableOpacity
          style={styles.finalBtn}
          onPress={() => router.push("/login_signup/signup")}
          activeOpacity={0.88}
        >
          <Text style={styles.finalBtnText}>Start Your Journey →</Text>
        </TouchableOpacity>
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Leaf size={16} color="#fff" />
          <Text style={styles.footerLogoText}>BiteRight</Text>
        </View>
        <Text style={styles.footerTag}>Right Bite, Right Life</Text>
      </View>
    </ScrollView>
  );
}

/* ── Feature Card with entrance animation ── */
function FeatureCard({ image, icon, title, desc, bg, reverse, index }: any) {
  const anim = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(reverse ? 40 : -40)).current;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(anim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 8, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.featureCard, { backgroundColor: bg, opacity: anim, transform: [{ translateX: slide }] }]}>
      <Image source={{ uri: image }} style={styles.featureImg} />
      <View style={styles.featureBody}>
        <View style={styles.featureIconWrap}>{icon}</View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </Animated.View>
  );
}

/* ── Step Card ── */
function StepCard({ num, title, desc, color, numColor }: any) {
  return (
    <View style={[styles.stepCard, { backgroundColor: color }]}>
      <Text style={[styles.stepNum, { color: numColor }]}>{num}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAF9" },

  // Hero
  hero: { height: H * 0.72, overflow: "hidden" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(10,30,20,0.52)" },
  heroContent: { flex: 1, padding: 28, paddingTop: 60, justifyContent: "flex-end", paddingBottom: 40 },
  logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  logoIcon: { backgroundColor: GREEN, padding: 10, borderRadius: 14, marginRight: 10 },
  logoText: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 0.5 },
  heroTitle: { color: "#fff", fontSize: 38, fontWeight: "900", lineHeight: 46, marginBottom: 12 },
  heroSub: { color: "rgba(255,255,255,0.82)", fontSize: 16, lineHeight: 24, marginBottom: 28 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 32 },
  statPill: {
    backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 8, alignItems: "center",
  },
  statVal: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 },
  ctaBtn: {
    backgroundColor: "#fff", flexDirection: "row", alignItems: "center",
    alignSelf: "flex-start", paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 16, gap: 6,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  ctaText: { color: GREEN, fontSize: 17, fontWeight: "800" },

  // Section
  section: { paddingHorizontal: 24, paddingTop: 36, paddingBottom: 8 },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: DARK, textAlign: "center" },
  sectionSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 6 },

  // Feature cards
  featureCard: {
    marginHorizontal: 20, marginBottom: 16, borderRadius: 20,
    overflow: "hidden", flexDirection: "row",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  featureImg: { width: 110, height: 110 },
  featureBody: { flex: 1, padding: 14, justifyContent: "center" },
  featureIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)", alignItems: "center",
    justifyContent: "center", marginBottom: 6,
  },
  featureTitle: { fontSize: 15, fontWeight: "700", color: DARK, marginBottom: 4 },
  featureDesc: { fontSize: 12, color: "#6B7280", lineHeight: 18 },

  // Steps
  stepsContainer: { paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  stepCard: {
    flexDirection: "row", alignItems: "center", borderRadius: 18,
    padding: 18, gap: 16,
  },
  stepNum: { fontSize: 28, fontWeight: "900", width: 44 },
  stepTitle: { fontSize: 16, fontWeight: "700", color: DARK },
  stepDesc: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  // Final CTA
  finalCTA: {
    backgroundColor: GREEN, margin: 20, borderRadius: 28,
    padding: 32, alignItems: "center", overflow: "hidden",
    marginTop: 28,
  },
  finalLeafBg: { position: "absolute", top: -10, right: -10 },
  finalTitle: { color: "#fff", fontSize: 26, fontWeight: "900", marginBottom: 8 },
  finalSub: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 24 },
  finalBtn: {
    backgroundColor: "#fff", paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 14,
  },
  finalBtnText: { color: GREEN, fontSize: 16, fontWeight: "800" },

  // Footer
  footer: { backgroundColor: "#0F172A", padding: 24, alignItems: "center" },
  footerLogo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  footerLogoText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footerTag: { color: "#64748B", fontSize: 13 },
});
