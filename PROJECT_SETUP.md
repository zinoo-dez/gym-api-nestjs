# Gym API - Project Setup

## Overview

This is a premium quality gym management REST API built with NestJS, PostgreSQL, and Prisma ORM.

## Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: NestJS (v11+)
- **Database**: PostgreSQL (v14+)
- **ORM**: Prisma (v7+)
- **Authentication**: JWT (passport-jwt)
- **Validation**: class-validator, class-transformer
- **Documentation**: @nestjs/swagger
- **Security**: bcrypt, @nestjs/throttler
- **Testing**: Jest, fast-check (property-based testing)

## Installed Dependencies

### Core Dependencies

- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` - NestJS framework
- `@nestjs/jwt`, `@nestjs/passport` - Authentication
- `@nestjs/swagger` - API documentation
- `@nestjs/throttler` - Rate limiting
- `bcrypt` - Password hashing
- `class-validator`, `class-transformer` - DTO validation
- `prisma`, `@prisma/client` - Database ORM
- `passport`, `passport-jwt`, `passport-local` - Authentication strategies
- `fast-check` - Property-based testing library

### Dev Dependencies

- `@types/bcrypt`, `@types/passport-jwt`, `@types/passport-local` - TypeScript types
- `typescript` - TypeScript compiler (v5.7+)
- `jest`, `ts-jest` - Testing framework
- `eslint`, `prettier` - Code quality tools

## TypeScript Configuration

The project is configured with **strict mode** enabled:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictBindCallApply: true`
- `strictFunctionTypes: true`
- `strictPropertyInitialization: true`
- `noImplicitThis: true`
- `alwaysStrict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

## Project Structure

```
gym-api/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Request/response interceptors
│   │   └── pipes/           # Validation pipes
│   ├── modules/             # Feature modules
│   ├── app.module.ts        # Root module
│   └── main.ts              # Application entry point
├── test/                    # E2E tests
├── prisma/                  # Database schema (to be created)
└── dist/                    # Compiled output
```

## Available Scripts

- `npm run build` - Build the project
- `npm run start` - Start the application
- `npm run start:dev` - Start in watch mode
- `npm run start:prod` - Start production build
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage
- `npm run lint` - Lint and fix code
- `npm run format` - Format code with Prettier

## Next Steps

1. Initialize Prisma and configure database connection
2. Create database schema with Prisma
3. Implement authentication module
4. Implement feature modules (members, trainers, classes, etc.)
5. Add API documentation with Swagger
6. Implement security features (rate limiting, CORS, etc.)

## Development

To start development:

```bash
cd gym-api
npm run start:dev
```

The API will be available at `http://localhost:3000`
