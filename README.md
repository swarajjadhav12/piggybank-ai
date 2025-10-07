# PiggyBank AI - Smart Savings Assistant

A full-stack financial management application with AI-powered insights to help users save money, track expenses, and achieve their financial goals.

## 🚀 Features

### Frontend (React + TypeScript)
- 📱 **Mobile-First Design** - Beautiful, responsive UI optimized for mobile devices
- 🎯 **Goals Management** - Create and track savings goals with progress visualization
- 💰 **Expense Tracking** - Log and categorize expenses with detailed analytics
- 🏦 **Savings Dashboard** - Comprehensive overview of savings progress
- 🤖 **AI Insights** - Personalized financial recommendations and tips
- 📊 **Analytics** - Detailed spending and savings analytics with charts
- 👤 **User Authentication** - Secure login/registration system
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS

### Backend (Node.js + Express + TypeScript)
- 🔐 **JWT Authentication** - Secure user authentication with token-based sessions
- 💾 **PostgreSQL Database** - Robust data storage with Prisma ORM
- 🛡️ **Security Features** - Rate limiting, CORS, input validation, and password hashing
- 📝 **RESTful API** - Complete CRUD operations for all features
- 🤖 **AI Insights Engine** - Smart analysis of spending patterns and savings opportunities
- 📊 **Analytics Engine** - Comprehensive financial analytics and reporting
- 🔄 **Real-time Data** - Live updates and data synchronization

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Context** - State management for authentication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server-side development
- **PostgreSQL** - Relational database
- **Prisma ORM** - Database toolkit and ORM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd piggybank-ai
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
```

Edit the `.env` file with your database configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/piggybank_ai"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

```bash
# Set up the database
npm run db:generate
npm run db:push
npm run db:seed

# Start the development server
npm run dev
```

The backend will be running on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (root of project)
cd ..

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running on `http://localhost:5173`

### 4. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. Use the demo account to log in:
   - **Email**: `test@example.com`
   - **Password**: `password123`
3. Or create a new account using the registration form

## 📊 Database Schema

The application uses the following database models:

### Users
- Authentication and profile information
- Secure password hashing with bcrypt

### Goals
- Savings goals with target amounts and dates
- Progress tracking and priority levels

### Expenses
- Expense tracking with categories
- Date-based filtering and analytics

### Savings
- Different types of savings (manual, automatic, round-up, goal contributions)
- Historical tracking and trends

### AI Insights
- Personalized financial recommendations
- Smart analysis of spending patterns

## 🔧 Development

### Backend Commands
```bash
cd backend

# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio (database GUI)
npm run db:seed         # Seed database with sample data
```

### Frontend Commands
```bash
# Development
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/add` - Add money to goal
- `GET /api/goals/progress` - Get goal progress

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/analytics` - Get expense analytics

### Savings
- `GET /api/savings` - Get all savings
- `POST /api/savings` - Create saving
- `GET /api/savings/analytics` - Get savings analytics

### AI Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/generate` - Generate new insights
- `PUT /api/insights/:id/read` - Mark insight as read

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/analytics` - Get analytics data

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schema validation
- **Rate Limiting** - Prevent API abuse
- **CORS Protection** - Cross-origin request security
- **SQL Injection Protection** - Prisma ORM
- **Security Headers** - Helmet middleware

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test API endpoints with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test dashboard data (with auth token)
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing
- Use the demo account to test all features
- Test responsive design on different screen sizes
- Verify all CRUD operations work correctly

## 📱 Mobile Optimization

The application is designed with a mobile-first approach:
- Responsive design that works on all screen sizes
- Touch-friendly interface elements
- Optimized navigation for mobile devices
- Fast loading times with Vite

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Build the application: `npm run build`
3. Start production server: `npm run start`
4. Set up process manager (PM2, Docker, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Update API base URL for production

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify your database connection
3. Ensure all environment variables are set correctly
4. Check that both frontend and backend are running
5. Review the API documentation for endpoint details

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Budget planning features
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Export functionality
- [ ] Mobile app (React Native)
- [ ] Advanced AI insights
- [ ] Social features (shared goals)
- [ ] Multi-currency support

---

**Built with ❤️ using modern web technologies**
