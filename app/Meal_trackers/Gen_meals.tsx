import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const meals = [
	{
		name: "Avocado Toast",
		time: "8:30 AM",
		kcal: 380,
		protein: 12,
		carbs: 45,
		fat: 18,
	},
	{
		name: "Chicken Wrap",
		time: "1:15 PM",
		kcal: 520,
		protein: 32,
		carbs: 48,
		fat: 22,
	},
	{
		name: "Protein Bar",
		time: "4:00 PM",
		kcal: 220,
		protein: 20,
		carbs: 24,
		fat: 8,
	},
];

const totalKcal = meals.reduce((sum, m) => sum + m.kcal, 0);
const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(Math.max(width - 40, 320), 500); // Responsive width

export default function GenMeals() {
	return (
		<ScrollView contentContainerStyle={styles.container}>
			{/* Header */}
			<View style={styles.headerRow}>
				<TouchableOpacity style={styles.backBtn}>
					<Ionicons name="arrow-back" size={24} color="#222" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Meal Log</Text>
				<TouchableOpacity style={styles.weeklyBtn}>
					<Text style={styles.weeklyText}>Weekly</Text>
				</TouchableOpacity>
			</View>
			<Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
			<View style={styles.divider} />

			{/* Total Card */}
			<View style={styles.totalCard}>
				<Text style={styles.totalLabel}>Total Today</Text>
				<Text style={styles.totalKcal}>{totalKcal.toLocaleString()} kcal</Text>
				<Text style={styles.totalMacros}>P: {totalProtein}g   C: {totalCarbs}g   F: {totalFat}g</Text>
			</View>

			{/* Meals List */}
			<Text style={styles.sectionTitle}>Today's Meals</Text>
			<View style={styles.addRow}>
				<TouchableOpacity style={styles.addBtn}>
					<Ionicons name="add" size={24} color="#fff" />
				</TouchableOpacity>
			</View>
			{meals.map((meal, idx) => (
				<View key={idx} style={[styles.mealCard, { width: CARD_WIDTH }]}> 
					<View style={styles.mealHeader}>
						<Text style={styles.mealName}>{meal.name}</Text>
						<View style={styles.mealActions}>
							<TouchableOpacity>
								<Ionicons name="pencil-outline" size={18} color="#888" />
							</TouchableOpacity>
							<TouchableOpacity style={{ marginLeft: 10 }}>
								<Ionicons name="trash-outline" size={18} color="#888" />
							</TouchableOpacity>
						</View>
					</View>
					<Text style={styles.mealTime}>{meal.time}</Text>
					<View style={styles.nutritionRow}>
						<Text style={styles.kcalText}>{meal.kcal} kcal</Text>
						<Text style={styles.nutritionText}>P: {meal.protein}g</Text>
						<Text style={styles.nutritionText}>C: {meal.carbs}g</Text>
						<Text style={styles.nutritionText}>F: {meal.fat}g</Text>
					</View>
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: '#f7f7f7',
		alignItems: 'center',
		padding: 0,
		paddingBottom: 24,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 24,
		marginBottom: 2,
		width: '100%',
		paddingHorizontal: 20,
	},
	backBtn: {
		marginRight: 8,
		padding: 4,
	},
	headerTitle: {
		flex: 1,
		fontSize: 22,
		fontWeight: 'bold',
		color: '#222',
		textAlign: 'left',
	},
	weeklyBtn: {
		padding: 4,
	},
	weeklyText: {
		color: '#38B36A',
		fontWeight: '500',
		fontSize: 15,
	},
	dateText: {
		fontSize: 15,
		color: '#666',
		marginBottom: 8,
		marginLeft: 24,
		marginTop: 2,
		alignSelf: 'flex-start',
	},
	divider: {
		height: 1,
		backgroundColor: '#eee',
		marginVertical: 12,
		width: '90%',
		alignSelf: 'center',
	},
	totalCard: {
		backgroundColor: '#219653',
		borderRadius: 18,
		padding: 24,
		marginBottom: 18,
		width: '90%',
		alignSelf: 'center',
		alignItems: 'flex-start',
	},
	totalLabel: {
		color: '#fff',
		fontSize: 16,
		marginBottom: 8,
	},
	totalKcal: {
		color: '#fff',
		fontSize: 28,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	totalMacros: {
		color: '#fff',
		fontSize: 15,
		marginTop: 2,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 8,
		marginBottom: 8,
		color: '#222',
		alignSelf: 'flex-start',
		marginLeft: 24,
	},
	addRow: {
		width: '90%',
		alignSelf: 'center',
		alignItems: 'flex-end',
		marginBottom: 8,
	},
	addBtn: {
		backgroundColor: '#38B36A',
		borderRadius: 20,
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	mealCard: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 18,
		marginBottom: 16,
		alignSelf: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 2,
		minWidth: 320,
		maxWidth: 500,
	},
	mealHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 2,
	},
	mealName: {
		fontSize: 16,
		color: '#222',
		fontWeight: 'bold',
	},
	mealActions: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	mealTime: {
		color: '#888',
		fontSize: 13,
		marginBottom: 4,
	},
	nutritionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 2,
	},
	kcalText: {
		color: '#38B36A',
		fontWeight: 'bold',
		marginRight: 12,
		fontSize: 15,
	},
	nutritionText: {
		color: '#888',
		fontSize: 14,
		marginRight: 10,
	},
});
