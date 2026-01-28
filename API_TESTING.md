# 🧪 API Testing Guide - Code Review Assistant

Complete guide to testing all API endpoints with examples using curl, Postman, or any HTTP client.

---

## Prerequisites

- Server running at `http://localhost:5000`
- MongoDB connection active
- Code templates seeded (run `node seedTemplates.js`)

---

## 1️⃣ Authentication Flow

### Signup (Create Account)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  -c cookies.txt
```

**Expected Response:**
```json
{
  "user": {
    "_id": "...",
    "email": "demo@example.com",
    "role": "user"
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"demo123"}' \
  -c cookies.txt
```

### Get Current User

```bash
curl http://localhost:5000/api/auth/me -b cookies.txt
```

**Response includes:**
- Email, role, createdAt
- Statistics (problems solved, success rate, etc.)
-Streak (current, longest, last submission)
- Solved problems array

### Logout

```bash
curl http://localhost:5000/api/auth/logout -b cookies.txt
```

---

## 2️⃣ Problem Management

### List All Problems (No Filters)

```bash
curl http://localhost:5000/api/problems
```

### Filter by Difficulty

```bash
# Get Easy problems
curl "http://localhost:5000/api/problems?difficulty=Easy"

# Get Medium problems
curl "http://localhost:5000/api/problems?difficulty=Medium"

# Get Hard problems
curl "http://localhost:5000/api/problems?difficulty=Hard"
```

### Sort Problems

```bash
# Newest first (default)
curl "http://localhost:5000/api/problems?sort=newest"

# Oldest first
curl "http://localhost:5000/api/problems?sort=oldest"

# By difficulty
curl "http://localhost:5000/api/problems?sort=difficulty"
```

### Combine Filters & Pagination

```bash
# Get page 2 of Easy problems, 5 per page, sorted by newest
curl "http://localhost:5000/api/problems?difficulty=Easy&sort=newest&page=2&limit=5"
```

**Response Format:**
```json
{
  "problems": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalProblems": 23,
    "hasMore": true
  }
}
```

### Get Single Problem

```bash
curl http://localhost:5000/api/problems/<PROBLEM_ID>
```

**Response includes:**
- Problem title, description, difficulty
- Test cases (inputs & expected outputs)

### Create Problem (Admin Only)

```bash
curl -X POST http://localhost:5000/api/problems \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "title": "Two Sum",
    "description": "Find two numbers that add up to target",
    "difficulty": "Easy",
    "testCases": [
      {"input": "[2,7,11,15]\n9", "expectedOutput": "[0,1]"},
      {"input": "[3,2,4]\n6", "expectedOutput": "[1,2]"}
    ]
  }'
```

---

## 3️⃣ Code Templates

### List All Templates

```bash
curl http://localhost:5000/api/templates
```

**Response:**
```json
[
  {"_id": "...", "language": "javascript", "description": "..."},
  {"_id": "...", "language": "python", "description": "..."},
  ...
]
```

### Get Language-Specific Template

```bash
# Python template
curl http://localhost:5000/api/templates/python

# JavaScript template
curl http://localhost:5000/api/templates/javascript

# Java template
curl http://localhost:5000/api/templates/java

# C++ template
curl http://localhost:5000/api/templates/cpp

# C template
curl http://localhost:5000/api/templates/c
```

**Response:**
```json
{
  "language": "python",
  "template": "def solution(input_str):\n    ...",
  "description": "Python 3 template with function and docstrings"
}
```

### Create Template (Admin Only)

```bash
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "language": "rust",
    "template": "fn solution(input: &str) -> String {\n    // your code\n}",
    "description": "Rust template"
  }'
```

---

## 4️⃣ Submissions

### Submit Solution (With Time Tracking)

```bash
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "problemId": "PROBLEM_ID_HERE",
    "code": "function solution(input) { return input; }",
    "language": "javascript",
    "status": "pass",
    "passedCount": 2,
    "totalTests": 2,
    "startTime": "2026-01-28T10:00:00Z"
  }'
```

**What happens:**
1. Submission is saved with time tracking
2. Duration is calculated automatically
3. If successful (`status: "pass"`):
   - User statistics are updated
   - Streak is updated (if new day)
   - Problem added to solved list (if first time)
   - Difficulty count incremented

**Response:**
```json
{
  "message": "Submission created successfully",
  "submission": { ... },
  "stats": {
    "duration": "45.23s",
    "success": true
  }
}
```

### Get Submission History

```bash
# Get all your submissions
curl http://localhost:5000/api/submissions -b cookies.txt

# With pagination
curl "http://localhost:5000/api/submissions?page=1&limit=10" -b cookies.txt

# Filter by status
curl "http://localhost:5000/api/submissions?status=pass" -b cookies.txt
```

### Get Leaderboard

```bash
# Top 10 users
curl http://localhost:5000/api/submissions/leaderboard

# Top 20 users
curl "http://localhost:5000/api/submissions/leaderboard?limit=20"
```

**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "email": "user@example.com",
      "problemsSolved": 42,
      "currentStreak": 7,
      "successRate": "85.5%",
      "memberSince": "2026-01-15T..."
    },
    ...
  ],
  "totalUsers": 10
}
```

