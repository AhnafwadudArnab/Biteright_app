import { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import type { Meal } from "./Gen_meals.ts";

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
  const [type, setType] = useState(meal?.type || "Breakfast");
  const [name, setName] = useState(meal?.name || "");
  const [time, setTime] = useState(meal?.time || "8:00 AM");
  const [kcal, setKcal] = useState(meal?.kcal?.toString() || "");
  const [protein, setProtein] = useState(meal?.protein?.toString() || "");
  const [carbs, setCarbs] = useState(meal?.carbs?.toString() || "");
  const [fat, setFat] = useState(meal?.fat?.toString() || "");

  useEffect(() => {
    setType(meal?.type || "Breakfast");
    setName(meal?.name || "");
    setTime(meal?.time || "8:00 AM");
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
          <Picker
            selectedValue={type}
            style={styles.input}
            onValueChange={setType}
          >
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Snack" value="Snack" />
            <Picker.Item label="Dinner" value="Dinner" />
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Meal Name"
            value={name}
            onChangeText={setName}
          />
          <Picker
            selectedValue={time}
            style={styles.input}
            onValueChange={setTime}
          >
            <Picker.Item label="6:00 AM" value="6:00 AM" />
            <Picker.Item label="7:00 AM" value="7:00 AM" />
            <Picker.Item label="8:00 AM" value="8:00 AM" />
            <Picker.Item label="9:00 AM" value="9:00 AM" />
            <Picker.Item label="12:00 PM" value="12:00 PM" />
            <Picker.Item label="1:00 PM" value="1:00 PM" />
            <Picker.Item label="3:00 PM" value="3:00 PM" />
            <Picker.Item label="6:00 PM" value="6:00 PM" />
            <Picker.Item label="8:00 PM" value="8:00 PM" />
          </Picker>
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
