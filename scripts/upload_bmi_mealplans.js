// Script to upload DoctorSugg_bmi_mealplans.json to doctor_bmi_mealplans table in Supabase
// Run this with: node scripts/upload_bmi_mealplans.js
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Backend_Server/.env

require('dotenv').config({ path: require('path').join(__dirname, '../Backend_Server/.env') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in Backend_Server/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = path.join(__dirname, '../app/Dietplans/JSON files/DoctorSugg_bmi_mealplans.json');

async function upload() {
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);
  const plans = data.bmiMealPlans;

  const rows = [];
  for (const gender of Object.keys(plans)) {
    for (const bmi_range of Object.keys(plans[gender])) {
      const plan = plans[gender][bmi_range];
      for (const meal of plan.meals) {
        rows.push({
          gender,
          bmi_range,
          category: plan.category,
          daily_calories: plan.dailyCalories,
          doctor_focus: JSON.stringify(plan.doctorFocus),
          meal_type: meal.type,
          meal_name: meal.name,
          meal_kcal: meal.kcal,
        });
      }
    }
  }

  // Clear existing rows
  const { error: deleteError } = await supabase
    .from('doctor_bmi_mealplans')
    .delete()
    .neq('id', 0); // delete all rows

  if (deleteError) {
    console.error('Delete failed:', deleteError.message);
    process.exit(1);
  }

  // Insert new rows in batches of 50
  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error: insertError } = await supabase
      .from('doctor_bmi_mealplans')
      .insert(batch);

    if (insertError) {
      console.error(`Insert failed at batch ${i / batchSize + 1}:`, insertError.message);
      process.exit(1);
    }
  }

  console.log(`Upload complete! ${rows.length} rows inserted.`);
}

upload().catch(console.error);
