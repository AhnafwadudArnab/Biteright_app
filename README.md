🥗 BiteRight – Smart Diet & Water Tracking App

BiteRight is a React Native (Expo) mobile application designed to help users plan their daily and weekly diets, track water intake, and maintain healthier eating habits through a simple and intuitive interface.

🚀 Features

📅 Daily Diet Planning

🗓 Weekly Diet Charts

💧 Water Intake Tracking

📊 Diet Progress Visualization

🧭 Smooth Navigation using React Navigation

⚡ Built with Expo for fast development

🛠 Tech Stack

React Native

Expo

Expo Router

React Navigation (Native Stack)

JavaScript (ES Modules)

📁 Project Structure
Biteright_app/
│
├── app/
│   ├── (tabs)/
│   │   ├── MainHomePage.js
│   │   └── landingPage.js
│   │
│   ├── Dietplans/
│   │   ├── Daily_diet_plannigs.js
│   │   ├── newPlan.js
│   │   └── weeklyPlans.js
│   │
│   ├── WaterFiles/
│   │   └── waterintake.js
│   │
│   └── index.tsx
│
├── assets/
├── package.json
├── app.json
└── README.md

⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/BiteRight.git
cd Biteright_app

2️⃣ Install Dependencies
npm install


or

yarn install

▶️ Running the App
npx expo start


Then choose:

Android Emulator

iOS Simulator

Expo Go (QR Code)

🧭 Navigation Overview

The app uses React Navigation Native Stack:

<Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="LandingPage" component={LandingPage} />
  <Stack.Screen name="MainHomePage" component={MainHomePage} />
  <Stack.Screen name="DietPlan" component={GenerateDietPlan} />
  <Stack.Screen name="DP_your_Charts" component={DietPlannerItem} />
  <Stack.Screen name="Weekly_chart" component={WeeklyPlans} />
  <Stack.Screen name="Water_intake" component={WaterIntake} />
</Stack.Navigator>


⚠️ Important:
When using Expo Router + Node16/Nodenext, all imports must include the .js extension.

🐛 Common Issues & Fixes
❌ Module not found error

Cause: Missing .js extension in imports.

Fix:

import MainHomePage from "./(tabs)/MainHomePage.js";

🧪 Future Improvements

🔐 User Authentication

☁️ Cloud Data Storage

🍎 Calorie & Nutrition Analysis

📈 Advanced Analytics & Charts

🎨 Improved UI / Dark Mode

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a new branch

Commit your changes

Open a Pull Request

📄 License

This project is licensed under the MIT License.
