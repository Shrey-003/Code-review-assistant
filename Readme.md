# 🧠 Code Review Assistant - Online Judge System

A feature-rich, microservices-based Online Judge platform for competitive programming and coding practice. Built with Node.js, Express, MongoDB, and Docker.

## ✨ Key Features

### 🎯 Smart Problem Management
- **Difficulty-based filtering** (Easy, Medium, Hard)
- **Advanced sorting** (Newest, Oldest, by Difficulty)
- **Pagination support** for better performance
- Problem creation with custom test cases stored in GridFS

### 📊 Personalized Dashboard
- **Comprehensive statistics** tracking:
  - Total problems solved (broken down by difficulty)
  - Success rate calculation
  - Average solve time analytics
- **Submission history** with filtering and pagination
- **Progress tracking** showing completion percentage for each difficulty level

### 🔥 Streak Tracking & Gamification
- **Daily coding streaks** (similar to GitHub contributions)
- Track current and longest streaks
- **365-day calendar heatmap** visualization
- Automatic streak updates on successful submissions

### ⏱️ Performance Analytics
- **Time tracking** for each submission
- Start time, end time, and duration recording
- Average solve time calculation
- Performance insights over time

### 📝 Code Templates
- **5 programming languages** supported:
  - JavaScript (ES6)
  - Python 3
  - Java
  - C++
  - C
- Pre-configured starter templates
- Admin-managed template system

### 🏆 Leaderboard System
- Real-time rankings based on problems solved
- Display current streaks and success rates
- Sortable and filterable

### 🔐 Robust Authentication
- JWT-based authentication
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt
- Cookie-based session management

---

## 🏗️ Architecture

This is the **backend API service** of a microservices architecture:

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Frontend  │────▶│  API Gateway │────▶│ Problem Service│
│ (React/Next)│     │  (This Repo) │     │   & Evaluator │
└─────────────┘     └──────────────┘     └───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   MongoDB    │
                    │   + GridFS   │
                    └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Shrey-003/Code-review-assistant.git
cd Code-review-assistant

# Install dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env with your configuration
# Required: MONGO_URI, JWT_SECRET
```

### Environment Variables

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/online-judge

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Compiler Service URL
COMPILER_URL=http://localhost:7000

# Environment
NODE_ENV=development
```

**Generate JWT Secret (PowerShell):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### Seed Initial Data

```bash
# Populate code templates for 5 languages
node seedTemplates.js
```

### Run the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on **http://localhost:5000**

---

## 📡 API Endpoints

### Authentication
```http
POST   /api/auth/signup           # Create new account
POST   /api/auth/login            # Login
GET    /api/auth/logout           # Logout
GET    /api/auth/me               # Get current user profile
```

### Problems
```http
GET    /api/problems              # List all problems (with filters)
GET    /api/problems/:id          # Get specific problem
POST   /api/problems              # Create problem (Admin only)
PUT    /api/problems/:id          # Update problem (Admin only)
DELETE /api/problems/:id          # Delete problem (Admin only)
POST   /api/problems/:id/submit   # Submit solution
POST   /api/problems/:id/run      # Run code with custom input
```

**Query Parameters for `GET /api/problems`:**
- `difficulty` - Filter by Easy/Medium/Hard
- `sort` - Sort by newest/oldest/difficulty
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Example:**
```http
GET /api/problems?difficulty=Medium&sort=newest&page=1&limit=10
```

### Dashboard (Authentication Required)
```http
GET    /api/dashboard/stats       # Overall user statistics
GET    /api/dashboard/submissions # Submission history (paginated)
GET    /api/dashboard/streak      # Streak info + calendar data
GET    /api/dashboard/progress    # Progress by difficulty
```

### Code Templates
```http
GET    /api/templates             # List all available templates
GET    /api/templates/:language   # Get template for specific language
POST   /api/templates             # Create template (Admin only)
PUT    /api/templates/:id         # Update template (Admin only)
DELETE /api/templates/:id         # Delete template (Admin only)
```

### Submissions
```http
POST   /api/submissions           # Create submission
GET    /api/submissions           # Get submission history
GET    /api/submissions/leaderboard # Get leaderboard
```

---

## 📦 Tech Stack

- **Backend Framework:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **File Storage:** GridFS (for test cases)
- **Authentication:** JWT + bcrypt
- **Code Execution:** Docker-based sandbox (separate service)
- **Frontend:** React / Next.js (separate repo)

### Dependencies
```json
{
  "axios": "^1.10.0",
  "bcrypt": "^5.0.0",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^17.2.0",
  "express": "^4.17.1",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.16.1",
  "multer": "^2.0.1",
  "validator": "^13.1.1"
}
```

---

## 🗄️ Database Schema

### User Model
- email, password, role
- `solvedProblems[]` - Array of solved problem IDs
- `statistics` - Problems solved count, success rate, avg solve time, counts by difficulty
- `streak` - Current streak, longest streak, last submission date
- `createdAt` - Account creation timestamp

### Problem Model
- title, description, difficulty
- Test cases stored in GridFS
- createdAt, updatedAt timestamps

### Submission Model
- userId, problemId (references)
- code, language, status
- `startTime`, `endTime`, `duration` - Time tracking
- `success` - Boolean flag
- passedCount, totalTests
- timestamp

### CodeTemplate Model
- language (unique, enum of 5 languages)
- template (starter code)
- description
- createdAt, updatedAt

---

## 🧪 Testing

```bash
# Example: Get all Easy problems
curl http://localhost:5000/api/problems?difficulty=Easy

# Example: Get Python template
curl http://localhost:5000/api/templates/python

# Example: Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Example: Get dashboard
curl http://localhost:5000/api/dashboard/stats -b cookies.txt
```

---

## 🚢 Deployment

### Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Deploy to Render/Vercel/Heroku

1. Push code to GitHub (already done ✅)
2. Connect repository to hosting platform
3. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `NODE_ENV=production`

---

## 📝 Contributing

This project is customized and maintained by **Shrey-003**. Feel free to:
- Report issues
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🔗 Links

- **GitHub Repository:** https://github.com/Shrey-003/Code-review-assistant
- **Live Demo:** [Coming Soon]
- **Documentation:** See [`SETUP_GUIDE.md`](./SETUP_GUIDE.md) for detailed setup instructions

---

## 🎯 What Makes This Special

✨ **Personalized Features:**
- Dashboard with comprehensive analytics
- Streak tracking for habit building
- Time tracking for performance insights
- Smart filtering and sorting

🏗️ **Professional Architecture:**
- Clean code organization
- Proper error handling
- MongoDB indexing for performance
- Utility functions for reusability

🚀 **Production Ready:**
- Environment-based configuration
- Secure authentication
- CORS configured
- Scalable design

---

**Built with ❤️ by Shrey-003**
