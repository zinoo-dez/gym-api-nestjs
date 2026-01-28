# Database Seeder Guide

## Overview

This seeder creates a large-scale dataset for the Gym Management API with up to **500,000 records** across all tables.

## Configuration

The seeder is configured in `prisma/seed.ts` with the following default settings:

```typescript
const SEED_CONFIG = {
  TRAINERS: 100,
  MEMBERS: 100000,
  CLASSES: 10000,
  ATTENDANCE_RECORDS: 200000,
  WORKOUT_PLANS: 50000,
  CLASS_BOOKINGS: 100000,
  BATCH_SIZE: 1000,
};
```

### Total Records Generated

- **Users**: ~100,101 (1 admin + 100 trainers + 100,000 members)
- **Trainers**: 100
- **Members**: 100,000
- **Membership Plans**: 3 (Basic, Premium, VIP)
- **Memberships**: 100,000 (one per member)
- **Classes**: 10,000
- **Class Bookings**: 100,000
- **Attendance Records**: 200,000
- **Workout Plans**: 50,000
- **Exercises**: ~200,000 (3-8 exercises per workout plan)

**Total: ~460,000+ records**

## How to Run

### 1. Ensure Database is Running

Make sure your PostgreSQL database is running and the connection string is set in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/gym_db"
```

### 2. Run Migrations

```bash
npx prisma migrate dev
```

### 3. Run the Seeder

```bash
npx prisma db seed
```

Or using npm:

```bash
npm run prisma db seed
```

## Execution Time

Depending on your system and database performance:

- **Small dataset** (default config): 5-15 minutes
- **Large dataset** (500k records): 15-30 minutes

The seeder uses batch operations for optimal performance.

## Customizing the Seed Data

To adjust the amount of data generated, edit `prisma/seed.ts` and modify the `SEED_CONFIG` object:

```typescript
const SEED_CONFIG = {
  TRAINERS: 50, // Reduce trainers
  MEMBERS: 10000, // Reduce members
  CLASSES: 1000, // Reduce classes
  ATTENDANCE_RECORDS: 20000,
  WORKOUT_PLANS: 5000,
  CLASS_BOOKINGS: 10000,
  BATCH_SIZE: 1000, // Batch size for inserts
};
```

## Generated Data

### Admin User

- **Email**: `admin@gym.com`
- **Password**: `Password123!`
- **Role**: ADMIN

### Trainers

- **Count**: 100 (configurable)
- **Email Pattern**: `firstname.lastnameN@gym.com`
- **Password**: `Password123!`
- **Specializations**: Random from 10 categories (Yoga, Strength, Cardio, etc.)
- **Certifications**: Random professional certifications

### Members

- **Count**: 100,000 (configurable)
- **Email Pattern**: `firstname.lastnameN@gym.com`
- **Password**: `Password123!`
- **Phone**: Random US phone numbers
- **Date of Birth**: Random dates between 1960-2005

### Membership Plans

1. **Basic Monthly** - $49.99/month
2. **Premium Monthly** - $79.99/month
3. **VIP Monthly** - $149.99/month

### Memberships

- Each member gets one membership
- Random plan assignment
- Mix of ACTIVE, EXPIRED, and CANCELLED statuses
- Start dates within last 90 days

### Classes

- **Count**: 10,000 (configurable)
- **Types**: Yoga, Pilates, Strength, Cardio, HIIT, CrossFit, Boxing, Spinning, Zumba, Swimming, Bootcamp, Stretching, Core
- **Schedule**: Distributed over 90 days (past 30 days + next 60 days)
- **Duration**: 30, 45, 60, or 90 minutes
- **Capacity**: 10-30 participants

### Class Bookings

- **Count**: 100,000 (configurable)
- **Status**: Mix of CONFIRMED, ATTENDED, and CANCELLED
- Unique member-class combinations

### Attendance Records

- **Count**: 200,000 (configurable)
- **Types**: GYM_VISIT (70%) and CLASS_ATTENDANCE (30%)
- **Date Range**: Last 90 days
- **Duration**: 0.5 to 3.5 hours per visit
- 90% have check-out times

### Workout Plans

- **Count**: 50,000 (configurable)
- **Goals**: WEIGHT_LOSS, MUSCLE_GAIN, ENDURANCE, FLEXIBILITY
- **Exercises per Plan**: 3-8 exercises
- **Exercise Library**: 11 different exercises with realistic sets/reps

## Performance Optimization

The seeder uses several optimization techniques:

1. **Batch Inserts**: Data is inserted in batches of 1,000 records
2. **Parallel Processing**: Uses `Promise.all()` for concurrent operations
3. **Progress Tracking**: Shows real-time progress for each entity type
4. **Connection Pooling**: Uses pg connection pool for better performance

## Troubleshooting

### Out of Memory Error

If you encounter memory issues, reduce the batch size or total records:

```typescript
const SEED_CONFIG = {
  BATCH_SIZE: 500, // Reduce from 1000
  MEMBERS: 50000, // Reduce from 100000
  // ... other reductions
};
```

### Slow Performance

- Ensure your database has adequate resources
- Check database connection pool settings
- Consider running on a local database first
- Disable database logging during seeding

### Unique Constraint Violations

The seeder handles duplicates with:

- Unique email generation using indices
- `skipDuplicates: true` for class bookings
- Retry logic for booking conflicts

## Resetting the Database

To completely reset and reseed:

```bash
# Reset database
npx prisma migrate reset

# This will automatically run the seeder
```

Or manually:

```bash
# Drop and recreate
npx prisma db push --force-reset

# Run seeder
npx prisma db seed
```

## Login Credentials

After seeding, you can log in with:

- **Admin**: `admin@gym.com` / `Password123!`
- **Any Trainer**: `firstname.lastnameN@gym.com` / `Password123!`
- **Any Member**: `firstname.lastnameN@gym.com` / `Password123!`

## Notes

- All passwords are hashed using bcrypt
- Dates are realistic and distributed appropriately
- Data relationships are properly maintained
- Foreign key constraints are respected
- The seeder is idempotent (clears existing data first)
