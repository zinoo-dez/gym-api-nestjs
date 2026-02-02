# Pricing API

## Overview

The Pricing API provides endpoints for managing pricing information for various gym services including memberships, classes, personal training, and facilities.

## Authorization

### Public Access (Read-Only)

- `GET /pricing` - List all pricing
- `GET /pricing/:id` - Get pricing details

### Admin/SuperAdmin Only (Full CRUD)

- `POST /pricing` - Create pricing
- `PATCH /pricing/:id` - Update pricing
- `DELETE /pricing/:id` - Delete pricing

## Pricing Categories

- `MEMBERSHIP` - Membership plans
- `CLASS` - Group class pricing
- `PERSONAL_TRAINING` - Personal training sessions
- `FACILITY` - Facility access (day passes, guest passes)
- `OTHER` - Other services

## API Endpoints

### Create Pricing

```http
POST /pricing
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Premium Membership",
  "description": "Full access to all facilities and classes",
  "category": "MEMBERSHIP",
  "price": 99.99,
  "currency": "USD",
  "duration": 30,
  "features": [
    "Unlimited gym access",
    "All group classes",
    "Personal training sessions"
  ],
  "isActive": true,
  "sortOrder": 1
}
```

### Get All Pricing

```http
GET /pricing?page=1&limit=10&category=MEMBERSHIP&isActive=true
```

Query Parameters:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status

### Get Pricing by ID

```http
GET /pricing/:id
```

### Update Pricing

```http
PATCH /pricing/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 89.99,
  "isActive": true
}
```

### Delete Pricing

```http
DELETE /pricing/:id
Authorization: Bearer <token>
```

## Response Format

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Premium Membership",
  "description": "Full access to all facilities and classes",
  "category": "MEMBERSHIP",
  "price": 99.99,
  "currency": "USD",
  "duration": 30,
  "features": [
    "Unlimited gym access",
    "All group classes",
    "Personal training sessions"
  ],
  "isActive": true,
  "sortOrder": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Seeded Data

The seed file creates 10 pricing entries:

### Memberships (3)

1. Basic Membership - $29.99/month
2. Pro Membership - $59.99/month
3. Elite Membership - $99.99/month

### Classes (2)

4. Drop-in Class - $15.00
5. Class Pack - 10 - $120.00

### Personal Training (3)

6. Single Session - $75.00
7. 5-Pack - $350.00
8. 10-Pack - $650.00

### Facility (2)

9. Day Pass - $20.00
10. Guest Pass - $10.00

## Database Schema

```prisma
model Pricing {
  id          String          @id @default(uuid())
  name        String
  description String?
  category    PricingCategory
  price       Decimal         @db.Decimal(10, 2)
  currency    String          @default("USD")
  duration    Int?
  features    String[]
  isActive    Boolean         @default(true)
  sortOrder   Int             @default(0)
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

enum PricingCategory {
  MEMBERSHIP
  CLASS
  PERSONAL_TRAINING
  FACILITY
  OTHER
}
```

## Notes

- Prices are stored as Decimal(10,2) for precision
- Duration is in days (for time-based pricing)
- Features are stored as an array of strings
- sortOrder is used for display ordering
- All GET endpoints are public (no authentication required)
- POST, PATCH, DELETE require Admin or SuperAdmin role
