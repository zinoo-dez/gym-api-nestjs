# Gym Management API

A comprehensive gym management REST API built with NestJS, PostgreSQL, and Prisma ORM.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, Trainer, Member)
- **Member Management**: Registration, profile management, membership assignments
- **Trainer Management**: Trainer profiles, specializations, class assignments
- **Class Management**: Class scheduling, booking system, capacity management
- **Membership Plans**: Flexible membership plans with different tiers and pricing
- **Workout Plans**: Personalized workout plans with exercise tracking
- **Attendance Tracking**: Check-in/check-out system with real-time monitoring
- **Security**: Input sanitization, rate limiting, helmet security headers
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Testing**: Comprehensive unit and e2e tests

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: NestJS (v11+)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator, class-transformer
- **Security**: bcrypt, helmet, throttling
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd gym-api-nestjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Set up the database
npx prisma migrate dev
npx prisma db seed
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3500`

## API Documentation

Once the application is running, visit `http://localhost:3500/api` to access the interactive Swagger documentation.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Database Seeding

The project includes a comprehensive seeder that creates sample data:

```bash
npx prisma db seed
```

Default login credentials (password: `Password123!`):
- Admin: `admin@gym.com`
- Trainers: `sarah.johnson@gym.com`, `mike.chen@gym.com`, `emma.davis@gym.com`
- Members: `john.doe@example.com`, `jane.smith@example.com`, etc.

## API Testing

Import the `Gym-API.postman_collection.json` file into Postman for easy API testing. The collection includes all endpoints organized by feature with example requests.

## Project Structure

```
src/
├── auth/           # Authentication & authorization
├── members/        # Member management
├── trainers/       # Trainer management
├── classes/        # Class scheduling & booking
├── memberships/    # Membership plans & assignments
├── workout-plans/  # Workout plan management
├── attendance/     # Attendance tracking
├── common/         # Shared utilities, DTOs, middleware
└── prisma/         # Database service
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gym_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# App
PORT=3500
NODE_ENV=development
```

## License

This project is [MIT licensed](LICENSE).
