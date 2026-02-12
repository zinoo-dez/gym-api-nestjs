# Gym Management Monorepo

A full-stack gym management system built with NestJS (backend) and React (frontend), managed as a pnpm workspace monorepo.

## Overview

This monorepo contains two main packages:

- **Backend** (`backend`): NestJS REST API with PostgreSQL and Prisma ORM
- **Frontend** (`frontend`): React web application with Vite and TanStack Query

The monorepo structure enables efficient dependency management, simplified development workflows, and easier maintenance of the full-stack application.

## Features

### Backend

- JWT-based authentication with role-based access control
- Member, trainer, and class management
- Membership plans and workout tracking
- Attendance monitoring system
- Comprehensive API documentation (Swagger)

### Frontend

- Responsive web interface for all gym operations
- Real-time data synchronization with TanStack Query
- Modern UI with Tailwind CSS
- Client-side routing with React Router

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** 9.0.0 or higher
- **PostgreSQL** 14 or higher

### Installing pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm@9
```

## Getting Started

### 1. Installation

Install all dependencies for both packages:

```bash
pnpm install
```

This command will:

- Install shared dependencies at the root level
- Install package-specific dependencies in each workspace
- Create a unified `pnpm-lock.yaml` lockfile

### 2. Environment Configuration

#### Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gym_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3500
```

#### Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3500/api
```

### 3. Database Setup

Set up the database and seed initial data:

```bash
pnpm prisma:generate
cd backend
npx prisma migrate dev
npx prisma db seed
```

## Development

### Running Development Servers

#### Start Backend Only

```bash
pnpm dev:backend
```

The API will be available at `http://localhost:3500`

#### Start Frontend Only

```bash
pnpm dev:frontend
```

The web app will be available at `http://localhost:5173`

#### Start Both Servers Concurrently

```bash
pnpm dev
```

This runs both backend and frontend development servers in parallel.

### Other Development Commands

```bash
# Run linting across all packages
pnpm lint

# Generate Prisma client
pnpm prisma:generate

# Run backend-specific commands
pnpm --filter backend <command>

# Run frontend-specific commands
pnpm --filter frontend <command>
```

## Building for Production

### Build All Packages

```bash
pnpm build
```

### Build Individual Packages

```bash
# Build backend only
pnpm build:backend

# Build frontend only
pnpm build:frontend
```

Build outputs:

- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

### Running Production Build

#### Backend

```bash
cd backend
npm run start:prod
```

#### Frontend

```bash
cd frontend
npm run preview
```

## Project Structure

```
.
├── packages/
│   ├── backend/              # NestJS API
│   │   ├── src/              # Source code
│   │   ├── prisma/           # Database schema and migrations
│   │   ├── dist/             # Build output
│   │   └── package.json      # Backend dependencies
│   └── frontend/             # React app
│       ├── src/              # Source code
│       ├── dist/             # Build output
│       └── package.json      # Frontend dependencies
├── pnpm-workspace.yaml       # Workspace configuration
├── package.json              # Root workspace scripts
├── pnpm-lock.yaml           # Unified lockfile
└── README.md                # This file
```

## Adding New Packages to the Workspace

To add a new package to the monorepo:

1. Create a new directory under `packages/`:

```bash
mkdir packages/new-package
cd packages/new-package
```

2. Initialize the package:

```bash
pnpm init
```

3. The package will automatically be discovered by pnpm workspace (no need to update `pnpm-workspace.yaml` as it uses the `packages/*` glob pattern)

4. Install dependencies for the new package:

```bash
pnpm --filter new-package add <dependency>
```

5. Add convenience scripts to the root `package.json` if needed:

```json
{
  "scripts": {
    "dev:new-package": "pnpm --filter new-package dev"
  }
}
```

## Workspace Commands

### Running Commands in Specific Packages

```bash
# Run a command in the backend package
pnpm --filter backend <command>

# Run a command in the frontend package
pnpm --filter frontend <command>

# Examples:
pnpm --filter backend test
pnpm --filter frontend build
```

### Running Commands in All Packages

```bash
# Run a command in all packages sequentially
pnpm --recursive <command>

# Run a command in all packages in parallel
pnpm --parallel <command>

# Examples:
pnpm --recursive test
pnpm --parallel build
```

### Adding Dependencies

```bash
# Add a dependency to a specific package
pnpm --filter backend add express
pnpm --filter frontend add react-icons

# Add a dev dependency to a specific package
pnpm --filter backend add -D jest
pnpm --filter frontend add -D vitest

# Add a dependency to the root workspace
pnpm add -w <dependency>
```

## Troubleshooting

### Issue: "Cannot find module" errors after installation

**Solution**: Regenerate the Prisma client and reinstall dependencies:

```bash
pnpm prisma:generate
pnpm install
```

### Issue: Backend fails to start with database connection error

**Solution**: Verify your database is running and credentials in `backend/.env` are correct:

```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Test connection with your credentials
psql -U your_user -d gym_db
```

### Issue: Frontend cannot connect to backend API

**Solution**: Ensure:

1. Backend is running on the correct port (check `backend/.env`)
2. Frontend `VITE_API_URL` matches the backend URL (check `frontend/.env`)
3. CORS is properly configured in the backend

### Issue: pnpm commands not working

**Solution**: Verify pnpm is installed and version is 9.0.0+:

```bash
pnpm --version

# If version is too old or pnpm is not installed:
npm install -g pnpm@9
```

### Issue: Port already in use

**Solution**: Change the port in the respective `.env` file or kill the process using the port:

```bash
# Find process using port 3500 (backend)
lsof -ti:3500 | xargs kill -9

# Find process using port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Issue: Stale dependencies or cache issues

**Solution**: Clean install everything:

```bash
# Remove all node_modules and lockfile
rm -rf node_modules packages/*/node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Issue: Prisma client out of sync

**Solution**: Regenerate the Prisma client:

```bash
pnpm prisma:generate

# Or from the backend directory:
cd backend
npx prisma generate
```

## API Documentation

Once the backend is running, access the interactive Swagger documentation at:

```
http://localhost:3500/api
```

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests (when implemented)
npm run test
```

## Default Login Credentials

After running the database seed, you can log in with these credentials (password: `Password123!`):

- **Admin**: `admin@gym.com`
- **Trainers**: `sarah.johnson@gym.com`, `mike.chen@gym.com`, `emma.davis@gym.com`
- **Members**: `john.doe@example.com`, `jane.smith@example.com`, etc.

## Additional Resources

- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [Migration Guide](MIGRATION.md) - Details about the monorepo migration

## License

MIT
