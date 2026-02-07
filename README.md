# 🐷 Piggy Bank AI - Smart Financial Management

A comprehensive financial management platform with AI-powered insights, consisting of a web application and a React Native mobile app to help users save money, track expenses, and achieve their financial goals.

## 📱 Project Structure

This repository contains two main applications:

- **Piggy-Bank-AI** - Web application (React + TypeScript) with Node.js backend
- **piggybank-mobile** - React Native mobile application (Expo)

## ✨ Features

### 💰 Core Features
- 🎯 **Goals Management** - Create and track savings goals with progress visualization
- 💸 **Expense Tracking** - Log and categorize expenses with detailed analytics
- 💵 **Wallet Management** - Track your balance and transactions
- 🤖 **AI-Powered Insights** - Get personalized financial recommendations using Google Gemini AI
- 📊 **Analytics Dashboard** - Comprehensive overview of your financial health
- 💳 **Payment Integration** - Manage payments and transactions
- 💬 **AI Chat Assistant** - Interactive financial advice and guidance

### 🔒 Security
- JWT-based authentication
- Secure password hashing with bcrypt
- Rate limiting and CORS protection
- Input validation with Zod

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** + **TypeScript**
- **PostgreSQL** with **Prisma ORM**
- **JWT** for authentication
- **Google Gemini AI** for insights

### Web Frontend
- **React 18** + **TypeScript**
- **Vite** for fast builds
- **Tailwind CSS** for styling

### Mobile App
- **React Native** with **Expo**
- **TypeScript**
- **React Navigation** for routing
- **AsyncStorage** for local data

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**
- **Expo CLI** (for mobile app): `npm install -g expo-cli`

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/swarajjadhav12/piggybank-ai.git
cd piggybank-ai
```

### 2. Backend Setup

#### Step 1: Install Dependencies

```bash
cd Piggy-Bank-AI/backend
npm install
```

#### Step 2: Configure Environment Variables

```bash
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/piggybank_ai"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# AI - Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Step 3: Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

#### Step 4: Start Backend Server

```bash
npm run dev
```

The backend will be running on `http://localhost:3001`

### 3. Web Frontend Setup (Optional)

```bash
# Navigate to web frontend directory
cd ../

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be running on `http://localhost:5173`

### 4. Mobile App Setup

#### Step 1: Install Dependencies

```bash
# Navigate to mobile app directory
cd piggybank-mobile

# Install dependencies
npm install
```

#### Step 2: Configure API Endpoint

Edit `src/services/api.ts` and update the API base URL if needed:

```typescript
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3001/api';
// For example: 'http://192.168.1.100:3001/api'
```

> **Important**: Use your computer's local IP address (not `localhost`) so the mobile app can connect to the backend.

#### Step 3: Start the Mobile App

```bash
npm start
```

This will open Expo DevTools in your browser. You can then:

- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your physical device

### 5. Login Credentials

Use the demo account created by the seed script:

- **Email**: `test@example.com`
- **Password**: `password123`

Or register a new account through the app.

## 📱 Running the Mobile App

### On Android Emulator

1. Install Android Studio and set up an Android emulator
2. Start the emulator
3. Run `npm run android` in the `piggybank-mobile` directory

### On iOS Simulator (Mac only)

1. Install Xcode
2. Run `npm run ios` in the `piggybank-mobile` directory

### On Physical Device

1. Install **Expo Go** app from App Store or Play Store
2. Run `npm start` in the `piggybank-mobile` directory
3. Scan the QR code with Expo Go app

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses/analytics` - Get analytics

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/analytics` - Get analytics

### AI Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/generate` - Generate new insights

### Chat
- `POST /api/chat` - Send message to AI assistant

For complete API documentation, see [Backend README](Piggy-Bank-AI/backend/README.md)

## 🔧 Development Commands

### Backend

```bash
cd Piggy-Bank-AI/backend

npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:seed         # Seed database
```

### Mobile App

```bash
cd piggybank-mobile

npm start               # Start Expo development server
npm run android         # Run on Android
npm run ios             # Run on iOS
npm run web             # Run on web browser
```

## 🐛 Troubleshooting

### Backend Issues

**Database connection error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Ensure database exists: `createdb piggybank_ai`

**Port already in use:**
- Change PORT in `.env` file
- Kill process using port: `lsof -ti:3001 | xargs kill` (Mac/Linux)

### Mobile App Issues

**Cannot connect to backend:**
- Use your computer's local IP address, not `localhost`
- Ensure backend is running
- Check firewall settings
- Make sure mobile device and computer are on the same network

**Expo app won't start:**
- Clear Expo cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Metro bundler issues:**
- Reset Metro bundler cache: `expo start -c`
- Restart the development server

## 📚 Additional Documentation

- [Web Frontend README](Piggy-Bank-AI/README.md)
- [Backend README](Piggy-Bank-AI/backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the console/terminal for error messages
3. Verify all environment variables are set correctly
4. Ensure all services (database, backend, frontend) are running
5. Check the API documentation for endpoint details

## 🎯 Roadmap

- [x] Core financial tracking features
- [x] AI-powered insights
- [x] Mobile application
- [ ] Real-time notifications
- [ ] Budget planning features
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Export functionality
- [ ] Multi-currency support

---

**Built with ❤️ using modern web and mobile technologies**
