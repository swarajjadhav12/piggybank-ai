# 🐷 Piggy Bank AI - Smart Financial Management

A comprehensive financial management platform with AI-powered insights, consisting of a web application and a React Native mobile app to help users save money, track expenses, and achieve their financial goals.

## 📱 Project Structure

This repository contains two main applications:

- **Piggy-Bank-AI** – Web application (React + TypeScript) with Node.js backend  
- **piggybank-mobile** – React Native mobile application (Expo)

## ✨ Features

### 💰 Core Features
- 🎯 Goals Management – Create and track savings goals with progress visualization  
- 💸 Expense Tracking – Log and categorize expenses with detailed analytics  
- 💵 Wallet Management – Track balance and transactions  
- 🤖 AI-Powered Insights – Personalized financial recommendations using Google Gemini AI  
- 📊 Analytics Dashboard – Overview of financial health  
- 💳 Payment Integration – Manage payments and transactions  
- 💬 AI Chat Assistant – Interactive AI-based financial guidance  

### 🔒 Security
- JWT-based authentication  
- Secure password hashing with bcrypt  
- Rate limiting and CORS protection  
- Input validation with Zod  

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js + TypeScript  
- PostgreSQL with Prisma ORM  
- JWT Authentication  
- Google Gemini AI  

### Web Frontend
- React 18 + TypeScript  
- Vite  
- Tailwind CSS  

### Mobile App
- React Native (Expo)  
- TypeScript  
- React Navigation  
- AsyncStorage  

## 📋 Prerequisites

- Node.js (v18 or higher)  
- npm or yarn  
- PostgreSQL (v12 or higher)  
- Git  
- Expo CLI  

```bash
npm install -g expo-cli
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/swarajjadhav12/piggybank-ai.git
cd piggybank-ai
```

## 🔧 Backend Setup

```bash
cd Piggy-Bank-AI/backend
npm install
cp env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/piggybank_ai"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Backend runs on `http://localhost:3001`

## 🌐 Web Frontend Setup

```bash
cd ../
npm install
npm run dev
```

Web app runs on `http://localhost:5173`

## 📱 Mobile App Setup

```bash
cd piggybank-mobile
npm install
npm start
```

Edit API URL:
```ts
const API_BASE_URL = 'http://YOUR_LOCAL_IP:3001/api';
```

## 🔑 Demo Credentials

- **Email:** test@example.com  
- **Password:** password123  

## 📡 API Endpoints

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile`

### Goals
- GET `/api/goals`
- POST `/api/goals`
- PUT `/api/goals/:id`
- DELETE `/api/goals/:id`

### Expenses
- GET `/api/expenses`
- POST `/api/expenses`
- GET `/api/expenses/analytics`

### Dashboard
- GET `/api/dashboard`
- GET `/api/dashboard/analytics`

### AI
- GET `/api/insights`
- GET `/api/insights/generate`
- POST `/api/chat`

## 🔧 Development Commands

### Backend
```bash
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:push
npm run db:studio
npm run db:seed
```

### Mobile App
```bash
npm start
npm run android
npm run ios
npm run web
```

## 🐛 Troubleshooting

- Ensure PostgreSQL is running  
- Verify `.env` values  
- Use local IP instead of localhost for mobile app  

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Push and open a pull request  

## 📄 License

MIT License

## 🎯 Roadmap

- [x] Core financial tracking  
- [x] AI-powered insights  
- [x] Mobile application  
- [ ] Real-time notifications  
- [ ] Budget planning  
- [ ] Investment tracking  
- [ ] Bill reminders  
- [ ] Export functionality  
- [ ] Multi-currency support  

---

**Built with ❤️ using modern web and mobile technologies**