---

## 5️⃣ Dashboard (User Statistics)

All dashboard endpoints require authentication (use `-b cookies.txt`).

### Get Overall Statistics

```bash
curl http://localhost:5000/api/dashboard/stats -b cookies.txt
```

**Response:**
```json
{
  "user": {
    "email": "demo@example.com",
    "createdAt": "2026-01-20T..."
  },
  "statistics": {
    "totalProblems": 15,
    "byDifficulty": {
      "easy": 8,
      "medium": 5,
      "hard": 2
    },
    "totalSubmissions": 23,
    "successfulSubmissions": 18,
    "successRate": "78.26%",
    "averageSolveTime": "12.5 minutes"
  },
  "streak": {
    "current": 7,
    "longest": 14,
    "lastSubmission": "2026-01-28T..."
  },
  "recentActivity": [
    {
      "problemTitle": "Two Sum",
      "difficulty": "Easy",
      "status": "pass",
      "language": "python",
      "timestamp": "2026-01-28T...",
      "duration": "45.23s"
    },
    ...
  ]
}
```

### Get Submission History

```bash
# Get all submissions with pagination
curl "http://localhost:5000/api/dashboard/submissions?page=1&limit=20" -b cookies.txt

# Filter by status
curl "http://localhost:5000/api/dashboard/submissions?status=pass" -b cookies.txt
```

### Get Streak Information

```bash
# Get streak with calendar data for last 365 days
curl http://localhost:5000/api/dashboard/streak -b cookies.txt

# Get last 90 days
curl "http://localhost:5000/api/dashboard/streak?days=90" -b cookies.txt
```

**Response:**
```json
{
  "currentStreak": 7,
  "longestStreak": 14,
  "lastSubmissionDate": "2026-01-28T...",
  "calendarData": [
    { "date": "2026-01-28", "count": 3 },
    { "date": "2026-01-27", "count": 2 },
    { "date": "2026-01-26", "count": 1 },
    ...
  ]
}
```

**Calendar Data Usage:**
- `date`: ISO format date string
- `count`: Number of successful submissions on that day
- Perfect for heatmap visualization like GitHub contributions

### Get Progress by Difficulty

```bash
curl http://localhost:5000/api/dashboard/progress -b cookies.txt
```

**Response:**
```json
{
  "easy": {
    "solved": 8,
    "total": 20,
    "percentage": "40.00"
  },
  "medium": {
    "solved": 5,
    "total": 15,
    "percentage": "33.33"
  },
  "hard": {
    "solved": 2,
    "total": 10,
    "percentage": "20.00"
  }
}
```

---

## 🔄 Complete User Journey Test

Here's a complete flow to test all features:

```bash
# 1. Create account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"test123"}' \
  -c cookies.txt

# 2. Get Python template
curl http://localhost:5000/api/templates/python > template.json

# 3. List Easy problems
curl "http://localhost:5000/api/problems?difficulty=Easy" > problems.json

# 4. Get specific problem (use ID from previous response)
curl http://localhost:5000/api/problems/PROBLEM_ID > problem_detail.json

# 5. Submit solution
curl -X POST http://localhost:5000/api/submissions \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "problemId": "PROBLEM_ID",
    "code": "def solution(x): return x",
    "language": "python",
    "status": "pass",
    "passedCount": 2,
    "totalTests": 2,
    "startTime": "'$(date -Iseconds)'"
  }'

# 6. Check dashboard stats
curl http://localhost:5000/api/dashboard/stats -b cookies.txt

# 7. View streak
curl http://localhost:5000/api/dashboard/streak -b cookies.txt

# 8. Check leaderboard
curl http://localhost:5000/api/submissions/leaderboard

# 9. Get current user profile
curl http://localhost:5000/api/auth/me -b cookies.txt
```

---

## 🐛 Common Issues & Solutions

### Issue: "Unauthorized" error

**Solution:** Make sure you're using `-b cookies.txt` and have logged in first.

### Issue: "Problem not found"

**Solution:** Make sure you've created problems first. Use a valid Problem ID from the list.

### Issue: Streak not updating

**Solution:** Ensure:
1. Submission status is "pass"
2. `passedCount === totalTests`
3. Or manually set `success: true`

### Issue: Statistics not changing

**Solution:** Check that:
1. User ID is correct in submission
2. Problem ID is valid
3. Submission is marked as successful

---

## 📊 Testing Checklist

- [ ] User can signup/login
- [ ] User can view their profile with stats
- [ ] Problems can be filtered by difficulty
- [ ] Problems can be sorted and paginated
- [ ] Templates load for all 5 languages
- [ ] Submissions are saved with time tracking
- [ ] Statistics update after successful submission
- [ ] Streak updates on new day submission
- [ ] Dashboard shows accurate stats
- [ ] Leaderboard displays correctly
- [ ] Submission history is paginated
- [ ] Calendar data returns for streak visualization

---

## 🎯 Production Testing

When deployed, replace `localhost:5000` with your production URL:

```bash
export API_URL="https://your-api.herokuapp.com"

curl $API_URL/api/problems
curl "$API_URL/api/problems?difficulty=Easy"
# ... etc
```

---

**Happy Testing! 🚀**
