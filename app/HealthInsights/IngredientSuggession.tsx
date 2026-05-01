import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ArrowLeft, Clock, Flame, Plus, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SERVER_URL } from "../serverhost";

// ── Types ─────────────────────────────────────────────────────────────────────
type Meal = {
  id: number;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  tags: string[];
  compatible: boolean;
  difficulty: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
};

const popularIngredients = [
  "Chicken", "Tomato", "Broccoli", "Avocado", "Eggs",
  "Salmon", "Quinoa", "Spinach", "Rice", "Pasta",
  "Onion", "Garlic", "Lemon", "Cheese", "Mushroom",
];

// ── Main screen ───────────────────────────────────────────────────────────────
export default function IngredientSearchScreen() {
  const [view, setView]               = useState<"search" | "results" | "details">("search");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue]   = useState("");
  const [meals, setMeals]             = useState<Meal[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const addIngredient = (ingredient?: string) => {
    const value = (ingredient || inputValue).trim();
    if (value && !ingredients.includes(value)) {
      setIngredients((prev) => [...prev, value]);
      setInputValue("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Call Gemini via backend ──
  const handleSearchRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SERVER_URL}/api/ingredients/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to get suggestions");
      if (!data.meals || data.meals.length === 0) throw new Error("No meals returned. Try different ingredients.");
      setMeals(data.meals);
      setView("results");
    } catch (e: any) {
      setError(e.message || "Could not get suggestions. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ── Details view ──────────────────────────────────────────────────────────
  if (view === "details" && selectedMeal) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Image source={{ uri: selectedMeal.image }} style={styles.mealImage} />

          <TouchableOpacity style={styles.backButton} onPress={() => setView("results")}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.mealName}>{selectedMeal.name}</Text>
            <View style={styles.mealMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color="white" />
                <Text style={styles.metaText}>{selectedMeal.time}</Text>
              </View>
              <Text style={styles.metaText}>{selectedMeal.difficulty}</Text>
              <Text style={styles.metaText}>{selectedMeal.servings} servings</Text>
            </View>
          </View>

          <View style={styles.nutritionCard}>
            <View style={styles.nutritionItem}>
              <Flame size={20} color="white" />
              <Text style={styles.nutritionNumber}>{selectedMeal.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionNumber}>{selectedMeal.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionNumber}>{selectedMeal.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionNumber}>{selectedMeal.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.sectionCard}>
            {selectedMeal.ingredients.map((ing, i) => (
              <Text key={i} style={styles.ingredientText}>• {ing}</Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.sectionCard}>
            {selectedMeal.instructions.map((step, i) => (
              <Text key={i} style={styles.instructionText}>{i + 1}. {step}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("../Meal_trackers/Gen_meals")}
          >
            <Text style={styles.addButtonText}>Add to Meal Log</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Results view ──────────────────────────────────────────────────────────
  if (view === "results") {
    return (
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setView("search")} style={styles.backButtonResults}>
            <ArrowLeft size={24} color="#3BB273" />
          </TouchableOpacity>

          <Text style={styles.resultsTitle}>AI Meal Suggestions 🤖</Text>
          <Text style={styles.resultsSubtitle}>
            Based on: {ingredients.join(", ")}
          </Text>

          {meals.length === 0 ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Ionicons name="restaurant-outline" size={48} color="#D1D5DB" />
              <Text style={{ color: "#9CA3AF", marginTop: 12, fontSize: 15 }}>
                No meals found. Try different ingredients.
              </Text>
            </View>
          ) : (
            <FlatList
              data={meals}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <MealCard
                  meal={item}
                  onPress={() => { setSelectedMeal(item); setView("details"); }}
                />
              )}
            />
          )}

          <TouchableOpacity
            style={[styles.addButton, { margin: 16 }]}
            onPress={() => { setView("search"); setMeals([]); }}
          >
            <Text style={styles.addButtonText}>Search Again</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Search view ───────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <ArrowLeft size={24} color="#3BB273" />
        </TouchableOpacity>

        <Text style={styles.searchTitle}>Cook with What You Have 🥗</Text>
        <Text style={styles.searchSubtitle}>
          Enter your ingredients and Gemini AI will suggest healthy meals
        </Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Search size={20} color="#3BB273" />
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="e.g., egg, tomato, chicken..."
            style={styles.textInput}
            onSubmitEditing={() => addIngredient()}
            returnKeyType="done"
          />
          <TouchableOpacity
            onPress={() => addIngredient()}
            style={styles.addIngredientBtn}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Popular Ingredients */}
        <Text style={styles.sectionTitle}>Popular Ingredients</Text>
        <View style={styles.ingredientsList}>
          {popularIngredients.map((ing) => (
            <TouchableOpacity
              key={ing}
              style={[
                styles.ingredientButton,
                ingredients.includes(ing) && styles.ingredientButtonActive,
              ]}
              onPress={() => addIngredient(ing)}
            >
              <Text style={[
                styles.ingredientButtonText,
                ingredients.includes(ing) && { color: "#fff" },
              ]}>
                {ing}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Your Ingredients */}
        {ingredients.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Your Ingredients ({ingredients.length})
            </Text>
            <View style={styles.ingredientsList}>
              {ingredients.map((ing, index) => (
                <View key={ing} style={styles.ingredientTag}>
                  <Text style={styles.ingredientTagText}>{ing}</Text>
                  <TouchableOpacity onPress={() => removeIngredient(index)}>
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {ingredients.length > 0 && (
          <TouchableOpacity
            style={[styles.addButton, loading && { opacity: 0.7 }]}
            onPress={handleSearchRecipes}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.addButtonText}>Gemini is thinking…</Text>
              </View>
            ) : (
              <Text style={styles.addButtonText}>
                🤖 Find Recipes ({ingredients.length} ingredients)
              </Text>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Meal Card ─────────────────────────────────────────────────────────────────
function MealCard({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: meal.image }} style={styles.mealCardImage} />
      {meal.compatible && (
        <View style={styles.compatibleBadge}>
          <Text style={styles.compatibleText}>✓ Best Match</Text>
        </View>
      )}
      <View style={styles.mealCardContent}>
        <Text style={styles.mealCardName}>{meal.name}</Text>
        <View style={styles.mealCardTags}>
          {meal.tags.slice(0, 3).map((tag, i) => (
            <Text key={i} style={styles.mealCardTag}>{tag}</Text>
          ))}
        </View>
        <View style={styles.mealCardNutrition}>
          <Text style={styles.mealCardNutText}>🔥 {meal.calories} kcal</Text>
          <Text style={styles.mealCardNutText}>P {meal.protein}g</Text>
          <Text style={styles.mealCardNutText}>C {meal.carbs}g</Text>
          <Text style={styles.mealCardNutText}>F {meal.fat}g</Text>
        </View>
        <View style={styles.mealCardMeta}>
          <Clock size={13} color="#9CA3AF" />
          <Text style={styles.mealCardMetaText}>{meal.time}</Text>
          <Text style={[styles.mealCardMetaText, { marginLeft: 8 }]}>
            {meal.difficulty}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function BottomNavigation({ currentScreen }: { currentScreen: string }) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/MainHomePage")}
        style={styles.navItem}
      >
        <Ionicons name="home-outline" size={22} color="#3BB273" />
        <Text style={styles.navLabel}>Home</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "white" },
  mealImage:       { width: "100%", height: 250 },
  backButton:      { position: "absolute", top: 40, left: 16, padding: 8, backgroundColor: "#00000060", borderRadius: 20 },
  titleContainer:  { position: "absolute", bottom: 16, left: 16, right: 16 },
  mealName:        { color: "white", fontSize: 22, fontWeight: "bold" },
  mealMeta:        { flexDirection: "row", gap: 10, marginTop: 4, flexWrap: "wrap" },
  metaItem:        { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText:        { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  nutritionCard:   { flexDirection: "row", justifyContent: "space-around", margin: 16, padding: 16, borderRadius: 20, backgroundColor: "#3BB273" },
  nutritionItem:   { alignItems: "center" },
  nutritionNumber: { color: "white", fontSize: 16, fontWeight: "bold" },
  nutritionLabel:  { color: "rgba(255,255,255,0.8)", fontSize: 10 },
  sectionTitle:    { fontSize: 17, fontWeight: "bold", marginVertical: 10, paddingHorizontal: 4 },
  sectionCard:     { backgroundColor: "#f0fdf4", padding: 14, borderRadius: 16, marginBottom: 12 },
  ingredientText:  { fontSize: 14, marginVertical: 3, color: "#374151" },
  instructionText: { fontSize: 14, marginVertical: 4, color: "#374151", lineHeight: 20 },
  addButton:       { backgroundColor: "#3BB273", padding: 16, margin: 16, borderRadius: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  addButtonText:   { color: "white", fontWeight: "bold", fontSize: 15 },

  searchTitle:    { fontSize: 22, fontWeight: "bold", marginTop: 12, color: "#0F172A" },
  searchSubtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20, lineHeight: 20 },

  inputContainer: {
    flexDirection: "row", backgroundColor: "#F9FAFB",
    borderRadius: 16, padding: 10, alignItems: "center", gap: 8,
    borderWidth: 1.5, borderColor: "#E5E7EB", marginBottom: 20,
  },
  textInput:         { flex: 1, height: 40, fontSize: 15, color: "#1C1C1E" },
  addIngredientBtn:  { backgroundColor: "#3BB273", borderRadius: 10, padding: 8 },

  ingredientsList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  ingredientButton: {
    padding: 8, paddingHorizontal: 14,
    backgroundColor: "#e8f7ef", borderRadius: 20,
    borderWidth: 1.5, borderColor: "transparent",
  },
  ingredientButtonActive: { backgroundColor: "#3BB273", borderColor: "#3BB273" },
  ingredientButtonText:   { fontSize: 13, color: "#374151", fontWeight: "500" },

  ingredientTag: {
    flexDirection: "row", backgroundColor: "#3BB273",
    padding: 8, paddingHorizontal: 12,
    borderRadius: 20, alignItems: "center", gap: 6,
  },
  ingredientTagText: { color: "white", fontSize: 13, fontWeight: "500" },

  errorBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FEE2E2", padding: 12, borderRadius: 12, marginBottom: 12,
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1 },

  backButtonResults: { marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },
  resultsTitle:      { fontSize: 20, fontWeight: "bold", paddingHorizontal: 16, color: "#0F172A" },
  resultsSubtitle:   { fontSize: 13, color: "#6B7280", marginBottom: 12, paddingHorizontal: 16 },

  mealCard:        { marginBottom: 16, marginHorizontal: 16, borderRadius: 18, overflow: "hidden", backgroundColor: "#f9f9f9", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  mealCardImage:   { width: "100%", height: 180 },
  compatibleBadge: { position: "absolute", top: 12, right: 12, backgroundColor: "#3BB273", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  compatibleText:  { color: "white", fontSize: 11, fontWeight: "700" },
  mealCardContent: { padding: 14 },
  mealCardName:    { fontSize: 16, fontWeight: "bold", marginBottom: 6, color: "#0F172A" },
  mealCardTags:    { flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 8 },
  mealCardTag:     { fontSize: 11, backgroundColor: "#e8f7ef", color: "#16A34A", padding: 4, paddingHorizontal: 8, borderRadius: 8, fontWeight: "600" },
  mealCardNutrition: { flexDirection: "row", gap: 12, marginBottom: 8 },
  mealCardNutText:   { fontSize: 12, color: "#374151", fontWeight: "600" },
  mealCardMeta:      { flexDirection: "row", alignItems: "center", gap: 4 },
  mealCardMetaText:  { fontSize: 12, color: "#9CA3AF" },

  bottomNav:  { flexDirection: "row", backgroundColor: "#fff", paddingVertical: 10, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9", justifyContent: "center" },
  navItem:    { alignItems: "center", paddingHorizontal: 20 },
  navLabel:   { fontSize: 11, color: "#3BB273", marginTop: 3, fontWeight: "600" },
});
