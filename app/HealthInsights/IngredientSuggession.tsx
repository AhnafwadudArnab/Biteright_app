import { ArrowLeft, Clock, Flame, Plus, Search, X } from 'lucide-react-native';
import { useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';


interface IngredientSearchScreenProps {
  onNavigate: (screen: Screen) => void;
}

const suggestedMeals = [
  {
    id: 1,
    name: 'Chicken & Broccoli Stir Fry',
    image: 'https://images.unsplash.com/photo-1565849541238-a094440cba72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwY2hpY2tlbiUyMGJyb2Njb2xpJTIwc3RpciUyMGZyeXxlbnwxfHx8fDE3NjkzMDQ4Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 420,
    protein: 38,
    carbs: 32,
    fat: 16,
    time: '25 min',
    tags: ['High Protein', 'Low Carb'],
    compatible: true,
    difficulty: 'Easy',
    servings: 2,
    ingredients: [
      '2 chicken breasts, diced',
      '2 cups broccoli florets',
      '1 medium tomato, chopped',
      '2 tbsp olive oil',
      '2 cloves garlic, minced',
      '1 tbsp soy sauce',
      '1 tsp fresh ginger, grated',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Heat olive oil in a large pan or wok over medium-high heat',
      'Add diced chicken and cook until golden brown, about 5-7 minutes',
      'Add minced garlic and grated ginger, stir for 30 seconds',
      'Add broccoli florets and chopped tomato, stir fry for 4-5 minutes',
      'Pour in soy sauce and season with salt and pepper',
      'Toss everything together and cook for another 2 minutes until vegetables are tender-crisp',
      'Serve hot over rice or quinoa if desired'
    ]
  },
  {
    id: 2,
    name: 'Tomato Basil Pasta',
    image: 'https://images.unsplash.com/photo-1600790194169-d3affafaf726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjBiYXNpbCUyMHBhc3RhJTIwaGVhbHRoeXxlbnwxfHx8fDE3NjkzMDQ4Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 480,
    protein: 18,
    carbs: 72,
    fat: 14,
    time: '20 min',
    tags: ['Vegetarian', 'Quick'],
    compatible: true,
    difficulty: 'Easy',
    servings: 3,
    ingredients: [
      '300g whole wheat pasta',
      '4 large tomatoes, diced',
      '1 cup fresh basil leaves',
      '3 cloves garlic, minced',
      '3 tbsp olive oil',
      '1/4 cup parmesan cheese, grated',
      'Salt and pepper to taste',
      'Red pepper flakes (optional)'
    ],
    instructions: [
      'Bring a large pot of salted water to boil and cook pasta according to package directions',
      'While pasta cooks, heat olive oil in a large pan over medium heat',
      'Add minced garlic and sauté until fragrant, about 1 minute',
      'Add diced tomatoes and cook for 8-10 minutes until they break down',
      'Season with salt, pepper, and red pepper flakes if using',
      'Drain pasta and add to the tomato sauce, toss to combine',
      'Remove from heat, tear in fresh basil leaves and sprinkle with parmesan',
      'Serve immediately with extra basil and cheese on top'
    ]
  },
  {
    id: 3,
    name: 'Chicken Avocado Salad',
    image: 'https://images.unsplash.com/photo-1644504439611-ddc302de87ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGF2b2NhZG8lMjBzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzY5MzA0ODI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 380,
    protein: 32,
    carbs: 15,
    fat: 24,
    time: '15 min',
    tags: ['Low Carb', 'Quick', 'High Protein'],
    compatible: true,
    difficulty: 'Easy',
    servings: 2,
    ingredients: [
      '2 grilled chicken breasts, sliced',
      '2 ripe avocados, diced',
      '4 cups mixed salad greens',
      '1 cup cherry tomatoes, halved',
      '1/4 red onion, thinly sliced',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Grill or pan-cook chicken breasts until fully cooked, then slice into strips',
      'In a large bowl, combine mixed salad greens, cherry tomatoes, and red onion',
      'Cut avocados in half, remove pit, and dice the flesh',
      'Add sliced chicken and diced avocado to the salad',
      'In a small bowl, whisk together olive oil, lemon juice, salt, and pepper',
      'Drizzle dressing over the salad and toss gently to combine',
      'Serve immediately for best flavor and texture'
    ]
  },
  {
    id: 4,
    name: 'Mediterranean Quinoa Bowl',
    image: 'https://images.unsplash.com/photo-1623428187425-873f16e10554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWlub2ElMjB2ZWdldGFibGUlMjBib3dsJTIwaGVhbHRoeXxlbnwxfHx8fDE3NjkzMDQ4Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 395,
    protein: 14,
    carbs: 52,
    fat: 16,
    time: '30 min',
    tags: ['Vegetarian', 'High Fiber'],
    compatible: false,
    difficulty: 'Medium',
    servings: 2,
    ingredients: [
      '1 cup quinoa, uncooked',
      '2 cups vegetable broth',
      '1 cup cucumber, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 cup kalamata olives, sliced',
      '1/2 cup feta cheese, crumbled',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Fresh herbs (parsley, mint)'
    ],
    instructions: [
      'Rinse quinoa thoroughly under cold water',
      'In a medium pot, bring vegetable broth to a boil',
      'Add quinoa, reduce heat to low, cover and simmer for 15 minutes',
      'Remove from heat and let stand covered for 5 minutes, then fluff with fork',
      'While quinoa cools, prepare vegetables and combine in a bowl',
      'Add cooled quinoa to the vegetable mixture',
      'Whisk together olive oil and lemon juice, pour over bowl',
      'Top with feta cheese and fresh herbs, serve at room temperature'
    ]
  },
  {
    id: 5,
    name: 'Teriyaki Salmon Bowl',
    image: 'https://images.unsplash.com/photo-1592171029478-6e98b23f3f03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxtb24lMjByaWNlJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzY5MzA0ODI5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 520,
    protein: 35,
    carbs: 48,
    fat: 22,
    time: '35 min',
    tags: ['High Protein', 'Omega-3'],
    compatible: false,
    difficulty: 'Medium',
    servings: 2,
    ingredients: [
      '2 salmon fillets (6 oz each)',
      '1 cup brown rice, uncooked',
      '2 cups edamame, shelled',
      '1 cup shredded carrots',
      '2 tbsp teriyaki sauce',
      '1 tbsp sesame seeds',
      '2 green onions, sliced',
      '1 tsp sesame oil'
    ],
    instructions: [
      'Cook brown rice according to package directions',
      'Preheat oven to 400°F (200°C)',
      'Place salmon on a lined baking sheet and brush with teriyaki sauce',
      'Bake salmon for 12-15 minutes until cooked through',
      'Steam or boil edamame for 5 minutes',
      'Divide rice between two bowls',
      'Top with salmon, edamame, and shredded carrots',
      'Drizzle with sesame oil, sprinkle with sesame seeds and green onions'
    ]
  },
  {
    id: 6,
    name: 'Greek Yogurt Parfait',
    image: 'https://images.unsplash.com/photo-1691043795570-9478750e7fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHlvZ3VydCUyMGJlcnJ5JTIwcGFyZmFpdHxlbnwxfHx8fDE3NjkzMDQ4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    calories: 280,
    protein: 20,
    carbs: 38,
    fat: 6,
    time: '5 min',
    tags: ['Quick', 'High Protein', 'Breakfast'],
    compatible: false,
    difficulty: 'Easy',
    servings: 1,
    ingredients: [
      '1 cup Greek yogurt (plain)',
      '1/2 cup mixed berries',
      '1/4 cup granola',
      '1 tbsp honey',
      '1 tbsp chia seeds',
      '1/4 cup sliced almonds',
      'Fresh mint for garnish'
    ],
    instructions: [
      'In a glass or bowl, add half of the Greek yogurt as the bottom layer',
      'Add half of the mixed berries on top of the yogurt',
      'Sprinkle half of the granola over the berries',
      'Repeat layers with remaining yogurt, berries, and granola',
      'Drizzle honey over the top layer',
      'Sprinkle with chia seeds and sliced almonds',
      'Garnish with fresh mint and serve immediately'
    ]
  }
];

const popularIngredients = [
  'Chicken', 'Tomato', 'Broccoli', 'Avocado', 'Eggs',
  'Salmon', 'Quinoa', 'Spinach', 'Rice', 'Pasta'
];

export function IngredientSearchScreen({ onNavigate }: IngredientSearchScreenProps) {
  const [view, setView] = useState<'search' | 'results' | 'details'>('search');
  const [selectedMeal, setSelectedMeal] = useState(suggestedMeals[0]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [favorited, setFavorited] = useState<number[]>([]);

  const addIngredient = (ingredient?: string) => {
    const value = ingredient || inputValue.trim();
    if (value && !ingredients.includes(value)) {
      setIngredients([...ingredients, value]);
      setInputValue('');
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleFavorite = (id: number) => {
    setFavorited(prev =>
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const handleSearchRecipes = () => {
    if (ingredients.length > 0) setView('results');
  };

  // ----- RENDERING VIEWS -----

  // Recipe Details View
  if (view === 'details') {
    return (
      <View style={styles.container}>
        <ScrollView>
          <Image source={{ uri: selectedMeal.image }} style={styles.mealImage} />

          {/* Back button */}
          <TouchableOpacity style={styles.backButton} onPress={() => setView('results')}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mealName}>{selectedMeal.name}</Text>
            <View style={styles.mealMeta}>
              <View style={styles.metaItem}>
                <Clock size={16} color="white" />
                <Text style={styles.metaText}>{selectedMeal.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>{selectedMeal.difficulty}</Text>
              </View>
              <Text style={styles.metaText}>{selectedMeal.servings} servings</Text>
            </View>
          </View>

          {/* Nutrition Info */}
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

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.sectionCard}>
            {selectedMeal.ingredients.map((ingredient, index) => (
              <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
            ))}
          </View>

          {/* Instructions */}
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.sectionCard}>
            {selectedMeal.instructions.map((step, index) => (
              <Text key={index} style={styles.instructionText}>{index + 1}. {step}</Text>
            ))}
          </View>

          {/* Add to Meal Log */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onNavigate('/Meal-trackers/ViewLogs')}
          >
            <Text style={styles.addButtonText}>Add to Meal Log</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Results View
  if (view === 'results') {
    const compatibleMeals = suggestedMeals.filter(meal => meal.compatible);
    const otherMeals = suggestedMeals.filter(meal => !meal.compatible);

    return (
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setView('search')} style={styles.backButtonResults}>
            <ArrowLeft size={24} color="#3BB273" />
          </TouchableOpacity>

          <Text style={styles.resultsTitle}>Suggested Meals</Text>
          <Text style={styles.resultsSubtitle}>Based on your ingredients</Text>

          {/* Compatible Meals */}
          <FlatList
            data={compatibleMeals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                favorited={favorited.includes(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onPress={() => {
                  setSelectedMeal(item);
                  setView('details');
                }}
              />
            )}
          />

          {/* Other Meals */}
          <FlatList
            data={otherMeals}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MealCard
                meal={item}
                favorited={favorited.includes(item.id)}
                onToggleFavorite={() => toggleFavorite(item.id)}
                onPress={() => {
                  setSelectedMeal(item);
                  setView('details');
                }}
              />
            )}
          />
        </ScrollView>

        {/* <BottomNavigation currentScreen="home" onNavigate={onNavigate} /> */}
      </View>
    );
  }

  // Search View
  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Header */}
        <TouchableOpacity onPress={() => onNavigate('home')}>
          <ArrowLeft size={24} color="#3BB273" />
        </TouchableOpacity>
        <Text style={styles.searchTitle}>Cook with What You Have</Text>
        <Text style={styles.searchSubtitle}>Enter ingredients to get healthy meal suggestions</Text>

        {/* Input */}
        <View style={styles.inputContainer}>
          <Search size={20} color="#3BB273" />
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="e.g., egg, tomato, chicken..."
            style={styles.textInput}
            onSubmitEditing={() => addIngredient()}
          />
          <TouchableOpacity onPress={() => addIngredient()}>
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Popular Ingredients */}
        <Text style={styles.sectionTitle}>Popular Ingredients</Text>
        <View style={styles.ingredientsList}>
          {popularIngredients.map((ing) => (
            <TouchableOpacity key={ing} style={styles.ingredientButton} onPress={() => addIngredient(ing)}>
              <Text>{ing}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Your Ingredients */}
        <Text style={styles.sectionTitle}>Your Ingredients</Text>
        <View style={styles.ingredientsList}>
          {ingredients.map((ing, index) => (
            <View key={ing} style={styles.ingredientTag}>
              <Text>{ing}</Text>
              <TouchableOpacity onPress={() => removeIngredient(index)}>
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {ingredients.length > 0 && (
          <TouchableOpacity style={styles.addButton} onPress={handleSearchRecipes}>
            <Text style={styles.addButtonText}>Find Recipes ({ingredients.length})</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
    </View>
  );
}

// ----- MEAL CARD -----
interface MealCardProps {
  meal: typeof suggestedMeals[0];
  favorited: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

function MealCard({ meal, favorited, onToggleFavorite, onPress }: MealCardProps) {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress}>
      <Image source={{ uri: meal.image }} style={styles.mealCardImage} />
      <View style={styles.mealCardContent}>
        <Text style={styles.mealCardName}>{meal.name}</Text>
        <View style={styles.mealCardTags}>
          {meal.tags.map((tag, index) => (
            <Text key={index} style={styles.mealCardTag}>{tag}</Text>
          ))}
        </View>
        <View style={styles.nutritionCard}>
          <Text>{meal.calories} kcal</Text>
          <Text>{meal.protein}g Protein</Text>
          <Text>{meal.carbs}g Carbs</Text>
          <Text>{meal.fat}g Fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ----- STYLES -----
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  mealImage: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 40, left: 16, padding: 8, backgroundColor: '#00000060', borderRadius: 20 },
  titleContainer: { position: 'absolute', bottom: 16, left: 16 },
  mealName: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  mealMeta: { flexDirection: 'row', gap: 8, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: 'white', fontSize: 12 },
  nutritionCard: { flexDirection: 'row', justifyContent: 'space-around', margin: 16, padding: 16, borderRadius: 20, backgroundColor: '#3BB273' },
  nutritionItem: { alignItems: 'center' },
  nutritionNumber: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  nutritionLabel: { color: 'white', fontSize: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
  sectionCard: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 16 },
  ingredientText: { fontSize: 14, marginVertical: 2 },
  instructionText: { fontSize: 14, marginVertical: 4 },
  addButton: { backgroundColor: '#3BB273', padding: 16, margin: 16, borderRadius: 16, alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  searchTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16 },
  searchSubtitle: { fontSize: 14, color: 'gray', marginBottom: 16 },
  inputContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 8, alignItems: 'center', gap: 8 },
  textInput: { flex: 1, height: 40 },
  ingredientsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ingredientButton: { padding: 8, backgroundColor: '#e8f7ef', borderRadius: 12 },
  ingredientTag: { flexDirection: 'row', backgroundColor: '#3BB273', padding: 8, borderRadius: 16, alignItems: 'center', gap: 4 },
  mealCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: '#f9f9f9' },
  mealCardImage: { width: '100%', height: 180 },
  mealCardContent: { padding: 12 },
  mealCardName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  mealCardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
  mealCardTag: { fontSize: 10, backgroundColor: '#e8f7ef', padding: 4, borderRadius: 8 },
  backButtonResults: { marginTop: 16, marginBottom: 8 },
  resultsTitle: { fontSize: 20, fontWeight: 'bold' },
  resultsSubtitle: { fontSize: 14, color: 'gray', marginBottom: 12 },
});






// import { useState, useEffect } from 'react';
// import { FlatList, View, Text, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
// import axios from 'axios';

// export function IngredientSearchScreen({ onNavigate }: IngredientSearchScreenProps) {
//   const [meals, setMeals] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchMeals();
//   }, []);

//   const fetchMeals = async () => {
//     try {
//       const res = await axios.get('http://<your-server-ip>:3000/api/foods');
//       // Map database results to your meal structure
//       const mappedMeals = res.data.map((food: any, index: number) => ({
//         id: index + 1,
//         name: food.name,
//         calories: food.calories,
//         protein: food.protein || 0,
//         carbs: food.carbs || 0,
//         fat: food.fats || 0,
//         servings: 1,
//         time: '15 min', // default value
//         tags: [], // optional
//         compatible: true,
//         difficulty: 'Easy',
//         image: 'https://via.placeholder.com/300', // placeholder image
//         ingredients: [food.name],
//         instructions: ['Use as needed'],
//       }));
//       setMeals(mappedMeals);
//       setLoading(false);
//     } catch (err) {
//       console.log(err);
//       setLoading(false);
//     }
//   };

//   if (loading) return <ActivityIndicator size="large" color="#3BB273" />;

//   return (
//     <FlatList
//       data={meals}
//       keyExtractor={(item) => item.id.toString()}
//       renderItem={({ item }) => (
//         <TouchableOpacity onPress={() => console.log('Clicked', item.name)}>
//           <View style={{ flexDirection: 'row', padding: 16 }}>
//             <Image source={{ uri: item.image }} style={{ width: 60, height: 60, borderRadius: 8 }} />
//             <View style={{ marginLeft: 12 }}>
//               <Text>{item.name}</Text>
//               <Text>{item.calories} kcal</Text>
//             </View>
//           </View>
//         </TouchableOpacity>
//       )}
//     />
//   );
// }
