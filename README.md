# TRACKER MACROS 🥗🔥

> **Smart Calories • Macros • Steps • Water • TM AI**

Tracker Macros is a modern, high-performance nutrition and activity tracking application built with **React, Vite, TypeScript, and Capacitor (Android Health Connect 2026)**.

---

## 🌟 Key Features

- **Circular Calorie Ring**: Real-time visualization of calories consumed, daily targets, and remaining budget.
- **Macronutrient Tracking**: Animated progress bars and percentages for Protein, Carbs, and Fats.
- **TM AI (Tracker Macros AI)**: Natural language nutrition calculation. Enter queries like:
  - `200g chicken`
  - `2 eggs and 1 banana`
  - `150g paneer`
  - `250g chicken biryani`
  - `3 idlis`
  - `1 dosa with 2 eggs`
  - TM AI automatically interprets food items, serving quantities, and macros with an interactive confirmation dialog.
- **Health Connect (2026 Android Architecture)**:
  - Native step tracking via Android Health Connect (`androidx.health.connect:connect-client`).
  - Aggregates step data from on-device sensors and connected fitness apps without relying on legacy Google Fit APIs.
  - Strict separation between **Food Nutrition Intake** (`1,245 kcal`) and **Activity Burn** (`~314 kcal`).
- **Water Intake**: Quick `+250 ml`, `+500 ml`, `+750 ml`, and custom milliliter tracking.
- **Food Log**: Categorized meal view (**Breakfast**, **Lunch**, **Dinner**, **Snacks**) with item-level macros and daily nutrition summary.
- **Progress & Weight Tracking**: Milestone progression curve (e.g. 65.0 kg → 60.0 kg target) with interactive Recharts graphs.
- **Biometrics & TDEE Calculator**: BMR and maintenance calorie estimation using the Mifflin-St Jeor formula with auto-optimizing macro splits.
- **Dark Mode & Units**: Seamless toggling between signature Light Mode and sleek Dark Mode (`#111111`), plus Metric (kg/cm) and Imperial (lb/in) units.
- **Offline & Private**: 100% offline-ready with local storage persistence and JSON backup export/import.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/Deekshith-stack/MT.git
cd MT

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
npm run build
```

### Android & Health Connect (Capacitor)
```bash
# Sync Capacitor with Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 🎨 Color Palette
- **Primary Orange**: `#FF7A00`
- **Dark Grey**: `#242424` / `#111111`
- **Medium Grey**: `#6B7280`
- **Light Grey**: `#F3F4F6`
- **White**: `#FFFFFF`
- **Success Green**: `#22C55E`
- **Warning**: `#F59E0B`
- **Error**: `#EF4444`

---

## 📄 License
MIT License
