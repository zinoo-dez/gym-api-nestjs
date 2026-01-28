# Gym API - Postman Collection Guide

This guide will help you use the Postman collection to test and interact with the Gym API.

## Import the Collection

1. Open Postman
2. Click **Import** button
3. Select the `Gym-API.postman_collection.json` file
4. The collection will be imported with all endpoints organized by feature

## Collection Variables

The collection uses variables to make testing easier. These are automatically set when you create resources:

- `baseUrl`: API base URL (default: `http://localhost:3500`)
- `accessToken`: JWT token (auto-set after login/register)
- `memberId`: Member ID (auto-set after creating a member)
- `trainerId`: Trainer ID (auto-set after creating a trainer)
- `classId`: Class ID (auto-set after creating a class)
- `membershipPlanId`: Membership plan ID (auto-set after creating a plan)
- `membershipId`: Membership ID (auto-set after assigning membership)
- `workoutPlanId`: Workout plan ID (auto-set after creating a workout plan)
- `attendanceId`: Attendance ID (auto-set after check-in)
- `bookingId`: Booking ID (auto-set after booking a class)

## Getting Started

### 1. Start the API Server

```bash
cd gym-api-nestjs
npm run start:dev
```

The API will be available at `http://localhost:3500`

### 2. Register or Login

**Option A: Register a new admin user**

- Use the `Authentication > Register User` endpoint
- The access token will be automatically saved

**Option B: Login with existing credentials**

- Use the `Authentication > Login` endpoint
- The access token will be automatically saved

### 3. Test Endpoints

All subsequent requests will automatically use the saved access token for authentication.

## Recommended Testing Flow

### Basic Setup Flow

1. **Authentication > Register User** (as ADMIN)
2. **Membership Plans > Create Membership Plan**
3. **Trainers > Create Trainer**
4. **Members > Create Member**
5. **Memberships > Assign Membership to Member**

### Class Management Flow

1. **Classes > Create Class**
2. **Classes > Get All Classes**
3. **Classes > Book Class**
4. **Classes > Get Class by ID** (see bookings)
5. **Classes > Cancel Class Booking**

### Attendance Flow

1. **Attendance > Check In Member**
2. **Attendance > Get All Attendance Records**
3. **Attendance > Check Out Member**
4. **Attendance > Generate Attendance Report**

### Workout Plan Flow

1. **Workout Plans > Create Workout Plan**
2. **Workout Plans > Get Workout Plan by ID**
3. **Workout Plans > Update Workout Plan** (creates new version)
4. **Workout Plans > Get Workout Plan Version History**
5. **Workout Plans > Get Specific Workout Plan Version**

## Authentication & Authorization

### Roles

The API has three roles with different permissions:

- **ADMIN**: Full access to all endpoints
- **TRAINER**: Can manage classes, workout plans, and view members
- **MEMBER**: Can view their own data, book classes, and manage their profile

### Using the Access Token

The collection is configured to automatically use the `accessToken` variable for all authenticated requests. The token is set automatically when you:

- Register a new user
- Login with existing credentials

If you need to manually set the token:

1. Go to the collection variables
2. Update the `accessToken` variable with your JWT token

## Query Parameters

Many GET endpoints support filtering and pagination:

### Pagination

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Common Filters

- `search`: Search by name or email
- `isActive`: Filter by active status (true/false)
- `startDate`: Filter by start date (ISO 8601 format)
- `endDate`: Filter by end date (ISO 8601 format)

### Examples

**Get active members with search:**

```
GET {{baseUrl}}/members?page=1&limit=10&search=john&isActive=true
```

**Get classes by trainer and date range:**

```
GET {{baseUrl}}/classes?trainerId={{trainerId}}&startDate=2024-01-01&endDate=2024-01-31
```

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "id": "uuid",
  "field1": "value1",
  "field2": "value2",
  ...
}
```

### Paginated Response

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

## Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists or conflict

## Tips

1. **Auto-save IDs**: The collection automatically saves resource IDs when you create them, making it easy to test related endpoints.

2. **Test Scripts**: Each create endpoint has a test script that saves the created resource ID to collection variables.

3. **Disabled Query Parameters**: Many requests have disabled query parameters that you can enable for filtering.

4. **Date Formats**: Use ISO 8601 format for dates (e.g., `2024-01-01` or `2024-01-01T08:00:00Z`).

5. **Testing Different Roles**: Create multiple users with different roles to test authorization:

   ```json
   // Admin user
   { "email": "admin@gym.com", "password": "Admin123!", "role": "ADMIN" }

   // Trainer user
   { "email": "trainer@gym.com", "password": "Trainer123!", "role": "TRAINER" }

   // Member user
   { "email": "member@gym.com", "password": "Member123!", "role": "MEMBER" }
   ```

## Troubleshooting

### 401 Unauthorized

- Make sure you've logged in and the access token is set
- Check if the token has expired (tokens expire after 24 hours by default)
- Re-login to get a fresh token

### 403 Forbidden

- Your user role doesn't have permission for this endpoint
- Login with a user that has the required role (check endpoint description)

### 404 Not Found

- The resource ID doesn't exist
- Make sure you've created the resource first
- Check that the variable (e.g., `{{memberId}}`) is set correctly

### 409 Conflict

- Email already exists (for user/member/trainer creation)
- Resource already exists or has a conflict
- Try using a different email or check existing resources

## Support

For issues or questions:

- Check the API documentation in the code
- Review the controller files for endpoint details
- Check the Swagger documentation at `http://localhost:3500/api` (if enabled)
