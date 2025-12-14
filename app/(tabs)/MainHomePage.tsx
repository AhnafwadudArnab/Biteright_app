import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type ButtonProps = {
  iconName: IoniconName;
  text: string;
  color: string;
  onPress?: () => void;
  style?: any;
  textStyle?: any;
};

const Button: React.FC<ButtonProps> = ({
  iconName,
  text,
  color,
  onPress,
  style,
  textStyle,
}) => (
  <TouchableOpacity style={[styles.navItem, style]} onPress={onPress}>
    <Ionicons name={iconName} size={24} color={color} />
    <Text style={[styles.navText, { color }, textStyle]}>{text}</Text>
  </TouchableOpacity>
);

export default function MainHomePage() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 132 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: "transparent",
              //glass type

              borderRadius: 30,
              padding: 16,
              marginBottom: 20,
            },
          ]}
        >
          <View style={{ position: "relative" }}>
            <Text style={styles.welcome}>Welcome back!</Text>
            <Text style={styles.subtitle}>Your Diet Journey</Text>
            <View
              style={{
                flexDirection: "row",
                position: "absolute",
                top: 1,
                left: 290,
              }}
            >
              <TouchableOpacity style={{ marginRight: 12 }}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#8B5CF6"
                />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="settings-outline" size={24} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Calories Card */}
        <View style={styles.caloriesCard}>
          <Text style={styles.cardTitle}>Today's Calories</Text>
          <View style={styles.caloriesRow}>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>2000</Text>
              <Text style={styles.calorieLabel}>Goal</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>1200</Text>
              <Text style={styles.calorieLabel}>Consumed</Text>
            </View>
            <View style={styles.calorieItem}>
              <Text style={styles.calorieValue}>800</Text>
              <Text style={styles.calorieLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Personalized Diet Plan */}
        <Text style={styles.sectionTitle}>Personalized Diet Plan</Text>
        <View style={styles.planCard}>
          <View style={styles.planRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="restaurant" size={24} color="#219653" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>Your Custom Meal Plans</Text>
              <Text style={styles.planDesc}>
                AI-generated plans tailored to your goals
              </Text>
            </View>
          </View>
          <View style={styles.planActions}>
            <TouchableOpacity
              style={styles.planBtnOutline}
              onPress={() => {
                router.push("../Dietplans/gen_dietplans");
              }}
            >
              <Text style={styles.planBtnText}>Generate Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push("/Dietplans/Diet_Planner_Item");
              }}
              style={styles.planBtnFilled}
            >
              <Text style={styles.planBtnTextFilled}>View Plan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Meal Tracking */}
        <Text style={styles.sectionTitle}>Meal Tracking</Text>
        <View style={styles.mealCard}>
          <View style={styles.planRow}>
            <View style={[styles.iconCircle, { backgroundColor: "#FFD60022" }]}>
              <MaterialIcons name="show-chart" size={24} color="#FFD600" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>Track Your Meals</Text>
              <Text style={styles.planDesc}>
                Log meals and monitor your progress
              </Text>
            </View>
          </View>
          <View style={styles.planActions}>
            <TouchableOpacity
              style={[
                styles.mealBtnFilled,
                { alignItems: "center", justifyContent: "center" },
              ]}
            >
              <Text style={styles.mealBtnTextFilled}>+ Add Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mealBtnOutline}>
              <Text style={styles.mealBtnText}>View Logs</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => router.push("../Dietplans/weeklyPlans")}
            style={styles.quickActionBtn}
          >
            <Ionicons name="calendar" size={24} color="#2196F3" />
            <Text style={styles.quickActionText}>Weekly Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            <Ionicons name="bar-chart" size={24} color="#8B5CF6" />
            <Text style={styles.quickActionText}>Progress</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn}>
            <Ionicons name="save" size={24} color="#EC4899" />
            <Text style={styles.quickActionText}>Saved Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn}>
            <Ionicons name="help-circle" size={24} color="#6B7280" />
            <Text style={styles.quickActionText}>Others</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Floating Glassy Icon Navigation - always on top */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <View style={styles.fabBar}>
          <TouchableOpacity style={styles.fabBtn} onPress={() => {}}>
            <Ionicons name="home" size={22} color="#5B4DF7" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabBtn} onPress={() => {}}>
            <Ionicons name="fast-food" size={22} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fabBtn, styles.fabBtnActive]}
            onPress={() => {}}
          >
            <Ionicons name="add" size={22} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabBtn} onPress={() => {}}>
            <Ionicons name="stats-chart" size={22} color="#222" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.fabBtn} onPress={() => {}}>
            <Ionicons name="person" size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  caloriesCard: {
    backgroundColor: "#22C55E",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  caloriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calorieItem: {
    alignItems: "center",
    flex: 1,
  },
  calorieValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  calorieLabel: {
    color: "#D1FAE5",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#222",
  },
  planCard: {
    backgroundColor: "#d0f7e4ff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 100,
    height: 55,
    borderRadius: 20,
    backgroundColor: "#91ebbdff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
  },
  planDesc: {
    fontSize: 12,
    color: "#666",
  },
  planActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  planBtnOutline: {
    borderWidth: 1,
    borderColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  planBtnFilled: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  planBtnText: {
    color: "#0fa144ff",
    fontWeight: "bold",
  },
  planBtnTextFilled: {
    color: "#fff",
    fontWeight: "bold",
  },
  mealCard: {
    backgroundColor: "#FFFDE7",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  mealBtnFilled: {
    backgroundColor: "#FFD600",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  mealBtnTextFilled: {
    color: "#fff",
    fontWeight: "bold",
  },
  mealBtnOutline: {
    borderWidth: 1,
    borderColor: "#FFD600",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mealBtnText: {
    color: "#ffd500ff",
    fontWeight: "bold",
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
    padding: 15,
    marginHorizontal: 4,
  },
  quickActionText: {
    fontSize: 13,
    color: "#222",
    marginTop: 4,
  },
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 50,
    alignItems: "center",
    zIndex: 100,
    pointerEvents: "box-none",
  },
  fabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 24,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 220,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    marginBottom: 0,
  },
  fabBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  fabBtnActive: {
    backgroundColor: "#E5E6FA",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    flex: 1,
    justifyContent: "center",
  },
  navText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#6B7280",
  },
});
