import { router } from "expo-router";
import {
    Award,
    BookOpen,
    ChevronRight,
    Droplets,
    Leaf,
    Search,
    TrendingUp,
} from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface landingPageProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export default function LandingPage({
  onGetStarted,
  onLogin,
}: landingPageProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <View
        style={[
          styles.hero,
          {
            minHeight: Dimensions.get("window").height * 0.15,
            justifyContent: "space-between",
            // Add a subtle gradient background for a modern look
            backgroundColor: undefined,
          },
        ]}
      >
        {/* Gradient background overlay */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          }}
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: 0.6, resizeMode: "cover" },
          ]}
          blurRadius={2}
        />
        <View>
          <View style={styles.headerRow}>
            <View style={[styles.logo, { alignSelf: "center" }]}>
              <View style={styles.logoIcon}>
                <Leaf color="white" size={24} />
              </View>
              <Text style={styles.logoText}>BiteRight</Text>
            </View>

            {/* <TouchableOpacity onPress={onLogin} style={styles.loginBtn}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity> */}
          </View>
          <View style={{ height: 35 }} />
          <Text
            style={[styles.heroTitle, { fontWeight: "bold", letterSpacing: 1 }]}
          >
            Right Bite,{"\n"}Right Life
          </Text>
          <View style={{ height: 20 }} />
          <Text style={[styles.heroSubtitle, { fontSize: 18 }]}>
            Your personal nutrition companion{"\n"}for a healthier, happier you
          </Text>
          <View style={{ height: 100 }} />

          <TouchableOpacity
            style={[
              styles.ctaBtn,
              {
                shadowColor: "#3BB273",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              },
            ]}
            onPress={() => {
              router.push("/login_signup/login");
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, { fontWeight: "bold" }]}>
              Get Started
            </Text>
            <ChevronRight size={25} color="#3BB273" />
          </TouchableOpacity>
          <View style={styles.statsRow}>
            <StatBox value="50K+" label="Active Users" />
            <StatBox value="1M+" label="Meals Logged" />
            <StatBox value="4.8★" label="User Rating" />
          </View>
        </View>
      </View>

      {/* FEATURES */}
      <SectionTitle
        title="Everything You Need"
        subtitle="Powerful features to help you achieve your health goals"
      />

      <Feature
        image="https://i.postimg.cc/CKd4Kjr8/photo-1540921002383-b2a7ff6a716d.jpg"
        icon={<BookOpen size={24} color="#3BB273" />}
        title="Personalized Diet Plans"
        desc="AI-powered meal plans tailored to your goals, dietary preferences, and lifestyle."
      />

      <Feature
        image="https://i.postimg.cc/yYVcdmWp/photo-1649531794884-b8bb1de72e68.jpg"
        icon={<Search size={24} color="#3BB273" />}
        title="Smart Meal Tracking"
        desc="Effortlessly log your meals with detailed nutrition breakdown."
      />

      <Feature
        image="https://i.postimg.cc/85QrVW2P/photo-1565256080583-df488fd02195.jpg"
        icon={<Droplets size={24} color="#3BB273" />}
        title="Hydration Tracking"
        desc="Log water intake, set goals, and stay hydrated."
      />

      <Feature
        image="https://i.postimg.cc/t4s1Z2yb/photo-1570621936497-2b2ca5633cdb.jpg"
        icon={<TrendingUp size={24} color="#3BB273" />}
        title="Health Insights"
        desc="Visualize progress with charts and analytics."
      />

      <Feature
        image="https://i.postimg.cc/rwb39Frb/photo-1665088127661-83aeff6104c4.jpg"
        icon={<Search size={24} color="#3BB273" />}
        title="Ingredient Recipes"
        desc="Search recipes based on ingredients you already have."
      />

      <Feature
        image="https://i.postimg.cc/yx3CKgcF/photo-1669989179336-b2234d2878df.jpg"
        icon={<Award size={24} color="#3BB273" />}
        title="Motivation & Rewards"
        desc="Earn badges and streaks for consistency."
      />

      {/* HOW IT WORKS */}
      <SectionTitle
        title="How It Works"
        subtitle="Get started in 3 simple steps"
      />

      <Step
        number="1"
        title="Create Profile"
        desc="Tell us your goals and preferences"
      />
      <Step
        number="2"
        title="Get Plan"
        desc="Receive personalized meal plans"
      />
      <Step
        number="3"
        title="Track & Achieve"
        desc="Log progress and succeed"
      />

      {/* CTA */}
      <View style={styles.finalCTA}>
        <Leaf size={32} color="white" />
        <Text style={styles.finalTitle}>Ready to Start?</Text>
        <Text style={styles.finalSub}>
          Join thousands achieving their goals
        </Text>

        <TouchableOpacity style={styles.finalBtn} onPress={onGetStarted}>
          <Text style={styles.finalBtnText}  onPress={() => {
              router.push("/login_signup/signup");
            }}>Start Your Journey</Text>
          
        </TouchableOpacity>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Leaf size={18} color="white" />
          <Text style={styles.footerText}>BiteRight</Text>
        </View>
        <Text style={styles.footerTag}>Right Bite, Right Life</Text>
      </View>
      {/* Extra bottom space */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ---------- COMPONENTS ---------- */

interface FeatureProps {
  image: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const Feature = ({ image, icon, title, desc }: FeatureProps) => (
  <View style={styles.featureCard}>
    <Image source={{ uri: image }} style={styles.featureImage} />
    <View style={styles.featureContent}>
      {icon}
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

interface SectionTitleProps {
  title: string;
  subtitle: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSub}>{subtitle}</Text>
  </View>
);

interface StepProps {
  number: string;
  title: string;
  desc: string;
}

const Step = ({ number, title, desc }: StepProps) => (
  <View style={styles.step}>
    <Text style={styles.stepNum}>{number}</Text>
    <View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDesc}>{desc}</Text>
    </View>
  </View>
);

interface StatBoxProps {
  value: string;
  label: string;
}

const StatBox = ({ value, label }: StatBoxProps) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  hero: { backgroundColor: "#3BB273", padding: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between" },
  logo: { flexDirection: "row", alignItems: "center" },
  logoIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 20,
  },
  logoText: { color: "white", fontSize: 20, marginLeft: 8 },

  loginBtn: {
    borderWidth: 1,
    borderColor: "white",
    padding: 8,
    borderRadius: 10,
  },
  loginText: { color: "white" },

  heroTitle: {
    color: "white",
    fontSize: 32,
    textAlign: "center",
    marginTop: 20,
  },
  heroSubtitle: {
    color: "white",
    opacity: 0.9,
    textAlign: "center",
    marginVertical: 10,
  },

  ctaBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    padding: 13,
    borderRadius: 15,
    alignSelf: "center",
  },
  ctaText: { color: "#3BB273", fontSize: 20, marginRight: 6 },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  statBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 12,
    borderRadius: 15,
    width: "30%",
  },
  statValue: { color: "white", fontSize: 18, textAlign: "center" },
  statLabel: { color: "white", opacity: 0.8, textAlign: "center" },

  section: { padding: 20 },
  sectionTitle: { fontSize: 26, textAlign: "center" },
  sectionSub: { textAlign: "center", color: "#666", marginTop: 6 },

  featureCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
  },
  featureImage: { height: 180, width: "100%" },
  featureContent: { padding: 16 },
  featureTitle: { fontSize: 18, marginTop: 8 },
  featureDesc: { color: "#666", marginTop: 4 },

  step: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 15,
  },
  stepNum: {
    backgroundColor: "#3BB273",
    color: "white",
    width: 36,
    height: 36,
    textAlign: "center",
    borderRadius: 18,
    marginRight: 10,
    lineHeight: 36,
  },
  stepTitle: { fontSize: 18 },
  stepDesc: { color: "#666" },

  finalCTA: { backgroundColor: "#3BB273", padding: 30, alignItems: "center" },
  finalTitle: { color: "white", fontSize: 26, marginVertical: 10 },
  finalSub: { color: "white", opacity: 0.9 },
  finalBtn: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 20,
    marginTop: 15,
  },
  finalBtnText: { color: "#3BB273", fontSize: 16 },

  footer: { backgroundColor: "#111", padding: 20, alignItems: "center" },
  footerLogo: { flexDirection: "row", alignItems: "center" },
  footerText: { color: "white", marginLeft: 6 },
  footerTag: { color: "#aaa", marginTop: 6 },
});
