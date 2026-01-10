// Script to upload DoctorSugg_bmi_mealplans.json to doctor_bmi_mealplans table
// Run this with: node scripts/upload_bmi_mealplans.js

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const jsonPath = path.join(__dirname, '../app/Dietplans/JSON files/DoctorSugg_bmi_mealplans.json');
const dbConfig = {
  host: 'localhost',
  user: 'root', // change as needed
  password: '', // change as needed
  database: 'biteright_app',
};

async function upload() {
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);
  const plans = data.bmiMealPlans;
  const rows = [];
  for (const gender of Object.keys(plans)) {
    for (const bmi_range of Object.keys(plans[gender])) {
      const plan = plans[gender][bmi_range];
      for (const meal of plan.meals) {
        rows.push([
          gender,
          bmi_range,
          plan.category,
          plan.dailyCalories,
          JSON.stringify(plan.doctorFocus),
          meal.type,
          meal.name,
          meal.kcal
        ]);
      }
    }
  }
  const conn = await mysql.createConnection(dbConfig);
  await conn.query('DELETE FROM doctor_bmi_mealplans');
  await conn.query(
    'INSERT INTO doctor_bmi_mealplans (gender, bmi_range, category, daily_calories, doctor_focus, meal_type, meal_name, meal_kcal) VALUES ?',[rows]
  );
  await conn.end();
  console.log('Upload complete!');
}

upload().catch(console.error);
