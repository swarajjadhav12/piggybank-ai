# PiggyBank AI Backend

A fully functional Node.js/Express backend for the PiggyBank AI smart savings assistant application.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 💾 **PostgreSQL Database** - Robust data storage with Prisma ORM
- 🎯 **Goals Management** - Create, track, and manage savings goals
- 💰 **Expense Tracking** - Log and categorize expenses
- 🏦 **Savings Management** - Track different types of savings
- 🤖 **AI Insights** - Personalized financial recommendations
- 📊 **Analytics** - Comprehensive spending and savings analytics
- 🛡️ **Security** - Rate limiting, CORS, and input validation
- 📝 **API Documentation** - Complete RESTful API endpoints

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS, Rate Limiting

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/piggybank_ai"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=3001
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create a new goal
- `GET /api/goals/:id` - Get specific goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/:id/add` - Add money to goal
- `GET /api/goals/progress` - Get goal progress

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/categories` - Get expense categories
- `GET /api/expenses/recent` - Get recent expenses
- `GET /api/expenses/analytics` - Get expense analytics

### Savings
- `GET /api/savings` - Get all savings
- `POST /api/savings` - Create new saving
- `GET /api/savings/:id` - Get specific saving
- `DELETE /api/savings/:id` - Delete saving
- `GET /api/savings/summary` - Get savings summary
- `GET /api/savings/analytics` - Get savings analytics

### AI Insights
- `GET /api/insights` - Get all insights
- `POST /api/insights` - Create new insight
- `GET /api/insights/:id` - Get specific insight
- `PUT /api/insights/:id` - Update insight
- `DELETE /api/insights/:id` - Delete insight
- `PUT /api/insights/:id/read` - Mark insight as read
- `PUT /api/insights/mark-all-read` - Mark all insights as read
- `GET /api/insights/generate` - Generate new insights
- `GET /api/insights/unread-count` - Get unread count

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/dashboard/analytics` - Get analytics data

## Database Schema

### Users
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `createdAt` - Account creation date
- `updatedAt` - Last update date

### Goals
- `id` - Unique identifier
- `name` - Goal name
- `description` - Goal description
- `target` - Target amount
- `saved` - Current saved amount
- `targetDate` - Target completion date
- `priority` - Priority level (LOW, MEDIUM, HIGH)
- `emoji` - Goal emoji
- `isActive` - Whether goal is active
- `userId` - Associated user

### Expenses
- `id` - Unique identifier
- `description` - Expense description
- `amount` - Expense amount
- `category` - Expense category
- `date` - Expense date
- `userId` - Associated user

### Savings
- `id` - Unique identifier
- `amount` - Savings amount
- `type` - Savings type (MANUAL, AUTOMATIC, ROUND_UP, GOAL_CONTRIBUTION)
- `date` - Savings date
- `userId` - Associated user

### AI Insights
- `id` - Unique identifier
- `type` - Insight type (SAVING, SPENDING, WARNING, GOAL, ACHIEVEMENT)
- `title` - Insight title
- `description` - Insight description
- `potentialSavings` - Potential savings amount
- `impact` - Impact level (LOW, MEDIUM, HIGH)
- `isRead` - Whether insight has been read
- `userId` - Associated user

## Sample Data

The seeding script creates a test user with sample data:

- **Email**: `test@example.com`
- **Password**: `password123`
- **Sample Goals**: Emergency Fund, New Laptop, Summer Vacation
- **Sample Expenses**: Various categorized expenses
- **Sample Savings**: Different types of savings records
- **Sample Insights**: AI-generated financial insights

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests | `100` |

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schema validation
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Cross-origin request protection
- **Helmet** - Security headers
- **SQL Injection Protection** - Prisma ORM

## Error Handling

The API includes comprehensive error handling:

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **404** - Not Found (resource not found)
- **500** - Internal Server Error (server errors)

All errors return a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (if applicable)"
}
```

## Testing

To test the API endpoints, you can use tools like:

- **Postman** - API testing tool
- **Insomnia** - API client
- **curl** - Command line tool

Example curl commands:

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get dashboard data (with auth token)
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Deployment

### Production Setup

1. **Set environment variables for production**
2. **Build the application**: `npm run build`
3. **Start the production server**: `npm run start`
4. **Set up a process manager** (PM2, Docker, etc.)

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
