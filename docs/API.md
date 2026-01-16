# API Documentation

Complete API reference for the Fitness Tracker Dashboard backend.

**Base URL:** `http://localhost:3001/api` (development) or `http://your-host:3001/api` (production)

## Authentication

All API endpoints except `/auth/login` and `/health` require a valid JWT token in the Authorization header.

**Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

### POST /auth/login

Authenticate and receive JWT token.

**Request:**
```json
{
  "password": "your-admin-password"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 86400
}
```

**Error Responses:**
- `400 Bad Request` - Password not provided
- `401 Unauthorized` - Invalid password
- `500 Internal Server Error` - Server error

**Rate Limit:** 5 requests per 15 minutes

---

## Workouts

### GET /workouts

List all workouts with pagination and filtering.

**Query Parameters:**
- `limit` (number, default: 20, max: 100) - Number of results
- `offset` (number, default: 0) - Pagination offset
- `startDate` (ISO date string, optional) - Filter workouts from this date
- `endDate` (ISO date string, optional) - Filter workouts until this date

**Example Request:**
```
GET /api/workouts?limit=10&offset=0&startDate=2024-01-01
```

**Response (200 OK):**
```json
{
  "workouts": [
    {
      "id": 123,
      "name": "Push Day",
      "workout_date": "2024-01-15T14:30:00.000Z",
      "source": "Telegram",
      "exercise_count": 5,
      "total_sets": 18,
      "total_volume": 2450.5
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

### GET /workouts/:id

Get detailed information about a specific workout.

**Path Parameters:**
- `id` (number, required) - Workout ID

**Example Request:**
```
GET /api/workouts/123
```

**Response (200 OK):**
```json
{
  "id": 123,
  "name": "Push Day",
  "workout_date": "2024-01-15T14:30:00.000Z",
  "source": "Telegram",
  "exercises": [
    {
      "exercise_id": 45,
      "exercise_name": "Bench Press",
      "sets": [
        { "set_number": 1, "weight_kg": 80, "reps": 10 },
        { "set_number": 2, "weight_kg": 85, "reps": 8 },
        { "set_number": 3, "weight_kg": 85, "reps": 7 }
      ],
      "total_volume": 1975
    },
    {
      "exercise_id": 46,
      "exercise_name": "Overhead Press",
      "sets": [
        { "set_number": 1, "weight_kg": 50, "reps": 10 },
        { "set_number": 2, "weight_kg": 50, "reps": 9 }
      ],
      "total_volume": 950
    }
  ],
  "total_volume": 2925,
  "total_sets": 5
}
```

**Error Responses:**
- `400 Bad Request` - Invalid workout ID
- `404 Not Found` - Workout not found

### GET /workouts/stats/volume-over-time

Get aggregated volume statistics over time.

**Query Parameters:**
- `days` (number, default: 30, max: 365) - Number of days to look back
- `groupBy` (string, default: 'week') - Grouping interval: `day`, `week`, or `month`

**Example Request:**
```
GET /api/workouts/stats/volume-over-time?days=90&groupBy=week
```

**Response (200 OK):**
```json
{
  "data": [
    { "date": "2024-01-01", "volume": 2450 },
    { "date": "2024-01-08", "volume": 2680 },
    { "date": "2024-01-15", "volume": 2520 }
  ]
}
```

---

## Exercises

### GET /exercises

List all exercises with summary statistics.

**Example Request:**
```
GET /api/exercises
```

**Response (200 OK):**
```json
{
  "exercises": [
    {
      "id": 1,
      "name": "Bench Press",
      "total_sets": 45,
      "last_performed": "2024-01-15T14:30:00.000Z",
      "max_weight": 95.0
    },
    {
      "id": 2,
      "name": "Squat",
      "total_sets": 38,
      "last_performed": "2024-01-14T10:00:00.000Z",
      "max_weight": 120.0
    }
  ]
}
```

### GET /exercises/:id/history

Get workout history for a specific exercise.

**Path Parameters:**
- `id` (number, required) - Exercise ID

**Query Parameters:**
- `limit` (number, default: 50, max: 100) - Number of workouts to return

**Example Request:**
```
GET /api/exercises/1/history?limit=10
```

**Response (200 OK):**
```json
{
  "exercise_id": 1,
  "exercise_name": "Bench Press",
  "history": [
    {
      "workout_id": 123,
      "workout_name": "Push Day",
      "date": "2024-01-15T14:30:00.000Z",
      "sets": [
        { "set_number": 1, "weight_kg": 80, "reps": 10 },
        { "set_number": 2, "weight_kg": 85, "reps": 8 }
      ],
      "max_weight": 85,
      "total_volume": 1480
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid exercise ID
- `404 Not Found` - Exercise not found

### GET /exercises/:id/progress

Get progression data for a specific exercise over time.

**Path Parameters:**
- `id` (number, required) - Exercise ID

**Query Parameters:**
- `metric` (string, default: 'max_weight') - Metric to track: `max_weight`, `total_volume`, or `max_reps`
- `days` (number, default: 90, max: 365) - Number of days to look back

**Example Request:**
```
GET /api/exercises/1/progress?metric=max_weight&days=90
```

**Response (200 OK):**
```json
{
  "exercise_id": 1,
  "exercise_name": "Bench Press",
  "metric": "max_weight",
  "data": [
    { "date": "2023-12-15", "value": 80 },
    { "date": "2023-12-22", "value": 82.5 },
    { "date": "2024-01-05", "value": 85 },
    { "date": "2024-01-15", "value": 85 }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid exercise ID or metric
- `404 Not Found` - Exercise not found

---

## Sleep

### GET /sleep

Get sleep logs with statistics.

**Query Parameters:**
- `startDate` (ISO date string, optional) - Filter logs from this date
- `endDate` (ISO date string, optional) - Filter logs until this date
- `limit` (number, default: 30, max: 365) - Number of logs to return

**Example Request:**
```
GET /api/sleep?startDate=2024-01-01&limit=30
```

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "log_date": "2024-01-15",
      "duration_hours": 7.5,
      "quality": 4,
      "notes": "Slept well"
    },
    {
      "id": 2,
      "log_date": "2024-01-14",
      "duration_hours": 6.5,
      "quality": 3,
      "notes": "Woke up early"
    }
  ],
  "stats": {
    "avg_duration": 7.2,
    "avg_quality": 3.8,
    "total_logs": 30
  }
}
```

**Field Descriptions:**
- `log_date` - Date of sleep log (YYYY-MM-DD)
- `duration_hours` - Sleep duration in hours (0-24)
- `quality` - Sleep quality rating (1-5)
- `notes` - Optional notes about sleep
- `stats.avg_duration` - Average sleep duration across all logs
- `stats.avg_quality` - Average quality rating
- `stats.total_logs` - Total number of logs in result set

---

## Weight

### GET /weight

Get weight logs with statistics.

**Query Parameters:**
- `startDate` (ISO date string, optional) - Filter logs from this date
- `endDate` (ISO date string, optional) - Filter logs until this date
- `limit` (number, default: 30, max: 365) - Number of logs to return

**Example Request:**
```
GET /api/weight?startDate=2024-01-01&limit=30
```

**Response (200 OK):**
```json
{
  "logs": [
    {
      "id": 1,
      "log_date": "2024-01-15",
      "weight_kg": 85.2,
      "body_fat_pct": 18.5,
      "notes": "Morning weight"
    },
    {
      "id": 2,
      "log_date": "2024-01-08",
      "weight_kg": 85.8,
      "body_fat_pct": 19.0,
      "notes": null
    }
  ],
  "stats": {
    "current_weight": 85.2,
    "start_weight": 87.0,
    "weight_change": -1.8,
    "avg_body_fat": 18.8
  }
}
```

**Field Descriptions:**
- `log_date` - Date of weight log (YYYY-MM-DD)
- `weight_kg` - Weight in kilograms
- `body_fat_pct` - Body fat percentage (0-100)
- `notes` - Optional notes
- `stats.current_weight` - Most recent weight
- `stats.start_weight` - Earliest weight in dataset
- `stats.weight_change` - Difference between current and start
- `stats.avg_body_fat` - Average body fat percentage

---

## Health Check

### GET /health

Check API server status (no authentication required).

**Example Request:**
```
GET /health
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Invalid or expired token"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Error message (development only)"
}
```

---

## Rate Limiting

**Login Endpoint:**
- 5 requests per 15-minute window
- Returns 429 Too Many Requests when exceeded

**Other Endpoints:**
- No rate limiting (protected by authentication)

---

## CORS

The API supports CORS for all origins by default. In production, configure CORS in `backend/src/index.ts`:

```typescript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Date Formats

**Input (Query Parameters):**
- Use ISO 8601 date strings: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2024-01-15` or `2024-01-15T14:30:00.000Z`

**Output (Response):**
- Always ISO 8601: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Example: `2024-01-15T14:30:00.000Z`

---

## Pagination

Endpoints that return lists support pagination:
- `limit` - Number of items per page (default varies by endpoint)
- `offset` - Number of items to skip

**Example:**
```
GET /api/workouts?limit=20&offset=40
```

This returns items 41-60.

---

## Examples

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'
```

**Get Workouts:**
```bash
curl http://localhost:3001/api/workouts \
  -H "Authorization: Bearer <your-token>"
```

**Get Workout Detail:**
```bash
curl http://localhost:3001/api/workouts/123 \
  -H "Authorization: Bearer <your-token>"
```

### JavaScript (Axios) Examples

```javascript
import axios from 'axios';

// Login
const login = async (password) => {
  const response = await axios.post('http://localhost:3001/api/auth/login', {
    password
  });
  return response.data.token;
};

// Create axios instance with auth
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get workouts
const getWorkouts = async () => {
  const response = await api.get('/workouts', {
    params: { limit: 20, offset: 0 }
  });
  return response.data;
};

// Get workout detail
const getWorkout = async (id) => {
  const response = await api.get(`/workouts/${id}`);
  return response.data;
};
```

---

## Support

For API issues or questions:
1. Check this documentation
2. Review backend logs: `docker-compose logs backend`
3. Open an issue on GitHub
