# PiggyBank AI - Mobile App

A React Native mobile application for PiggyBank AI - your smart savings assistant. Built with Expo and TypeScript.

## 🚀 Features

- 📱 **Native Mobile Experience** - Smooth, responsive UI optimized for mobile devices
- 🔐 **Secure Authentication** - JWT-based login and registration
- 💰 **Wallet Management** - Track your balance and transactions
- 🎯 **Savings Goals** - Create and monitor progress on savings goals
- 💸 **Expense Tracking** - Log and categorize expenses
- 🤖 **AI Insights** - Get personalized financial recommendations
- 📊 **Analytics** - Visual charts and spending analytics

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (installed automatically)
- **Android Studio** (for Android development) OR **Expo Go app** on your phone

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd piggybank-mobile
npm install
```

### 2. Configure Backend URL

Edit `src/constants/config.ts` and update the API_BASE_URL:

**For Android Emulator:**
```typescript
export const API_BASE_URL = 'http://10.0.2.2:3001/api';
```

**For Physical Device (update with your computer's IP):**
```typescript
export const API_BASE_URL = 'http://192.168.1.X:3001/api';
```

To find your IP address:
- **Windows**: Run `ipconfig` in terminal, look for IPv4 Address
- **Mac/Linux**: Run `ifconfig` in terminal

### 3. Start the Backend Server

Make sure your backend is running on port 3001:

```bash
cd ../Piggy-Bank-AI/backend
npm run dev
```

### 4. Start the Mobile App

```bash
cd piggybank-mobile
npx expo start
```

## 📱 Running the App

### Option 1: Android Emulator (Recommended for Windows)

1. Install Android Studio
2. Set up an Android Virtual Device (AVD)
3. Start the emulator
4. Press `a` in the Expo terminal

### Option 2: Expo Go App (Easiest)

1. Install "Expo Go" app from Play Store (Android) or App Store (iOS)
2. Make sure your phone and computer are on the same WiFi network
3. Scan the QR code shown in the terminal
4. App will load on your phone!

### Option 3: iOS Simulator (macOS only)

1. Install Xcode
2. Press `i` in the Expo terminal

## 🎯 Demo Account

Use these credentials to test the app:
- **Email**: `test@example.com`
- **Password**: `password123`

## 📁 Project Structure

```
piggybank-mobile/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── LoadingSpinner.tsx
│   ├── constants/         # App constants and config
│   │   ├── colors.ts
│   │   └── config.ts
│   ├── contexts/          # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/        # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── screens/           # App screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   ├── GoalDetailsScreen.tsx
│   │   ├── ExpensesScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/          # API and storage services
│   │   ├── api.ts
│   │   └── storage.ts
│   └── utils/             # Utility functions
│       └── formatters.ts
├── App.tsx                # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm start

# Start with cleared cache
npm start -- --clear

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on web (experimental)
npm run web
```

### Common Issues

**Issue: Cannot connect to backend**
- Make sure backend is running on port 3001
- Check API_BASE_URL in `src/constants/config.ts`
- For physical device, use your computer's local IP address

**Issue: Metro bundler error**
- Clear cache: `npx expo start --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Issue: Android emulator not detected**
- Make sure Android Studio is installed
- Start the emulator before running `npm run android`
- Check that ANDROID_HOME environment variable is set

## 🎨 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Navigation library
- **AsyncStorage** - Local storage
- **Expo Linear Gradient** - Gradient backgrounds

## 🔗 API Integration

The mobile app connects to the existing PiggyBank AI backend:
- Base URL: `http://localhost:3001/api` (development)
- Authentication: JWT tokens stored in AsyncStorage
- All API endpoints from web app are supported

## 📝 Features Status

- ✅ Authentication (Login, Register, Logout)
- ✅ Dashboard with wallet balance and stats
- ✅ Goals list with progress tracking
- ✅ Expenses list with categories
- ✅ Profile screen
- 🚧 Add/Edit Goals (Coming Soon)
- 🚧 Add/Edit Expenses (Coming Soon)
- 🚧 AI Insights display (Coming Soon)
- 🚧 Analytics charts (Coming Soon)

## 🤝 Contributing

This mobile app is part of the PiggyBank AI project. See the main project README for contribution guidelines.

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using React Native and Expo**
