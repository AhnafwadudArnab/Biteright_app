import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Meal } from "./Gen_meals";

type MealEditModalProps = {
  meal: Meal;
  onSave: (meal: Meal) => void;
  onCancel: () => void;
};

export default function MealEditModal({
  meal,
  onSave,
  onCancel,
}: MealEditModalProps) {
  const [type, setType] = useState(meal?.type || "");
  const [name, setName] = useState(meal?.name || "");
  const [time, setTime] = useState(meal?.time || "");
  const [kcal, setKcal] = useState(meal?.kcal?.toString() || "");
  const [protein, setProtein] = useState(meal?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(meal?.carbs?.toString() || "");
  const [fat, setFat] = useState(meal?.fat?.toString() || "");

  useEffect(() => {
    setType(meal?.type || "");
    setName(meal?.name || "");
    setTime(meal?.time || "");
    setKcal(meal?.kcal?.toString() || "");
    setProtein(meal?.protein?.toString() || "");
    setCarbs(meal?.carbs?.toString() || "");
    setFat(meal?.fat?.toString() || "");
  }, [meal]);

  function handleSave() {
    if (!type || !name || !kcal) {
      alert("Please fill in Type, Name, and Calories.");
      return;
    }
    onSave({
      id: meal?.id || Math.random().toString(),
      type: type,
      name: name,
      time: time,
      kcal: Number(kcal),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
  }

  return (
    <Modal transparent animationType="slide" visible>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{meal ? "Edit Meal" : "Add Meal"}</Text>
          <TextInput
            style={styles.input}
            placeholder="Type (e.g. Breakfast)"
            value={type}
            onChangeText={setType}
          />
          <TextInput
            style={styles.input}
            placeholder="Meal Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Time (e.g. 8:30 AM)"
            value={time}
            onChangeText={setTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories"
            value={kcal}
            onChangeText={setKcal}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Protein (g)"
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Carbs (g)"
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Fat (g)"
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={{ color: "#38B36A", fontWeight: "bold" }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0008",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "85%",
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 14,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: "#38B36A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelBtn: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: "#38B36A",
    backgroundColor: "#fff",
  },
});
